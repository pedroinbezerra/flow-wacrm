import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabaseAdmin
const mockSupabase = {
  from: vi.fn(),
};

vi.mock("@/lib/automations/admin-client", () => ({
  supabaseAdmin: () => mockSupabase,
}));

// Mock getAsaasSubscription
const mockGetAsaasSubscription = vi.fn();
vi.mock("@/lib/asaas/client", () => ({
  getAsaasSubscription: (...args: any[]) => mockGetAsaasSubscription(...args),
}));

import { POST } from "./route";

describe("Asaas Webhook Route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("deve retornar 401 se token for inválido quando ASAAS_WEBHOOK_ACCESS_TOKEN estiver configurado", async () => {
    process.env.ASAAS_WEBHOOK_ACCESS_TOKEN = "secret_token_123";

    const req = new Request("http://localhost/api/webhooks/asaas", {
      method: "POST",
      headers: { "asaas-access-token": "wrong_token" },
      body: JSON.stringify({ event: "PAYMENT_RECEIVED", payment: { id: "pay_1" } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    delete process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;
  });

  it("deve calcular current_period_end usando nextDueDate do Asaas em PAYMENT_RECEIVED (Opção 1)", async () => {
    delete process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;

    mockGetAsaasSubscription.mockResolvedValueOnce({
      id: "sub_asaas_123",
      nextDueDate: "2027-08-15",
    });

    const mockUpdateSub = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    const mockUpdateAcc = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    const mockSelectInv = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }) });
    const mockInsertInv = vi.fn().mockResolvedValue({});

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "subscriptions") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "sub-uuid-1", account_id: "acc-uuid-1", plan_id: "plan-yearly", asaas_subscription_id: "sub_asaas_123" },
              }),
            }),
          }),
          update: mockUpdateSub,
        };
      }
      if (table === "accounts") {
        return { update: mockUpdateAcc };
      }
      if (table === "invoices") {
        return {
          select: mockSelectInv,
          insert: mockInsertInv,
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/webhooks/asaas", {
      method: "POST",
      body: JSON.stringify({
        event: "PAYMENT_RECEIVED",
        payment: {
          id: "pay_100",
          subscription: "sub_asaas_123",
          externalReference: "acc-uuid-1",
          value: 1200,
          billingType: "CREDIT_CARD",
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockGetAsaasSubscription).toHaveBeenCalledWith("sub_asaas_123");
    expect(mockUpdateSub).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "active",
        current_period_end: new Date("2027-08-15T23:59:59.000Z").toISOString(),
      })
    );
  });

  it("deve calcular current_period_end usando fallback por plano anual se Asaas falhar (Opção 2)", async () => {
    delete process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;

    mockGetAsaasSubscription.mockRejectedValueOnce(new Error("Asaas API offline"));

    const mockUpdateSub = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    const mockUpdateAcc = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    const mockSelectInv = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }) });
    const mockInsertInv = vi.fn().mockResolvedValue({});

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "subscriptions") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "sub-uuid-1", account_id: "acc-uuid-1", plan_id: "plan-yearly-id", asaas_subscription_id: "sub_asaas_123" },
              }),
            }),
          }),
          update: mockUpdateSub,
        };
      }
      if (table === "plans") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { billing_period: "yearly" },
              }),
            }),
          }),
        };
      }
      if (table === "accounts") {
        return { update: mockUpdateAcc };
      }
      if (table === "invoices") {
        return { select: mockSelectInv, insert: mockInsertInv };
      }
      return {};
    });

    const req = new Request("http://localhost/api/webhooks/asaas", {
      method: "POST",
      body: JSON.stringify({
        event: "PAYMENT_CONFIRMED",
        payment: {
          id: "pay_200",
          subscription: "sub_asaas_123",
          externalReference: "acc-uuid-1",
          value: 1200,
          billingType: "PIX",
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const callArgs = mockUpdateSub.mock.calls[0][0];
    const periodEndYear = new Date(callArgs.current_period_end).getFullYear();
    const expectedYear = new Date().getFullYear() + 1;
    expect(periodEndYear).toBe(expectedYear);
  });

  it("deve tratar PAYMENT_REFUNDED atualizando a fatura para refunded e suspendendo a conta", async () => {
    delete process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;

    const mockUpdateInv = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    const mockUpdateSub = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    const mockUpdateAcc = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "invoices") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "inv-1", account_id: "acc-uuid-1", subscription_id: "sub-uuid-1" },
              }),
            }),
          }),
          update: mockUpdateInv,
        };
      }
      if (table === "subscriptions") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "sub-uuid-1", account_id: "acc-uuid-1" },
              }),
            }),
          }),
          update: mockUpdateSub,
        };
      }
      if (table === "accounts") {
        return { update: mockUpdateAcc };
      }
      return {};
    });

    const req = new Request("http://localhost/api/webhooks/asaas", {
      method: "POST",
      body: JSON.stringify({
        event: "PAYMENT_REFUNDED",
        payment: {
          id: "pay_refund_1",
          subscription: "sub_asaas_123",
          externalReference: "acc-uuid-1",
          value: 100,
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockUpdateInv).toHaveBeenCalledWith({ status: "refunded" });
    expect(mockUpdateSub).toHaveBeenCalledWith(expect.objectContaining({ status: "suspended" }));
    expect(mockUpdateAcc).toHaveBeenCalledWith(expect.objectContaining({ subscription_status: "suspended" }));
  });

  it("deve tratar PAYMENT_CHARGEBACK_REQUESTED registrando log de auditoria sem alterar acesso ou fatura", async () => {
    delete process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;

    const mockInsertAudit = vi.fn().mockResolvedValue({});

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "accounts") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { name: "Empresa Teste", company_name: "Empresa Teste LTDA" },
              }),
            }),
          }),
        };
      }
      if (table === "account_deletion_audit_logs") {
        return { insert: mockInsertAudit };
      }
      return {};
    });

    const req = new Request("http://localhost/api/webhooks/asaas", {
      method: "POST",
      body: JSON.stringify({
        event: "PAYMENT_CHARGEBACK_REQUESTED",
        payment: {
          id: "pay_cb_1",
          subscription: "sub_asaas_123",
          externalReference: "acc-uuid-1",
          value: 150,
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockInsertAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: "acc-uuid-1",
        account_name: "Empresa Teste LTDA",
        details: expect.objectContaining({
          event: "PAYMENT_CHARGEBACK_REQUESTED",
          payment_id: "pay_cb_1",
        }),
      })
    );
  });

  it("deve tratar PAYMENT_DELETED cancelando fatura e definindo past_due se assinatura estiver ativa", async () => {
    delete process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;

    const mockUpdateInv = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    const mockUpdateSub = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    const mockUpdateAcc = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "invoices") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "inv-1", account_id: "acc-uuid-1", subscription_id: "sub-uuid-1" },
              }),
            }),
          }),
          update: mockUpdateInv,
        };
      }
      if (table === "subscriptions") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "sub-uuid-1", account_id: "acc-uuid-1", status: "active" },
              }),
            }),
          }),
          update: mockUpdateSub,
        };
      }
      if (table === "accounts") {
        return { update: mockUpdateAcc };
      }
      return {};
    });

    const req = new Request("http://localhost/api/webhooks/asaas", {
      method: "POST",
      body: JSON.stringify({
        event: "PAYMENT_DELETED",
        payment: {
          id: "pay_del_1",
          subscription: "sub_asaas_123",
          externalReference: "acc-uuid-1",
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockUpdateInv).toHaveBeenCalledWith({ status: "canceled" });
    expect(mockUpdateSub).toHaveBeenCalledWith(expect.objectContaining({ status: "past_due" }));
    expect(mockUpdateAcc).toHaveBeenCalledWith(expect.objectContaining({ subscription_status: "past_due" }));
  });
});
