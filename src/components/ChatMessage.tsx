import { Message } from "@/pages/Index";
import { User, Bot } from "lucide-react";
import AIResponseCard from "./AIResponseCard";
import LiveCryptoChart from "./LiveCryptoChart";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

// Extract coin ID from message content
const extractCoinFromMessage = (content: string): { coinId: string; coinName: string } | null => {
  const lowerContent = content.toLowerCase();
  
  const coinMap: { [key: string]: { id: string; name: string } } = {
    'bitcoin': { id: 'bitcoin', name: 'Bitcoin' },
    'btc': { id: 'bitcoin', name: 'Bitcoin' },
    'ethereum': { id: 'ethereum', name: 'Ethereum' },
    'eth': { id: 'ethereum', name: 'Ethereum' },
    'cardano': { id: 'cardano', name: 'Cardano' },
    'ada': { id: 'cardano', name: 'Cardano' },
    'solana': { id: 'solana', name: 'Solana' },
    'sol': { id: 'solana', name: 'Solana' },
    'ripple': { id: 'ripple', name: 'XRP' },
    'xrp': { id: 'ripple', name: 'XRP' },
    'dogecoin': { id: 'dogecoin', name: 'Dogecoin' },
    'doge': { id: 'dogecoin', name: 'Dogecoin' },
    'polkadot': { id: 'polkadot', name: 'Polkadot' },
    'dot': { id: 'polkadot', name: 'Polkadot' },
    'avalanche': { id: 'avalanche-2', name: 'Avalanche' },
    'avax': { id: 'avalanche-2', name: 'Avalanche' },
    'polygon': { id: 'matic-network', name: 'Polygon' },
    'matic': { id: 'matic-network', name: 'Polygon' },
    'chainlink': { id: 'chainlink', name: 'Chainlink' },
    'link': { id: 'chainlink', name: 'Chainlink' },
    'binance': { id: 'binancecoin', name: 'BNB' },
    'bnb': { id: 'binancecoin', name: 'BNB' },
  };

  for (const [keyword, coin] of Object.entries(coinMap)) {
    if (lowerContent.includes(keyword)) {
      return { coinId: coin.id, coinName: coin.name };
    }
  }

  return null;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const detectedCoin = !isUser ? extractCoinFromMessage(message.content) : null;

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
      style={{
        animation: "fadeIn 0.5s ease-out forwards",
        opacity: 0,
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className={`flex gap-3 max-w-3xl w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser ? "gradient-primary" : "bg-card border border-primary/30"
          }`}
        >
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-primary" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-3 flex-1">
          <div
            className={`px-6 py-3 ${
              isUser
                ? "gradient-primary text-white rounded-full"
                : "glass rounded-2xl border border-border"
            }`}
          >
            {isUser ? (
              <p className="text-sm">{message.content}</p>
            ) : (
              <div className="text-sm prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Live Chart - Show when coin is detected in AI response */}
          {!isUser && detectedCoin && message.content && (
            <div className="mt-2">
              <LiveCryptoChart 
                coinId={detectedCoin.coinId} 
                coinName={detectedCoin.coinName}
              />
            </div>
          )}

          {/* Rich AI Response Card */}
          {!isUser && message.data && (
            <div className="mt-2">
              <AIResponseCard data={message.data} />
            </div>
          )}

          {/* Timestamp */}
          <span className={`text-xs text-muted-foreground ${isUser ? "text-right" : "text-left"}`}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
