# Morning Brief Feature

## Overview

The Morning Brief is a daily market intelligence summary designed to provide traders with a concise overview of:

- Market sentiment analysis
- Watchlist alerts (support/resistance levels)
- Implied Volatility (IV) changes across sectors
- Top trade candidates with entry/exit levels

The brief can be scheduled to be generated and sent automatically at a specific time each day (e.g., 8:30 AM).

## Architecture

### Frontend Components

**Location:** `apps/web/components/MorningBrief.tsx`

The main React component that displays:

- Market sentiment with confidence levels
- Watchlist alerts showing symbols hitting key levels
- IV expansion/contraction by sector
- Trade candidates with detailed entry, target, stop, and risk/reward ratios
- Schedule settings for automated delivery

**Page:** `apps/web/app/morning-brief/page.tsx`

Dedicated page accessible via `/morning-brief` route.

### Backend API

**Location:** `apps/api/src/morning-brief/`

- **Controller** (`morning-brief.controller.ts`): REST endpoints
  - `GET /morning-brief/generate` - Generate a new brief
  - `POST /morning-brief/schedule` - Update schedule settings
  - `GET /morning-brief/schedule` - Get current schedule

- **Service** (`morning-brief.service.ts`): Business logic
  - Market sentiment analysis
  - Watchlist monitoring
  - IV tracking
  - Trade candidate generation
  - SMS/notification formatting

## Usage

### Accessing the Brief

1. Navigate to the "Morning Brief" link in the main navigation
2. Click "Generate Brief" to create a new analysis
3. View detailed breakdowns of market conditions and opportunities

### Scheduling Automated Delivery

1. Click the "Settings" button
2. Enable "Enable daily morning brief delivery"
3. Set your preferred delivery time (default: 08:30)
4. The brief will be generated and sent to your phone at the scheduled time

## Implementation Roadmap

### Phase 1: Core Functionality ✅

- [x] Frontend UI component
- [x] Basic data structure
- [x] Mock data generation
- [x] Schedule settings UI
- [x] Backend API endpoints

### Phase 2: Real Data Integration (TODO)

#### Market Sentiment Analysis

```typescript
// Integrate with market data APIs
- Fetch S&P 500, NASDAQ, Dow Jones performance
- Calculate VIX levels and trends
- Analyze market breadth (advance/decline ratio)
- Sentiment scoring algorithm
```

#### Watchlist Monitoring

```typescript
// Connect to user's watchlist
- Fetch user's saved watchlist symbols
- Get real-time price data
- Calculate support/resistance levels using technical analysis
- Detect breakouts/breakdowns
```

#### IV Analysis

```typescript
// Options data integration
- Connect to options data provider (e.g., CBOE, IEX Cloud)
- Calculate IV percentile by sector
- Track 24h and 7d IV changes
- Alert on significant expansions (>10%)
```

#### Trade Candidate Generation

```typescript
// AI-powered scanning
- Technical pattern recognition (flags, triangles, head & shoulders)
- Volume profile analysis
- Momentum indicators (RSI, MACD)
- Risk/reward calculation
- Confidence scoring based on multiple factors
```

### Phase 3: Notification System (TODO)

#### SMS Integration (Twilio)

```bash
npm install twilio
```

```typescript
import twilio from "twilio";

const client = twilio(accountSid, authToken);

await client.messages.create({
  body: formatBriefForSMS(brief),
  to: userPhoneNumber,
  from: twilioPhoneNumber,
});
```

#### Push Notifications (Firebase)

```bash
npm install firebase-admin
```

```typescript
import * as admin from "firebase-admin";

await admin.messaging().send({
  notification: {
    title: "☀️ Your Morning Brief is Ready",
    body: "Market is neutral. 3 watchlist alerts. View now.",
  },
  token: userDeviceToken,
});
```

#### Email Delivery

```bash
npm install nodemailer
```

### Phase 4: Scheduling (TODO)

#### Cron Job Setup

```bash
npm install node-cron
```

```typescript
import cron from "node-cron";

// Schedule for 8:30 AM daily
cron.schedule("30 8 * * *", async () => {
  const users = await getSubscribedUsers();
  for (const user of users) {
    const brief = await generateBrief(user.id);
    await sendBriefToUser(brief, user);
  }
});
```

## Data Sources

### Recommended APIs

1. **Market Data**
   - Alpha Vantage (free tier available)
   - IEX Cloud
   - Polygon.io
   - Yahoo Finance API

2. **Options Data**
   - CBOE DataShop
   - TradingView
   - Barchart OnDemand

3. **News Sentiment**
   - NewsAPI
   - Finnhub
   - Benzinga

## Customization

### Adding New Alert Types

1. Define the interface in `morning-brief.service.ts`:

```typescript
interface CustomAlert {
  symbol: string;
  alertType: string;
  data: any;
}
```

2. Add analysis method:

```typescript
private async checkCustomAlerts(): Promise<CustomAlert[]> {
    // Your logic here
}
```

3. Update the UI in `MorningBrief.tsx` to display the new alerts

### Customizing the Brief Format

Edit `formatBriefForSMS()` in the service to change how the brief appears in text messages:

```typescript
private formatBriefForSMS(brief: any): string {
    // Customize message format
    return customMessage;
}
```

## Testing

### Manual Testing

1. Navigate to `/morning-brief`
2. Click "Generate Brief"
3. Verify all sections display correctly
4. Test schedule settings

### API Testing

```bash
# Generate brief
curl http://localhost:3001/morning-brief/generate

# Update schedule
curl -X POST http://localhost:3001/morning-brief/schedule \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "time": "08:30", "userId": "user123"}'

# Get schedule
curl http://localhost:3001/morning-brief/schedule
```

## Future Enhancements

1. **Personalization**
   - User-specific trading strategies
   - Custom alert thresholds
   - Preferred sectors/asset classes

2. **Historical Tracking**
   - Save daily briefs
   - Track prediction accuracy
   - Performance analytics

3. **Multi-channel Delivery**
   - SMS
   - Email
   - Push notifications
   - Slack/Discord integration

4. **Advanced Analysis**
   - Machine learning predictions
   - Correlation analysis
   - Event-driven alerts (earnings, Fed meetings)

## Support

For questions or issues, please refer to the main project documentation or contact the development team.
