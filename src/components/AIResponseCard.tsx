import { useState } from "react";
import { Button } from "./ui/button";
import PriceChart from "./PriceChart";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Minus,
  Save,
  Bell,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AIResponseCardProps {
  data: {
    coin: {
      name: string;
      symbol: string;
      logo: string;
      price: string;
      change: string;
    };
    signal: {
      type: string;
      confidence: number;
      color: string;
    };
    metrics: Array<{
      label: string;
      value: string;
      trend: string;
      status: string;
    }>;
    analysis: {
      sentiment: string;
      technical: string;
      volume: string;
      news: string;
      recommendation: string;
    };
  };
}

const AIResponseCard = ({ data }: AIResponseCardProps) => {
  const [expanded, setExpanded] = useState(true);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-warning" />;
    }
  };

  const getSignalGradient = (color: string) => {
    switch (color) {
      case "success":
        return "gradient-success";
      case "warning":
        return "bg-warning";
      default:
        return "gradient-danger";
    }
  };

  return (
    <div className="glass rounded-2xl border border-primary/20 overflow-hidden animate-scale-in">
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Header - Coin Info */}
      <div className="p-6 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold">
            {data.coin.logo}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {data.coin.symbol} - {data.coin.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{data.coin.price}</span>
              <span
                className={`text-sm font-medium ${
                  data.coin.change.startsWith("+") ? "text-success" : "text-destructive"
                }`}
              >
                {data.coin.change}
              </span>
            </div>
          </div>
        </div>

        {/* Signal Badge */}
        <div
          className={`${getSignalGradient(
            data.signal.color
          )} px-6 py-3 rounded-full flex items-center gap-2 glow-success animate-pulse`}
        >
          <ArrowUpRight className="w-5 h-5 text-white" />
          <div className="text-white">
            <div className="text-sm font-bold">{data.signal.type}</div>
            <div className="text-xs opacity-90">{data.signal.confidence}% Confidence</div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="p-6 border-b border-border/50">
        <PriceChart data={data} />
      </div>

      {/* Metrics Grid */}
      <div className="p-6 border-b border-border/50">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.metrics.map((metric, index) => (
            <div key={index} className="bg-muted/20 rounded-xl p-4 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="text-xl font-bold text-foreground mb-1">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="p-6 border-b border-border/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
        >
          <h4 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">🤖</span>
            AI Analysis Summary
          </h4>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-foreground">Social Sentiment:</strong>{" "}
              <span className="text-muted-foreground">{data.analysis.sentiment}</span>
            </div>
            <div>
              <strong className="text-foreground">Technical Analysis:</strong>{" "}
              <span className="text-muted-foreground">{data.analysis.technical}</span>
            </div>
            <div>
              <strong className="text-foreground">Volume Analysis:</strong>{" "}
              <span className="text-muted-foreground">{data.analysis.volume}</span>
            </div>
            <div>
              <strong className="text-foreground">News Impact:</strong>{" "}
              <span className="text-muted-foreground">{data.analysis.news}</span>
            </div>
            <div className="pt-2 border-t border-border/30">
              <strong className="text-foreground">Recommendation:</strong>{" "}
              <span className="text-muted-foreground">{data.analysis.recommendation}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 flex flex-wrap gap-3">
        <Button className="gradient-primary hover:opacity-90 transition-opacity flex-1 min-w-[150px]">
          <Save className="w-4 h-4 mr-2" />
          Save to Watchlist
        </Button>
        <Button variant="outline" className="flex-1 min-w-[150px] border-primary/30">
          <Bell className="w-4 h-4 mr-2" />
          Set Alert
        </Button>
        <Button variant="ghost" className="flex-1 min-w-[150px]">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default AIResponseCard;
