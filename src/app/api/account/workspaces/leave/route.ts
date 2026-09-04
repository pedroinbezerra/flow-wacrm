// ============================================================
// POST /api/account/workspaces/leave   { accountId }
//
// Saída voluntária de um workspace. Encerra UMA participação — a de
// quem chamou, naquele workspace. Nenhum outro workspace da pessoa é
// tocado, e o workspace do qual ela saiu continua existindo com todos
// os seus dados.
//
// Sair ≠ excluir. Excluir um workspace é operação separada, explícita
// e autorizada; esta rota nunca destrói tenant.
//
// Contrato de recusa (SQLSTATE -> HTTP):
//   42501 -> 401  (sem sessão)
//   22023 -> 400  (não participa / é dono e precisa transferir antes)
// ============================================================

import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { leaveWorkspace } from "@/lib/auth/workspaces";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkRateLimit(
    `workspaceLeave:${user.id}`,
    RATE_LIMITS.adminAction,
  );
  if (!limit.success) return rateLimitResponse(limit);

  const body = (await request.json().catch(() => null)) as
    | { accountId?: unknown }
    | null;
  const accountId = body?.accountId;

  if (typeof accountId !== "string" || accountId.trim() === "") {
    return NextResponse.json(
      { error: "'accountId' é obrigatório" },
      { status: 400 },
    );
  }

  try {
    const activeId = await leaveWorkspace(supabase, accountId);
    return NextResponse.json({ ok: true, activeWorkspaceId: activeId });
  } catch (err) {
    const pgErr = err as PostgrestError;
    if (pgErr?.code === "42501") {
      return NextResponse.json({ error: pgErr.message }, { status: 401 });
    }
    if (pgErr?.code === "22023") {
      return NextResponse.json({ error: pgErr.message }, { status: 400 });
    }
    console.error("[POST /api/account/workspaces/leave] rpc error:", err);
    return NextResponse.json(
      { error: "Não foi possível sair do workspace" },
      { status: 500 },
    );
  }
}
