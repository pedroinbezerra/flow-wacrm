# Regras de Negócio — Ciclo de Cobrança e Tratamento de Estornos (Asaas)

Documento de direcionamento para correção de dois problemas encontrados na
integração de billing com o Asaas. Ambos afetam diretamente o acesso do
cliente à plataforma, então a prioridade é alta.

---

## 1. Vencimento da assinatura ignora o ciclo de cobrança (bug crítico)

### O que está acontecendo

Em `src/app/api/account/checkout/route.ts:116`, a assinatura é criada no
Asaas com o ciclo correto do plano:

```ts
cycle: plan.billing_period === "yearly" ? "YEARLY" : "MONTHLY",
```

Mas em `src/app/api/webhooks/asaas/route.ts:57-58`, quando o pagamento é
confirmado (`PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED`), o próximo vencimento
local é sempre calculado como **+30 dias fixos**, independente do ciclo real:

```ts
const nextPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
```

### Por que isso é grave

O `dunning-cron` (`src/app/api/account/dunning-cron/route.ts`) calcula dias
de atraso a partir de `subscriptions.current_period_end`. Um cliente do
plano **anual**, mesmo em dia com o pagamento, vai ter `current_period_end`
expirando em 30 dias — e a partir daí o cron começa a rebaixar a conta
(past_due → read_only aos 14 dias → suspended aos 30 dias → exclusão
agendada aos 90 dias) **mesmo sem nenhum atraso real de pagamento**. É uma
falha que pune quem pagou certo.

### O que precisa ser feito

Ao processar `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED` no webhook, o próximo
vencimento não pode ser um valor fixo. Duas formas de resolver, em ordem de
preferência:

1. **Preferencial — usar o dado do próprio Asaas.** O Asaas mantém a
   assinatura (`GET /subscriptions/{id}`) com o campo `nextDueDate` já
   calculado corretamente pelo ciclo contratado. Buscar esse valor e gravar
   direto em `current_period_end`, em vez de calcular localmente. Isso evita
   qualquer duplicação de lógica de calendário (meses de 28/30/31 dias, anos
   bissextos, etc.) e mantém uma única fonte de verdade.
2. **Alternativa — calcular local a partir do plano.** Buscar
   `plans.billing_period` a partir de `subscriptions.plan_id` e aplicar:
   - `monthly` → +1 mês (usar manipulação de data, não `+30 dias` em ms)
   - `yearly` → +1 ano

   Essa alternativa é aceitável, mas menos robusta que a opção 1 porque pode
   divergir do calendário real de cobrança do Asaas ao longo do tempo.

### Critério de aceite

- Criar assinatura no plano anual → confirmar pagamento via webhook →
  `current_period_end` deve refletir ~12 meses à frente, não 30 dias.
- Criar assinatura no plano mensal → confirmar pagamento → comportamento
  atual (~30 dias) deve continuar funcionando.
- Rodar `dunning-cron` logo após a confirmação de pagamento em ambos os
  casos → a conta não pode ser marcada como atrasada.

---

## 2. Estorno e chargeback não são tratados (gap de integridade de billing)

### O que está acontecendo

O webhook (`src/app/api/webhooks/asaas/route.ts`) só trata quatro eventos:
`PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE` e
`SUBSCRIPTION_DELETED`. A tabela `invoices` já prevê o status `refunded` no
schema (`033_invoices_and_nfe.sql`), mas nenhum código chega a gravá-lo. Os
eventos do Asaas para estorno e contestação de pagamento —
`PAYMENT_REFUNDED`, `PAYMENT_CHARGEBACK_REQUESTED`,
`PAYMENT_CHARGEBACK_DISPUTE`, `PAYMENT_DELETED` — não têm nenhum handler.

### Por que isso é grave

Se um cliente pede reembolso pelo banco/operadora ou contesta a cobrança
(chargeback), o dinheiro volta para ele, mas no Flow Hub a fatura continua
marcada como `paid` e a conta continua com `subscription_status = active`
indefinidamente. Ou seja: acesso total à plataforma sem pagamento
efetivo, sem qualquer sinalização para o time.

### O que precisa ser feito

Adicionar handlers no webhook para os eventos abaixo. Regra proposta
(pode ajustar o rebaixamento de acesso, mas o registro da fatura é
obrigatório em todos os casos):

| Evento Asaas | Ação em `invoices` | Ação em `subscriptions` / `accounts` |
| --- | --- | --- |
| `PAYMENT_REFUNDED` | `status = 'refunded'` | Rebaixar imediatamente para `suspended` (não passar pela régua gradual de inadimplência — o pagamento já foi revertido, não é um simples atraso) |
| `PAYMENT_CHARGEBACK_REQUESTED` | manter `paid`, mas registrar o evento (ex: campo/flag de disputa, ou log em `account_deletion_audit_logs`-like table dedicada) | nenhuma ação de acesso ainda — é só uma contestação em análise, cancelar acesso aqui seria precipitado |
| `PAYMENT_CHARGEBACK_DISPUTE` / chargeback confirmado | `status = 'refunded'` | Rebaixar para `suspended`, mesma lógica do reembolso |
| `PAYMENT_DELETED` | `status = 'canceled'` | Sem ação de acesso se a assinatura já não estava ativa por essa cobrança; se era a cobrança vigente, tratar como `PAYMENT_OVERDUE` |

Importante: como já existe o padrão de idempotência por `asaas_payment_id`
usado em `PAYMENT_RECEIVED`, reaproveitar a mesma busca por
`asaas_payment_id` antes de atualizar, para não sobrescrever estados mais
recentes com eventos que cheguem fora de ordem.

### Critério de aceite

- Simular (via `curl` com o payload de exemplo do Asaas) um evento
  `PAYMENT_REFUNDED` para uma fatura paga existente → `invoices.status`
  muda para `refunded` e a conta perde acesso (`suspended`).
- Simular `PAYMENT_CHARGEBACK_REQUESTED` → nenhuma mudança de acesso, apenas
  o registro fica rastreável.
- Nenhum dos novos handlers deve quebrar o processamento dos eventos já
  existentes (`PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_DELETED`).

---

## Observação

Os dois itens acima são independentes e podem ser corrigidos em qualquer
ordem, mas o item 1 (ciclo anual) é mais urgente se já existir algum cliente
ativo no plano anual — client pagante sendo rebaixado por engano é o pior
cenário possível aqui.
