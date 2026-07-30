import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AccountConsumptionSummary,
  FairUseAccountFlag,
  ResourceType,
  ResourceUsageBreakdown,
  SuperAdminConsumptionIntelligence,
} from "@/types";
import { calculateComputeCredits, DEFAULT_CREDIT_WEIGHTS } from "./weights";

export interface RecordUsageEventInput {
  accountId: string;
  resourceType: ResourceType;
  quantity?: number;
  metadata?: Record<string, unknown>;
}

export interface RecordUsageEventResult {
  success: boolean;
  eventId?: string;
  resourceType: ResourceType;
  quantity: number;
  creditsUsed: number;
  estimatedCost: number;
  error?: string;
}

/**
 * Motor de Consumo Computacional: Registra um evento de telemetria de consumo.
 * Totalmente assíncrono e não-bloqueante — nunca deve interromper o fluxo principal.
 */
export async function recordUsageEvent(
  supabase: SupabaseClient,
  input: RecordUsageEventInput
): Promise<RecordUsageEventResult> {
  const { accountId, resourceType, quantity = 1, metadata = {} } = input;

  if (!accountId) {
    return {
      success: false,
      resourceType,
      quantity,
      creditsUsed: 0,
      estimatedCost: 0,
      error: "account_id é obrigatório para registrar consumo",
    };
  }

  try {
    // 1. Tentar gravar via RPC do banco de dados (atômico e com RLS)
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("record_usage_event", {
      p_account_id: accountId,
      p_resource_type: resourceType,
      p_quantity: quantity,
      p_metadata: metadata,
    });

    if (!rpcErr && rpcRes && rpcRes.success) {
      return {
        success: true,
        eventId: rpcRes.event_id,
        resourceType,
        quantity,
        creditsUsed: Number(rpcRes.credits_used || 0),
        estimatedCost: Number(rpcRes.estimated_cost || 0),
      };
    }

    // 2. Fallback de inserção direta se RPC não estiver registrada
    const weightMeta = DEFAULT_CREDIT_WEIGHTS[resourceType] || { weight: 1.0, cost: 0.001 };
    const creditsUsed = calculateComputeCredits(resourceType, quantity);
    const estimatedCost = Math.round(quantity * weightMeta.cost * 10000) / 10000;

    const { data: directInsert, error: insertErr } = await supabase
      .from("usage_events")
      .insert({
        account_id: accountId,
        resource_type: resourceType,
        quantity,
        compute_credits: creditsUsed,
        estimated_cost: estimatedCost,
        metadata,
      })
      .select("id")
      .single();

    if (!insertErr && directInsert) {
      return {
        success: true,
        eventId: directInsert.id,
        resourceType,
        quantity,
        creditsUsed,
        estimatedCost,
      };
    }

    // Se houve erro na gravação direta, logar e retornar fallback gracioso
    console.warn("[MotorConsumo] Erro ao registrar evento de consumo no banco:", rpcErr || insertErr);
    return {
      success: false,
      resourceType,
      quantity,
      creditsUsed,
      estimatedCost,
      error: rpcErr?.message || insertErr?.message || "Erro desconhecido ao gravar telemetria",
    };
  } catch (err) {
    console.error("[MotorConsumo] Exceção capturada ao emitir telemetria:", err);
    return {
      success: false,
      resourceType,
      quantity,
      creditsUsed: calculateComputeCredits(resourceType, quantity),
      estimatedCost: 0,
      error: err instanceof Error ? err.message : "Exceção interna no Motor de Consumo",
    };
  }
}

/**
 * Obtém o resumo de consumo computacional e franquia para uma conta no período.
 */
export async function getAccountConsumptionSummary(
  supabase: SupabaseClient,
  accountId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AccountConsumptionSummary> {
  const start = startDate ? startDate.toISOString() : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const end = endDate ? endDate.toISOString() : new Date().toISOString();

  // Tentar via RPC get_account_consumption_summary
  const { data: rpcData, error: rpcErr } = await supabase.rpc("get_account_consumption_summary", {
    p_account_id: accountId,
    p_start_date: start,
    p_end_date: end,
  });

  if (!rpcErr && rpcData) {
    return rpcData as AccountConsumptionSummary;
  }

  // Fallback client-side se RPC não estiver disponível
  const { data: account } = await supabase
    .from("accounts")
    .select("plan:plans(name, monthly_compute_credits)")
    .eq("id", accountId)
    .single();

  const planData = Array.isArray(account?.plan) ? account?.plan[0] : account?.plan;
  const monthlyAllowance = Number(planData?.monthly_compute_credits || 100000);
  const planName = planData?.name || "Plano Ativo";

  const { data: events } = await supabase
    .from("usage_events")
    .select("resource_type, quantity, compute_credits, estimated_cost")
    .eq("account_id", accountId)
    .gte("created_at", start)
    .lte("created_at", end);

  let totalCredits = 0;
  let totalCost = 0;
  const breakdownMap: Record<string, ResourceUsageBreakdown> = {};

  if (events && events.length > 0) {
    for (const ev of events) {
      const cred = Number(ev.compute_credits || 0);
      const cost = Number(ev.estimated_cost || 0);
      const qty = Number(ev.quantity || 0);
      totalCredits += cred;
      totalCost += cost;

      if (!breakdownMap[ev.resource_type]) {
        breakdownMap[ev.resource_type] = {
          resource_type: ev.resource_type as ResourceType,
          total_quantity: 0,
          total_credits: 0,
          total_estimated_cost: 0,
        };
      }
      breakdownMap[ev.resource_type].total_quantity += qty;
      breakdownMap[ev.resource_type].total_credits += cred;
      breakdownMap[ev.resource_type].total_estimated_cost += cost;
    }
  }

  const days = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));

  return {
    account_id: accountId,
    plan_name: planName,
    monthly_allowance_credits: monthlyAllowance,
    total_credits_used: Math.round(totalCredits * 100) / 100,
    remaining_credits: Math.max(0, monthlyAllowance - totalCredits),
    usage_percentage: Math.min(100, Math.round((totalCredits / monthlyAllowance) * 10000) / 100),
    total_estimated_cost: Math.round(totalCost * 10000) / 10000,
    daily_average_credits: Math.round((totalCredits / days) * 100) / 100,
    breakdown_by_resource: Object.values(breakdownMap).sort((a, b) => b.total_credits - a.total_credits),
  };
}

/**
 * Inteligência Comercial e Análise de Fair Use para Super Admin.
 */
export async function getSuperAdminConsumptionIntelligence(
  supabase: SupabaseClient
): Promise<SuperAdminConsumptionIntelligence> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Buscar todas as contas com seus planos
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, plan:plans(name, monthly_compute_credits)");

  const accountList = accounts || [];
  const totalAccounts = accountList.length;

  // 2. Buscar eventos dos últimos 30 dias
  const { data: events } = await supabase
    .from("usage_events")
    .select("account_id, resource_type, quantity, compute_credits, estimated_cost")
    .gte("created_at", thirtyDaysAgo);

  const eventList = events || [];

  let totalCreditsConsumed = 0;
  let totalCostConsumed = 0;
  const resourceTotals: Record<string, ResourceUsageBreakdown> = {};
  const accountCreditsMap: Record<string, number> = {};

  for (const ev of eventList) {
    const cred = Number(ev.compute_credits || 0);
    const cost = Number(ev.estimated_cost || 0);
    const qty = Number(ev.quantity || 0);

    totalCreditsConsumed += cred;
    totalCostConsumed += cost;

    accountCreditsMap[ev.account_id] = (accountCreditsMap[ev.account_id] || 0) + cred;

    if (!resourceTotals[ev.resource_type]) {
      resourceTotals[ev.resource_type] = {
        resource_type: ev.resource_type as ResourceType,
        total_quantity: 0,
        total_credits: 0,
        total_estimated_cost: 0,
      };
    }
    resourceTotals[ev.resource_type].total_quantity += qty;
    resourceTotals[ev.resource_type].total_credits += cred;
    resourceTotals[ev.resource_type].total_estimated_cost += cost;
  }

  const avgCostPerAccount = totalAccounts > 0 ? totalCostConsumed / totalAccounts : 0;
  const avgCreditsPerAccount = totalAccounts > 0 ? totalCreditsConsumed / totalAccounts : 1;

  // 3. Identificar contas com desvio atípico (Fair Use)
  const fairUseFlags: FairUseAccountFlag[] = [];

  for (const acc of accountList) {
    const planObj = Array.isArray(acc.plan) ? acc.plan[0] : acc.plan;
    const planAllowance = Number(planObj?.monthly_compute_credits || 100000);
    const planName = planObj?.name || "Padrão";

    const accountCredits = accountCreditsMap[acc.id] || 0;
    const ratioToAllowance = planAllowance > 0 ? accountCredits / planAllowance : 0;

    // Calcular z_score simples baseado no consumo médio geral
    const zScore = Math.round(((accountCredits - avgCreditsPerAccount) / Math.max(1000, avgCreditsPerAccount)) * 100) / 100;

    let status: 'normal' | 'high' | 'critical_fair_use' = 'normal';
    if (ratioToAllowance >= 1.5 || zScore >= 3.0) {
      status = 'critical_fair_use';
    } else if (ratioToAllowance >= 1.0 || zScore >= 1.5) {
      status = 'high';
    }

    if (status !== 'normal') {
      fairUseFlags.push({
        account_id: acc.id,
        account_name: acc.name || `Conta ${acc.id.substring(0, 8)}`,
        plan_name: planName,
        total_credits_used: Math.round(accountCredits * 100) / 100,
        monthly_allowance_credits: planAllowance,
        plan_average_credits: Math.round(avgCreditsPerAccount),
        z_score: zScore,
        status,
      });
    }
  }

  return {
    total_accounts_monitored: totalAccounts,
    total_credits_consumed_30d: Math.round(totalCreditsConsumed * 100) / 100,
    total_estimated_cost_30d: Math.round(totalCostConsumed * 10000) / 10000,
    average_cost_per_account: Math.round(avgCostPerAccount * 10000) / 10000,
    top_cost_resources: Object.values(resourceTotals).sort((a, b) => b.total_credits - a.total_credits),
    fair_use_flags: fairUseFlags.sort((a, b) => b.total_credits_used - a.total_credits_used),
  };
}
