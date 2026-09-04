// ============================================================
// GET /api/account/workspaces
//
// Os workspaces dos quais a identidade autenticada participa, com o
// papel dela em cada um e qual está ativo. É o que alimenta o seletor.
//
// Não usa `getCurrentAccount()` de propósito: esta rota precisa
// responder mesmo quando não há workspace ativo utilizável (a última
// participação foi encerrada enquanto o app estava aberto). É
// justamente a lista devolvida aqui que permite à interface oferecer
// uma saída em vez de uma tela morta.
//
// A lista vem de `list_my_workspaces()`, que filtra por participação
// ativa dentro do banco — o cliente nunca informa de quais workspaces
// participa.
// ============================================================

import { NextResponse } from "next/server";

import { listWorkspaces } from "@/lib/auth/workspaces";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const workspaces = await listWorkspaces(supabase);
    return NextResponse.json({ workspaces });
  } catch (err) {
    console.error("[GET /api/account/workspaces] rpc error:", err);
    return NextResponse.json(
      { error: "Failed to load workspaces" },
      { status: 500 },
    );
  }
}
