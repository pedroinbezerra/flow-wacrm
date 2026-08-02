import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth/account";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pipelineId: string }> }
) {
  try {
    const ctx = await requireRole("viewer");
    const { pipelineId } = await params;

    const { data, error } = await ctx.supabase
      .from("pipeline_members")
      .select("*")
      .eq("pipeline_id", pipelineId)
      .eq("account_id", ctx.accountId);

    if (error) throw error;
    return NextResponse.json({ members: data ?? [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pipelineId: string }> }
) {
  try {
    const ctx = await requireRole("admin");
    const { pipelineId } = await params;

    const body = (await request.json().catch(() => null)) as { userIds?: string[] } | null;
    const userIds = Array.isArray(body?.userIds) ? body.userIds : [];

    // Delete existing members for pipeline
    const { error: delErr } = await ctx.supabase
      .from("pipeline_members")
      .delete()
      .eq("pipeline_id", pipelineId)
      .eq("account_id", ctx.accountId);

    if (delErr) throw delErr;

    if (userIds.length > 0) {
      const rows = userIds.map((userId) => ({
        account_id: ctx.accountId,
        pipeline_id: pipelineId,
        user_id: userId,
      }));

      const { error: insErr } = await ctx.supabase
        .from("pipeline_members")
        .insert(rows);

      if (insErr) throw insErr;
    }

    const { data, error } = await ctx.supabase
      .from("pipeline_members")
      .select("*")
      .eq("pipeline_id", pipelineId)
      .eq("account_id", ctx.accountId);

    if (error) throw error;
    return NextResponse.json({ members: data ?? [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}
