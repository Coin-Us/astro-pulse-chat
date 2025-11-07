import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceChartProps {
  data: {
    coin: {
      name: string;
      symbol: string;
      price: string;
    };
    signal: {
      type: string;
      confidence: number;
      color: string;
    };
    priceData?: Array<{
      time: string;
      price: number;
    }>;
  };
}

// Generate realistic price data if not provided
const generatePriceData = (currentPrice: number) => {
  const data = [];
  const basePrice = currentPrice * 0.95; // Start 5% lower
  const volatility = currentPrice * 0.02; // 2% volatility
  
  for (let i = 0; i < 24; i++) {
    const trend = (currentPrice - basePrice) / 24; // Upward trend to current price
    const randomness = (Math.random() - 0.5) * volatility;
    const price = basePrice + (trend * i) + randomness;
    
    data.push({
      time: `${i}:00`,
      price: parseFloat(price.toFixed(2)),
    });
  }
  
  return data;
};

const PriceChart = ({ data }: PriceChartProps) => {
  const currentPrice = parseFloat(data.coin.price.replace(/[$,]/g, ""));
  const priceData = data.priceData || generatePriceData(currentPrice);
  
  const isBuySignal = data.signal.type.includes("BUY");
  const signalColor = isBuySignal ? "#10b981" : "#ef4444";
  
  return (
    <div className="w-full bg-black rounded-xl p-6 border border-border/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            {data.coin.symbol} Price Chart
          </h3>
          <p className="text-sm text-gray-400">Last 24 hours</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          isBuySignal ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          {isBuySignal ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
          <span className={`font-bold ${
            isBuySignal ? 'text-green-500' : 'text-red-500'
          }`}>
            {data.signal.type}
          </span>
          <span className="text-white text-sm">
            ({data.signal.confidence}% confidence)
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="time" 
            stroke="#888"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#888"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#000', 
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <ReferenceLine 
            y={currentPrice} 
            stroke={signalColor} 
            strokeDasharray="5 5"
            label={{ 
              value: `Current: $${currentPrice}`, 
              fill: signalColor,
              fontSize: 12,
              position: 'right'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#ffffff" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: signalColor }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400">Current Price</p>
            <p className="text-lg font-bold text-white">{data.coin.price}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">24h High</p>
            <p className="text-lg font-bold text-white">
              ${Math.max(...priceData.map(d => d.price)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">24h Low</p>
            <p className="text-lg font-bold text-white">
              ${Math.min(...priceData.map(d => d.price)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
