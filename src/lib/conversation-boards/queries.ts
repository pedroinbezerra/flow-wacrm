import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ConversationBoard,
  ConversationBoardGroup,
  ConversationBoardItem,
  ConversationBoardLaneConfig,
} from "@/types";

type DB = SupabaseClient;

interface BoardWithGroupRow extends ConversationBoard {
  group?: ConversationBoardGroup | null;
  lanes?: ConversationBoardLaneConfig[];
}

export async function listConversationBoards(db: DB): Promise<ConversationBoard[]> {
  const { data, error } = await db
    .from("conversation_boards")
    .select("*, group:conversation_board_groups(*), lanes:conversation_board_lanes(*)")
    .order("is_default", { ascending: false })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BoardWithGroupRow[];
}

export async function getConversationBoard(
  db: DB,
  boardId: string,
): Promise<ConversationBoard | null> {
  const { data, error } = await db
    .from("conversation_boards")
    .select("*, group:conversation_board_groups(*), lanes:conversation_board_lanes(*)")
    .eq("id", boardId)
    .maybeSingle();

  if (error) throw error;
  return (data as BoardWithGroupRow | null) ?? null;
}

export async function listConversationBoardGroups(
  db: DB,
): Promise<ConversationBoardGroup[]> {
  const { data, error } = await db
    .from("conversation_board_groups")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ConversationBoardGroup[];
}

export async function listConversationBoardItems(
  db: DB,
  boardId: string,
  laneId?: string | null,
): Promise<{ items: ConversationBoardItem[]; totalCount: number }> {
  let query = db
    .from("conversation_board_items")
    .select("*, conversation:conversations(*, contact:contacts(*)), lane_config:conversation_board_lanes(*)", {
      count: "exact",
    })
    .eq("board_id", boardId)
    .order("updated_at", { ascending: false });

  if (laneId) query = query.eq("lane_id", laneId);

  const { data, error, count } = await query.limit(500);

  if (error) throw error;

  return {
    items: (data ?? []) as ConversationBoardItem[],
    totalCount: Number(count ?? 0),
  };
}
