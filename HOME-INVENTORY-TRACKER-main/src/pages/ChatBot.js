import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Avatar
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { useInventory } from '../context/InventoryContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const ChatBot = ({ isDialog = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Replace 'YOUR_API_KEY' with the actual Gemini API key
  const API_KEY = 'AIzaSyDq1ABIMPBz_xVtdXf5ItiRTyQ00hcFxyo';
  const { inventory, getLowStockItems } = useInventory();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage) => {

    try {
      const inventoryContext = JSON.stringify({
        inventory,
        lowStockItems: getLowStockItems()
      });

      const prompt = `
        You are an AI assistant for a home inventory management system.
        Current inventory context: ${inventoryContext}
        
        User message: ${userMessage}
        
        Provide helpful suggestions about:
        1. Which items need to be restocked
        2. Recommendations for optimal quantities
        3. Shopping suggestions based on current inventory
        4. Answer any other inventory-related questions
        
        Keep responses concise and practical.
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: text
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure your API key is valid.'
      }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    await generateAIResponse(userMessage);
    setIsLoading(false);
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: isDialog ? 0 : 4, mb: isDialog ? 0 : 4, height: '100%' }}>
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ 
          height: isDialog ? '100%' : 'calc(100vh - 140px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >


        {/* Chat Messages */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <MotionBox
                key={index}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main'
                  }}
                >
                  {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper'
                  }}
                >
                  <Typography>{message.content}</Typography>
                </Paper>
              </MotionBox>
            ))}
          </AnimatePresence>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            gap: 1
          }}
        >
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
          />
          <Button 
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={!input.trim() || isLoading}
          >
            Send
          </Button>
        </Box>
      </MotionPaper>
    </Container>
  );
};

export default ChatBot;
