import { useState, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import PromptChips from "@/components/PromptChips";
import { Sparkles } from "lucide-react";
import { sendChatMessage, streamOpenAIResponse, ChatMessage as OpenAIChatMessage } from "@/lib/openai";
import { toast } from "sonner";

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
  const conversationHistory = useRef<OpenAIChatMessage[]>([]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Add user message to conversation history
    conversationHistory.current.push({
      role: "user",
      content,
    });

    try {
      // Create a placeholder for the AI response
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Get streaming response from OpenAI
      const response = await sendChatMessage(content, conversationHistory.current);
      let fullResponse = "";

      // Stream the response
      for await (const chunk of streamOpenAIResponse(response)) {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: fullResponse }
              : msg
          )
        );
      }

      // Add assistant response to conversation history
      conversationHistory.current.push({
        role: "assistant",
        content: fullResponse,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      setIsLoading(false);
      
      // Remove the AI placeholder message if there was an error
      setMessages((prev) => prev.filter(msg => msg.role !== "assistant" || msg.content !== ""));
    }
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
