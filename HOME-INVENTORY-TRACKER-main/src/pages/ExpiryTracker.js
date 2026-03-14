import React, { useState } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent,
  Chip, LinearProgress, Alert, Button, Tabs, Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useInventory } from '../context/InventoryContext';
import { useNavigate } from 'react-router-dom';

const MotionCard = motion(Card);

const ExpiryTracker = () => {
  const { getExpiringItems } = useInventory();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const expiring3 = getExpiringItems(3);
  const expiring7 = getExpiringItems(7);
  const expiring30 = getExpiringItems(30);
  const allWithExpiry = getExpiringItems(3650); // all items with expiry dates, including expired

  const getColor = (days) => {
    if (days <= 0) return 'error';
    if (days <= 3) return 'error';
    if (days <= 7) return 'warning';
    return 'success';
  };

  const getProgress = (days) => {
    if (days <= 0) return 100;
    if (days >= 30) return 5;
    // Scale: 1 day = ~97%, 7 days = ~77%, 14 days = ~53%, 30 days = 5%
    return Math.max(5, Math.round(100 - (days / 30) * 95));
  };

  const lists = [expiring3, expiring7, expiring30, allWithExpiry];
  const labels = ['Expires in 3 days', 'Expires in 7 days', 'Expires in 30 days', 'All tracked items'];

  return (
    <Box className="page-wrapper">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg,#f6d365,#fda085)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(246,211,101,0.4)' }}>
          <AccessTimeIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h4" fontWeight={800} sx={{
          background: 'linear-gradient(135deg,#f6d365,#fda085)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>Expiry Date Tracker</Typography>
      </Box>

      {expiring3.length > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(245,87,108,0.3)' }} icon={<WarningIcon />}>
          <strong>{expiring3.length} item(s)</strong> expiring within 3 days! Check them immediately.
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3,
        '& .MuiTabs-indicator': { background: 'linear-gradient(90deg,#f6d365,#fda085)', height: 3, borderRadius: 2 },
        '& .MuiTab-root': { fontWeight: 600 } }}>
        {labels.map((l, i) => (
          <Tab key={l} label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {l}
              {lists[i].length > 0 && (
                <Chip label={lists[i].length} size="small"
                  color={i === 0 ? 'error' : i === 1 ? 'warning' : 'default'} />
              )}
            </Box>
          } />
        ))}
      </Tabs>

      {lists[tab].length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No items in this range</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {lists[tab].map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                sx={{
                  border: '2px solid',
                  borderColor: `${getColor(item.daysLeft)}.main`,
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'all 0.3s' }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{item.name}</Typography>
                    <Chip
                      label={item.daysLeft <= 0 ? 'EXPIRED' : `${item.daysLeft}d left`}
                      color={getColor(item.daysLeft)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Category: {item.category} · Qty: {item.quantity} {item.unit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgress(item.daysLeft)}
                    color={getColor(item.daysLeft)}
                    sx={{ borderRadius: 1, height: 6 }}
                  />
                  {item.daysLeft <= 1 && (
                    <Alert severity="error" sx={{ mt: 1, py: 0, fontSize: '0.75rem' }}>
                      {item.daysLeft <= 0 ? 'This item has expired!' : 'Use today!'}
                    </Alert>
                  )}
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/inventory')}
            sx={{ borderColor: 'rgba(246,211,101,0.4)', color: '#f6d365', borderRadius: 3,
              '&:hover': { borderColor: '#f6d365', background: 'rgba(246,211,101,0.1)' } }}>
            Update Expiry Dates in Inventory
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ExpiryTracker;
