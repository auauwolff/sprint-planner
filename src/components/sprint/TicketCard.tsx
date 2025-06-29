import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
} from "@mui/material";
import { Schedule, Stars, Edit, Delete } from "@mui/icons-material";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TicketCardProps {
  ticket: Doc<"tickets">;
}

export const TicketCard = ({ ticket }: TicketCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition, // Disable transition during drag
    opacity: isDragging ? 0.8 : 1, // Less dramatic opacity change
  };

  // Edit form state
  const [editCardId, setEditCardId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editStoryPoints, setEditStoryPoints] = useState<number>(1);
  const [editEstimatedDays, setEditEstimatedDays] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const updateTicket = useMutation(api.tickets.updateTicket);
  const deleteTicket = useMutation(api.tickets.deleteTicket);

  const handleEditClick = () => {
    // Populate form with current ticket data
    setEditCardId(ticket.cardId);
    setEditTitle(ticket.title);
    setEditStoryPoints(ticket.storyPoints);
    setEditEstimatedDays(ticket.estimatedDays);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim() || !editCardId.trim()) return;

    setIsSubmitting(true);
    try {
      await updateTicket({
        id: ticket._id,
        cardId: editCardId.trim(),
        title: editTitle.trim(),
        storyPoints: editStoryPoints,
        estimatedDays: editEstimatedDays,
      });

      setIsEditDialogOpen(false);
      // Convex will automatically update the UI with reactive data
    } catch (error) {
      console.error("Failed to update ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await deleteTicket({ id: ticket._id });
      setIsDeleteDialogOpen(false);
      // Convex will automatically update the UI with reactive data
    } catch (error) {
      console.error("Failed to delete ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    // Reset form
    setEditCardId("");
    setEditTitle("");
    setEditStoryPoints(1);
    setEditEstimatedDays(1);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 2,
        transition: isDragging ? "none" : "all 0.2s ease-in-out", // Disable transition during drag
        "&:hover": {
          borderColor: "grey.300",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transform: isDragging ? "none" : "translateY(-1px)", // Disable hover transform during drag
        },
        cursor: isDragging ? "grabbing" : "grab",
        "&:active": {
          cursor: "grabbing",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Chip
            label={ticket.cardId}
            variant="filled"
            color="info"
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              fontWeight: 600,
              "& .MuiChip-label": {
                px: 1.5,
                py: 0,
              },
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="Edit Task">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick();
                }}
                sx={{
                  p: 0.5,
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: "grey.100",
                    color: "primary.main",
                  },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Task">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
                sx={{
                  p: 0.5,
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: "grey.100",
                    color: "error.main",
                  },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            my: 2,
            color: "text.primary",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {ticket.title}
        </Typography>

        {/* Metrics */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Chip
            icon={<Schedule sx={{ fontSize: "16px !important" }} />}
            label={`${ticket.estimatedDays}d`}
            size="small"
            variant="outlined"
            color="warning"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              "& .MuiChip-label": {
                px: 1,
                py: 0,
              },
            }}
          />

          <Chip
            icon={<Stars sx={{ fontSize: "16px !important" }} />}
            label={ticket.storyPoints}
            size="small"
            variant="outlined"
            color="info"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              "& .MuiChip-label": {
                px: 1,
                py: 0,
              },
            }}
          />
        </Box>

        {/* Edit Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onClose={handleEditCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <TextField
                label="Card ID"
                value={editCardId}
                onChange={(e) => setEditCardId(e.target.value)}
                placeholder="e.g., ST-123, TASK-456, BUG-789"
                fullWidth
                autoFocus
              />

              <TextField
                label="Task Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter task description..."
                multiline
                rows={3}
                fullWidth
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Story Points"
                  type="number"
                  value={editStoryPoints}
                  onChange={(e) =>
                    setEditStoryPoints(parseInt(e.target.value) || 1)
                  }
                  inputProps={{ min: 1, max: 100 }}
                  sx={{ flex: 1 }}
                />

                <TextField
                  label="Estimated Days"
                  type="number"
                  value={editEstimatedDays}
                  onChange={(e) =>
                    setEditEstimatedDays(parseInt(e.target.value) || 1)
                  }
                  inputProps={{ min: 1, max: 30 }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleEditCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              disabled={!editTitle.trim() || !editCardId.trim() || isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Task"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
        >
          <DialogTitle>Delete Task</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this task?
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {ticket.cardId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ticket.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleDeleteCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Task"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};
