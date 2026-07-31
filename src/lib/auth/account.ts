// ============================================================
// Server-side account context — for API routes and server
// components. Reads the caller's profile + account in one round
// trip and verifies role on demand.
//
// IMPORTANT: this module is server-only. It imports the Supabase
// SSR client (`@/lib/supabase/server`), which reads `next/headers`
// cookies. Importing it from a client component will fail at
// build time with the standard Next.js "You're importing a
// component that needs `next/headers`" error — that's the
// boundary check; we don't need the `server-only` package.
//
// Calling convention
// ------------------
// API routes don't need to redo `supabase.auth.getUser()` — they
// receive a fully-loaded context from `requireRole`:
//
//   try {
//     const ctx = await requireRole("admin");
//     // ctx.supabase — the SSR client (RLS scoped to this user)
//     // ctx.userId  — auth.uid()
//     // ctx.accountId / ctx.role / ctx.account
//   } catch (err) {
//     return errorResponse(err); // see toErrorResponse() below
//   }
// ============================================================

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { hasMinRole, isAccountRole, type AccountRole } from "./roles";

// ------------------------------------------------------------
// Errors
//
// Custom classes so API routes can map a single `catch` to the
// right HTTP status without sprinkling 401/403 strings everywhere.
// ------------------------------------------------------------

export class UnauthorizedError extends Error {
  readonly status = 401 as const;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403 as const;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Convert one of the typed errors above (or anything else) into a
 * `NextResponse`. Routes can do:
 *
 *   } catch (err) {
 *     return toErrorResponse(err);
 *   }
 *
 * Unknown errors collapse to 500 with the generic message — we
 * never leak `err.message` for non-classified errors to keep
 * server internals out of the wire.
 */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[toErrorResponse] uncategorized error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

// ------------------------------------------------------------
// Account context
// ------------------------------------------------------------

import type { Account } from "@/types";

export interface AccountContext {
  /** Supabase SSR client, RLS scoped to the calling user. */
  supabase: SupabaseClient;
  /** `auth.uid()` for the caller. Always defined when this resolves. */
  userId: string;
  /** Caller's account_id from their profile row. */
  accountId: string;
  /** Caller's role within their account. */
  role: AccountRole;
  /** Account row. */
  account: Account;
}

/**
 * Resolve the caller's user + account + role in one round trip.
 *
 * Throws `UnauthorizedError` if there's no Supabase session.
 * Throws `ForbiddenError` if the profile is missing account
 * fields (shouldn't happen post-017 migration; defensive guard
 * against profile rows that pre-date the backfill or were
 * inserted by hand).
 *
 * Use `requireRole(min)` instead when the route also needs a
 * minimum-role check — it's a thin wrapper over this.
 */
export async function getCurrentAccount(): Promise<AccountContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    throw new UnauthorizedError();
  }

  // Selecting through the FK gives us the account in one query — `account:accounts!inner(*)`
  let { data, error } = await supabase
    .from("profiles")
    .select("account_id, account_role, account:accounts!inner(*)")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fallback defensivo para esquemas legados
  if (error) {
    const fallback = await supabase
      .from("profiles")
      .select("account_id, account_role, account:accounts!inner(id, name, subscription_status)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!fallback.error) {
      data = fallback.data as any;
      error = null;
    }
  }

  if (error) {
    console.error("[getCurrentAccount] profile fetch error:", error);
    throw new ForbiddenError("Could not load account context");
  }
  if (!data || !data.account_id || !data.account_role || !data.account) {
    throw new ForbiddenError("Profile is not linked to an account");
  }
  if (!isAccountRole(data.account_role)) {
    throw new ForbiddenError(`Unknown account role: ${data.account_role}`);
  }

  const accountRaw = Array.isArray(data.account)
    ? data.account[0]
    : (data.account as {
        id: string;
        name: string;
        subscription_status?: string | null;
        scheduled_deletion_at?: string | null;
      });

  return {
    supabase,
    userId: user.id,
    accountId: data.account_id,
    role: data.account_role,
    account: {
      id: accountRaw.id,
      name: accountRaw.name,
      subscription_status: accountRaw.subscription_status ?? "active",
      scheduled_deletion_at: accountRaw.scheduled_deletion_at ?? null,
    },
  };
}

/**
 * Valida o acesso operacional da conta baseado no status de inadimplência (dunning)
 * e carência de exclusão.
 * 
 * - Se a conta estiver 'suspended' ou agendada para exclusão (carência 90 dias com bloqueio), nega acesso total.
 * - Se a conta estiver 'read_only' e a operação for de escrita (isWriteOperation = true), nega mutações.
 */
export function checkAccountAccess(
  ctx: AccountContext,
  options?: { isWriteOperation?: boolean }
): void {
  const status = ctx.account.subscription_status;
  const isScheduled = !!ctx.account.scheduled_deletion_at;

  // Opção (a): Conta cancelada/agendada para exclusão ou em suspensão total por inadimplência é bloqueada
  if (status === "suspended" || status === "canceled" || isScheduled) {
    throw new ForbiddenError(
      "Acesso bloqueado: Sua conta está suspensa ou em processo de cancelamento. Regularize a fatura ou solicite reativação ao suporte."
    );
  }

  // Estágio 3 de inadimplência: modo somente leitura
  if (status === "read_only" && options?.isWriteOperation) {
    throw new ForbiddenError(
      "Ação não permitida: Sua conta está em modo somente leitura devido a pendência financeira."
    );
  }
}

/**
 * Resolve a conta e valida tanto a regra de papel mínimo quanto as travas de dunning/exclusão.
 */
export async function requireRole(
  min: AccountRole,
  options?: { isWriteOperation?: boolean }
): Promise<AccountContext> {
  const ctx = await getCurrentAccount();
  if (!hasMinRole(ctx.role, min)) {
    throw new ForbiddenError(
      `This action requires the '${min}' role or higher`,
    );
  }
  checkAccountAccess(ctx, options);
  return ctx;
}

/**
 * Valida o acesso operacional de uma conta diretamente pelo ID da conta.
 * Funciona tanto para API routes quanto para webhook handlers e engines em segundo plano.
 */
export async function assertAccountOperationalAccess(
  accountId: string,
  options?: { isWriteOperation?: boolean; client?: SupabaseClient }
): Promise<void> {
  if (!accountId) {
    throw new ForbiddenError("ID de conta não fornecido.");
  }

  let client = options?.client;
  if (!client) {
    const { supabaseAdmin } = await import("@/lib/automations/admin-client");
    client = supabaseAdmin();
  }

  const { data: account, error } = await client
    .from("accounts")
    .select("subscription_status, scheduled_deletion_at")
    .eq("id", accountId)
    .maybeSingle();

  if (error || !account) {
    throw new ForbiddenError("Conta não encontrada ou inativa.");
  }

  const status = account.subscription_status ?? "active";
  const isScheduled = !!account.scheduled_deletion_at;

  if (status === "suspended" || status === "canceled" || isScheduled) {
    throw new ForbiddenError(
      "Acesso bloqueado: Sua conta está suspensa ou em processo de cancelamento. Regularize a fatura ou solicite reativação ao suporte."
    );
  }

  if (status === "read_only" && options?.isWriteOperation) {
    throw new ForbiddenError(
      "Ação não permitida: Sua conta está em modo somente leitura devido a pendência financeira."
    );
  }
}


