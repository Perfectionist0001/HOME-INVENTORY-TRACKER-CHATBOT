import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ChatBot from './pages/ChatBot';
import { InventoryProvider } from './context/InventoryContext';
import AiAssistant from './components/AiAssistant';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <InventoryProvider>
        <Router>
          <div className="App">
            <Navbar />
            <AnimatePresence mode='wait'>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/chatbot" element={<ChatBot />} />
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
