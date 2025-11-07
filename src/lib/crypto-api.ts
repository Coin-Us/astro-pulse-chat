import { supabase } from './supabase';

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
  };
}

export interface GlobalMarketData {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    market_cap_percentage: { [key: string]: number };
    market_cap_change_percentage_24h_usd: number;
    updated_at: number;
  };
}

/**
 * Get current prices and market data for specific coins
 */
export async function getCryptoPrices(
  coins: string[] = ['bitcoin', 'ethereum', 'cardano', 'solana', 'ripple'],
  currency: string = 'usd'
): Promise<CoinMarketData[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzupzqmkhlepgncyfpbv.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/crypto-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      action: 'prices',
      coins,
      currency,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch crypto prices: ${error}`);
  }

  return await response.json();
}

/**
 * Get trending coins
 */
export async function getTrendingCoins(): Promise<TrendingCoin[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzupzqmkhlepgncyfpbv.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/crypto-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      action: 'trending',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch trending coins: ${error}`);
  }

  const data = await response.json();
  return data.coins || [];
}

/**
 * Get global market data
 */
export async function getGlobalMarketData(): Promise<GlobalMarketData> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzupzqmkhlepgncyfpbv.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/crypto-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      action: 'global',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch global market data: ${error}`);
  }

  return await response.json();
}

/**
 * Get detailed information about a specific coin
 */
export async function getCoinDetails(coinId: string = 'bitcoin'): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzupzqmkhlepgncyfpbv.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/crypto-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      action: 'details',
      coins: coinId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch coin details: ${error}`);
  }

  return await response.json();
}

/**
 * Get market chart data for a coin
 */
export async function getCoinChart(
  coinId: string = 'bitcoin',
  currency: string = 'usd'
): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzupzqmkhlepgncyfpbv.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/crypto-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      action: 'chart',
      coins: coinId,
      currency,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch coin chart: ${error}`);
  }

  return await response.json();
}

/**
 * Format price with proper currency symbol
 */
export function formatPrice(price: number, currency: string = 'usd'): string {
  const symbols: { [key: string]: string } = {
    usd: '$',
    eur: '€',
    gbp: '£',
    btc: '₿',
  };

  const symbol = symbols[currency.toLowerCase()] || '$';
  
  if (price >= 1) {
    return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `${symbol}${price.toFixed(6)}`;
  }
}

/**
 * Format percentage change with color indicator
 */
export function formatPercentage(percentage: number): { text: string; color: string } {
  const sign = percentage >= 0 ? '+' : '';
  const color = percentage >= 0 ? 'text-foreground' : 'text-muted-foreground';
  return {
    text: `${sign}${percentage.toFixed(2)}%`,
    color,
  };
}

/**
 * Get market sentiment based on price changes
 */
export function getMarketSentiment(data: CoinMarketData): string {
  const change24h = data.price_change_percentage_24h;
  const change7d = data.price_change_percentage_7d_in_currency || 0;

  if (change24h > 5 && change7d > 10) return 'Very Bullish 🚀';
  if (change24h > 2 && change7d > 5) return 'Bullish 📈';
  if (change24h > -2 && change24h < 2) return 'Neutral ➡️';
  if (change24h < -2 && change7d < -5) return 'Bearish 📉';
  if (change24h < -5 && change7d < -10) return 'Very Bearish 🔻';
  return 'Mixed 🤔';
}

/**
 * Get comprehensive market analysis data for a coin
 */
export async function getMarketAnalysisData(coinId: string = 'bitcoin'): Promise<string> {
  try {
    const [priceData, chartData] = await Promise.all([
      getCryptoPrices([coinId]),
      getCoinChart(coinId)
    ]);

    const coin = priceData[0];
    if (!coin) return 'Market data unavailable';

    const prices = chartData?.prices || [];
    const priceChanges = prices.length > 1 ? 
      ((prices[prices.length - 1][1] - prices[0][1]) / prices[0][1] * 100).toFixed(2) : 'N/A';

    return `
📊 LIVE MARKET DATA FOR ${coin.name.toUpperCase()} (${coin.symbol.toUpperCase()})

💰 Current Price: ${formatPrice(coin.current_price)}
📈 24h Change: ${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%
📅 7d Change: ${priceChanges}%
💎 Market Cap: ${formatPrice(coin.market_cap)} (Rank #${coin.market_cap_rank})
📊 24h Volume: ${formatPrice(coin.total_volume)}
⬆️ 24h High: ${formatPrice(coin.high_24h)}
⬇️ 24h Low: ${formatPrice(coin.low_24h)}
🏆 ATH: ${formatPrice(coin.ath)} (${coin.ath_change_percentage.toFixed(2)}% from ATH)
📉 ATL: ${formatPrice(coin.atl)}

Recent Price Action (7d):
${prices.slice(-7).map((p: any, i: number) => `Day ${i+1}: ${formatPrice(p[1])}`).join('\n')}
`.trim();
  } catch (error) {
    console.error('Failed to fetch market analysis data:', error);
    return 'Unable to fetch market data at this time';
  }
}
