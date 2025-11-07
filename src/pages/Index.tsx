import { useState } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import PromptChips from "@/components/PromptChips";
import { Sparkles } from "lucide-react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: any;
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Ask me anything about crypto! 🚀",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response with rich data
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Analysis complete",
        timestamp: new Date(),
        data: {
          coin: {
            name: "Bitcoin",
            symbol: "BTC",
            logo: "₿",
            price: "$42,150",
            change: "+3.2%",
          },
          signal: {
            type: "STRONG BUY",
            confidence: 87,
            color: "success",
          },
          metrics: [
            { label: "Sentiment Score", value: "78%", trend: "up", status: "Bullish" },
            { label: "Galaxy Score", value: "85/100", trend: "up", status: "High" },
            { label: "Fear & Greed", value: "72", trend: "neutral", status: "Greed" },
            { label: "Social Volume", value: "+156%", trend: "up", status: "Trending" },
            { label: "Price Target", value: "$45,000", trend: "up", status: "24h" },
            { label: "Risk Level", value: "Medium", trend: "neutral", status: "Moderate" },
          ],
          analysis: {
            sentiment: "Twitter shows 73% bullish mentions with significant whale activity detected.",
            technical: "Breaking resistance at $42K with strong volume. Next target $45K.",
            volume: "24h volume up 156%, indicating strong market interest and momentum.",
            news: "Positive regulatory developments in the EU driving institutional adoption.",
            recommendation: "Strong buy signal with stop loss at $39,500. Target profit at $45,000.",
          },
        },
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CryptoSentiment AI
            </h1>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 pt-24 pb-48 overflow-y-auto">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="glass rounded-2xl px-6 py-4 max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-sm text-muted-foreground">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Input Area at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pb-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-4">
            <PromptChips onPromptClick={handlePromptClick} />
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
