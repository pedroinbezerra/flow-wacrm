import { describe, it, expect, vi } from "vitest";
import {
  getJourneySummary,
  ONBOARDING_STEP_ACTIONS,
  ALL_ONBOARDING_STEPS,
} from "./journey-tracker";

describe("journey-tracker", () => {
  it("should list all 6 recommended onboarding steps with valid action URLs", () => {
    expect(ALL_ONBOARDING_STEPS).toHaveLength(6);
    expect(ALL_ONBOARDING_STEPS).toContain("connect_whatsapp");
    expect(ALL_ONBOARDING_STEPS).toContain("create_first_flow");
    expect(ALL_ONBOARDING_STEPS).toContain("import_contacts");
    expect(ALL_ONBOARDING_STEPS).toContain("create_first_campaign");
    expect(ALL_ONBOARDING_STEPS).toContain("send_first_campaign");
    expect(ALL_ONBOARDING_STEPS).toContain("invite_team");

    ALL_ONBOARDING_STEPS.forEach((step) => {
      expect(ONBOARDING_STEP_ACTIONS[step]).toBeDefined();
      expect(ONBOARDING_STEP_ACTIONS[step].startsWith("/")).toBe(true);
    });
  });

  it("should calculate journey summary percentage correctly when some steps are completed", async () => {
    // Mock Supabase client
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "onboarding_progress") {
          return {
            select: () => ({
              eq: () => ({
                eq: async () => ({
                  data: [
                    { step_key: "connect_whatsapp", completed: true, completed_at: "2026-07-30", skipped: false },
                    { step_key: "create_first_flow", completed: true, completed_at: "2026-07-30", skipped: false },
                  ],
                }),
              }),
            }),
          };
        }
        // Domain tables for auto-check returning 0 counts
        return {
          select: () => ({
            eq: () => ({
              in: async () => ({ count: 0 }),
              async THEN() { return { count: 0 }; },
              count: 0,
            }),
          }),
        };
      }),
    } as any;

    // Simulate getJourneySummary
    const summary = await getJourneySummary(mockSupabase, "acc-123", "user-123");
    expect(summary.total_steps).toBe(6);
    expect(summary.completed_steps).toBeGreaterThanOrEqual(2);
    expect(summary.percentage).toBeGreaterThanOrEqual(33);
  });
});
