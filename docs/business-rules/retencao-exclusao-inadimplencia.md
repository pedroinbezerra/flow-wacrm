# Backup, Exclusão de Conta e Inadimplência — Direcional para Implementação

> Documento de regras de negócio para orientar a implementação técnica.
> Não é o código — é o "o quê" e o "porquê"; o "como" fica a critério de
> quem implementa, desde que as regras abaixo sejam respeitadas.
> Decisões marcadas com **[DECISÃO]** ainda precisam ser confirmadas
> pelo Flow Hub antes ou durante a implementação.

---

## 1. Backup do banco (Supabase)

### Situação atual
Não há backup configurado hoje. Se o projeto Supabase estiver no plano
Free, **não há backup algum disponível** — é preciso migrar de plano
antes de qualquer outra coisa.

### Recomendação
- **Plano mínimo: Pro.** Inclui backup diário automático com 7 dias de
  retenção, sem configuração adicional.
- **Considerar o add-on de PITR (Point-in-Time Recovery)** assim que o
  volume de dados/criticidade justificar — permite restaurar para
  qualquer ponto no tempo (granularidade de segundos), não só o
  snapshot da noite anterior. Ativar PITR desliga o backup diário
  (Supabase não roda os dois ao mesmo tempo — PITR já cobre o caso).
- Planos Team (14 dias) e Enterprise (30 dias) aumentam a retenção do
  backup diário, caso o Flow Hub cresça para esse porte.

### O que fazer
1. Confirmar/atualizar o plano do projeto Supabase para Pro ou superior.
2. Definir e documentar um RPO (objetivo de ponto de recuperação) e RTO
   (objetivo de tempo de recuperação) — ex.: "perda máxima aceitável de
   24h de dados, restauração em até 4h". **[DECISÃO]**
3. Testar uma restauração real pelo menos uma vez (backup que nunca foi
   restaurado é uma suposição, não uma garantia).
4. Registrar a política final (plano, retenção, RPO/RTO, última data de
   teste de restauração) — isso alimenta a futura Política de Backup e
   Retenção.

---

## 2. Exclusão de conta + expurgo de dados (90 dias)

### Regra de negócio (já validada com o Flow Hub)
Dados pessoais são mantidos enquanto a conta estiver ativa. Após
cancelamento (voluntário ou por inadimplência não resolvida — ver seção
3), o Flow Hub mantém os dados por **90 dias de carência**, permitindo
reativação sem perda de histórico. Passado esse prazo sem reativação,
os dados pessoais são apagados/anonimizados de forma definitiva.

### O que não existe hoje (precisa ser construído)
- Endpoint de autoatendimento para o dono da conta solicitar o
  cancelamento/exclusão da própria conta. Hoje só existe remoção de um
  membro da equipe (`/api/account/members/[userId]`), não da conta
  inteira.
- Qualquer coluna ou mecanismo de "arquivamento"/soft-delete —
  nenhuma tabela tem `deleted_at`. Precisa ser adicionado.
- Um job agendado que aplique o expurgo automaticamente depois dos 90
  dias.

### Especificação proposta

**2.1. Novo estado da conta**
Adicionar `accounts.scheduled_deletion_at TIMESTAMPTZ NULL`.
- `NULL` → conta normal.
- Preenchido → conta em contagem regressiva para exclusão definitiva.

**2.2. Gatilhos que preenchem `scheduled_deletion_at`**
- Dono da conta solicita cancelamento/exclusão pelo painel (endpoint
  novo) → `scheduled_deletion_at = now() + 90 dias`.
- Inadimplência não resolvida atinge o prazo final definido na seção 3
  → mesmo efeito, mesmo prazo de 90 dias.

**2.3. Durante os 90 dias**
**[DECISÃO]** o Flow Hub precisa optar entre:
- (a) Conta fica **bloqueada** (sem login/uso), mas dado 100% intacto —
  reativar = pagar/reconfirmar e voltar a usar imediatamente; ou
- (b) Conta fica em **modo leitura** (o time só consulta histórico, não
  envia mensagem nem roda automação) até decidir.
Recomendo (a) por ser mais simples de implementar e mais claro para o
cliente, mas a escolha é de negócio.

**2.4. O que o job de expurgo faz, ao vencer os 90 dias**
Um cron diário (mesmo padrão de `/api/automations/cron` e
`/api/flows/cron` já existentes) verifica
`accounts WHERE scheduled_deletion_at <= now()` e, para cada uma:

1. **Preserva o que a lei obriga a manter** — faturas e notas fiscais
   (`invoices`) **não podem ser apagadas**: a legislação tributária
   brasileira exige guarda de documentos fiscais por 5 anos. Antes de
   apagar a conta, mover/copiar essas linhas para fora do cascade (ex.:
   remover o `ON DELETE CASCADE` de `invoices.account_id` e trocar por
   `ON DELETE SET NULL`, preservando o registro fiscal mesmo depois que
   a conta operacional deixar de existir).
2. **Apaga os objetos de Storage** da conta (`chat-media`,
   `flow-media`, `avatars` — prefixo `account-<id>/`) — isso não é
   automático só porque a linha do Postgres foi apagada; é uma chamada
   explícita de remoção no Storage.
3. **Apaga a linha da conta** (`DELETE FROM accounts WHERE id = ...`) —
   o `ON DELETE CASCADE` já configurado cuida de contatos, conversas,
   mensagens, automações, flows, boards etc.
4. **Apaga o usuário em `auth.users`** (dono e membros que não
   pertençam a outra conta) — mantendo apenas um registro mínimo de
   auditoria (ex.: `account_id`, CNPJ, data da exclusão) numa tabela de
   log administrativo, sem dado pessoal, como prova de que o pedido foi
   atendido.
5. Grava um log de auditoria da execução (conta, data, o que foi
   preservado por obrigação legal).

**2.5. Reativação antes do prazo**
Login ou pagamento durante os 90 dias → `scheduled_deletion_at = NULL`,
acesso restaurado. Como nada foi apagado ainda, não há restauração de
dado nenhuma a fazer.

**2.6. Comunicação (recomendado, não obrigatório)**
- E-mail imediato ao solicitar cancelamento, confirmando o prazo de 90
  dias e como reativar.
- Lembrete próximo do fim do prazo (ex.: aos 75 dias) avisando que os
  dados serão apagados em definitivo.

---

## 3. Suspensão por inadimplência

### Situação atual
O webhook da Asaas já marca `subscriptions.status = 'past_due'` e
`accounts.subscription_status = 'past_due'` quando um pagamento falha,
mas **nada no código hoje restringe o uso do produto** com esse status.
O cliente inadimplente continua com acesso total.

### Especificação proposta (fluxo de dunning em estágios)

| Estágio | Quando | Acesso | Ação |
|---|---|---|---|
| 1. Falha de pagamento | Dia 0 | Total | Notifica o cliente, sem bloqueio — dá espaço para a cobrança recorrente da Asaas tentar de novo |
| 2. Inadimplência confirmada | **[DECISÃO]** ex.: dia 7–10 | Total, com aviso persistente no painel | 2–3 lembretes por e-mail/painel |
| 3. Acesso restrito | **[DECISÃO]** ex.: dia 10–15 | Somente leitura — bloquear envio de mensagem, disparo de automação/broadcast; manter visualização e exportação de dados | Novo guard de autorização (mesmo padrão de `requireRole`) checando `subscription_status` nas rotas de escrita |
| 4. Suspensão total | **[DECISÃO]** ex.: dia 30 | Bloqueado — painel redireciona para tela de regularização de pagamento | Dado continua intacto, nada é apagado |
| 5. Sem regularização | 90 dias corridos de inadimplência (mesmo prazo da seção 2) | — | Entra no mesmo fluxo de `scheduled_deletion_at` da seção 2 |

**Pagamento resolvido em qualquer estágio → acesso total imediato,**
sem necessidade de restaurar nada (nada foi apagado até o estágio 5).

Os prazos exatos de cada estágio ficam marcados como **[DECISÃO]** —
sugeri números comuns de mercado, mas é o Flow Hub quem define.

---

## Resumo do que precisa ser codificado

1. Upgrade do plano Supabase + configuração de backup/PITR (infra, sem
   código).
2. Coluna `accounts.scheduled_deletion_at` + endpoint de
   cancelamento/exclusão de conta pelo dono.
3. Guard de autorização por `subscription_status` (estágios 3 e 4 da
   inadimplência) nas rotas de escrita.
4. Job de expurgo diário (`/api/accounts/purge-cron` ou similar) —
   preserva fiscal, apaga Storage, apaga conta, apaga auth, loga.
5. Alterar a FK de `invoices.account_id` para não cascatear na exclusão
   (preservar por obrigação legal de 5 anos).
6. Webhook/job da Asaas passa a avançar os estágios da tabela acima
   conforme os dias de atraso, não só marcar `past_due`.
