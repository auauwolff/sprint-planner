import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new sprint
export const createSprint = mutation({
  args: {
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("done"), v.literal("upcoming")),
    start: v.number(), // Unix timestamp
    end: v.number(),   // Unix timestamp
    sprintWeek: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sprintId = await ctx.db.insert("sprints", {
      name: args.name,
      status: args.status,
      start: args.start,
      end: args.end,
      sprintWeek: args.sprintWeek,
    });
    return sprintId;
  },
});

// Get all sprints
export const getAllSprints = query({
  handler: async (ctx) => {
    return await ctx.db.query("sprints").collect();
  },
});

// Get sprint by ID
export const getSprintById = query({
  args: { id: v.id("sprints") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get sprints by status
export const getSprintsByStatus = query({
  args: { status: v.union(v.literal("active"), v.literal("done"), v.literal("upcoming")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sprints")
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
  },
});

// Update sprint
export const updateSprint = mutation({
  args: {
    id: v.id("sprints"),
    name: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("done"), v.literal("upcoming"))),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
    sprintWeek: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Remove undefined values
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(id, cleanedUpdates);
    return id;
  },
});

// Delete sprint
export const deleteSprint = mutation({
  args: { id: v.id("sprints") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get active sprint
export const getActiveSprint = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("sprints")
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});
