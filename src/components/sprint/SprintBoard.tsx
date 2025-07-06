import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Box, Typography, Chip, Button, IconButton, Grid } from "@mui/material";
import {
  Add as AddIcon,
  NavigateBefore,
  NavigateNext,
  PersonAdd,
  PlayArrow,
} from "@mui/icons-material";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { StatusPills } from "./StatusPills";
import { CreateSprintDialog } from "./CreateSprintDialog";
import { AddTeamMemberDialog } from "../auth/AddTeamMemberDialog";
import { SprintAnalytics } from "../analytics/SprintAnalytics";

import { TicketCard } from "./TicketCard";

interface SprintBoardProps {
  currentView: "board" | "analytics";
}

export const SprintBoard = ({ currentView }: SprintBoardProps) => {
  const [selectedSprintIndex, setSelectedSprintIndex] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] =
    useState(false);
  const [activeTicket, setActiveTicket] = useState<Doc<"tickets"> | null>(null);
  // Optimistic updates state - maps ticket ID to optimistic update
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Record<
      string,
      { status: "todo" | "inProgress" | "done"; sprintWeek: number }
    >
  >({});

  // Get all sprints
  const sprints = useQuery(api.sprints.getAllSprints) || [];

  // Mutations
  const updateTicket = useMutation(api.tickets.updateTicket);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced for more responsive drag
      },
    }),
  );

  // Sort sprints - active first, then upcoming, then done
  const sortedSprints = sprints.sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, done: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const selectedSprint = sortedSprints[selectedSprintIndex];

  // Get tickets for the selected sprint (used in drag handlers)
  const rawSprintTickets =
    useQuery(
      selectedSprint ? api.tickets.getTicketsBySprint : ("skip" as any),
      selectedSprint ? { sprintID: selectedSprint._id } : ("skip" as any),
    ) || [];

  // Apply optimistic updates to tickets
  const allSprintTickets = rawSprintTickets.map((ticket: Doc<"tickets">) => {
    const optimisticUpdate = optimisticUpdates[ticket._id];
    if (optimisticUpdate) {
      return {
        ...ticket,
        status: optimisticUpdate.status,
        sprintWeek: optimisticUpdate.sprintWeek,
      };
    }
    return ticket;
  });

  // Calculate current week based on sprint start date and today's date
  const getCurrentWeek = (sprintStartDate: number) => {
    const today = new Date();
    const startDate = new Date(sprintStartDate);
    const daysDiff = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(1, Math.floor(daysDiff / 7) + 1);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const currentWeek = selectedSprint ? getCurrentWeek(selectedSprint.start) : 1;
  const totalWeeks = selectedSprint?.sprintWeek || 1;

  // Generate weeks array
  const weeks = Array.from({ length: totalWeeks }, (_, index) => {
    const weekNumber = index + 1;
    return {
      weekNumber,
      isCurrent: weekNumber === currentWeek,
      isUpcoming: weekNumber > currentWeek,
      isPast: weekNumber < currentWeek,
    };
  });

  const handlePreviousSprint = () => {
    setSelectedSprintIndex(Math.max(0, selectedSprintIndex - 1));
  };

  const handleNextSprint = () => {
    setSelectedSprintIndex(
      Math.min(sortedSprints.length - 1, selectedSprintIndex + 1),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticketId = active.id as string;

    const ticket = allSprintTickets.find(
      (t: Doc<"tickets">) => t._id === ticketId,
    );
    setActiveTicket(ticket || null);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTicket(null);
      return;
    }

    const ticketId = active.id as string;
    const dropId = over.id as string;

    // Parse the drop ID to get status and week (format: "status-week-weekNumber")
    const dropParts = dropId.split("-");
    if (dropParts.length !== 3 || dropParts[1] !== "week") {
      setActiveTicket(null);
      return;
    }

    const newStatus = dropParts[0] as "todo" | "inProgress" | "done";
    const newWeek = parseInt(dropParts[2]);

    // Only update if status or week actually changed
    const ticket = allSprintTickets.find(
      (t: Doc<"tickets">) => t._id === ticketId,
    );
    if (
      ticket &&
      (ticket.status !== newStatus || ticket.sprintWeek !== newWeek)
    ) {
      // Apply optimistic update immediately
      setOptimisticUpdates((prev) => ({
        ...prev,
        [ticketId]: { status: newStatus, sprintWeek: newWeek },
      }));

      try {
        // Update the database
        await updateTicket({
          id: ticket._id,
          status: newStatus,
          sprintWeek: newWeek,
        });

        // Remove optimistic update after successful server update
        setOptimisticUpdates((prev) => {
          const newUpdates = { ...prev };
          delete newUpdates[ticketId];
          return newUpdates;
        });
      } catch (error) {
        console.error("Failed to update ticket:", error);
        // Revert optimistic update on error
        setOptimisticUpdates((prev) => {
          const newUpdates = { ...prev };
          delete newUpdates[ticketId];
          return newUpdates;
        });
      }
    }

    // Clear active ticket immediately for smooth UX
    setActiveTicket(null);
  };

  if (!selectedSprint) {
    return (
      <>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No sprints found. Create your first sprint to get started!
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Sprint
          </Button>
        </Box>

        <CreateSprintDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={() => {
            // After creating sprint, it will appear in the list automatically
            // No need to do anything special here
          }}
        />
      </>
    );
  }

  return (
    <Box sx={{ maxWidth: { xs: "100%", lg: 1600 }, mx: "auto" }}>
      {/* Action Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          bgcolor: "#FFFFFF",
          p: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            disabled={selectedSprint.status === "active"}
            color="success"
          >
            Start Sprint
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={() => setIsAddTeamMemberDialogOpen(true)}
          >
            Add Team Member
          </Button>
        </Box>

        {/* Sprint Navigation */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handlePreviousSprint}
            disabled={selectedSprintIndex === 0}
          >
            <NavigateBefore />
          </IconButton>

          <Box sx={{ textAlign: "center", minWidth: 200 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                mb: 0.5,
              }}
            >
              <Typography variant="h6">{selectedSprint.name}</Typography>
              <Chip
                label={
                  selectedSprint.status.charAt(0).toUpperCase() +
                  selectedSprint.status.slice(1)
                }
                color={
                  selectedSprint.status === "active" ? "success" : "default"
                }
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {formatDate(selectedSprint.start)} -{" "}
              {formatDate(selectedSprint.end)}
            </Typography>
          </Box>

          <IconButton
            onClick={handleNextSprint}
            disabled={selectedSprintIndex === sortedSprints.length - 1}
          >
            <NavigateNext />
          </IconButton>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          New Sprint
        </Button>
      </Box>

      {/* Content based on current view */}
      {currentView === "board" ? (
        // Sprint Board View
        <Box sx={{ px: { xs: 1, sm: 2, lg: 3 } }}>
          {/* Status Pills */}
          <Box sx={{ display: "flex" }}>
            <StatusPills selectedSprintId={selectedSprint._id} />
          </Box>

          {/* Kanban Board with Drag and Drop */}
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Sprint Weeks */}
            {weeks.map((week) => (
              <Box key={week.weekNumber} sx={{ mb: 4 }}>
                {/* Week Title */}
                <Box sx={{ mb: 2, maxWidth: 1270, mx: "auto" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: week.isCurrent
                          ? "primary.main"
                          : week.isUpcoming
                            ? "grey.500"
                            : "grey.400",
                        zIndex: 1,
                        bgcolor: "background.default",
                        pr: 2,
                        fontWeight: week.isCurrent ? 600 : 400,
                      }}
                    >
                      Week {week.weekNumber}
                    </Typography>

                    {/* Connecting line */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "50%",
                        height: "2px",
                        bgcolor: week.isCurrent ? "primary.main" : "grey.300",
                        opacity: week.isCurrent ? 0.6 : 0.3,
                        zIndex: 0,
                        mr: 8,
                      }}
                    />

                    {week.isCurrent && (
                      <Chip
                        label="Current Week"
                        color="primary"
                        size="small"
                        sx={{ zIndex: 1 }}
                      />
                    )}
                    {week.isUpcoming && (
                      <Chip
                        label="Upcoming"
                        color="default"
                        size="small"
                        sx={{ zIndex: 1, opacity: 0.7 }}
                      />
                    )}
                    {week.isPast && (
                      <Chip
                        label="Completed"
                        color="success"
                        variant="outlined"
                        size="small"
                        sx={{ zIndex: 1, opacity: 0.7 }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Kanban Board for this week */}
                <Box
                  sx={{
                    maxWidth: { xs: "100%", sm: 1200, lg: 1400 },
                    mx: "auto",
                    opacity: week.isUpcoming ? 0.7 : 1,
                    filter: week.isUpcoming ? "grayscale(20%)" : "none",
                  }}
                >
                  <Grid
                    container
                    spacing={{ xs: 2, sm: 3, lg: 4 }}
                    sx={{
                      width: "100%",
                      justifyContent: "center",
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <KanbanColumn
                        title="To Do"
                        status="todo"
                        sprintId={selectedSprint._id}
                        weekNumber={week.weekNumber}
                        isUpcoming={week.isUpcoming}
                        tickets={allSprintTickets}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <KanbanColumn
                        title="In Progress"
                        status="inProgress"
                        sprintId={selectedSprint._id}
                        weekNumber={week.weekNumber}
                        isUpcoming={week.isUpcoming}
                        tickets={allSprintTickets}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <KanbanColumn
                        title="Done"
                        status="done"
                        sprintId={selectedSprint._id}
                        weekNumber={week.weekNumber}
                        isUpcoming={week.isUpcoming}
                        tickets={allSprintTickets}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ))}

            <DragOverlay>
              {activeTicket ? (
                <Box
                  sx={{
                    transform: "rotate(3deg)",
                    opacity: 0.95,
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))",
                    pointerEvents: "none",
                  }}
                >
                  <TicketCard ticket={activeTicket} />
                </Box>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Box>
      ) : (
        // Analytics View
        <SprintAnalytics sprintId={selectedSprint._id} />
      )}

      {/* Create Sprint Dialog */}
      <CreateSprintDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          // After creating sprint, it will appear in the list automatically
          // Optionally switch to the newly created sprint
        }}
      />

      {/* Add Team Member Dialog */}
      <AddTeamMemberDialog
        open={isAddTeamMemberDialogOpen}
        onClose={() => setIsAddTeamMemberDialogOpen(false)}
        onSuccess={() => {
          // Optionally refresh team members list or show a success message
        }}
      />
    </Box>
  );
};
