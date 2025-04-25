import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Icon from '@mui/material/Icon';
import { categoryIcons } from '../data/defaultData';
import { useInventory } from '../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion(Card);

const Inventory = () => {
  const { inventory, addItem, updateItem, deleteItem } = useInventory();
  const [currentTab, setCurrentTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: '',
    threshold: '',
    category: Object.keys(inventory)[0]
  });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleDialogOpen = (item = null) => {
    if (item) {
      setEditItem(item);
      setNewItem(item);
    } else {
      setEditItem(null);
      setNewItem({
        name: '',
        quantity: '',
        unit: '',
        threshold: '',
        category: Object.keys(inventory)[currentTab]
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditItem(null);
    setNewItem({
      name: '',
      quantity: '',
      unit: '',
      threshold: '',
      category: Object.keys(inventory)[currentTab]
    });
  };

  const handleSubmit = () => {
    if (editItem) {
      updateItem({ ...newItem, id: editItem.id });
    } else {
      addItem(newItem);
    }
    handleDialogClose();
  };

  const handleDelete = (item) => {
    deleteItem(item.id, item.category);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                {Object.keys(inventory).map((category, index) => (
                  <Tab 
                    key={category} 
                    icon={<Icon>{categoryIcons[category]}</Icon>}
                    label={category.charAt(0).toUpperCase() + category.slice(1)}
                    value={index}
                    sx={{
                      minHeight: 72,
                      '& .MuiIcon-root': {
                        mb: 1
                      }
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleDialogOpen()}
              >
                Add New Item
              </Button>
            </Box>

            <Grid container spacing={2}>
              <AnimatePresence>
                {inventory[Object.keys(inventory)[currentTab]].map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <MotionCard
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      sx={{
                        position: 'relative',
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-4px)',
                          transition: 'all 0.3s ease-in-out'
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {item.name}
                        </Typography>
                        <Typography color="text.secondary">
                          Quantity: {item.quantity} {item.unit}
                        </Typography>
                        <Typography color="text.secondary">
                          Threshold: {item.threshold} {item.unit}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton onClick={() => handleDialogOpen(item)} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(item)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Quantity"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Unit"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              fullWidth
            />
            <TextField
              label="Threshold"
              type="number"
              value={newItem.threshold}
              onChange={(e) => setNewItem({ ...newItem, threshold: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              fullWidth
            >
              {Object.keys(inventory).map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editItem ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Inventory;
