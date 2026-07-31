import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();

vi.mock("@/lib/automations/admin-client", () => ({
  supabaseAdmin: () => ({
    from: () => ({
      select: mockSelect,
    }),
  }),
}));

import { GET } from "./route";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("retorna 200 { status: 'ok', db: 'ok', timestamp } quando o banco está saudável", async () => {
    mockSelect.mockReturnValueOnce({
      limit: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.db).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
    expect(body.error).toBeUndefined();
  });

  it("retorna 503 { status: 'error', db: 'error' } sem expor detalhes quando o banco falha", async () => {
    mockSelect.mockReturnValueOnce({
      limit: vi.fn().mockResolvedValueOnce({
        data: null,
        error: { message: "Database connection failed", code: "500" },
      }),
    });

    const res = await GET();
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.status).toBe("error");
    expect(body.db).toBe("error");
    expect(body.message).toBeUndefined();
    expect(body.error).toBeUndefined();
  });

  it("retorna 503 quando ocorre uma exceção inesperada", async () => {
    mockSelect.mockImplementationOnce(() => {
      throw new Error("Network offline");
    });

    const res = await GET();
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.status).toBe("error");
    expect(body.db).toBe("error");
  });
});
