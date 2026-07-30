import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAIJourneyInsights } from "@/lib/onboarding/ai-journey-insights";
import type { OnboardingAnalyticsSummary } from "@/types";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      return NextResponse.json({ error: "Acesso negado: Requer privilégio de Super Admin" }, { status: 403 });
    }

    // 1. Obter métricas de onboarding via RPC ou fallback
    const { data: summaryData } = await supabase.rpc("get_onboarding_analytics_summary");

    let analyticsSummary: OnboardingAnalyticsSummary;

    if (summaryData) {
      analyticsSummary = summaryData as OnboardingAnalyticsSummary;
    } else {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { data: progressRows } = await supabase
        .from("onboarding_progress")
        .select("user_id, step_key, completed, skipped");

      const userStepMap = new Map<string, Set<string>>();
      (progressRows || []).forEach((row) => {
        if (row.completed) {
          if (!userStepMap.has(row.user_id)) {
            userStepMap.set(row.user_id, new Set());
          }
          userStepMap.get(row.user_id)?.add(row.step_key);
        }
      });

      const startedOnboarding = userStepMap.size;
      let completedOnboarding = 0;
      userStepMap.forEach((steps) => {
        if (steps.size >= 6) completedOnboarding++;
      });

      analyticsSummary = {
        total_users: totalUsers ?? 0,
        started_onboarding: startedOnboarding,
        completed_onboarding: completedOnboarding,
        completion_rate: startedOnboarding > 0 ? Number(((completedOnboarding / startedOnboarding) * 100).toFixed(1)) : 0,
        step_breakdown: {} as any,
        feature_usage_30d: {},
      };
    }

    // 2. Gerar Insights com IA
    const insights = await generateAIJourneyInsights(analyticsSummary);

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error("[API AI Journey Insights] Erro ao gerar insights de onboarding:", error);
    return NextResponse.json({ error: "Erro interno ao gerar insights com IA" }, { status: 500 });
  }
}
