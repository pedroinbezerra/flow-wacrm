# Tenancy multi-workspace — uma identidade, vários contextos de trabalho

> Como o FlowHub deixou de assumir "um usuário = uma conta" e passou a
> representar a realidade do produto: a mesma pessoa participa de vários
> workspaces, com papel diferente em cada um, sem que entrar em um destrua
> qualquer outro.

| Campo | Valor |
| --- | --- |
| Migration | `supabase/migrations/070_multi_workspace_memberships.sql` |
| Entidade nova | `account_memberships` (interface: *participação*; código: *membership*) |
| Módulos | `src/lib/auth/{account,workspaces,roles}.ts`, `src/hooks/use-auth.tsx`, `src/components/layout/workspace-switcher.tsx` |
| Endpoints | `GET /api/account/workspaces`, `POST /api/account/workspaces/switch`, `POST /api/account/workspaces/leave` |
| Artigos aplicados | `FH-10.01`, `FH-10.06`, `FH-10.02`, `FH-19.03`, `FH-21.01`, `FH-21.03`, `FH-21.04`, `FH-21.05` |

---

## 1. O problema

O modelo anterior (migração `017_account_sharing.sql`) guardava a associação
usuário↔conta em duas colunas do perfil:

```
profiles.account_id     -- a única conta do usuário
profiles.account_role   -- o único papel do usuário
```

reforçadas por `idx_accounts_one_per_owner`, índice **único** sobre
`accounts(owner_user_id)`.

Como o e-mail identifica uma única identidade em `auth.users`, isso significava
que a mesma pessoa **não podia** ao mesmo tempo ter sua própria conta e
participar da conta de uma empresa. O fluxo de convite contornava a limitação
movendo o perfil de uma conta para outra e **apagando a conta anterior**,
guardado por uma heurística de "conta vazia".

Essa heurística tinha duas falhas graves, ambas confirmadas na leitura de
`019_invitation_rpcs.sql`:

1. **Conta "vazia" com membros dentro.** A verificação exigia que o chamador
   fosse dono e que não houvesse linhas nas 11 tabelas de domínio de 2017 — mas
   nunca verificou se existiam **outros perfis** na conta. Como
   `profiles.account_id` referenciava `accounts(id) ON DELETE CASCADE`, o
   `DELETE FROM accounts` no fim do resgate apagava os perfis dos colegas.
2. **Definição de "vazia" defasada.** De `027` em diante entraram
   `subscriptions`, `account_addons`, `invoices`, quadros de conversa,
   configuração de IA, integrações e outras tabelas com `account_id ... ON
   DELETE CASCADE` que a lista fixa nunca passou a considerar. Uma conta com
   assinatura ativa e faturas emitidas era classificada como vazia.

A decisão não foi refinar a heurística. Foi **eliminar a necessidade dela**.

---

## 2. Premissa nova

> Uma identidade participa de múltiplos workspaces. Aceitar, sair ou ser
> removido de um workspace **jamais** altera ou destrói outro workspace do qual
> essa identidade participe. (`FH-10.01`, `FH-10.06`)

Consequências diretas:

- Aceitar convite **cria uma participação**; nunca move, nunca apaga.
- Sair de um workspace **encerra uma participação**; não destrói tenant.
- Excluir um workspace é operação explícita, autorizada e separada
  (`FH-19.03`).
- Papel é **contextual ao workspace**, nunca atributo global da pessoa.

---

## 3. Modelo de dados

### 3.1 A entidade `account_memberships` (`FH-21.01`)

| Campo | Definição |
| --- | --- |
| `account_id` | Workspace ao qual a participação pertence. `ON DELETE CASCADE` — apagar o workspace encerra as participações nele, e só nele. |
| `user_id` | Identidade participante. `ON DELETE CASCADE` sobre `auth.users`. |
| `role` | `owner` \| `admin` \| `agent` \| `viewer` — papel **naquele** workspace. |
| `status` | `active` \| `revoked`. Estado declarado, nunca implícito (`FH-21.04`). |
| `joined_at` | Quando a participação passou a valer (renovado em rejunção). |
| `invited_by_user_id`, `invitation_id` | Procedência da participação, para auditoria. |
| `revoked_at`, `revoked_by_user_id` | Encerramento, para auditoria. |

Chave natural: `UNIQUE (account_id, user_id)` — uma linha por par, e rejunção
reativa a linha existente em vez de duplicar histórico.

Invariante estrutural: `UNIQUE (account_id) WHERE role = 'owner' AND status =
'active'` — todo workspace tem **exatamente um** dono ativo.

Transições declaradas (`FH-21.04`):

```
(inexistente) --aceite de convite--> active
active        --remoção pelo admin--> revoked
active        --saída voluntária----> revoked
revoked       --novo convite aceito-> active
active        --transferência-------> active (role muda)
```

### 3.2 `profiles.account_id` muda de significado

A coluna **não é mais** "a conta do usuário". Passa a ser **o workspace
ativo** — o contexto operacional que a sessão daquela identidade está usando
agora. `profiles.account_role` passa a ser o **espelho** do papel na
participação ativa, mantido por gatilho, existente para compatibilidade de
leitura durante o rollout.

Essa escolha é deliberada e é o que torna a evolução segura:

- as ~70 leituras de `profiles.account_id` espalhadas pelo código continuam
  perguntando a coisa certa ("qual é o meu tenant agora?");
- as políticas RLS que hoje isolam o tenant continuam isolando **um** tenant
  por vez, e não passam a devolver a união dos workspaces da pessoa — o que
  seria a regressão de isolamento mais provável desta mudança (`FH-10.06`);
- o workspace ativo mora no banco, não em um cabeçalho ou cookie enviado pelo
  cliente. Trocar de workspace é uma chamada autenticada que **valida
  participação** antes de gravar.

Ajustes de integridade que acompanham a mudança de significado:

- FK `profiles.account_id → accounts(id)` passa de `ON DELETE CASCADE` para
  `ON DELETE SET NULL`. Apagar um workspace nunca mais apaga o perfil de
  ninguém — esse era exatamente o caminho do bug 1.
- `profiles.account_id` e `profiles.account_role` deixam de ser `NOT NULL`:
  "sem workspace ativo" é um estado real e representável, reparado sob demanda
  por `ensure_active_workspace()`.

### 3.3 `accounts`

- `idx_accounts_one_per_owner` (único) é **removido** — ele proibia
  literalmente a premissa nova. No lugar entra um índice comum sobre
  `owner_user_id`, e a unicidade de dono passa a ser garantida onde ela de fato
  pertence: no índice parcial de `account_memberships`.
- `accounts.owner_user_id` permanece como ponteiro desnormalizado do dono,
  mantido em sincronia por `transfer_account_ownership`.

---

## 4. Autorização

Três predicados no banco, com responsabilidades distintas:

| Função | Pergunta que responde | Onde é usada |
| --- | --- | --- |
| `has_account_membership(account_id, min_role)` | "Participo deste workspace, com pelo menos este papel?" | leitura da lista de workspaces, troca de contexto, `accounts_select` |
| `active_account_id()` | "Qual é o meu workspace ativo?" | interno |
| `is_account_member(account_id, min_role)` | "Participo **e** este é meu workspace ativo?" | todas as políticas RLS de dado operacional |

`is_account_member` mantém assinatura e nome — as ~120 políticas escritas em
`017`…`064` continuam válidas sem reescrita, e continuam significando o que
significavam: *o usuário só enxerga e só escreve no tenant em que está
trabalhando*. O que mudou é a fonte da verdade por trás dela: participação, não
mais a coluna do perfil.

`shares_active_account_with(user_id)` substitui o antigo predicado de
`profiles_select`, que comparava `profiles.account_id` — inválido agora que essa
coluna aponta para o workspace ativo de **cada** pessoa, e não para o vínculo.
Sem essa troca, o roster de membros, as menções, a barra de participantes e o
seletor de responsável do negócio deixariam de enxergar colegas cujo workspace
ativo é outro.

---

## 5. Operações (RPCs)

| RPC | Comportamento novo |
| --- | --- |
| `handle_new_user` | Cria o workspace pessoal, o perfil e a **participação de dono**. O workspace pessoal continua existindo — ele é apenas mais um workspace, e não impede participações adicionais. |
| `redeem_invitation` | Cria (ou reativa) a participação, marca o convite como aceito e **torna o workspace convidante o ativo**. Não move nada. Não apaga nada. A heurística de conta vazia deixou de existir. |
| `remove_account_member` | Encerra **apenas** a participação correspondente. Não cria conta pessoal artificial. Se aquele era o workspace ativo do removido, o contexto dele é repontado para outra participação sua. |
| `leave_account` | Saída voluntária, mesma semântica. Dono precisa transferir a titularidade antes. |
| `set_member_role` | Altera o papel na participação daquele workspace. |
| `transfer_account_ownership` | Troca os papéis nas duas participações e atualiza `accounts.owner_user_id`. |
| `switch_active_workspace` | Valida participação ativa e grava o novo contexto. É o único caminho de troca. |
| `list_my_workspaces` | Devolve os workspaces da identidade com papel e qual está ativo. |
| `ensure_active_workspace` | Repara um contexto ausente ou obsoleto escolhendo uma participação ativa (preferindo a que a pessoa possui). |

---

## 6. Invariantes

1. Toda participação ativa aponta para um workspace existente.
2. Todo workspace tem exatamente um dono ativo.
3. O workspace ativo de uma identidade é sempre um workspace do qual ela
   participa — ou nulo.
4. Nenhuma operação de participação apaga `accounts`.
5. Nenhuma exclusão de `accounts` apaga `profiles`.
6. Dado de domínio só é legível/gravável dentro do workspace ativo
   (`FH-10.06`).
7. Papel é sempre lido no contexto de um workspace.

---

## 7. Riscos e regressões vigiadas

| Risco | Mitigação |
| --- | --- |
| RLS passar a devolver a união dos workspaces | `is_account_member` continua escopada ao workspace ativo; nenhuma política foi afrouxada para "qualquer participação" exceto `accounts_select`, que expõe apenas nome/estado de workspaces dos quais a pessoa participa. |
| Consultas que enumeram membros por `profiles.account_id` | Reescritas para `account_memberships` (roster, limite de assentos, notificações de menção, analítica de jornada, expurgo). |
| Expurgo de conta apagando identidades compartilhadas | O cron de expurgo só remove a identidade em `auth.users` quando ela não tem **nenhuma outra participação ativa**. |
| Troca de workspace com várias abas abertas | O contexto é servidor-autoritativo; a troca recarrega o app. Abas antigas passam a ler o novo contexto na próxima consulta — comportamento previsível, sem estado divergente por aba. |
| Participação revogada com o workspace aberto | O contexto é repontado no banco no momento da revogação; a aba afetada perde o acesso na próxima leitura e cai no estado "sem workspace", reparável. |

---

## 8. Nome canônico (`FH-21.02`, `FH-21.09`)

| Camada | Termo |
| --- | --- |
| Interface (pt-BR) | **espaço de trabalho** |
| Código / banco | **workspace** (`account_memberships`, `switch_active_workspace`, `list_my_workspaces`) |
| Entidade persistida | `accounts` — o nome da tabela permanece; renomeá-la seria uma migração destrutiva sem ganho para quem usa |

"Ambiente" foi descartado como termo de interface: a copy do produto já o usa em
sentido genérico ("um único ambiente", "seu ambiente está 100% configurado"), e
reaproveitá-lo criaria ambiguidade justamente onde a distinção precisa ser
nítida. "Conta" também foi descartado porque a mesma palavra já nomeia o login
nas telas de autenticação ("já tenho uma conta") — era essa colisão que tornava
o modelo antigo confuso de explicar.

**Dívida declarada.** As telas anteriores a esta mudança ainda dizem "conta"
onde hoje se lê "espaço de trabalho" (roster de membros, convites,
configurações). Um terceiro termo não foi criado — o que existe é copy legada
pendente de migração. A troca dessas strings é um ciclo próprio de revisão de
texto, não um efeito colateral desta mudança de arquitetura.

## 9. Migração de dados

Não destrutiva, idempotente e em uma única transação:

1. Cria `account_memberships`.
2. Para cada `profiles` com `account_id` e `account_role`, insere a participação
   equivalente (`status = 'active'`, `joined_at = profiles.created_at`).
   Ownership e papéis existentes são preservados exatamente como estão.
3. Garante participação de dono para todo `accounts.owner_user_id` que porventura
   não tenha perfil apontando para a conta.
4. Só então troca predicados, FKs e RPCs.

Colunas antigas **permanecem** e continuam preenchidas — é o que permite rollout
progressivo: qualquer código ainda não migrado continua lendo
`profiles.account_id` e obtém o workspace ativo, que para todo usuário
pré-existente é exatamente a conta que ele já tinha.
