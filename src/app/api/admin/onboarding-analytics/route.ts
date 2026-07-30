import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasMinRole } from "@/lib/auth/roles";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_role, is_super_admin")
      .eq("user_id", user.id)
      .single();

    const isAllowed = Boolean(profile?.is_super_admin);
    if (!isAllowed) {
      return NextResponse.json({ error: "Acesso negado: Requer privilégio de Super Admin" }, { status: 403 });
    }

    // Tentar executar a RPC get_onboarding_analytics_summary
    const { data: summary, error: rpcError } = await supabase.rpc("get_onboarding_analytics_summary");

    if (rpcError) {
      // Fallback em código caso a RPC não tenha sido executada no banco local ainda
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

      return NextResponse.json({
        total_users: totalUsers ?? 0,
        started_onboarding: startedOnboarding,
        completed_onboarding: completedOnboarding,
        completion_rate: startedOnboarding > 0 ? Number(((completedOnboarding / startedOnboarding) * 100).toFixed(1)) : 0,
        step_breakdown: {},
        feature_usage_30d: {},
      });
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[API Onboarding Analytics] Erro ao consultar métricas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
