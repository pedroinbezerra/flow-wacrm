// ============================================================
// Invariantes de tenancy verificadas sobre a migração.
//
// Por que testar SQL como texto
// -----------------------------
// As garantias mais importantes desta mudança vivem no banco: aceitar
// convite não apaga conta, excluir workspace não apaga perfil, cliente
// não escreve participação, `is_account_member` continua entregando um
// tenant por vez. O projeto não tem harness de Postgres nos testes
// (Vitest roda em `node`, sem banco), então a alternativa a verificar
// isso aqui é não verificar em lugar nenhum.
//
// Estes testes não substituem execução real da migração. Eles impedem o
// tipo de regressão que passaria despercebida em revisão: alguém
// reintroduzir um `DELETE FROM accounts` no caminho de convite, ou
// afrouxar o predicado que isola o workspace ativo.
// ============================================================

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const MIGRATION_FILE = "070_multi_workspace_memberships.sql";
const sql = readFileSync(join(migrationsDir, MIGRATION_FILE), "utf8");

/**
 * Lista de parâmetros de uma função, normalizada para comparação. Usa a ÚLTIMA
 * definição do arquivo, que é a que vale ao fim da migração. Devolve `null`
 * quando o arquivo não define a função.
 */
function paramList(source: string, name: string): string | null {
  const marker = `CREATE OR REPLACE FUNCTION public.${name}(`;
  let open = -1;
  for (let i = source.indexOf(marker); i >= 0; i = source.indexOf(marker, i + 1)) {
    open = i + marker.length - 1;
  }
  if (open < 0) return null;
  const returnsAt = source.indexOf("RETURNS", open);
  const close = source.lastIndexOf(")", returnsAt);
  return source
    .slice(open + 1, close)
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

/** Tipo de retorno declarado na última definição da função no arquivo. */
function returnType(source: string, name: string): string | null {
  const marker = `CREATE OR REPLACE FUNCTION public.${name}(`;
  let at = -1;
  for (let i = source.indexOf(marker); i >= 0; i = source.indexOf(marker, i + 1)) {
    at = i;
  }
  if (at < 0) return null;
  const returnsAt = source.indexOf("RETURNS", at);
  const lineEnd = source.indexOf("\n", returnsAt);
  return source
    .slice(returnsAt + "RETURNS".length, lineEnd)
    .split("--")[0]
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

/** Corpo de uma função da migração, entre o CREATE e o `$$;` que a fecha. */
function functionBody(name: string): string {
  const start = sql.indexOf(`CREATE OR REPLACE FUNCTION public.${name}(`);
  expect(start, `função ${name} não encontrada na migração`).toBeGreaterThan(-1);
  const end = sql.indexOf("\n$$;", start);
  expect(end, `fim da função ${name} não encontrado`).toBeGreaterThan(start);
  return sql.slice(start, end);
}

describe("aceitar convite nunca destrói outro workspace", () => {
  const redeem = functionBody("redeem_invitation");

  it("não apaga conta alguma", () => {
    expect(redeem).not.toMatch(/DELETE\s+FROM\s+accounts/i);
  });

  it("não move o perfil para fora de nada — cria participação", () => {
    expect(redeem).toMatch(/INSERT INTO account_memberships/);
  });

  it("abandonou a heurística de conta vazia", () => {
    // As duas recusas do modelo antigo: "sua conta tem dados" e "você já está
    // em outra conta compartilhada". Nenhuma das duas é obstáculo agora.
    expect(sql).not.toMatch(/already contains data/i);
    expect(sql).not.toMatch(/already in a shared account/i);
    // E a lista fixa de tabelas que definia "vazia" não sobreviveu.
    expect(redeem).not.toMatch(/FROM contacts WHERE account_id/);
  });

  it("recusa apenas quem já participa daquele workspace", () => {
    expect(redeem).toMatch(/already a member of this account/i);
    expect(redeem).toMatch(/ERRCODE = '23505'/);
  });
});

describe("remover e sair afetam apenas a participação", () => {
  it("remover não fabrica conta pessoal nem apaga workspace", () => {
    const remove = functionBody("remove_account_member");
    expect(remove).not.toMatch(/INSERT INTO accounts/i);
    expect(remove).not.toMatch(/DELETE\s+FROM\s+accounts/i);
    expect(remove).toMatch(/status = 'revoked'/);
  });

  it("sair existe, é do próprio usuário e exige transferir a titularidade antes", () => {
    const leave = functionBody("leave_account");
    expect(leave).toMatch(/user_id = auth\.uid\(\)/);
    expect(leave).toMatch(/Transfer ownership before leaving/i);
    expect(leave).not.toMatch(/DELETE\s+FROM\s+accounts/i);
  });
});

describe("integridade estrutural", () => {
  it("excluir workspace não apaga mais o perfil de ninguém", () => {
    expect(sql).toMatch(
      /ADD CONSTRAINT profiles_account_id_fkey[\s\S]*?REFERENCES public\.accounts\(id\) ON DELETE SET NULL/,
    );
  });

  it("deixa de existir a trava de um workspace por pessoa", () => {
    expect(sql).toMatch(/DROP INDEX IF EXISTS idx_accounts_one_per_owner/);
  });

  it("garante exatamente um dono ativo por workspace", () => {
    expect(sql).toMatch(
      /CREATE UNIQUE INDEX IF NOT EXISTS idx_account_memberships_single_owner[\s\S]*?WHERE role = 'owner' AND status = 'active'/,
    );
  });

  it("preserva ownership e papéis existentes no backfill", () => {
    expect(sql).toMatch(
      /INSERT INTO public\.account_memberships[\s\S]*?FROM public\.profiles p/,
    );
    expect(sql).toMatch(/ON CONFLICT \(account_id, user_id\) DO NOTHING/);
  });
});

describe("isolamento entre tenants", () => {
  const isMember = functionBody("is_account_member");

  it("continua entregando um tenant por vez: participação E workspace ativo", () => {
    expect(isMember).toMatch(/active_account_id\(\)/);
    expect(isMember).toMatch(/has_account_membership\(target_account_id, min_role\)/);
  });

  it("mantém a assinatura que as políticas de 017…064 já chamam", () => {
    expect(sql).toMatch(
      /CREATE OR REPLACE FUNCTION public\.is_account_member\(\s*target_account_id UUID,\s*min_role account_role_enum DEFAULT 'viewer'\s*\)/,
    );
  });

  it("a troca de contexto valida participação no banco", () => {
    const switchFn = functionBody("switch_active_workspace");
    expect(switchFn).toMatch(/FROM account_memberships/);
    expect(switchFn).toMatch(/status = 'active'/);
    expect(switchFn).toMatch(/do not have access to this workspace/i);
  });

  it("cliente não escreve participação: só há política de leitura", () => {
    const policies = sql.match(/CREATE POLICY \w+ ON public\.account_memberships[\s\S]*?;/g) ?? [];
    expect(policies.length).toBeGreaterThan(0);
    for (const policy of policies) {
      expect(policy).toMatch(/FOR SELECT/);
    }
  });

  it("redefinição de função existente preserva a assinatura anterior", () => {
    // `CREATE OR REPLACE` não altera assinatura: renomear parâmetro, trocar
    // tipo ou — o caso que quebrou este push — remover um `DEFAULT` faz o
    // Postgres recusar com 42P13 no meio da migração. Como várias funções aqui
    // são reescritas (só o corpo muda), a lista de parâmetros tem de bater
    // exatamente com a última definição anterior.
    const earlier = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql") && f < MIGRATION_FILE)
      .sort();

    const redefined = [
      ...sql.matchAll(/CREATE OR REPLACE FUNCTION public\.(\w+)\(/g),
    ].map((m) => m[1]);
    expect(redefined.length).toBeGreaterThan(5);

    let compared = 0;
    for (const name of new Set(redefined)) {
      let previous: string | null = null;
      for (const file of earlier) {
        const found = paramList(
          readFileSync(join(migrationsDir, file), "utf8"),
          name,
        );
        if (found !== null) previous = found;
      }
      if (previous === null) continue; // função nova: nada a preservar
      compared += 1;
      expect(paramList(sql, name), `assinatura de ${name}`).toBe(previous);

      // Trocar o tipo de retorno cai no mesmo 42P13.
      let previousReturn: string | null = null;
      for (const file of earlier) {
        const found = returnType(
          readFileSync(join(migrationsDir, file), "utf8"),
          name,
        );
        if (found !== null) previousReturn = found;
      }
      expect(returnType(sql, name), `retorno de ${name}`).toBe(previousReturn);
    }

    // Guarda contra o teste passar por não ter comparado nada.
    expect(compared).toBeGreaterThan(3);
  });

  it("toda função nova fixa o search_path", () => {
    const created = sql.match(/CREATE OR REPLACE FUNCTION public\.(\w+)\(/g) ?? [];
    expect(created.length).toBeGreaterThan(5);
    for (const decl of created) {
      const name = decl.replace("CREATE OR REPLACE FUNCTION public.", "").replace("(", "");
      if (name === "account_role_rank") continue; // IMMUTABLE puro, sem acesso a tabela
      expect(functionBody(name), name).toMatch(/SET search_path = public/);
    }
  });
});
