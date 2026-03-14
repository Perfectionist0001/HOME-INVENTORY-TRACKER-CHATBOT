import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Badge, IconButton, Tooltip,
  Menu, MenuItem, Avatar, Divider, Box, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip,
  Drawer, List, ListItem
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ChatIcon from '@mui/icons-material/Chat';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const NAV_ITEMS = [
  { label: 'Home', icon: <HomeIcon />, path: '/' },
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Inventory', icon: <InventoryIcon />, path: '/inventory', badge: true },
  { label: 'Shopping', icon: <ShoppingCartIcon />, path: '/shopping' },
  { label: 'Expiry', icon: <AccessTimeIcon />, path: '/expiry' },
  { label: 'AI Chat', icon: <ChatIcon />, path: '/chatbot' },
];

const Navbar = ({ mode, toggleMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getLowStockItems, notifications, markNotifRead, clearNotifications, users, activeUser, switchUser, addUser } = useInventory();
  const lowStockCount = getLowStockItems().length;
  const unreadCount = notifications.filter(n => !n.read).length;

  const [notifAnchor, setNotifAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('👤');
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    const id = addUser(newUserName.trim(), newUserAvatar);
    switchUser(id);
    setNewUserName('');
    setAddUserDialog(false);
    setUserAnchor(null);
  };

  const AVATARS = ['👤', '👨', '👩', '👦', '👧', '🧑', '👴', '👵'];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(10,10,26,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(102,126,234,0.2)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        }}
      >
        <Toolbar sx={{ gap: 0.5 }}>
          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{ flexGrow: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea, #f093fb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 0 15px rgba(102,126,234,0.5)'
            }}>🏠</Box>
            <Typography variant="h6" fontWeight={800} sx={{
              background: 'linear-gradient(135deg, #667eea, #f093fb)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.5px'
            }}>
              SmartPantry AI
            </Typography>
          </Box>

          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <MotionButton
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                color="inherit"
                onClick={() => navigate(item.path)}
                startIcon={
                  item.badge
                    ? <Badge badgeContent={lowStockCount} color="error">{item.icon}</Badge>
                    : item.icon
                }
                sx={{
                  minWidth: 'auto', px: 1.5, py: 0.8,
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(102,126,234,0.25), rgba(240,147,251,0.15))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(102,126,234,0.4)' : '1px solid transparent',
                  color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.75)',
                  '&:hover': { color: 'white', background: 'rgba(102,126,234,0.15)' },
                  display: { xs: 'none', md: 'flex' },
                  transition: 'all 0.2s',
                }}
              >
                {item.label}
              </MotionButton>
            );
          })}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={e => setNotifAnchor(e.currentTarget)}
              sx={{ '&:hover': { background: 'rgba(102,126,234,0.2)' } }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User switcher */}
          <Tooltip title={`Logged in as ${activeUser?.name}`}>
            <IconButton
              color="inherit"
              onClick={e => setUserAnchor(e.currentTarget)}
              sx={{ '&:hover': { background: 'rgba(102,126,234,0.2)' } }}
            >
              <Avatar sx={{
                width: 30, height: 30, fontSize: 16,
                background: 'linear-gradient(135deg, #667eea, #f093fb)',
                boxShadow: '0 0 10px rgba(102,126,234,0.5)'
              }}>
                {activeUser?.avatar || '👤'}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Dark mode */}
          <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton
              color="inherit"
              onClick={toggleMode}
              sx={{ '&:hover': { background: 'rgba(102,126,234,0.2)' } }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Mobile hamburger */}
          <IconButton color="inherit" onClick={() => setMobileDrawer(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, '&:hover': { background: 'rgba(102,126,234,0.2)' } }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Notifications Menu */}
      <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)}
        PaperProps={{ sx: { width: 340, maxHeight: 400, background: '#12122a', border: '1px solid rgba(102,126,234,0.3)' } }}>
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
          {notifications.length > 0 && (
            <Button size="small" onClick={() => { clearNotifications(); setNotifAnchor(null); }}>Clear all</Button>
          )}
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
            <Typography color="text.secondary">All caught up!</Typography>
          </Box>
        ) : (
          notifications.slice(0, 15).map(n => (
            <MenuItem key={n.id} onClick={() => markNotifRead(n.id)}
              sx={{ opacity: n.read ? 0.6 : 1, whiteSpace: 'normal', alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ mt: 0.5 }}>
                <Chip size="small" color={n.type === 'success' ? 'success' : n.type === 'error' ? 'error' : 'info'}
                  label={n.type} sx={{ fontSize: '0.65rem' }} />
              </ListItemIcon>
              <ListItemText
                primary={n.message}
                secondary={new Date(n.time).toLocaleTimeString()}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </MenuItem>
          ))
        )}
      </Menu>

      {/* User Menu */}
      <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}
        PaperProps={{ sx: { width: 220, background: '#12122a', border: '1px solid rgba(102,126,234,0.3)' } }}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">Switch User</Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        {users.map(u => (
          <MenuItem key={u.id} selected={u.id === activeUser?.id}
            onClick={() => { switchUser(u.id); setUserAnchor(null); }}>
            <ListItemIcon>{u.avatar}</ListItemIcon>
            <ListItemText primary={u.name} />
            {u.id === activeUser?.id && <CheckCircleIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <MenuItem onClick={() => { setAddUserDialog(true); setUserAnchor(null); }}>
          <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Add User" />
        </MenuItem>
      </Menu>

      {/* Add User Dialog */}
      <Dialog open={addUserDialog} onClose={() => setAddUserDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { background: '#12122a', border: '1px solid rgba(102,126,234,0.3)' } }}>
        <DialogTitle>Add Family Member</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={newUserName} fullWidth sx={{ mt: 2, mb: 2 }}
            onChange={e => setNewUserName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddUser()} />
          <Typography variant="body2" sx={{ mb: 1 }}>Choose avatar:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {AVATARS.map(a => (
              <Box key={a} onClick={() => setNewUserAvatar(a)}
                sx={{ fontSize: 28, cursor: 'pointer', p: 0.5, borderRadius: 1,
                  border: 2, borderColor: newUserAvatar === a ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s' }}>
                {a}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileDrawer} onClose={() => setMobileDrawer(false)}
        PaperProps={{ sx: { width: 240, background: '#0d0d20', borderLeft: '1px solid rgba(102,126,234,0.2)' } }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{
            background: 'linear-gradient(135deg,#667eea,#f093fb)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', mb: 1
          }}>SmartPantry AI</Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1 }} />
          <List disablePadding>
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <Button fullWidth startIcon={
                    item.badge
                      ? <Badge badgeContent={lowStockCount} color="error">{item.icon}</Badge>
                      : item.icon
                  }
                    onClick={() => { navigate(item.path); setMobileDrawer(false); }}
                    sx={{
                      justifyContent: 'flex-start', px: 2, py: 1, borderRadius: 2,
                      background: isActive ? 'linear-gradient(135deg,rgba(102,126,234,0.25),rgba(240,147,251,0.15))' : 'transparent',
                      border: isActive ? '1px solid rgba(102,126,234,0.4)' : '1px solid transparent',
                      color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.75)',
                      '&:hover': { color: 'white', background: 'rgba(102,126,234,0.15)' },
                    }}>
                    {item.label}
                  </Button>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
