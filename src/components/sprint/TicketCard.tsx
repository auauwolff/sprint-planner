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
  Avatar,
  Divider,
} from "@mui/material";
import {
  MoreHoriz as MoreHorizIcon,
  Schedule,
  Stars,
  Edit,
  Delete,
  Assignment,
} from "@mui/icons-material";

interface TicketCardProps {
  ticket: any;
  onStatusChange: (
    ticketId: string,
    newStatus: "todo" | "inProgress" | "done",
  ) => void;
}

export const TicketCard = ({ ticket, onStatusChange }: TicketCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: "grey.100",
                color: "text.secondary",
              }}
            >
              <Assignment sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                fontSize: "0.75rem",
                letterSpacing: "0.5px",
              }}
            >
              {ticket.cardId}
            </Typography>
          </Box>

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
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            mb: 2.5,
            lineHeight: 1.4,
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
            sx={{
              height: 28,
              fontSize: "0.75rem",
              fontWeight: 500,
              bgcolor: "grey.50",
              borderColor: "grey.200",
              "& .MuiChip-icon": {
                width: 16,
                height: 16,
                color: "text.secondary",
              },
            }}
          />

          <Chip
            icon={<Stars sx={{ fontSize: "16px !important" }} />}
            label={ticket.storyPoints}
            size="small"
            sx={{
              height: 28,
              fontSize: "0.75rem",
              fontWeight: 600,
              bgcolor: "primary.50",
              color: "primary.main",
              border: "1px solid",
              borderColor: "primary.200",
              "& .MuiChip-icon": {
                width: 16,
                height: 16,
                color: "primary.main",
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
          <MenuItem onClick={handleMenuClose} sx={{ py: 1 }}>
            <Edit fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
            Edit Task
          </MenuItem>
          <MenuItem
            onClick={handleMenuClose}
            sx={{ py: 1, color: "error.main" }}
          >
            <Delete fontSize="small" sx={{ mr: 1.5 }} />
            Delete Task
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};
