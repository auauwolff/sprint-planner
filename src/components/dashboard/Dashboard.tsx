import {
  Container,
  Box,
  Typography,
} from "@mui/material";
import { DashboardAppBar } from "./DashboardAppBar";
import { DemoCard } from "./DemoCard";
import { WelcomeCard } from "./WelcomeCard";

export const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <DashboardAppBar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          
          <DemoCard />
          <WelcomeCard />
        </Box>
      </Container>
    </Box>
  );
};
