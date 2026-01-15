# Multi-Asset Trading Platform

A modern, full-stack trading application for stocks and options with real-time data, paper trading, and AI-powered insights.

## 🚀 Features

- **Multi-Asset Trading**: Trade stocks and stock options
- **Paper Trading**: Practice with $100K virtual funds
- **Real-time Market Data**: WebSocket-based price streaming
- **Modern UI**: Dark-themed, responsive design with Tailwind CSS
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **RESTful API**: NestJS backend with TypeORM and PostgreSQL

## 📦 Tech Stack

### Backend
- **NestJS** - Scalable Node.js framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Relational database
- **Socket.IO** - WebSocket for real-time data
- **Passport JWT** - Authentication

### Frontend
- **Next.js 15** - React framework
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Socket.IO Client** - WebSocket client

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone the Repository
```bash
cd trading-platform
```

### 2. Backend Setup

```bash
cd apps/api

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your PostgreSQL credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# DB_DATABASE=trading_platform
# JWT_SECRET=your_secret_key

# Run the backend
npm run start:dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd apps/web

# Install dependencies
npm install

# Create .env.local file (or copy .env.example)
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Run the frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Database Setup

The database schema will be automatically created when you start the backend (TypeORM synchronize is enabled for development).

For production, you should:
1. Set `synchronize: false` in `app.module.ts`
2. Use migrations instead

## 📖 Usage

1. **Register**: Go to `http://localhost:3000` and click "Get Started"
2. **Login**: Use your credentials to sign in
3. **Dashboard**: View your paper trading account with $100K balance
4. **Trade**: Click "Start Trading" to begin (trading interface coming in next phase)

## 🏗️ Project Structure

```
trading-platform/
├── apps/
│   ├── api/          # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── accounts/
│   │   │   ├── orders/
│   │   │   ├── positions/
│   │   │   └── market-data/
│   │   └── ...
│   └── web/          # Next.js frontend
│       ├── app/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   └── ...
│       ├── components/
│       ├── contexts/
│       └── lib/
└── packages/         # Shared code (future)
```

## 🎯 Roadmap

### Phase 1 (Current - MVP)
- [x] Authentication & User Management
- [x] Paper Trading Accounts
- [x] Basic Order System
- [x] Market Data Service (Mock)
- [x] Dashboard UI
- [ ] Trading Interface
- [ ] Portfolio View
- [ ] Market Explorer

### Phase 2
- [ ] Options Chain
- [ ] Greeks Calculation
- [ ] Risk Management

### Phase 3
- [ ] Social Features
- [ ] Community Feed
- [ ] User Profiles

### Phase 4
- [ ] AI Integration
- [ ] Ticker Analysis
- [ ] Strategy Suggestions

### Phase 5
- [ ] Live Trading Integration
- [ ] Real Brokerage API
- [ ] KYC/AML Compliance

## 🔐 Security Notes

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Environment variables for sensitive data
- Input validation with class-validator
- CORS configured for frontend

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/profile` - Get user profile (protected)

### Accounts
- `GET /accounts` - Get user accounts (protected)

### Orders
- `POST /orders` - Place order (protected)
- `GET /orders/:accountId` - Get account orders (protected)

### WebSocket
- `priceUpdate` - Real-time price updates

## 🤝 Contributing

This is a learning/demo project. Feel free to fork and experiment!

## 📄 License

MIT

## 🙏 Acknowledgments

Inspired by Moomoo and Tiger Trade platforms.
