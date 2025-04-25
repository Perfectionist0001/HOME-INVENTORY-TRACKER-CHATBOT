import React from 'react';
import { AppBar, Toolbar, Typography, Button, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ChatIcon from '@mui/icons-material/Chat';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const { getLowStockItems } = useInventory();
  const lowStockCount = getLowStockItems().length;

  const MotionButton = motion(Button);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Home Inventory Tracker
        </Typography>
        <MotionButton
          whileHover={{ scale: 1.1 }}
          color="inherit"
          onClick={() => navigate('/')}
          startIcon={<HomeIcon />}
        >
          Home
        </MotionButton>
        <MotionButton
          whileHover={{ scale: 1.1 }}
          color="inherit"
          onClick={() => navigate('/dashboard')}
          startIcon={<DashboardIcon />}
        >
          Dashboard
        </MotionButton>
        <MotionButton
          whileHover={{ scale: 1.1 }}
          color="inherit"
          onClick={() => navigate('/inventory')}
          startIcon={
            <Badge badgeContent={lowStockCount} color="error">
              <InventoryIcon />
            </Badge>
          }
        >
          Inventory
        </MotionButton>
        <MotionButton
          whileHover={{ scale: 1.1 }}
          color="inherit"
          onClick={() => navigate('/chatbot')}
          startIcon={<ChatIcon />}
        >
          AI Assistant
        </MotionButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
