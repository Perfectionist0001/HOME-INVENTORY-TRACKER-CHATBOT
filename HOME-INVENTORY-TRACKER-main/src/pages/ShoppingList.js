import React, { useState } from 'react';
import {
  Container, Typography, Box, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Checkbox, Button, Chip,
  Paper, Divider, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Alert, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';

const MotionListItem = motion(ListItem);

const ShoppingList = () => {
  const { shoppingList, toggleShoppingItem, removeFromShoppingList,
    clearShoppingList, autoGenerateShoppingList, addToShoppingList,
    budget, addExpense
  } = useInventory();

  const [addDialog, setAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', needed: 1, unit: '', estimatedCost: 0, category: 'groceries' });
  const [checkoutDialog, setCheckoutDialog] = useState(false);

  const totalEstimated = shoppingList.reduce((s, i) => s + (parseFloat(i.estimatedCost) || 0) * (parseFloat(i.needed) || 1), 0);
  const checkedCount = shoppingList.filter(i => i.checked).length;
  const progress = shoppingList.length ? (checkedCount / shoppingList.length) * 100 : 0;

  const handleAutoGenerate = () => {
    autoGenerateShoppingList();
  };

  const handleCheckout = () => {
    const checkedItems = shoppingList.filter(i => i.checked);
    const total = checkedItems.reduce((s, i) => s + (parseFloat(i.estimatedCost) || 0) * (parseFloat(i.needed) || 1), 0);
    addExpense(total, `Shopping - ${checkedItems.length} items`);
    checkedItems.forEach(i => removeFromShoppingList(i.id));
    setCheckoutDialog(false);
  };

  const handleAddManual = () => {
    if (!newEntry.name.trim()) return;
    addToShoppingList({ ...newEntry, id: Date.now() });
    setNewEntry({ name: '', needed: 1, unit: '', estimatedCost: 0, category: 'groceries' });
    setAddDialog(false);
  };

  const budgetLeft = budget.monthly - budget.spent;
  const overBudget = totalEstimated > budgetLeft;

  return (
    <Box className="page-wrapper">
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg,#667eea,#4facfe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(102,126,234,0.4)' }}>
          <ShoppingCartIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h4" fontWeight={800} sx={{
          background: 'linear-gradient(135deg,#667eea,#4facfe)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>Shopping List</Typography>
      </Box>

      {/* Budget Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Monthly Budget', value: `₹${budget.monthly}`, gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
          { label: 'Spent', value: `₹${budget.spent}`, gradient: 'linear-gradient(135deg,#f6d365,#fda085)' },
          { label: 'Remaining', value: `₹${budgetLeft}`, gradient: budgetLeft < 0 ? 'linear-gradient(135deg,#f5576c,#f093fb)' : 'linear-gradient(135deg,#43e97b,#38f9d7)' },
          { label: 'This List', value: `₹${totalEstimated.toFixed(0)}`, gradient: overBudget ? 'linear-gradient(135deg,#f5576c,#f093fb)' : 'linear-gradient(135deg,#4facfe,#00f2fe)' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Box sx={{
              p: 2, borderRadius: 3, textAlign: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
            }}>
              <Typography variant="caption" color="text.secondary" display="block">{s.label}</Typography>
              <Typography variant="h6" fontWeight={800} sx={{
                background: s.gradient, WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>{s.value}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {overBudget && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(246,211,101,0.3)' }}>
          This shopping list (₹{totalEstimated.toFixed(0)}) exceeds your remaining budget (₹{budgetLeft})!
        </Alert>
      )}

      {/* Progress */}
      {shoppingList.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{checkedCount} of {shoppingList.length} items collected</Typography>
            <Typography variant="body2">{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 2, height: 8,
            background: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#667eea,#4facfe)', borderRadius: 2 } }} />
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={handleAutoGenerate}>
          Auto-Generate from Low Stock
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAddDialog(true)}>
          Add Item
        </Button>
        {checkedCount > 0 && (
          <Button variant="contained" color="success" onClick={() => setCheckoutDialog(true)}>
            Checkout ({checkedCount} items)
          </Button>
        )}
        {shoppingList.length > 0 && (
          <Button variant="outlined" color="error" onClick={clearShoppingList}>Clear All</Button>
        )}
      </Box>

      {/* List */}
      <Paper variant="outlined" sx={{ borderRadius: 3, border: '1px solid rgba(102,126,234,0.2)', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
        {shoppingList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Your shopping list is empty.</Typography>
            <Typography variant="body2" color="text.secondary">Click "Auto-Generate" to add low-stock items.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            <AnimatePresence>
              {shoppingList.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {idx > 0 && <Divider />}
                  <MotionListItem
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    sx={{ opacity: item.checked ? 0.5 : 1 }}
                  >
                    <Checkbox checked={item.checked} onChange={() => toggleShoppingItem(item.id)} />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ textDecoration: item.checked ? 'line-through' : 'none' }}>
                            {item.name}
                          </Typography>
                          <Chip label={item.category} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={`Need: ${item.needed} ${item.unit || ''} · Est. ₹${((parseFloat(item.estimatedCost) || 0) * (parseFloat(item.needed) || 1)).toFixed(0)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeFromShoppingList(item.id)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </MotionListItem>
                </React.Fragment>
              ))}
            </AnimatePresence>
          </List>
        )}
      </Paper>

      {/* Add Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add to Shopping List</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Item Name" value={newEntry.name} fullWidth
              onChange={e => setNewEntry({ ...newEntry, name: e.target.value })} />
            <TextField label="Quantity Needed" type="number" value={newEntry.needed} fullWidth
              onChange={e => setNewEntry({ ...newEntry, needed: parseFloat(e.target.value) || 1 })} />
            <TextField label="Unit" value={newEntry.unit} fullWidth
              onChange={e => setNewEntry({ ...newEntry, unit: e.target.value })} />
            <TextField label="Estimated Cost (₹)" type="number" value={newEntry.estimatedCost} fullWidth
              onChange={e => setNewEntry({ ...newEntry, estimatedCost: parseFloat(e.target.value) || 0 })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddManual} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialog} onClose={() => setCheckoutDialog(false)}>
        <DialogTitle>Confirm Checkout</DialogTitle>
        <DialogContent>
          <Typography>
            Mark {checkedCount} items as purchased and add ₹{shoppingList.filter(i => i.checked).reduce((s, i) => s + (parseFloat(i.estimatedCost) || 0) * (parseFloat(i.needed) || 1), 0).toFixed(0)} to your spending?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialog(false)}>Cancel</Button>
          <Button onClick={handleCheckout} variant="contained" color="success">Confirm</Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default ShoppingList;
