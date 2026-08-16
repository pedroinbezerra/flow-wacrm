import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { makeUniqueSlug, slugifyBoardValue } from "@/lib/conversation-boards/slugify";

const MAX_NAME_LEN = 80;
const MAX_DESCRIPTION_LEN = 240;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const ctx = await requireRole("viewer");
    const { groupId } = await params;
    const { data, error } = await ctx.supabase
      .from("conversation_board_groups")
      .select("*")
      .eq("id", groupId)
      .eq("account_id", ctx.accountId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    return NextResponse.json({ group: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const ctx = await requireRole("admin");
    const { groupId } = await params;

    const body = (await request.json().catch(() => null)) as
      | { name?: unknown; description?: unknown }
      | null;

    const { data: current, error: fetchErr } = await ctx.supabase
      .from("conversation_board_groups")
      .select("*")
      .eq("id", groupId)
      .eq("account_id", ctx.accountId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!current) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (typeof body?.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: "Group name cannot be empty" }, { status: 400 });
      }
      if (name.length > MAX_NAME_LEN) {
        return NextResponse.json(
          { error: `Group name must be ${MAX_NAME_LEN} characters or fewer` },
          { status: 400 },
        );
      }

      const { data: existingGroups, error } = await ctx.supabase
        .from("conversation_board_groups")
        .select("slug")
        .eq("account_id", ctx.accountId)
        .neq("id", groupId);
      if (error) throw error;

      updates.name = name;
      updates.slug = makeUniqueSlug(
        name,
        (existingGroups ?? []).map((row) => row.slug as string),
        slugifyBoardValue(name, "group"),
      );
    }

    if (typeof body?.description === "string") {
      const description = body.description.trim();
      if (description.length > MAX_DESCRIPTION_LEN) {
        return NextResponse.json(
          { error: `Group description must be ${MAX_DESCRIPTION_LEN} characters or fewer` },
          { status: 400 },
        );
      }
      updates.description = description || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from("conversation_board_groups")
      .update(updates)
      .eq("id", groupId)
      .eq("account_id", ctx.accountId)
      .select("*")
      .single();

    if (error) {
      console.error("[PATCH /api/conversation-board-groups/[groupId]] update error:", error);
      return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
    }

    return NextResponse.json({ group: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const ctx = await requireRole("admin");
    const { groupId } = await params;

    // Unlink boards first so no foreign key constraint prevents group deletion
    await ctx.supabase
      .from("conversation_boards")
      .update({ group_id: null })
      .eq("group_id", groupId)
      .eq("account_id", ctx.accountId);

    const { error } = await ctx.supabase
      .from("conversation_board_groups")
      .delete()
      .eq("id", groupId)
      .eq("account_id", ctx.accountId);

    if (error) {
      console.error("[DELETE /api/conversation-board-groups/[groupId]] delete error:", error);
      return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
