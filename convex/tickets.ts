import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new ticket
export const createTicket = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ticketId = await ctx.db.insert("tickets", {
      cardId: args.cardId,
      title: args.title,
      storyPoints: args.storyPoints,
      estimatedDays: args.estimatedDays,
      status: args.status,
      sprintWeek: args.sprintWeek,
      sprintID: args.sprintID,
      userID: args.userID,
      completedAt: args.status === "done" ? now : undefined,
    });
    return ticketId;
  },
});

// Get all tickets
export const getAllTickets = query({
  handler: async (ctx) => {
    return await ctx.db.query("tickets").collect();
  },
});

// Get ticket by ID
export const getTicketById = query({
  args: { id: v.id("tickets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get tickets by sprint
export const getTicketsBySprint = query({
  args: { sprintID: v.id("sprints") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_sprint", (q) => q.eq("sprintID", args.sprintID))
      .collect();
  },
});

// Get tickets by user
export const getTicketsByUser = query({
  args: { userID: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userID", args.userID))
      .collect();
  },
});

// Get tickets by status
export const getTicketsByStatus = query({
  args: {
    status: v.union(
      v.literal("todo"),
      v.literal("inProgress"),
      v.literal("done"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get tickets by sprint and status (useful for kanban boards)
export const getTicketsBySprintAndStatus = query({
  args: {
    sprintID: v.id("sprints"),
    status: v.union(
      v.literal("todo"),
      v.literal("inProgress"),
      v.literal("done"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_sprint", (q) => q.eq("sprintID", args.sprintID))
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
  },
});

// Update ticket
export const updateTicket = mutation({
  args: {
    id: v.id("tickets"),
    cardId: v.optional(v.string()),
    title: v.optional(v.string()),
    storyPoints: v.optional(v.number()),
    estimatedDays: v.optional(v.number()),
    status: v.optional(
      v.union(v.literal("todo"), v.literal("inProgress"), v.literal("done")),
    ),
    sprintWeek: v.optional(v.number()),
    sprintID: v.optional(v.id("sprints")),
    userID: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Remove undefined values
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined),
    );

    // If status is changing to "done", set completedAt timestamp
    if (updates.status === "done") {
      cleanedUpdates.completedAt = Date.now();
    }
    // If status is changing from "done" to something else, clear completedAt
    else if (updates.status === "todo" || updates.status === "inProgress") {
      // Get current ticket to check if it was previously done
      const currentTicket = await ctx.db.get(id);
      if (currentTicket?.completedAt) {
        await ctx.db.patch(id, { ...cleanedUpdates, completedAt: undefined });
        return id;
      }
    }

    await ctx.db.patch(id, cleanedUpdates);
    return id;
  },
});

// Update ticket status (commonly used)
export const updateTicketStatus = mutation({
  args: {
    id: v.id("tickets"),
    status: v.union(
      v.literal("todo"),
      v.literal("inProgress"),
      v.literal("done"),
    ),
  },
  handler: async (ctx, args) => {
    const updates: any = { status: args.status };

    // Set completedAt when marking as done
    if (args.status === "done") {
      updates.completedAt = Date.now();
    }
    // Clear completedAt when moving away from done
    else {
      const currentTicket = await ctx.db.get(args.id);
      if (currentTicket?.completedAt) {
        updates.completedAt = undefined;
      }
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Assign ticket to user
export const assignTicketToUser = mutation({
  args: {
    id: v.id("tickets"),
    userID: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { userID: args.userID });
    return args.id;
  },
});

// Move ticket to sprint
export const moveTicketToSprint = mutation({
  args: {
    id: v.id("tickets"),
    sprintID: v.id("sprints"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { sprintID: args.sprintID });
    return args.id;
  },
});

// Delete ticket
export const deleteTicket = mutation({
  args: { id: v.id("tickets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get sprint summary (total story points, tickets by status)
export const getSprintSummary = query({
  args: { sprintID: v.id("sprints") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_sprint", (q) => q.eq("sprintID", args.sprintID))
      .collect();

    const summary = {
      totalTickets: tickets.length,
      totalStoryPoints: tickets.reduce(
        (sum, ticket) => sum + ticket.storyPoints,
        0,
      ),
      totalEstimatedDays: tickets.reduce(
        (sum, ticket) => sum + ticket.estimatedDays,
        0,
      ),
      todoCount: tickets.filter((t) => t.status === "todo").length,
      inProgressCount: tickets.filter((t) => t.status === "inProgress").length,
      doneCount: tickets.filter((t) => t.status === "done").length,
      completionPercentage:
        tickets.length > 0
          ? Math.round(
              (tickets.filter((t) => t.status === "done").length /
                tickets.length) *
                100,
            )
          : 0,
    };

    return summary;
  },
});
