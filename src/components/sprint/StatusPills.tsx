import { Box, Chip, Avatar } from "@mui/material";
import { Person, Assignment, Schedule, Stars } from "@mui/icons-material";

interface StatusPillsProps {
  currentUser: any;
  sprintSummary: any;
}

export const StatusPills = ({ currentUser, sprintSummary }: StatusPillsProps) => {
  const pillStyle = {
    mr: 1,
    mb: 1,
    height: 32,
    '& .MuiChip-label': {
      px: 2,
      fontWeight: 500,
    },
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* User Name Pill */}
      <Chip
        avatar={
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
            {currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
          </Avatar>
        }
        label={currentUser?.name || currentUser?.email || 'User'}
        color="primary"
        sx={pillStyle}
      />

      {/* Tasks Count */}
      <Chip
        icon={<Assignment sx={{ fontSize: '1rem' }} />}
        label={`Tasks ${sprintSummary?.totalTickets || 0}`}
        color="primary"
        variant="outlined"
        sx={pillStyle}
      />

      {/* Estimated Days */}
      <Chip
        icon={<Schedule sx={{ fontSize: '1rem' }} />}
        label={`Days ${sprintSummary?.totalEstimatedDays || 0}`}
        color="primary"
        variant="outlined"
        sx={pillStyle}
      />

      {/* Story Points */}
      <Chip
        icon={<Stars sx={{ fontSize: '1rem' }} />}
        label={`Story P. ${sprintSummary?.totalStoryPoints || 0}`}
        color="primary"
        variant="outlined"
        sx={pillStyle}
      />

      {/* Status Counts */}
      <Chip
        label={`Todo ${sprintSummary?.todoCount || 0}`}
        color="default"
        sx={pillStyle}
      />

      <Chip
        label={`In Progress ${sprintSummary?.inProgressCount || 0}`}
        color="warning"
        sx={pillStyle}
      />

      <Chip
        label={`Done ${sprintSummary?.doneCount || 0}`}
        color="success"
        sx={pillStyle}
      />
    </Box>
  );
};
