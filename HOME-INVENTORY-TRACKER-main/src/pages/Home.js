import React from 'react';
import { Container, Typography, Button, Box, Grid, Paper, Alert, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import InventoryIcon from '@mui/icons-material/Inventory';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useInventory } from '../context/InventoryContext';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionPaper = motion(Paper);

const Home = () => {
  const navigate = useNavigate();
  const { inventory, getLowStockItems } = useInventory();
  const lowStockItems = getLowStockItems();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const features = [
    {
      icon: <InventoryIcon sx={{ fontSize: 60 }} />,
      title: 'Smart Inventory Management',
      description: 'Keep track of all your household items with ease'
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 60 }} />,
      title: 'AI Assistant',
      description: 'Get smart recommendations for your home inventory needs'
    },
    {
      icon: <NotificationsActiveIcon sx={{ fontSize: 60 }} />,
      title: 'Low Stock Alerts',
      description: 'Never run out of essential items with timely notifications'
    }
  ];

  // Prepare chart data
  const getCategoryData = () => ({
    labels: Object.keys(inventory).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [{
      data: Object.values(inventory).map(items => items.length),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }]
  });

  const getUsageData = () => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Item Usage Trend',
      data: [65, 59, 80, 81, 56, 55],
      fill: false,
      borderColor: '#2196f3',
      tension: 0.1
    }]
  });

  const stats = {
    totalItems: Object.values(inventory).flat().length,
    lowStockCount: lowStockItems.length,
    categories: Object.keys(inventory).length,
    recentActivity: 12 // Placeholder for recent activities
  };

  return (
    <Container maxWidth="lg">
      <MotionBox
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ py: 4 }}
      >
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
          borderRadius: 4,
          color: 'white',
          mb: 6
        }}>
          <MotionTypography
            variant="h2"
            component={motion.h1}
            variants={itemVariants}
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Smart Home Inventory Management
          </MotionTypography>

          <MotionTypography
            variant="h5"
            component={motion.h2}
            variants={itemVariants}
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Track, Manage, and Optimize Your Home Inventory
          </MotionTypography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{
              px: 4,
              py: 2,
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)'
              }
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { title: 'Total Items', value: stats.totalItems, icon: <InventoryIcon /> },
            { title: 'Low Stock Alerts', value: stats.lowStockCount, icon: <NotificationsActiveIcon /> },
            { title: 'Categories', value: stats.categories, icon: <ShoppingCartIcon /> },
            { title: 'Recent Activities', value: stats.recentActivity, icon: <TrendingUpIcon /> }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionPaper
                variants={itemVariants}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>{stat.value}</Typography>
                <Typography color="text.secondary">{stat.title}</Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>

        {/* Alerts Section */}
        {lowStockItems.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Current Alerts
            </Typography>
            <Grid container spacing={2}>
              {lowStockItems.map((item) => (
                <Grid item xs={12} md={6} key={item.id}>
                  <Alert 
                    severity="warning"
                    action={
                      <Chip
                        label={`${item.quantity} ${item.unit} left`}
                        color="warning"
                        size="small"
                      />
                    }
                  >
                    {item.name} is running low! (Threshold: {item.threshold} {item.unit})
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Charts Section */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <MotionPaper
              variants={itemVariants}
              sx={{ p: 3, height: '100%' }}
            >
              <Typography variant="h6" gutterBottom>
                Category Distribution
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pie data={getCategoryData()} />
              </Box>
            </MotionPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionPaper
              variants={itemVariants}
              sx={{ p: 3, height: '100%' }}
            >
              <Typography variant="h6" gutterBottom>
                Usage Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={getUsageData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
            </MotionPaper>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <MotionBox
                variants={itemVariants}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-8px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                {feature.icon}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary" align="center">
                  {feature.description}
                </Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </MotionBox>
    </Container>
  );
};

export default Home;
