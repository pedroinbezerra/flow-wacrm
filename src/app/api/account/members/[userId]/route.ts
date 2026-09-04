// ============================================================
// /api/account/members/[userId]
//
//   PATCH  — change a member's role.   Admin+.
//   DELETE — remove a member.          Admin+.
//
// Both delegate to SECURITY DEFINER RPCs (migração 018, reescritas em
// 070_multi_workspace_memberships.sql):
//   - set_member_role(p_user_id, p_new_role)
//   - remove_account_member(p_user_id)
//
// The RPCs do the *real* authorisation work — caller must be
// admin+, target must be in caller's account, target can't be the
// owner, can't be self. The TS layer here only forwards the call
// and maps Postgres SQLSTATEs back to HTTP statuses.
//
// Ambas operam sobre a PARTICIPAÇÃO no workspace ativo de quem chama.
// Remover encerra uma participação; não move perfil, não cria conta e não
// apaga workspace nenhum.
// ============================================================

import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { isAccountRole } from "@/lib/auth/roles";
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";

// Map known SQLSTATEs from the RPCs (see migration 018) onto HTTP
// statuses. The `error.code` field is the SQLSTATE; the `message`
// is the human-readable RAISE message we put in the migration.
function rpcErrorToResponse(err: PostgrestError): NextResponse {
  if (err.code === "42501") {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  if (err.code === "22023") {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  console.error("[members route] unexpected RPC error:", err);
  return NextResponse.json(
    { error: "Failed to update member" },
    { status: 500 },
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const ctx = await requireRole("admin");

    const limit = await checkRateLimit(
      `admin:memberRole:${ctx.userId}`,
      RATE_LIMITS.adminAction,
    );
    if (!limit.success) return rateLimitResponse(limit);

    const { userId } = await params;

    const body = (await request.json().catch(() => null)) as
      | { role?: unknown; sector?: unknown }
      | null;
    const role = body?.role;
    const sector = body?.sector;

    if (role !== undefined) {
      if (!isAccountRole(role)) {
        return NextResponse.json(
          { error: "'role' must be one of owner, admin, agent, viewer" },
          { status: 400 },
        );
      }

      if (role === "owner") {
        return NextResponse.json(
          {
            error:
              "Use POST /api/account/transfer-ownership to promote a member to owner",
          },
          { status: 400 },
        );
      }

      const { error } = await ctx.supabase.rpc("set_member_role", {
        p_user_id: userId,
        p_new_role: role,
      });

      if (error) return rpcErrorToResponse(error);
    }

    if (sector !== undefined) {
      const sectorVal = typeof sector === "string" && sector.trim() ? sector.trim() : null;

      // O alvo precisa participar do workspace ativo de quem chama. O filtro
      // anterior (`profiles.account_id = ctx.accountId`) deixou de significar
      // isso: aquela coluna passou a apontar para o workspace ativo do alvo,
      // que pode ser outro sem que ele tenha deixado esta equipe.
      const { data: membership, error: membershipErr } = await ctx.supabase
        .from("account_memberships")
        .select("user_id")
        .eq("account_id", ctx.accountId)
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (membershipErr) {
        console.error("[members route] membership lookup failed:", membershipErr);
        return NextResponse.json({ error: "Failed to update sector" }, { status: 500 });
      }
      if (!membership) {
        return NextResponse.json(
          { error: "Target user is not a member of your account" },
          { status: 400 },
        );
      }

      const { error } = await ctx.supabase
        .from("profiles")
        .update({ sector: sectorVal })
        .eq("user_id", userId);

      if (error) {
        console.error("[members route] error updating sector:", error);
        return NextResponse.json({ error: "Failed to update sector" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const ctx = await requireRole("admin");

    const limit = await checkRateLimit(
      `admin:memberRemove:${ctx.userId}`,
      RATE_LIMITS.adminAction,
    );
    if (!limit.success) return rateLimitResponse(limit);

    const { userId } = await params;

    const { data, error } = await ctx.supabase.rpc("remove_account_member", {
      p_user_id: userId,
    });

    if (error) return rpcErrorToResponse(error);

    // Remover encerra a participação e nada mais: os workspaces do removido
    // seguem intactos. `data` é o workspace ativo dele depois do
    // repontamento (null se ele não participava de nenhum outro) — nunca uma
    // conta pessoal recém-fabricada, como acontecia no modelo antigo.
    return NextResponse.json({ ok: true, activeWorkspaceId: data ?? null });
  } catch (err) {
    return toErrorResponse(err);
  }
}
