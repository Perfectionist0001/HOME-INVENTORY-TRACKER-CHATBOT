import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  IconButton,
  Box,
  Slide,
  useTheme
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBot from '../pages/ChatBot';

const MotionFab = motion(Fab);

const AiAssistant = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <MotionFab
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            color="primary"
            onClick={handleToggle}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 1000,
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s'
            }}
          >
            <SmartToyIcon />
          </MotionFab>
        )}
      </AnimatePresence>

      <Dialog
        open={open}
        onClose={handleToggle}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            position: 'fixed',
            bottom: 32,
            right: 32,
            m: 0,
            width: { xs: 'calc(100% - 32px)', sm: 400 },
            height: 600,
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ position: 'relative', height: '100%' }}>
          <IconButton
            onClick={handleToggle}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1
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
