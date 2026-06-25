import { NextResponse } from "next/server";

import { requireRole, toErrorResponse } from "@/lib/auth/account";

interface BoardMeta {
  id: string;
  name: string;
  slug: string;
}

interface ExistingBoardItemMeta {
  id: string;
  board_id: string;
}

async function getDefaultBoard(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  accountId: string,
): Promise<BoardMeta | null> {
  const { data, error } = await supabase
    .from("conversation_boards")
    .select("id,name,slug")
    .eq("account_id", accountId)
    .eq("is_default", true)
    .maybeSingle();

  if (error) throw error;
  return (data as BoardMeta | null) ?? null;
}

async function getBoardById(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  boardId: string,
): Promise<BoardMeta | null> {
  const { data, error } = await supabase
    .from("conversation_boards")
    .select("id,name,slug")
    .eq("id", boardId)
    .maybeSingle();
  if (error) throw error;
  return (data as BoardMeta | null) ?? null;
}

async function getExistingBoardItemMeta(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  accountId: string,
  conversationId: string,
): Promise<ExistingBoardItemMeta | null> {
  const { data, error } = await supabase
    .from("conversation_board_items")
    .select("id,board_id")
    .eq("account_id", accountId)
    .eq("conversation_id", conversationId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as ExistingBoardItemMeta | null) ?? null;
}

export async function GET(request: Request) {
  try {
    const ctx = await requireRole("viewer");
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId")?.trim();

    if (!conversationId) {
      return NextResponse.json(
        { error: "'conversationId' is required" },
        { status: 400 },
      );
    }

    const existingItemMeta = await getExistingBoardItemMeta(
      ctx.supabase,
      ctx.accountId,
      conversationId,
    );
    if (!existingItemMeta) {
      const board = await getDefaultBoard(ctx.supabase, ctx.accountId);
      return NextResponse.json({ board, item: null });
    }

    const board = await getBoardById(ctx.supabase, existingItemMeta.board_id);
    const { data: item, error: itemError } = await ctx.supabase
      .from("conversation_board_items")
      .select("*, conversation:conversations(*, contact:contacts(*)), lane_config:conversation_board_lanes(*)")
      .eq("id", existingItemMeta.id)
      .maybeSingle();

    if (itemError) throw itemError;
    return NextResponse.json({ board, item: item ?? null });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireRole("agent");
    const body = (await request.json().catch(() => null)) as
      | {
          conversationId?: unknown;
          awaitingReturn?: unknown;
          awaitingReturnReason?: unknown;
          priorityRank?: unknown;
          priorityReason?: unknown;
        }
      | null;

    if (typeof body?.conversationId !== "string" || !body.conversationId.trim()) {
      return NextResponse.json(
        { error: "'conversationId' must be a non-empty string" },
        { status: 400 },
      );
    }
    const conversationId = body.conversationId.trim();

    const { data: conversation, error: conversationError } = await ctx.supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("account_id", ctx.accountId)
      .maybeSingle();
    if (conversationError) throw conversationError;
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof body?.awaitingReturn === "boolean") {
      updates.awaiting_return = body.awaitingReturn;
      updates.awaiting_return_reason = body.awaitingReturn
        ? typeof body.awaitingReturnReason === "string"
          ? body.awaitingReturnReason.trim() || null
          : null
        : null;
      updates.awaiting_return_set_at = body.awaitingReturn ? new Date().toISOString() : null;
      updates.awaiting_return_set_by_user_id = body.awaitingReturn ? ctx.userId : null;
      updates.awaiting_return_cleared_at = body.awaitingReturn ? null : new Date().toISOString();
      updates.awaiting_return_cleared_by_user_id = body.awaitingReturn ? null : ctx.userId;
    }

    if (typeof body?.priorityRank === "number") {
      if (body.priorityRank < 0 || body.priorityRank > 3) {
        return NextResponse.json({ error: "Invalid priorityRank" }, { status: 400 });
      }
      updates.priority_rank = body.priorityRank;
      updates.priority_set_at = body.priorityRank > 0 ? new Date().toISOString() : null;
      updates.priority_reason =
        typeof body.priorityReason === "string" ? body.priorityReason.trim() || null : null;
      updates.priority_set_by_user_id = body.priorityRank > 0 ? ctx.userId : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    let existingItem = await getExistingBoardItemMeta(ctx.supabase, ctx.accountId, conversationId);
    let itemId = existingItem?.id;
    if (!itemId) {
      const board = await getDefaultBoard(ctx.supabase, ctx.accountId);
      if (!board) {
        return NextResponse.json({ error: "Default board not found" }, { status: 404 });
      }
      const { data: firstLane, error: laneError } = await ctx.supabase
        .from("conversation_board_lanes")
        .select("id")
        .eq("board_id", board.id)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (laneError) throw laneError;
      if (!firstLane?.id) {
        return NextResponse.json({ error: "Board has no lanes configured" }, { status: 400 });
      }

      const { data: createdItem, error: createError } = await ctx.supabase
        .from("conversation_board_items")
        .insert({
          account_id: ctx.accountId,
          board_id: board.id,
          conversation_id: conversationId,
          lane_id: firstLane.id as string,
          position: 0,
          created_by_user_id: ctx.userId,
        })
        .select("id")
        .single();
      if (createError) throw createError;
      itemId = createdItem.id as string;
      existingItem = { id: itemId, board_id: board.id };
    }

    const { data: item, error: updateError } = await ctx.supabase
      .from("conversation_board_items")
      .update(updates)
      .eq("id", itemId)
      .select("*, conversation:conversations(*, contact:contacts(*)), lane_config:conversation_board_lanes(*)")
      .single();
    if (updateError) throw updateError;

    const board =
      existingItem?.board_id
        ? await getBoardById(ctx.supabase, existingItem.board_id)
        : await getDefaultBoard(ctx.supabase, ctx.accountId);

    return NextResponse.json({ board, item });
  } catch (err) {
    return toErrorResponse(err);
  }
}
