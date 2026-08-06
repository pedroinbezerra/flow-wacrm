import type { OnboardingAnalyticsSummary, OnboardingStepKey } from "@/types";
import { createChatCompletion } from "@/lib/ai-service/openai-client";

export interface AIJourneyInsight {
  title: string;
  category: "dropoff_friction" | "activation" | "retention" | "feature_adoption";
  severity: "info" | "warning" | "critical";
  summary: string;
  recommended_action: string;
  estimated_impact: string;
}

const STEP_LABELS: Record<string, string> = {
  connect_whatsapp: "Conexão do WhatsApp",
  create_first_flow: "Criação do 1º Fluxo",
  import_contacts: "Importação de Contatos",
  create_first_campaign: "Criação de Transmissão",
  send_first_campaign: "Envio de Transmissão",
  invite_team: "Convite de Equipe",
};

/**
 * Assistente de IA para Inteligência da Jornada e Onboarding do Usuário.
 * Analisa gargalos do funil de ativação e gera recomendações estratégicas de UX e Customer Success.
 */
export async function generateAIJourneyInsights(
  analytics: OnboardingAnalyticsSummary,
  openaiApiKey?: string
): Promise<AIJourneyInsight[]> {
  const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Você é um Head de Product Growth & UX Onboarding especialista em SaaS B2B.
Analise as métricas de jornada de ativação do Flow Hub abaixo e retorne um JSON ARRAY com 3 a 5 recomendações estratégicas de Growth, redução de atrito e aumento de conversão.

Métricas do Funil de Onboarding:
- Usuários Totais Registrados: ${analytics.total_users}
- Usuários que Iniciaram o Onboarding: ${analytics.started_onboarding}
- Usuários que Concluíram a Jornada: ${analytics.completed_onboarding}
- Taxa de Conclusão Global: ${analytics.completion_rate}%
- Detalhamento por Etapa: ${JSON.stringify(analytics.step_breakdown)}

Retorne APENAS um JSON Array contendo objetos no seguinte formato:
[
  {
    "title": "título curto da análise de gargalo ou oportunidade",
    "category": "dropoff_friction" | "activation" | "retention" | "feature_adoption",
    "severity": "info" | "warning" | "critical",
    "summary": "resumo claro do ponto de atrito na jornada com base em dados reais",
    "recommended_action": "recomendação acionável de produto, UX ou Customer Success",
    "estimated_impact": "impacto estimado na taxa de ativação ou retenção"
  }
]`;

      const aiResponse = await createChatCompletion({
        apiKey,
        messages: [
          { role: "system", content: "Você é um especialista em Product Growth e Onboarding de SaaS. Responda estritamente em JSON válido." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        maxTokens: 1200,
      });

      const rawText = aiResponse.content || "";
      const cleanedContent = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedContent);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as AIJourneyInsight[];
      }
    } catch (err) {
      console.warn("[AIJourneyInsights] Falha ao consultar LLM, utilizando análise heurística local:", err);
    }
  }

  // Fallback Analítico Heurístico
  const insights: AIJourneyInsight[] = [];
  const steps = analytics.step_breakdown || {};

  // 1. Identificar etapa com maior taxa de desistência/pulo
  let worstStepKey = "";
  let highestSkippedRatio = -1;

  for (const [key, stats] of Object.entries(steps)) {
    const total = stats.total_started || 1;
    const skippedRatio = stats.skipped / total;
    if (skippedRatio > highestSkippedRatio) {
      highestSkippedRatio = skippedRatio;
      worstStepKey = key;
    }
  }

  if (worstStepKey && highestSkippedRatio > 0.2) {
    const stepLabel = STEP_LABELS[worstStepKey] || worstStepKey;
    insights.push({
      title: `Gargalo de Atrito em '${stepLabel}'`,
      category: "dropoff_friction",
      severity: highestSkippedRatio > 0.4 ? "critical" : "warning",
      summary: `A etapa '${stepLabel}' apresenta a maior taxa de pulo (${Math.round(highestSkippedRatio * 100)}% dos usuários que chegam a essa etapa a ignoram).`,
      recommended_action: `Simplificar o assistente de configuração desta etapa ou oferecer modelos pré-configurados (1-click template) para diminuir o tempo de setup.`,
      estimated_impact: `Aumento de até +18% na taxa de conversão do onboarding.`,
    });
  }

  // 2. Análise da Taxa Global de Conclusão
  if (analytics.completion_rate < 50) {
    insights.push({
      title: "Taxa Geral de Ativação Abaixo do Meta (Benchmark SaaS)",
      category: "activation",
      severity: "warning",
      summary: `Apenas ${analytics.completion_rate}% dos usuários cadastrados concluem o onboarding completo.`,
      recommended_action: `Implementar lembretes e sequências de e-mail/WhatsApp de onboarding para usuários estagnados nos primeiros 3 dias.`,
      estimated_impact: `Recuperação de até 25% dos usuários que abandonam no trial.`,
    });
  } else {
    insights.push({
      title: "Funil de Ativação de Alto Desempenho",
      category: "activation",
      severity: "info",
      summary: `Excelente taxa de conclusão de onboarding (${analytics.completion_rate}%). A maioria dos usuários completa os primeiros passos de valor.`,
      recommended_action: `Focar em incentivar o convite de mais membros da equipe para expandir o uso dentro da organização.`,
      estimated_impact: `Aumento no engajamento e retenção de longo prazo.`,
    });
  }

  // 3. Etapa de Convite de Equipe
  const teamStats = steps.invite_team;
  if (teamStats && teamStats.completed < analytics.started_onboarding * 0.3) {
    insights.push({
      title: "Oportunidade de Expansão de Uso por Equipe",
      category: "retention",
      severity: "info",
      summary: "Menos de 30% das contas convidam outros membros durante os primeiros dias de uso.",
      recommended_action: "Incentivar a adição de atendentes através de um banner no Inbox e bonificação em créditos computacionais.",
      estimated_impact: "Melhoria de +30% na retenção LTV da conta.",
    });
  }

  return insights;
}
