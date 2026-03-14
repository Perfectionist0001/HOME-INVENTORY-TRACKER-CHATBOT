import React from 'react';
import { Container, Typography, Button, Box, Grid, Paper, Alert, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#f6d365', '#f5576c', '#43e97b'];

const FEATURES = [
  { icon: '📦', title: 'Smart Inventory', desc: 'Track all household items with categories, thresholds & expiry dates', route: '/inventory', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Chat with Gemini AI for restocking tips, recipes & predictions', route: '/chatbot', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { icon: '📷', title: 'Image Recognition', desc: 'Scan products with your camera — AI identifies and adds them', route: '/chatbot', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { icon: '🎤', title: 'Voice Commands', desc: 'Speak to add items or ask questions hands-free', route: '/chatbot', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { icon: '🔍', title: 'Barcode Scanner', desc: 'Scan any product barcode to instantly identify and add it', route: '/chatbot', gradient: 'linear-gradient(135deg,#f6d365,#fda085)' },
  { icon: '⏳', title: 'Expiry Tracking', desc: 'Never waste food — get alerts before items expire', route: '/expiry', gradient: 'linear-gradient(135deg,#f5576c,#f093fb)' },
  { icon: '🛒', title: 'Smart Shopping', desc: 'Auto-generate lists from low stock with budget estimates', route: '/shopping', gradient: 'linear-gradient(135deg,#667eea,#4facfe)' },
  { icon: '📊', title: 'Analytics', desc: 'Spending trends, usage predictions & category insights', route: '/dashboard', gradient: 'linear-gradient(135deg,#764ba2,#667eea)' },
  { icon: '👨‍👩‍👧', title: 'Multi-User', desc: 'Separate inventory profiles for each family member', route: '/', gradient: 'linear-gradient(135deg,#f6d365,#43e97b)' },
];

// Floating particle component
const Particle = ({ style }) => (
  <Box className="particle" sx={{ width: style.size, height: style.size, left: style.left, animationDuration: style.duration, animationDelay: style.delay }} />
);

const Home = () => {
  const navigate = useNavigate();
  const { inventory, getLowStockItems, getExpiringItems, budget, shoppingList } = useInventory();
  const lowStockItems = getLowStockItems();
  const expiringItems = getExpiringItems(3);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } };

  const particles = Array.from({ length: 12 }, (_, i) => ({
    size: `${Math.random() * 20 + 8}px`,
    left: `${(i / 12) * 100}%`,
    duration: `${Math.random() * 8 + 6}s`,
    delay: `${Math.random() * 5}s`,
  }));

  const getCategoryData = () => {
    const labels = Object.keys(inventory).map(c => c.charAt(0).toUpperCase() + c.slice(1));
    return {
      labels,
      datasets: [{ data: Object.values(inventory).map(i => i.length),
        backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 0,
        hoverOffset: 8,
      }]
    };
  };

  const stats = [
    { label: 'Total Items', value: Object.values(inventory).flat().length, icon: '📦', route: '/inventory', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
    { label: 'Low Stock', value: lowStockItems.length, icon: '⚠️', route: '/inventory', gradient: 'linear-gradient(135deg,#f5576c,#f093fb)', alert: lowStockItems.length > 0 },
    { label: 'Expiring Soon', value: expiringItems.length, icon: '⏳', route: '/expiry', gradient: 'linear-gradient(135deg,#f6d365,#fda085)', alert: expiringItems.length > 0 },
    { label: 'Categories', value: Object.keys(inventory).length, icon: '🗂️', route: '/inventory', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
    { label: 'Budget Left', value: `₹${budget.monthly - budget.spent}`, icon: '💰', route: '/shopping', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
    { label: 'Shopping Items', value: shoppingList.length, icon: '🛒', route: '/shopping', gradient: 'linear-gradient(135deg,#764ba2,#667eea)' },
  ];

  return (
    <Box className="page-wrapper">
      <Container maxWidth="lg">
        <MotionBox variants={containerVariants} initial="hidden" animate="visible" sx={{ py: 4 }}>

          {/* Hero */}
          <MotionBox variants={itemVariants} sx={{
            textAlign: 'center',
            py: { xs: 7, md: 11 },
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            borderRadius: 4,
            color: 'white',
            mb: 5,
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(102,126,234,0.3)',
            boxShadow: '0 0 60px rgba(102,126,234,0.2)',
          }}>
            {/* Particles */}
            <Box className="particles-container">
              {particles.map((p, i) => <Particle key={i} style={p} />)}
            </Box>

            {/* Glow orbs */}
            <Box sx={{ position: 'absolute', top: '20%', left: '10%', width: 200, height: 200,
              borderRadius: '50%', background: 'rgba(102,126,234,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: '20%', right: '10%', width: 200, height: 200,
              borderRadius: '50%', background: 'rgba(240,147,251,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Chip label="✨ AI-Powered · Gemini 2.0" size="small"
                sx={{ mb: 3, background: 'rgba(102,126,234,0.3)', color: 'white', border: '1px solid rgba(102,126,234,0.5)', fontWeight: 600 }} />
              <Typography variant="h2" fontWeight={800} gutterBottom sx={{
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #f093fb 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                lineHeight: 1.1, mb: 2,
              }}>
                🏠 SmartPantry AI
              </Typography>
              <Typography variant="h5" sx={{ mb: 1.5, opacity: 0.85, fontWeight: 400 }}>
                AI-Powered Smart Home Inventory Management
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.6, maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}>
                Camera scanning · Voice commands · Barcode detection · Expiry tracking · Recipe suggestions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => navigate('/dashboard')}
                  sx={{ px: 4, py: 1.5, fontWeight: 700, borderRadius: 3,
                    background: 'linear-gradient(135deg,#667eea,#764ba2)',
                    boxShadow: '0 0 30px rgba(102,126,234,0.5)',
                    '&:hover': { boxShadow: '0 0 40px rgba(102,126,234,0.8)', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s' }}>
                  🚀 Get Started
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/chatbot')}
                  sx={{ px: 4, py: 1.5, borderRadius: 3, borderColor: 'rgba(240,147,251,0.6)', color: '#f093fb',
                    '&:hover': { borderColor: '#f093fb', background: 'rgba(240,147,251,0.1)', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s' }}>
                  🤖 Try AI Chat
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/inventory')}
                  sx={{ px: 4, py: 1.5, borderRadius: 3, borderColor: 'rgba(79,172,254,0.6)', color: '#4facfe',
                    '&:hover': { borderColor: '#4facfe', background: 'rgba(79,172,254,0.1)', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s' }}>
                  📦 View Inventory
                </Button>
              </Box>
            </Box>
          </MotionBox>

          {/* Urgent Alerts */}
          {(lowStockItems.length > 0 || expiringItems.length > 0) && (
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                {lowStockItems.slice(0, 3).map(item => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Alert severity="warning" action={
                      <Chip label={`${item.quantity} ${item.unit}`} color="warning" size="small"
                        onClick={() => navigate('/shopping')} sx={{ cursor: 'pointer' }} />
                    } sx={{ borderRadius: 2, border: '1px solid rgba(246,211,101,0.3)' }}>
                      <strong>{item.name}</strong> is running low
                    </Alert>
                  </Grid>
                ))}
                {expiringItems.slice(0, 2).map(item => (
                  <Grid item xs={12} md={6} key={`exp-${item.id}`}>
                    <Alert severity="error" action={
                      <Button size="small" color="error" onClick={() => navigate('/expiry')}>View</Button>
                    } sx={{ borderRadius: 2, border: '1px solid rgba(245,87,108,0.3)' }}>
                      <strong>{item.name}</strong> expires in {item.daysLeft <= 0 ? 'today!' : `${item.daysLeft} day(s)`}
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </MotionBox>
          )}

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 5 }}>
            {stats.map((s, i) => (
              <Grid item xs={6} sm={4} md={2} key={i}>
                <MotionBox
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.03 }}
                  onClick={() => navigate(s.route)}
                  sx={{
                    p: 2.5, textAlign: 'center', cursor: 'pointer', borderRadius: 3,
                    background: 'rgba(255,255,255,0.04)',
                    border: s.alert ? '1px solid rgba(245,87,108,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s',
                    '&:hover': { boxShadow: `0 10px 30px rgba(0,0,0,0.3)`, border: '1px solid rgba(102,126,234,0.4)' }
                  }}
                >
                  <Typography fontSize={30} sx={{ mb: 0.5 }}>{s.icon}</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{
                    background: s.gradient, WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                  }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>

          {/* Chart + Features */}
          <Grid container spacing={4} sx={{ mb: 5 }}>
            <Grid item xs={12} md={4}>
              <MotionPaper variants={itemVariants} sx={{
                p: 3, height: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(102,126,234,0.2)',
                backdropFilter: 'blur(10px)',
              }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{
                  background: 'linear-gradient(135deg,#667eea,#f093fb)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>Category Distribution</Typography>
                <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pie data={getCategoryData()} options={{
                    onClick: () => navigate('/inventory'),
                    plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} items` } },
                      legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } } } }
                  }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Click to manage inventory
                </Typography>
              </MotionPaper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{
                background: 'linear-gradient(135deg,#667eea,#f093fb)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>✨ Features</Typography>
              <Grid container spacing={2}>
                {FEATURES.map((f, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <MotionBox
                      variants={itemVariants}
                      whileHover={{ y: -4, scale: 1.02 }}
                      onClick={() => navigate(f.route)}
                      sx={{
                        p: 2, display: 'flex', gap: 2, alignItems: 'flex-start',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 3, cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          border: '1px solid rgba(102,126,234,0.4)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                          background: 'rgba(102,126,234,0.08)',
                        }
                      }}
                    >
                      <Box sx={{
                        width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                        background: f.gradient, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 20,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                      }}>{f.icon}</Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{f.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>{f.desc}</Typography>
                      </Box>
                    </MotionBox>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

        </MotionBox>
      </Container>
    </Box>
  );
};

export default Home;
