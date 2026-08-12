import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Detect causal keywords in text
 */
function detectCausalRelationships(text: string): boolean {
  const causalPatterns = [
    /because/i,
    /caused/i,
    /led to/i,
    /resulted in/i,
    /due to/i,
    /as a result/i,
    /consequently/i,
    /therefore/i,
    /since.*because/i,
    /when.*then/i,
  ];
  return causalPatterns.some((p) => p.test(text));
}

/**
 * Check if two memories are temporally close (within N days)
 */
function areTemporallyClose(a: number, b: number, daysThreshold: number = 7): boolean {
  const diffMs = Math.abs(a - b);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= daysThreshold;
}

export const getConsolidationCandidates = query({
  args: {
    bankId: v.id("memoryBanks"),
    threshold: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.threshold ?? 0.35;
    const limit = args.limit ?? 50;

    const memories = await ctx.db
      .query("memories")
      .withIndex("by_bank", (q) => q.eq("bankId", args.bankId))
      .order("desc")
      .take(500);

    const unconsolidated = memories.filter((m) => !m.consolidatedAt);
    const tokenCache = new Map<string, string[]>();
    const pairs: {
      a: (typeof memories)[0];
      b: (typeof memories)[0];
      similarity: number;
      connectionType: "semantic" | "temporal" | "causal";
    }[] = [];

    for (const m of unconsolidated) {
      tokenCache.set(m._id, tokenize(m.content));
    }

    for (let i = 0; i < unconsolidated.length; i++) {
      for (let j = i + 1; j < unconsolidated.length; j++) {
        const a = unconsolidated[i];
        const b = unconsolidated[j];
        const tokensA = tokenCache.get(a._id) ?? [];
        const tokensB = tokenCache.get(b._id) ?? [];
        const sim = jaccardSimilarity(tokensA, tokensB);

        if (sim >= threshold) {
          pairs.push({ a, b, similarity: sim, connectionType: "semantic" });
        }

        // Check temporal proximity
        if (areTemporallyClose(a.createdAt, b.createdAt, 1)) {
          pairs.push({ a, b, similarity: 0.5, connectionType: "temporal" });
        }

        // Check causal relationships
        if (
          detectCausalRelationships(a.content) ||
          detectCausalRelationships(b.content)
        ) {
          pairs.push({ a, b, similarity: 0.6, connectionType: "causal" });
        }
      }
    }

    pairs.sort((x, y) => y.similarity - x.similarity);

    // Deduplicate pairs
    const seen = new Set<string>();
    const uniquePairs = pairs.filter((p) => {
      const key = [p.a._id, p.b._id].sort().join("-");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniquePairs.slice(0, limit).map((p) => ({
      memoryA: p.a,
      memoryB: p.b,
      similarity: p.similarity,
      connectionType: p.connectionType,
    }));
  },
});

export const mergeMemories = mutation({
  args: {
    memoryIdA: v.id("memories"),
    memoryIdB: v.id("memories"),
    agentId: v.string(),
    connectionType: v.optional(
      v.union(
        v.literal("semantic"),
        v.literal("temporal"),
        v.literal("causal"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const a = await ctx.db.get(args.memoryIdA);
    const b = await ctx.db.get(args.memoryIdB);

    if (!a || !b) throw new Error("One or both memories not found");
    if (a.bankId !== b.bankId) throw new Error("Memories must be in the same bank");

    const now = Date.now();
    const tokensA = tokenize(a.content);
    const tokensB = tokenize(b.content);
    const mergedTokens = [...new Set([...tokensA, ...tokensB])];
    const mergedContent = mergedTokens.join(" ");

    // Rich evidence tracking
    const combinedEvidence = [
      ...a.evidence,
      {
        memoryId: a._id.toString(),
        quote: a.content.slice(0, 300),
      },
      {
        memoryId: b._id.toString(),
        quote: b.content.slice(0, 300),
      },
    ];

    const mergedTags = [...new Set([...a.tags, ...b.tags])];
    const mergedRelations = [...new Set([...a.relations, ...b.relations, a._id.toString(), b._id.toString()])];

    // Create merged observation
    const mergedId = await ctx.db.insert("memories", {
      bankId: a.bankId,
      type: "observation",
      content: mergedContent,
      evidence: combinedEvidence,
      proofCount: a.proofCount + b.proofCount + 1,
      embedding: [],
      tags: mergedTags,
      relations: mergedRelations,
      createdAt: Math.min(a.createdAt, b.createdAt),
      updatedAt: now,
      consolidatedAt: now,
    });

    // Mark originals as consolidated
    await ctx.db.patch(args.memoryIdA, { consolidatedAt: now });
    await ctx.db.patch(args.memoryIdB, { consolidatedAt: now });

    // Create knowledge graph connections
    const connectionType = args.connectionType ?? "semantic";

    // Create connection between merged memory and originals
    await ctx.db.insert("memoryConnections", {
      bankId: a.bankId,
      sourceMemoryId: mergedId,
      targetMemoryId: args.memoryIdA,
      connectionType: "semantic",
      strength: 0.9,
      createdAt: now,
    });

    await ctx.db.insert("memoryConnections", {
      bankId: a.bankId,
      sourceMemoryId: mergedId,
      targetMemoryId: args.memoryIdB,
      connectionType: "semantic",
      strength: 0.9,
      createdAt: now,
    });

    // If causal, create causal connection
    if (connectionType === "causal") {
      await ctx.db.insert("memoryConnections", {
        bankId: a.bankId,
        sourceMemoryId: args.memoryIdA,
        targetMemoryId: args.memoryIdB,
        connectionType: "causal",
        strength: 0.8,
        createdAt: now,
      });
    }

    // Log activity
    await ctx.db.insert("agentActivity", {
      bankId: a.bankId,
      agentId: args.agentId,
      action: "consolidate",
      details: JSON.stringify({
        memoryA: args.memoryIdA,
        memoryB: args.memoryIdB,
        mergedInto: mergedId,
        connectionType,
        originalContentA: a.content.slice(0, 150),
        originalContentB: b.content.slice(0, 150),
        mergedContent: mergedContent.slice(0, 300),
        evidenceCount: combinedEvidence.length,
      }),
      timestamp: now,
    });

    await ctx.db.patch(a.bankId, { updatedAt: now });

    return mergedId;
  },
});

export const consolidate = mutation({
  args: {
    bankId: v.id("memoryBanks"),
    agentId: v.string(),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.threshold ?? 0.35;
    const now = Date.now();

    // Get all memories (not just world_facts)
    const allMemories = await ctx.db
      .query("memories")
      .withIndex("by_bank", (q) => q.eq("bankId", args.bankId))
      .order("desc")
      .take(500);

    const unconsolidated = allMemories.filter((m) => !m.consolidatedAt);
    const tokenCache = new Map<string, string[]>();
    const consumed = new Set<string>();
    let consolidatedCount = 0;

    for (const m of unconsolidated) {
      tokenCache.set(m._id, tokenize(m.content));
    }

    for (let i = 0; i < unconsolidated.length; i++) {
      const a = unconsolidated[i];
      if (consumed.has(a._id)) continue;

      const tokensA = tokenCache.get(a._id) ?? [];
      let bestMatch: (typeof unconsolidated)[0] | null = null;
      let bestSimilarity = 0;
      let bestConnectionType: "semantic" | "temporal" | "causal" = "semantic";

      for (let j = i + 1; j < unconsolidated.length; j++) {
        const b = unconsolidated[j];
        if (consumed.has(b._id)) continue;

        const tokensB = tokenCache.get(b._id) ?? [];
        const sim = jaccardSimilarity(tokensA, tokensB);

        if (sim >= threshold && sim > bestSimilarity) {
          bestSimilarity = sim;
          bestMatch = b;
          bestConnectionType = "semantic";
        }

        // Temporal proximity
        if (areTemporallyClose(a.createdAt, b.createdAt, 1) && !bestMatch) {
          bestMatch = b;
          bestSimilarity = 0.5;
          bestConnectionType = "temporal";
        }

        // Causal relationship
        if (
          (detectCausalRelationships(a.content) || detectCausalRelationships(b.content)) &&
          !bestMatch
        ) {
          bestMatch = b;
          bestSimilarity = 0.6;
          bestConnectionType = "causal";
        }
      }

      if (bestMatch) {
        const tokensB = tokenCache.get(bestMatch._id) ?? [];
        const mergedTokens = [...new Set([...tokensA, ...tokensB])];
        const mergedContent = mergedTokens.join(" ");

        const combinedEvidence = [
          ...a.evidence,
          {
            memoryId: a._id.toString(),
            quote: a.content.slice(0, 300),
          },
          {
            memoryId: bestMatch._id.toString(),
            quote: bestMatch.content.slice(0, 300),
          },
        ];

        const mergedTags = [...new Set([...a.tags, ...bestMatch.tags])];
        const mergedRelations = [
          ...new Set([...a.relations, ...bestMatch.relations, a._id.toString(), bestMatch._id.toString()]),
        ];

        const mergedId = await ctx.db.insert("memories", {
          bankId: args.bankId,
          type: "observation",
          content: mergedContent,
          evidence: combinedEvidence,
          proofCount: a.proofCount + bestMatch.proofCount + 1,
          embedding: [],
          tags: mergedTags,
          relations: mergedRelations,
          createdAt: Math.min(a.createdAt, bestMatch.createdAt),
          updatedAt: now,
          consolidatedAt: now,
        });

        await ctx.db.patch(a._id, { consolidatedAt: now });
        await ctx.db.patch(bestMatch._id, { consolidatedAt: now });

        // Create knowledge graph connections
        await ctx.db.insert("memoryConnections", {
          bankId: args.bankId,
          sourceMemoryId: mergedId,
          targetMemoryId: a._id,
          connectionType: "semantic",
          strength: 0.9,
          createdAt: now,
        });

        await ctx.db.insert("memoryConnections", {
          bankId: args.bankId,
          sourceMemoryId: mergedId,
          targetMemoryId: bestMatch._id,
          connectionType: "semantic",
          strength: 0.9,
          createdAt: now,
        });

        consumed.add(a._id);
        consumed.add(bestMatch._id);
        consolidatedCount++;
      }
    }

    await ctx.db.insert("agentActivity", {
      bankId: args.bankId,
      agentId: args.agentId,
      action: "consolidate",
      details: JSON.stringify({
        totalMemoriesScanned: allMemories.length,
        unconsolidatedScanned: unconsolidated.length,
        pairsConsolidated: consolidatedCount,
        threshold,
      }),
      timestamp: now,
    });

    await ctx.db.patch(args.bankId, { updatedAt: now });

    return {
      totalMemoriesScanned: allMemories.length,
      unconsolidatedScanned: unconsolidated.length,
      pairsConsolidated: consolidatedCount,
    };
  },
});

export const getConsolidationStats = query({
  args: { bankId: v.id("memoryBanks") },
  handler: async (ctx, args) => {
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_bank", (q) => q.eq("bankId", args.bankId))
      .take(1000);

    const connections = await ctx.db
      .query("memoryConnections")
      .withIndex("by_bank", (q) => q.eq("bankId", args.bankId))
      .take(1000);

    return {
      totalMemories: memories.length,
      consolidated: memories.filter((m) => m.consolidatedAt).length,
      unconsolidated: memories.filter((m) => !m.consolidatedAt).length,
      observations: memories.filter((m) => m.type === "observation").length,
      totalConnections: connections.length,
      semanticConnections: connections.filter((c) => c.connectionType === "semantic").length,
      temporalConnections: connections.filter((c) => c.connectionType === "temporal").length,
      causalConnections: connections.filter((c) => c.connectionType === "causal").length,
    };
  },
});
