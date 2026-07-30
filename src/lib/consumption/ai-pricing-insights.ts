import type { AICommercialInsight, SuperAdminConsumptionIntelligence } from "@/types";
import { createChatCompletion } from "@/lib/ai-service/openai-client";

/**
 * Motor de IA para Insights Comerciais de Precificação, Franquia e Fair Use.
 * Analisa a telemetria do Motor de Consumo e gera recomendações acionáveis para a gestão do Flow Hub.
 */
export async function generateAIPricingInsights(
  intelligence: SuperAdminConsumptionIntelligence,
  openaiApiKey?: string
): Promise<AICommercialInsight[]> {
  const insights: AICommercialInsight[] = [];

  // 1. Tentar gerar insights via IA (LLM) se API key estiver configurada
  const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Você é um CFO & Chief Product Officer especialista em SaaS Multi-tenant e Monetização baseada em consumo.
Analise a telemetria operacional do Flow Hub abaixo e retorne um JSON ARRAY com 3 a 5 recomendações estratégicas de precificação, ajuste de cotas, margem e Fair Use.

Dados de Telemetria (Últimos 30 Dias):
- Contas Monitoradas: ${intelligence.total_accounts_monitored}
- Total de Créditos Computacionais Consumidos: ${intelligence.total_credits_consumed_30d}
- Custo Operacional Estimado Total: R$ ${intelligence.total_estimated_cost_30d.toFixed(2)}
- Custo Médio por Empresa: R$ ${intelligence.average_cost_per_account.toFixed(2)}
- Top Recursos por Custo: ${JSON.stringify(intelligence.top_cost_resources.slice(0, 5))}
- Contas com Alerta de Fair Use / Consumo Atípico: ${JSON.stringify(intelligence.fair_use_flags)}

Retorne APENAS um JSON Array contendo objetos com o seguinte esquema:
[
  {
    "title": "string curto do título do insight",
    "category": "pricing" | "quota" | "fair_use" | "cost_optimization",
    "severity": "info" | "warning" | "critical",
    "summary": "resumo claro do achado baseado em dados reais",
    "recommended_action": "ação recomendada para a gestão comercial do Flow Hub",
    "estimated_financial_impact": "estimativa do impacto financeiro ou de margem"
  }
]`;

      const aiResponse = await createChatCompletion({
        apiKey,
        messages: [
          { role: "system", content: "Você é um assistente analítico de precificação SaaS. Responda estritamente em JSON válido." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        maxTokens: 1200,
      });

      const rawText = aiResponse.content || "";
      const cleanedContent = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedContent);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as AICommercialInsight[];
      }
    } catch (err) {
      console.warn("[AIPricingInsights] Falha ao consultar OpenAI LLM, aplicando regras analíticas locais:", err);
    }
  }

  // 2. Fallback Analítico Heurístico (Deterministico)
  // Insight 1: Análise de Recursos de Maior Custo (ex: IA / Transcrição)
  const topResource = intelligence.top_cost_resources[0];
  if (topResource) {
    insights.push({
      title: `Ajuste de Margem para ${topResource.resource_type}`,
      category: "cost_optimization",
      severity: topResource.total_credits > intelligence.total_credits_consumed_30d * 0.4 ? "warning" : "info",
      summary: `O recurso '${topResource.resource_type}' é responsável por ${Math.round((topResource.total_credits / Math.max(1, intelligence.total_credits_consumed_30d)) * 100)}% de todo o consumo em créditos da plataforma (R$ ${topResource.total_estimated_cost.toFixed(2)}).`,
      recommended_action: `Reavaliar o peso de crédito do recurso (atualmente focado em ${topResource.resource_type}) ou introduzir franquia específica em planos superiores.`,
      estimated_financial_impact: `Redução de até 15% nos custos operacionais não repassados.`,
    });
  }

  // Insight 2: Análise de Alertas de Fair Use
  if (intelligence.fair_use_flags.length > 0) {
    const criticalFlags = intelligence.fair_use_flags.filter((f) => f.status === "critical_fair_use");
    insights.push({
      title: `${intelligence.fair_use_flags.length} Contas com Consumo Atípico (Fair Use)`,
      category: "fair_use",
      severity: criticalFlags.length > 0 ? "critical" : "warning",
      summary: `${intelligence.fair_use_flags.length} cliente(s) excederam o comportamento médio do seu plano (${criticalFlags.length} em nível crítico).`,
      recommended_action: `Oferecer upgrade proativo para o plano Enterprise com pacote adicional de franquia computacional.`,
      estimated_financial_impact: `Oportunidade de expansão de ARR (Add-ons / Enterprise Upgrade).`,
    });
  } else {
    insights.push({
      title: "Distribuição de Consumo Saudável",
      category: "quota",
      severity: "info",
      summary: "Todas as contas ativas estão operando dentro das margens normais de franquia do plano contratado.",
      recommended_action: "Manter monitoramento de telemetria mensal antes da introdução de cobrança adicional.",
      estimated_financial_impact: "Estabilidade de margem operacional mantida.",
    });
  }

  // Insight 3: Custo Médio por Empresa vs Rentabilidade
  insights.push({
    title: "Métrica de Custo Operacional por Conta",
    category: "pricing",
    severity: "info",
    summary: `O custo médio de infraestrutura por empresa monitorada é de R$ ${intelligence.average_cost_per_account.toFixed(2)} / mês.`,
    recommended_action: "Utilizar este custo médio como benchmark para calcular a margem líquida por faixa de preço de plano.",
    estimated_financial_impact: "Garantia de margem bruta superior a 80% nos planos base.",
  });

  return insights;
}
