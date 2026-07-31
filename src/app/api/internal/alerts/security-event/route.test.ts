import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSendTextMessage = vi.fn();
vi.mock("@/lib/whatsapp/meta-api", () => ({
  sendTextMessage: (...args: any[]) => mockSendTextMessage(...args),
}));

import { POST } from "./route";

describe("POST /api/internal/alerts/security-event", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
  });

  it("retorna 401 se o segredo for inválido", async () => {
    process.env.INTERNAL_ALERTS_SECRET = "secret_123";

    const req = new Request("http://localhost/api/internal/alerts/security-event", {
      method: "POST",
      headers: { "x-cron-secret": "wrong_secret" },
      body: JSON.stringify({ source: "test", summary: "Teste" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("retorna 200 { skipped: true } quando as variáveis de WhatsApp não estão configuradas", async () => {
    process.env.INTERNAL_ALERTS_SECRET = "secret_123";
    delete process.env.INTERNAL_ALERTS_WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.INTERNAL_ALERTS_WHATSAPP_ACCESS_TOKEN;
    delete process.env.INTERNAL_ALERTS_WHATSAPP_TO;

    const req = new Request("http://localhost/api/internal/alerts/security-event", {
      method: "POST",
      headers: { "x-cron-secret": "secret_123" },
      body: JSON.stringify({ source: "super_admin_audit_logs", summary: "Novo Super Admin" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.skipped).toBe(true);
    expect(mockSendTextMessage).not.toHaveBeenCalled();
  });

  it("dispara o envio de mensagem via WhatsApp quando todas as variáveis estão configuradas", async () => {
    process.env.INTERNAL_ALERTS_SECRET = "secret_123";
    process.env.INTERNAL_ALERTS_WHATSAPP_PHONE_NUMBER_ID = "phone_id_999";
    process.env.INTERNAL_ALERTS_WHATSAPP_ACCESS_TOKEN = "access_token_abc";
    process.env.INTERNAL_ALERTS_WHATSAPP_TO = "+5511999999999";

    mockSendTextMessage.mockResolvedValueOnce({ messageId: "wamid_12345" });

    const req = new Request("http://localhost/api/internal/alerts/security-event", {
      method: "POST",
      headers: { Authorization: "Bearer secret_123" },
      body: JSON.stringify({
        source: "ai_security_events",
        summary: "Jailbreak attempt",
        details: { severity: "critical", user_id: "user-123" },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.sent).toBe(true);
    expect(body.whatsappMessageId).toBe("wamid_12345");

    expect(mockSendTextMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        phoneNumberId: "phone_id_999",
        accessToken: "access_token_abc",
        to: "5511999999999",
        text: expect.stringContaining("Jailbreak attempt"),
      })
    );
  });
});
