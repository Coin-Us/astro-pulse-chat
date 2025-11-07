import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown, Loader2, Activity } from "lucide-react";
import { getCoinChart, getCryptoPrices, formatPrice, type CoinMarketData } from "@/lib/crypto-api";

interface LiveCryptoChartProps {
  coinId: string;
  coinName?: string;
}

interface ChartDataPoint {
  timestamp: number;
  price: number;
}

const LiveCryptoChart = ({ coinId, coinName }: LiveCryptoChartProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [coinData, setCoinData] = useState<CoinMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [priceData, chart] = await Promise.all([
          getCryptoPrices([coinId]),
          getCoinChart(coinId)
        ]);

        setCoinData(priceData[0]);
        
        if (chart?.prices) {
          const formattedData = chart.prices.map((point: [number, number]) => ({
            timestamp: point[0],
            price: point[1]
          }));
          setChartData(formattedData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [coinId]);

  if (isLoading) {
    return (
      <Card className="glass border-border">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading chart data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !coinData || chartData.length === 0) {
    return (
      <Card className="glass border-destructive/20">
        <CardContent className="py-4">
          <div className="text-sm text-destructive text-center">{error || 'No chart data available'}</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate chart dimensions and scaling
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // SVG dimensions
  const width = 100; // percentage
  const height = 150; // pixels
  const padding = 10;

  // Create SVG path
  const points = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * 100;
    const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const pathD = `M ${points.split(' ').map((p, i) => i === 0 ? `${p}` : `L ${p}`).join(' ')}`;

  const priceChange = coinData.price_change_percentage_24h;
  const isPositive = priceChange >= 0;

  return (
    <Card className="glass border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            {coinName || coinData.name} Chart (7d)
          </CardTitle>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-foreground" />
            ) : (
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={`text-sm font-semibold ${isPositive ? 'text-foreground' : 'text-muted-foreground'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Price Info */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(coinData.current_price)}
            </div>
            <div className="text-xs text-muted-foreground">
              Current Price
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              Vol: {formatPrice(coinData.total_volume)}
            </div>
            <div className="text-xs text-muted-foreground">
              24h Volume
            </div>
          </div>
        </div>

        {/* Chart SVG */}
        <div className="relative w-full bg-card/30 rounded-lg p-2" style={{ height: `${height}px` }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            {/* Grid lines */}
            <line x1="0" y1={padding} x2="100" y2={padding} stroke="currentColor" strokeWidth="0.2" opacity="0.1" />
            <line x1="0" y1={height / 2} x2="100" y2={height / 2} stroke="currentColor" strokeWidth="0.2" opacity="0.1" />
            <line x1="0" y1={height - padding} x2="100" y2={height - padding} stroke="currentColor" strokeWidth="0.2" opacity="0.1" />
            
            {/* Gradient area under line */}
            <defs>
              <linearGradient id={`gradient-${coinId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d={`${pathD} L 100,${height} L 0,${height} Z`}
              fill={`url(#gradient-${coinId})`}
              className={isPositive ? 'text-foreground' : 'text-muted-foreground'}
            />
            
            {/* Price line */}
            <path
              d={pathD}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isPositive ? 'text-foreground' : 'text-muted-foreground'}
            />
          </svg>
        </div>

        {/* Price Range Info */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-muted/20 rounded">
            <div className="font-semibold text-foreground">{formatPrice(coinData.high_24h)}</div>
            <div className="text-muted-foreground">24h High</div>
          </div>
          <div className="text-center p-2 bg-muted/20 rounded">
            <div className="font-semibold text-foreground">{formatPrice(coinData.low_24h)}</div>
            <div className="text-muted-foreground">24h Low</div>
          </div>
          <div className="text-center p-2 bg-muted/20 rounded">
            <div className="font-semibold text-foreground">#{coinData.market_cap_rank}</div>
            <div className="text-muted-foreground">Rank</div>
          </div>
        </div>

        {/* ATH/ATL Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted/10 rounded">
            <div className="text-muted-foreground mb-1">All-Time High</div>
            <div className="font-semibold text-foreground">{formatPrice(coinData.ath)}</div>
            <div className="text-muted-foreground text-[10px]">
              {coinData.ath_change_percentage.toFixed(2)}% from ATH
            </div>
          </div>
          <div className="p-2 bg-muted/10 rounded">
            <div className="text-muted-foreground mb-1">All-Time Low</div>
            <div className="font-semibold text-foreground">{formatPrice(coinData.atl)}</div>
            <div className="text-muted-foreground text-[10px]">
              {((coinData.current_price - coinData.atl) / coinData.atl * 100).toFixed(2)}% from ATL
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveCryptoChart;
