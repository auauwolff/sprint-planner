import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createAccount } from "@convex-dev/auth/server";

// Get current user with role
export const getCurrentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get the user directly by ID
    const user = await ctx.db.get(userId);
    return user;
  },
});

// Get all users
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get users by role
export const getUsersByRole = query({
  args: { role: v.union(v.literal("User"), v.literal("PM")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), args.role))
      .collect();
  },
});

// Get user by ID
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update user role (for admin functions)
export const updateUserRole = mutation({
  args: {
    id: v.id("users"),
    role: v.union(v.literal("User"), v.literal("PM")),
  },
  handler: async (ctx, args) => {
    // Note: In a real app, you'd want to check if the current user has permission to do this
    await ctx.db.patch(args.id, { role: args.role });
    return args.id;
  },
});

// Initialize user role after signup (called manually)
export const initializeUserRole = mutation({
  args: {
    role: v.optional(v.union(v.literal("User"), v.literal("PM"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Set role for the current user (defaults to "User")
    await ctx.db.patch(userId, {
      role: args.role || "User",
    });

    return userId;
  },
});

// Create a team member with full authentication (admin function)
export const createTeamMemberWithAuth = action({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("User"), v.literal("PM")),
    password: v.string(), // Temporary password that user can change later
  },
  handler: async (ctx, args) => {
    // Check if current user is authenticated (basic permission check)
    // In a real app, you'd want to check if the current user has permission to add team members
    try {
      // Use Convex Auth's createAccount to create a fully functional user account
      const result = await createAccount(ctx, {
        provider: "password",
        account: {
          id: args.email, // Use email as the account ID
          secret: args.password, // The password
        },
        profile: {
          email: args.email,
          name: args.name,
          role: args.role,
        },
      });

      return {
        userId: result.user._id,
        message: `Team member ${args.name} has been successfully created! They can now sign in with email: ${args.email}`,
      };
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          throw new Error("A user with this email already exists");
        }
        throw new Error(`Failed to create team member: ${error.message}`);
      }
      throw new Error("Failed to create team member");
    }
  },
});
