import {
  Box,
  Card,
  Typography,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Speed,
  Timeline,
  ShowChart,
} from "@mui/icons-material";
import ReactECharts from "echarts-for-react";

interface SprintAnalyticsProps {
  sprintId: Id<"sprints">;
}

export const SprintAnalytics = ({ sprintId }: SprintAnalyticsProps) => {
  const analytics = useQuery(api.analytics.getSprintAnalytics, {
    sprintID: sprintId,
  });
  const velocityTrends = useQuery(api.analytics.getVelocityTrends);
  const weeklyPatterns = useQuery(api.analytics.getWeeklyCompletionPatterns);
  const timingAnalytics = useQuery(api.analytics.getTicketTimingAnalytics, {
    sprintID: sprintId,
  });

  if (!analytics || !velocityTrends || !weeklyPatterns || !timingAnalytics) {
    return <Typography>Loading analytics...</Typography>;
  }

  const { overview, weeklyBreakdown, sprintHealth } = analytics;

  return (
    <Box sx={{ p: 3 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Assignment color="primary" />
              <Typography variant="h6">Total Cards</Typography>
            </Box>
            <Typography variant="h4">{overview.totalTickets}</Typography>
            <Typography variant="body2" color="text.secondary">
              {overview.doneTickets} completed
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CheckCircle color="success" />
              <Typography variant="h6">Completion</Typography>
            </Box>
            <Typography variant="h4">{overview.completionRate}%</Typography>
            <LinearProgress
              variant="determinate"
              value={overview.completionRate}
              sx={{ mt: 1 }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Speed color="warning" />
              <Typography variant="h6">Velocity</Typography>
            </Box>
            <Typography variant="h4">{overview.doneStoryPoints}</Typography>
            <Typography variant="body2" color="text.secondary">
              of {overview.totalStoryPoints} story points
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Timeline color="info" />
              <Typography variant="h6">Progress</Typography>
            </Box>
            <Typography variant="h4">
              Week {Math.max(...weeklyBreakdown.map((w) => w.week))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current sprint week
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sprint Completion Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <ShowChart />
              Sprint Completion Overview
            </Typography>
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "item",
                  formatter: "{a} <br/>{b}: {c} ({d}%)",
                },
                legend: {
                  orient: "vertical",
                  left: "left",
                },
                series: [
                  {
                    name: "Sprint Status",
                    type: "pie",
                    radius: ["40%", "70%"],
                    center: ["60%", "50%"],
                    data: [
                      {
                        value: overview.doneTickets,
                        name: "Completed",
                        itemStyle: { color: "#4caf50" },
                      },
                      {
                        value: overview.totalTickets - overview.doneTickets,
                        name: "Remaining",
                        itemStyle: { color: "#ff9800" },
                      },
                    ],
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                      },
                    },
                  },
                ],
              }}
              style={{ height: "300px" }}
            />
          </Card>
        </Grid>

        {/* Weekly Velocity Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <TrendingUp />
              Weekly Velocity
            </Typography>
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "axis",
                  axisPointer: {
                    type: "shadow",
                  },
                },
                legend: {
                  data: ["Story Points Completed", "Cards Completed"],
                },
                xAxis: {
                  type: "category",
                  data: weeklyBreakdown.map((week) => `Week ${week.week}`),
                },
                yAxis: [
                  {
                    type: "value",
                    name: "Story Points",
                    position: "left",
                  },
                  {
                    type: "value",
                    name: "Cards",
                    position: "right",
                  },
                ],
                series: [
                  {
                    name: "Story Points Completed",
                    type: "bar",
                    yAxisIndex: 0,
                    data: weeklyBreakdown.map((week) => week.doneStoryPoints),
                    itemStyle: { color: "#2196f3" },
                  },
                  {
                    name: "Cards Completed",
                    type: "line",
                    yAxisIndex: 1,
                    data: weeklyBreakdown.map((week) => week.done),
                    itemStyle: { color: "#4caf50" },
                    lineStyle: { width: 3 },
                  },
                ],
              }}
              style={{ height: "300px" }}
            />
          </Card>
        </Grid>

        {/* Weekly Progress Breakdown Chart */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Assignment />
              Weekly Progress Breakdown
            </Typography>
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "axis",
                  axisPointer: {
                    type: "shadow",
                  },
                },
                legend: {
                  data: ["To Do", "In Progress", "Done"],
                },
                xAxis: {
                  type: "category",
                  data: weeklyBreakdown.map((week) => `Week ${week.week}`),
                },
                yAxis: {
                  type: "value",
                },
                series: [
                  {
                    name: "To Do",
                    type: "bar",
                    stack: "total",
                    data: weeklyBreakdown.map((week) => week.todo),
                    itemStyle: { color: "#9e9e9e" },
                  },
                  {
                    name: "In Progress",
                    type: "bar",
                    stack: "total",
                    data: weeklyBreakdown.map((week) => week.inProgress),
                    itemStyle: { color: "#ff9800" },
                  },
                  {
                    name: "Done",
                    type: "bar",
                    stack: "total",
                    data: weeklyBreakdown.map((week) => week.done),
                    itemStyle: { color: "#4caf50" },
                  },
                ],
              }}
              style={{ height: "400px" }}
            />
          </Card>
        </Grid>

        {/* Velocity Trends Across Sprints */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <TrendingUp />
              Velocity Trends Across Sprints
            </Typography>
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "axis",
                  axisPointer: {
                    type: "shadow",
                  },
                },
                legend: {
                  data: ["Planned Velocity", "Actual Velocity"],
                },
                xAxis: {
                  type: "category",
                  data: velocityTrends.map((s) => s.sprintName),
                  axisLabel: {
                    rotate: 45,
                  },
                },
                yAxis: {
                  type: "value",
                  name: "Story Points",
                },
                series: [
                  {
                    name: "Planned Velocity",
                    type: "bar",
                    data: velocityTrends.map((s) => s.plannedStoryPoints),
                    itemStyle: { color: "#2196f3" },
                  },
                  {
                    name: "Actual Velocity",
                    type: "bar",
                    data: velocityTrends.map((s) => s.completedStoryPoints),
                    itemStyle: { color: "#4caf50" },
                  },
                ],
              }}
              style={{ height: "400px" }}
            />
          </Card>
        </Grid>

        {/* Weekly Completion Patterns */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Timeline />
              Weekly Completion Patterns
            </Typography>
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "axis",
                  formatter: (params: any) => {
                    const dataIndex = params[0].dataIndex;
                    const pattern = weeklyPatterns[dataIndex];
                    return `Week ${pattern.week}<br/>
                            Completion Rate: ${pattern.completionRate}%<br/>
                            Completed: ${pattern.completedCards}/${pattern.totalCards} cards<br/>
                            Story Points: ${pattern.completedStoryPoints}/${pattern.totalStoryPoints}`;
                  },
                },
                xAxis: {
                  type: "category",
                  data: weeklyPatterns.map((p) => `Week ${p.week}`),
                },
                yAxis: {
                  type: "value",
                  name: "Completion Rate (%)",
                  max: 100,
                },
                series: [
                  {
                    name: "Completion Rate",
                    type: "bar",
                    data: weeklyPatterns.map((p) => p.completionRate),
                    itemStyle: {
                      color: function (params: any) {
                        const value = params.value;
                        if (value >= 80) return "#4caf50";
                        if (value >= 60) return "#ff9800";
                        return "#f44336";
                      },
                    },
                  },
                ],
              }}
              style={{ height: "300px" }}
            />
          </Card>
        </Grid>

        {/* Lead Time Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Speed />
              Lead Time Distribution
            </Typography>
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "item",
                  formatter: "{a} <br/>{b}: {c} tickets",
                },
                series: [
                  {
                    name: "Lead Time",
                    type: "pie",
                    radius: ["30%", "70%"],
                    center: ["50%", "60%"],
                    data: (() => {
                      const completedTickets =
                        timingAnalytics.ticketTimings.filter(
                          (t) => t.leadTimeHours !== null,
                        );

                      const fast = completedTickets.filter(
                        (t) => (t.leadTimeHours || 0) <= 24,
                      ).length;
                      const medium = completedTickets.filter(
                        (t) =>
                          (t.leadTimeHours || 0) > 24 &&
                          (t.leadTimeHours || 0) <= 72,
                      ).length;
                      const slow = completedTickets.filter(
                        (t) => (t.leadTimeHours || 0) > 72,
                      ).length;

                      return [
                        {
                          value: fast,
                          name: "Fast (≤24h)",
                          itemStyle: { color: "#4caf50" },
                        },
                        {
                          value: medium,
                          name: "Medium (24-72h)",
                          itemStyle: { color: "#ff9800" },
                        },
                        {
                          value: slow,
                          name: "Slow (>72h)",
                          itemStyle: { color: "#f44336" },
                        },
                      ];
                    })(),
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                      },
                    },
                  },
                ],
              }}
              style={{ height: "300px" }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Lead Time Insights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lead Time Insights
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Average Lead Time:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {timingAnalytics.insights.averageLeadTimeHours}h
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Fastest Completion:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {timingAnalytics.insights.fastestCompletion}h
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Slowest Completion:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {timingAnalytics.insights.slowestCompletion}h
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Team Velocity Summary
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">
                  Current Sprint Velocity:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {analytics.overview.doneStoryPoints} pts
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Average Velocity:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {velocityTrends.length > 0
                    ? Math.round(
                        velocityTrends.reduce(
                          (sum, s) => sum + s.completedStoryPoints,
                          0,
                        ) / velocityTrends.length,
                      )
                    : 0}{" "}
                  pts
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Best Sprint:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {velocityTrends.length > 0
                    ? Math.max(
                        ...velocityTrends.map((s) => s.completedStoryPoints),
                      )
                    : 0}{" "}
                  pts
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Breakdown */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <TrendingUp />
          Weekly Progress Breakdown
        </Typography>

        <Grid container spacing={2}>
          {weeklyBreakdown.map((week) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={week.week}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Week {week.week}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Cards:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {week.done}/{week.total}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Story Points:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {week.doneStoryPoints}/{week.totalStoryPoints}
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={week.total > 0 ? (week.done / week.total) * 100 : 0}
                  sx={{ mt: 1, mb: 1 }}
                />

                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {week.todo > 0 && (
                    <Chip
                      label={`${week.todo} Todo`}
                      size="small"
                      color="default"
                    />
                  )}
                  {week.inProgress > 0 && (
                    <Chip
                      label={`${week.inProgress} In Progress`}
                      size="small"
                      color="warning"
                    />
                  )}
                  {week.done > 0 && (
                    <Chip
                      label={`${week.done} Done`}
                      size="small"
                      color="success"
                    />
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* Sprint Health Insights */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Sprint Health Insights
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Weekly Velocity
            </Typography>
            {sprintHealth.velocityByWeek.map((week) => (
              <Box key={week.week} sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Week {week.week}</Typography>
                  <Typography variant="body2">
                    {week.completedStoryPoints} pts ({week.completionRate}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={week.completionRate}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Work Distribution
            </Typography>
            {sprintHealth.workDistribution.map((week) => (
              <Box key={week.week} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Week {week.week}: {week.planned} planned, {week.completed}{" "}
                  done
                  {week.remaining > 0 && (
                    <Chip
                      label={`${week.remaining} remaining`}
                      size="small"
                      color="warning"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};
