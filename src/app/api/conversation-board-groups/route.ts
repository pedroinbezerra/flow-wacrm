import { NextResponse } from "next/server";

import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { makeUniqueSlug, slugifyBoardValue } from "@/lib/conversation-boards/slugify";
import { listConversationBoardGroups } from "@/lib/conversation-boards/queries";

const MAX_NAME_LEN = 80;
const MAX_DESCRIPTION_LEN = 240;

export async function GET() {
  try {
    const ctx = await requireRole("viewer");
    const groups = await listConversationBoardGroups(ctx.supabase);
    return NextResponse.json({ groups });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireRole("admin");

    const body = (await request.json().catch(() => null)) as
      | { name?: unknown; description?: unknown }
      | null;

    if (typeof body?.name !== "string") {
      return NextResponse.json({ error: "'name' must be a string" }, { status: 400 });
    }

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

    const description =
      typeof body?.description === "string" ? body.description.trim() : "";
    if (description.length > MAX_DESCRIPTION_LEN) {
      return NextResponse.json(
        { error: `Group description must be ${MAX_DESCRIPTION_LEN} characters or fewer` },
        { status: 400 },
      );
    }

    const { data: existingGroups, error: groupsError } = await ctx.supabase
      .from("conversation_board_groups")
      .select("slug")
      .eq("account_id", ctx.accountId);
    if (groupsError) throw groupsError;

    const slug = makeUniqueSlug(
      name,
      (existingGroups ?? []).map((row) => row.slug as string),
      slugifyBoardValue(name, "group"),
    );

    const { data, error } = await ctx.supabase
      .from("conversation_board_groups")
      .insert({
        account_id: ctx.accountId,
        name,
        slug,
        description: description || null,
        created_by_user_id: ctx.userId,
      })
      .select("*")
      .single();

    if (error) {
      console.error("[POST /api/conversation-board-groups] insert error:", error);
      return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }

    return NextResponse.json({ group: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
