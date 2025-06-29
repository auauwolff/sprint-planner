import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import {
  MoreHoriz as MoreHorizIcon,
  Schedule,
  Stars,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface TicketCardProps {
  ticket: any;
  onStatusChange: (
    ticketId: string,
    newStatus: "todo" | "inProgress" | "done",
  ) => void;
  onTicketUpdate?: () => void; // Optional callback for when ticket is updated/deleted
}

export const TicketCard = ({
  ticket,
  onStatusChange,
  onTicketUpdate,
}: TicketCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit form state
  const [editCardId, setEditCardId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editStoryPoints, setEditStoryPoints] = useState<number>(1);
  const [editEstimatedDays, setEditEstimatedDays] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const open = Boolean(anchorEl);

  // Mutations
  const updateTicket = useMutation(api.tickets.updateTicket);
  const deleteTicket = useMutation(api.tickets.deleteTicket);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus: "todo" | "inProgress" | "done") => {
    onStatusChange(ticket._id, newStatus);
    handleMenuClose();
  };

  const handleEditClick = () => {
    // Populate form with current ticket data
    setEditCardId(ticket.cardId);
    setEditTitle(ticket.title);
    setEditStoryPoints(ticket.storyPoints);
    setEditEstimatedDays(ticket.estimatedDays);
    setIsEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    handleMenuClose();
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
      onTicketUpdate?.(); // Optional callback to refresh data
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
      onTicketUpdate?.(); // Optional callback to refresh data
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
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "grey.300",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transform: "translateY(-1px)",
        },
        cursor: "pointer",
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

          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{
              p: 0.5,
              color: "text.secondary",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            <MoreHorizIcon fontSize="small" color="primary" />
          </IconButton>
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

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{ px: 2, py: 1, color: "text.secondary", fontWeight: 600 }}
          >
            MOVE TO
          </Typography>
          <MenuItem onClick={() => handleStatusChange("todo")} sx={{ py: 1 }}>
            Move to To Do
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusChange("inProgress")}
            sx={{ py: 1 }}
          >
            Move to In Progress
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange("done")} sx={{ py: 1 }}>
            Move to Done
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleEditClick} sx={{ py: 1 }}>
            <Edit fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
            Edit Task
          </MenuItem>
          <MenuItem
            onClick={handleDeleteClick}
            sx={{ py: 1, color: "error.main" }}
          >
            <Delete fontSize="small" sx={{ mr: 1.5 }} />
            Delete Task
          </MenuItem>
        </Menu>

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
