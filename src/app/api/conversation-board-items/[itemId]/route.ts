import { NextResponse } from "next/server";

import { requireRole, toErrorResponse } from "@/lib/auth/account";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const ctx = await requireRole("agent");
    const { itemId } = await params;

    const body = (await request.json().catch(() => null)) as
      | {
        laneId?: unknown;
          position?: unknown;
          priorityRank?: unknown;
          priorityReason?: unknown;
          awaitingReturn?: unknown;
          awaitingReturnReason?: unknown;
          mentionActive?: unknown;
        }
      | null;

    const { data: current, error: currentError } = await ctx.supabase
      .from("conversation_board_items")
      .select("board_id")
      .eq("id", itemId)
      .maybeSingle();

    if (currentError) {
      console.error("[PATCH /api/conversation-board-items/[itemId]] load error:", currentError);
      return NextResponse.json({ error: "Failed to load board item" }, { status: 500 });
    }
    if (!current) {
      return NextResponse.json({ error: "Board item not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (typeof body?.laneId === "string") {
      const laneId = body.laneId.trim();
      if (!laneId) {
        return NextResponse.json({ error: "Invalid laneId" }, { status: 400 });
      }
      const { data: lane, error: laneError } = await ctx.supabase
        .from("conversation_board_lanes")
        .select("id")
        .eq("id", laneId)
        .eq("board_id", current.board_id as string)
        .maybeSingle();
      if (laneError) {
        console.error("[PATCH /api/conversation-board-items/[itemId]] lane lookup error:", laneError);
        return NextResponse.json({ error: "Failed to validate lane" }, { status: 500 });
      }
      if (!lane) {
        return NextResponse.json({ error: "Lane not found for board item" }, { status: 400 });
      }
      updates.lane_id = laneId;
    }

    if (typeof body?.position === "number") {
      updates.position = body.position;
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

    if (typeof body?.mentionActive === "boolean") {
      updates.mention_active = body.mentionActive;
      updates.mention_set_at = body.mentionActive ? new Date().toISOString() : null;
      updates.mention_set_by_user_id = body.mentionActive ? ctx.userId : null;
      updates.mention_cleared_at = body.mentionActive ? null : new Date().toISOString();
      updates.mention_cleared_by_user_id = body.mentionActive ? null : ctx.userId;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from("conversation_board_items")
      .update(updates)
      .eq("id", itemId)
      .select("*, conversation:conversations(*, contact:contacts(*)), lane_config:conversation_board_lanes(*)")
      .single();

    if (error) {
      console.error("[PATCH /api/conversation-board-items/[itemId]] update error:", error);
      return NextResponse.json(
        { error: "Failed to update board item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ item: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
