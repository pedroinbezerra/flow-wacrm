import { NextResponse } from "next/server";

import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { getConversationBoard } from "@/lib/conversation-boards/queries";
import { makeUniqueSlug, slugifyBoardValue } from "@/lib/conversation-boards/slugify";

const MAX_NAME_LEN = 80;
const MAX_DESCRIPTION_LEN = 240;

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
    return NextResponse.json({ board });
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

    const body = (await request.json().catch(() => null)) as
      | {
          name?: unknown;
          description?: unknown;
          groupId?: unknown;
          isDefault?: unknown;
          position?: unknown;
        }
      | null;

    const current = await getConversationBoard(ctx.supabase, boardId);
    if (!current) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (typeof body?.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: "Board name cannot be empty" }, { status: 400 });
      }
      if (name.length > MAX_NAME_LEN) {
        return NextResponse.json(
          { error: `Board name must be ${MAX_NAME_LEN} characters or fewer` },
          { status: 400 },
        );
      }

      const { data: existingBoards, error } = await ctx.supabase
        .from("conversation_boards")
        .select("slug")
        .eq("account_id", ctx.accountId)
        .neq("id", boardId);
      if (error) throw error;

      updates.name = name;
      updates.slug = makeUniqueSlug(
        name,
        (existingBoards ?? []).map((row) => row.slug as string),
        slugifyBoardValue(name, "board"),
      );
    }

    if (typeof body?.description === "string") {
      const description = body.description.trim();
      if (description.length > MAX_DESCRIPTION_LEN) {
        return NextResponse.json(
          { error: `Board description must be ${MAX_DESCRIPTION_LEN} characters or fewer` },
          { status: 400 },
        );
      }
      updates.description = description || null;
    }

    if (typeof body?.groupId === "string") {
      updates.group_id = body.groupId.trim() || null;
    } else if (body?.groupId === null) {
      updates.group_id = null;
    }

    if (typeof body?.isDefault === "boolean") {
      updates.is_default = body.isDefault;
    }

    if (typeof body?.position === "number") {
      updates.position = body.position;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from("conversation_boards")
      .update(updates)
      .eq("id", boardId)
      .select("*, group:conversation_board_groups(*), lanes:conversation_board_lanes(*)")
      .single();

    if (error) {
      console.error("[PATCH /api/conversation-boards/[boardId]] update error:", error);
      return NextResponse.json({ error: "Failed to update board" }, { status: 500 });
    }

    return NextResponse.json({ board: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const ctx = await requireRole("admin");
    const { boardId } = await params;

    const board = await getConversationBoard(ctx.supabase, boardId);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const { error } = await ctx.supabase.from("conversation_boards").delete().eq("id", boardId);
    if (error) {
      console.error("[DELETE /api/conversation-boards/[boardId]] delete error:", error);
      return NextResponse.json({ error: "Failed to delete board" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
