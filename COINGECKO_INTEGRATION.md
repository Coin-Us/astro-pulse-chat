# CoinGecko API Integration

This document explains the CoinGecko API integration for live cryptocurrency market data.

## Overview

The integration provides real-time crypto market data to enhance AI predictions and analysis. It consists of:

1. **Edge Function**: `crypto-data` - Backend API proxy to CoinGecko
2. **Helper Library**: `crypto-api.ts` - React-friendly wrapper functions
3. **UI Components**: `LiveCryptoTicker.tsx`, `TrendingCoins.tsx` - Visual displays

## Architecture

```
User → React Component → crypto-api.ts → Supabase Edge Function → CoinGecko API
                                                      ↓
                                            AI Chat Context (chat-openai)
```

## Edge Function: crypto-data

**Endpoint**: `https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/crypto-data`

### Supported Actions

#### 1. Get Prices
```typescript
POST /crypto-data
{
  "action": "prices",
  "coinIds": ["bitcoin", "ethereum", "cardano"]
}

Response: CoinMarketData[]
```

#### 2. Get Trending Coins
```typescript
POST /crypto-data
{
  "action": "trending"
}

Response: TrendingResponse
```

#### 3. Get Global Market Data
```typescript
POST /crypto-data
{
  "action": "global"
}

Response: GlobalMarketData
```

#### 4. Get Coin Details
```typescript
POST /crypto-data
{
  "action": "details",
  "coinId": "bitcoin"
}

Response: CoinDetails
```

#### 5. Get Price Chart
```typescript
POST /crypto-data
{
  "action": "chart",
  "coinId": "bitcoin",
  "days": "7"  // 1, 7, 14, 30, 90, 180, 365, max
}

Response: ChartData
```

## Helper Functions

### getCryptoPrices()
Fetches current market data for multiple coins.

```typescript
import { getCryptoPrices } from '@/lib/crypto-api';

const data = await getCryptoPrices(['bitcoin', 'ethereum']);
// Returns: CoinMarketData[]
```

**Response Fields**:
- `id`: Coin identifier
- `symbol`: Ticker symbol
- `name`: Full name
- `image`: Logo URL
- `current_price`: Current USD price
- `market_cap`: Total market capitalization
- `market_cap_rank`: Global ranking
- `price_change_percentage_24h`: 24h price change %
- `total_volume`: 24h trading volume
- `high_24h`: 24h high price
- `low_24h`: 24h low price

### getTrendingCoins()
Fetches trending coins on CoinGecko.

```typescript
import { getTrendingCoins } from '@/lib/crypto-api';

const trending = await getTrendingCoins();
// Returns: TrendingCoin[]
```

### getGlobalMarketData()
Fetches global crypto market statistics.

```typescript
import { getGlobalMarketData } from '@/lib/crypto-api';

const global = await getGlobalMarketData();
// Returns: GlobalMarketData
```

**Response Fields**:
- `total_market_cap`: Total crypto market cap by currency
- `total_volume`: Total 24h volume
- `market_cap_percentage`: Market dominance %
- `active_cryptocurrencies`: Number of active coins
- `markets`: Number of active markets
- `market_cap_change_percentage_24h_usd`: 24h market change

### getCoinDetails()
Fetches detailed information about a specific coin.

```typescript
import { getCoinDetails } from '@/lib/crypto-api';

const details = await getCoinDetails('bitcoin');
// Returns: CoinDetails
```

**Response Fields**:
- `description`: Full description (HTML)
- `links`: Official links (homepage, blockchain explorer, etc.)
- `market_data`: Extended market data
- `community_data`: Social stats
- `developer_data`: GitHub activity

### getCoinChart()
Fetches historical price data for charts.

```typescript
import { getCoinChart } from '@/lib/crypto-api';

const chart = await getCoinChart('bitcoin', '7'); // Last 7 days
// Returns: ChartData
```

## Utility Functions

### formatPrice()
Formats price for display.

```typescript
import { formatPrice } from '@/lib/crypto-api';

formatPrice(42567.89); // "$42,567.89"
formatPrice(0.0001234); // "$0.000123"
```

### formatPercentage()
Formats percentage with color coding.

```typescript
import { formatPercentage } from '@/lib/crypto-api';

const result = formatPercentage(5.67);
// { text: "+5.67%", color: "text-green-500" }

const result2 = formatPercentage(-2.34);
// { text: "-2.34%", color: "text-red-500" }
```

### getMarketSentiment()
Analyzes market sentiment from price changes.

```typescript
import { getMarketSentiment } from '@/lib/crypto-api';

getMarketSentiment(8.5);  // "🚀 Very Bullish"
getMarketSentiment(3.2);  // "📈 Bullish"
getMarketSentiment(-1.5); // "📉 Bearish"
getMarketSentiment(-6.8); // "💥 Very Bearish"
```

## UI Components

### LiveCryptoTicker
Displays real-time prices for top coins with auto-refresh.

```tsx
import LiveCryptoTicker from '@/components/LiveCryptoTicker';

<LiveCryptoTicker />
```

**Features**:
- Auto-refreshes every 60 seconds
- Shows 5 major coins (BTC, ETH, ADA, SOL, XRP)
- Color-coded 24h price changes
- Loading and error states
- Responsive grid layout

### TrendingCoins
Shows trending coins on CoinGecko.

```tsx
import TrendingCoins from '@/components/TrendingCoins';

<TrendingCoins />
```

**Features**:
- Auto-refreshes every 5 minutes
- Top 5 trending coins
- Market cap rank
- BTC price conversion
- Minimal error handling (silent fail)

## AI Integration

The `chat-openai` edge function automatically fetches live market data and injects it into the AI context:

```typescript
// Automatically included in system prompt:
"Current Live Market Data:
Bitcoin ($42,567.89) (24h: +3.45%)
Ethereum ($2,234.56) (24h: -1.23%)
..."
```

**Enable/Disable**:
```typescript
// In chat-openai function call
{
  messages: [...],
  includeLiveData: true  // default: true
}
```

## Configuration

### Supabase Secrets

The CoinGecko API key is stored as a Supabase secret:

```bash
supabase secrets set COINGECKO_API_KEY=your_api_key_here
```

### API Key Setup

1. Sign up at [CoinGecko](https://www.coingecko.com/en/api)
2. Get your API key
3. Add to Supabase secrets (done)
4. Edge function uses `Deno.env.get('COINGECKO_API_KEY')`

### Rate Limits

**CoinGecko Free Tier**:
- 50 calls/minute
- 10,000 calls/month

**Optimization**:
- Client-side caching (60s for prices, 5min for trending)
- Batch requests where possible
- Minimal polling intervals

## Error Handling

All functions include try-catch blocks:

```typescript
try {
  const data = await getCryptoPrices(['bitcoin']);
  // Use data
} catch (error) {
  console.error('Failed to fetch crypto data:', error);
  // Show fallback UI or toast notification
}
```

## Testing

### Test Edge Function Directly

```bash
curl -X POST https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/crypto-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"action":"prices","coinIds":["bitcoin","ethereum"]}'
```

### Test in React

```typescript
// In browser console
import { getCryptoPrices } from '@/lib/crypto-api';
const data = await getCryptoPrices(['bitcoin']);
console.log(data);
```

### Test AI Integration

Ask the AI:
- "What's the current price of Bitcoin?"
- "How is the crypto market performing today?"
- "Which coins are trending right now?"

## Troubleshooting

### Issue: "Failed to load crypto data"
**Cause**: Edge function error or API key issue
**Solution**: Check Supabase logs, verify API key is set

### Issue: Stale data
**Cause**: Client-side caching or polling interval too long
**Solution**: Adjust refresh intervals in components

### Issue: Rate limit exceeded
**Cause**: Too many API calls
**Solution**: Increase caching duration, reduce polling frequency

### Issue: CORS errors
**Cause**: Direct browser calls to CoinGecko API
**Solution**: Always use edge function proxy (never call CoinGecko directly from React)

## Next Steps

- [ ] Add more coins to LiveCryptoTicker
- [ ] Create price alert system
- [ ] Add historical price charts with recharts
- [ ] Implement portfolio tracking
- [ ] Add news sentiment analysis
- [ ] Create market heatmap visualization
- [ ] Add cryptocurrency converter tool

## Resources

- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [React Query for Caching](https://tanstack.com/query/latest) (future enhancement)
