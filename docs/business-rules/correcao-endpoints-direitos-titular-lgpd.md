# Correção — Endpoints de Direitos do Titular (Art. 18 LGPD)

Direcionamento para corrigir a verificação de propriedade quebrada nas
rotinas de exportação, anonimização e opt-out de contatos
(`src/app/api/contacts/[id]/lgpd/route.ts` e as RPCs em
`038_lgpd_compliance.sql`). Não é uma exposição ativa hoje (o RLS de
`contacts` segura o acesso por trás), mas os endpoints que implementam os
direitos do titular estão rodando sem nenhuma verificação própria na
aplicação — e isso precisa ser corrigido nesses endpoints específicos por
serem os mais sensíveis do sistema.

---

## O problema

### 1. RPCs comparam IDs de espaços diferentes

Em `supabase/migrations/038_lgpd_compliance.sql`, tanto
`anonymize_lgpd_contact` quanto `export_lgpd_contact_data` fazem:

```sql
WHERE id = p_contact_id AND user_id = p_account_id
```

`contacts.user_id` é o ID do usuário que criou o contato
(`auth.users.id`). `p_account_id` é o ID da conta (`accounts.id`),
gerado com `gen_random_uuid()` de forma independente do
`owner_user_id` (`017_account_sharing.sql:61`). Essas duas colunas não
são comparáveis — a condição praticamente nunca é verdadeira para contas
criadas depois da migração multi-tenant (ou seja, para qualquer conta
hoje). `contacts` já tem a coluna correta para essa checagem:
`account_id` (adicionada em `017_account_sharing.sql:176`).

### 2. A rota não tem filtro de conta nenhum, nem no fallback

Em `src/app/api/contacts/[id]/lgpd/route.ts`:

- `GET` (export) e `POST` (anonimizar) chamam a RPC; como ela sempre
  falha pelo motivo acima, caem no bloco de fallback, que faz
  `.from("contacts").select(...)` / `.update(...)` filtrando **só por
  `id`**, sem `.eq("account_id", ...)`.
- `PATCH` (toggle de opt-out) nem chama a RPC — já faz o update direto,
  também sem filtro de conta.

Hoje isso é coberto pelo RLS de `contacts`
(`is_account_member(account_id)`, `017_account_sharing.sql:388`), então
não há vazamento entre contas neste momento. Mas esses três endpoints
implementam diretamente os direitos de Acesso, Portabilidade e
Eliminação (Art. 18 da LGPD) e estão sem nenhuma verificação própria na
camada de aplicação — dependem inteiramente do RLS nunca falhar. Dado que
já tivemos um caso real de policy de storage mal configurada neste
projeto, vale ter dupla camada justamente aqui.

## O que precisa ser feito

### A. Corrigir o predicado das RPCs

Trocar `user_id = p_account_id` por `account_id = p_account_id` nas duas
funções (`anonymize_lgpd_contact` e `export_lgpd_contact_data`), em uma
nova migration:

```sql
-- dentro de anonymize_lgpd_contact e export_lgpd_contact_data
IF NOT EXISTS (
  SELECT 1 FROM public.contacts
  WHERE id = p_contact_id AND account_id = p_account_id
) THEN
  RAISE EXCEPTION 'Contact not found or access denied.';
END IF;
```

Mesma troca em todas as demais referências a `c.user_id` /
`WHERE ... user_id = p_account_id` dentro dessas duas funções (o
`SELECT to_jsonb(c) ... WHERE c.id = p_contact_id AND c.user_id =
p_account_id` em `export_lgpd_contact_data` tem o mesmo problema).

### B. Adicionar filtro de conta explícito nos três handlers

Em `src/app/api/contacts/[id]/lgpd/route.ts`, nos três métodos (`GET`,
`POST`, `PATCH`), adicionar `.eq("account_id", accountId)` em toda
query/update feita direto na tabela `contacts` — tanto no bloco de
fallback do `GET`/`POST` quanto no `PATCH`, que hoje não tem filtro
nenhum. Isso vale mesmo depois da correção do item A: a RPC deixa de
falhar sempre, mas o fallback e o `PATCH` continuam existindo e precisam
ter a mesma verificação por padrão, não só depender do RLS.

## Critério de aceite

- Chamar `GET /api/contacts/:id/lgpd` para um contato de outra conta →
  deve retornar 404, não os dados do contato.
- Chamar `POST /api/contacts/:id/lgpd` (anonimizar) para um contato da
  própria conta → deve funcionar via RPC (não mais cair no fallback).
- Chamar `PATCH /api/contacts/:id/lgpd` para um contato de outra conta →
  deve retornar 404/erro, não 200.
- Fluxo normal (exportar/anonimizar/opt-out de um contato da própria
  conta) continua funcionando exatamente como antes.
