import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ChatBot from './pages/ChatBot';
import ExpiryTracker from './pages/ExpiryTracker';
import ShoppingList from './pages/ShoppingList';
import { InventoryProvider } from './context/InventoryContext';
import AiAssistant from './components/AiAssistant';

function App() {
  const [mode, setMode] = useState('dark');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#667eea', light: '#8fa4f3', dark: '#4a5fd4' },
      secondary: { main: '#f093fb', light: '#f5b8fc', dark: '#c060d8' },
      background: {
        default: mode === 'dark' ? '#0a0a1a' : '#f0f2ff',
        paper: mode === 'dark' ? '#12122a' : '#ffffff',
      },
      error: { main: '#f5576c' },
      success: { main: '#4facfe' },
      warning: { main: '#f6d365' },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              boxShadow: '0 6px 20px rgba(102,126,234,0.6)',
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 }
        }
      }
    }
  }), [mode]);

  const toggleMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <InventoryProvider>
        <Router basename={process.env.PUBLIC_URL}>
          <div className="App">
            <Navbar mode={mode} toggleMode={toggleMode} />
            <AnimatePresence mode='wait'>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/chatbot" element={<ChatBot />} />
                <Route path="/expiry" element={<ExpiryTracker />} />
                <Route path="/shopping" element={<ShoppingList />} />
              </Routes>
            </AnimatePresence>
            <AiAssistant />
          </div>
        </Router>
      </InventoryProvider>
    </ThemeProvider>
  );
}

export default App;
