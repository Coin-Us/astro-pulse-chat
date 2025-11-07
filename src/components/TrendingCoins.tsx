import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import { getTrendingCoins, type TrendingCoin } from "@/lib/crypto-api";

const TrendingCoins = () => {
  const [trending, setTrending] = useState<TrendingCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        const data = await getTrendingCoins();
        setTrending(data.slice(0, 5)); // Top 5 trending
        setError(null);
      } catch (err) {
        console.error('Failed to fetch trending coins:', err);
        setError('Failed to load trending data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
    const interval = setInterval(fetchTrending, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="glass border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading trending...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null; // Silently fail for trending (not critical)
  }

  return (
    <Card className="glass border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trending.map((coin, index) => (
            <div
              key={coin.item.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">
                  {index + 1}
                </span>
                <img src={coin.item.small} alt={coin.item.name} className="w-6 h-6" />
                <div>
                  <div className="text-sm font-semibold">{coin.item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {coin.item.symbol.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  Rank #{coin.item.market_cap_rank || 'N/A'}
                </div>
                <div className="text-xs font-medium text-primary">
                  {coin.item.price_btc.toFixed(8)} BTC
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingCoins;
