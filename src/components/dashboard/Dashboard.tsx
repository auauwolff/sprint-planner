import { Box } from "@mui/material";
import { DashboardAppBar } from "./DashboardAppBar";
import { SprintBoard } from "../sprint/SprintBoard";

export const Dashboard = () => {
  return (
    <Box sx={{ height: "100vh", bgcolor: "#FAFAFA" }}>
      <DashboardAppBar />
      <SprintBoard />
    </Box>
  );
};
