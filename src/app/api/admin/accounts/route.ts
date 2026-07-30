import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { toErrorResponse } from "@/lib/auth/account";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET() {
  try {
    const admin = await requireSuperAdmin();

    const limit = checkRateLimit(
      `admin:accounts:get:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const supabase = await createClient();
    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*, plan:plans(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/accounts] DB error:", error);
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }

    return NextResponse.json({ accounts });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireSuperAdmin();

    const limit = checkRateLimit(
      `admin:accounts:patch:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const body = await req.json();
    const { account_id, plan_id, subscription_status, trial_ends_at } = body;

    if (!account_id) {
      return NextResponse.json({ error: "account_id is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (plan_id !== undefined) updateData.plan_id = plan_id;
    if (subscription_status !== undefined) updateData.subscription_status = subscription_status;
    if (trial_ends_at !== undefined) updateData.trial_ends_at = trial_ends_at;

    const supabase = await createClient();
    const { data: account, error } = await supabase
      .from("accounts")
      .update(updateData)
      .eq("id", account_id)
      .select("*, plan:plans(*)")
      .maybeSingle();

    if (error || !account) {
      console.error("[PATCH /api/admin/accounts] DB error:", error);
      return NextResponse.json({ error: "Failed to update account plan" }, { status: 500 });
    }

    return NextResponse.json({ account });
  } catch (err) {
    return toErrorResponse(err);
  }
}
