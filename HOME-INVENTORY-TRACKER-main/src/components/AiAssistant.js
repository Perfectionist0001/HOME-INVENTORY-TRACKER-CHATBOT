import React, { useState } from 'react';
import { Fab, Dialog, IconButton, Box, Slide, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBot from '../pages/ChatBot';

const MotionFab = motion(Fab);

const AiAssistant = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <Tooltip title="Open AI Assistant" placement="left">
            <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
              {/* Pulse rings */}
              <Box sx={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                border: '2px solid rgba(102,126,234,0.4)',
                animation: 'pulseRing 2s ease-out infinite',
              }} />
              <Box sx={{
                position: 'absolute', inset: -16, borderRadius: '50%',
                border: '2px solid rgba(102,126,234,0.2)',
                animation: 'pulseRing 2s ease-out infinite',
                animationDelay: '0.4s',
              }} />
              <MotionFab
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => setOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea, #f093fb)',
                  boxShadow: '0 0 30px rgba(102,126,234,0.6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2, #667eea)',
                    boxShadow: '0 0 40px rgba(102,126,234,0.9)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                <SmartToyIcon sx={{ color: 'white' }} />
              </MotionFab>
            </Box>
          </Tooltip>
        )}
      </AnimatePresence>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            position: 'fixed', bottom: 32, right: 32, m: 0,
            width: { xs: 'calc(100% - 32px)', sm: 420 },
            height: 620, borderRadius: 3, overflow: 'hidden',
            background: 'rgba(10,10,26,0.95)',
            border: '1px solid rgba(102,126,234,0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(102,126,234,0.3)',
          }
        }}
      >
        <Box sx={{ position: 'relative', height: '100%' }}>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute', right: 8, top: 8, zIndex: 10,
              background: 'rgba(255,255,255,0.1)',
              '&:hover': { background: 'rgba(245,87,108,0.2)', color: '#f5576c' }
            }}
          >
            <CloseIcon />
          </IconButton>
          <ChatBot isDialog={true} />
        </Box>
      </Dialog>
    </>
  );
};

export default AiAssistant;
