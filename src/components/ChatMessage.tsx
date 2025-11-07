import { Message } from "@/pages/Index";
import { User, Bot } from "lucide-react";
import AIResponseCard from "./AIResponseCard";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

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

      <div className={`flex gap-3 max-w-2xl ${isUser ? "flex-row-reverse" : "flex-row"}`}>
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
        <div className="flex flex-col gap-1">
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

          {/* Rich AI Response Card */}
          {!isUser && message.data && (
            <div className="mt-4">
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
