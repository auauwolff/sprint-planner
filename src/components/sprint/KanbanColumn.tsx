import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Box,
  Typography,
  Card,
  IconButton,
  Stack,
  Avatar,
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
  sprintId: string;
}

export const KanbanColumn = ({
  title,
  tickets,
  status,
  sprintId,
}: KanbanColumnProps) => {
  const updateTicketStatus = useMutation(api.tickets.updateTicketStatus);

  const getColumnIcon = () => {
    switch (status) {
      case "todo":
        return <CheckBoxOutlined />;
      case "inProgress":
        return <PlayCircleOutline />;
      case "done":
        return <TaskAlt />;
      default:
        return <CheckBoxOutlined />;
    }
  };

  const handleTicketMove = async (
    ticketId: string,
    newStatus: "todo" | "inProgress" | "done",
  ) => {
    try {
      await updateTicketStatus({ id: ticketId, status: newStatus });
    } catch (error) {
      console.error("Failed to update ticket status:", error);
    }
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
            <Box>
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
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.75rem",
                }}
              >
                {tickets.length} {tickets.length === 1 ? "task" : "tasks"}
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
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
    </Card>
  );
};
