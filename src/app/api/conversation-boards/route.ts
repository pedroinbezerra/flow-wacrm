import { NextResponse } from "next/server";

import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { makeUniqueSlug, slugifyBoardValue } from "@/lib/conversation-boards/slugify";
import { listConversationBoards } from "@/lib/conversation-boards/queries";

const MAX_NAME_LEN = 80;
const MAX_DESCRIPTION_LEN = 240;
const DEFAULT_LANES = [
  { lane_key: "partners", name: "Parceiros", color: "#0ea5e9", position: 0 },
  { lane_key: "franchisees", name: "Franqueados", color: "#8b5cf6", position: 1 },
  { lane_key: "jobs", name: "Jobs", color: "#f59e0b", position: 2 },
  { lane_key: "direct", name: "Conversas diretas", color: "#10b981", position: 3 },
  { lane_key: "other", name: "Outros", color: "#64748b", position: 4 },
] as const;

export async function GET() {
  try {
    const ctx = await requireRole("viewer");
    const boards = await listConversationBoards(ctx.supabase);
    return NextResponse.json({ boards });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireRole("admin");

    const body = (await request.json().catch(() => null)) as
      | {
          name?: unknown;
          description?: unknown;
          groupId?: unknown;
          isDefault?: unknown;
          position?: unknown;
        }
      | null;

    if (typeof body?.name !== "string") {
      return NextResponse.json({ error: "'name' must be a string" }, { status: 400 });
    }

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

    const description =
      typeof body?.description === "string" ? body.description.trim() : "";
    if (description.length > MAX_DESCRIPTION_LEN) {
      return NextResponse.json(
        { error: `Board description must be ${MAX_DESCRIPTION_LEN} characters or fewer` },
        { status: 400 },
      );
    }

    const groupId = typeof body?.groupId === "string" ? body.groupId.trim() || null : null;
    const isDefault = body?.isDefault === true;
    const position = typeof body?.position === "number" ? body.position : 0;

    const { data: existingBoards, error: boardsError } = await ctx.supabase
      .from("conversation_boards")
      .select("slug")
      .eq("account_id", ctx.accountId);
    if (boardsError) throw boardsError;

    const slug = makeUniqueSlug(
      name,
      (existingBoards ?? []).map((row) => row.slug as string),
      slugifyBoardValue(name, "board"),
    );

    const payload: Record<string, unknown> = {
      account_id: ctx.accountId,
      name,
      slug,
      description: description || null,
      is_default: isDefault,
      position,
      created_by_user_id: ctx.userId,
    };
    if (groupId) payload.group_id = groupId;

    const { data, error } = await ctx.supabase
      .from("conversation_boards")
      .insert(payload)
      .select("*, group:conversation_board_groups(*)")
      .single();

    if (error) {
      console.error("[POST /api/conversation-boards] insert error:", error);
      if (
        error.code === "23505" &&
        typeof error.message === "string" &&
        error.message.includes("idx_conversation_boards_group_unique")
      ) {
        return NextResponse.json(
          {
            error:
              "Legacy unique group constraint detected. Run the latest database migrations to allow multiple boards per group.",
          },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
    }

    const { data: createdLanes, error: lanesError } = await ctx.supabase
      .from("conversation_board_lanes")
      .insert(
        DEFAULT_LANES.map((lane) => ({
          account_id: ctx.accountId,
          board_id: data.id as string,
          lane_key: lane.lane_key,
          name: lane.name,
          color: lane.color,
          position: lane.position,
          created_by_user_id: ctx.userId,
        })),
      )
      .select("id,lane_key");
    if (lanesError) {
      console.error("[POST /api/conversation-boards] seed lanes error:", lanesError);
      return NextResponse.json({ error: "Failed to create board lanes" }, { status: 500 });
    }
    const defaultDirectLaneId =
      (createdLanes ?? []).find((lane) => lane.lane_key === "direct")?.id ??
      (createdLanes ?? [])[0]?.id;
    if (!defaultDirectLaneId) {
      return NextResponse.json({ error: "Failed to resolve default board lane" }, { status: 500 });
    }

    if (isDefault && data?.id) {
      const { data: conversations, error: conversationsError } = await ctx.supabase
        .from("conversations")
        .select("id")
        .eq("account_id", ctx.accountId);

      if (conversationsError) {
        console.error("[POST /api/conversation-boards] backfill conversations error:", conversationsError);
      } else if (conversations && conversations.length > 0) {
        const { error: itemsError } = await ctx.supabase
          .from("conversation_board_items")
          .upsert(
            conversations.map((conversation, index) => ({
              account_id: ctx.accountId,
              board_id: data.id,
              conversation_id: conversation.id,
              lane_id: defaultDirectLaneId,
              position: index,
              created_by_user_id: ctx.userId,
            })),
            { onConflict: "board_id,conversation_id" },
          );

        if (itemsError) {
          console.error("[POST /api/conversation-boards] backfill items error:", itemsError);
        }
      }
    }

    return NextResponse.json({ board: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
