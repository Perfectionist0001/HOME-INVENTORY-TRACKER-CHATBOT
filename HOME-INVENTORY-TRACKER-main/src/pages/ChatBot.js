import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container, Paper, TextField, Button, Box, Typography,
  Avatar, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useInventory } from '../context/InventoryContext';

const MotionBox = motion(Box);

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const API_KEY_VALID = API_KEY && API_KEY.trim().length > 10;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const QUICK_PROMPTS = [
  'What items are running low?',
  'Give me a shopping list',
  'What can I cook with my ingredients?',
  'What expires soon?',
  'How many items do I have?',
  'Show my categories',
];

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm SmartPantry AI 🤖\n\nI can help you:\n• 📦 Check inventory & low stock\n• 🛒 Generate shopping lists\n• 🍳 Suggest recipes from your ingredients\n• ⏳ Track expiring items\n• 📊 Show inventory stats\n• 📷 Scan items with camera\n• 🎤 Voice commands\n\nTry a quick prompt below or ask me anything!"
};

// ── Local Intelligence Engine ──────────────────────────────────────────────
// Handles common queries without any API call
function localAnswer(userMessage, inventory, getLowStockItems, getExpiringItems) {
  const q = userMessage.toLowerCase().trim();
  const allItems = Object.values(inventory).flat();
  const categories = Object.keys(inventory);
  const lowStock = getLowStockItems();
  const expiring7 = getExpiringItems(7);
  const expiring3 = getExpiringItems(3);

  // How many items
  if (/how many.*(item|product|thing)/i.test(q) || q === 'count' || q === 'total') {
    return `📦 You have **${allItems.length}** items across **${categories.length}** categories:\n${categories.map(c => `• ${c.charAt(0).toUpperCase()+c.slice(1)}: ${inventory[c].length} items`).join('\n')}`;
  }

  // Show categories
  if (/categor|section|group/i.test(q)) {
    return `🗂️ Your **${categories.length}** categories:\n${categories.map(c => `• ${c.charAt(0).toUpperCase()+c.slice(1)} (${inventory[c].length} items)`).join('\n')}`;
  }

  // Low stock
  if (/low.?stock|running.?low|need.?restock|reorder|out.?of/i.test(q)) {
    if (lowStock.length === 0) return '✅ Great news! All items are well stocked. Nothing needs restocking right now.';
    return `⚠️ **${lowStock.length} item(s) running low:**\n${lowStock.map(i => `• ${i.name}: ${i.quantity} ${i.unit} (min: ${i.threshold} ${i.unit})`).join('\n')}\n\n💡 Go to Shopping List to add these automatically.`;
  }

  // Shopping list suggestion
  if (/shopping.?list|what.*buy|need.*buy|buy.*list|purchase/i.test(q)) {
    if (lowStock.length === 0) return '✅ Nothing needs buying right now — all items are above their thresholds!';
    const total = lowStock.reduce((s, i) => s + (i.estimatedCost || 0) * Math.max(1, i.threshold * 2 - i.quantity), 0);
    return `🛒 **Suggested shopping list (${lowStock.length} items):**\n${lowStock.map(i => `• ${i.name} — need ~${Math.max(1, i.threshold * 2 - i.quantity)} ${i.unit} (₹${i.estimatedCost || 0} each)`).join('\n')}\n\n💰 Estimated total: ₹${total.toFixed(0)}\n\n💡 Click "Auto-Generate" on the Shopping List page to add these automatically.`;
  }

  // Expiry
  if (/expir|expire|spoil|fresh|use.*by|best.*before/i.test(q)) {
    if (expiring7.length === 0) return '✅ No items expiring in the next 7 days. Your pantry is fresh!';
    const expired = expiring7.filter(i => i.daysLeft <= 0);
    const soon = expiring7.filter(i => i.daysLeft > 0 && i.daysLeft <= 3);
    const week = expiring7.filter(i => i.daysLeft > 3);
    let msg = `⏳ **Expiry Report:**\n`;
    if (expired.length) msg += `\n🔴 **Expired (${expired.length}):**\n${expired.map(i => `• ${i.name} — EXPIRED`).join('\n')}`;
    if (soon.length) msg += `\n🟠 **Expiring in 1-3 days (${soon.length}):**\n${soon.map(i => `• ${i.name} — ${i.daysLeft} day(s) left`).join('\n')}`;
    if (week.length) msg += `\n🟡 **Expiring this week (${week.length}):**\n${week.map(i => `• ${i.name} — ${i.daysLeft} days left`).join('\n')}`;
    return msg;
  }

  // Inventory summary / what do I have
  if (/what.*have|show.*inventory|list.*item|all.*item|inventory.*summary|my.*stock/i.test(q)) {
    if (allItems.length === 0) return '📦 Your inventory is empty. Add items from the Inventory page!';
    return `📦 **Your Inventory (${allItems.length} items):**\n${categories.map(c => `\n**${c.charAt(0).toUpperCase()+c.slice(1)}:**\n${inventory[c].map(i => `  • ${i.name}: ${i.quantity} ${i.unit}${i.quantity <= i.threshold ? ' ⚠️' : ''}`).join('\n')}`).join('\n')}`;
  }

  // Recipe / cook suggestions
  if (/cook|recipe|meal|food|eat|dish|make.*with|ingredient/i.test(q)) {
    const foodCategories = ['groceries', 'beverages', 'food', 'pantry', 'dairy', 'produce'];
    const available = allItems.filter(i => foodCategories.includes(i.category) && i.quantity > 0);
    const fallback = available.length === 0 ? allItems.filter(i => i.quantity > 0).slice(0, 10) : available;
    if (fallback.length === 0) return '🍳 No items found in your inventory. Add some food items first!';
    return `🍳 **Available ingredients (${fallback.length}):**\n${fallback.map(i => `• ${i.name} (${i.quantity} ${i.unit})`).join('\n')}\n\n💡 Based on these, you could make:\n• Rice dishes (if you have rice & spices)\n• Bread-based meals (sandwiches, toast)\n• Egg dishes (omelette, scrambled eggs)\n\n🤖 For personalized AI recipes, add a valid Gemini API key to your .env file!`;
  }

  // Budget
  if (/budget|spend|cost|money|price|₹|rupee/i.test(q)) {
    const totalValue = allItems.reduce((s, i) => s + (i.estimatedCost || 0) * i.quantity, 0);
    return `💰 **Inventory Value:** ₹${totalValue.toFixed(0)}\n\nFor budget tracking and spending history, visit the Dashboard or Shopping List page.`;
  }

  // Stats / dashboard
  if (/stat|analytic|dashboard|overview|summary|report/i.test(q)) {
    const totalValue = allItems.reduce((s, i) => s + (i.estimatedCost || 0) * i.quantity, 0);
    return `📊 **Inventory Overview:**\n• Total items: ${allItems.length}\n• Categories: ${categories.length}\n• Low stock: ${lowStock.length} item(s)\n• Expiring soon (7d): ${expiring7.length} item(s)\n• Expired: ${expiring3.filter(i => i.daysLeft <= 0).length} item(s)\n• Estimated value: ₹${totalValue.toFixed(0)}`;
  }

  // Help
  if (/help|what.*can.*you|command|feature/i.test(q)) {
    return `🤖 **I can answer questions like:**\n• "What items are running low?"\n• "Give me a shopping list"\n• "What expires soon?"\n• "How many items do I have?"\n• "Show my categories"\n• "What can I cook?"\n• "Show inventory summary"\n• "What's my budget?"\n\n📷 Use the camera/barcode buttons above to scan products!\n🎤 Use the mic button for voice input!`;
  }

  return null; // no local answer — try API
}

// ── Gemini API (fallback for complex queries) ──────────────────────────────
async function geminiText(prompt, retries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
        })
      });
      if (res.status === 429 || res.status === 503) {
        if (attempt < retries) { await new Promise(r => setTimeout(r, delayMs * attempt)); continue; }
        throw new Error('RATE_LIMIT');
      }
      if (res.status === 400) throw new Error('HTTP_400');
      if (res.status === 403) throw new Error('HTTP_403');
      if (res.status === 404) throw new Error('HTTP_404');
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('EMPTY_RESPONSE');
      return text;
    } catch (err) {
      if (['RATE_LIMIT','EMPTY_RESPONSE'].includes(err.message) || err.message.startsWith('HTTP_')) throw err;
      if (attempt < retries) { await new Promise(r => setTimeout(r, delayMs)); continue; }
      throw err;
    }
  }
}

async function geminiVision(base64Image, mimeType = 'image/jpeg') {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: 'Identify this product for a home inventory app. Return ONLY valid JSON, no markdown: { "name": "product name", "brand": "brand or empty string", "category": "one of: groceries/cleaning/electronics/beverages/personal/medicine", "unit": "kg/litre/bottle/pcs/etc", "suggestedQuantity": 1, "suggestedThreshold": 1 }' },
          { inline_data: { mime_type: mimeType, data: base64Image } }
        ]
      }],
      generationConfig: { maxOutputTokens: 256 }
    })
  });
  if (res.status === 429) throw new Error('RATE_LIMIT');
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('EMPTY_RESPONSE');
  return text;
}

const ChatBot = ({ isDialog = false }) => {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [addItemDialog, setAddItemDialog] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'ok' | 'quota' | 'error' | 'unknown'

  const { inventory, getLowStockItems, getExpiringItems, addItem } = useInventory();
  const messagesEndRef = useRef(null);
  const webcamRef = useRef(null);
  const barcodeWebcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const barcodeReaderRef = useRef(null);
  const barcodeScanInterval = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim() || isLoading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Try local answer first — works 100% of the time, no API needed
    const local = localAnswer(userMessage, inventory, getLowStockItems, getExpiringItems);
    if (local) {
      setMessages(prev => [...prev, { role: 'assistant', content: local }]);
      setIsLoading(false);
      return;
    }

    // If API quota is already known to be exhausted, give a helpful local fallback
    if (apiStatus === 'quota' || apiStatus === 'error' || !API_KEY_VALID) {
      setMessages(prev => [...prev, { role: 'assistant', content: `🤖 I can answer that, but ${!API_KEY_VALID ? 'no Gemini API key is configured' : 'the Gemini API quota is exhausted for today'}.\n\n💡 Try asking:\n• "What items are running low?"\n• "Give me a shopping list"\n• "What expires soon?"\n• "Show inventory summary"\n\nThese work without any API!` }]);
      setIsLoading(false);
      return;
    }

    // Fall back to Gemini API for complex queries
    try {
      const ctxSummary = Object.entries(inventory).map(([cat, items]) =>
        `${cat}: ${items.map(i => `${i.name}(${i.quantity}${i.unit})`).join(', ')}`
      ).join(' | ');
      const lowStock = getLowStockItems();
      const expiring = getExpiringItems(7);
      const lowStockSummary = lowStock.map(i => `${i.name}(${i.quantity}/${i.threshold}${i.unit})`).join(', ') || 'none';
      const expiringSummary = expiring.map(i => `${i.name}(${i.daysLeft}d)`).join(', ') || 'none';

      const prompt = `You are SmartPantry AI, a home inventory assistant. Be concise, helpful, and use emojis.
Inventory: ${ctxSummary}
Low stock: ${lowStockSummary}
Expiring soon (7d): ${expiringSummary}
User: ${userMessage}`;

      const text = await geminiText(prompt);
      setApiStatus('ok');
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (err) {
      let msg = '❌ Something went wrong. Please try again.';
      if (err.message === 'RATE_LIMIT') {
        setApiStatus('quota');
        msg = `⏳ **API quota exhausted** for today.\n\nDon't worry — I can still answer many questions locally! Try:\n• "What items are running low?"\n• "Give me a shopping list"\n• "What expires soon?"\n• "Show inventory summary"\n• "How many items do I have?"`;
      } else if (err.message === 'HTTP_403') {
        setApiStatus('error');
        msg = '🔑 API key invalid or expired. Please update REACT_APP_GEMINI_API_KEY in your .env file.';
      } else if (err.message === 'HTTP_400') {
        setApiStatus('error');
        msg = '⚠️ API key missing. Add REACT_APP_GEMINI_API_KEY to your .env file and restart the dev server.';
      } else if (err.message === 'HTTP_404') {
        setApiStatus('error');
        msg = '🔧 Model not found. The API key may not have access to this model.';
      } else if (err.message === 'EMPTY_RESPONSE') {
        msg = '🤔 Got an empty response. Try rephrasing your question.';
      }
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
    } finally { setIsLoading(false); }
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setMessages(prev => [...prev, { role: 'assistant', content: '🎤 Voice not supported in this browser. Try Chrome.' }]); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US';
    rec.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start(); setIsListening(true);
  };

  const captureAndAnalyze = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setScanLoading(true); setCameraOpen(false);
    try {
      const raw = await geminiVision(imageSrc.split(',')[1]);
      const jsonMatch = raw.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) throw new Error('No JSON');
      const product = JSON.parse(jsonMatch[0]);
      setAddItemDialog(product);
      setMessages(prev => [...prev, { role: 'assistant', content: `📷 Detected: ${product.brand ? product.brand + ' ' : ''}${product.name}\nCategory: ${product.category} · Unit: ${product.unit} · Suggested qty: ${product.suggestedQuantity}\n\nAdd to inventory?` }]);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: "📷 Couldn't identify the product. Try better lighting or a clearer photo." }]); }
    finally { setScanLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setScanLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const raw = await geminiVision(ev.target.result.split(',')[1], file.type);
        const jsonMatch = raw.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) throw new Error('No JSON');
        const product = JSON.parse(jsonMatch[0]);
        setAddItemDialog(product);
        setMessages(prev => [...prev, { role: 'assistant', content: `📷 Detected: ${product.brand ? product.brand + ' ' : ''}${product.name}\nCategory: ${product.category} · Unit: ${product.unit}\n\nAdd to inventory?` }]);
      } catch { setMessages(prev => [...prev, { role: 'assistant', content: "📷 Couldn't identify the product. Try a clearer image." }]); }
      finally { setScanLoading(false); }
    };
    reader.readAsDataURL(file); e.target.value = '';
  };

  const startBarcodeScanner = useCallback(() => {
    barcodeReaderRef.current = new BrowserMultiFormatReader();
    barcodeScanInterval.current = setInterval(async () => {
      if (!barcodeWebcamRef.current) return;
      const imageSrc = barcodeWebcamRef.current.getScreenshot(); if (!imageSrc) return;
      try {
        const img = new Image(); img.src = imageSrc;
        await new Promise(r => { img.onload = r; });
        const result = await barcodeReaderRef.current.decodeFromImageElement(img);
        if (result) {
          clearInterval(barcodeScanInterval.current); setBarcodeOpen(false);
          const barcode = result.getText();
          setMessages(prev => [...prev, { role: 'user', content: `Scanned barcode: ${barcode}` }]);
          setIsLoading(true);
          try {
            const text = await geminiText(`Barcode: ${barcode}. Identify this product. Return ONLY valid JSON (no markdown): { "name": "...", "brand": "...", "category": "groceries/cleaning/electronics/beverages/personal/medicine", "unit": "...", "suggestedQuantity": 1, "suggestedThreshold": 1 }`);
            const jsonMatch = text.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
              const product = JSON.parse(jsonMatch[0]);
              setAddItemDialog(product);
              setMessages(prev => [...prev, { role: 'assistant', content: `🔍 Barcode ${barcode} → ${product.brand ? product.brand + ' ' : ''}${product.name}\nCategory: ${product.category}\n\nAdd to inventory?` }]);
            } else { setMessages(prev => [...prev, { role: 'assistant', content: `🔍 Barcode: ${barcode} — couldn't identify product automatically.` }]); }
          } finally { setIsLoading(false); }
        }
      } catch { /* scanning */ }
    }, 500);
  }, []);

  const stopBarcodeScanner = useCallback(() => {
    clearInterval(barcodeScanInterval.current);
    barcodeScanInterval.current = null;
    try { barcodeReaderRef.current?.reset(); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (barcodeOpen) startBarcodeScanner(); else stopBarcodeScanner();
    return () => stopBarcodeScanner();
  }, [barcodeOpen, startBarcodeScanner, stopBarcodeScanner]);

  const handleAddDetectedItem = () => {
    if (!addItemDialog) return;
    addItem({
      name: addItemDialog.brand ? `${addItemDialog.brand} ${addItemDialog.name}` : addItemDialog.name,
      quantity: addItemDialog.suggestedQuantity || 1, unit: addItemDialog.unit || 'pcs',
      threshold: addItemDialog.suggestedThreshold || 1, category: addItemDialog.category || 'groceries',
      expiryDate: null, estimatedCost: 0
    });
    setMessages(prev => [...prev, { role: 'assistant', content: `✅ Added ${addItemDialog.name} to your ${addItemDialog.category} inventory!` }]);
    setAddItemDialog(null);
  };

  const msgVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <Container maxWidth="md" sx={{ mt: isDialog ? 0 : 4, mb: isDialog ? 0 : 4, height: isDialog ? '100%' : 'auto' }} className={isDialog ? '' : 'page-wrapper'}>
      <Paper elevation={0} sx={{
        height: isDialog ? '100%' : 'calc(100vh - 140px)',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(102,126,234,0.2)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <Box sx={{
          p: 2, borderBottom: '1px solid rgba(102,126,234,0.2)',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(240,147,251,0.1))',
          display: 'flex', alignItems: 'center', gap: 1.5
        }}>
          <Avatar sx={{ background: 'linear-gradient(135deg,#667eea,#f093fb)', boxShadow: '0 0 15px rgba(102,126,234,0.5)' }}>
            <SmartToyIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{
              background: 'linear-gradient(135deg,#667eea,#f093fb)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>SmartPantry AI</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box className="status-dot" />
              <Typography variant="caption" color="text.secondary">
                {apiStatus === 'quota' ? '⚠️ Local mode (API quota exhausted)' : !API_KEY_VALID ? '⚠️ Local mode (no API key)' : 'Vision · Voice · Barcode · Gemini AI'}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Scan item with camera">
            <IconButton onClick={() => setCameraOpen(true)} sx={{ color: '#4facfe', '&:hover': { background: 'rgba(79,172,254,0.15)' } }}>
              <CameraAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Upload product image">
            <IconButton onClick={() => fileInputRef.current?.click()} sx={{ color: '#43e97b', '&:hover': { background: 'rgba(67,233,123,0.15)' } }}>
              <AddShoppingCartIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Scan barcode">
            <IconButton onClick={() => setBarcodeOpen(true)} sx={{ color: '#f6d365', '&:hover': { background: 'rgba(246,211,101,0.15)' } }}>
              <QrCodeScannerIcon />
            </IconButton>
          </Tooltip>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileUpload} />
        </Box>

        {/* API quota warning banner */}
        {(apiStatus === 'quota' || !API_KEY_VALID) && (
          <Alert severity="warning" sx={{ borderRadius: 0, py: 0.5, fontSize: '0.8rem' }}>
            {!API_KEY_VALID ? 'No API key configured — running in local mode. Add REACT_APP_GEMINI_API_KEY to .env to enable full AI.' : 'Gemini API quota exhausted — running in local mode. Common questions still work!'}
          </Alert>
        )}

        {scanLoading && <LinearProgress sx={{ '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#667eea,#f093fb)' } }} />}

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <MotionBox key={i} variants={msgVariants} initial="hidden" animate="visible"
                sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar sx={{
                  flexShrink: 0,
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'linear-gradient(135deg,#f093fb,#f5576c)',
                  boxShadow: msg.role === 'user' ? '0 0 10px rgba(102,126,234,0.4)' : '0 0 10px rgba(240,147,251,0.4)',
                  width: 36, height: 36,
                }}>
                  {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                </Avatar>
                <Box sx={{
                  p: 2, maxWidth: '75%',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.06)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: msg.role === 'user' ? '0 4px 15px rgba(102,126,234,0.3)' : 'none',
                }}>
                  <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>{msg.content}</Typography>
                  {addItemDialog && i === messages.length - 1 && msg.role === 'assistant' && (
                    <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" color="success" onClick={handleAddDetectedItem}
                        sx={{ borderRadius: 2, fontSize: '0.75rem' }}>✅ Yes, Add</Button>
                      <Button size="small" variant="outlined" onClick={() => setAddItemDialog(null)}
                        sx={{ borderRadius: 2, fontSize: '0.75rem' }}>No</Button>
                    </Box>
                  )}
                </Box>
              </MotionBox>
            ))}
          </AnimatePresence>
          {isLoading && (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Avatar sx={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)', width: 36, height: 36 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Box sx={{ p: 2, borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  {[0, 1, 2].map(j => (
                    <Box key={j} sx={{ width: 8, height: 8, borderRadius: '50%', background: '#667eea',
                      animation: 'statusPulse 1.4s ease infinite', animationDelay: `${j * 0.2}s` }} />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {QUICK_PROMPTS.map(p => (
              <Chip key={p} label={p} size="small" onClick={() => sendMessage(p)}
                sx={{ cursor: 'pointer', background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)',
                  color: '#a78bfa', fontWeight: 500, '&:hover': { background: 'rgba(102,126,234,0.3)' } }} />
            ))}
          </Box>
        )}

        {/* Input */}
        <Box component="form" onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          sx={{ p: 2, borderTop: '1px solid rgba(102,126,234,0.2)', display: 'flex', gap: 1, background: 'rgba(255,255,255,0.02)' }}>
          <Tooltip title={isListening ? 'Stop listening' : 'Voice input'}>
            <IconButton onClick={toggleVoice}
              sx={{ color: isListening ? '#f5576c' : 'rgba(255,255,255,0.5)',
                background: isListening ? 'rgba(245,87,108,0.15)' : 'transparent',
                animation: isListening ? 'statusPulse 1.5s ease infinite' : 'none' }}>
              {isListening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
          <TextField fullWidth value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={isListening ? '🎤 Listening...' : 'Ask anything about your inventory...'}
            variant="outlined" size="small" disabled={isLoading}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, background: 'rgba(255,255,255,0.05)',
              '& fieldset': { borderColor: 'rgba(102,126,234,0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(102,126,234,0.6)' },
              '&.Mui-focused fieldset': { borderColor: '#667eea' } } }} />
          <Button type="submit" variant="contained" endIcon={<SendIcon />} disabled={!input.trim() || isLoading}
            sx={{ borderRadius: 3, px: 2.5, background: 'linear-gradient(135deg,#667eea,#764ba2)',
              boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
              '&:hover': { boxShadow: '0 6px 20px rgba(102,126,234,0.6)' } }}>
            Send
          </Button>
        </Box>
      </Paper>

      {/* Camera Dialog */}
      <Dialog open={cameraOpen} onClose={() => setCameraOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: '#12122a', border: '1px solid rgba(102,126,234,0.3)' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg,rgba(102,126,234,0.2),rgba(240,147,251,0.1))' }}>
          📷 Scan Product with Camera
        </DialogTitle>
        <DialogContent>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width="100%"
            videoConstraints={{ facingMode: 'environment' }} style={{ borderRadius: 12, marginTop: 8 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCameraOpen(false)}>Cancel</Button>
          <Button onClick={captureAndAnalyze} variant="contained" startIcon={<CameraAltIcon />}>Capture & Identify</Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog open={barcodeOpen} onClose={() => setBarcodeOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: '#12122a', border: '1px solid rgba(102,126,234,0.3)' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg,rgba(102,126,234,0.2),rgba(240,147,251,0.1))' }}>
          🔍 Barcode Scanner
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Point camera at a barcode — it scans automatically.</Typography>
          <Webcam ref={barcodeWebcamRef} screenshotFormat="image/jpeg" width="100%"
            videoConstraints={{ facingMode: 'environment' }} style={{ borderRadius: 12 }} />
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress sx={{ flex: 1, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#667eea,#f093fb)' } }} />
            <Typography variant="caption" color="text.secondary">Scanning...</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBarcodeOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChatBot;
