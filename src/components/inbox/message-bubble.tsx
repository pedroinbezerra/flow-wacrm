"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Message, MessageReaction } from "@/types";
import {
  Clock,
  Check,
  CheckCheck,
  XCircle,
  FileText,
  MapPin,
  LayoutTemplate,
  ImageOff,
  CornerDownLeft,
} from "lucide-react";
import { format } from "date-fns";
import { ReplyQuote } from "./reply-quote";
import { MessageReactions } from "./message-reactions";
import { useTranslation } from "@/hooks/use-translation";
import { normalizeMediaSrc } from "@/lib/storage/media-src";

interface MessageBubbleProps {
  message: Message;
  /** Pre-computed quote info for messages that reply to another. */
  reply?: { authorLabel: string; preview: string } | null;
  reactions?: MessageReaction[];
  currentUserId?: string;
  onToggleReaction?: (emoji: string) => void;
}

function StatusIcon({ status }: { status: Message["status"] }) {
  switch (status) {
    case "sending":
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    case "sent":
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    case "failed":
      return <XCircle className="h-3 w-3 text-red-400" />;
    default:
      return null;
  }
}

function MediaUnavailable({ label }: { label: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      <ImageOff className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span>{label} {t("inbox.unavailable")}</span>
    </div>
  );
}

function MediaImage({ url, alt }: { url: string; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      if (!url) return;

      // Proxy URLs need auth fetch to create blob URL
      if (url.startsWith("/api/whatsapp/media/")) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to load media");
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          if (!cancelled) {
            setSrc(blobUrl);
          } else {
            URL.revokeObjectURL(blobUrl);
          }
        } catch {
          if (!cancelled) setError(true);
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        if (!cancelled) {
          setSrc(url);
          setLoading(false);
        }
      }
    }

    void loadImage();
    return () => {
      cancelled = true;
      if (src?.startsWith("blob:")) {
        URL.revokeObjectURL(src);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (error) {
    return (
      <div className="flex h-40 w-60 items-center justify-center rounded-lg bg-muted">
        <ImageOff className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-40 w-60 items-center justify-center rounded-lg bg-muted">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <img
      src={src ?? ""}
      alt={alt}
      className="max-h-64 max-w-60 rounded-lg object-cover"
      onError={() => setError(true)}
    />
  );
}

function MessageContent({ message }: { message: Message }) {
  const { t } = useTranslation();
  // Rewrites any pre-migration-040 direct public Storage URL to our
  // authenticated proxy path; already-proxied paths and the inbound
  // Meta media proxy (/api/whatsapp/media/...) pass through unchanged.
  const mediaSrc = normalizeMediaSrc(message.media_url);

  switch (message.content_type) {
    case "text":
      return (
        <p className="whitespace-pre-wrap text-sm" style={{ overflowWrap: "anywhere" }}>
          {message.content_text}
        </p>
      );

    case "image":
      return (
        <div>
          {mediaSrc ? (
            <MediaImage url={mediaSrc} alt="Shared image" />
          ) : (
            <MediaUnavailable label={t("inbox.messageTypes.image")} />
          )}
          {message.content_text && (
            <p className="mt-1 whitespace-pre-wrap text-sm" style={{ overflowWrap: "anywhere" }}>
              {message.content_text}
            </p>
          )}
        </div>
      );

    case "video":
      return (
        <div>
          {mediaSrc ? (
            <video
              src={mediaSrc}
              controls
              className="max-h-64 max-w-60 rounded-lg"
            />
          ) : (
            <MediaUnavailable label={t("inbox.messageTypes.video")} />
          )}
          {message.content_text && (
            <p className="mt-1 whitespace-pre-wrap text-sm" style={{ overflowWrap: "anywhere" }}>
              {message.content_text}
            </p>
          )}
        </div>
      );

    case "audio":
      return (
        <div>
          {mediaSrc ? (
            <audio src={mediaSrc} controls className="max-w-60" />
          ) : (
            <MediaUnavailable label={t("inbox.messageTypes.audio")} />
          )}
        </div>
      );

    case "document":
      if (!mediaSrc) {
        return <MediaUnavailable label={message.content_text || t("inbox.messageTypes.document")} />;
      }
      return (
        <a
          href={mediaSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm hover:bg-muted"
        >
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {message.content_text || t("inbox.messageTypes.document")}
          </span>
        </a>
      );

    case "template":
      return (
        <div>
          <span className="mb-1 inline-flex items-center gap-1 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            <LayoutTemplate className="h-3 w-3" />
            {t("inbox.messageTypes.template")}
          </span>
          {message.content_text && (
            <p className="mt-1 whitespace-pre-wrap text-sm" style={{ overflowWrap: "anywhere" }}>
              {message.content_text}
            </p>
          )}
        </div>
      );

    case "location":
      return (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{message.content_text || t("inbox.messageTypes.location")}</span>
        </div>
      );

    case "interactive": {
      // Customer tapped a reply button or list row on a message the bot
      // sent. We show the tapped option's title (already in content_text,
      // set by parseMessageContent in the webhook) with a small affordance
      // so agents reading the inbox can tell at a glance that this is a
      // tap rather than the customer typing the same words.
      return (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <CornerDownLeft className="h-3 w-3" />
            {t("inbox.messageTypes.interactive")}
          </span>
          <p className="whitespace-pre-wrap text-sm" style={{ overflowWrap: "anywhere" }}>
            {message.content_text || t("inbox.messageTypes.interactiveReply")}
          </p>
        </div>
      );
    }

    default:
      return (
        <p className="whitespace-pre-wrap text-sm" style={{ overflowWrap: "anywhere" }}>
          {message.content_text || t("inbox.messageTypes.unsupported")}
        </p>
      );
  }
}

export function MessageBubble({
  message,
  reply,
  reactions,
  currentUserId,
  onToggleReaction,
}: MessageBubbleProps) {
  const isAgent = message.sender_type === "agent" || message.sender_type === "bot";
  const time = format(new Date(message.created_at), "HH:mm");

  // Row alignment + width cap are owned by <MessageActions> so its hover
  // group matches the bubble's content area, not the full row.
  return (
    <div
      className={cn(
        "flex flex-col",
        isAgent ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "relative rounded-2xl px-3 py-2",
          isAgent
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        {reply && (
          <ReplyQuote
            authorLabel={reply.authorLabel}
            preview={reply.preview}
            onPrimary={isAgent}
          />
        )}
        <MessageContent message={message} />
        <div
          className={cn(
            "mt-1 flex items-center gap-1",
            isAgent ? "justify-end" : "justify-start",
          )}
        >
          <span
            className={cn(
              "text-[10px]",
              // Outbound bubbles sit on the primary fill, so the
              // timestamp must read against that (not the neutral
              // foreground) — otherwise it goes low-contrast in light
              // mode. Inbound bubbles use the muted surface.
              isAgent ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {time}
          </span>
          {isAgent && <StatusIcon status={message.status} />}
        </div>
      </div>
      {reactions && reactions.length > 0 && onToggleReaction && (
        <MessageReactions
          reactions={reactions}
          currentUserId={currentUserId}
          onToggle={onToggleReaction}
        />
      )}
    </div>
  );
}
