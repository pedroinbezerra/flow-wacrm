// /api/account/cancel
//
// POST — Owner-only self-service account cancellation & deletion request.
// Sets `scheduled_deletion_at = NOW() + 90 days` and `subscription_status = 'canceled'`.

import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ctx = await requireRole("owner");

    const limit = checkRateLimit(
      `owner:cancelAccount:${ctx.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    // Calculate 90 days grace date
    const graceDays = 90;
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + graceDays);

    const scheduledIso = scheduledDate.toISOString();

    // 1. Update accounts table
    const { error: accErr } = await ctx.supabase
      .from("accounts")
      .update({
        scheduled_deletion_at: scheduledIso,
        subscription_status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ctx.accountId);

    if (accErr) {
      console.error("[POST /api/account/cancel] account update error:", accErr);
      return NextResponse.json(
        { error: "Não foi possível agendar o cancelamento da conta." },
        { status: 500 }
      );
    }

    // 2. Update subscriptions table if exists
    await ctx.supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", ctx.accountId);

    return NextResponse.json({
      ok: true,
      message: `Conta agendada para exclusão em ${graceDays} dias (${scheduledDate.toLocaleDateString("pt-BR")}).`,
      scheduledDeletionAt: scheduledIso,
      graceDays,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
