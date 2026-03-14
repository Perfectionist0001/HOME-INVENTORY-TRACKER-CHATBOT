import React, { useState } from 'react';
import {
  Container, Grid, Paper, Typography, Tabs, Tab, TextField,
  Button, Card, CardContent, IconButton, Box, Dialog, Chip,
  DialogTitle, DialogContent, DialogActions, MenuItem, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Icon from '@mui/material/Icon';
import { categoryIcons } from '../data/defaultData';
import { useInventory } from '../context/InventoryContext';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion(Card);

const emptyItem = (category) => ({ name: '', quantity: '', unit: '', threshold: '', category });

const Inventory = () => {
  const { inventory, addItem, updateItem, deleteItem, addCategory } = useInventory();
  const [currentTab, setCurrentTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState(emptyItem(Object.keys(inventory)[0]));
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const handleTabChange = (_, newValue) => setCurrentTab(newValue);

  const validate = () => {
    const e = {};
    if (!newItem.name.trim()) e.name = 'Name is required';
    if (newItem.quantity === '' || isNaN(newItem.quantity) || Number(newItem.quantity) < 0)
      e.quantity = 'Enter a valid quantity (≥ 0)';
    if (!newItem.unit.trim()) e.unit = 'Unit is required';
    if (newItem.threshold === '' || isNaN(newItem.threshold) || Number(newItem.threshold) < 0)
      e.threshold = 'Enter a valid threshold (≥ 0)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleDialogOpen = (item = null) => {
    if (item) {
      setEditItem(item);
      setNewItem({ ...item });
    } else {
      setEditItem(null);
      setNewItem(emptyItem(categories[safeTab] || categories[0]));
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditItem(null);
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const item = {
      ...newItem,
      quantity: parseFloat(newItem.quantity),
      threshold: parseFloat(newItem.threshold)
    };
    if (editItem) {
      updateItem(item, editItem.category);
    } else {
      addItem(item);
    }
    handleDialogClose();
  };

  const handleDeleteConfirmed = () => {
    if (deleteConfirm) {
      deleteItem(deleteConfirm.id, deleteConfirm.category);
      setDeleteConfirm(null);
    }
  };

  const handleAddCategory = () => {
    const key = newCategoryName.toLowerCase().trim();
    if (!key) { setCategoryError('Category name is required'); return; }
    if (inventory[key]) { setCategoryError('Category already exists'); return; }
    addCategory(key);
    setNewCategoryName('');
    setCategoryError('');
    setCategoryDialog(false);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const categories = Object.keys(inventory);
  const safeTab = Math.min(currentTab, categories.length - 1);
  const currentCategory = categories[safeTab];

  return (
    <Box className="page-wrapper">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(102,126,234,0.2)', backdropFilter: 'blur(10px)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ borderBottom: '1px solid rgba(102,126,234,0.2)', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tabs
                value={safeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  flexGrow: 1,
                  '& .MuiTabs-indicator': { background: 'linear-gradient(90deg,#667eea,#f093fb)', height: 3, borderRadius: 2 },
                  '& .MuiTab-root': { fontWeight: 600, minHeight: 64 },
                }}
              >
                {categories.map((category, index) => (
                  <Tab
                    key={category}
                    icon={<Icon>{categoryIcons[category] || 'category'}</Icon>}
                    label={category.charAt(0).toUpperCase() + category.slice(1)}
                    value={index}
                    sx={{ minHeight: 64 }}
                  />
                ))}
              </Tabs>
              <Button
                variant="outlined" size="small"
                onClick={() => setCategoryDialog(true)}
                sx={{
                  whiteSpace: 'nowrap', flexShrink: 0,
                  borderColor: 'rgba(102,126,234,0.4)', color: '#667eea', borderRadius: 2,
                  '&:hover': { borderColor: '#667eea', background: 'rgba(102,126,234,0.1)' }
                }}
              >
                + New Category
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700} sx={{
                background: 'linear-gradient(135deg,#667eea,#f093fb)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>
                {currentCategory?.charAt(0).toUpperCase() + currentCategory?.slice(1)} ({(inventory[currentCategory] || []).length} items)
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleDialogOpen()}
                sx={{ borderRadius: 2 }}>
                Add New Item
              </Button>
            </Box>

            <Grid container spacing={2}>
              <AnimatePresence>
                {(inventory[currentCategory] || []).map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <MotionCard
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="inv-card"
                      sx={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transform: 'translateY(-4px)', transition: 'all 0.3s', border: '1px solid rgba(102,126,234,0.4)' }
                      }}
                    >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>{item.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
                            <IconButton onClick={() => handleDialogOpen(item)} size="small"
                              sx={{ '&:hover': { background: 'rgba(102,126,234,0.2)', color: '#667eea' } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => setDeleteConfirm(item)} size="small" color="error"
                              sx={{ '&:hover': { background: 'rgba(245,87,108,0.2)' } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip label={`${item.quantity} ${item.unit}`} size="small"
                            sx={{ background: 'rgba(102,126,234,0.2)', color: '#a78bfa', fontWeight: 600, fontSize: '0.75rem' }} />
                          <Chip label={`Min: ${item.threshold} ${item.unit}`} size="small" variant="outlined"
                            sx={{ borderColor: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }} />
                        </Box>
                        {item.expiryDate && (() => {
                          const days = Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000);
                          return (
                            <Alert severity={days <= 3 ? 'error' : days <= 7 ? 'warning' : 'info'} sx={{ mt: 1, py: 0.5, fontSize: '0.75rem', borderRadius: 2 }}>
                              {days <= 0 ? 'Expired!' : `Expires in ${days} day${days !== 1 ? 's' : ''}`}
                            </Alert>
                          );
                        })()}
                        {item.quantity <= item.threshold && (
                          <Alert severity="warning" sx={{ mt: 1, py: 0.5, borderRadius: 2, fontSize: '0.75rem' }}>Low stock</Alert>
                        )}
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="xs">
        <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name" value={newItem.name} fullWidth
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              error={!!errors.name} helperText={errors.name}
            />
            <TextField
              label="Quantity" type="number" value={newItem.quantity} fullWidth
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              error={!!errors.quantity} helperText={errors.quantity}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Unit" value={newItem.unit} fullWidth
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              error={!!errors.unit} helperText={errors.unit}
            />
            <TextField
              label="Threshold" type="number" value={newItem.threshold} fullWidth
              onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })}
              error={!!errors.threshold} helperText={errors.threshold}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Expiry Date (optional)" type="date" value={newItem.expiryDate || ''} fullWidth
              onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value || null })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Estimated Cost (₹)" type="number" value={newItem.estimatedCost || ''} fullWidth
              onChange={(e) => setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) || 0 })}
              inputProps={{ min: 0 }}
            />
            <TextField
              select label="Category" value={newItem.category} fullWidth
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editItem ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirmed} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={categoryDialog} onClose={() => { setCategoryDialog(false); setCategoryError(''); setNewCategoryName(''); }} fullWidth maxWidth="xs">
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name" value={newCategoryName} fullWidth autoFocus sx={{ mt: 2 }}
            onChange={(e) => setNewCategoryName(e.target.value)}
            error={!!categoryError} helperText={categoryError}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCategoryDialog(false); setCategoryError(''); setNewCategoryName(''); }}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default Inventory;
