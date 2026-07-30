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
 * Consolidated Effective Features calculation for an Account.
 * Combines Plan Features + Active Add-ons.
 */
export async function getEffectiveAccountConfig(
  supabase: SupabaseClient,
  accountId: string
): Promise<{ plan: CommercialPlan | null; features: PlanFeatures }> {
  const plan = await getAccountPlan(supabase, accountId);

  // Attempt to call RPC get_effective_account_config
  const { data: rpcFeatures, error: rpcErr } = await supabase
    .rpc("get_effective_account_config", { p_account_id: accountId });

  if (!rpcErr && rpcFeatures && typeof rpcFeatures === "object") {
    return {
      plan,
      features: rpcFeatures as PlanFeatures,
    };
  }

  // Fallback client-side calculation if RPC is not available yet
  const baseFeatures: PlanFeatures = { ...(plan?.features || {}) };

  const { data: addons } = await supabase
    .from("account_addons")
    .select("feature_key, quantity")
    .eq("account_id", accountId)
    .eq("status", "active");

  if (addons && addons.length > 0) {
    for (const addon of addons) {
      const key = addon.feature_key as keyof PlanFeatures;
      const currentVal = baseFeatures[key];
      if (typeof currentVal === "number") {
        baseFeatures[key] = currentVal + addon.quantity;
      } else if (typeof currentVal === "boolean") {
        if (addon.quantity > 0) baseFeatures[key] = true;
      } else {
        baseFeatures[key] = addon.quantity;
      }
    }
  }

  return {
    plan,
    features: baseFeatures,
  };
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
  const { plan, features } = await getEffectiveAccountConfig(supabase, accountId);

  if (!plan && Object.keys(features).length === 0) {
    return {
      allowed: true,
      feature,
      reason: "No plan restrictions found",
    };
  }

  const featureVal = features[feature];
  const planName = plan ? plan.name : "Configuração Personalizada";

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
        reason: `Recurso '${feature}' não está disponível para a conta (${planName})`,
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
        reason: `Limite atingido para '${feature}' (${currentCount}/${featureVal}) na conta (${planName})`,
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
