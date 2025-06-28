import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { ExitToApp } from "@mui/icons-material";

export const DashboardAppBar = () => {
  const { signOut } = useAuthActions();
  const { viewer } = useQuery(api.myFunctions.listNumbers, { count: 1 }) ?? {};

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sprint Planner
        </Typography>
        <Typography variant="body2" sx={{ mr: 2 }}>
          Welcome, {viewer || "User"}!
        </Typography>
        <IconButton color="inherit" onClick={handleSignOut}>
          <ExitToApp />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
