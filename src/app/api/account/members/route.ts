// ============================================================
// GET /api/account/members
//
// Lists every member of the caller's account. Any member can call
// it (the Members tab is shown to admins+, but agents/viewers see
// a read-only roster too).
//
// Field visibility
//   Sensitive fields (email) are returned only when the caller is
//   admin+. Agents and viewers see name + avatar + role + joined
//   date only. This mirrors the design decision from the planning
//   phase: "agent/viewer sees names only".
// ============================================================

import { NextResponse } from "next/server";

import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { canManageMembers, isAccountRole } from "@/lib/auth/roles";
import type { AccountMember } from "@/types";

interface MembershipRow {
  user_id: string;
  role: string;
  joined_at: string;
}

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  sector?: string | null;
}

export async function GET() {
  try {
    const ctx = await getCurrentAccount();

    // O roster vem das PARTICIPAÇÕES, não mais de `profiles.account_id` —
    // essa coluna passou a apontar para o workspace ativo de cada pessoa, e
    // filtrar por ela esconderia justamente o colega que está trabalhando em
    // outro workspace no momento.
    const { data: memberships, error } = await ctx.supabase
      .from("account_memberships")
      .select("user_id, role, joined_at")
      .eq("account_id", ctx.accountId)
      .eq("status", "active")
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("[GET /api/account/members] membership fetch error:", error);
      return NextResponse.json(
        { error: "Failed to load members" },
        { status: 500 },
      );
    }

    const rows = (memberships ?? []) as MembershipRow[];
    const userIds = rows.map((row) => row.user_id);

    // Duas consultas em vez de um embed: `account_memberships.user_id` e
    // `profiles.user_id` apontam ambos para `auth.users`, e não há FK direta
    // entre as duas tabelas para o PostgREST seguir.
    let profilesById = new Map<string, ProfileRow>();
    if (userIds.length > 0) {
      const { data: profiles, error: profilesErr } = await ctx.supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url, sector")
        .in("user_id", userIds);

      if (profilesErr) {
        console.error("[GET /api/account/members] profile fetch error:", profilesErr);
        return NextResponse.json(
          { error: "Failed to load members" },
          { status: 500 },
        );
      }

      profilesById = new Map(
        (profiles as ProfileRow[]).map((row) => [row.user_id, row]),
      );
    }

    const canSeeEmails = canManageMembers(ctx.role);

    const members: AccountMember[] = rows.flatMap((row) => {
      // Defensive: the DB enum should never let an unknown role
      // through, but if a migration ever broadens the enum without
      // updating TS, skip the row rather than crash the page.
      if (!isAccountRole(row.role)) return [];
      const profile = profilesById.get(row.user_id);
      return [
        {
          user_id: row.user_id,
          full_name: profile?.full_name ?? "",
          email: canSeeEmails ? profile?.email ?? null : null,
          avatar_url: profile?.avatar_url ?? null,
          role: row.role,
          sector: profile?.sector ?? null,
          joined_at: row.joined_at,
        },
      ];
    });

    return NextResponse.json({ members });
  } catch (err) {
    return toErrorResponse(err);
  }
}
