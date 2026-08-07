"use client";

import { useState, KeyboardEvent } from "react";
import { StickyNote, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { InternalNote } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InternalNoteCardProps {
  note: InternalNote;
  currentUserId?: string;
  onAddReaction?: (noteId: string, emoji: string) => void;
  onRemoveReaction?: (noteId: string, emoji: string) => void;
  onEditNote?: (noteId: string, newContent: string) => Promise<void> | void;
  onDeleteNote?: (noteId: string) => Promise<void> | void;
}

export function InternalNoteCard({
  note,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  onEditNote,
  onDeleteNote,
}: InternalNoteCardProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorName =
    note.author_profile?.full_name || t("inbox.collaboration.teammate");

  const isAuthor = Boolean(currentUserId && note.author_id === currentUserId);
  const reactions = note.reactions || [];

  const isEdited =
    new Date(note.updated_at).getTime() - new Date(note.created_at).getTime() > 2000;

  const handleEmojiToggle = (emoji: string) => {
    const existing = reactions.find((r) => r.user_id === currentUserId && r.emoji === emoji);
    if (existing) {
      onRemoveReaction?.(note.id, emoji);
    } else {
      onAddReaction?.(note.id, emoji);
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === note.content) {
      setIsEditing(false);
      setEditContent(note.content);
      return;
    }

    try {
      setIsSaving(true);
      await onEditNote?.(note.id, trimmed);
      setIsEditing(false);
    } catch {
      // Keep edit mode open on error so user doesn't lose text
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(note.content);
    }
  };

  const ConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteNote?.(note.id);
      setShowDeleteConfirm(false);
    } catch {
      // Revert loading on error
    } finally {
      setIsDeleting(false);
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
    <div className="group flex flex-col items-end">
      {/* Author Name + Edit/Delete Actions */}
      <div className="flex items-center gap-1.5 mr-1 mb-1">
        {isAuthor && !isEditing && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={() => {
                setEditContent(note.content);
                setIsEditing(true);
              }}
              title={t("inbox.notesActions.edit")}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              title={t("inbox.notesActions.delete")}
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        {authorName && (
          <span className="text-[11px] font-semibold text-muted-foreground">
            {authorName}
          </span>
        )}
      </div>

      {/* Message Bubble */}
      <div className="relative rounded-2xl rounded-br-md bg-primary text-primary-foreground px-3 py-2 min-w-[200px] max-w-[80%] shadow-2xs">
        {isEditing ? (
          <div className="flex flex-col gap-2 py-0.5">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              autoFocus
              className="w-full text-sm bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 rounded-md p-2 outline-none focus:ring-1 focus:ring-primary-foreground/40 resize-none"
            />
            <div className="flex items-center justify-end gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(note.content);
                }}
                disabled={isSaving}
                className="h-6 px-2 text-[11px] hover:bg-primary-foreground/20 text-primary-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                {t("inbox.notesActions.cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSaving || !editContent.trim()}
                className="h-6 px-2 text-[11px] bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium"
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                {t("inbox.notesActions.save")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm" style={{ overflowWrap: "anywhere" }}>
              {renderContentWithMentions(note.content)}
            </p>

            {/* Timestamp + Edited badge + Yellow StickyNote icon with Tooltip */}
            <div className="mt-1 flex items-center justify-end gap-1 select-none">
              {isEdited && (
                <span className="text-[9px] text-primary-foreground/60 italic mr-0.5">
                  {t("inbox.notesActions.edited")}
                </span>
              )}
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
          </>
        )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("inbox.notesActions.confirmDelete")}</DialogTitle>
            <DialogDescription>
              {t("inbox.notesActions.confirmDeleteDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              {t("inbox.notesActions.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={ConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              {t("inbox.notesActions.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
