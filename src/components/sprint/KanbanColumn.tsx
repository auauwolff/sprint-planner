import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import {
  Box,
  Typography,
  Card,
  IconButton,
  Stack,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckBoxOutlined,
  PlayCircleOutline,
  TaskAlt,
} from "@mui/icons-material";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TicketCard } from "./TicketCard";

interface KanbanColumnProps {
  title: string;
  status: "todo" | "inProgress" | "done";
  sprintId: Id<"sprints">;
  weekNumber?: number;
  isUpcoming?: boolean;
  tickets?: Doc<"tickets">[]; // Pre-filtered tickets with proper typing
}

export const KanbanColumn = ({
  title,
  status,
  sprintId,
  weekNumber = 1,
  isUpcoming = false,
  tickets: preFilteredTickets,
}: KanbanColumnProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [cardId, setCardId] = useState("");
  const [storyPoints, setStoryPoints] = useState<number>(1);
  const [estimatedDays, setEstimatedDays] = useState<number>(0.25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTicket = useMutation(api.tickets.createTicket);
  const currentUser = useQuery(api.users.getCurrentUser);

  // Use pre-filtered tickets if provided, otherwise fetch and filter
  const allSprintTickets =
    useQuery(
      preFilteredTickets ? ("skip" as any) : api.tickets.getTicketsBySprint,
      preFilteredTickets ? ("skip" as any) : { sprintID: sprintId },
    ) || [];

  const tickets = preFilteredTickets
    ? preFilteredTickets.filter(
        (ticket: Doc<"tickets">) =>
          ticket.status === status && ticket.sprintWeek === weekNumber,
      )
    : allSprintTickets.filter(
        (ticket: Doc<"tickets">) =>
          ticket.status === status && ticket.sprintWeek === weekNumber,
      );

  // Make this column a droppable area with week-specific ID
  const { setNodeRef } = useDroppable({
    id: `${status}-week-${weekNumber}`,
  });

  const getColumnIcon = () => {
    switch (status) {
      case "todo":
        return <CheckBoxOutlined color="primary" />;
      case "inProgress":
        return <PlayCircleOutline color="warning" />;
      case "done":
        return <TaskAlt color="success" />;
      default:
        return <CheckBoxOutlined />;
    }
  };

  const handleAddTicket = () => {
    setIsAddDialogOpen(true);
  };

  const handleCreateTicket = async () => {
    if (!newTicketTitle.trim() || !cardId.trim() || !currentUser?._id) return;

    setIsSubmitting(true);
    try {
      await createTicket({
        cardId: cardId.trim(),
        title: newTicketTitle.trim(),
        storyPoints,
        estimatedDays,
        status,
        sprintWeek: weekNumber, // Use the current week number
        sprintID: sprintId,
        userID: currentUser._id,
      });

      // Reset form and close dialog
      setNewTicketTitle("");
      setCardId("");
      setStoryPoints(1);
      setEstimatedDays(0.25);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setNewTicketTitle("");
    setCardId("");
    setStoryPoints(1);
    setEstimatedDays(0.25);
    setIsAddDialogOpen(false);
  };

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: isUpcoming ? "grey.25" : "grey.50",
        height: 500, // Fixed height instead of minHeight
        borderRadius: 3,
        border: "1px solid",
        borderColor: isUpcoming ? "grey.100" : "grey.200",
        opacity: isUpcoming ? 0.8 : 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          bgcolor: "background.paper",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "grey.100",
                color: "text.secondary",
              }}
            >
              {getColumnIcon()}
            </Avatar>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            <Chip
              label={tickets.length}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.75rem",
                bgcolor: "grey.200",
                color: "text.secondary",
                "& .MuiChip-label": {
                  px: 1,
                  py: 0,
                },
              }}
            />
          </Box>

          <IconButton
            size="small"
            onClick={handleAddTicket}
            sx={{
              bgcolor: "grey.100",
              color: "text.secondary",
              "&:hover": {
                bgcolor: "grey.200",
              },
              width: 32,
              height: 32,
            }}
          >
            <AddIcon fontSize="small" color="primary" />
          </IconButton>
        </Box>
      </Box>

      {/* Tickets */}
      <Box
        ref={setNodeRef}
        sx={{
          p: 2,
          flex: 1,
          overflowY: "auto",
          maxHeight: "calc(100% - 80px)", // Account for header height
        }}
      >
        <SortableContext
          items={tickets.map((t: Doc<"tickets">) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={2}>
            {tickets.map((ticket: Doc<"tickets">) => (
              <TicketCard key={ticket._id} ticket={ticket} />
            ))}

            {tickets.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "grey.100",
                    color: "text.secondary",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  {getColumnIcon()}
                </Avatar>
                <Typography variant="body2">
                  No tasks in {title.toLowerCase()}
                </Typography>
              </Box>
            )}
          </Stack>
        </SortableContext>
      </Box>

      {/* Add Ticket Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={handleCancelAdd}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Task to {title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Card ID"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              placeholder="e.g., ST-123, TASK-456, BUG-789"
              fullWidth
              autoFocus
            />

            <TextField
              label="Task Title"
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
              placeholder="Enter task description..."
              multiline
              rows={3}
              fullWidth
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Story Points"
                type="number"
                value={storyPoints}
                onChange={(e) => setStoryPoints(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 100 }}
                sx={{ flex: 1 }}
              />

              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Estimated Days"
                  type="number"
                  value={estimatedDays}
                  onChange={(e) =>
                    setEstimatedDays(parseFloat(e.target.value) || 0.25)
                  }
                  inputProps={{
                    min: 0.25,
                    max: 30,
                    step: 0.25,
                  }}
                  fullWidth
                />
                <Box
                  sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}
                >
                  {[
                    { label: "2h", value: 0.25 },
                    { label: "4h", value: 0.5 },
                    { label: "1d", value: 1 },
                    { label: "2d", value: 2 },
                    { label: "3d", value: 3 },
                    { label: "1w", value: 5 },
                  ].map((option) => (
                    <Chip
                      key={option.label}
                      label={option.label}
                      size="small"
                      variant={
                        estimatedDays === option.value ? "filled" : "outlined"
                      }
                      color={
                        estimatedDays === option.value ? "primary" : "default"
                      }
                      onClick={() => setEstimatedDays(option.value)}
                      sx={{
                        cursor: "pointer",
                        height: 24,
                        fontSize: "0.7rem",
                        "&:hover": {
                          bgcolor:
                            estimatedDays === option.value
                              ? "primary.main"
                              : "grey.100",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCancelAdd} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTicket}
            variant="contained"
            disabled={!newTicketTitle.trim() || !cardId.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Add Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
