import React from 'react';
import { Container, Grid, Paper, Typography, Alert, Box } from '@mui/material';
import { useInventory } from '../context/InventoryContext';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MotionPaper = motion(Paper);

const Dashboard = () => {
  const { inventory, getLowStockItems } = useInventory();
  const lowStockItems = getLowStockItems();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const getCategoryData = () => {
    const data = {
      labels: Object.keys(inventory).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      datasets: [{
        data: Object.values(inventory).map(items => items.length),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    };
    return data;
  };

  const getQuantityData = () => {
    const labels = [];
    const data = [];
    
    Object.entries(inventory).forEach(([category, items]) => {
      items.forEach(item => {
        labels.push(item.name);
        data.push(item.quantity);
      });
    });

    return {
      labels,
      datasets: [{
        label: 'Current Quantity',
        data,
        backgroundColor: '#36A2EB'
      }]
    };
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {/* Low Stock Alerts */}
          <Grid item xs={12}>
            <MotionPaper
              variants={itemVariants}
              sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
            >
              <Typography variant="h6" gutterBottom>
                Low Stock Alerts
              </Typography>
              {lowStockItems.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {lowStockItems.map((item) => (
                    <Alert severity="warning" key={item.id}>
                      {item.name} is running low! Current quantity: {item.quantity} {item.unit}
                    </Alert>
                  ))}
                </Box>
              ) : (
                <Alert severity="success">All items are well stocked!</Alert>
              )}
            </MotionPaper>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={6}>
            <MotionPaper
              variants={itemVariants}
              sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}
            >
              <Typography variant="h6" gutterBottom>
                Category Distribution
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pie data={getCategoryData()} />
              </Box>
            </MotionPaper>
          </Grid>

          {/* Quantity Overview */}
          <Grid item xs={12} md={6}>
            <MotionPaper
              variants={itemVariants}
              sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}
            >
              <Typography variant="h6" gutterBottom>
                Quantity Overview
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <Bar 
                  data={getQuantityData()} 
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
      </motion.div>
    </Container>
  );
};

export default Dashboard;
