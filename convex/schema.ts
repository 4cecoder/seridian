import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    name: v.string(),
    company: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
  }).index("by_status", ["status"]),

  contracts: defineTable({
    name: v.string(),
    clientId: v.id("clients"),
    value: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
    ),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_clientId", ["clientId"]),

  issues: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("in_review"),
      v.literal("done"),
    ),
    priority: v.union(
      v.literal("urgent"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("none"),
    ),
    clientId: v.optional(v.id("clients")),
    labels: v.array(v.string()),
    linearId: v.optional(v.string()),
    identifier: v.optional(v.string()),
    assignee: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    order: v.number(),
    linearCreatedAt: v.optional(v.string()),
    linearUpdatedAt: v.optional(v.string()),
    lastSyncedAt: v.optional(v.number()),
  })
    .index("by_linearId", ["linearId"])
    .index("by_status", ["status"])
    .index("by_clientId", ["clientId"])
    .index("by_status_and_clientId", ["status", "clientId"]),

  syncMeta: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
