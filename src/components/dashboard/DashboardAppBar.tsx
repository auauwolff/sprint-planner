import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ExitToApp,
  Menu as MenuIcon,
  ViewKanban,
  Analytics,
} from "@mui/icons-material";

interface DashboardAppBarProps {
  currentView: "board" | "analytics";
  onViewChange: (view: "board" | "analytics") => void;
}

export const DashboardAppBar = ({
  currentView,
  onViewChange,
}: DashboardAppBarProps) => {
  const { signOut } = useAuthActions();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleSignOut = () => {
    void signOut();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (view: "board" | "analytics") => {
    onViewChange(view);
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          color="inherit"
          onClick={handleMenuClick}
          sx={{ mr: 2 }}
          aria-label="navigation menu"
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sprint Planner
        </Typography>

        <IconButton color="inherit" onClick={handleSignOut}>
          <ExitToApp />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <MenuItem
            onClick={() => handleViewChange("board")}
            selected={currentView === "board"}
          >
            <ListItemIcon>
              <ViewKanban fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sprint Board</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleViewChange("analytics")}
            selected={currentView === "analytics"}
          >
            <ListItemIcon>
              <Analytics fontSize="small" />
            </ListItemIcon>
            <ListItemText>Analytics</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
