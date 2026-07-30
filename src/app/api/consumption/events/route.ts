import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordUsageEvent } from "@/lib/consumption/engine";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let accountId: string | null = null;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

      accountId = profile?.account_id ?? null;
    }

    const body = await req.json();
    const { account_id, resource_type, quantity, metadata } = body;

    // Se account_id não veio no body, usar o da sessão autenticada
    const targetAccountId = account_id || accountId;

    if (!targetAccountId) {
      return NextResponse.json({ error: "account_id é obrigatório" }, { status: 400 });
    }

    if (!resource_type || typeof resource_type !== "string") {
      return NextResponse.json({ error: "resource_type é obrigatório" }, { status: 400 });
    }

    const result = await recordUsageEvent(supabase, {
      accountId: targetAccountId,
      resourceType: resource_type,
      quantity: typeof quantity === "number" ? quantity : 1,
      metadata: metadata || {},
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Falha ao registrar telemetria" }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[API Consumption Events] Erro ao emitir telemetria:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
