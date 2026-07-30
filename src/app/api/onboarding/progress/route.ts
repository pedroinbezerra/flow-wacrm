import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getJourneySummary, updateStepStatus } from "@/lib/onboarding/journey-tracker";
import type { OnboardingStepKey } from "@/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.json({ error: "Perfil sem conta vinculada" }, { status: 400 });
    }

    const summary = await getJourneySummary(supabase, profile.account_id, user.id);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[API Onboarding Progress] Erro ao consultar progresso:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.json({ error: "Perfil sem conta vinculada" }, { status: 400 });
    }

    const body = await req.json();
    const { step_key, completed = true, skipped = false } = body;

    if (!step_key) {
      return NextResponse.json({ error: "Campo step_key é obrigatório" }, { status: 400 });
    }

    await updateStepStatus(
      supabase,
      profile.account_id,
      user.id,
      step_key as OnboardingStepKey,
      Boolean(completed),
      Boolean(skipped)
    );

    const updatedSummary = await getJourneySummary(supabase, profile.account_id, user.id);
    return NextResponse.json(updatedSummary);
  } catch (error) {
    console.error("[API Onboarding Progress] Erro ao atualizar passo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
