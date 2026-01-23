# Trading Platform

A full-stack portfolio management and market tracking application with AI-powered features.

## 🎯 What Is This?

This is a **personal trading dashboard** that helps traders:
- Track positions across multiple brokers in one place
- Monitor real-time prices for crypto, forex, stocks, ETFs, commodities
- Import positions from broker screenshots using AI
- Get AI-powered portfolio analysis and advice
- View watchlists with sentiment analysis (Bullish/Bearish/Ranging)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Portfolio Dashboard** | Track all positions with P&L, allocation charts, draggable cards |
| **AI Screenshot Import** | Upload broker screenshots → AI extracts positions automatically |
| **AI Portfolio Mentor** | Chat with AI about your portfolio, ask for advice |
| **Watchlist** | Live prices, sparklines, AI sentiment badges |
| **Verification Badges** | Shows if position is API verified, AI verified, or manual entry |
| **Multi-Asset** | Crypto, Forex, Stocks, ETFs, Commodities, Unit Trusts |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
│              Next.js (React) - Port 3000                    │
├─────────────────────────────────────────────────────────────┤
│  Portfolio Page  │  Watchlist Page  │  Dashboard Page       │
│  - Position table│  - Price cards   │  - Summary cards      │
│  - P&L charts    │  - Sparklines    │  - Quick actions      │
│  - AI Chatbox    │  - AI Sentiment  │                       │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────┐
│                       BACKEND                               │
│              NestJS (Node.js) - Port 3001                   │
├─────────────────────────────────────────────────────────────┤
│  Portfolio Import  │  Portfolio Chat  │  Market Data        │
│  - Screenshot AI   │  - AI Mentor     │  - Price Proxy      │
│  - Position CRUD   │  - Qwen 2.5 VL   │  - Finnhub/Yahoo    │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│  OpenRouter AI    │  Binance API   │  Finnhub   │  Yahoo   │
│  (Vision + Chat)  │  (Crypto)      │  (Forex)   │  (Stocks)│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Future Integration: Chart Analyser

This Trading Platform is designed to integrate with the **Chart Analyser** project:

### Integration Points

| Trading Platform | Chart Analyser | Integration |
|-----------------|----------------|-------------|
| Watchlist symbols | Chart analysis | Click symbol → Open in Chart Analyser |
| Position data | Trade signals | Overlay AI signals on positions |
| Price feeds | Chart data | Share real-time price streams |
| AI Mentor | Chart AI | Combined AI analysis |

### Planned Integration API

```typescript
// Trading Platform → Chart Analyser
POST /api/analyze-chart
{
  symbol: "BTCUSD",
  timeframe: "4h",
  indicators: ["RSI", "MACD", "BB"]
}

// Chart Analyser → Trading Platform
POST /api/signals
{
  symbol: "BTCUSD",
  signal: "BUY",
  confidence: 0.85,
  targetPrice: 105000
}
```

### Integration Steps (Future)

1. **Shared Authentication** - Single login for both apps
2. **Unified Watchlist** - Same watchlist across both apps
3. **Click-to-Analyze** - Click position → See chart analysis
4. **Signal Overlay** - Show buy/sell signals on portfolio
5. **Combined Dashboard** - Embed chart widgets in portfolio

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/melvinl07/trading-platform.git
cd trading-platform

# Install
npm install

# Setup API keys (create apps/api/.env)
OPENROUTER_API_KEY=your-key
FINNHUB_API_KEY=your-key

# Run Frontend (Terminal 1)
cd apps/web && npm run dev

# Run Backend (Terminal 2)
cd apps/api && npm run start:dev
```

Open http://localhost:3000

---

## 📁 Project Structure

```
trading-platform/
├── apps/
│   ├── web/              # Next.js Frontend
│   │   ├── app/          # Pages (portfolio, watchlist, dashboard)
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities (priceService, api)
│   │
│   └── api/              # NestJS Backend
│       ├── src/
│       │   ├── portfolio-import/   # AI screenshot import
│       │   ├── portfolio-chat/     # AI mentor
│       │   └── market-data/        # Price proxy
│       └── .env                    # API keys (not in git)
│
└── package.json
```

---

## 🔑 Environment Variables

Create `apps/api/.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_CHAT_MODEL=qwen/qwen-2.5-vl-72b-instruct
FINNHUB_API_KEY=xxx
JWT_SECRET=your-secret
```

---

## 📜 License

Private project - All rights reserved
