"use client";

import { forwardRef, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { useCan } from "@/hooks/use-can";
import { useTranslation } from "@/hooks/use-translation";
import { useRealtime } from "@/hooks/use-realtime";
import { listConversationBoards, listConversationBoardGroups, listConversationBoardItems } from "@/lib/conversation-boards/queries";
import type {
  Contact,
  Conversation,
  ConversationBoard,
  ConversationBoardGroup,
  ConversationBoardItem,
  ConversationBoardLaneConfig,
  ConversationStatus,
  Message,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  AtSign,
  ArrowDown,
  ArrowUp,
  Clock3,
  FolderKanban,
  GripVertical,
  MoreHorizontal,
  Pin,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  UsersRound,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageThread } from "@/components/inbox/message-thread";

const SYSTEM_LANE_DESCRIPTION_KEYS: Record<string, string> = {
  partners: "boards.lanesDescriptions.partners",
  franchisees: "boards.lanesDescriptions.franchisees",
  jobs: "boards.lanesDescriptions.jobs",
  direct: "boards.lanesDescriptions.direct",
  other: "boards.lanesDescriptions.other",
};

const PRIORITY_COLUMN_ID = "priority";
const NO_GROUP_VALUE = "__no_group__";
const DEFAULT_LANE_COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#64748b",
  "#ec4899",
  "#f97316",
];

type EditableBoardLane = {
  id?: string;
  name: string;
  color: string;
  lane_key?: string;
};

function compareBoardItems(a: ConversationBoardItem, b: ConversationBoardItem): number {
  const aMention = a.mention_active ? 1 : 0;
  const bMention = b.mention_active ? 1 : 0;
  if (aMention !== bMention) return bMention - aMention;

  const aWaiting = a.awaiting_return ? 1 : 0;
  const bWaiting = b.awaiting_return ? 1 : 0;
  if (aWaiting !== bWaiting) return bWaiting - aWaiting;

  if (a.priority_rank !== b.priority_rank) return b.priority_rank - a.priority_rank;

  const aUnread = a.conversation?.unread_count ?? 0;
  const bUnread = b.conversation?.unread_count ?? 0;
  if (aUnread !== bUnread) return bUnread - aUnread;

  const aAt = a.conversation?.last_message_at ?? a.updated_at ?? a.created_at;
  const bAt = b.conversation?.last_message_at ?? b.updated_at ?? b.created_at;
  const aTime = new Date(aAt).getTime();
  const bTime = new Date(bAt).getTime();
  if (aTime !== bTime) return bTime - aTime;

  if (a.position !== b.position) return a.position - b.position;

  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function isPriorityItem(item: ConversationBoardItem): boolean {
  return item.mention_active || item.awaiting_return || item.priority_rank > 0;
}

function sortBoardLanes(lanes: ConversationBoardLaneConfig[] = []): ConversationBoardLaneConfig[] {
  return [...lanes].sort(
    (a, b) =>
      a.position - b.position ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

function displayNameForItem(item: ConversationBoardItem): string {
  const contact = item.conversation?.contact;
  return contact?.name || contact?.phone || "Desconhecido";
}

function previewForItem(item: ConversationBoardItem): string {
  return item.conversation?.last_message_text || "Nenhuma mensagem ainda";
}

export function BoardWorkspace() {
  const supabase = useMemo(() => createClient(), []);
  const { t } = useTranslation();
  const canCreate = useCan("edit-settings");
  const canOperate = useCan("send-messages");

  const [boards, setBoards] = useState<ConversationBoard[]>([]);
  const [groups, setGroups] = useState<ConversationBoardGroup[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [items, setItems] = useState<ConversationBoardItem[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [manageLanesOpen, setManageLanesOpen] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [boardGroupId, setBoardGroupId] = useState<string>("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [editableLanes, setEditableLanes] = useState<EditableBoardLane[]>([]);
  const [saving, setSaving] = useState(false);
  const [moveBoardOpen, setMoveBoardOpen] = useState(false);
  const [moveTargetItem, setMoveTargetItem] = useState<ConversationBoardItem | null>(null);
  const [moveBoardId, setMoveBoardId] = useState("");
  const [moveLaneId, setMoveLaneId] = useState("");
  const [movingToBoard, setMovingToBoard] = useState(false);
  const [conversationModalOpen, setConversationModalOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [modalMessages, setModalMessages] = useState<Message[]>([]);
  const [modalResyncToken, setModalResyncToken] = useState(0);
  const [activeDragItemId, setActiveDragItemId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const selectedBoard = useMemo(
    () => boards.find((board) => board.id === selectedBoardId) ?? null,
    [boards, selectedBoardId],
  );
  const boardLanes = useMemo(
    () => sortBoardLanes(selectedBoard?.lanes ?? []),
    [selectedBoard?.lanes],
  );
  const moveSelectedBoard = useMemo(
    () => boards.find((board) => board.id === moveBoardId) ?? null,
    [boards, moveBoardId],
  );
  const moveSelectedLanes = useMemo(
    () => sortBoardLanes(moveSelectedBoard?.lanes ?? []),
    [moveSelectedBoard?.lanes],
  );
  const moveSelectedBoardName = useMemo(
    () => moveSelectedBoard?.name ?? t("boards.selectBoard", {}, "Selecione um board"),
    [moveSelectedBoard, t],
  );
  const moveSelectedLaneName = useMemo(
    () =>
      moveSelectedLanes.find((lane) => lane.id === moveLaneId)?.name ??
      t("boards.selectLane", {}, "Selecione uma raia"),
    [moveLaneId, moveSelectedLanes, t],
  );
  const selectedBoardName = useMemo(
    () => selectedBoard?.name ?? t("boards.selectBoard", {}, "Selecione um board"),
    [selectedBoard, t],
  );
  const selectedGroupName = useMemo(() => {
    if (!boardGroupId) return t("boards.noGroup", {}, "Sem grupo");
    return groups.find((group) => group.id === boardGroupId)?.name ?? boardGroupId;
  }, [boardGroupId, groups, t]);
  const loadBoardsErrorText = t("boards.errors.loadBoards", {}, "Falha ao carregar boards");
  const loadItemsErrorText = t("boards.errors.loadItems", {}, "Falha ao carregar conversas do board");
  const saveLanesErrorText = t("boards.errors.saveLanes", {}, "Falha ao salvar raias");

  const refreshBoards = useCallback(async () => {
    setLoadingBoards(true);
    try {
      const [nextBoards, nextGroups] = await Promise.all([
        listConversationBoards(supabase),
        listConversationBoardGroups(supabase),
      ]);
      setBoards(nextBoards);
      setGroups(nextGroups);
      setSelectedBoardId((prev) =>
        prev && nextBoards.some((board) => board.id === prev)
          ? prev
          : nextBoards[0]?.id ?? "",
      );
    } catch (error) {
      console.error("[boards] failed to load boards:", error);
      toast.error(loadBoardsErrorText);
    } finally {
      setLoadingBoards(false);
    }
  }, [loadBoardsErrorText, supabase]);

  const refreshItems = useCallback(
    async (boardId: string) => {
      if (!boardId) {
        setItems([]);
        return;
      }
      setLoadingItems(true);
      try {
        const { items: nextItems } = await listConversationBoardItems(supabase, boardId);
        setItems(nextItems);
      } catch (error) {
        console.error("[boards] failed to load board items:", error);
        toast.error(loadItemsErrorText);
      } finally {
        setLoadingItems(false);
      }
    },
    [loadItemsErrorText, supabase],
  );

  useEffect(() => {
    // Initial load is a one-shot sync with the backend state, not
    // derived render state. The board page intentionally mirrors the
    // pattern already used by pipelines/contacts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshBoards();
  }, [refreshBoards]);

  useEffect(() => {
    if (!selectedBoardId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
      return;
    }
    void refreshItems(selectedBoardId);
  }, [selectedBoardId, refreshItems]);

  const handleBoardMessageEvent = useCallback((event: { eventType: string; new: Message }) => {
    if (event.eventType !== "INSERT") return;
    const message = event.new;
    setModalMessages((prev) => {
      if (!activeConversation || activeConversation.id !== message.conversation_id) return prev;
      if (prev.some((existing) => existing.id === message.id)) return prev;
      return [...prev, message];
    });
    setItems((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.conversation_id !== message.conversation_id || !item.conversation) {
          return item;
        }
        changed = true;
        return {
          ...item,
          conversation: {
            ...item.conversation,
            last_message_text: message.content_text ?? item.conversation.last_message_text,
            last_message_at: message.created_at,
            unread_count:
              message.sender_type === "customer"
                ? (item.conversation.unread_count ?? 0) + 1
                : item.conversation.unread_count,
          },
        };
      });
      return changed ? next : prev;
    });
  }, [activeConversation]);

  const handleBoardConversationEvent = useCallback(
    (event: { eventType: string; new: Conversation }) => {
      if (event.eventType !== "INSERT" && event.eventType !== "UPDATE") return;
      const conversation = event.new;
      setActiveConversation((prev) => {
        if (!prev || prev.id !== conversation.id) return prev;
        return {
          ...prev,
          ...conversation,
          contact: prev.contact,
        };
      });
      setItems((prev) => {
        let changed = false;
        const next = prev.map((item) => {
          if (item.conversation_id !== conversation.id) return item;
          changed = true;
          return {
            ...item,
            conversation: item.conversation
              ? {
                  ...item.conversation,
                  ...conversation,
                  contact: item.conversation.contact,
                }
              : conversation,
          };
        });
        return changed ? next : prev;
      });
    },
    [],
  );

  useRealtime({
    channelName: "conversation-board-realtime",
    onConversationEvent: (event) => {
      handleBoardConversationEvent(event);
    },
    onMessageEvent: (event) => {
      handleBoardMessageEvent(event);
    },
  });

  const groupedItems = useMemo(() => {
    const byLane = new Map<string, ConversationBoardItem[]>();
    for (const lane of boardLanes) {
      byLane.set(lane.id, []);
    }

    for (const item of items) {
      const bucket = byLane.get(item.lane_id);
      if (bucket) bucket.push(item);
    }

    for (const bucket of byLane.values()) bucket.sort(compareBoardItems);

    const priorityItems = items.filter(isPriorityItem).sort(compareBoardItems);

    return { byLane, priorityItems };
  }, [boardLanes, items]);
  const activeDragItem = useMemo(
    () => (activeDragItemId ? items.find((item) => item.id === activeDragItemId) ?? null : null),
    [activeDragItemId, items],
  );

  const updateItem = useCallback(
    async (itemId: string, payload: Record<string, unknown>) => {
      const response = await fetch(`/api/conversation-board-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as
        | { item?: ConversationBoardItem; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update board item");
      }
      if (data?.item) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? data.item! : item)),
        );
      } else if (selectedBoardId) {
        await refreshItems(selectedBoardId);
      }
    },
    [refreshItems, selectedBoardId],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragItemId(null);
      const { active, over } = event;
      if (!over) return;
      const itemId = String(active.id);
      const overId = String(over.id);
      const item = items.find((row) => row.id === itemId);
      if (!item) return;

      try {
        if (overId === PRIORITY_COLUMN_ID) {
          await updateItem(item.id, {
            priorityRank: item.priority_rank > 0 ? item.priority_rank : 3,
            priorityReason: item.priority_reason || "Prioridade",
          });
          return;
        }

        if (boardLanes.some((lane) => lane.id === overId)) {
          if (overId !== item.lane_id) {
            await updateItem(item.id, { laneId: overId });
          }
        }
      } catch (error) {
        console.error("[boards] failed to move item:", error);
          toast.error(t("boards.errors.moveItem", {}, "Falha ao mover conversa"));
      }
    },
    [boardLanes, items, updateItem, t],
  );
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragItemId(String(event.active.id));
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragItemId(null);
  }, []);

  const handleCreateBoard = useCallback(async () => {
    const name = boardName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/conversation-boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: boardDescription.trim() || null,
          groupId: boardGroupId || null,
          isDefault: boards.length === 0,
          position: boards.length,
        }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { board?: ConversationBoard; error?: string }
        | null;
      if (!res.ok) throw new Error(payload?.error || "Failed to create board");
      setCreateBoardOpen(false);
      setBoardName("");
      setBoardDescription("");
      setBoardGroupId("");
      await refreshBoards();
      if (payload?.board?.id) setSelectedBoardId(payload.board.id);
    } catch (error) {
      console.error("[boards] create board failed:", error);
      toast.error(t("boards.errors.createBoard", {}, "Falha ao criar board"));
    } finally {
      setSaving(false);
    }
  }, [boardDescription, boardGroupId, boardName, boards.length, refreshBoards, t]);

  const handleCreateGroup = useCallback(async () => {
    const name = groupName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/conversation-board-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: groupDescription.trim() || null,
        }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { group?: ConversationBoardGroup; error?: string }
        | null;
      if (!res.ok) throw new Error(payload?.error || "Failed to create group");
      setCreateGroupOpen(false);
      setGroupName("");
      setGroupDescription("");
      await refreshBoards();
    } catch (error) {
      console.error("[boards] create group failed:", error);
      toast.error(t("boards.errors.createGroup", {}, "Falha ao criar grupo"));
    } finally {
      setSaving(false);
    }
  }, [groupDescription, groupName, refreshBoards, t]);

  const handleOpenInbox = useCallback(
    (conversationId: string) => {
      const source = items.find((item) => item.conversation_id === conversationId)?.conversation ?? null;
      if (!source) {
        toast.error(t("boards.errors.openConversation", {}, "Falha ao abrir conversa"));
        return;
      }
      setActiveConversation(source);
      setActiveContact(source.contact ?? null);
      setModalMessages([]);
      setConversationModalOpen(true);
    },
    [items, t],
  );

  const handleCloseConversationModal = useCallback(() => {
    setConversationModalOpen(false);
    setActiveConversation(null);
    setActiveContact(null);
    setModalMessages([]);
  }, []);

  const handleModalMessagesLoaded = useCallback((loaded: Message[]) => {
    setModalMessages(loaded);
  }, []);

  const handleModalNewMessage = useCallback((msg: Message) => {
    setModalMessages((prev) => {
      if (prev.some((existing) => existing.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const handleModalUpdateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setModalMessages((prev) => prev.map((message) => (message.id === id ? { ...message, ...updates } : message)));
  }, []);

  const handleModalStatusChange = useCallback((conversationId: string, status: ConversationStatus) => {
    setActiveConversation((prev) => (prev?.id === conversationId ? { ...prev, status } : prev));
    setItems((prev) =>
      prev.map((item) =>
        item.conversation_id === conversationId && item.conversation
          ? { ...item, conversation: { ...item.conversation, status } }
          : item,
      ),
    );
  }, []);

  const handleModalAssignChange = useCallback((conversationId: string, assignedAgentId: string | null) => {
    setActiveConversation((prev) =>
      prev?.id === conversationId
        ? { ...prev, assigned_agent_id: assignedAgentId ?? undefined }
        : prev,
    );
    setItems((prev) =>
      prev.map((item) =>
        item.conversation_id === conversationId && item.conversation
          ? {
              ...item,
              conversation: {
                ...item.conversation,
                assigned_agent_id: assignedAgentId ?? undefined,
              },
            }
          : item,
      ),
    );
  }, []);

  const handleModalManualRefresh = useCallback(() => {
    setModalResyncToken((prev) => prev + 1);
  }, []);

  const handleOpenMoveToBoard = useCallback(
    (item: ConversationBoardItem) => {
      setMoveTargetItem(item);

      const preferredBoardId =
        boards.find((board) => board.id !== selectedBoardId)?.id ??
        selectedBoardId ??
        boards[0]?.id ??
        "";
      const preferredBoard = boards.find((board) => board.id === preferredBoardId) ?? null;
      const preferredLanes = sortBoardLanes(preferredBoard?.lanes ?? []);
      const preferredLaneId =
        preferredBoardId === item.board_id && preferredLanes.some((lane) => lane.id === item.lane_id)
          ? item.lane_id
          : (preferredLanes[0]?.id ?? "");

      setMoveBoardId(preferredBoardId);
      setMoveLaneId(preferredLaneId);
      setMoveBoardOpen(true);
    },
    [boards, selectedBoardId],
  );

  const handleMoveBoardChange = useCallback(
    (value: string | null) => {
      const nextBoardId = value ?? "";
      setMoveBoardId(nextBoardId);
      const nextBoard = boards.find((board) => board.id === nextBoardId) ?? null;
      const nextLanes = sortBoardLanes(nextBoard?.lanes ?? []);
      setMoveLaneId(nextLanes[0]?.id ?? "");
    },
    [boards],
  );

  const handleMoveLaneChange = useCallback((value: string | null) => {
    setMoveLaneId(value ?? "");
  }, []);

  const handleMoveToBoard = useCallback(async () => {
    if (!moveTargetItem || !moveBoardId || !moveLaneId) return;

    setMovingToBoard(true);
    try {
      const res = await fetch(`/api/conversation-boards/${moveBoardId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: moveTargetItem.conversation_id,
          laneId: moveLaneId,
        }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { item?: ConversationBoardItem; error?: string }
        | null;
      if (!res.ok || !payload?.item) {
        throw new Error(payload?.error || "Failed to move conversation to board");
      }

      setMoveBoardOpen(false);
      setMoveTargetItem(null);
      toast.success(t("boards.moveSuccess", {}, "Conversa movida para outro board"));
      await refreshBoards();
      if (selectedBoardId) {
        await refreshItems(selectedBoardId);
      }
    } catch (error) {
      console.error("[boards] failed to move conversation to another board:", error);
      toast.error(t("boards.errors.moveToBoard", {}, "Falha ao mover conversa para outro board"));
    } finally {
      setMovingToBoard(false);
    }
  }, [moveBoardId, moveLaneId, moveTargetItem, refreshBoards, refreshItems, selectedBoardId, t]);

  const openLaneManager = useCallback(() => {
    setEditableLanes(
      boardLanes.map((lane) => ({
        id: lane.id,
        lane_key: lane.lane_key,
        name: lane.name,
        color: lane.color,
      })),
    );
    setManageLanesOpen(true);
  }, [boardLanes]);

  const addEditableLane = useCallback(() => {
    setEditableLanes((prev) => [
      ...prev,
      {
        name: t("boards.newLaneName", {}, "Nova raia"),
        color: DEFAULT_LANE_COLORS[prev.length % DEFAULT_LANE_COLORS.length],
      },
    ]);
  }, [t]);

  const saveEditableLanes = useCallback(async () => {
    if (!selectedBoardId || editableLanes.length === 0) return;
    if (editableLanes.some((lane) => !lane.name.trim())) {
      toast.error(t("boards.errors.emptyLaneName", {}, "Nome da raia não pode ficar vazio"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/conversation-boards/${selectedBoardId}/lanes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lanes: editableLanes.map((lane) => ({
            id: lane.id,
            name: lane.name.trim(),
            color: lane.color,
          })),
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Failed to save lanes");
      }
      setManageLanesOpen(false);
      await refreshBoards();
      await refreshItems(selectedBoardId);
    } catch (error) {
      console.error("[boards] save lanes failed:", error);
      toast.error(saveLanesErrorText);
    } finally {
      setSaving(false);
    }
  }, [editableLanes, refreshBoards, refreshItems, saveLanesErrorText, selectedBoardId, t]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t("boards.title", {}, "Boards")}</h1>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {t(
              "boards.description",
              {},
              "Organize conversas em boards com grupos opcionais, prioridades e aguardando retorno.",
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canCreate && (
            <>
              <Button variant="outline" onClick={() => setCreateGroupOpen(true)}>
                <UsersRound className="mr-2 h-4 w-4" />
                {t("boards.newGroup", {}, "Novo grupo")}
              </Button>
              <Button onClick={() => setCreateBoardOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("boards.newBoard", {}, "Novo board")}
              </Button>
              {selectedBoardId && (
                <Button variant="outline" onClick={openLaneManager}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t("boards.manageLanes", {}, "Gerenciar raias")}
                </Button>
              )}
            </>
          )}
          <Button variant="ghost" onClick={() => refreshBoards()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("boards.refresh", {}, "Atualizar")}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Label className="text-xs text-muted-foreground">
              {t("boards.currentBoard", {}, "Board atual")}
            </Label>
            <div className="mt-1 flex items-center gap-2">
              <Select value={selectedBoardId} onValueChange={(value) => setSelectedBoardId(value ?? "")}>
                <SelectTrigger className="w-full lg:w-[320px]">
                  <SelectValue placeholder={t("boards.selectBoard", {}, "Selecione um board")}>
                    {selectedBoardName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBoard?.group && (
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {selectedBoard.group.name}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{boards.length}</span>
            <span>{t("boards.boardsCount", {}, "boards")}</span>
            <span>•</span>
            <span>{groups.length}</span>
            <span>{t("boards.groupsCount", {}, "groups")}</span>
          </div>
        </div>
      </div>

      {!selectedBoardId ? (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">
            {t("boards.emptyTitle", {}, "Crie seu primeiro board")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "boards.emptyDescription",
              {},
              "Boards podem ser independentes ou vinculados a um grupo.",
            )}
          </p>
          {canCreate && (
            <Button className="mt-4" onClick={() => setCreateBoardOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("boards.newBoard", {}, "Novo board")}
            </Button>
          )}
        </div>
      ) : loadingItems || loadingBoards ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {t("common.loading", {}, "Carregando...")}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-3">
            <PriorityColumn
              items={groupedItems.priorityItems}
              onOpenInbox={handleOpenInbox}
              onMoveToBoard={handleOpenMoveToBoard}
              canOperate={canOperate}
              onToggleAwaiting={(item) =>
                updateItem(item.id, {
                  awaitingReturn: !item.awaiting_return,
                  awaitingReturnReason:
                    !item.awaiting_return
                      ? item.awaiting_return_reason || t("boards.awaitingReturn", {}, "Aguardando retorno")
                      : null,
                })
              }
              onTogglePriority={(item) =>
                updateItem(item.id, {
                  priorityRank: item.priority_rank > 0 ? 0 : 3,
                  priorityReason: item.priority_rank > 0 ? null : item.priority_reason || "Prioridade",
                })
              }
            />

            {boardLanes.map((lane) => (
              <BoardLaneColumn
                key={lane.id}
                lane={lane}
                description={
                  SYSTEM_LANE_DESCRIPTION_KEYS[lane.lane_key]
                    ? t(SYSTEM_LANE_DESCRIPTION_KEYS[lane.lane_key]!)
                    : t("boards.customLaneDescription", {}, "Raia personalizada do board.")
                }
                items={groupedItems.byLane.get(lane.id) ?? []}
                onOpenInbox={handleOpenInbox}
                onMoveToBoard={handleOpenMoveToBoard}
                canOperate={canOperate}
                onToggleAwaiting={(item) =>
                  updateItem(item.id, {
                    awaitingReturn: !item.awaiting_return,
                    awaitingReturnReason:
                      !item.awaiting_return
                        ? item.awaiting_return_reason || t("boards.awaitingReturn", {}, "Aguardando retorno")
                        : null,
                  })
                }
                onTogglePriority={(item) =>
                  updateItem(item.id, {
                    priorityRank: item.priority_rank > 0 ? 0 : 3,
                    priorityReason: item.priority_rank > 0 ? null : item.priority_reason || "Prioridade",
                  })
                }
              />
            ))}
          </div>
          <DragOverlay zIndex={1000}>
            {activeDragItem ? (
              <div className="opacity-95">
                <BoardCard
                  item={activeDragItem}
                  onOpenInbox={handleOpenInbox}
                  onMoveToBoard={() => {}}
                  canOperate={false}
                  onToggleAwaiting={() => {}}
                  onTogglePriority={() => {}}
                  draggable={false}
                  interactive={false}
                  isOverlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Dialog
        open={conversationModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseConversationModal();
        }}
      >
        <DialogContent className="h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-0 p-0 sm:h-[88vh] sm:w-[calc(100vw-2rem)] sm:max-w-[1200px] sm:rounded-xl sm:border">
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
              <DialogTitle className="text-sm font-semibold">
                {activeContact?.name || activeContact?.phone || t("boards.openConversation", {}, "Conversa")}
              </DialogTitle>
            </div>
            <div className="flex min-h-0 flex-1">
              <MessageThread
                conversation={activeConversation}
                contact={activeContact}
                messages={modalMessages}
                onMessagesLoaded={handleModalMessagesLoaded}
                onNewMessage={handleModalNewMessage}
                onUpdateMessage={handleModalUpdateMessage}
                onStatusChange={handleModalStatusChange}
                onAssignChange={handleModalAssignChange}
                resyncToken={modalResyncToken}
                onRefresh={handleModalManualRefresh}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={moveBoardOpen}
        onOpenChange={(open) => {
          setMoveBoardOpen(open);
          if (!open) setMoveTargetItem(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("boards.moveToBoardTitle", {}, "Mover para board")}</DialogTitle>
            <DialogDescription>
              {t(
                "boards.moveToBoardDescription",
                {},
                "Escolha o board e a raia de destino para esta conversa.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t("boards.selectBoard", {}, "Selecione um board")}</Label>
              <Select value={moveBoardId} onValueChange={handleMoveBoardChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("boards.selectBoard", {}, "Selecione um board")}>
                    {moveSelectedBoardName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("boards.selectLane", {}, "Selecione uma raia")}</Label>
              <Select
                value={moveLaneId}
                onValueChange={handleMoveLaneChange}
                disabled={moveSelectedLanes.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("boards.selectLane", {}, "Selecione uma raia")}>
                    {moveSelectedLaneName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {moveSelectedLanes.map((lane) => (
                    <SelectItem key={lane.id} value={lane.id}>
                      {lane.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveBoardOpen(false)}>
              {t("common.cancel", {}, "Cancelar")}
            </Button>
            <Button onClick={() => void handleMoveToBoard()} disabled={!moveBoardId || !moveLaneId || movingToBoard}>
              {movingToBoard
                ? t("common.saving", {}, "Salvando...")
                : t("boards.moveToBoard", {}, "Mover para board")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createBoardOpen} onOpenChange={setCreateBoardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("boards.createBoardTitle", {}, "Criar board")}</DialogTitle>
            <DialogDescription>
              {t(
                "boards.createBoardDescription",
                {},
                "Boards podem ficar soltos ou vinculados a um grupo.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="board-name">{t("boards.boardName", {}, "Nome")}</Label>
              <Input id="board-name" value={boardName} onChange={(e) => setBoardName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-description">
                {t("boards.boardDescription", {}, "Descrição")}
              </Label>
              <Textarea
                id="board-description"
                value={boardDescription}
                onChange={(e) => setBoardDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-group">{t("boards.boardGroup", {}, "Grupo opcional")}</Label>
              <Select
                value={boardGroupId || NO_GROUP_VALUE}
                onValueChange={(value) =>
                  setBoardGroupId(value === NO_GROUP_VALUE ? "" : (value ?? ""))
                }
              >
                <SelectTrigger className="w-full" id="board-group">
                  <SelectValue placeholder={t("boards.noGroup", {}, "Sem grupo")}>
                    {selectedGroupName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GROUP_VALUE}>{t("boards.noGroup", {}, "Sem grupo")}</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateBoardOpen(false)}>
              {t("common.cancel", {}, "Cancelar")}
            </Button>
            <Button onClick={() => void handleCreateBoard()} disabled={saving}>
              {saving ? t("common.saving", {}, "Salvando...") : t("common.save", {}, "Salvar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("boards.createGroupTitle", {}, "Criar grupo")}</DialogTitle>
            <DialogDescription>
              {t(
                "boards.createGroupDescription",
                {},
                "Grupos são opcionais e servem para organizar vários boards.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="group-name">{t("boards.groupName", {}, "Nome")}</Label>
              <Input id="group-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">
                {t("boards.groupDescription", {}, "Descrição")}
              </Label>
              <Textarea
                id="group-description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>
              {t("common.cancel", {}, "Cancelar")}
            </Button>
            <Button onClick={() => void handleCreateGroup()} disabled={saving}>
              {saving ? t("common.saving", {}, "Salvando...") : t("common.save", {}, "Salvar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={manageLanesOpen} onOpenChange={setManageLanesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("boards.manageLanesTitle", {}, "Gerenciar raias")}</DialogTitle>
            <DialogDescription>
              {t(
                "boards.manageLanesDescription",
                {},
                "Crie, remova e reordene as raias deste board.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {editableLanes.map((lane, index) => (
              <div key={lane.id ?? `new-${index}`} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={lane.name}
                  onChange={(e) =>
                    setEditableLanes((prev) =>
                      prev.map((current, i) =>
                        i === index ? { ...current, name: e.target.value } : current,
                      ),
                    )
                  }
                  className="h-8"
                />
                <Input
                  type="color"
                  value={lane.color}
                  onChange={(e) =>
                    setEditableLanes((prev) =>
                      prev.map((current, i) =>
                        i === index ? { ...current, color: e.target.value } : current,
                      ),
                    )
                  }
                  className="h-8 w-12 p-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === 0}
                  onClick={() =>
                    setEditableLanes((prev) => {
                      if (index === 0) return prev;
                      const next = [...prev];
                      const row = next[index]!;
                      next[index] = next[index - 1]!;
                      next[index - 1] = row;
                      return next;
                    })
                  }
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === editableLanes.length - 1}
                  onClick={() =>
                    setEditableLanes((prev) => {
                      if (index >= prev.length - 1) return prev;
                      const next = [...prev];
                      const row = next[index]!;
                      next[index] = next[index + 1]!;
                      next[index + 1] = row;
                      return next;
                    })
                  }
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={editableLanes.length <= 1}
                  onClick={() =>
                    setEditableLanes((prev) =>
                      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Button type="button" variant="outline" onClick={addEditableLane}>
              <Plus className="mr-2 h-4 w-4" />
              {t("boards.addLane", {}, "Adicionar raia")}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManageLanesOpen(false)}>
              {t("common.cancel", {}, "Cancelar")}
            </Button>
            <Button onClick={() => void saveEditableLanes()} disabled={saving}>
              {saving ? t("common.saving", {}, "Salvando...") : t("common.save", {}, "Salvar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PriorityColumn({
  items,
  onOpenInbox,
  onMoveToBoard,
  canOperate,
  onToggleAwaiting,
  onTogglePriority,
}: {
  items: ConversationBoardItem[];
  onOpenInbox: (conversationId: string) => void;
  onMoveToBoard: (item: ConversationBoardItem) => void;
  canOperate: boolean;
  onToggleAwaiting: (item: ConversationBoardItem) => void;
  onTogglePriority: (item: ConversationBoardItem) => void;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: PRIORITY_COLUMN_ID });

  return (
    <BoardColumnShell
      ref={setNodeRef}
      className={cn("bg-card/70", isOver && "ring-2 ring-primary ring-offset-2")}
      title={t("boards.priorityTitle", {}, "Prioridades")}
      description={t(
        "boards.priorityDescription",
        {},
        "Itens aparecem aqui sem sair da coluna original.",
      )}
      count={items.length}
      icon={<Pin className="h-4 w-4 text-amber-400" />}
    >
      {items.map((item) => (
        <BoardCard
          key={item.id}
          item={item}
          onOpenInbox={onOpenInbox}
          onMoveToBoard={onMoveToBoard}
          canOperate={canOperate}
          onToggleAwaiting={onToggleAwaiting}
          onTogglePriority={onTogglePriority}
        />
      ))}
      {items.length === 0 && (
        <EmptyDropState text={t("boards.priorityEmpty", {}, "Arraste uma conversa para destacar")} />
      )}
    </BoardColumnShell>
  );
}

function BoardLaneColumn({
  lane,
  description,
  items,
  onOpenInbox,
  onMoveToBoard,
  canOperate,
  onToggleAwaiting,
  onTogglePriority,
}: {
  lane: ConversationBoardLaneConfig;
  description: string;
  items: ConversationBoardItem[];
  onOpenInbox: (conversationId: string) => void;
  onMoveToBoard: (item: ConversationBoardItem) => void;
  canOperate: boolean;
  onToggleAwaiting: (item: ConversationBoardItem) => void;
  onTogglePriority: (item: ConversationBoardItem) => void;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: lane.id });

  return (
    <BoardColumnShell
      ref={setNodeRef}
      className={cn("bg-card", isOver && "ring-2 ring-primary ring-offset-2")}
      title={lane.name}
      description={description}
      count={items.length}
      icon={<div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lane.color }} />}
    >
      {items.map((item) => (
        <BoardCard
          key={item.id}
          item={item}
          onOpenInbox={onOpenInbox}
          onMoveToBoard={onMoveToBoard}
          canOperate={canOperate}
          onToggleAwaiting={onToggleAwaiting}
          onTogglePriority={onTogglePriority}
        />
      ))}
      {items.length === 0 && (
        <EmptyDropState text={t("boards.laneEmpty", {}, "Solte uma conversa aqui")} />
      )}
    </BoardColumnShell>
  );
}

const BoardColumnShell = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    title: string;
    description: string;
    count: number;
    icon: ReactNode;
    children: ReactNode;
  }
>(function BoardColumnShell(
  { className, title, description, count, icon, children },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex w-[86vw] min-w-[300px] max-w-[360px] shrink-0 flex-col rounded-xl border border-border p-3 lg:w-[360px]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">{count}</Badge>
      </div>

      <ScrollArea className="mt-3 h-[calc(100vh-280px)] min-h-[360px] pr-2">
        <div className="space-y-2 pb-2">{children}</div>
      </ScrollArea>
    </div>
  );
});

function EmptyDropState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}

function BoardCard({
  item,
  onOpenInbox,
  onMoveToBoard,
  canOperate,
  onToggleAwaiting,
  onTogglePriority,
  draggable = true,
  interactive = true,
  isOverlay = false,
}: {
  item: ConversationBoardItem;
  onOpenInbox: (conversationId: string) => void;
  onMoveToBoard: (item: ConversationBoardItem) => void;
  canOperate: boolean;
  onToggleAwaiting: (item: ConversationBoardItem) => void;
  onTogglePriority: (item: ConversationBoardItem) => void;
  draggable?: boolean;
  interactive?: boolean;
  isOverlay?: boolean;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: !draggable,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const unread = item.conversation?.unread_count ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canOperate && draggable ? attributes : {})}
      {...(canOperate && draggable ? listeners : {})}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!interactive) return;
        onOpenInbox(item.conversation_id);
      }}
      className={cn(
        "relative cursor-pointer rounded-xl border border-border bg-background p-3 shadow-sm transition hover:border-primary/40 hover:bg-muted/30",
        isDragging && "opacity-50",
        isOverlay && "z-[1001]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">
            {displayNameForItem(item)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock3 className="h-3 w-3" />
            <span>
              {item.conversation?.last_message_at
                ? new Date(item.conversation.last_message_at).toLocaleString()
                : t("boards.noMessagesYet", {}, "Nenhuma mensagem ainda")}
            </span>
          </div>
        </div>
        {canOperate ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAwaiting(item);
                }}
              >
                {item.awaiting_return
                  ? t("boards.clearAwaitingReturn", {}, "Remover aguardando retorno")
                  : t("boards.markAwaitingReturn", {}, "Aguardando retorno")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePriority(item);
                }}
              >
                {item.priority_rank > 0
                  ? t("boards.clearPriority", {}, "Remover prioridade")
                  : t("boards.promotePriority", {}, "Adicionar à prioridade")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToBoard(item);
                }}
              >
                {t("boards.moveToBoard", {}, "Mover para board")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {previewForItem(item)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {item.mention_active && (
          <Badge variant="default">
            <AtSign className="mr-1 h-3 w-3" />
            {t("boards.mentioned", {}, "Menção")}
          </Badge>
        )}
        {item.awaiting_return && (
          <Badge variant="secondary">
            <Clock3 className="mr-1 h-3 w-3" />
            {t("boards.awaitingReturn", {}, "Aguardando retorno")}
          </Badge>
        )}
        {item.priority_rank > 0 && (
          <Badge variant="outline">
            <Pin className="mr-1 h-3 w-3" />
            {t("boards.priority", {}, "Prioridade")}
          </Badge>
        )}
        {unread > 0 && <Badge>{unread}</Badge>}
      </div>
    </div>
  );
}
