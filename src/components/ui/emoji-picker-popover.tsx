"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const RECENT_EMOJIS_KEY = "flowhub:recent_emojis";
const DEFAULT_RECENTS = ["👍", "❤️", "😂", "👀", "✅"];

const ALL_EMOJIS = [
  // Populares & Reações
  "👍", "❤️", "😂", "🔥", "🎉", "👏", "💯", "👀", "✅", "🚀", 
  "💡", "📌", "⚠️", "❌", "🤔", "💬", "⚡", "🎯", "➕", "🤝", 
  "📊", "🏆", "🙌", "🤩", "🙏", "💪", "⭐", "❓", "❗", "📞", 
  "✉️", "⏳", "🔒", "📢", "🟢", "🔴", "🟡", "💼", "💰", "📝"
];

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
}

export function EmojiPickerPopover({
  onSelectEmoji,
  triggerClassName,
  align = "start",
}: EmojiPickerPopoverProps) {
  const [recents, setRecents] = useState<string[]>(DEFAULT_RECENTS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecents(parsed.slice(0, 5));
        }
      }
    } catch {
      // Best-effort storage load
    }
  }, []);

  const handlePick = (emoji: string) => {
    onSelectEmoji(emoji);
    setOpen(false);

    // Save to recents
    const updated = [emoji, ...recents.filter((e) => e !== emoji)].slice(0, 5);
    setRecents(updated);
    try {
      localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(updated));
    } catch {}
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/60",
              triggerClassName
            )}
            title="Adicionar reação"
          >
            <Smile className="h-4 w-4" />
          </button>
        }
      />
      <PopoverContent align={align} className="w-72 p-3 bg-popover border-border shadow-xl rounded-xl">
        {/* Recent Emojis */}
        <div className="mb-2.5 pb-2 border-b border-border/50">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            <Clock className="h-3 w-3" />
            <span>Recentes</span>
          </div>
          <div className="flex items-center gap-1">
            {recents.map((emoji) => (
              <button
                key={`recent-${emoji}`}
                type="button"
                onClick={() => handlePick(emoji)}
                className="h-8 w-8 text-base flex items-center justify-center rounded-lg hover:bg-accent transition-transform hover:scale-110 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* All Emojis Grid */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Todos os Emojis
          </div>
          <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto pr-1">
            {ALL_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handlePick(emoji)}
                className="h-8 w-8 text-base flex items-center justify-center rounded-lg hover:bg-accent transition-transform hover:scale-110 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
