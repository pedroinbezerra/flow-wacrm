import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreditWeight, ResourceType } from "@/types";

/**
 * Default fallback weights map in case DB is unreachable or non-migrated yet.
 */
export const DEFAULT_CREDIT_WEIGHTS: Record<string, { weight: number; cost: number; description: string }> = {
  whatsapp_message: { weight: 1.0, cost: 0.0050, description: "Envio ou recepção de mensagem de WhatsApp" },
  ai_execution: { weight: 5.0, cost: 0.0200, description: "Execução de modelo de IA (atendimento / copiloto)" },
  audio_transcription: { weight: 10.0, cost: 0.0400, description: "Transcrição de mensagens de áudio via IA" },
  automation_execution: { weight: 2.0, cost: 0.0020, description: "Execução de nós de automação de fluxo" },
  webhook_dispatch: { weight: 1.0, cost: 0.0010, description: "Disparo ou consumo de evento Webhook" },
  pdf_generation: { weight: 2.0, cost: 0.0050, description: "Geração de documentos PDF / relatórios" },
  ocr_scan: { weight: 8.0, cost: 0.0300, description: "Leitura de documentos via OCR (extensão de recurso)" },
};

/**
 * Calculate credits for a resource type with local calculation or DB fallback.
 */
export function calculateComputeCredits(resourceType: ResourceType, quantity = 1): number {
  const fallback = DEFAULT_CREDIT_WEIGHTS[resourceType] || { weight: 1.0, cost: 0.001 };
  return Math.round(quantity * fallback.weight * 100) / 100;
}

/**
 * Get active credit weights table from database with static fallback.
 */
export async function getActiveCreditWeights(
  supabase: SupabaseClient
): Promise<CreditWeight[]> {
  try {
    const { data, error } = await supabase
      .from("credit_weights")
      .select("*")
      .eq("status", "active")
      .order("credit_weight", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as CreditWeight[];
    }
  } catch (err) {
    console.warn("Failed to fetch credit_weights from Supabase, falling back to static map:", err);
  }

  return Object.entries(DEFAULT_CREDIT_WEIGHTS).map(([resource_type, meta]) => ({
    resource_type: resource_type as ResourceType,
    credit_weight: meta.weight,
    description: meta.description,
    unit_cost_estimate: meta.cost,
    status: "active",
    updated_at: new Date().toISOString(),
  }));
}
