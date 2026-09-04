# Architecture Decision Records (ADR) — FlowHub

Este documento registra as **decisões de arquitetura fundamentais** do FlowHub, seu contexto, justificativas técnicas e consequências. Ele serve como registro histórico permanente para garantir que a memória técnica do produto sobreviva ao crescimento do time e do código.

---

## Índice de Decisões

| ID | Título | Status | Data |
|---|---|---|---|
| **ADR-001** | Tabela `messages` nasce particionada por RANGE | Aceito | 2026-08-07 |
| **ADR-002** | Pattern Outbox no Postgres em vez de Redis Streams | Aceito | 2026-08-07 |
| **ADR-003** | Omissão de `account_id` redundante na tabela `messages` | Aceito | 2026-08-07 |
| **ADR-004** | Utilização de `pg_trgm` + `unaccent()` em vez de FTS/Elasticsearch | Aceito | 2026-08-07 |
| **ADR-005** | Consolidação de migrações históricas em um Schema Baseline Único | Aceito | 2026-08-07 |
| **ADR-006** | Remoção de Foreign Keys declarativas para a tabela particionada `messages` | Aceito | 2026-08-07 |
| **ADR-007** | Fortalecimento de Segurança de Senhas (Complexidade + HIBP) e Proteção hCaptcha | Aceito | 2026-08-11 |
| **ADR-008** | Participação N:N (`account_memberships`) e workspace ativo no perfil | Aceito | 2026-09-04 |

---

## ADR-001: Tabela `messages` nasce particionada por RANGE em `created_at`

### Status
**Aceito**

### Contexto
O FlowHub é um CRM de atendimento via WhatsApp projetado para processar centenas de milhões a bilhões de mensagens ao longo do tempo. Migrar uma tabela com 500 milhões de registros para uma estrutura particionada em produção exige projetos complexos de semanas com alto risco de I/O e downtime. Como o sistema está em fase pré-produção com banco vazio, a decisão de particionamento deve ser tomada antecipadamente.

### Decisão
A tabela `messages` será criada com particionamento nativo por RANGE na coluna `created_at` desde a migração inicial (`001_core_schema.sql`). O gerenciamento de partições mensais futuras será automatizado pela extensão `pg_partman` combinada com `pg_cron`.

### Consequências
- **Positivas**:
  - Custo de implementação inicial é virtualmente zero (apenas DDL).
  - Elimina a necessidade de projetos futuros de migração pesada de dados.
  - Queries temporais utilizam *partition pruning* nativo do PostgreSQL, mantendo performance constante independente do volume histórico total.
  - Remoção de mensagens antigas por política de retenção torna-se instantânea (`DROP PARTITION` em vez de `DELETE` + `VACUUM`).
- **Negativas / Trade-offs**:
  - A PRIMARY KEY da tabela obrigatoriamente inclui a coluna de partição: `PRIMARY KEY (id, created_at)`.
  - Impedimento de Foreign Keys declarativas apontando exclusivamente para `messages.id`. A integridade referencial com tabelas filhas (`message_reactions`, `conversation_mentions`) é gerenciada na camada de aplicação e RPCs.

---

## ADR-002: Pattern Outbox no Postgres em vez de Redis Streams como Barramento

### Status
**Aceito**

### Contexto
O Webhook do WhatsApp exige respostas `HTTP 200 OK` do servidor em menos de 5 segundos. O processamento síncrono atual executa chamadas de IA (OpenAI), motores de fluxo e automações no caminho principal, gerando latências de 2–15s e risco de timeout e retry storms da Meta.

Foi avaliada a introdução de um barramento de eventos completo usando **Upstash Redis Streams** (`XADD`/`XREADGROUP`).

### Decisão
Descartamos o Redis Streams como barramento principal e adotamos o **Transactional Outbox Pattern** nativo no PostgreSQL via tabela `inbound_webhooks`. O webhook persiste o payload recebido e responde `200 OK` em < 50ms. A execução assíncrona é disparada via `next/server after()` ou Upstash QStash, e um job `pg_cron` atua como *safety net* para reprocessar falhas.

### Consequências
- **Positivas**:
  - Compatibilidade 100% com a arquitetura Serverless da Vercel (sem necessidade de manter daemons/workers long-polling rodando 24/7).
  - Confiabilidade atômica: a gravação do evento no banco é transacional.
  - Zero custo de infraestrutura adicional ou ferramentas de mensageria complexas.
- **Negativas / Trade-offs**:
  - O banco de dados lida com gravações e atualizações de status de tarefas assíncronas, exigindo limpeza periódica de eventos concluídos via `pg_cron`.

---

## ADR-003: Omissão de `account_id` redundante na tabela `messages`

### Status
**Aceito**

### Contexto
Para garantir isolamento multi-tenant (RLS), o padrão adotado no projeto é a inclusão da coluna `account_id` nas tabelas principais. No entanto, em uma tabela com 2 bilhões de mensagens, adicionar `account_id` em cada linha (mais o índice correspondente) consome entre 16GB e 32GB de espaço em disco e I/O puramente redundantes.

### Decisão
A tabela `messages` **NÃO** terá a coluna `account_id`. O isolamento multi-tenant da mensagem é derivado exclusivamente pela sua relação obrigatória com a conversa (`conversations.id`), cujo `account_id` já é validado. 99,9% de todas as buscas por mensagens na aplicação são escopadas por `WHERE conversation_id = $1`.

### Consequências
- **Positivas**:
  - Economia de gigabytes de armazenamento em disco e cache de memória RAM.
  - Redução do tamanho dos índices B-Tree de mensagens.
- **Negativas / Trade-offs**:
  - A política de RLS em `messages` precisa fazer uma verificação na tabela `conversations` (`WHERE conversations.id = messages.conversation_id`). Como a busca é por `conversation_id` (que possui índice B-Tree primário), o overhead é insignificante comparado ao ganho de armazenamento.

---

## ADR-004: Utilização de `pg_trgm` + `unaccent()` em vez de FTS/Elasticsearch

### Status
**Aceito**

### Contexto
Busca de contatos em CRMs no Brasil exige correspondência parcial de nomes, e-mails e números de telefone, ignorando acentuação (ex: buscar "joao" deve encontrar "João", buscar "conceicao" deve encontrar "Conceição").

Full-Text Search (`tsvector`) foca em palavras inteiras e linguística, sendo ineficiente para parciais de telefone ou números. Ferramentas como Elasticsearch adicionam alta complexidade de infraestrutura.

### Decisão
Adotamos a extensão `pg_trgm` (trigramas) combinada com a extensão `unaccent` do PostgreSQL. Criamos uma função `immutable_unaccent()` para permitir a criação de um índice GIN de trigramas sobre a concatenação desnormalizada de nome, telefone e email.

### Consequências
- **Positivas**:
  - Permite acelerar queries `ILIKE '%termo%'` com suporte nativo a índices GIN no PostgreSQL.
  - Insensível a acentuação e caixa (maiúsculas/minúsculas).
  - Não requer alteração no código da aplicação nem infraestrutura externa de busca.
- **Negativas / Trade-offs**:
  - Índices GIN de trigramas ocupam mais espaço em disco e possuem um custo um pouco maior na inserção/atualização de contatos (aceitável para o volume de escrita de contatos).

---

## ADR-005: Consolidação de migrações históricas em um Schema Baseline Único

### Status
**Aceito**

### Contexto
O projeto acumulava 52 arquivos de migração SQL resultantes de 2 anos de evolução de desenvolvimento. Algumas migrações introduziram relacionamentos e restrições que posteriormente foram alterados (ex: `user_id` vs `account_id`, `ON DELETE CASCADE` legados em `auth.users`).

Como o sistema está em fase pré-produção sem dados reais de clientes a preservar, manter 52 arquivos gera dívida técnica de manutenção e dificulta a leitura do estado real do banco.

### Decisão
Consolidar todo o histórico de migrações em um conjunto enxuto de schema baseline (`001_core_schema.sql` e `002_functions_and_triggers.sql`). Todas as correções estruturais (particionamento de messages, correção de `ON DELETE SET NULL`, índices de trigramas e novas RPCs) foram incorporadas diretamente na nova fundação.

### Consequências
- **Positivas**:
  - Fonte única de verdade clara para a estrutura do banco de dados.
  - Elimina DDLs obsoletos e refatorações históricas não utilizadas.
  - Inicialização de ambientes de teste e desenvolvimento torna-se instantânea.
- **Negativas / Trade-offs**:
  - Perda do histórico sequencial de commits de DDL (preservado no histórico do Git caso seja necessária consulta).

---

## ADR-006: Remoção de Foreign Keys declarativas para a tabela particionada `messages`

### Status
**Aceito**

### Contexto
No PostgreSQL 15+, qualquer restrição `PRIMARY KEY` ou `UNIQUE` em uma tabela particionada deve obrigatoriamente conter a chave de partição (no nosso caso, `created_at`). Para que outra tabela (`message_reactions`, `message_tags`, `conversation_mentions`) mantenha uma Foreign Key declarativa para `messages(id)`, a Foreign Key precisaria referenciar a chave composta `(id, created_at)`.

Isso forçaria o acréscimo de uma coluna `message_created_at` em todas as tabelas filhas, aumentando a complexidade das tabelas e o consumo de armazenamento.

### Decisão
Removemos a instrução de Foreign Key declarativa (`REFERENCES messages(id)`) das tabelas filhas `message_reactions`, `message_tags`, e `conversation_mentions`. O identificador `message_id UUID` permanece intacto e indexado nestas tabelas. A integridade referencial é assegurada pela camada de aplicação no momento da escrita (webhook e RPCs) e por limpezas periódicas automatizadas via `pg_cron`.

### Consequências
- **Positivas**:
  - Preserva a simplicidade do modelo de dados nas tabelas filhas sem colunas redundantes de data.
  - Elimina locks de verificação de integridade referencial cruzada durante inserções massivas de mensagens.
  - Permite a partição limpa de `messages` por RANGE(`created_at`).
---

## ADR-007: Fortalecimento de Segurança de Senhas (Complexidade + HIBP) e Proteção hCaptcha

### Status
**Aceito**

### Contexto
Para mitigar ataques de força bruta, credential stuffing e uso de senhas vazadas em vazamentos de dados públicos (data breaches), foi ativada no Supabase Auth a política rigorosa de complexidade de senhas (exigindo letras maiúsculas, minúsculas, dígitos e símbolos com no mínimo 8 caracteres), juntamente com o serviço Have I Been Pwned (HIBP) e a verificação hCaptcha.

A aplicação frontend do FlowHub necessitava ser sincronizada para apresentar orientações visuais claras antes do envio, interpretar amigavelmente os erros retornados pelo Supabase e transmitir os tokens de captcha.

### Decisão
1. **Política de Senhas**:
   - Padrão estabelecido: Mínimo 8 caracteres (máximo 72), contendo pelo menos 1 letra maiúscula, 1 minúscula, 1 dígito e 1 caractere especial/símbolo.
   - Validação client-side unificada em `src/lib/auth/password-policy.ts`.
   - Exibição de checklist interativo em tempo real (`PasswordRequirements`) nas telas de `/signup`, `/reset-password` e `/settings`.
   - Parser de erros `parseSupabasePasswordError` para interceptar rejeições do Supabase Auth e HIBP, exibindo avisos claros sobre senhas expostas em data breaches.

2. **Proteção hCaptcha**:
   - Integração do pacote `@hcaptcha/react-hcaptcha` através do componente wrapper `HCaptchaWidget`.
   - Configuração via variável de ambiente `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`. Quando não presente (ex: dev local sem captcha), a validação visual e o token são ignorados de forma transparente.
   - Envio de `captchaToken` nas chamadas de `signUp`, `signInWithPassword` e `resetPasswordForEmail`.

### Consequências
- **Positivas**:
  - Proteção proativa contra senhas fracas e credenciais comprometidas em vazamentos globais.
  - Mitigação de ataques automatizados de botnet e spam de cadastro/login via hCaptcha.
  - Experiência do usuário aprimorada com feedback em tempo real sobre os critérios exigidos de senha.
- **Negativas / Trade-offs**:
  - Requer que o operador configure a chave `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` no ambiente de produção e habilite a integração correspondente no painel do Supabase Auth.

---

## ADR-008: Participação N:N (`account_memberships`) e workspace ativo no perfil

### Status
**Aceito** — migração `070_multi_workspace_memberships.sql`. Detalhamento em
[`multi-workspace-tenancy.md`](multi-workspace-tenancy.md).

### Contexto
O vínculo usuário↔conta morava em `profiles.account_id` / `profiles.account_role`,
com `UNIQUE(accounts.owner_user_id)` reforçando "uma conta por pessoa". Como o
e-mail identifica uma única identidade em `auth.users`, a mesma pessoa não podia
ter a própria conta e participar da conta de uma empresa. O aceite de convite
contornava isso movendo o perfil e **apagando** a conta anterior, guardado por uma
heurística de "conta vazia" que (a) não verificava outros membros — e a cascata
apagava os perfis deles — e (b) checava uma lista fixa de 11 tabelas de 2017,
ignorando assinaturas, faturas, quadros, IA e integrações.

### Decisão
1. A participação vira entidade própria: `account_memberships (account_id,
   user_id, role, status, …)`, com `UNIQUE(account_id, user_id)` e índice parcial
   garantindo **um dono ativo por workspace**.
2. `profiles.account_id` **muda de significado**: deixa de ser "a conta do
   usuário" e passa a ser o **workspace ativo**; `profiles.account_role` vira
   espelho do papel na participação ativa, mantido por gatilho.
3. `is_account_member(account_id, min_role)` **mantém nome e assinatura** e passa
   a significar "participo E este é meu workspace ativo". As ~120 políticas RLS de
   017…064 seguem válidas sem reescrita e continuam entregando um tenant por vez.
4. A FK `profiles.account_id` passa de `ON DELETE CASCADE` para
   `ON DELETE SET NULL`; nenhum fluxo de participação apaga `accounts`.

### Alternativas consideradas
- **Refinar a heurística de conta vazia** (contar membros, ampliar a lista de
  tabelas): resolveria os dois bugs sem resolver o problema — continuaria exigindo
  abandonar uma conta para entrar em outra.
- **Workspace ativo em cookie/JWT**: tornaria o contexto palavra do cliente e
  exigiria hook de token para o RLS enxergá-lo. O ponteiro no banco é validado por
  RPC antes de gravar e é legível por qualquer política sem infraestrutura extra.
- **RLS por união de participações** (sem workspace ativo): consultas hoje
  escritas sem filtro de conta passariam a devolver dados de vários tenants. Era o
  caminho mais curto para uma regressão de isolamento.

### Consequências
- **Positivas**: aceitar convite deixa de destruir dados; papel passa a ser
  contextual; expurgo de conta não apaga mais identidades compartilhadas; a
  unicidade de titularidade passa a ser garantida por índice.
- **Negativas / Trade-offs**: o contexto ativo é por identidade, não por aba —
  trocar de workspace em uma aba muda o contexto das demais na próxima leitura;
  toda enumeração de membros precisou sair de `profiles` para
  `account_memberships`; as duas colunas antigas seguem existindo durante o
  rollout, o que exige disciplina para não reintroduzi-las como vínculo.

---

*Documento mantido sob governança da equipe de Arquitetura do FlowHub.*

