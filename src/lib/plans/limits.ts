import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommercialPlan, PlanFeatures } from "@/types";

export interface LimitCheckResult {
  allowed: boolean;
  feature: keyof PlanFeatures;
  current?: number;
  limit?: number | boolean;
  reason?: string;
}

/**
 * Fetch the active plan associated with an account.
 */
export async function getAccountPlan(
  supabase: SupabaseClient,
  accountId: string
): Promise<CommercialPlan | null> {
  const { data: account, error: accountErr } = await supabase
    .from("accounts")
    .select("plan_id, plan:plans(*)")
    .eq("id", accountId)
    .maybeSingle();

  if (accountErr || !account || !account.plan) {
    // If account has no plan, fetch the default active plan or fallback
    const { data: defaultPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return (defaultPlan as CommercialPlan) || null;
  }

  // Supabase explicit join might return single object or array
  const planData = Array.isArray(account.plan) ? account.plan[0] : account.plan;
  return (planData as CommercialPlan) || null;
}

/**
 * Check if an account satisfies a specific feature limit or permission flag.
 *
 * @param supabase - Supabase client
 * @param accountId - Account ID to check
 * @param feature - Feature key (e.g. 'max_users', 'max_flows', 'allow_webhooks', etc.)
 * @param requestedIncrement - How many new items are being added (default 1). For boolean permissions, pass 0.
 * @param currentOverride - Optional count override if already calculated by the caller.
 */
export async function checkAccountLimit(
  supabase: SupabaseClient,
  accountId: string,
  feature: keyof PlanFeatures,
  requestedIncrement = 1,
  currentOverride?: number
): Promise<LimitCheckResult> {
  const plan = await getAccountPlan(supabase, accountId);

  if (!plan) {
    return {
      allowed: true,
      feature,
      reason: "No plan restrictions found",
    };
  }

  const features = plan.features || {};
  const featureVal = features[feature];

  // If the feature is not configured in the plan, default to allowed
  if (featureVal === undefined || featureVal === null) {
    return {
      allowed: true,
      feature,
    };
  }

  // Boolean feature permissions (e.g. allow_scheduling, allow_reports, allow_webhooks)
  if (typeof featureVal === "boolean") {
    if (!featureVal) {
      return {
        allowed: false,
        feature,
        limit: false,
        reason: `Recurso '${feature}' não está disponível no plano '${plan.name}'`,
      };
    }
    return {
      allowed: true,
      feature,
      limit: true,
    };
  }

  // Numeric limit checks (e.g. max_users, max_contacts, max_flows, etc.)
  if (typeof featureVal === "number") {
    let currentCount = currentOverride;

    if (currentCount === undefined) {
      currentCount = await getFeatureCurrentCount(supabase, accountId, feature);
    }

    const proposedCount = currentCount + requestedIncrement;

    if (proposedCount > featureVal) {
      return {
        allowed: false,
        feature,
        current: currentCount,
        limit: featureVal,
        reason: `Limite atingido para '${feature}' (${currentCount}/${featureVal}) no plano '${plan.name}'`,
      };
    }

    return {
      allowed: true,
      feature,
      current: currentCount,
      limit: featureVal,
    };
  }

  return {
    allowed: true,
    feature,
  };
}

/**
 * Get current count for a given feature in the database.
 */
async function getFeatureCurrentCount(
  supabase: SupabaseClient,
  accountId: string,
  feature: keyof PlanFeatures
): Promise<number> {
  switch (feature) {
    case "max_users": {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId);
      return count || 0;
    }
    case "max_contacts": {
      const { count } = await supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId);
      return count || 0;
    }
    case "max_flows": {
      const { count } = await supabase
        .from("flows")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId);
      return count || 0;
    }
    case "max_kanban_funnels": {
      const { count } = await supabase
        .from("pipelines")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId);
      return count || 0;
    }
    case "max_boards": {
      const { count } = await supabase
        .from("conversation_boards")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId);
      return count || 0;
    }
    default:
      return 0;
  }
}
