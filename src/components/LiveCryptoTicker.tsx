import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { getCryptoPrices, formatPrice, formatPercentage, type CoinMarketData } from "@/lib/crypto-api";

const LiveCryptoTicker = () => {
  const [cryptoData, setCryptoData] = useState<CoinMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getCryptoPrices(['bitcoin', 'ethereum', 'cardano', 'solana', 'ripple']);
        setCryptoData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch crypto data:', err);
        setError('Failed to load crypto data');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="glass border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading live data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass border-destructive/20">
        <CardContent className="py-4">
          <div className="text-sm text-destructive text-center">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
          Live Market Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {cryptoData.map((coin) => {
            const percentage = formatPercentage(coin.price_change_percentage_24h);
            return (
              <div
                key={coin.id}
                className="flex flex-col p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <img src={coin.image} alt={coin.name} className="w-5 h-5" />
                  <span className="text-xs font-semibold text-foreground">
                    {coin.symbol.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-bold text-foreground mb-1">
                  {formatPrice(coin.current_price)}
                </div>
                <div className={`text-xs font-medium flex items-center gap-1 ${percentage.color}`}>
                  {coin.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {percentage.text}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveCryptoTicker;
