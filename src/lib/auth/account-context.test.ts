// ============================================================
// Contexto de conta sob tenancy multi-workspace.
//
// O que estes testes protegem é uma decisão de segurança, não um
// detalhe de implementação: o papel do chamador vem da PARTICIPAÇÃO
// (`account_memberships`), nunca do espelho `profiles.account_role`.
// Se um espelho desatualizado voltasse a decidir acesso, o efeito
// seria autorização com base em estado obsoleto — exatamente o tipo
// de regressão que o modelo novo existe para tornar impossível.
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";

const getUser = vi.fn();
const rpc = vi.fn();
const tableResults = new Map<string, { data: unknown; error: unknown }>();

function builder(table: string) {
  const chain: Record<string, unknown> = {};
  const passthrough = () => chain;
  chain.select = passthrough;
  chain.eq = passthrough;
  chain.in = passthrough;
  chain.order = passthrough;
  chain.maybeSingle = async () =>
    tableResults.get(table) ?? { data: null, error: null };
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: (table: string) => builder(table),
    rpc,
  }),
}));

const ACCOUNT_ROW = {
  id: "empresa-a",
  name: "Empresa A",
  owner_user_id: "outra-pessoa",
  subscription_status: "active",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function signedIn(userId = "pedro") {
  getUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
}

describe("getCurrentAccount sob múltiplos workspaces", () => {
  beforeEach(() => {
    tableResults.clear();
    getUser.mockReset();
    rpc.mockReset();
  });

  it("resolve o workspace ativo e lê o papel da participação", async () => {
    signedIn();
    tableResults.set("profiles", {
      // O espelho no perfil está desatualizado de propósito.
      data: { account_id: "empresa-a", account_role: "owner", account: ACCOUNT_ROW },
      error: null,
    });
    tableResults.set("account_memberships", {
      data: { role: "agent" },
      error: null,
    });

    const { getCurrentAccount } = await import("@/lib/auth/account");
    const ctx = await getCurrentAccount();

    expect(ctx.accountId).toBe("empresa-a");
    // A participação vence o espelho.
    expect(ctx.role).toBe("agent");
  });

  it("nega quando o ponteiro aponta para workspace sem participação ativa", async () => {
    signedIn();
    tableResults.set("profiles", {
      data: { account_id: "empresa-a", account_role: "admin", account: ACCOUNT_ROW },
      error: null,
    });
    // Participação encerrada enquanto este workspace estava aberto.
    tableResults.set("account_memberships", { data: null, error: null });

    const { getCurrentAccount, ForbiddenError } = await import("@/lib/auth/account");
    await expect(getCurrentAccount()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("repara o contexto ausente antes de desistir", async () => {
    signedIn();
    // Primeira leitura: sem workspace ativo (a FK zerou o ponteiro quando o
    // workspace anterior foi excluído). Depois do reparo, há contexto.
    let call = 0;
    tableResults.set("account_memberships", { data: { role: "owner" }, error: null });
    const profiles = {
      get data() {
        call += 1;
        return call === 1
          ? { account_id: null, account_role: null, account: null }
          : { account_id: "empresa-a", account_role: "owner", account: ACCOUNT_ROW };
      },
      error: null,
    };
    tableResults.set("profiles", profiles as unknown as { data: unknown; error: unknown });
    rpc.mockResolvedValue({ data: "empresa-a", error: null });

    const { getCurrentAccount } = await import("@/lib/auth/account");
    const ctx = await getCurrentAccount();

    expect(rpc).toHaveBeenCalledWith("ensure_active_workspace");
    expect(ctx.accountId).toBe("empresa-a");
  });

  it("recusa sessão inexistente antes de qualquer leitura de tenant", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    const { getCurrentAccount, UnauthorizedError } = await import("@/lib/auth/account");
    await expect(getCurrentAccount()).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

describe("requireRole usa o papel do workspace ativo", () => {
  beforeEach(() => {
    tableResults.clear();
    getUser.mockReset();
    rpc.mockReset();
  });

  it("recusa ação de admin para quem é apenas agente NESTE workspace", async () => {
    signedIn();
    tableResults.set("profiles", {
      // Dono em outro lugar; espelho ainda diz 'owner'.
      data: { account_id: "empresa-a", account_role: "owner", account: ACCOUNT_ROW },
      error: null,
    });
    tableResults.set("account_memberships", { data: { role: "agent" }, error: null });

    const { requireRole, ForbiddenError } = await import("@/lib/auth/account");
    await expect(requireRole("admin")).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("libera ação de admin para quem é admin neste workspace", async () => {
    signedIn();
    tableResults.set("profiles", {
      data: { account_id: "empresa-a", account_role: "viewer", account: ACCOUNT_ROW },
      error: null,
    });
    tableResults.set("account_memberships", { data: { role: "admin" }, error: null });

    const { requireRole } = await import("@/lib/auth/account");
    const ctx = await requireRole("admin");
    expect(ctx.role).toBe("admin");
  });
});
