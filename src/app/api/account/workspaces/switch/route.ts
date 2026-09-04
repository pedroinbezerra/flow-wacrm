// ============================================================
// POST /api/account/workspaces/switch   { accountId }
//
// Troca o contexto operacional da identidade autenticada.
//
// O `accountId` do corpo é um PEDIDO, não uma autorização. Quem decide
// é `switch_active_workspace()` no banco: ele confirma participação
// ativa antes de gravar e recusa com 42501 caso contrário. Por isso a
// rota não faz — e não deve fazer — sua própria checagem "de fachada"
// sobre a lista de workspaces do cliente.
//
// O contexto ativo mora no banco, não em cabeçalho ou cookie: nenhuma
// requisição posterior consegue se declarar em outro workspace.
//
// Contrato de recusa (SQLSTATE -> HTTP):
//   42501 -> 403  (não participa do workspace pedido / sem sessão)
// ============================================================

import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { switchWorkspace } from "@/lib/auth/workspaces";
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
    `workspaceSwitch:${user.id}`,
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
    const activeId = await switchWorkspace(supabase, accountId);
    return NextResponse.json({ ok: true, activeWorkspaceId: activeId });
  } catch (err) {
    const pgErr = err as PostgrestError;
    if (pgErr?.code === "42501") {
      return NextResponse.json({ error: pgErr.message }, { status: 403 });
    }
    console.error("[POST /api/account/workspaces/switch] rpc error:", err);
    return NextResponse.json(
      { error: "Não foi possível trocar de workspace" },
      { status: 500 },
    );
  }
}
