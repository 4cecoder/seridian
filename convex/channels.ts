import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("channels").take(500);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("public"), v.literal("private"), v.literal("direct")),
    createdBy: v.string(),
    participants: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      description: args.description,
      type: args.type,
      createdBy: args.createdBy,
      participants: args.participants,
      createdAt: Date.now(),
    });
    return channelId;
  },
});

export const get = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.channelId);
  },
});
