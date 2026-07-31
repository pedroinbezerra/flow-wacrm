// /api/account/reactivate
//
// POST — Owner-only reactivation of account within the 90-day grace period.
// Resets `scheduled_deletion_at = NULL` and `subscription_status = 'active'`.

import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse, ForbiddenError } from "@/lib/auth/account";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(_request: Request) {
  try {
    const ctx = await getCurrentAccount();

    if (ctx.role !== "owner") {
      throw new ForbiddenError("Apenas o dono da conta pode solicitar a reativação.");
    }

    const limit = await checkRateLimit(
      `owner:reactivateAccount:${ctx.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    // Update account
    const { error: accErr } = await ctx.supabase
      .from("accounts")
      .update({
        scheduled_deletion_at: null,
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ctx.accountId);

    if (accErr) {
      console.error("[POST /api/account/reactivate] account update error:", accErr);
      return NextResponse.json(
        { error: "Não foi possível reativar a conta." },
        { status: 500 }
      );
    }

    // Update subscription
    await ctx.supabase
      .from("subscriptions")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", ctx.accountId);

    return NextResponse.json({
      ok: true,
      message: "Conta reativada com sucesso. O acesso total foi restaurado.",
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
