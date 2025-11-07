import { Button } from "./ui/button";

interface PromptChipsProps {
  onPromptClick: (prompt: string) => void;
}

const prompts = [
  { emoji: "📊", text: "Analyze Bitcoin sentiment" },
  { emoji: "🎯", text: "Give me trading signals for ETH" },
  { emoji: "🔥", text: "What's trending in crypto today?" },
  { emoji: "💎", text: "Find me hidden gems under $1" },
  { emoji: "⚠️", text: "Show me high-risk opportunities" },
  { emoji: "🌊", text: "What's the market fear & greed level?" },
  { emoji: "🚀", text: "Which altcoins are pumping?" },
  { emoji: "📈", text: "Compare BTC vs ETH sentiment" },
];

const PromptChips = ({ onPromptClick }: PromptChipsProps) => {
  return (
    <div className="overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onPromptClick(prompt.text)}
            className="glass border-primary/30 hover:border-primary/60 hover-scale hover:glow-primary transition-all whitespace-nowrap rounded-full"
          >
            <span className="mr-1">{prompt.emoji}</span>
            {prompt.text}
          </Button>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PromptChips;
