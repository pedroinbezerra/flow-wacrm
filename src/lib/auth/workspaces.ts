// ============================================================
// Workspaces — a identidade e seus contextos de trabalho.
//
// Uma identidade participa de vários workspaces (`account_memberships`)
// e trabalha em um de cada vez (o workspace ativo). Este módulo é a
// camada TypeScript dessa ideia:
//
//   - funções puras (ordenação, escolha de fallback, predicados de
//     papel) — testáveis sem banco e sem rede;
//   - invólucros finos sobre as RPCs, que recebem o cliente Supabase
//     por parâmetro para o módulo continuar importável em teste.
//
// REGRA DE SEGURANÇA QUE ATRAVESSA O ARQUIVO INTEIRO
// --------------------------------------------------
// Nada aqui autoriza coisa alguma. O identificador de workspace que
// chega do cliente é apenas um pedido; quem decide é
// `switch_active_workspace` no banco, que confirma participação ativa
// antes de gravar o contexto. Nenhuma função deste módulo deve ser
// usada como se fosse a checagem de acesso.
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";

import { isAccountRole, roleRank, type AccountRole } from "./roles";
import type { SubscriptionStatus, Workspace } from "@/types";

/** Linha crua devolvida por `list_my_workspaces()` (migração 070). */
export interface WorkspaceRow {
  workspace_id: string;
  workspace_name: string | null;
  member_role: string;
  is_active: boolean;
  subscription_status: string | null;
  member_count: number | string | null;
  joined_at: string;
}

/**
 * Converte uma linha da RPC no tipo de domínio. Devolve `null` para
 * linha com papel desconhecido — mesma postura defensiva de
 * `getCurrentAccount`: se uma migração futura ampliar o enum sem
 * atualizar o TypeScript, o workspace some do seletor em vez de
 * derrubar a aplicação inteira.
 */
export function toWorkspace(row: WorkspaceRow): Workspace | null {
  if (!isAccountRole(row.member_role)) return null;
  return {
    id: row.workspace_id,
    name: row.workspace_name ?? "",
    role: row.member_role,
    is_active: !!row.is_active,
    subscription_status: (row.subscription_status ??
      "active") as SubscriptionStatus,
    member_count: Number(row.member_count ?? 0),
    joined_at: row.joined_at,
  };
}

/**
 * Ordem de exibição do seletor: papel mais alto primeiro, nome como
 * desempate. Espelha o `ORDER BY` de `list_my_workspaces()` para que a
 * lista não mude de ordem entre o que veio do banco e o que a
 * interface mostra depois de um filtro local.
 */
export function sortWorkspaces(workspaces: readonly Workspace[]): Workspace[] {
  return [...workspaces].sort((a, b) => {
    const byRole = roleRank(b.role) - roleRank(a.role);
    if (byRole !== 0) return byRole;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

/**
 * Escolhe um workspace ativo válido a partir da lista de participações.
 * Espelha `repoint_active_workspace()` no banco: mantém o atual se ele
 * ainda constar entre as participações, senão prefere um que a pessoa
 * possui, e cai para a participação mais antiga.
 *
 * Devolve `null` quando não sobrou nenhuma — estado real e previsto
 * (participação removida enquanto aquele workspace estava aberto).
 */
export function pickFallbackWorkspace(
  workspaces: readonly Workspace[],
  currentId: string | null,
): Workspace | null {
  if (workspaces.length === 0) return null;

  if (currentId) {
    const current = workspaces.find((w) => w.id === currentId);
    if (current) return current;
  }

  const owned = workspaces.filter((w) => w.role === "owner");
  const pool = owned.length > 0 ? owned : workspaces;

  return [...pool].sort(
    (a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime(),
  )[0];
}

/** O workspace marcado como ativo, se a lista trouxer algum. */
export function findActiveWorkspace(
  workspaces: readonly Workspace[],
): Workspace | null {
  return workspaces.find((w) => w.is_active) ?? null;
}

/**
 * Dono não sai sozinho: sair deixaria o workspace sem titular, e a
 * invariante `um dono ativo por workspace` é garantida por índice no
 * banco. A transferência de titularidade vem antes.
 *
 * Este predicado existe para a interface poder explicar o motivo antes
 * do clique; a recusa de verdade acontece em `leave_account()`.
 */
export function canLeaveWorkspace(role: AccountRole): boolean {
  return role !== "owner";
}

/**
 * Última participação da pessoa: sair dela a deixaria sem contexto
 * algum. A interface avisa; o banco aceita (estado sem workspace ativo
 * é representável e reparável), então isto é orientação, não trava.
 */
export function isLastWorkspace(workspaces: readonly Workspace[]): boolean {
  return workspaces.length <= 1;
}

// ------------------------------------------------------------
// Invólucros das RPCs
//
// Recebem o cliente por parâmetro: a rota decide se ele é o cliente
// SSR do usuário (RLS aplicada) ou outro. Nenhum deles aceita
// `user_id` — todos operam sobre `auth.uid()` no banco.
// ------------------------------------------------------------

/** Workspaces dos quais a identidade autenticada participa. */
export async function listWorkspaces(
  supabase: SupabaseClient,
): Promise<Workspace[]> {
  const { data, error } = await supabase.rpc("list_my_workspaces");
  if (error) throw error;
  return ((data ?? []) as WorkspaceRow[]).flatMap((row) => {
    const workspace = toWorkspace(row);
    return workspace ? [workspace] : [];
  });
}

/**
 * Troca o contexto operacional. O banco confirma a participação antes
 * de gravar; um identificador de workspace do qual a pessoa não
 * participa volta como erro 42501, nunca como troca silenciosa.
 */
export async function switchWorkspace(
  supabase: SupabaseClient,
  accountId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("switch_active_workspace", {
    p_account_id: accountId,
  });
  if (error) throw error;
  return data as string;
}

/** Encerra a própria participação. Devolve o novo workspace ativo (ou `null`). */
export async function leaveWorkspace(
  supabase: SupabaseClient,
  accountId: string,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("leave_account", {
    p_account_id: accountId,
  });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/**
 * Repara um contexto ausente ou obsoleto — perfil sem workspace ativo,
 * ou apontando para um workspace de onde a participação foi encerrada.
 * Devolve o workspace escolhido, ou `null` quando não há nenhum.
 */
export async function ensureActiveWorkspace(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("ensure_active_workspace");
  if (error) throw error;
  return (data as string | null) ?? null;
}
