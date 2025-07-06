import { query } from "./_generated/server";
import { v } from "convex/values";

// Get sprint completion analytics
export const getSprintAnalytics = query({
  args: { sprintID: v.id("sprints") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_sprint", (q) => q.eq("sprintID", args.sprintID))
      .collect();

    // Group tickets by week and status
    const weeklyBreakdown = tickets.reduce(
      (acc, ticket) => {
        const week = ticket.sprintWeek;
        if (!acc[week]) {
          acc[week] = {
            week,
            total: 0,
            todo: 0,
            inProgress: 0,
            done: 0,
            totalStoryPoints: 0,
            doneStoryPoints: 0,
            totalEstimatedDays: 0,
            doneEstimatedDays: 0,
          };
        }

        acc[week].total++;
        acc[week][ticket.status]++;
        acc[week].totalStoryPoints += ticket.storyPoints;
        acc[week].totalEstimatedDays += ticket.estimatedDays;

        if (ticket.status === "done") {
          acc[week].doneStoryPoints += ticket.storyPoints;
          acc[week].doneEstimatedDays += ticket.estimatedDays;
        }

        return acc;
      },
      {} as Record<number, any>,
    );

    // Convert to array and sort by week
    const weeklyData = Object.values(weeklyBreakdown).sort(
      (a: any, b: any) => a.week - b.week,
    );

    // Calculate overall metrics
    const totalTickets = tickets.length;
    const doneTickets = tickets.filter((t) => t.status === "done").length;
    const totalStoryPoints = tickets.reduce((sum, t) => sum + t.storyPoints, 0);
    const doneStoryPoints = tickets
      .filter((t) => t.status === "done")
      .reduce((sum, t) => sum + t.storyPoints, 0);

    // Sprint health indicators
    const sprintHealth = {
      completionRate:
        totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0,
      velocityByWeek: weeklyData.map((week: any) => ({
        week: week.week,
        completedStoryPoints: week.doneStoryPoints,
        completedTickets: week.done,
        completionRate:
          week.total > 0 ? Math.round((week.done / week.total) * 100) : 0,
      })),
      // Detect if work is being pushed to later weeks
      workDistribution: weeklyData.map((week: any) => ({
        week: week.week,
        planned: week.total,
        completed: week.done,
        remaining: week.total - week.done,
      })),
    };

    return {
      overview: {
        totalTickets,
        doneTickets,
        totalStoryPoints,
        doneStoryPoints,
        completionRate: sprintHealth.completionRate,
      },
      weeklyBreakdown: weeklyData,
      sprintHealth,
    };
  },
});

// Get velocity trends across multiple sprints
export const getVelocityTrends = query({
  handler: async (ctx) => {
    const sprints = await ctx.db.query("sprints").collect();

    const sprintVelocities = await Promise.all(
      sprints.map(async (sprint) => {
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_sprint", (q) => q.eq("sprintID", sprint._id))
          .collect();

        const doneTickets = tickets.filter((t) => t.status === "done");
        const plannedStoryPoints = tickets.reduce(
          (sum, t) => sum + t.storyPoints,
          0,
        );
        const completedStoryPoints = doneTickets.reduce(
          (sum, t) => sum + t.storyPoints,
          0,
        );

        return {
          sprintName: sprint.name,
          sprintStatus: sprint.status,
          startDate: sprint.start,
          endDate: sprint.end,
          totalWeeks: sprint.sprintWeek || 1,
          plannedStoryPoints,
          completedStoryPoints,
          plannedTickets: tickets.length,
          completedTickets: doneTickets.length,
          completionRate:
            tickets.length > 0
              ? Math.round((doneTickets.length / tickets.length) * 100)
              : 0,
          velocity: completedStoryPoints, // Story points completed
        };
      }),
    );

    // Sort by start date
    sprintVelocities.sort((a, b) => a.startDate - b.startDate);

    return sprintVelocities;
  },
});

// Get weekly completion patterns (which weeks typically get most work done)
export const getWeeklyCompletionPatterns = query({
  handler: async (ctx) => {
    const tickets = await ctx.db.query("tickets").collect();

    // Group by week number across all sprints
    const weekPatterns = tickets.reduce(
      (acc, ticket) => {
        const week = ticket.sprintWeek;
        if (!acc[week]) {
          acc[week] = {
            week,
            totalCards: 0,
            completedCards: 0,
            totalStoryPoints: 0,
            completedStoryPoints: 0,
          };
        }

        acc[week].totalCards++;
        acc[week].totalStoryPoints += ticket.storyPoints;

        if (ticket.status === "done") {
          acc[week].completedCards++;
          acc[week].completedStoryPoints += ticket.storyPoints;
        }

        return acc;
      },
      {} as Record<number, any>,
    );

    // Convert to array and calculate completion rates
    const patterns = Object.values(weekPatterns)
      .map((pattern: any) => ({
        ...pattern,
        completionRate:
          pattern.totalCards > 0
            ? Math.round((pattern.completedCards / pattern.totalCards) * 100)
            : 0,
      }))
      .sort((a: any, b: any) => a.week - b.week);

    return patterns;
  },
});

// Get ticket creation and completion timing analytics
export const getTicketTimingAnalytics = query({
  args: { sprintID: v.id("sprints") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_sprint", (q) => q.eq("sprintID", args.sprintID))
      .collect();

    // Analyze creation and completion patterns
    const timingData = tickets.map((ticket) => ({
      ticketId: ticket._id,
      cardId: ticket.cardId,
      sprintWeek: ticket.sprintWeek,
      status: ticket.status,
      storyPoints: ticket.storyPoints,
      createdAt: ticket._creationTime, // Using built-in _creationTime
      completedAt: ticket.completedAt,
      // Calculate lead time if completed
      leadTimeHours: ticket.completedAt
        ? Math.round(
            (ticket.completedAt - ticket._creationTime) / (1000 * 60 * 60),
          )
        : null,
    }));

    // Group by completion status for insights
    const completedTickets = timingData.filter((t) => t.status === "done");
    const averageLeadTime =
      completedTickets.length > 0
        ? completedTickets.reduce((sum, t) => sum + (t.leadTimeHours || 0), 0) /
          completedTickets.length
        : 0;

    return {
      ticketTimings: timingData,
      insights: {
        totalTickets: tickets.length,
        completedTickets: completedTickets.length,
        averageLeadTimeHours: Math.round(averageLeadTime),
        fastestCompletion:
          completedTickets.length > 0
            ? Math.min(
                ...completedTickets.map((t) => t.leadTimeHours || Infinity),
              )
            : null,
        slowestCompletion:
          completedTickets.length > 0
            ? Math.max(...completedTickets.map((t) => t.leadTimeHours || 0))
            : null,
      },
    };
  },
});
