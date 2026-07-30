"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

interface ContextualHelpProps {
  title: string;
  content: string;
  badge?: string;
  defaultOpen?: boolean;
}

export function ContextualHelp({
  title,
  content,
  badge = "Dica",
  defaultOpen = false,
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        type="button"
      >
        <HelpCircle className="h-4 w-4" />
        <span>{title}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-border/80 bg-card p-4 shadow-lg backdrop-blur animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {badge}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
