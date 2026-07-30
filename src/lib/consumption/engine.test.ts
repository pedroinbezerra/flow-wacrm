import { describe, it, expect, vi } from "vitest";
import { calculateComputeCredits } from "./weights";
import { recordUsageEvent, getAccountConsumptionSummary, getSuperAdminConsumptionIntelligence } from "./engine";
import { generateAIPricingInsights } from "./ai-pricing-insights";

describe("Motor de Consumo Computacional", () => {
  it("deve calcular créditos computacionais corretamente com base nos pesos parametrizados", () => {
    expect(calculateComputeCredits("whatsapp_message", 10)).toBe(10);
    expect(calculateComputeCredits("ai_execution", 2)).toBe(10);
    expect(calculateComputeCredits("audio_transcription", 3)).toBe(30);
    expect(calculateComputeCredits("automation_execution", 5)).toBe(10);
    expect(calculateComputeCredits("webhook_dispatch", 100)).toBe(100);
    expect(calculateComputeCredits("pdf_generation", 4)).toBe(8);
    expect(calculateComputeCredits("ocr_scan", 2)).toBe(16);
  });

  it("deve retornar erro gracioso ao tentar registrar evento sem account_id", async () => {
    const mockSupabase = {} as any;
    const res = await recordUsageEvent(mockSupabase, {
      accountId: "",
      resourceType: "whatsapp_message",
      quantity: 1,
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("account_id é obrigatório");
  });

  it("deve executar recordUsageEvent com sucesso usando RPC", async () => {
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          success: true,
          event_id: "test-event-123",
          credits_used: 5,
          estimated_cost: 0.02,
        },
        error: null,
      }),
    } as any;

    const res = await recordUsageEvent(mockSupabase, {
      accountId: "acc-123",
      resourceType: "ai_execution",
      quantity: 1,
    });

    expect(res.success).toBe(true);
    expect(res.eventId).toBe("test-event-123");
    expect(res.creditsUsed).toBe(5);
    expect(res.estimatedCost).toBe(0.02);
  });

  it("deve calcular o resumo de consumo e saldo da franquia", async () => {
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          account_id: "acc-123",
          plan_name: "Plano Pro",
          monthly_allowance_credits: 100000,
          total_credits_used: 1500,
          remaining_credits: 98500,
          usage_percentage: 1.5,
          total_estimated_cost: 6.0,
          daily_average_credits: 50.0,
          breakdown_by_resource: [
            { resource_type: "ai_execution", total_quantity: 100, total_credits: 500, total_estimated_cost: 2.0 },
            { resource_type: "whatsapp_message", total_quantity: 1000, total_credits: 1000, total_estimated_cost: 4.0 },
          ],
        },
        error: null,
      }),
    } as any;

    const summary = await getAccountConsumptionSummary(mockSupabase, "acc-123");

    expect(summary.plan_name).toBe("Plano Pro");
    expect(summary.monthly_allowance_credits).toBe(100000);
    expect(summary.total_credits_used).toBe(1500);
    expect(summary.remaining_credits).toBe(98500);
    expect(summary.breakdown_by_resource.length).toBe(2);
  });

  it("deve gerar recomendações analíticas com IA para Super Admin", async () => {
    const intelligence = {
      total_accounts_monitored: 10,
      total_credits_consumed_30d: 50000,
      total_estimated_cost_30d: 250.0,
      average_cost_per_account: 25.0,
      top_cost_resources: [
        { resource_type: "ai_execution" as const, total_quantity: 5000, total_credits: 25000, total_estimated_cost: 150.0 },
      ],
      fair_use_flags: [
        {
          account_id: "acc-heavy",
          account_name: "Empresa Heavy Use",
          plan_name: "Starter",
          total_credits_used: 35000,
          monthly_allowance_credits: 25000,
          plan_average_credits: 5000,
          z_score: 3.5,
          status: "critical_fair_use" as const,
        },
      ],
    };

    const insights = await generateAIPricingInsights(intelligence);

    expect(insights.length).toBeGreaterThan(0);
    expect(insights.some((i) => i.category === "cost_optimization")).toBe(true);
    expect(insights.some((i) => i.category === "fair_use")).toBe(true);
  });
});
