import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  NavigateBefore,
  NavigateNext,
  PersonAdd,
  PlayArrow,
} from "@mui/icons-material";
import { KanbanColumn } from "./KanbanColumn";
import { StatusPills } from "./StatusPills";
import { CreateSprintDialog } from "./CreateSprintDialog";

export const SprintBoard = () => {
  const [selectedSprintIndex, setSelectedSprintIndex] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Get all sprints
  const sprints = useQuery(api.sprints.getAllSprints) || [];

  // Sort sprints - active first, then upcoming, then done
  const sortedSprints = sprints.sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, done: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const selectedSprint = sortedSprints[selectedSprintIndex];

  // Get tickets for selected sprint
  const sprintTickets =
    useQuery(
      selectedSprint ? api.tickets.getTicketsBySprint : "skip",
      selectedSprint ? { sprintID: selectedSprint._id } : "skip",
    ) || [];

  const todoTickets = sprintTickets.filter((t) => t.status === "todo");
  const inProgressTickets = sprintTickets.filter(
    (t) => t.status === "inProgress",
  );
  const doneTickets = sprintTickets.filter((t) => t.status === "done");

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handlePreviousSprint = () => {
    setSelectedSprintIndex(Math.max(0, selectedSprintIndex - 1));
  };

  const handleNextSprint = () => {
    setSelectedSprintIndex(
      Math.min(sortedSprints.length - 1, selectedSprintIndex + 1),
    );
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
    <Box>
      {/* Action Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          bgcolor: "#FFFFFF",
          p: 2,
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
          <Button variant="outlined" startIcon={<PersonAdd />}>
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

      <Box sx={{ p: 2 }}>
        {/* Status Pills */}
        <StatusPills selectedSprintId={selectedSprint._id} />

        {/* Sprint Week Title */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                zIndex: 1,
                bgcolor: "background.default",
                pr: 2,
              }}
            >
              Week {selectedSprint.sprintWeek || 1}
            </Typography>

            {/* Connecting line */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: "2px",
                bgcolor: "primary.main",
                opacity: 0.3,
                zIndex: 0,
              }}
            />

            {selectedSprint.status === "active" && (
              <Chip
                label="Active Sprint"
                color="success"
                size="small"
                sx={{ zIndex: 1 }}
              />
            )}
            {selectedSprint.status === "upcoming" && (
              <Chip
                label="Upcoming"
                color="default"
                size="small"
                sx={{ zIndex: 1 }}
              />
            )}
          </Box>
        </Box>

        {/* Kanban Board */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <KanbanColumn
              title="To Do"
              tickets={todoTickets}
              status="todo"
              sprintId={selectedSprint._id}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <KanbanColumn
              title="In Progress"
              tickets={inProgressTickets}
              status="inProgress"
              sprintId={selectedSprint._id}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <KanbanColumn
              title="Done"
              tickets={doneTickets}
              status="done"
              sprintId={selectedSprint._id}
            />
          </Grid>
        </Grid>

        {/* Create Sprint Dialog */}
        <CreateSprintDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={() => {
            // After creating sprint, it will appear in the list automatically
            // Optionally switch to the newly created sprint
          }}
        />
      </Box>
    </Box>
  );
};
