import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const upsert = mutation({
  args: {
    pubkey: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
    deviceType: v.optional(v.union(v.literal("web"), v.literal("android"), v.literal("ios"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_pubkey", (q) => q.eq("pubkey", args.pubkey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        avatar: args.avatar,
        status: args.status,
        lastSeen: Date.now(),
        deviceType: args.deviceType,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      pubkey: args.pubkey,
      name: args.name,
      avatar: args.avatar,
      status: args.status,
      lastSeen: Date.now(),
      deviceType: args.deviceType,
    });
  },
});

export const get = query({
  args: { pubkey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_pubkey", (q) => q.eq("pubkey", args.pubkey))
      .first();
  },
});
