import { useState } from "react";
import { Box } from "@mui/material";
import { DashboardAppBar } from "./DashboardAppBar";
import { SprintBoard } from "../sprint/SprintBoard";

export const Dashboard = () => {
  const [currentView, setCurrentView] = useState<"board" | "analytics">(
    "board",
  );

  return (
    <Box sx={{ height: "100%", bgcolor: "#FAFAFA" }}>
      <DashboardAppBar
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      <SprintBoard currentView={currentView} />
    </Box>
  );
};
