import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { TicketCard } from "./TicketCard";

interface KanbanColumnProps {
  title: string;
  tickets: any[];
  status: "todo" | "inProgress" | "done";
  sprintId: string;
}

export const KanbanColumn = ({ title, tickets, status, sprintId }: KanbanColumnProps) => {
  const updateTicketStatus = useMutation(api.tickets.updateTicketStatus);

  const getColumnColor = () => {
    switch (status) {
      case "todo":
        return "#e3f2fd"; // Light blue
      case "inProgress":
        return "#fff3e0"; // Light orange
      case "done":
        return "#e8f5e8"; // Light green
      default:
        return "#f5f5f5";
    }
  };

  const getHeaderColor = () => {
    switch (status) {
      case "todo":
        return "#1976d2"; // Blue
      case "inProgress":
        return "#f57c00"; // Orange
      case "done":
        return "#388e3c"; // Green
      default:
        return "#666";
    }
  };

  const handleTicketMove = async (ticketId: string, newStatus: "todo" | "inProgress" | "done") => {
    try {
      await updateTicketStatus({ id: ticketId, status: newStatus });
    } catch (error) {
      console.error("Failed to update ticket status:", error);
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        backgroundColor: getColumnColor(),
        minHeight: 400,
        border: `2px solid ${getColumnColor()}`,
        borderRadius: 2,
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `2px solid ${getHeaderColor()}`,
          backgroundColor: 'white',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: getHeaderColor(),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {title}
            <Typography
              component="span"
              sx={{
                backgroundColor: getHeaderColor(),
                color: 'white',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 'bold',
              }}
            >
              {tickets.length}
            </Typography>
          </Typography>
          
          <IconButton
            size="small"
            sx={{
              backgroundColor: getHeaderColor(),
              color: 'white',
              '&:hover': {
                backgroundColor: getHeaderColor(),
                opacity: 0.8,
              },
            }}
          >
            <AddIcon fontSize="small" />
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
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              No tickets in {title.toLowerCase()}
            </Box>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};
