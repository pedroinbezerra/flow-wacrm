"use client";

import { StickyNote } from "lucide-react";
import { format } from "date-fns";
import type { InternalNote } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InternalNoteCardProps {
  note: InternalNote;
  currentUserId?: string;
  onAddReaction?: (noteId: string, emoji: string) => void;
  onRemoveReaction?: (noteId: string, emoji: string) => void;
}

export function InternalNoteCard({
  note,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}: InternalNoteCardProps) {
  const { t } = useTranslation();
  const authorName =
    note.author_profile?.full_name || t("inbox.collaboration.teammate");

  const reactions = note.reactions || [];

  const handleEmojiToggle = (emoji: string) => {
    const existing = reactions.find((r) => r.user_id === currentUserId && r.emoji === emoji);
    if (existing) {
      onRemoveReaction?.(note.id, emoji);
    } else {
      onAddReaction?.(note.id, emoji);
    }
  };

  const renderContentWithMentions = (content: string) => {
    const parts = content.split(/(@[a-zA-Z0-9_\u00C0-\u024F]+(?:\s+[a-zA-Z0-9_\u00C0-\u024F]+)?)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={i}
            className="font-semibold underline underline-offset-2 decoration-primary-foreground/50"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const time = format(new Date(note.created_at), "HH:mm");

  return (
    <div className="flex flex-col items-end">
      {/* Author Name */}
      {authorName && (
        <span className="text-[11px] font-semibold text-muted-foreground mr-1 mb-1">
          {authorName}
        </span>
      )}

      {/* Message Bubble following standard outgoing bubble */}
      <div className="relative rounded-2xl rounded-br-md bg-primary text-primary-foreground px-3 py-2 max-w-[80%] shadow-2xs">
        <p className="whitespace-pre-wrap text-sm" style={{ overflowWrap: "anywhere" }}>
          {renderContentWithMentions(note.content)}
        </p>

        {/* Timestamp + Yellow StickyNote icon with Tooltip */}
        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[10px] text-primary-foreground/70">
            {time}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center cursor-help">
                <StickyNote className="h-3.5 w-3.5 text-amber-300 fill-amber-300/30 shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px] font-medium">
                Nota interna (visível apenas para a equipe)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
      </div>




      {/* Reactions */}
      {reactions.length > 0 && (
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {reactions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleEmojiToggle(r.emoji)}
              className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                r.user_id === currentUserId
                  ? "bg-primary/20 border-primary text-primary font-medium"
                  : "bg-muted/50 border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <span>{r.emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}



