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
import { ContactAvatar } from "@/components/ui/contact-avatar";
import { normalizeConversationPreview } from "@/lib/conversation-preview";
import { useRealtime } from "@/hooks/use-realtime";
import { listConversationBoards, listConversationBoardGroups, listConversationBoardItems } from "@/lib/conversation-boards/queries";
import type {
  AccountMember,
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Pencil,
  Pin,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  UsersRound,
  MessageSquare,
  ShieldCheck,
  Search,
  ChevronDown,
  SlidersHorizontal,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageThread } from "@/components/inbox/message-thread";

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

type FilterMode = "all" | "unread" | "mentioned" | "awaiting" | "priority";

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
  return (
    normalizeConversationPreview(item.conversation?.last_message_text) ||
    "Nenhuma mensagem ainda"
  );
}

function formatBoardTime(iso?: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "agora";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(diffSec / 3600);
  if (hours === 1) return "há 1 hora";
  if (hours < 24) return `há ${hours} horas`;
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return "há 1 dia";
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months === 1) return "há 1 mês";
  if (months < 12) return `há ${months} meses`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [editBoardName, setEditBoardName] = useState("");
  const [editBoardDescription, setEditBoardDescription] = useState("");
  const [editBoardGroupId, setEditBoardGroupId] = useState<string>("");
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [manageGroupsOpen, setManageGroupsOpen] = useState(false);
  const [editableGroups, setEditableGroups] = useState<
    { id: string; name: string; description: string }[]
  >([]);
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
  const editSelectedGroupName = useMemo(() => {
    if (!editBoardGroupId) return t("boards.noGroup", {}, "Sem grupo");
    return groups.find((group) => group.id === editBoardGroupId)?.name ?? editBoardGroupId;
  }, [editBoardGroupId, groups, t]);

  const groupedBoardsList = useMemo(() => {
    const ungrouped: ConversationBoard[] = [];
    const byGroup = new Map<string, { groupName: string; boards: ConversationBoard[] }>();

    for (const board of boards) {
      if (board.group?.name) {
        const groupId = board.group.id;
        if (!byGroup.has(groupId)) {
          byGroup.set(groupId, { groupName: board.group.name, boards: [] });
        }
        byGroup.get(groupId)!.boards.push(board);
      } else {
        ungrouped.push(board);
      }
    }

    return { ungrouped, groupsList: Array.from(byGroup.values()) };
  }, [boards]);

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

  // Filtered items based on searchQuery & filterMode
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (item.conversation?.contact?.name || "").toLowerCase();
        const phone = (item.conversation?.contact?.phone || "").toLowerCase();
        const msg = (item.conversation?.last_message_text || "").toLowerCase();
        if (!name.includes(q) && !phone.includes(q) && !msg.includes(q)) {
          return false;
        }
      }

      if (filterMode === "unread") {
        if ((item.conversation?.unread_count ?? 0) <= 0) return false;
      } else if (filterMode === "mentioned") {
        if (!item.mention_active) return false;
      } else if (filterMode === "awaiting") {
        if (!item.awaiting_return) return false;
      } else if (filterMode === "priority") {
        if (item.priority_rank <= 0 && !item.mention_active && !item.awaiting_return) return false;
      }
      return true;
    });
  }, [items, filterMode, searchQuery]);

  // Dynamic counts for quick filter pills
  const statsCounts = useMemo(() => {
    const total = items.length;
    const unread = items.filter((i) => (i.conversation?.unread_count ?? 0) > 0).length;
    const mentioned = items.filter((i) => i.mention_active).length;
    const awaiting = items.filter((i) => i.awaiting_return).length;
    const priority = items.filter((i) => isPriorityItem(i)).length;
    return { total, unread, mentioned, awaiting, priority };
  }, [items]);

  const groupedItems = useMemo(() => {
    const byLane = new Map<string, ConversationBoardItem[]>();
    for (const lane of boardLanes) {
      byLane.set(lane.id, []);
    }

    for (const item of filteredItems) {
      const bucket = byLane.get(item.lane_id);
      if (bucket) bucket.push(item);
    }

    for (const bucket of byLane.values()) bucket.sort(compareBoardItems);

    const priorityItems = filteredItems.filter(isPriorityItem).sort(compareBoardItems);

    return { byLane, priorityItems };
  }, [boardLanes, filteredItems]);

  const activeDragItem = useMemo(
    () => (activeDragItemId ? items.find((item) => item.id === activeDragItemId) ?? null : null),
    [activeDragItemId, items],
  );

  const updateItem = useCallback(
    async (itemId: string, payload: Record<string, unknown>) => {
      let previousItem: ConversationBoardItem | null = null;
      setItems((prev) => {
        const current = prev.find((item) => item.id === itemId) ?? null;
        previousItem = current;
        if (!current) return prev;
        return prev.map((item) => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            ...(typeof payload.laneId === "string" ? { lane_id: payload.laneId } : {}),
            ...(typeof payload.priorityRank === "number"
              ? {
                  priority_rank: payload.priorityRank,
                  priority_reason:
                    payload.priorityRank > 0
                      ? typeof payload.priorityReason === "string"
                        ? payload.priorityReason
                        : item.priority_reason
                      : null,
                }
              : {}),
            ...(typeof payload.awaitingReturn === "boolean"
              ? {
                  awaiting_return: payload.awaitingReturn,
                  awaiting_return_reason: payload.awaitingReturn
                    ? typeof payload.awaitingReturnReason === "string"
                      ? payload.awaitingReturnReason
                      : item.awaiting_return_reason
                    : null,
                }
              : {}),
          };
        });
      });

      const response = await fetch(`/api/conversation-board-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as
        | { item?: ConversationBoardItem; error?: string }
        | null;

      if (!response.ok) {
        if (previousItem) {
          setItems((prev) =>
            prev.map((item) => (item.id === itemId ? previousItem! : item)),
          );
        }
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
    [boardLanes, items, t, updateItem],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragItemId(String(event.active.id));
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragItemId(null);
  }, []);

  const openEditBoardModal = useCallback(() => {
    if (!selectedBoard) return;
    setEditBoardName(selectedBoard.name);
    setEditBoardDescription(selectedBoard.description || "");
    setEditBoardGroupId(selectedBoard.group_id || "");
    setEditBoardOpen(true);
  }, [selectedBoard]);

  const handleSaveBoardEdits = useCallback(async () => {
    if (!selectedBoardId) return;
    const name = editBoardName.trim();
    if (!name) {
      toast.error("Nome do board não pode ficar vazio");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/conversation-boards/${selectedBoardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: editBoardDescription.trim() || null,
          groupId: editBoardGroupId || null,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Failed to update board");
      }
      toast.success("Board atualizado com sucesso!");
      setEditBoardOpen(false);
      await refreshBoards();
    } catch (error) {
      console.error("[boards] update board failed:", error);
      toast.error("Falha ao atualizar board");
    } finally {
      setSaving(false);
    }
  }, [editBoardDescription, editBoardGroupId, editBoardName, refreshBoards, selectedBoardId]);

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

  const openManageGroupsModal = useCallback(() => {
    setEditableGroups(
      groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description || "",
      })),
    );
    setManageGroupsOpen(true);
  }, [groups]);

  const handleUpdateGroup = useCallback(
    async (groupId: string, name: string, description: string) => {
      if (!name.trim()) {
        toast.error("Nome do grupo não pode ficar vazio");
        return;
      }
      setSaving(true);
      try {
        const res = await fetch(`/api/conversation-board-groups/${groupId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
          }),
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "Failed to update group");
        }
        toast.success("Grupo atualizado com sucesso!");
        await refreshBoards();
      } catch (error) {
        console.error("[boards] update group failed:", error);
        toast.error("Falha ao atualizar grupo");
      } finally {
        setSaving(false);
      }
    },
    [refreshBoards],
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      if (!confirm("Tem certeza que deseja excluir este grupo? Os boards deste grupo não serão excluídos, apenas ficarão sem grupo.")) {
        return;
      }
      setSaving(true);
      try {
        const res = await fetch(`/api/conversation-board-groups/${groupId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "Failed to delete group");
        }
        toast.success("Grupo excluído com sucesso!");
        setEditableGroups((prev) => prev.filter((g) => g.id !== groupId));
        await refreshBoards();
      } catch (error) {
        console.error("[boards] delete group failed:", error);
        toast.error("Falha ao excluir grupo");
      } finally {
        setSaving(false);
      }
    },
    [refreshBoards],
  );

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

  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [accountMembers, setAccountMembers] = useState<AccountMember[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const openMemberManager = useCallback(async () => {
    if (!selectedBoardId) return;
    setManageMembersOpen(true);
    setLoadingMembers(true);
    try {
      const [membersRes, boardMembersRes] = await Promise.all([
        fetch("/api/account/members", { cache: "no-store" }),
        fetch(`/api/conversation-boards/${selectedBoardId}/members`, { cache: "no-store" }),
      ]);
      const membersJson = await membersRes.json().catch(() => ({}));
      const boardMembersJson = await boardMembersRes.json().catch(() => ({}));

      setAccountMembers(membersJson.members ?? []);
      const assignedIds = (boardMembersJson.members ?? []).map((m: { user_id: string }) => m.user_id);
      setSelectedUserIds(assignedIds);
    } catch (err) {
      console.error("[boards] failed to load members:", err);
    } finally {
      setLoadingMembers(false);
    }
  }, [selectedBoardId]);

  const saveBoardMembers = useCallback(async () => {
    if (!selectedBoardId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/conversation-boards/${selectedBoardId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });
      if (!res.ok) throw new Error("Failed to save permissions");
      toast.success("Permissões do board salvas com sucesso!");
      setManageMembersOpen(false);
    } catch (err) {
      console.error("[boards] failed to save board members:", err);
      toast.error("Falha ao salvar permissões do board");
    } finally {
      setSaving(false);
    }
  }, [selectedBoardId, selectedUserIds]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Header & Operational Actions */}
      <div id="tour-boards-header" className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">{t("boards.title", {}, "Boards")}</h1>
                <Badge variant="outline" className="text-[11px] font-normal border-primary/20 text-primary bg-primary/5">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {t("boards.badge", {}, "Kanban Vivo")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                {t(
                  "boards.description",
                  {},
                  "Organize conversas em boards com grupos opcionais, prioridades e aguardando retorno.",
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Top Actions Bar */}
        <div id="tour-boards-actions" className="hidden sm:flex sm:items-center sm:gap-2 shrink-0">
          {canCreate && (
            <>
              <Button variant="outline" size="sm" onClick={() => setCreateGroupOpen(true)} className="h-8 text-xs shrink-0">
                <UsersRound className="mr-1.5 h-3.5 w-3.5" />
                {t("boards.newGroup", {}, "Novo grupo")}
              </Button>
              {selectedBoardId && (
                <Button variant="outline" size="sm" onClick={openLaneManager} className="h-8 text-xs shrink-0">
                  <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                  {t("boards.manageLanes", {}, "Gerenciar raias")}
                </Button>
              )}
              <Button size="sm" onClick={() => setCreateBoardOpen(true)} className="h-8 text-xs font-medium shrink-0">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {t("boards.newBoard", {}, "Novo board")}
              </Button>
              {selectedBoardId && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8 text-xs shrink-0 gap-1 text-muted-foreground hover:text-foreground">
                        <Settings className="h-3.5 w-3.5" />
                        <span>Configurações</span>
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="text-xs w-48">
                    <DropdownMenuItem onClick={openEditBoardModal}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Editar board
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openMemberManager}>
                      <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                      Permissões
                    </DropdownMenuItem>
                    {groups.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={openManageGroupsModal}>
                          <UsersRound className="mr-2 h-3.5 w-3.5" />
                          Gerenciar grupos
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>

        {/* Mobile Compact Actions Bar (Primary CTA + 3-Dot Overflow Menu) */}
        <div className="flex items-center gap-2 sm:hidden">
          {canCreate && (
            <Button size="sm" onClick={() => setCreateBoardOpen(true)} className="h-8 text-xs font-medium flex-1">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t("boards.newBoard", {}, "Novo board")}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs w-48">
              {canCreate && (
                <>
                  <DropdownMenuItem onClick={() => setCreateGroupOpen(true)}>
                    <UsersRound className="mr-2 h-3.5 w-3.5" />
                    {t("boards.newGroup", {}, "Novo grupo")}
                  </DropdownMenuItem>
                  {groups.length > 0 && (
                    <DropdownMenuItem onClick={openManageGroupsModal}>
                      <Settings className="mr-2 h-3.5 w-3.5" />
                      Gerenciar grupos
                    </DropdownMenuItem>
                  )}
                  {selectedBoardId && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={openEditBoardModal}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Editar board
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openMemberManager}>
                        <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                        Permissões
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openLaneManager}>
                        <Settings className="mr-2 h-3.5 w-3.5" />
                        {t("boards.manageLanes", {}, "Gerenciar raias")}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => refreshBoards()}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                {t("boards.refresh", {}, "Atualizar")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Control & Command Bar: Board Selector + Quick Filters + Live Search */}
      <div id="tour-boards-selector" className="rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-xs space-y-2.5 sm:space-y-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Board & Group Selector */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-full sm:w-[260px]">
              <Select value={selectedBoardId} onValueChange={(value) => setSelectedBoardId(value ?? "")}>
                <SelectTrigger className="h-9 w-full font-medium text-xs">
                  <SelectValue placeholder={t("boards.selectBoard", {}, "Selecione um board")}>
                    {selectedBoardName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {groupedBoardsList.groupsList.map((g) => (
                    <SelectGroup key={g.groupName}>
                      <SelectLabel className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/80 px-2 py-1 bg-muted/30">
                        {g.groupName}
                      </SelectLabel>
                      {g.boards.map((board) => (
                        <SelectItem key={board.id} value={board.id} className="text-xs pl-4">
                          {board.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}

                  {groupedBoardsList.ungrouped.length > 0 && (
                    <SelectGroup>
                      {groupedBoardsList.groupsList.length > 0 && (
                        <SelectLabel className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/80 px-2 py-1 bg-muted/30">
                          Outros Boards
                        </SelectLabel>
                      )}
                      {groupedBoardsList.ungrouped.map((board) => (
                        <SelectItem key={board.id} value={board.id} className="text-xs">
                          {board.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedBoard?.group && (
              <Badge variant="secondary" className="text-xs font-normal shrink-0">
                {selectedBoard.group.name}
              </Badge>
            )}
          </div>

          {/* Search Box & Data Refresh Utility */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-[320px] lg:w-[360px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("boards.searchPlaceholder", {}, "Buscar por nome, telefone ou mensagem...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 pr-7 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refreshBoards()}
              disabled={loadingBoards || loadingItems}
              title={t("boards.refresh", {}, "Atualizar")}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground border-border bg-card shadow-2xs"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", (loadingBoards || loadingItems) && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Quick Filter Pills Bar - Smooth Horizontal Touch Scroll on Mobile */}
        {selectedBoardId && (
          <div className="flex items-center gap-1.5 border-t border-border/50 pt-2 text-xs overflow-x-auto pb-0.5 whitespace-nowrap">
            <span className="text-[11px] font-medium text-muted-foreground mr-1 shrink-0">Filtros:</span>
            <Button
              variant={filterMode === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterMode("all")}
              className="h-7 text-xs px-2.5 rounded-lg font-medium shrink-0"
            >
              Todas ({statsCounts.total})
            </Button>
            <Button
              variant={filterMode === "unread" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterMode("unread")}
              className={cn(
                "h-7 text-xs px-2.5 rounded-lg shrink-0",
                filterMode === "unread" && "bg-primary/10 text-primary hover:bg-primary/20",
              )}
            >
              Não Lidas
              {statsCounts.unread > 0 && (
                <Badge variant="default" className="ml-1.5 h-4 px-1 text-[10px]">
                  {statsCounts.unread}
                </Badge>
              )}
            </Button>
            <Button
              variant={filterMode === "priority" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterMode("priority")}
              className={cn(
                "h-7 text-xs px-2.5 rounded-lg shrink-0",
                filterMode === "priority" && "bg-red-500/10 text-red-400 hover:bg-red-500/20",
              )}
            >
              <Pin className="mr-1 h-3 w-3" />
              Prioridades ({statsCounts.priority})
            </Button>
            <Button
              variant={filterMode === "awaiting" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterMode("awaiting")}
              className={cn(
                "h-7 text-xs px-2.5 rounded-lg shrink-0",
                filterMode === "awaiting" && "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
              )}
            >
              <Clock3 className="mr-1 h-3 w-3" />
              Aguardando Retorno ({statsCounts.awaiting})
            </Button>
            <Button
              variant={filterMode === "mentioned" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterMode("mentioned")}
              className={cn(
                "h-7 text-xs px-2.5 rounded-lg shrink-0",
                filterMode === "mentioned" && "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
              )}
            >
              <AtSign className="mr-1 h-3 w-3" />
              Menções ({statsCounts.mentioned})
            </Button>

            {filterMode !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterMode("all")}
                className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground shrink-0"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {!selectedBoardId ? (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/60" />
          <h2 className="mt-4 text-base font-semibold text-foreground">
            {t("boards.emptyTitle", {}, "Crie seu primeiro board")}
          </h2>
          <p className="mt-1 max-w-md mx-auto text-xs text-muted-foreground">
            {t(
              "boards.emptyDescription",
              {},
              "Boards podem ser independentes ou vinculados a um grupo.",
            )}
          </p>
          {canCreate && (
            <Button className="mt-4 h-9 text-xs" onClick={() => setCreateBoardOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t("boards.newBoard", {}, "Novo board")}
            </Button>
          )}
        </div>
      ) : loadingItems || loadingBoards ? (
        <BoardSkeleton />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <div id="tour-boards-lanes" className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
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
              <div className="rotate-1 scale-[1.02] shadow-2xl transition-transform duration-100">
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

      {/* Modals */}
      <Dialog open={manageGroupsOpen} onOpenChange={setManageGroupsOpen}>
        <DialogContent className="w-[94vw] max-w-lg rounded-xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Gerenciar grupos de boards</DialogTitle>
            <DialogDescription>
              Edite o nome, a descrição ou exclua grupos de boards da sua conta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {editableGroups.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">Nenhum grupo cadastrado.</p>
            ) : (
              editableGroups.map((group, index) => (
                <div key={group.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={group.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditableGroups((prev) =>
                          prev.map((g, i) => (i === index ? { ...g, name: val } : g)),
                        );
                      }}
                      placeholder="Nome do grupo"
                      className="h-8 text-xs font-semibold"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      onClick={() => void handleUpdateGroup(group.id, group.name, group.description)}
                      className="h-8 text-xs shrink-0"
                    >
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      disabled={saving}
                      onClick={() => void handleDeleteGroup(group.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input
                    value={group.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditableGroups((prev) =>
                        prev.map((g, i) => (i === index ? { ...g, description: val } : g)),
                      );
                    }}
                    placeholder="Descrição opcional do grupo"
                    className="h-7 text-xs text-muted-foreground"
                  />
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManageGroupsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editBoardOpen} onOpenChange={setEditBoardOpen}>
        <DialogContent className="w-[94vw] max-w-lg rounded-xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Editar board</DialogTitle>
            <DialogDescription>
              Altere o nome, descrição ou vincule/desvincule este board a um grupo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="edit-board-name">Nome do board</Label>
              <Input
                id="edit-board-name"
                value={editBoardName}
                onChange={(e) => setEditBoardName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-board-description">Descrição</Label>
              <Textarea
                id="edit-board-description"
                value={editBoardDescription}
                onChange={(e) => setEditBoardDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-board-group">Grupo de Boards</Label>
              <Select
                value={editBoardGroupId || NO_GROUP_VALUE}
                onValueChange={(value) =>
                  setEditBoardGroupId(value === NO_GROUP_VALUE ? "" : (value ?? ""))
                }
              >
                <SelectTrigger className="w-full" id="edit-board-group">
                  <SelectValue placeholder={t("boards.noGroup", {}, "Sem grupo")}>
                    {editSelectedGroupName}
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
            <Button variant="outline" onClick={() => setEditBoardOpen(false)}>
              {t("common.cancel", {}, "Cancelar")}
            </Button>
            <Button onClick={() => void handleSaveBoardEdits()} disabled={saving}>
              {saving ? t("common.saving", {}, "Salvando...") : t("common.save", {}, "Salvar alterações")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={conversationModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseConversationModal();
        }}
      >
        <DialogContent className="h-dvh w-screen max-w-none overflow-hidden rounded-none border-0 p-0 sm:h-[88vh] sm:w-[calc(100vw-2rem)] sm:max-w-300 sm:rounded-xl sm:border">
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
                onBoardItemChange={(updatedItem) => {
                  setItems((prev) =>
                    prev.map((item) =>
                      item.id === updatedItem.id ? updatedItem : item,
                    ),
                  );
                }}
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
        <DialogContent className="w-[94vw] max-w-lg rounded-xl p-4 sm:p-6">
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
        <DialogContent className="w-[94vw] max-w-lg rounded-xl p-4 sm:p-6">
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
        <DialogContent className="w-[94vw] max-w-lg rounded-xl p-4 sm:p-6">
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
        <DialogContent className="w-[94vw] max-w-lg rounded-xl p-4 sm:p-6">
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
                  className="h-8 text-xs"
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
            <Button type="button" variant="outline" size="sm" onClick={addEditableLane} className="h-8 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
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

      <Dialog open={manageMembersOpen} onOpenChange={setManageMembersOpen}>
        <DialogContent className="w-[94vw] max-w-md rounded-xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Permissões de Acesso ao Board</DialogTitle>
            <DialogDescription className="text-xs">
              Selecione quais usuários têm permissão para visualizar este Board. Se nenhum for selecionado, todos os membros da conta têm acesso por padrão.
            </DialogDescription>
          </DialogHeader>

          {loadingMembers ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {accountMembers.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">Nenhum membro encontrado.</p>
              ) : (
                accountMembers.map((member) => {
                  const checked = selectedUserIds.includes(member.user_id);
                  return (
                    <label
                      key={member.user_id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/40 p-2.5 hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds((prev) => [...prev, member.user_id]);
                            } else {
                              setSelectedUserIds((prev) => prev.filter((id) => id !== member.user_id));
                            }
                          }}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="text-xs font-medium text-foreground">{member.full_name || member.email}</div>
                          {member.email && <div className="text-[11px] text-muted-foreground">{member.email}</div>}
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {member.role}
                      </Badge>
                    </label>
                  );
                })
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setManageMembersOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveBoardMembers()} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Permissões"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {[1, 2, 3, 4].map((col) => (
        <div
          key={col}
          className="flex w-[86vw] min-w-75 max-w-90 shrink-0 flex-col rounded-xl border border-border bg-card/60 p-3 lg:w-90"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-5 w-6 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="h-28 rounded-xl border border-border/60 bg-background/50 p-3 space-y-2 animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-muted" />
                  <div className="h-4 w-32 rounded bg-muted" />
                </div>
                <div className="h-3 w-full rounded bg-muted/70" />
                <div className="h-3 w-3/4 rounded bg-muted/50" />
              </div>
            ))}
          </div>
        </div>
      ))}
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
      accentColor="#ef4444"
      className={cn("bg-card/70", isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5")}
      title={t("boards.priorityTitle", {}, "Prioridades")}
      count={items.length}
      icon={<Pin className="h-4 w-4 text-red-500 fill-current" />}
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
          draggable={false}
          dragIdPrefix="priority-"
        />
      ))}
      {items.length === 0 && (
        <EmptyDropState text={t("boards.priorityEmpty", {}, "Arraste uma conversa aqui para priorizá-la")} />
      )}
    </BoardColumnShell>
  );
}

function BoardLaneColumn({
  lane,
  items,
  onOpenInbox,
  onMoveToBoard,
  canOperate,
  onToggleAwaiting,
  onTogglePriority,
}: {
  lane: ConversationBoardLaneConfig;
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
      accentColor={lane.color}
      className={cn("bg-card", isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5")}
      title={lane.name}
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
        <EmptyDropState text={t("boards.laneEmpty", {}, "Nenhuma conversa nesta raia")} />
      )}
    </BoardColumnShell>
  );
}

const BoardColumnShell = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    accentColor?: string;
    title: string;
    description?: string;
    count: number;
    icon: ReactNode;
    children: ReactNode;
  }
>(function BoardColumnShell(
  { className, accentColor, title, description, count, icon, children },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-[86vw] min-w-75 max-w-90 shrink-0 flex-col rounded-xl border border-border p-3 transition-colors lg:w-90 overflow-hidden snap-center",
        className,
      )}
    >
      {/* Top Accent Line */}
      {accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Header Container - Fixed z-index and spacing */}
      <div className="flex items-center justify-between gap-2 pt-1 pb-1 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
          </div>
          {description && (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
        <Badge variant="secondary" className="h-5 px-1.5 text-[11px] font-semibold shrink-0">
          {count}
        </Badge>
      </div>

      {/* Scroll Area - Responsive height so cards scroll cleanly on mobile */}
      <ScrollArea className="mt-2 h-[calc(100vh-320px)] sm:h-[calc(100vh-280px)] min-h-75 pr-1.5">
        <div className="space-y-2.5 pb-2 pt-1.5 px-0.5">{children}</div>
      </ScrollArea>
    </div>
  );
});

function EmptyDropState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 p-5 text-center text-xs text-muted-foreground/70 bg-muted/20">
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
  dragIdPrefix = "",
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
  dragIdPrefix?: string;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${dragIdPrefix}${item.id}`,
    disabled: !draggable,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const unread = item.conversation?.unread_count ?? 0;
  const contact = item.conversation?.contact;
  const displayName = displayNameForItem(item);
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = contact?.avatar_url;
  const timeText = formatBoardTime(item.conversation?.last_message_at);

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
        "group relative cursor-pointer rounded-xl border border-border bg-card p-3 shadow-xs transition-all duration-150 ease-in-out hover:z-10 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isDragging && "opacity-40 border-dashed border-primary",
        isOverlay && "z-1001 shadow-2xl border-primary/50 bg-card/95 backdrop-blur-xs",
      )}
    >
      {/* Header Row: Locked to h-7 (28px) */}
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Avatar + Contact Name */}
        <div className="flex h-7 items-center gap-2 min-w-0 flex-1">
          <ContactAvatar
            name={displayName}
            avatarUrl={avatarUrl}
            size="sm"
          />

          <span className="truncate text-xs font-semibold leading-none text-foreground group-hover:text-primary transition-colors">
            {displayName}
          </span>
        </div>

        {/* Right Side: Clock Icon + Timestamp (Flushed to far right edge) */}
        {timeText && (
          <div className="flex h-7 items-center gap-1 shrink-0 ml-auto">
            <Clock3 className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
            <span className="text-[11px] leading-none text-muted-foreground/80 font-normal whitespace-nowrap">
              {timeText}
            </span>
          </div>
        )}

        {/* Floating 3-Dot Action Menu (Fades in over top-right corner on hover without displacing timestamp when unhovered) */}
        {canOperate && interactive ? (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none shadow-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
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
          </div>
        ) : null}
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground/80 leading-snug">
        {previewForItem(item)}
      </p>

      {/* Badges */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {item.mention_active && (
          <Badge variant="default" className="h-4 px-1.5 text-[10px] bg-emerald-500 hover:bg-emerald-600">
            <AtSign className="mr-0.5 h-2.5 w-2.5" />
            {t("boards.mentioned", {}, "Menção")}
          </Badge>
        )}
        {item.awaiting_return && (
          <Badge variant="outline" className="h-4 px-1.5 text-[10px] border-amber-500/40 text-amber-500 bg-amber-500/10">
            <Clock3 className="mr-0.5 h-2.5 w-2.5" />
            {t("boards.awaitingReturn", {}, "Aguardando")}
          </Badge>
        )}
        {item.priority_rank > 0 && (
          <Badge variant="outline" className="h-4 px-1.5 text-[10px] border-red-500/40 text-red-400 bg-red-500/10">
            <Pin className="mr-0.5 h-2.5 w-2.5 fill-current" />
            {t("boards.priority", {}, "Prioridade")}
          </Badge>
        )}
        {unread > 0 && (
          <Badge variant="default" className="h-4 px-1.5 text-[10px] font-bold">
            {unread} não lida{unread > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    </div>
  );
}
