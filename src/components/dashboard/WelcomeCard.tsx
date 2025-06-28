import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

export const WelcomeCard = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Welcome to Your Sprint Planner
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is your dashboard. You can start building your sprint planning features here.
        </Typography>
      </CardContent>
    </Card>
  );
};
