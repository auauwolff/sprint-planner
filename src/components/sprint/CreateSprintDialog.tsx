import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from "@mui/material";

interface CreateSprintDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateSprintDialog = ({
  open,
  onClose,
  onSuccess,
}: CreateSprintDialogProps) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "upcoming" | "done">(
    "upcoming",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sprintWeek, setSprintWeek] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSprint = useMutation(api.sprints.createSprint);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!name.trim()) {
        throw new Error("Sprint name is required");
      }
      if (!startDate) {
        throw new Error("Start date is required");
      }
      if (!endDate) {
        throw new Error("End date is required");
      }

      // Convert dates to Unix timestamps
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();

      // Validate date range
      if (endTimestamp <= startTimestamp) {
        throw new Error("End date must be after start date");
      }

      // Create the sprint
      await createSprint({
        name: name.trim(),
        status,
        start: startTimestamp,
        end: endTimestamp,
        sprintWeek,
      });

      // Reset form and close dialog
      handleReset();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to create sprint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setStatus("upcoming");
    setStartDate("");
    setEndDate("");
    setSprintWeek(1);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Helper function to format date for input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Set default dates on first open
  useEffect(() => {
    if (open && !startDate && !endDate) {
      const today = new Date();
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(today.getDate() + 14);

      setStartDate(formatDateForInput(today));
      setEndDate(formatDateForInput(twoWeeksFromNow));
    }
  }, [open, startDate, endDate]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Sprint</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              label="Sprint Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sprint 8"
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Sprint Week"
              type="number"
              value={sprintWeek}
              onChange={(e) => setSprintWeek(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 52 }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "upcoming" | "done")
                }
              >
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />

            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Sprint"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
