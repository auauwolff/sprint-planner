import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { Add } from "@mui/icons-material";

interface DemoCardProps {
  numbers?: number[];
}

export const DemoCard = ({ numbers }: DemoCardProps) => {
  const addNumber = useMutation(api.myFunctions.addNumber);

  const handleAddNumber = () => {
    void addNumber({ value: Math.floor(Math.random() * 10) });
  };

  return (
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
  );
};
