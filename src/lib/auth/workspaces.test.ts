import { describe, it, expect, vi } from "vitest";

import {
  canLeaveWorkspace,
  ensureActiveWorkspace,
  findActiveWorkspace,
  isLastWorkspace,
  leaveWorkspace,
  listWorkspaces,
  pickFallbackWorkspace,
  sortWorkspaces,
  switchWorkspace,
  toWorkspace,
  type WorkspaceRow,
} from "@/lib/auth/workspaces";
import type { Workspace } from "@/types";

function workspace(partial: Partial<Workspace> & { id: string }): Workspace {
  return {
    name: partial.id,
    role: "agent",
    is_active: false,
    subscription_status: "active",
    member_count: 1,
    joined_at: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

function rpcClient(impl: (fn: string, args?: unknown) => unknown) {
  return {
    rpc: vi.fn(async (fn: string, args?: unknown) => {
      const result = impl(fn, args);
      return result as { data: unknown; error: unknown };
    }),
  } as never;
}

describe("toWorkspace", () => {
  const row: WorkspaceRow = {
    workspace_id: "acc-1",
    workspace_name: "Empresa A",
    member_role: "admin",
    is_active: true,
    subscription_status: "past_due",
    member_count: "7",
    joined_at: "2026-03-01T12:00:00.000Z",
  };

  it("converte a linha da RPC no tipo de domínio", () => {
    expect(toWorkspace(row)).toEqual({
      id: "acc-1",
      name: "Empresa A",
      role: "admin",
      is_active: true,
      subscription_status: "past_due",
      member_count: 7,
      joined_at: "2026-03-01T12:00:00.000Z",
    });
  });

  it("descarta linha com papel desconhecido em vez de propagá-la", () => {
    expect(toWorkspace({ ...row, member_role: "superuser" })).toBeNull();
  });

  it("assume conta ativa quando o status não vem preenchido", () => {
    const parsed = toWorkspace({ ...row, subscription_status: null });
    expect(parsed?.subscription_status).toBe("active");
  });
});

describe("sortWorkspaces", () => {
  it("ordena por papel (mais alto primeiro) e desempata pelo nome", () => {
    const list = [
      workspace({ id: "c", name: "Zeta", role: "viewer" }),
      workspace({ id: "a", name: "Alfa", role: "owner" }),
      workspace({ id: "b", name: "Beta", role: "admin" }),
      workspace({ id: "d", name: "Alfa Dois", role: "admin" }),
    ];

    expect(sortWorkspaces(list).map((w) => w.id)).toEqual(["a", "d", "b", "c"]);
  });

  it("não altera o array recebido", () => {
    const list = [
      workspace({ id: "a", role: "viewer" }),
      workspace({ id: "b", role: "owner" }),
    ];
    sortWorkspaces(list);
    expect(list.map((w) => w.id)).toEqual(["a", "b"]);
  });
});

describe("pickFallbackWorkspace", () => {
  const own = workspace({
    id: "pessoal",
    role: "owner",
    joined_at: "2026-01-01T00:00:00.000Z",
  });
  const empresaA = workspace({
    id: "empresa-a",
    role: "admin",
    joined_at: "2026-02-01T00:00:00.000Z",
  });
  const empresaB = workspace({
    id: "empresa-b",
    role: "viewer",
    joined_at: "2026-03-01T00:00:00.000Z",
  });

  it("mantém o workspace atual quando a participação nele continua valendo", () => {
    expect(
      pickFallbackWorkspace([own, empresaA, empresaB], "empresa-b")?.id,
    ).toBe("empresa-b");
  });

  it("cai para um workspace próprio quando a participação atual acabou", () => {
    // Cenário: removido da Empresa A enquanto ela estava aberta. Os demais
    // workspaces continuam existindo — é para um deles que o contexto vai.
    expect(
      pickFallbackWorkspace([own, empresaB], "empresa-a")?.id,
    ).toBe("pessoal");
  });

  it("usa a participação mais antiga quando a pessoa não é dona de nenhuma", () => {
    expect(pickFallbackWorkspace([empresaB, empresaA], null)?.id).toBe(
      "empresa-a",
    );
  });

  it("devolve nulo quando não sobrou participação alguma", () => {
    expect(pickFallbackWorkspace([], "empresa-a")).toBeNull();
  });
});

describe("predicados de saída", () => {
  it("dono não sai sem transferir a titularidade", () => {
    expect(canLeaveWorkspace("owner")).toBe(false);
    expect(canLeaveWorkspace("admin")).toBe(true);
    expect(canLeaveWorkspace("agent")).toBe(true);
    expect(canLeaveWorkspace("viewer")).toBe(true);
  });

  it("reconhece a última participação", () => {
    expect(isLastWorkspace([workspace({ id: "a" })])).toBe(true);
    expect(
      isLastWorkspace([workspace({ id: "a" }), workspace({ id: "b" })]),
    ).toBe(false);
  });

  it("encontra o workspace ativo da lista", () => {
    const list = [
      workspace({ id: "a" }),
      workspace({ id: "b", is_active: true }),
    ];
    expect(findActiveWorkspace(list)?.id).toBe("b");
    expect(findActiveWorkspace([workspace({ id: "a" })])).toBeNull();
  });
});

describe("invólucros das RPCs", () => {
  it("listWorkspaces descarta linhas inválidas e converte o resto", async () => {
    const client = rpcClient(() => ({
      data: [
        {
          workspace_id: "acc-1",
          workspace_name: "Pessoal",
          member_role: "owner",
          is_active: true,
          subscription_status: "active",
          member_count: 1,
          joined_at: "2026-01-01T00:00:00.000Z",
        },
        {
          workspace_id: "acc-2",
          workspace_name: "Quebrado",
          member_role: "papel-inexistente",
          is_active: false,
          subscription_status: "active",
          member_count: 3,
          joined_at: "2026-01-02T00:00:00.000Z",
        },
      ],
      error: null,
    }));

    const workspaces = await listWorkspaces(client);
    expect(workspaces.map((w) => w.id)).toEqual(["acc-1"]);
  });

  it("switchWorkspace apenas encaminha o pedido — quem valida é o banco", async () => {
    const client = rpcClient((fn, args) => {
      expect(fn).toBe("switch_active_workspace");
      expect(args).toEqual({ p_account_id: "empresa-a" });
      return { data: "empresa-a", error: null };
    });

    await expect(switchWorkspace(client, "empresa-a")).resolves.toBe(
      "empresa-a",
    );
  });

  it("switchWorkspace propaga a recusa de workspace do qual não se participa", async () => {
    // 42501 é a recusa que `switch_active_workspace` levanta quando não existe
    // participação ativa. O cliente não pode transformar isso em sucesso.
    const client = rpcClient(() => ({
      data: null,
      error: { code: "42501", message: "You do not have access to this workspace" },
    }));

    await expect(switchWorkspace(client, "workspace-alheio")).rejects.toMatchObject(
      { code: "42501" },
    );
  });

  it("leaveWorkspace devolve o novo contexto, e nulo quando não sobrou nenhum", async () => {
    await expect(
      leaveWorkspace(
        rpcClient(() => ({ data: "pessoal", error: null })),
        "empresa-a",
      ),
    ).resolves.toBe("pessoal");

    await expect(
      leaveWorkspace(
        rpcClient(() => ({ data: null, error: null })),
        "empresa-a",
      ),
    ).resolves.toBeNull();
  });

  it("ensureActiveWorkspace repara o contexto e devolve o escolhido", async () => {
    const client = rpcClient((fn) => {
      expect(fn).toBe("ensure_active_workspace");
      return { data: "pessoal", error: null };
    });
    await expect(ensureActiveWorkspace(client)).resolves.toBe("pessoal");
  });
});
