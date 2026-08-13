"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { usePresence } from "@/hooks/use-presence";
import { PresenceDot } from "@/components/presence/presence-dot";
import { presenceLabel } from "@/lib/presence";
import { cn } from "@/lib/utils";
import type {
  Conversation,
  ConversationBoard,
  ConversationBoardItem,
  ConversationBoardLaneConfig,
  Message,
  MessageReaction,
  Contact,
  ConversationStatus,
  MessageTemplate,
  Profile,
} from "@/types";
import {
  MessageSquare,
  ChevronDown,
  UserPlus,
  Check,
  Clock,
  ArrowLeft,
  RefreshCw,
  PanelRightOpen,
  PanelRightClose,
  PanelLeftOpen,
  PanelLeftClose,
  PanelLeft,
  PanelRight,
  Pin,

  Clock3,
  FolderKanban,
  Bot,
  Sparkles,
  UserCheck,
  User,
  HelpCircle,
  Lock,
} from "lucide-react";
import { format, isToday, isYesterday, differenceInHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ParticipantBar } from "./participant-bar";
import { InternalNoteCard } from "./internal-notes-stream";
import { HelpRequestModal } from "./help-request-modal";
import { useCollaborativePresence } from "@/hooks/use-collaborative-presence";
import type { InternalNote, ConversationTimelineEvent } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageBubble } from "./message-bubble";
import { MessageActions } from "./message-actions";
import {
  MessageComposer,
  CHAT_MEDIA_BUCKET,
  type SendMediaPayload,
} from "./message-composer";
import { deleteAccountMedia } from "@/lib/storage/upload-media";
import { TemplatePicker } from "./template-picker";
import { buildReplyPreview } from "./reply-quote";
import { toast } from "sonner";

interface ReplyDraft {
  id: string;
  authorLabel: string;
  preview: string;
}

function renderTemplateBody(body: string, params: string[]): string {
  return body.replace(/\{\{(\d+)\}\}/g, (_, raw) => {
    const idx = Number(raw) - 1;
    return params[idx] ?? `{{${raw}}}`;
  });
}

interface MessageThreadProps {
  conversation: Conversation | null;
  contact: Contact | null;
  messages: Message[];
  onMessagesLoaded: (messages: Message[]) => void;
  onNewMessage: (message: Message) => void;
  onUpdateMessage: (id: string, updates: Partial<Message>) => void;
  onStatusChange: (conversationId: string, status: ConversationStatus) => void;
  onAssignChange: (
    conversationId: string,
    assignedAgentId: string | null,
  ) => void;
  onBoardItemChange?: (item: ConversationBoardItem) => void;
  /**
   * On mobile, the thread is shown full-screen with the conversation list
   * hidden. This callback lets the page deselect the active conversation
   * and reveal the list again. Rendered as a back-arrow in the header on
   * mobile only.
   */
  onBack?: () => void;
  /**
   * Increment to force the messages + reactions fetch effects to refire.
   * Parent bumps this on realtime reconnect / tab visibility → visible
   * so the open thread catches up on any events sent while the WS was
   * disconnected or the tab was throttled. Optional so existing callers
   * keep working.
   */
  resyncToken?: number;
  /**
   * Fired by the manual-refresh button in the thread header. The parent
   * typically bumps the same `resyncToken` it controls — this gives the
   * user a way to force a refetch when they suspect realtime missed an
   * event (or they're impatient). Optional so existing callers keep
   * working; the button is only rendered when this is provided.
   */
  onRefresh?: () => void;
  /**
   * Desktop-only contact-panel toggle. The page owns the open/closed
   * state (it's the one that renders the sidebar), so the thread just
   * reflects it and asks the page to flip it. Both optional so existing
   * callers keep working; the toggle button only renders when
   * `onToggleContactPanel` is wired up.
   */
  contactPanelOpen?: boolean;
  onToggleContactPanel?: () => void;
  listPanelOpen?: boolean;
  onToggleListPanel?: () => void;
}


function formatDateSeparator(dateStr: string, t: ReturnType<typeof useTranslation>["t"]): string {
  const date = new Date(dateStr);
  if (isToday(date)) return t("inbox.today");
  if (isYesterday(date)) return t("inbox.yesterday");
  return format(date, "MMMM d, yyyy");
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  for (const msg of messages) {
    const day = format(new Date(msg.created_at), "yyyy-MM-dd");
    if (day !== currentDate) {
      currentDate = day;
      groups.push({ date: msg.created_at, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

function sortBoardLanes(lanes: ConversationBoardLaneConfig[] = []): ConversationBoardLaneConfig[] {
  return [...lanes].sort(
    (a, b) =>
      a.position - b.position ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

const STATUS_OPTIONS: (t: ReturnType<typeof useTranslation>["t"]) => { label: string; value: ConversationStatus; color: string }[] = (t) => [
  { label: t("inbox.status.open"), value: "open", color: "text-emerald-400" },
  { label: t("inbox.status.pending"), value: "pending", color: "text-red-400" },
  { label: t("inbox.status.closed"), value: "closed", color: "text-muted-foreground" },
];

/**
 * WhatsApp-style doodle background applied to the chat area (both the
 * active thread and the empty state). The SVG tile lives at
 * `/public/inbox-doodle.svg`; the slate-950 colour sits underneath so
 * the doodles read as a subtle pattern rather than a stark grid.
 *
 * Defined once at module scope so the two render paths can't drift —
 * if we ever switch the asset, both spots update together.
 */
const DOODLE_BG_CLASSES =
  "bg-background bg-[url('/inbox-doodle.svg')] bg-repeat";

export function MessageThread({
  conversation,
  contact,
  messages,
  onMessagesLoaded,
  onNewMessage,
  onUpdateMessage,
  onStatusChange,
  onAssignChange,
  onBoardItemChange,
  onBack,
  resyncToken = 0,
  onRefresh,
  contactPanelOpen,
  onToggleContactPanel,
  listPanelOpen,
  onToggleListPanel,
}: MessageThreadProps) {

  const { t } = useTranslation();
  const { user } = useAuth();
  const { getPresence, getRow, now } = usePresence();
  const statusOptions = STATUS_OPTIONS(t);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  // Purely visual spin state for the manual-refresh button. The actual
  // refetch is fire-and-forget through `onRefresh` (which bumps the
  // parent's resyncToken); the 700ms spin is just feedback so the click
  // doesn't feel like a no-op. Cleared via the timer ref on unmount.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current !== null) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);
  const handleRefreshClick = useCallback(() => {
    if (isRefreshing || !onRefresh) return;
    setIsRefreshing(true);
    onRefresh();
    refreshTimerRef.current = setTimeout(() => {
      setIsRefreshing(false);
      refreshTimerRef.current = null;
    }, 700);
  }, [isRefreshing, onRefresh]);
  const [replyTo, setReplyTo] = useState<ReplyDraft | null>(null);
  const [defaultBoardItem, setDefaultBoardItem] = useState<ConversationBoardItem | null>(null);
  const [updatingBoardFlags, setUpdatingBoardFlags] = useState(false);
  const [linkBoardOpen, setLinkBoardOpen] = useState(false);
  const [availableBoards, setAvailableBoards] = useState<ConversationBoard[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [linkingBoard, setLinkingBoard] = useState(false);
  const [linkBoardId, setLinkBoardId] = useState("");
  const [linkLaneId, setLinkLaneId] = useState("");

  // Collaborative inbox states
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<ConversationTimelineEvent[]>([]);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<"message" | "note">("message");

  const handleNoteInserted = useCallback((newNote: InternalNote) => {
    setInternalNotes((prev) => {
      if (prev.some((n) => n.id === newNote.id)) return prev;
      return [...prev, newNote];
    });
  }, []);

  const handleNoteUpdated = useCallback((updatedNote: InternalNote) => {
    setInternalNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? { ...n, ...updatedNote } : n))
    );
  }, []);

  const handleNoteDeleted = useCallback((deletedNoteId: string) => {
    setInternalNotes((prev) => prev.filter((n) => n.id !== deletedNoteId));
  }, []);

  const handleTimelineInserted = useCallback((newEvent: ConversationTimelineEvent) => {
    setTimelineEvents((prev) => {
      if (prev.some((e) => e.id === newEvent.id)) return prev;
      return [newEvent, ...prev];
    });
  }, []);

  const { activeParticipants, reservationState, updateActivity } = useCollaborativePresence({
    conversationId: conversation?.id ?? null,
    enabled: Boolean(conversation?.id),
    onNoteInserted: handleNoteInserted,
    onNoteUpdated: handleNoteUpdated,
    onNoteDeleted: handleNoteDeleted,
    onTimelineEventInserted: handleTimelineInserted,
  });

  const handleEditNote = useCallback(
    async (noteId: string, newContent: string) => {
      if (!conversation?.id) return;
      const previousNotes = internalNotes;
      const now = new Date().toISOString();

      // Optimistic update
      setInternalNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, content: newContent, updated_at: now } : n
        )
      );

      try {
        const res = await fetch(`/api/conversations/${conversation.id}/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || t("inbox.notesActions.updateError"));
        }

        const data: InternalNote = await res.json();
        setInternalNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, ...data } : n))
        );
        toast.success(t("inbox.notesActions.updateSuccess"));
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("flowhub:refresh_timeline", {
              detail: { conversationId: conversation.id },
            })
          );
        }
      } catch (err: any) {
        setInternalNotes(previousNotes);
        toast.error(err.message || t("inbox.notesActions.updateError"));
        throw err;
      }
    },
    [conversation?.id, internalNotes, t]
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      if (!conversation?.id) return;
      const previousNotes = internalNotes;

      // Optimistic delete
      setInternalNotes((prev) => prev.filter((n) => n.id !== noteId));

      try {
        const res = await fetch(`/api/conversations/${conversation.id}/notes/${noteId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || t("inbox.notesActions.deleteError"));
        }

        toast.success(t("inbox.notesActions.deleteSuccess"));
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("flowhub:refresh_timeline", {
              detail: { conversationId: conversation.id },
            })
          );
        }
      } catch (err: any) {
        setInternalNotes(previousNotes);
        toast.error(err.message || t("inbox.notesActions.deleteError"));
        throw err;
      }
    },
    [conversation?.id, internalNotes, t]
  );

  // Fetch internal notes for current conversation
  useEffect(() => {
    const convId = conversation?.id;
    if (!convId) return;
    async function loadNotes() {
      try {
        const res = await fetch(`/api/conversations/${convId}/notes`);
        if (res.ok) {
          const data = await res.json();
          setInternalNotes(data || []);
        }
      } catch (err) {
        console.error("Failed to load internal notes:", err);
      }
    }
    loadNotes();

    const handleRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<{ conversationId?: string }>;
      if (!customEvent.detail?.conversationId || customEvent.detail.conversationId === convId) {
        loadNotes();
      }
    };
    window.addEventListener("flowhub:refresh_notes", handleRefresh);
    return () => {
      window.removeEventListener("flowhub:refresh_notes", handleRefresh);
    };
  }, [conversation?.id]);



  // Profiles are bounded by RLS to rows the current user is allowed to
  useEffect(() => {
    let cancelled = false;
    async function loadTeamProfiles() {
      try {
        const res = await fetch("/api/account/members");
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.members) ? json.members : Array.isArray(json) ? json : [];
          if (!cancelled && list.length > 0) {
            setProfiles(list);
            return;
          }
        }
      } catch {}

      const supabase = createClient();
      supabase
        .from("profiles")
        .select("*")
        .order("full_name")
        .then(({ data, error }) => {
          if (cancelled) return;
          if (!error && data) {
            setProfiles(data as Profile[]);
          }
        });
    }
    loadTeamProfiles();
    return () => {
      cancelled = true;
    };
  }, []);


  // 24-hour session timer
  const sessionInfo = useMemo(() => {
    if (!messages.length) return { expired: false, remaining: "" };

    // Find last customer message
    const lastCustomerMsg = [...messages]
      .reverse()
      .find((m) => m.sender_type === "customer");

    if (!lastCustomerMsg) {
      return { expired: true, remaining: t("inbox.session.noCustomerMessages") };
    }

    const hoursSince = differenceInHours(new Date(), new Date(lastCustomerMsg.created_at));
    const expired = hoursSince >= 24;

    if (expired) {
      return { expired: true, remaining: t("inbox.session.expired") };
    }

    const hoursLeft = 24 - hoursSince;
    const remaining =
      hoursLeft >= 1
        ? t("inbox.session.remainingHours", { hours: Math.floor(hoursLeft) })
        : t("inbox.session.remainingMinutes", {
            minutes: Math.floor(hoursLeft * 60),
          });

    return { expired, remaining };
  }, [messages, t]);

  // Store latest callback in a ref so fetchMessages doesn't need to
  // depend on `onMessagesLoaded` — otherwise parent re-renders cause
  // fetchMessages to change → useEffect re-fires → refetch → realtime
  // UPDATE on conversations.unread_count → parent re-renders → LOOP.
  // The ref is written inside an effect so the mutation doesn't happen
  // during render (React 19 refs rule); consumers only read `.current`
  // inside the async fetch completion, which runs after the render.
  const onMessagesLoadedRef = useRef(onMessagesLoaded);
  useEffect(() => {
    onMessagesLoadedRef.current = onMessagesLoaded;
  });

  const conversationId = conversation?.id;
  const hasUnread = (conversation?.unread_count ?? 0) > 0;
  const selectedLinkBoard = useMemo(
    () => availableBoards.find((board) => board.id === linkBoardId) ?? null,
    [availableBoards, linkBoardId],
  );
  const selectedLinkBoardName = useMemo(
    () => selectedLinkBoard?.name ?? t("boards.selectBoard"),
    [selectedLinkBoard, t],
  );
  const selectedLinkBoardLanes = useMemo(
    () => sortBoardLanes(selectedLinkBoard?.lanes ?? []),
    [selectedLinkBoard?.lanes],
  );
  const selectedLinkLaneName = useMemo(
    () =>
      selectedLinkBoardLanes.find((lane) => lane.id === linkLaneId)?.name ??
      t("inbox.board.selectLane"),
    [linkLaneId, selectedLinkBoardLanes, t],
  );

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/conversation-board-items/by-conversation?conversationId=${encodeURIComponent(conversationId)}`,
        );
        const payload = (await res.json().catch(() => null)) as
          | { item?: ConversationBoardItem | null; error?: string }
          | null;

        if (cancelled) return;
        if (!res.ok) {
          console.error(
            "[inbox] failed to fetch board item:",
            payload?.error ?? `HTTP ${res.status}`,
          );
          setDefaultBoardItem(null);
          return;
        }
        setDefaultBoardItem(payload?.item ?? null);
      } catch (error) {
        if (cancelled) return;
        console.error("[inbox] failed to fetch board item:", error);
        setDefaultBoardItem(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, resyncToken]);

  // Fetch messages whenever the selected conversation changes. Kept
  // separate from the unread-reset effect so that incoming messages
  // arriving while the thread is open don't trigger a full refetch —
  // they only flip hasUnread, which only the reset effect listens to.
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        if (res.ok) {
          const payload = await res.json();
          const list = Array.isArray(payload) ? payload : payload.messages || [];
          if (!cancelled) {
            onMessagesLoadedRef.current(list);
            if (payload.clearedOrphanPreview && typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("flowhub:refresh_conversations"));
            }
          }
        } else {
          const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

          if (!cancelled) {
            if (error) {
              console.error("Failed to fetch messages:", error);
            } else {
              onMessagesLoadedRef.current(data ?? []);
            }
          }
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, resyncToken]);

  // Fallback pull while a thread is open. Realtime is still the primary
  // path, but background-tab throttling or transient WS drops can miss
  // events without a hard reconnect; this keeps the visible thread fresh.
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    let cancelled = false;

    const poll = async () => {
      if (document.visibilityState !== "visible") return;

      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        if (res.ok) {
          const payload = await res.json();
          const list = Array.isArray(payload) ? payload : payload.messages || [];
          if (!cancelled) {
            onMessagesLoadedRef.current(list);
          }
        } else {
          const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

          if (!cancelled && !error) {
            onMessagesLoadedRef.current((data ?? []) as Message[]);
          }
        }
      } catch (err) {
        console.error("Polling messages failed:", err);
      }
    };

    const timerId = window.setInterval(() => {
      void poll();
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(timerId);
    };
  }, [conversationId]);

  // Reactions fetch — pulls the current state from the DB. Kept separate
  // from the channel subscription below so a `resyncToken` bump just
  // refetches the rows without also tearing down and rebuilding the
  // realtime channel.
  useEffect(() => {
    if (!conversationId) {
      setReactions([]);
      return;
    }
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("message_reactions")
        .select("*")
        .eq("conversation_id", conversationId);
      if (cancelled) return;
      if (error) {
        console.error("Failed to fetch reactions:", error);
        return;
      }
      setReactions((data as MessageReaction[]) ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, resyncToken]);

  // Reactions realtime subscription per conversation. Subscribing here
  // (not at the page level) keeps the channel scoped to the visible
  // conversation and avoids cross-conversation chatter on a busy inbox.
  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`reactions:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message_reactions",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as MessageReaction;
          setReactions((prev) => {
            if (prev.some((r) => r.id === row.id)) return prev;
            // Swap any matching optimistic temp row for the real one so
            // the pill doesn't double up after a successful POST.
            const tempIdx = prev.findIndex(
              (r) =>
                r.id.startsWith("temp-") &&
                r.message_id === row.message_id &&
                r.actor_type === row.actor_type &&
                r.actor_id === row.actor_id,
            );
            if (tempIdx >= 0) {
              const copy = prev.slice();
              copy[tempIdx] = row;
              return copy;
            }
            return [...prev, row];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "message_reactions",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as MessageReaction;
          setReactions((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "message_reactions",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const old = payload.old as Partial<MessageReaction>;
          if (!old?.id) return;
          setReactions((prev) => prev.filter((r) => r.id !== old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Clear any in-progress reply draft when the active conversation changes —
  // a quote pulled from conversation A shouldn't bleed into conversation B.
  useEffect(() => {
    setReplyTo(null);
  }, [conversationId]);

  // Reset the server-side unread_count to 0 whenever an unread count
  // surfaces on the active conversation — covers both (a) opening a
  // conversation that had unread messages and (b) new messages arriving
  // while the user is already viewing the thread (webhook server-bumps
  // unread_count to N+1; the realtime UPDATE propagates it into the
  // client, which re-runs this effect and flips it back to 0).
  //
  // Guarding on hasUnread prevents the eq-update loop: once unread_count
  // is 0 the condition is false, so no further UPDATE is issued.
  useEffect(() => {
    if (!conversationId || !hasUnread) return;
    const supabase = createClient();
    supabase
      .from("conversations")
      .update({ unread_count: 0 })
      .eq("id", conversationId)
      .then(({ error }) => {
        if (error) console.error("Failed to reset unread_count:", error);
      });
  }, [conversationId, hasUnread]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(
    async (text: string, replyToId?: string) => {
      if (!conversation) return;

      const tempId = `temp-${Date.now()}`;

      // Optimistic update — shows the message immediately with "sending" status
      const optimisticMsg: Message = {
        id: tempId,
        conversation_id: conversation.id,
        sender_type: "agent",
        content_type: "text",
        content_text: text,
        status: "sending",
        created_at: new Date().toISOString(),
        reply_to_message_id: replyToId,
      };
      onNewMessage(optimisticMsg);
      setReplyTo(null);

      try {
        const res = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversation.id,
            message_type: "text",
            content_text: text,
            reply_to_message_id: replyToId,
          }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          const reason = payload?.error || `HTTP ${res.status}`;
          console.error("Failed to send message:", reason);
          toast.error(`Failed to send: ${reason}`);
          // Mark the optimistic bubble as failed so the user sees what happened
          onUpdateMessage(tempId, { status: "failed" });
          return;
        }

        // Success — the realtime INSERT event will replace the temp bubble
        // with the real DB row. If realtime hasn't arrived yet, at least
        // flip status to 'sent' so the UI stops showing "sending".
        onUpdateMessage(tempId, { status: "sent" });
      } catch (err) {
        console.error("Failed to send message:", err);
        const reason = err instanceof Error ? err.message : "network error";
        toast.error(`Failed to send: ${reason}`);
        onUpdateMessage(tempId, { status: "failed" });
      }
    },
    [conversation, onNewMessage, onUpdateMessage]
  );

  const handleSendMedia = useCallback(
    async (payload: SendMediaPayload) => {
      if (!conversation) return;

      // Documents show their filename in our own bubble (and to the
      // recipient as the Meta caption when no caption was typed); other
      // kinds use the caption as-is. Audio carries no caption.
      const contentText =
        payload.kind === "document"
          ? payload.caption || payload.filename || "Document"
          : payload.caption;

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: Message = {
        id: tempId,
        conversation_id: conversation.id,
        sender_type: "agent",
        content_type: payload.kind,
        content_text: contentText,
        media_url: payload.mediaUrl,
        status: "sending",
        created_at: new Date().toISOString(),
        reply_to_message_id: payload.replyToId,
      };
      onNewMessage(optimisticMsg);
      setReplyTo(null);

      try {
        const res = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversation.id,
            message_type: payload.kind,
            media_url: payload.mediaUrl,
            content_text: contentText,
            filename: payload.filename,
            reply_to_message_id: payload.replyToId,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const reason = data?.error || `HTTP ${res.status}`;
          console.error("Failed to send media:", reason);
          toast.error(`Failed to send: ${reason}`);
          onUpdateMessage(tempId, { status: "failed" });
          return;
        }

        onUpdateMessage(tempId, { status: "sent" });
      } catch (err) {
        console.error("Failed to send media:", err);
        const reason = err instanceof Error ? err.message : "network error";
        toast.error(`Failed to send: ${reason}`);
        onUpdateMessage(tempId, { status: "failed" });
      }
    },
    [conversation, onNewMessage, onUpdateMessage],
  );

  const handleStatusChange = useCallback(
    async (status: ConversationStatus) => {
      if (!conversation) return;

      const previousStatus = conversation.status;
      onStatusChange(conversation.id, status);
      const supabase = createClient();
      const { error } = await supabase
        .from("conversations")
        .update({ status })
        .eq("id", conversation.id);

      if (error) {
        console.error("Failed to update conversation status:", error);
        onStatusChange(conversation.id, previousStatus);
        toast.error(t("inbox.statusUpdateFailed", {}, "Falha ao atualizar status"));
      }
    },
    [conversation, onStatusChange, t]
  );

  const handleOpenTemplates = useCallback(() => {
    setTemplateModalOpen(true);
  }, []);

  const handleSendTemplate = useCallback(
    async (
      template: MessageTemplate,
      values: {
        body: string[];
        headerText?: string;
        buttonParams?: Record<number, string>;
      },
    ) => {
      if (!conversation) return;

      const renderedBody = renderTemplateBody(template.body_text, values.body);
      const tempId = `temp-${Date.now()}`;

      const optimisticMsg: Message = {
        id: tempId,
        conversation_id: conversation.id,
        sender_type: "agent",
        content_type: "template",
        content_text: renderedBody,
        template_name: template.name,
        status: "sending",
        created_at: new Date().toISOString(),
      };
      onNewMessage(optimisticMsg);

      try {
        const res = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversation.id,
            message_type: "template",
            template_name: template.name,
            template_language: template.language,
            // Structured params drive the new send-builder path
            // (header media + URL button substitution). Body values
            // are mirrored under both shapes so the route can fall
            // back if the template row isn't found locally.
            template_message_params: {
              body: values.body,
              headerText: values.headerText,
              buttonParams: values.buttonParams,
            },
            template_params: values.body,
            content_text: renderedBody,
          }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          const reason = payload?.error || `HTTP ${res.status}`;
          console.error("Failed to send template:", reason);
          toast.error(`Failed to send template: ${reason}`);
          onUpdateMessage(tempId, { status: "failed" });
          return;
        }

        onUpdateMessage(tempId, { status: "sent" });
      } catch (err) {
        console.error("Failed to send template:", err);
        const reason = err instanceof Error ? err.message : "network error";
        toast.error(`Failed to send template: ${reason}`);
        onUpdateMessage(tempId, { status: "failed" });
      }
    },
    [conversation, onNewMessage, onUpdateMessage],
  );

  // Build a quick id → Message map so reply quotes can be rendered without
  // an extra fetch — the thread already holds the full conversation.
  const messagesById = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);

  // Bucket reactions by their target message_id for O(1) per-bubble lookup.
  const reactionsByMessageId = useMemo(() => {
    const map = new Map<string, MessageReaction[]>();
    for (const r of reactions) {
      const bucket = map.get(r.message_id);
      if (bucket) bucket.push(r);
      else map.set(r.message_id, [r]);
    }
    return map;
  }, [reactions]);

  const contactDisplayName = contact?.name || contact?.phone || t("inbox.customer");

  // Author label for a quoted message: "You" when we sent the parent,
  // contact name when the customer sent it.
  const authorLabelFor = useCallback(
    (m: Message): string => {
      const isAgentMsg =
        m.sender_type === "agent" || m.sender_type === "bot";
      return isAgentMsg ? t("inbox.me") : contactDisplayName;
    },
    [contactDisplayName, t],
  );

  const handleStartReply = useCallback(
    (msg: Message) => {
      setReplyTo({
        id: msg.id,
        authorLabel: authorLabelFor(msg),
        preview: buildReplyPreview(msg, t),
      });
    },
    [authorLabelFor, t],
  );

  // Single reaction-set primitive. emoji === "" removes; otherwise adds/swaps.
  // The "toggle" semantic (pill click) is computed at the call site where the
  // current reactions for the bubble are already in scope — keeps this
  // function dependency-free w.r.t. the reaction list.
  const postReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!user?.id || !conversation) {
        console.warn("[reactions] missing user or conversation");
        return;
      }
      if (messageId.startsWith("temp-")) {
        toast.error("Aguarde a mensagem terminar de ser enviada");
        return;
      }

      const convId = conversation.id;
      const userId = user.id;
      let snapshot: MessageReaction[] = [];

      // Functional updater — captures the freshest reactions list, never a
      // stale closure. Snapshot stored for rollback on POST failure.
      setReactions((prev) => {
        snapshot = prev;
        const own = prev.find(
          (r) =>
            r.message_id === messageId &&
            r.actor_type === "agent" &&
            r.actor_id === userId,
        );
        if (emoji === "") return own ? prev.filter((r) => r !== own) : prev;
        if (own) return prev.map((r) => (r === own ? { ...own, emoji } : r));
        return [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            message_id: messageId,
            conversation_id: convId,
            actor_type: "agent",
            actor_id: userId,
            emoji,
            created_at: new Date().toISOString(),
          },
        ];
      });

      try {
        const res = await fetch("/api/whatsapp/react", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message_id: messageId, emoji }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.error || `HTTP ${res.status}`);
        }
      } catch (err) {
        const reason = err instanceof Error ? err.message : "network error";
        toast.error(`Reaction failed: ${reason}`);
        setReactions(snapshot);
      }
    },
    [conversation, user?.id],
  );

  const handleAssignChange = useCallback(
    async (agentId: string | null) => {
      if (!conversation) return;

      const supabase = createClient();
      const { error } = await supabase
        .from("conversations")
        .update({ assigned_agent_id: agentId })
        .eq("id", conversation.id);

      if (error) {
        console.error("Failed to update assignment:", error);
        toast.error("Falha ao atualizar atribuição");
        return;
      }

      onAssignChange(conversation.id, agentId);
    },
    [conversation, onAssignChange],
  );

  const [updatingHandlerStatus, setUpdatingHandlerStatus] = useState(false);
  const handleToggleAIHandler = useCallback(async () => {
    if (!conversation) return;
    const nextStatus = conversation.ai_handler_status === "human" ? "ai" : "human";
    setUpdatingHandlerStatus(true);
    try {
      const res = await fetch(`/api/ai-assistant/conversations/${conversation.id}/handler`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(
          nextStatus === "human"
            ? "Atendimento assumido! A IA foi pausada."
            : "Conversa devolvida para o Atendimento Inteligente!"
        );
        onRefresh?.();
      } else {
        toast.error("Erro ao alterar controle de atendimento.");
      }
    } catch {
      toast.error("Erro ao conectar ao servidor.");
    } finally {
      setUpdatingHandlerStatus(false);
    }
  }, [conversation, onRefresh]);

  const updateDefaultBoardItem = useCallback(
    async (payload: {
      awaitingReturn?: boolean;
      awaitingReturnReason?: string | null;
      priorityRank?: number;
      priorityReason?: string | null;
    }) => {
      if (!conversation) return;

      const currentItem = defaultBoardItem;
      const optimisticItem = currentItem
        ? {
            ...currentItem,
            ...(typeof payload.awaitingReturn === "boolean"
              ? {
                  awaiting_return: payload.awaitingReturn,
                  awaiting_return_reason: payload.awaitingReturn
                    ? payload.awaitingReturnReason ?? currentItem.awaiting_return_reason ?? null
                    : null,
                }
              : {}),
            ...(typeof payload.priorityRank === "number"
              ? {
                  priority_rank: payload.priorityRank,
                  priority_reason:
                    payload.priorityRank > 0
                      ? payload.priorityReason ?? currentItem.priority_reason ?? null
                      : null,
                }
              : {}),
          }
        : null;

      if (optimisticItem) {
        setDefaultBoardItem(optimisticItem);
        onBoardItemChange?.(optimisticItem);
      }

      setUpdatingBoardFlags(true);
      try {
        const res = await fetch("/api/conversation-board-items/by-conversation", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversation.id,
            ...payload,
          }),
        });

        const data = (await res.json().catch(() => null)) as
          | { item?: ConversationBoardItem; error?: string }
          | null;
        if (!res.ok || !data?.item) {
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
        setDefaultBoardItem(data.item);
        onBoardItemChange?.(data.item);
      } catch (error) {
        const reason = error instanceof Error ? error.message : t("inbox.board.syncError");
        if (currentItem) {
          setDefaultBoardItem(currentItem);
          onBoardItemChange?.(currentItem);
        }
        toast.error(reason);
      } finally {
        setUpdatingBoardFlags(false);
      }
    },
    [conversation, defaultBoardItem, onBoardItemChange, t],
  );

  const handleToggleAwaitingReturn = useCallback(() => {
    const next = !(defaultBoardItem?.awaiting_return ?? false);
    void updateDefaultBoardItem({
      awaitingReturn: next,
      awaitingReturnReason: next ? t("boards.awaitingReturn") : null,
    });
  }, [defaultBoardItem?.awaiting_return, t, updateDefaultBoardItem]);

  const handleTogglePriority = useCallback(() => {
    const hasPriority = (defaultBoardItem?.priority_rank ?? 0) > 0;
    void updateDefaultBoardItem({
      priorityRank: hasPriority ? 0 : 3,
      priorityReason: hasPriority ? null : t("boards.priority"),
    });
  }, [defaultBoardItem?.priority_rank, t, updateDefaultBoardItem]);

  const loadBoardsForLink = async () => {
    setLoadingBoards(true);
    try {
      const res = await fetch("/api/conversation-boards");
      const payload = (await res.json().catch(() => null)) as
        | { boards?: ConversationBoard[]; error?: string }
        | null;
      if (!res.ok) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }

      const boards = payload?.boards ?? [];
      setAvailableBoards(boards);

      const preferredBoardId =
        defaultBoardItem?.board_id && boards.some((board) => board.id === defaultBoardItem.board_id)
          ? defaultBoardItem.board_id
          : boards[0]?.id ?? "";
      setLinkBoardId(preferredBoardId);
      const preferredBoard = boards.find((board) => board.id === preferredBoardId) ?? null;
      const preferredLanes = sortBoardLanes(preferredBoard?.lanes ?? []);
      setLinkLaneId(preferredLanes[0]?.id ?? "");
    } catch (error) {
      const reason = error instanceof Error ? error.message : t("inbox.board.loadBoardsError");
      toast.error(reason);
    } finally {
      setLoadingBoards(false);
    }
  };

  const handleOpenLinkBoard = () => {
    if (!conversationId) return;
    setLinkBoardOpen(true);
    void loadBoardsForLink();
  };

  const handleLinkBoardChange = (value: string | null) => {
    const nextBoardId = value ?? "";
    setLinkBoardId(nextBoardId);
    const nextBoard = availableBoards.find((board) => board.id === nextBoardId) ?? null;
    const nextLanes = sortBoardLanes(nextBoard?.lanes ?? []);
    setLinkLaneId(nextLanes[0]?.id ?? "");
  };

  const handleLinkLaneChange = (value: string | null) => {
    setLinkLaneId(value ?? "");
  };

  const handleLinkConversationToBoard = async () => {
    if (!conversationId || !linkBoardId) return;
    setLinkingBoard(true);
    try {
      const res = await fetch(`/api/conversation-boards/${linkBoardId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          laneId: linkLaneId || undefined,
        }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { item?: ConversationBoardItem; error?: string }
        | null;
      if (!res.ok || !payload?.item) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }

      setDefaultBoardItem(payload.item);
      setLinkBoardOpen(false);
      toast.success(t("inbox.board.linkSuccess"));
      onRefresh?.();
    } catch (error) {
      const reason = error instanceof Error ? error.message : t("inbox.board.linkError");
      toast.error(reason);
    } finally {
      setLinkingBoard(false);
    }
  };

  // Interleave messages and internal notes in exact chronological order for the chat thread stream.
  // This memo must stay before any early return to preserve hook ordering between renders.
  const combinedStreamGroups = useMemo(() => {
    type StreamItem =
      | { kind: "message"; data: Message; created_at: string }
      | { kind: "note"; data: InternalNote; created_at: string };

    const items: StreamItem[] = [
      ...messages.map((msg) => ({ kind: "message" as const, data: msg, created_at: msg.created_at })),
      ...internalNotes.map((note) => ({ kind: "note" as const, data: note, created_at: note.created_at })),
    ];

    items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const groups: { date: string; items: StreamItem[] }[] = [];
    let currentDate = "";

    for (const item of items) {
      const day = format(new Date(item.created_at), "yyyy-MM-dd");
      if (day !== currentDate) {
        currentDate = day;
        groups.push({ date: item.created_at, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    }

    return groups;
  }, [messages, internalNotes]);

  // Empty state — same WhatsApp-style doodle background as the active
  // thread below, so swapping between empty/selected doesn't change the
  // pattern under the user's eye.
  if (!conversation || !contact) {
    return (
      <div className={cn("flex flex-1 flex-col items-center justify-center", DOODLE_BG_CLASSES)}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-muted-foreground">
          Selecione uma conversa
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Escolha uma conversa à esquerda para começar a enviar mensagens
        </p>
      </div>
    );
  }

  const displayName = contact.name || contact.phone;

  const currentStatus = statusOptions.find(

    (s: typeof statusOptions[number]) => s.value === conversation.status
  );
  const assignedAgentId = conversation.assigned_agent_id ?? null;
  const currentAssignee = profiles.find((p) => p.user_id === assignedAgentId);
  const assignLabel = assignedAgentId
    ? (currentAssignee?.full_name ?? t("inbox.assigned"))
    : t("inbox.assign");

  return (
    // `min-w-0` is load-bearing: the page already puts min-w-0 on the
    // thread's flex *wrapper* (issue #165), but this root keeps the
    // default `min-width: auto`, so a single wide message (long unbroken
    // URL/word) expands the whole thread past its flex share and the chat
    // paints on top of the contact sidebar at lg+ — outgoing bubbles get
    // clipped and the hover toolbar overlaps the Tags panel. Letting the
    // root shrink lets the bubbles' break-words / max-w caps apply.
    <div className={cn("flex min-w-0 flex-1 flex-col", DOODLE_BG_CLASSES)}>
      {/* 2-Tier Clean Header Toolbar */}
      <div className="flex flex-col border-b border-border bg-card shrink-0">

        {/* Tier 1: Primary Header Bar */}
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4 border-b border-border/40">
          {/* Left Side: Panel 2 Toggle, Contact Avatar & Info */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {onToggleListPanel && (
              <button
                type="button"
                onClick={onToggleListPanel}
                title={listPanelOpen ? "Recolher lista de conversas" : "Expandir lista de conversas"}
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
              >
                {listPanelOpen ? <PanelLeftClose className="h-4.5 w-4.5" /> : <PanelLeftOpen className="h-4.5 w-4.5" />}
              </button>
            )}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label={t("inbox.backToConversations")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 shrink">
              <h2 className="truncate text-xs font-semibold text-foreground">{displayName}</h2>
              <p className="truncate text-[11px] text-muted-foreground">{contact.phone}</p>
            </div>
          </div>

          {/* Right Side: Core Actions (AI Handoff, Status, Assignee, Panel 3 Toggle) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* AI Handoff CTA */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleAIHandler}
              disabled={updatingHandlerStatus}
              className={cn(
                "h-7 text-[11px] font-medium gap-1 px-2.5 rounded-md transition-all shadow-2xs whitespace-nowrap",
                conversation.ai_handler_status === "human"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20"
              )}
            >
              {conversation.ai_handler_status === "human" ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{t("inbox.collaboration.returnToAi")}</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{t("inbox.collaboration.takeOver")}</span>
                </>
              )}
            </Button>

            {/* Ticket Management (Status & Assignment) */}
            <div className="flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/40 p-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "inline-flex items-center justify-center h-7 gap-1 px-2 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap hover:bg-muted",
                    currentStatus?.color ?? "text-muted-foreground"
                  )}
                >
                  <span className="whitespace-nowrap">{currentStatus?.label ?? t("common.status")}</span>
                  <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-border bg-popover">
                  {statusOptions.map((opt: typeof statusOptions[number]) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                      className={cn("text-xs", opt.color)}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-3.5 w-[1px] bg-border/60 shrink-0" />

              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "inline-flex items-center justify-center h-7 gap-1 px-2 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap hover:bg-muted",
                    assignedAgentId ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                  <UserPlus className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{assignLabel}</span>
                  <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-border bg-popover">
                  {profiles.length === 0 ? (
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                      {t("inbox.noAvailableTeammates")}
                    </DropdownMenuItem>
                  ) : (
                    profiles.map((p) => {
                      const isSelected = p.user_id === assignedAgentId;
                      const presence = getPresence(p.user_id);
                      return (
                        <DropdownMenuItem
                          key={p.user_id}
                          onClick={() => handleAssignChange(p.user_id)}
                          className={cn(
                            "text-xs",
                            isSelected ? "text-primary font-medium" : "text-popover-foreground"
                          )}
                        >
                          <PresenceDot
                            status={presence}
                            label={presenceLabel(
                              presence,
                              getRow(p.user_id)?.last_seen_at ?? null,
                              now
                            )}
                            className="mr-2"
                          />
                          <span className="flex-1 whitespace-nowrap">
                            {p.full_name}
                            {p.user_id === user?.id ? ` (${t("inbox.me")})` : ""}
                          </span>
                          {isSelected && <Check className="ml-2 h-3.5 w-3.5 text-primary" />}
                        </DropdownMenuItem>
                      );
                    })
                  )}
                  {assignedAgentId && (
                    <>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onClick={() => handleAssignChange(null)}
                        className="text-xs text-muted-foreground"
                      >
                        {t("inbox.unassign")}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {onRefresh && (
              <button
                type="button"
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                aria-label={t("inbox.refreshConversation")}
                title={t("inbox.refresh")}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              </button>
            )}

            {onToggleContactPanel && (
              <button
                type="button"
                onClick={onToggleContactPanel}
                title={contactPanelOpen ? "Recolher detalhes e timeline" : "Expandir detalhes e timeline"}
                className="hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {contactPanelOpen ? <PanelRightClose className="h-4.5 w-4.5" /> : <PanelRightOpen className="h-4.5 w-4.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Secondary Action Toolbar Bar (CRM Tools, Help, Badges) */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-muted/20 overflow-x-auto scrollbar-none text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Session Timer Badge */}
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border-border text-[10px] font-medium px-2 py-0.5 whitespace-nowrap shrink-0",
                sessionInfo.expired ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-primary border-primary/30 bg-primary/10"
              )}
            >
              <Clock className="h-3 w-3" />
              {sessionInfo.remaining}
            </Badge>

            {/* AI Status Badge */}
            <Badge
              variant="outline"
              className={cn(
                "gap-1 text-[10px] font-medium px-2 py-0.5 border-border whitespace-nowrap shrink-0",
                conversation.ai_handler_status === "human"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              )}
            >
              {conversation.ai_handler_status === "human" ? (
                <>
                  <User className="h-3 w-3" /> Humano
                </>
              ) : (
                <>
                  <Bot className="h-3 w-3" /> IA Ativa
                </>
              )}
            </Badge>

            <div className="h-3.5 w-[1px] bg-border/60 shrink-0 mx-0.5" />

            {/* Board CTA */}
            <button
              type="button"
              onClick={handleOpenLinkBoard}
              title={t("inbox.board.addToBoard")}
              className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FolderKanban className="h-3.5 w-3.5 shrink-0" />
              <span>{t("inbox.board.addToBoard")}</span>
            </button>

            {/* Aguardando retorno toggle */}
            <button
              type="button"
              onClick={handleToggleAwaitingReturn}
              disabled={updatingBoardFlags}
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium whitespace-nowrap transition-colors",
                defaultBoardItem?.awaiting_return
                  ? "bg-amber-500/20 text-amber-400 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                updatingBoardFlags && "opacity-60"
              )}
            >
              <Clock3 className="h-3.5 w-3.5 shrink-0" />
              <span>{t("boards.awaitingReturn")}</span>
            </button>

            {/* Prioridade toggle */}
            <button
              type="button"
              onClick={handleTogglePriority}
              disabled={updatingBoardFlags}
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium whitespace-nowrap transition-colors",
                (defaultBoardItem?.priority_rank ?? 0) > 0
                  ? "bg-red-500/20 text-red-400 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                updatingBoardFlags && "opacity-60"
              )}
            >
              <Pin className={cn("h-3.5 w-3.5 shrink-0", (defaultBoardItem?.priority_rank ?? 0) > 0 && "fill-current")} />
              <span>{t("boards.priority")}</span>
            </button>

            {/* Solicitar Ajuda */}
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              title={t("inbox.collaboration.helpTooltip")}
              className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium whitespace-nowrap text-amber-500 hover:bg-amber-500/10 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>{t("inbox.collaboration.requestHelp")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Participant Presence Bar */}

      <ParticipantBar
        conversationId={conversation?.id ?? ""}
        activePresences={activeParticipants}
        currentUserId={user?.id}
      />

      <Dialog open={linkBoardOpen} onOpenChange={setLinkBoardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("inbox.board.linkDialogTitle")}</DialogTitle>
            <DialogDescription>{t("inbox.board.linkDialogDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("inbox.board.selectBoard")}</Label>
              <Select
                value={linkBoardId}
                onValueChange={handleLinkBoardChange}
                disabled={loadingBoards || linkingBoard}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("boards.selectBoard")}>
                    {selectedLinkBoardName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableBoards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t("inbox.board.selectLane")}</Label>
              <Select
                value={linkLaneId}
                onValueChange={handleLinkLaneChange}
                disabled={loadingBoards || linkingBoard || selectedLinkBoardLanes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("inbox.board.selectLane")}>
                    {selectedLinkLaneName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {selectedLinkBoardLanes.map((lane) => (
                    <SelectItem key={lane.id} value={lane.id}>
                      {lane.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {availableBoards.length === 0 && !loadingBoards ? (
              <p className="text-sm text-muted-foreground">{t("inbox.board.noBoards")}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              onClick={handleLinkConversationToBoard}
              disabled={!linkBoardId || !linkLaneId || loadingBoards || linkingBoard}
            >
              {t("inbox.board.linkAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages & Internal Notes Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 && internalNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">{t("inbox.noMessagesYet")}</p>
            <p className="text-xs text-muted-foreground">
              {t("inbox.sendTemplateToStart")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {combinedStreamGroups.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="mb-4 flex items-center justify-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-medium text-muted-foreground">
                    {formatDateSeparator(group.date, t)}
                  </span>
                </div>

                {/* Combined Messages & Internal Notes Stream */}
                <div className="space-y-3">
                  {group.items.map((item, idx) => {
                    if (item.kind === "note") {
                      return (
                        <InternalNoteCard
                          key={`note-${item.data.id}`}
                          note={item.data}
                          currentUserId={user?.id}
                          onEditNote={handleEditNote}
                          onDeleteNote={handleDeleteNote}
                        />
                      );
                    }

                    const msg = item.data;
                    const parent = msg.reply_to_message_id
                      ? messagesById.get(msg.reply_to_message_id)
                      : null;
                    const reply = parent
                      ? {
                          authorLabel: authorLabelFor(parent),
                          preview: buildReplyPreview(parent, t),
                        }
                      : null;
                    const msgReactions = reactionsByMessageId.get(msg.id);

                    // Rule 2 — Message Author Identification on transition
                    const prevItem = idx > 0 ? group.items[idx - 1] : null;
                    const prevMsg = prevItem?.kind === "message" ? prevItem.data : null;
                    const isAuthorTransition =
                      !prevMsg ||
                      prevMsg.sender_type !== msg.sender_type ||
                      prevMsg.sender_id !== msg.sender_id;

                    const authorProf = profiles.find((p) => p.user_id === msg.sender_id);
                    const currentUserProf = profiles.find((p) => p.user_id === user?.id);
                    const authorName =
                      authorProf?.full_name ||
                      (msg.sender_id && msg.sender_id === user?.id
                        ? (currentUserProf?.full_name || "Você")
                        : msg.sender_type === "bot"
                          ? "IA FlowHub"
                          : (msg.sender_type === "agent" ? (currentUserProf?.full_name || "Colaborador") : contactDisplayName));

                    const handlePillToggle = (emoji: string) => {
                      const own = msgReactions?.find(
                        (r) =>
                          r.actor_type === "agent" &&
                          r.actor_id === user?.id,
                      );
                      const next = own?.emoji === emoji ? "" : emoji;
                      void postReaction(msg.id, next);
                    };

                    return (
                      <MessageActions
                        key={msg.id}
                        message={msg}
                        onReply={() => handleStartReply(msg)}
                        onReact={(emoji) => {
                          if (emoji) void postReaction(msg.id, emoji);
                        }}
                      >
                        <MessageBubble
                          message={msg}
                          reply={reply}
                          reactions={msgReactions}
                          currentUserId={user?.id}
                          onToggleReaction={handlePillToggle}
                          authorName={authorName}
                          showAuthorName={isAuthorTransition}
                        />
                      </MessageActions>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Smart Response Control Warning Banner */}
      {reservationState.is_reserved && reservationState.reserved_by_user_id !== user?.id && (
        <div className="px-4 py-2 bg-amber-500/15 border-t border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>{reservationState.reserved_by_name}</strong> está preparando uma resposta ao cliente. Revise seu texto antes de enviar.
            </span>
          </div>
        </div>
      )}

      {/* Composer */}
      <MessageComposer
        conversationId={conversation?.id ?? ""}
        sessionExpired={sessionInfo.expired}
        onSend={handleSend}
        onSendMedia={handleSendMedia}
        onOpenTemplates={handleOpenTemplates}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        onActivityChange={updateActivity}
      />

      <TemplatePicker
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        onSelect={handleSendTemplate}
      />

      <HelpRequestModal
        conversationId={conversation?.id ?? ""}
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />


    </div>
  );
}
