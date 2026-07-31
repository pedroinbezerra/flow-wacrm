// /api/account/dunning-cron
//
// GET / POST — Daily cron endpoint to evaluate overdue subscriptions and apply dunning stages.
// Protected by `AUTOMATION_CRON_SECRET` via header `x-cron-secret`.

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  return handleDunningCron(request);
}

export async function POST(request: Request) {
  return handleDunningCron(request);
}

async function handleDunningCron(request: Request) {
  const expected = process.env.AUTOMATION_CRON_SECRET || process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  const bearerSecret = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.substring(7).trim()
    : "";
  const supplied = request.headers.get("x-cron-secret") || bearerSecret;
  const suppliedBuf = Buffer.from(supplied);
  const expectedBuf = Buffer.from(expected);

  if (
    suppliedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(suppliedBuf, expectedBuf)
  ) {
    return NextResponse.json({ error: "Unauthorized cron access" }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const now = new Date();

  // Find all subscriptions that are past_due, read_only, or suspended
  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select("id, account_id, status, updated_at, current_period_end")
    .in("status", ["past_due", "read_only", "suspended"]);

  if (error) {
    console.error("[dunning-cron] failed to fetch subscriptions:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }

  const results = {
    evaluated: subs?.length ?? 0,
    stage1Count: 0,
    stage2Count: 0,
    stage3ReadOnlyCount: 0,
    stage4SuspendedCount: 0,
    stage5ScheduledDeletionCount: 0,
  };

  for (const sub of subs || []) {
    // Determine overdue start date: current_period_end or updated_at
    const baseDateStr = sub.current_period_end || sub.updated_at;
    if (!baseDateStr) continue;

    const baseDate = new Date(baseDateStr);
    const diffMs = now.getTime() - baseDate.getTime();
    const overdueDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (overdueDays < 0) continue; // Not overdue yet

    if (overdueDays >= 90) {
      // Stage 5: 90+ days overdue -> Schedule deletion
      const graceDate = new Date();
      graceDate.setDate(graceDate.getDate() + 90);

      await supabase
        .from("accounts")
        .update({
          subscription_status: "canceled",
          scheduled_deletion_at: graceDate.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", sub.account_id);

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", sub.id);

      results.stage5ScheduledDeletionCount++;
    } else if (overdueDays >= 30) {
      // Stage 4: 30-89 days -> Total Suspension
      if (sub.status !== "suspended") {
        await supabase
          .from("subscriptions")
          .update({ status: "suspended", updated_at: now.toISOString() })
          .eq("id", sub.id);

        await supabase
          .from("accounts")
          .update({ subscription_status: "suspended", updated_at: now.toISOString() })
          .eq("id", sub.account_id);
      }
      results.stage4SuspendedCount++;
    } else if (overdueDays >= 14) {
      // Stage 3: 14-29 days -> Read-Only Mode
      if (sub.status !== "read_only") {
        await supabase
          .from("subscriptions")
          .update({ status: "read_only", updated_at: now.toISOString() })
          .eq("id", sub.id);

        await supabase
          .from("accounts")
          .update({ subscription_status: "read_only", updated_at: now.toISOString() })
          .eq("id", sub.account_id);
      }
      results.stage3ReadOnlyCount++;
    } else if (overdueDays >= 7) {
      // Stage 2: 7-13 days -> Past Due with persistent warning
      if (sub.status !== "past_due") {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due", updated_at: now.toISOString() })
          .eq("id", sub.id);

        await supabase
          .from("accounts")
          .update({ subscription_status: "past_due", updated_at: now.toISOString() })
          .eq("id", sub.account_id);
      }
      results.stage2Count++;
    } else {
      // Stage 1: 0-6 days -> Past due notification phase
      results.stage1Count++;
    }
  }

  return NextResponse.json({ ok: true, timestamp: now.toISOString(), results });
}
