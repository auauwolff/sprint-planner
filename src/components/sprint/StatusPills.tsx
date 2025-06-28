import { Box, Chip } from "@mui/material";
import {
  Code,
  Assignment,
  Schedule,
  Stars,
  CheckBoxOutlined,
  PlayCircleOutline,
  TaskAlt,
} from "@mui/icons-material";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface StatusPillsProps {
  selectedSprintId: Id<"sprints">;
}

export const StatusPills = ({ selectedSprintId }: StatusPillsProps) => {
  const currentUser = useQuery(api.users.getCurrentUser);
  const sprintSummary = useQuery(api.tickets.getSprintSummary, {
    sprintID: selectedSprintId,
  });
  const pillStyle = {
    mr: 1,
    mb: 1,
    height: 32,
    "& .MuiChip-label": {
      px: 2,
      fontWeight: 500,
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
      }}
    >
      {/* User Name Pill */}
      <Chip
        icon={<Code sx={{ fontSize: "1rem" }} />}
        label={currentUser?.name || currentUser?.email || "Developer"}
        variant="filled"
        color="primary"
        sx={pillStyle}
      />

      {/* Tasks Count */}
      <Chip
        icon={<Assignment sx={{ fontSize: "1rem" }} />}
        label={`Tasks ${sprintSummary?.totalTickets || 0}`}
        variant="outlined"
        color="primary"
        sx={pillStyle}
      />

      {/* Estimated Days */}
      <Chip
        icon={<Schedule sx={{ fontSize: "1rem" }} />}
        label={`Days ${sprintSummary?.totalEstimatedDays || 0}`}
        variant="outlined"
        color="primary"
        sx={pillStyle}
      />

      {/* Story Points */}
      <Chip
        icon={<Stars sx={{ fontSize: "1rem" }} />}
        label={`Story P. ${sprintSummary?.totalStoryPoints || 0}`}
        variant="outlined"
        color="primary"
        sx={pillStyle}
      />

      {/* Status Counts */}
      <Chip
        icon={<CheckBoxOutlined sx={{ fontSize: "1rem" }} />}
        label={`Todo ${sprintSummary?.todoCount || 0}`}
        variant="outlined"
        color="primary"
        sx={pillStyle}
      />

      <Chip
        icon={<PlayCircleOutline sx={{ fontSize: "1rem" }} />}
        label={`In Progress ${sprintSummary?.inProgressCount || 0}`}
        variant="outlined"
        color="primary"
        sx={pillStyle}
      />

      <Chip
        icon={<TaskAlt sx={{ fontSize: "1rem" }} />}
        label={`Done ${sprintSummary?.doneCount || 0}`}
        variant="outlined"
        color="primary"
        sx={pillStyle}
      />
    </Box>
  );
};
