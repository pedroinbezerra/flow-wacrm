"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { Conversation, ConversationStatus } from "@/types";
import { Search, ChevronDown, AtSign, Clock3, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationListProps {
  activeConversationId: string | null;
  onSelect: (conversation: Conversation) => void;
  conversations: Conversation[];
  onConversationsLoaded: (conversations: Conversation[]) => void;
  /**
   * Increment to force the fetch effect below to refire. The parent
   * bumps this on realtime reconnect / tab visibility → visible so the
   * list catches up on any events sent while the WS was disconnected
   * or the tab was throttled. Optional so existing callers keep working.
   */
  resyncToken?: number;
}

interface ConversationListBoardFlags {
  awaiting_return: boolean;
  priority_rank: number;
  mention_active: boolean;
}

const STATUS_COLORS: Record<ConversationStatus, string> = {
  open: "bg-primary",
  pending: "bg-amber-500",
  closed: "bg-muted-foreground",
};

type InboxFilter =
  | ConversationStatus
  | "all"
  | "unread"
  | "mentioned"
  | "priority"
  | "awaiting_return";

const FILTER_OPTIONS: (t: ReturnType<typeof useTranslation>["t"]) => { label: string; value: InboxFilter }[] = (t) => [
  { label: t("inbox.filter.all"), value: "all" },
  { label: t("inbox.filter.unread"), value: "unread" },
  { label: t("inbox.filter.mentioned"), value: "mentioned" },
  { label: t("inbox.filter.priority"), value: "priority" },
  { label: t("inbox.filter.awaitingReturn"), value: "awaiting_return" },
  { label: t("inbox.filter.open"), value: "open" },
  { label: t("inbox.filter.pending"), value: "pending" },
  { label: t("inbox.filter.closed"), value: "closed" },
];

export function ConversationList({
  activeConversationId,
  onSelect,
  conversations,
  onConversationsLoaded,
  resyncToken = 0,
}: ConversationListProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const filterOptions = FILTER_OPTIONS(t);
  const [loading, setLoading] = useState(true);
  const [boardFlagsByConversation, setBoardFlagsByConversation] = useState<
    Record<string, ConversationListBoardFlags>
  >({});

  // Keep the latest callback in a ref so the fetch effect below can
  // have a stable, empty-dep identity. Previously the fetch useCallback
  // depended on `onConversationsLoaded`, which depends on the parent's
  // `deepLinkConvId` — so every URL change (including one the parent
  // triggered via router.replace after a click) caused a fresh
  // conversations fetch. That extra refetch was the trigger for the
  // deep-link auto-select running a second time and wiping the active
  // thread's messages.
  // Mutation lives in an effect (not render) per React 19's refs rule;
  // the fetch runs once on mount so it's fine to read the slightly
  // older value — the very next render updates the ref for any
  // subsequent async completion.
  const onConversationsLoadedRef = useRef(onConversationsLoaded);
  useEffect(() => {
    onConversationsLoadedRef.current = onConversationsLoaded;
  });

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, contact:contacts(*)")
        .order("last_message_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        // Supabase errors have non-enumerable properties — log fields explicitly
        console.error("Failed to fetch conversations:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setLoading(false);
        return;
      }

      onConversationsLoadedRef.current(data ?? []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // `resyncToken` is included so the parent can force a refetch when
    // the realtime channel reconnects or the tab regains focus — catches
    // up on any events sent while the WS was disconnected or throttled.
  }, [resyncToken]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      if (conversations.length === 0) {
        if (!cancelled) setBoardFlagsByConversation({});
        return;
      }

      const { data: defaultBoard, error: boardError } = await supabase
        .from("conversation_boards")
        .select("id")
        .eq("is_default", true)
        .maybeSingle();

      if (cancelled) return;
      if (boardError) {
        console.error("Failed to load default board:", boardError);
        setBoardFlagsByConversation({});
        return;
      }
      if (!defaultBoard?.id) {
        setBoardFlagsByConversation({});
        return;
      }

      const conversationIds = conversations.map((c) => c.id);
      const { data: items, error: itemsError } = await supabase
        .from("conversation_board_items")
        .select("conversation_id,awaiting_return,priority_rank,mention_active")
        .eq("board_id", defaultBoard.id)
        .in("conversation_id", conversationIds);

      if (cancelled) return;
      if (itemsError) {
        console.error("Failed to load conversation board flags:", itemsError);
        setBoardFlagsByConversation({});
        return;
      }

      const next: Record<string, ConversationListBoardFlags> = {};
      for (const row of items ?? []) {
        next[row.conversation_id as string] = {
          awaiting_return: row.awaiting_return as boolean,
          priority_rank: Number(row.priority_rank ?? 0),
          mention_active: row.mention_active as boolean,
        };
      }
      setBoardFlagsByConversation(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [conversations, resyncToken]);

  const filtered = useMemo(() => {
    let result = conversations;

    if (filter === "unread") {
      result = result.filter((c) => c.unread_count > 0);
    } else if (filter === "mentioned") {
      result = result.filter(
        (c) => boardFlagsByConversation[c.id]?.mention_active === true,
      );
    } else if (filter === "priority") {
      result = result.filter(
        (c) => (boardFlagsByConversation[c.id]?.priority_rank ?? 0) > 0,
      );
    } else if (filter === "awaiting_return") {
      result = result.filter(
        (c) => boardFlagsByConversation[c.id]?.awaiting_return === true,
      );
    } else if (filter !== "all") {
      result = result.filter((c) => c.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => {
        const name = c.contact?.name?.toLowerCase() ?? "";
        const phone = c.contact?.phone?.toLowerCase() ?? "";
        const lastMsg = c.last_message_text?.toLowerCase() ?? "";
        return name.includes(q) || phone.includes(q) || lastMsg.includes(q);
      });
    }

    return result;
  }, [conversations, filter, search, boardFlagsByConversation]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleSelect = useCallback(
    (conv: Conversation) => {
      onSelect(conv);
    },
    [onSelect]
  );

  const activeFilter = filterOptions.find((o) => o.value === filter);

  return (
    // w-full on mobile so the list occupies the whole viewport when it's
    // the single pane showing; fixed 320px on desktop where it shares the
    // row with the thread + contact sidebar.
    <div className="flex h-full w-full flex-col border-r border-border bg-card lg:w-80">
      {/* Search + Filter */}
      <div className="space-y-2 border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder={t("common.placeholders.searchConversations")}
            className="border-border bg-muted pl-9 text-sm text-foreground placeholder-muted-foreground focus:border-primary/50"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
              {activeFilter?.label ?? t("inbox.filter.all")}
              <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="border-border bg-popover"
          >
            {filterOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  "text-sm",
                  filter === opt.value
                    ? "text-primary"
                    : "text-popover-foreground"
                )}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Conversation Items.
          `min-h-0` is load-bearing: a flex child defaults to
          min-height:auto, so without it this ScrollArea grows to fit
          every conversation instead of shrinking to the remaining
          space — the list then overflows and gets clipped by the
          parent's overflow-hidden with no scrollbar (issue #229). */}
      <ScrollArea className="min-h-0 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">{t("inbox.noConversationsFound")}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onSelect={handleSelect}
                boardFlags={boardFlagsByConversation[conv.id]}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (conversation: Conversation) => void;
  boardFlags?: ConversationListBoardFlags;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  boardFlags,
}: ConversationItemProps) {
  const { t } = useTranslation();
  const contact = conversation.contact;
  const displayName = contact?.name || contact?.phone || t("inbox.unknown");
  const initials = displayName.charAt(0).toUpperCase();

  const handleClick = useCallback(() => {
    onSelect(conversation);
  }, [onSelect, conversation]);

  const timeAgo = conversation.last_message_at
    ? formatDistanceToNow(new Date(conversation.last_message_at), {
        addSuffix: false,
      })
    : "";

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50",
        isActive && "border-l-2 border-primary bg-muted/70"
      )}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
        {contact?.avatar_url ? (
          <img
            src={contact.avatar_url}
            alt={displayName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {displayName}
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">
            {conversation.last_message_text || t("inbox.noMessagesYet")}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {boardFlags?.mention_active && (
              <span title={t("boards.mentioned")}>
                <AtSign className="h-3 w-3 text-rose-500" />
              </span>
            )}
            {boardFlags?.awaiting_return && (
              <span title={t("boards.awaitingReturn")}>
                <Clock3 className="h-3 w-3 text-amber-500" />
              </span>
            )}
            {(boardFlags?.priority_rank ?? 0) > 0 && (
              <span title={t("boards.priority")}>
                <Pin className="h-3 w-3 text-primary" />
              </span>
            )}
            {conversation.unread_count > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {conversation.unread_count}
              </span>
            )}
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                STATUS_COLORS[conversation.status]
              )}
              title={conversation.status}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
