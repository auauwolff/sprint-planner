import { useAuthActions } from "@convex-dev/auth/react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { ExitToApp } from "@mui/icons-material";

interface DashboardAppBarProps {
  userEmail?: string;
}

export const DashboardAppBar = ({ userEmail }: DashboardAppBarProps) => {
  const { signOut } = useAuthActions();

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
          Welcome, {userEmail || "User"}!
        </Typography>
        <IconButton color="inherit" onClick={handleSignOut}>
          <ExitToApp />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
