# 🏠 SmartPantry AI

> An AI-powered home inventory management system with camera scanning, voice commands, barcode detection, expiry tracking, and a smart chatbot — built with React and Google Gemini.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![MUI](https://img.shields.io/badge/MUI-v5-007FFF?style=flat-square&logo=mui)
![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📦 **Smart Inventory** | Track items across categories with quantity, unit, threshold & expiry date |
| 🤖 **AI Chatbot** | Chat with Gemini 2.0 Flash for restocking tips, recipes & inventory insights |
| 📷 **Image Recognition** | Scan a product with your camera — AI identifies and adds it automatically |
| 🔍 **Barcode Scanner** | Point at any barcode to instantly identify and add the product |
| 🎤 **Voice Commands** | Speak to ask questions or add items hands-free |
| ⏳ **Expiry Tracking** | Visual expiry timeline with alerts for items expiring in 3 / 7 / 30 days |
| 🛒 **Smart Shopping List** | Auto-generate from low stock with budget estimates and checkout flow |
| 📊 **Analytics Dashboard** | Pie charts, bar graphs, spending history and budget tracking |
| 👨‍👩‍👧 **Multi-User** | Separate inventory profiles for each family member |
| 🌙 **Dark / Light Mode** | Full theme toggle with glassmorphism UI |
| 📱 **Responsive** | Mobile-friendly with hamburger nav drawer |
| 🔔 **Notifications** | In-app notification center for inventory events |

---

## 🖥️ Screenshots

### Home
![Home](https://via.placeholder.com/900x500/0a0a1a/667eea?text=SmartPantry+AI+Home)

### Dashboard
![Dashboard](https://via.placeholder.com/900x500/0a0a1a/f093fb?text=Analytics+Dashboard)

### AI Chatbot
![Chatbot](https://via.placeholder.com/900x500/0a0a1a/4facfe?text=AI+Chatbot)

> Replace placeholders with actual screenshots after running the app.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) *(free)*

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/smartpantry-ai.git
cd smartpantry-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

### Run

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `REACT_APP_GEMINI_API_KEY` | Google Gemini API key for AI features | Optional* |

> *The app runs in **local mode** without an API key — all inventory queries (low stock, expiry, shopping list, stats) still work. A key is only needed for open-ended AI responses and image/barcode recognition.

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Top navigation with mobile drawer
│   └── AiAssistant.js     # Floating AI assistant FAB + dialog
├── context/
│   └── InventoryContext.js # Global state (inventory, shopping, budget, users)
├── data/
│   └── defaultData.js     # Seed inventory data
├── pages/
│   ├── Home.js            # Landing page with stats & feature cards
│   ├── Dashboard.js       # Analytics, charts, alerts
│   ├── Inventory.js       # CRUD inventory management
│   ├── ShoppingList.js    # Shopping list with checkout
│   ├── ExpiryTracker.js   # Expiry date tracking
│   └── ChatBot.js         # AI chatbot with vision & voice
└── App.js                 # Theme, routing, providers
```

---

## 🧠 How the Chatbot Works

The chatbot has two layers:

1. **Local Intelligence Engine** — handles all inventory-specific queries instantly with zero API calls:
   - Low stock checks
   - Shopping list suggestions
   - Expiry reports
   - Inventory summaries
   - Budget overview
   - Category stats

2. **Gemini 2.0 Flash API** — handles open-ended questions, recipe suggestions, and product identification via camera/barcode when an API key is configured.

If the API quota is exhausted or no key is set, the app automatically falls back to local mode with a clear status indicator.

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Material UI v5** — Component library
- **Framer Motion** — Animations
- **Chart.js + react-chartjs-2** — Analytics charts
- **react-webcam** — Camera access
- **@zxing/library** — Barcode decoding
- **Google Gemini 2.0 Flash** — AI responses & image recognition
- **Web Speech API** — Voice input
- **localStorage** — Persistent state (no backend needed)

---

## 📦 Available Scripts

```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [NIKHIL SINGH](https://github.com/perfectionist0001)

---

<p align="center">Built with ❤️ using React & Google Gemini AI</p>
