import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSuperAdminConsumptionIntelligence } from "@/lib/consumption/engine";
import { generateAIPricingInsights } from "@/lib/consumption/ai-pricing-insights";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      return NextResponse.json({ error: "Acesso restrito a Super Admins" }, { status: 403 });
    }

    // 1. Obter telemetria agregada
    const intelligence = await getSuperAdminConsumptionIntelligence(supabase);

    // 2. Processar insights de IA
    const insights = await generateAIPricingInsights(intelligence);

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error("[API Admin AI Pricing Insights] Erro ao gerar insights:", error);
    return NextResponse.json({ error: "Erro interno ao gerar insights com IA" }, { status: 500 });
  }
}
