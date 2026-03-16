# Project Memory - Trading Platform

## 📊 Overview

A comprehensive trading and portfolio management platform consisting of a **Next.js frontend** and a **NestJS backend**. The platform features real-time market data, AI-powered portfolio analysis, and advanced trading tools.

## 🛠 Tech Stack

### Frontend (`apps/web`)

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (v4)
- **State Management**: React Context / Hooks
- **Animations**: Framer Motion
- **Charts**: Lightweight Charts (TradingView) & Recharts
- **Layout**: React Grid Layout
- **Icons**: Lucide React
- **Themes**: Dark/Gold primary aesthetic

### Backend (`apps/api`)

- **Framework**: NestJS
- **Database**:
  - **Current**: MySQL (recently migrated from PostgreSQL)
  - **ORM**: TypeORM
  - **SQLite Support**: Available for local development (via `USE_SQLITE=true`)
- **Authentication**: JWT & Passport
- **Real-time**: Socket.io (WebSockets)
- **External APIs**:
  - **Finnhub**: Real-time stock prices
  - **OpenRouter (AI)**: Portfolio analysis and chat models (Default: `qwen/qwen2.5-vl-32b-instruct`)

## 🔑 Key Features

### 1. Portfolio Management

- **Dashboard**: High-level overview of account balance, positions, and performance.
- **Portfolio Import**: Support for importing trading history (entities for `PortfolioImport`).
- **Portfolio Analyst**: AI-powered risk assessment, news impact analysis, and concentration risk flagging.
- **Portfolio Chat**: Conversational AI interface for interacting with portfolio data.

### 2. Trading Tools

- **Market Data**: Real-time symbol tracking and live price updates via WebSockets.
- **Orders & Positions**: Full lifecycle management of trading orders and active positions.
- **Watchlist**: Personalized stock/asset tracking.
- **Trading Arena**: Specialized UI for detailed chart analysis and model-based trading.

### 3. AI Insights

- **Morning Brief**: Daily AI-generated market summaries and trade recommendations.
- **AI Analyst**: Deep dive into specific positions with risk/reward scoring.

## 🔄 Recent Changes & Status

- **Database Migration**: System successfully migrated from PostgreSQL to MySQL (Feb 12, 2026).
- **Architecture**: Monorepo-style structure with `api` and `web` apps.
- **Migration Tracking**: TypeORM migrations are located in `apps/api/src/migrations`.

## 📂 Project Structure

- `apps/api`: NestJS backend source code.
- `apps/web`: Next.js frontend source code.
- `logs/`: Activity logs for developer tracking.
- `MIGRATION_GUIDE.md`: Documentation for database migrations.

---

_Last Updated: 2026-02-12_
