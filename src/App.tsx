"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { ExitToApp, Add } from "@mui/icons-material";

export default function App() {
  return (
    <>
      <Authenticated>
        <Dashboard />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}

function Dashboard() {
  const { signOut } = useAuthActions();
  const { viewer, numbers } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);

  const handleSignOut = () => {
    void signOut();
  };

  const handleAddNumber = () => {
    void addNumber({ value: Math.floor(Math.random() * 10) });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
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
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Random Numbers Demo
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Click the button to add random numbers. This data is persisted in Convex!
              </Typography>
              
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleAddNumber}
                sx={{ mb: 2 }}
              >
                Add Random Number
              </Button>
              
              <Box>
                <Typography variant="body1">
                  Numbers: {numbers?.length === 0 ? "Click the button!" : (numbers?.join(", ") || "...")}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
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
        </Box>
      </Container>
    </Box>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const { isLoading } = useConvexAuth();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("flow", flow);
    
    void signIn("password", formData).catch((error) => {
      setError(error.message);
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Sprint Planner
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
              {flow === "signIn" ? "Sign in to your account" : "Create a new account"}
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  flow === "signIn" ? "Sign In" : "Sign Up"
                )}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  {flow === "signIn" ? "Don't have an account? " : "Already have an account? "}
                  <Button
                    variant="text"
                    onClick={() => {
                      setFlow(flow === "signIn" ? "signUp" : "signIn");
                      setError(null);
                    }}
                    disabled={isLoading}
                  >
                    {flow === "signIn" ? "Sign up" : "Sign in"}
                  </Button>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

