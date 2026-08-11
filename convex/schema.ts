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

  bookings: defineTable({
    title: v.string(),
    clientId: v.id("clients"),
    startTime: v.string(),
    endTime: v.string(),
    type: v.union(
      v.literal("consultation"),
      v.literal("development"),
      v.literal("review"),
    ),
    notes: v.optional(v.string()),
    location: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
  })
    .index("by_startTime", ["startTime"])
    .index("by_clientId", ["clientId"]),

  syncMeta: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  caseStudies: defineTable({
    title: v.string(),
    clientId: v.optional(v.id("clients")),
    summary: v.string(),
    challenge: v.string(),
    solution: v.string(),
    results: v.string(),
    technologies: v.array(v.string()),
    industry: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    published: v.boolean(),
    order: v.number(),
  })
    .index("by_published", ["published"])
    .index("by_order", ["order"]),

  deals: defineTable({
    name: v.string(),
    clientId: v.id("clients"),
    value: v.number(),
    stage: v.union(
      v.literal("lead"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("closed_won"),
      v.literal("closed_lost"),
    ),
    probability: v.number(),
    expectedCloseDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
  })
    .index("by_stage", ["stage"])
    .index("by_clientId", ["clientId"])
    .index("by_stage_and_clientId", ["stage", "clientId"]),

  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("public"), v.literal("private"), v.literal("direct")),
    createdBy: v.string(),
    participants: v.array(v.string()),
    lastMessageAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_createdBy", ["createdBy"]),

  messages: defineTable({
    channelId: v.id("channels"),
    senderId: v.string(),
    senderName: v.string(),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("system"), v.literal("command")),
    replyTo: v.optional(v.id("messages")),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_channelId_and_createdAt", ["channelId", "createdAt"])
    .index("by_senderId", ["senderId"]),

  users: defineTable({
    pubkey: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
    lastSeen: v.number(),
    deviceType: v.optional(
      v.union(v.literal("web"), v.literal("android"), v.literal("ios")),
    ),
  })
    .index("by_pubkey", ["pubkey"])
    .index("by_status", ["status"]),
});
