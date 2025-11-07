import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-full p-2 glow-primary">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 px-4">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about crypto... Try our prompts below 👇"
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground"
            disabled={disabled}
          />
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || disabled}
          className="rounded-full gradient-primary hover:opacity-90 transition-opacity w-12 h-12 flex-shrink-0"
        >
          <Send className="w-5 h-5 text-white" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
