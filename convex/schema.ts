import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  // Override users table to add role
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Add our custom role field (optional for existing users)
    role: v.optional(v.union(v.literal("User"), v.literal("PM"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // Sprint table
  sprints: defineTable({
    name: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("done"),
      v.literal("upcoming"),
    ),
    start: v.number(), // Unix timestamp
    end: v.number(), // Unix timestamp
    sprintWeek: v.optional(v.number()), // Week number
  }),

  // Tickets table
  tickets: defineTable({
    cardId: v.string(),
    title: v.string(),
    storyPoints: v.number(),
    estimatedDays: v.number(),
    status: v.union(
      v.literal("todo"),
      v.literal("inProgress"),
      v.literal("done"),
    ),
    sprintWeek: v.number(),
    sprintID: v.id("sprints"),
    userID: v.id("users"),
  })
    .index("by_sprint", ["sprintID"])
    .index("by_user", ["userID"])
    .index("by_status", ["status"]),
});
