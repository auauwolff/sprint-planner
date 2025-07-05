import React, { useState } from "react";
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
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { PersonAdd, Visibility, VisibilityOff } from "@mui/icons-material";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface AddTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddTeamMemberDialog = ({
  open,
  onClose,
  onSuccess,
}: AddTeamMemberDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"User" | "PM">("User");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTeamMember = useAction(api.users.createTeamMemberWithAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!name.trim()) {
        throw new Error("Name is required");
      }
      if (!email.trim()) {
        throw new Error("Email is required");
      }
      if (!password.trim()) {
        throw new Error("Password is required");
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error("Please enter a valid email address");
      }

      // Basic password validation
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Create the team member with authentication
      const result = await createTeamMember({
        name: name.trim(),
        email: email.trim(),
        role,
        password: password.trim(),
      });

      setSuccess(result.message);

      // Reset form after successful creation
      setTimeout(() => {
        handleReset();
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add team member";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setRole("User");
    setPassword("");
    setShowPassword(false);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonAdd />
          Add Team Member
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              disabled={isSubmitting}
              placeholder="e.g. John Doe"
            />

            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              disabled={isSubmitting}
              placeholder="e.g. john.doe@company.com"
              helperText="The team member will use this email to sign in"
            />

            <TextField
              label="Temporary Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              disabled={isSubmitting}
              placeholder="Enter a temporary password"
              helperText="They can change this password after their first login"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value as "User" | "PM")}
              >
                <MenuItem value="User">
                  <Box>
                    <Box sx={{ fontWeight: 500 }}>User</Box>
                    <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                      Can create and manage tickets within assigned sprints
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="PM">
                  <Box>
                    <Box sx={{ fontWeight: 500 }}>Project Manager</Box>
                    <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                      Can manage sprints, tickets, and team members
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !!success}
            startIcon={
              isSubmitting ? <CircularProgress size={20} /> : <PersonAdd />
            }
          >
            {isSubmitting ? "Adding..." : "Add Team Member"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
