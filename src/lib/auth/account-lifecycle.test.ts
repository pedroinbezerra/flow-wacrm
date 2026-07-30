import { describe, it, expect } from "vitest";
import { checkAccountAccess, ForbiddenError, type AccountContext } from "@/lib/auth/account";

describe("Account Access & Dunning Guards", () => {
  const mockClient = {} as any;

  it("permite acesso total em contas ativas sem agendamento de exclusão", () => {
    const ctx: AccountContext = {
      supabase: mockClient,
      userId: "user-1",
      accountId: "acc-1",
      role: "owner",
      account: {
        id: "acc-1",
        name: "Empresa Teste",
        subscription_status: "active",
        scheduled_deletion_at: null,
      },
    };

    expect(() => checkAccountAccess(ctx)).not.toThrow();
    expect(() => checkAccountAccess(ctx, { isWriteOperation: true })).not.toThrow();
  });

  it("bloqueia mutações de escrita quando a conta estiver em modo read_only (Estágio 3)", () => {
    const ctx: AccountContext = {
      supabase: mockClient,
      userId: "user-1",
      accountId: "acc-1",
      role: "owner",
      account: {
        id: "acc-1",
        name: "Empresa Teste",
        subscription_status: "read_only",
        scheduled_deletion_at: null,
      },
    };

    // Operações de leitura continuam liberadas
    expect(() => checkAccountAccess(ctx)).not.toThrow();

    // Operações de escrita são bloqueadas com ForbiddenError
    expect(() => checkAccountAccess(ctx, { isWriteOperation: true })).toThrow(ForbiddenError);
  });

  it("bloqueia todo acesso quando a conta estiver suspensa por inadimplência (Estágio 4)", () => {
    const ctx: AccountContext = {
      supabase: mockClient,
      userId: "user-1",
      accountId: "acc-1",
      role: "owner",
      account: {
        id: "acc-1",
        name: "Empresa Teste",
        subscription_status: "suspended",
        scheduled_deletion_at: null,
      },
    };

    expect(() => checkAccountAccess(ctx)).toThrow(ForbiddenError);
  });

  it("bloqueia todo acesso quando a conta estiver agendada para exclusão (carência 90 dias com opção A)", () => {
    const ctx: AccountContext = {
      supabase: mockClient,
      userId: "user-1",
      accountId: "acc-1",
      role: "owner",
      account: {
        id: "acc-1",
        name: "Empresa Teste",
        subscription_status: "canceled",
        scheduled_deletion_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };

    expect(() => checkAccountAccess(ctx)).toThrow(ForbiddenError);
  });

  it("bloqueia todo acesso quando a conta estiver agendada para exclusão (carência 90 dias com opção A)", () => {
    const ctx: AccountContext = {
      supabase: mockClient,
      userId: "user-1",
      accountId: "acc-1",
      role: "owner",
      account: {
        id: "acc-1",
        name: "Empresa Teste",
        subscription_status: "canceled",
        scheduled_deletion_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };

    expect(() => checkAccountAccess(ctx)).toThrow(ForbiddenError);
  });
});

describe("assertAccountOperationalAccess Helper", () => {
  it("lança erro se accountId for vazia", async () => {
    const { assertAccountOperationalAccess } = await import("@/lib/auth/account");
    await expect(assertAccountOperationalAccess("")).rejects.toThrow();
  });

  it("valida status da conta via cliente Supabase mockado", async () => {
    const { assertAccountOperationalAccess } = await import("@/lib/auth/account");

    const mockClientActive = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { subscription_status: "active", scheduled_deletion_at: null },
              error: null,
            }),
          }),
        }),
      }),
    } as any;

    await expect(
      assertAccountOperationalAccess("acc-active", { client: mockClientActive })
    ).resolves.not.toThrow();

    const mockClientSuspended = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { subscription_status: "suspended", scheduled_deletion_at: null },
              error: null,
            }),
          }),
        }),
      }),
    } as any;

    await expect(
      assertAccountOperationalAccess("acc-suspended", { client: mockClientSuspended })
    ).rejects.toThrow(ForbiddenError);
  });
});

