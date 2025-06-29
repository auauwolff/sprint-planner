import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
import { TicketCard } from "./TicketCard";

interface KanbanColumnProps {
  title: string;
  tickets: any[];
  status: "todo" | "inProgress" | "done";
  sprintId: Id<"sprints">;
}

export const KanbanColumn = ({
  title,
  tickets,
  status,
  sprintId,
}: KanbanColumnProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [cardId, setCardId] = useState("");
  const [storyPoints, setStoryPoints] = useState<number>(1);
  const [estimatedDays, setEstimatedDays] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTicketStatus = useMutation(api.tickets.updateTicketStatus);
  const createTicket = useMutation(api.tickets.createTicket);
  const currentUser = useQuery(api.users.getCurrentUser);

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

  const handleTicketMove = async (
    ticketId: string,
    newStatus: "todo" | "inProgress" | "done",
  ) => {
    try {
      await updateTicketStatus({ id: ticketId as any, status: newStatus });
    } catch (error) {
      console.error("Failed to update ticket status:", error);
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
        sprintWeek: 1, // Default sprint week
        sprintID: sprintId as any,
        userID: currentUser._id,
      });

      // Reset form and close dialog
      setNewTicketTitle("");
      setCardId("");
      setStoryPoints(1);
      setEstimatedDays(1);
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
    setEstimatedDays(1);
    setIsAddDialogOpen(false);
  };

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "grey.50",
        minHeight: 400,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
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
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onStatusChange={handleTicketMove}
            />
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

              <TextField
                label="Estimated Days"
                type="number"
                value={estimatedDays}
                onChange={(e) =>
                  setEstimatedDays(parseInt(e.target.value) || 1)
                }
                inputProps={{ min: 1, max: 30 }}
                sx={{ flex: 1 }}
              />
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
