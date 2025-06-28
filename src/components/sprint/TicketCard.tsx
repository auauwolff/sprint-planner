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
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Schedule,
  Stars,
  Edit,
  Delete,
} from "@mui/icons-material";

interface TicketCardProps {
  ticket: any;
  onStatusChange: (ticketId: string, newStatus: "todo" | "inProgress" | "done") => void;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "#1976d2";
      case "inProgress":
        return "#f57c00";
      case "done":
        return "#388e3c";
      default:
        return "#666";
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Card ID and Menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              color: getStatusColor(ticket.status),
              backgroundColor: `${getStatusColor(ticket.status)}15`,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
            }}
          >
            {ticket.cardId}
          </Typography>
          
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{ p: 0.5 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            mb: 2,
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {ticket.title}
        </Typography>

        {/* Footer with days and story points */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Estimated Days">
              <Chip
                icon={<Schedule sx={{ fontSize: '0.875rem' }} />}
                label={`${ticket.estimatedDays} days`}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  '& .MuiChip-icon': {
                    width: 14,
                    height: 14,
                  },
                }}
              />
            </Tooltip>
          </Box>

          <Tooltip title="Story Points">
            <Chip
              icon={<Stars sx={{ fontSize: '0.875rem' }} />}
              label={ticket.storyPoints}
              size="small"
              color="primary"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 'bold',
                '& .MuiChip-icon': {
                  width: 14,
                  height: 14,
                },
              }}
            />
          </Tooltip>
        </Box>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 160,
            },
          }}
        >
          <MenuItem onClick={() => handleStatusChange("todo")}>
            Move to To Do
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange("inProgress")}>
            Move to In Progress
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange("done")}>
            Move to Done
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={handleMenuClose}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};
