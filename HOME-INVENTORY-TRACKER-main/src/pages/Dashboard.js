import React, { useState } from 'react';
import {
  Container, Grid, Typography, Alert, Box, Button, Chip,
  LinearProgress, Tabs, Tab, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const MotionBox = motion(Box);
const COLORS = ['#667eea', '#f093fb', '#4facfe', '#f6d365', '#f5576c', '#43e97b'];

const STAT_CARDS = (totalItems, lowStock, expiring, totalCategories, totalValue, budgetUsed) => [
  { label: 'Total Items', value: totalItems, icon: '📦', gradient: 'linear-gradient(135deg,#667eea,#764ba2)', route: '/inventory' },
  { label: 'Low Stock', value: lowStock, icon: '⚠️', gradient: 'linear-gradient(135deg,#f5576c,#f093fb)', route: '/inventory' },
  { label: 'Expiring Soon', value: expiring, icon: '⏳', gradient: 'linear-gradient(135deg,#f6d365,#fda085)', route: '/expiry' },
  { label: 'Categories', value: totalCategories, icon: '🗂️', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', route: '/inventory' },
  { label: 'Inventory Value', value: `₹${totalValue}`, icon: '💰', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', route: '/inventory' },
  { label: 'Budget Used', value: `${Math.min(100, budgetUsed).toFixed(0)}%`, icon: '💳', gradient: 'linear-gradient(135deg,#764ba2,#667eea)', route: '/shopping' },
];

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { inventory, getLowStockItems, getExpiringItems, budget, updateBudget } = useInventory();
  const lowStockItems = getLowStockItems();
  const expiringItems = getExpiringItems(7);
  const [tab, setTab] = useState(0);
  const [budgetDialog, setBudgetDialog] = useState(false);
  const [newBudget, setNewBudget] = useState('');

  const allItems = Object.values(inventory).flat();
  const totalItems = allItems.length;
  const totalCategories = Object.keys(inventory).length;
  const totalValue = allItems.reduce((s, i) => s + (i.estimatedCost || 0) * i.quantity, 0).toFixed(0);
  const budgetUsed = budget.monthly > 0 ? (budget.spent / budget.monthly) * 100 : 0;

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };

  const getCategoryData = () => {
    const labels = Object.keys(inventory).map(c => c.charAt(0).toUpperCase() + c.slice(1));
    return {
      labels,
      datasets: [{ data: Object.values(inventory).map(items => items.length),
        backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 0, hoverOffset: 8 }]
    };
  };

  const getQuantityData = () => {
    const labels = [], data = [], bgColors = [];
    Object.entries(inventory).forEach(([, items], ci) => {
      items.forEach(item => {
        labels.push(item.name);
        data.push(item.quantity);
        bgColors.push(item.quantity <= item.threshold ? '#f5576c' : COLORS[ci % COLORS.length]);
      });
    });
    return { labels, datasets: [{ label: 'Quantity', data, backgroundColor: bgColors, borderRadius: 6 }] };
  };

  const getSpendingData = () => {
    const history = budget.history.slice(-12);
    return {
      labels: history.map(h => new Date(h.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Spending (₹)', data: history.map(h => h.amount),
        borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.15)',
        fill: true, tension: 0.4, pointBackgroundColor: '#667eea', pointRadius: 5
      }]
    };
  };

  const statsCards = STAT_CARDS(totalItems, lowStockItems.length, expiringItems.length, totalCategories, totalValue, budgetUsed);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } } },
      tooltip: { backgroundColor: 'rgba(10,10,26,0.9)', borderColor: 'rgba(102,126,234,0.4)', borderWidth: 1 } },
    scales: { x: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true } }
  };

  return (
    <Box className="page-wrapper">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={3}>

            {/* Stat Cards */}
            {statsCards.map((s, i) => (
              <Grid item xs={6} sm={4} md={2} key={s.label}>
                <MotionBox
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.03 }}
                  onClick={() => navigate(s.route)}
                  sx={{
                    p: 2.5, textAlign: 'center', cursor: 'pointer', borderRadius: 3,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s',
                    '&:hover': { boxShadow: '0 10px 30px rgba(0,0,0,0.4)', border: '1px solid rgba(102,126,234,0.4)' }
                  }}
                >
                  <Typography fontSize={28}>{s.icon}</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{
                    background: s.gradient, WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                  }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                </MotionBox>
              </Grid>
            ))}

            {/* Budget Bar */}
            <Grid item xs={12}>
              <MotionBox variants={cardVariants} sx={{
                p: 2.5, borderRadius: 3,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(102,126,234,0.2)',
                backdropFilter: 'blur(10px)',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon sx={{ color: '#43e97b' }} />
                    <Typography variant="h6" fontWeight={700}>Monthly Budget</Typography>
                  </Box>
                  <Button size="small" variant="outlined" onClick={() => { setNewBudget(String(budget.monthly)); setBudgetDialog(true); }}
                    sx={{ borderColor: 'rgba(102,126,234,0.4)', color: '#667eea' }}>Set Budget</Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Spent: <strong style={{ color: '#f5576c' }}>₹{budget.spent}</strong></Typography>
                  <Typography variant="body2" color="text.secondary">Budget: <strong style={{ color: '#43e97b' }}>₹{budget.monthly}</strong></Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min(100, budgetUsed)}
                  sx={{ height: 10, borderRadius: 5,
                    background: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: budgetUsed > 90 ? 'linear-gradient(90deg,#f5576c,#f093fb)' :
                        budgetUsed > 70 ? 'linear-gradient(90deg,#f6d365,#fda085)' :
                        'linear-gradient(90deg,#43e97b,#38f9d7)',
                      borderRadius: 5,
                    }
                  }} />
                {budgetUsed > 90 && <Alert severity="error" sx={{ mt: 1.5, py: 0, borderRadius: 2 }}>Budget almost exhausted!</Alert>}
              </MotionBox>
            </Grid>

            {/* Tabs */}
            <Grid item xs={12}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 600 },
                  '& .MuiTabs-indicator': { background: 'linear-gradient(90deg,#667eea,#f093fb)', height: 3, borderRadius: 2 } }}>
                <Tab label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <WarningIcon fontSize="small" /> Alerts
                  {(lowStockItems.length + expiringItems.length) > 0 && (
                    <Chip size="small" label={lowStockItems.length + expiringItems.length} color="error" />
                  )}
                </Box>} />
                <Tab label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><TrendingUpIcon fontSize="small" /> Charts</Box>} />
                <Tab label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><AccessTimeIcon fontSize="small" /> Spending</Box>} />
              </Tabs>

              {/* Alerts Tab */}
              {tab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MotionBox variants={cardVariants} sx={{ p: 2.5, borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,87,108,0.2)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="h6" fontWeight={700}>⚠️ Low Stock</Typography>
                        {lowStockItems.length > 0 && <Button size="small" onClick={() => navigate('/inventory')}>Manage</Button>}
                      </Box>
                      {lowStockItems.length === 0 ? (
                        <Alert severity="success" sx={{ borderRadius: 2 }}>All items well stocked!</Alert>
                      ) : lowStockItems.map(item => (
                        <Alert key={item.id} severity="warning" sx={{ mb: 1, borderRadius: 2 }}
                          action={<Button size="small" color="warning" onClick={() => navigate('/shopping')}>Add to List</Button>}>
                          <strong>{item.name}</strong> — {item.quantity} {item.unit} left
                        </Alert>
                      ))}
                    </MotionBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MotionBox variants={cardVariants} sx={{ p: 2.5, borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(246,211,101,0.2)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="h6" fontWeight={700}>⏳ Expiring Soon</Typography>
                        {expiringItems.length > 0 && <Button size="small" onClick={() => navigate('/expiry')}>View All</Button>}
                      </Box>
                      {expiringItems.length === 0 ? (
                        <Alert severity="success" sx={{ borderRadius: 2 }}>No items expiring soon!</Alert>
                      ) : expiringItems.map(item => (
                        <Alert key={item.id} severity={item.daysLeft <= 3 ? 'error' : 'warning'} sx={{ mb: 1, borderRadius: 2 }}>
                          <strong>{item.name}</strong> — {item.daysLeft <= 0 ? 'Expired!' : `${item.daysLeft} day(s) left`}
                        </Alert>
                      ))}
                    </MotionBox>
                  </Grid>
                </Grid>
              )}

              {/* Charts Tab */}
              {tab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <MotionBox variants={cardVariants} sx={{ p: 2.5, height: 380, borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(102,126,234,0.2)' }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>Category Distribution</Typography>
                      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pie data={getCategoryData()} options={{ onClick: () => navigate('/inventory'),
                          plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} items` } },
                            legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } } } } }} />
                      </Box>
                    </MotionBox>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <MotionBox variants={cardVariants} sx={{ p: 2.5, height: 380, borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(102,126,234,0.2)' }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Quantity Overview <Typography component="span" variant="caption" sx={{ color: '#f5576c' }}>(red = below threshold)</Typography>
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar data={getQuantityData()} options={{ ...chartOptions, onClick: () => navigate('/inventory') }} />
                      </Box>
                    </MotionBox>
                  </Grid>
                </Grid>
              )}

              {/* Spending Tab */}
              {tab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <MotionBox variants={cardVariants} sx={{ p: 2.5, height: 350, borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(102,126,234,0.2)' }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>💳 Spending History</Typography>
                      {budget.history.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="text.secondary">No spending recorded yet.</Typography>
                          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/shopping')}>Go to Shopping List</Button>
                        </Box>
                      ) : (
                        <Box sx={{ height: 270 }}>
                          <Line data={getSpendingData()} options={chartOptions} />
                        </Box>
                      )}
                    </MotionBox>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </motion.div>

        {/* Budget Dialog */}
        <Dialog open={budgetDialog} onClose={() => setBudgetDialog(false)} maxWidth="xs" fullWidth
          PaperProps={{ sx: { background: '#12122a', border: '1px solid rgba(102,126,234,0.3)' } }}>
          <DialogTitle>Set Monthly Budget</DialogTitle>
          <DialogContent>
            <TextField label="Monthly Budget (₹)" type="number" value={newBudget} fullWidth sx={{ mt: 2 }}
              onChange={e => setNewBudget(e.target.value)} inputProps={{ min: 0 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBudgetDialog(false)}>Cancel</Button>
            <Button onClick={() => { updateBudget(parseFloat(newBudget) || 0); setBudgetDialog(false); }} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
