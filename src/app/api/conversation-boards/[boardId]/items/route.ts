import { NextResponse } from "next/server";

import { requireRole, toErrorResponse } from "@/lib/auth/account";
import {
  listConversationBoardItems,
  getConversationBoard,
} from "@/lib/conversation-boards/queries";

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

    const items = await listConversationBoardItems(ctx.supabase, boardId);
    return NextResponse.json({ board, ...items });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const ctx = await requireRole("agent");
    const { boardId } = await params;

    const body = (await request.json().catch(() => null)) as
      | { conversationId?: unknown; laneId?: unknown; position?: unknown }
      | null;

    if (typeof body?.conversationId !== "string") {
      return NextResponse.json(
        { error: "'conversationId' must be a string" },
        { status: 400 },
      );
    }

    const position = typeof body?.position === "number" ? body.position : 0;
    const conversationId = body.conversationId.trim();

    const board = await getConversationBoard(ctx.supabase, boardId);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    const { data: conversation, error: conversationError } = await ctx.supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("account_id", ctx.accountId)
      .maybeSingle();
    if (conversationError) {
      console.error(
        "[POST /api/conversation-boards/[boardId]/items] conversation lookup error:",
        conversationError,
      );
      return NextResponse.json({ error: "Failed to validate conversation" }, { status: 500 });
    }
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    let laneId: string | null =
      typeof body?.laneId === "string" ? body.laneId.trim() || null : null;
    if (!laneId) {
      const { data: firstLane, error: laneError } = await ctx.supabase
        .from("conversation_board_lanes")
        .select("id")
        .eq("board_id", boardId)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (laneError) {
        console.error("[POST /api/conversation-boards/[boardId]/items] lane lookup error:", laneError);
        return NextResponse.json({ error: "Failed to resolve board lane" }, { status: 500 });
      }
      laneId = (firstLane?.id as string | undefined) ?? null;
    }
    if (!laneId) {
      return NextResponse.json({ error: "Board has no lanes configured" }, { status: 400 });
    }

    const { error: cleanupError } = await ctx.supabase
      .from("conversation_board_items")
      .delete()
      .eq("account_id", ctx.accountId)
      .eq("conversation_id", conversationId)
      .neq("board_id", boardId);
    if (cleanupError) {
      console.error("[POST /api/conversation-boards/[boardId]/items] cleanup error:", cleanupError);
      return NextResponse.json({ error: "Failed to move conversation to board" }, { status: 500 });
    }

    const { data, error } = await ctx.supabase
      .from("conversation_board_items")
      .upsert(
        {
          account_id: ctx.accountId,
          board_id: boardId,
          conversation_id: conversationId,
          lane_id: laneId,
          position,
          created_by_user_id: ctx.userId,
        },
        { onConflict: "board_id,conversation_id" },
      )
      .select("*, conversation:conversations(*, contact:contacts(*)), lane_config:conversation_board_lanes(*)")
      .single();

    if (error) {
      console.error("[POST /api/conversation-boards/[boardId]/items] insert error:", error);
      return NextResponse.json(
        { error: "Failed to add conversation to board" },
        { status: 500 },
      );
    }

    return NextResponse.json({ item: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
