import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  OnboardingJourneySummary,
  OnboardingStepKey,
  OnboardingStepProgress,
} from "@/types";

export const ONBOARDING_STEP_ACTIONS: Record<OnboardingStepKey, string> = {
  connect_whatsapp: "/settings?tab=whatsapp",
  create_first_flow: "/flows",
  import_contacts: "/contacts",
  create_first_campaign: "/broadcasts",
  send_first_campaign: "/broadcasts",
  invite_team: "/settings?tab=members",
};

export const ALL_ONBOARDING_STEPS: OnboardingStepKey[] = [
  "connect_whatsapp",
  "create_first_flow",
  "import_contacts",
  "create_first_campaign",
  "send_first_campaign",
  "invite_team",
];

/**
 * Avalia o progresso da jornada de implantação para uma conta e usuário,
 * combinando checagens automáticas no banco com registros manuais.
 */
export async function getJourneySummary(
  supabase: SupabaseClient,
  accountId: string,
  userId: string
): Promise<OnboardingJourneySummary> {
  // 1) Consultar passos salvos na tabela onboarding_progress
  const { data: savedProgress } = await supabase
    .from("onboarding_progress")
    .select("step_key, completed, completed_at, skipped")
    .eq("account_id", accountId)
    .eq("user_id", userId);

  const savedMap = new Map<
    string,
    { completed: boolean; completed_at?: string | null; skipped: boolean }
  >();
  if (savedProgress) {
    for (const item of savedProgress) {
      savedMap.set(item.step_key, {
        completed: item.completed,
        completed_at: item.completed_at,
        skipped: item.skipped,
      });
    }
  }

  // 2) Executar verificações automáticas de domínio para a conta
  const [
    { count: whatsappCount },
    { count: flowsCount },
    { count: contactsCount },
    { count: campaignsCount },
    { count: sentCampaignsCount },
    { count: membersCount },
  ] = await Promise.all([
    supabase
      .from("whatsapp_config")
      .select("*", { count: "exact", head: true })
      .eq("account_id", accountId),
    supabase
      .from("flows")
      .select("*", { count: "exact", head: true })
      .eq("account_id", accountId),
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("account_id", accountId),
    supabase
      .from("broadcasts")
      .select("*", { count: "exact", head: true })
      .eq("account_id", accountId),
    supabase
      .from("broadcasts")
      .select("*", { count: "exact", head: true })
      .eq("account_id", accountId)
      .in("status", ["scheduled", "sending", "sent"]),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("account_id", accountId),
  ]);

  const autoDetectedMap: Record<OnboardingStepKey, boolean> = {
    connect_whatsapp: (whatsappCount ?? 0) > 0,
    create_first_flow: (flowsCount ?? 0) > 0,
    import_contacts: (contactsCount ?? 0) > 0,
    create_first_campaign: (campaignsCount ?? 0) > 0,
    send_first_campaign: (sentCampaignsCount ?? 0) > 0,
    invite_team: (membersCount ?? 0) > 1,
  };

  // 3) Consolidar os 6 passos
  const steps: OnboardingStepProgress[] = ALL_ONBOARDING_STEPS.map((stepKey) => {
    const saved = savedMap.get(stepKey);
    const autoCompleted = autoDetectedMap[stepKey];
    const isCompleted = saved?.completed || autoCompleted;

    return {
      step_key: stepKey,
      completed: isCompleted,
      completed_at: saved?.completed_at || (autoCompleted ? new Date().toISOString() : null),
      skipped: saved?.skipped ?? false,
      action_url: ONBOARDING_STEP_ACTIONS[stepKey],
    };
  });

  const completedSteps = steps.filter((s) => s.completed || s.skipped).length;
  const percentage = Math.round((completedSteps / ALL_ONBOARDING_STEPS.length) * 100);

  return {
    account_id: accountId,
    user_id: userId,
    total_steps: ALL_ONBOARDING_STEPS.length,
    completed_steps: completedSteps,
    percentage,
    is_fully_configured: percentage === 100,
    steps,
  };
}

/**
 * Marca explicitamente uma etapa como concluída ou pulada na tabela onboarding_progress
 */
export async function updateStepStatus(
  supabase: SupabaseClient,
  accountId: string,
  userId: string,
  stepKey: OnboardingStepKey,
  completed: boolean,
  skipped = false
): Promise<void> {
  await supabase.from("onboarding_progress").upsert(
    {
      account_id: accountId,
      user_id: userId,
      step_key: stepKey,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      skipped,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id,user_id,step_key" }
  );
}
