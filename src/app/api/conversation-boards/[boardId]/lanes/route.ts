import { NextResponse } from "next/server";

import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { getConversationBoard } from "@/lib/conversation-boards/queries";
import { makeUniqueSlug, slugifyBoardValue } from "@/lib/conversation-boards/slugify";

const MAX_LANE_NAME_LEN = 60;

type LaneInput = {
  id?: string;
  name: string;
  color: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const ctx = await requireRole("viewer");
    const { boardId } = await params;
    const board = await getConversationBoard(ctx.supabase, boardId);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const { data, error } = await ctx.supabase
      .from("conversation_board_lanes")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ lanes: data ?? [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const ctx = await requireRole("admin");
    const { boardId } = await params;
    const board = await getConversationBoard(ctx.supabase, boardId);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as
      | { lanes?: LaneInput[] }
      | null;
    if (!Array.isArray(body?.lanes) || body.lanes.length === 0) {
      return NextResponse.json({ error: "At least one lane is required" }, { status: 400 });
    }

    const normalizedLanes = body.lanes.map((lane) => ({
      id: typeof lane.id === "string" ? lane.id.trim() || undefined : undefined,
      name: typeof lane.name === "string" ? lane.name.trim() : "",
      color: typeof lane.color === "string" ? lane.color.trim() : "#64748b",
    }));

    if (normalizedLanes.some((lane) => !lane.name)) {
      return NextResponse.json({ error: "Lane name cannot be empty" }, { status: 400 });
    }
    if (normalizedLanes.some((lane) => lane.name.length > MAX_LANE_NAME_LEN)) {
      return NextResponse.json(
        { error: `Lane name must be ${MAX_LANE_NAME_LEN} characters or fewer` },
        { status: 400 },
      );
    }

    const { data: existing, error: existingError } = await ctx.supabase
      .from("conversation_board_lanes")
      .select("id, lane_key")
      .eq("board_id", boardId);
    if (existingError) throw existingError;

    const existingById = new Map((existing ?? []).map((lane) => [lane.id as string, lane]));
    const existingKeys = (existing ?? []).map((lane) => lane.lane_key as string);

    const rows = normalizedLanes.map((lane, index) => {
      const current = lane.id ? existingById.get(lane.id) : undefined;
      const laneKey =
        current?.lane_key ??
        makeUniqueSlug(
          lane.name,
          existingKeys,
          slugifyBoardValue(`${lane.name}-${index + 1}`, `lane-${index + 1}`),
        );
      if (!existingKeys.includes(laneKey)) existingKeys.push(laneKey);

      return {
        id: lane.id,
        account_id: ctx.accountId,
        board_id: boardId,
        lane_key: laneKey,
        name: lane.name,
        color: lane.color || "#64748b",
        position: index,
        created_by_user_id: ctx.userId,
      };
    });

    const { data: upserted, error: upsertError } = await ctx.supabase
      .from("conversation_board_lanes")
      .upsert(rows, { onConflict: "id" })
      .select("*");
    if (upsertError) {
      console.error("[PATCH /api/conversation-boards/[boardId]/lanes] upsert error:", upsertError);
      return NextResponse.json({ error: "Failed to save lanes" }, { status: 500 });
    }

    const laneIdsToKeep = new Set((upserted ?? []).map((lane) => lane.id as string));
    const laneIdsToDelete = (existing ?? [])
      .map((lane) => lane.id as string)
      .filter((id) => !laneIdsToKeep.has(id));

    const fallbackLaneId = (upserted ?? [])[0]?.id as string | undefined;
    if (laneIdsToDelete.length > 0 && fallbackLaneId) {
      const { error: moveItemsError } = await ctx.supabase
        .from("conversation_board_items")
        .update({ lane_id: fallbackLaneId })
        .eq("board_id", boardId)
        .in("lane_id", laneIdsToDelete);
      if (moveItemsError) throw moveItemsError;

      const { error: deleteError } = await ctx.supabase
        .from("conversation_board_lanes")
        .delete()
        .in("id", laneIdsToDelete);
      if (deleteError) throw deleteError;
    }

    const { data: lanes, error: lanesError } = await ctx.supabase
      .from("conversation_board_lanes")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (lanesError) throw lanesError;

    return NextResponse.json({ lanes: lanes ?? [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}
