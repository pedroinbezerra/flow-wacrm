// /api/account/purge-cron
//
// GET / POST — Daily cron endpoint to permanently purge accounts past their 90-day grace period.
// Protected by `AUTOMATION_CRON_SECRET` via header `x-cron-secret`.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET(request: Request) {
  return handlePurgeCron(request);
}

export async function POST(request: Request) {
  return handlePurgeCron(request);
}

async function handlePurgeCron(request: Request) {
  const expected = process.env.AUTOMATION_CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 503 });
  }

  const supplied = request.headers.get("x-cron-secret") ?? "";
  if (supplied !== expected) {
    return NextResponse.json({ error: "Unauthorized cron access" }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const now = new Date();

  // 1. Fetch accounts due for permanent deletion
  const { data: expiredAccounts, error: accErr } = await supabase
    .from("accounts")
    .select("id, name, owner_user_id, scheduled_deletion_at")
    .not("scheduled_deletion_at", "is", null)
    .lte("scheduled_deletion_at", now.toISOString());

  if (accErr) {
    console.error("[purge-cron] failed to fetch expired accounts:", accErr);
    return NextResponse.json({ error: "Failed to fetch accounts for purging" }, { status: 500 });
  }

  const results = {
    evaluated: expiredAccounts?.length ?? 0,
    purgedAccountsCount: 0,
    preservedInvoicesCount: 0,
    deletedUsersCount: 0,
    errors: [] as string[],
  };

  const accountStorageBuckets = ["chat-media", "flow-media", "ai-service-media"];

  for (const account of expiredAccounts || []) {
    try {
      // a) Get owner email & member profiles before deletion
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, account_role")
        .eq("account_id", account.id);

      const ownerProfile = profiles?.find((p) => p.user_id === account.owner_user_id);
      const ownerEmail = ownerProfile?.email ?? "desconhecido@flow.app";
      const userIdsToDelete = (profiles ?? []).map((p) => p.user_id);

      // b) Count invoices that will be preserved via ON DELETE SET NULL
      const { count: invoiceCount } = await supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("account_id", account.id);

      const preservedInvoices = invoiceCount ?? 0;
      results.preservedInvoicesCount += preservedInvoices;

      // c) Clean account media under prefix `account-<id>/`
      const prefix = `account-${account.id}`;
      for (const bucket of accountStorageBuckets) {
        try {
          const { data: fileList } = await supabase.storage.from(bucket).list(prefix);
          if (fileList && fileList.length > 0) {
            const filesToRemove = fileList.map((f) => `${prefix}/${f.name}`);
            await supabase.storage.from(bucket).remove(filesToRemove);
          }
        } catch (stErr) {
          console.warn(`[purge-cron] storage cleanup warning for bucket ${bucket}:`, stErr);
        }
      }

      // c.2) Clean user profile avatars in `avatars` bucket under `{user_id}/` prefix
      for (const uid of userIdsToDelete) {
        try {
          const { data: avatarFiles } = await supabase.storage.from("avatars").list(uid);
          if (avatarFiles && avatarFiles.length > 0) {
            const filesToRemove = avatarFiles.map((f) => `${uid}/${f.name}`);
            await supabase.storage.from("avatars").remove(filesToRemove);
          }
        } catch (avErr) {
          console.warn(`[purge-cron] avatar storage cleanup warning for user ${uid}:`, avErr);
        }
      }

      // d) Insert audit log record BEFORE deleting account
      await supabase.from("account_deletion_audit_logs").insert({
        account_id: account.id,
        account_name: account.name,
        owner_email: ownerEmail,
        scheduled_at: account.scheduled_deletion_at,
        purged_at: now.toISOString(),
        invoices_preserved_count: preservedInvoices,
        details: {
          members_count: userIdsToDelete.length,
          storage_prefix: prefix,
        },
      });

      // e) Delete account record (FK ON DELETE CASCADE handles contacts, messages, automations, etc.)
      const { error: delErr } = await supabase
        .from("accounts")
        .delete()
        .eq("id", account.id);

      if (delErr) {
        console.error(`[purge-cron] failed to delete account ${account.id}:`, delErr);
        results.errors.push(`Account ${account.id}: ${delErr.message}`);
        continue;
      }

      // f) Delete auth.users records for the owner & account members
      for (const uid of userIdsToDelete) {
        try {
          await supabase.auth.admin.deleteUser(uid);
          results.deletedUsersCount++;
        } catch (uErr) {
          console.warn(`[purge-cron] failed to delete auth user ${uid}:`, uErr);
        }
      }

      results.purgedAccountsCount++;
    } catch (err: any) {
      console.error(`[purge-cron] error purging account ${account.id}:`, err);
      results.errors.push(`Account ${account.id}: ${err?.message || "Unknown error"}`);
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    results,
  });
}
