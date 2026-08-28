# Automações e Agendamento de Crons (Automations & Cron Jobs)

Este documento especifica a arquitetura, segurança e agendamento das rotinas em segundo plano no **Flow Hub**, incluindo a estratégia híbrida para **Vercel Hobby (Zero Custo)** e o procedimento de migração simplificado para **Vercel Pro**.

---

## 1. Visão Geral das Rotinas e Frequências

| Rota HTTP | Frequência | Origem Recomendada (Hobby) | Propósito Principal |
| :--- | :--- | :--- | :--- |
| `GET /api/automations/cron` | A cada 1 min (`* * * * *`) | **cron-job.org** (Pinger Externo) | Drena e executa passos com tempo de espera (*Wait steps*) em automações. |
| `GET /api/flows/cron` | A cada 5-15 min (`*/5 * * * *`) | **cron-job.org** (Pinger Externo) | Varre e desativa fluxos inativos/abandonados há 24h (*Stale sweep*). |
| `POST /api/ai-service/turns/drain` | A cada 5 s (pg_cron) + 1 min (pinger) | **Postgres** (`ai_turn_dispatch_due`), com pinger externo como reforço | **Recuperação** de turnos conversacionais. O caminho normal é o despertador agendado pelo próprio webhook. |
| `GET /api/account/dunning-cron` | Diariamente às 02:00 UTC (`0 2 * * *`) | **Vercel Cron Nativo** ([`vercel.json`](../vercel.json)) | Avalia assinaturas em atraso e aplica réguas de cobrança e suspensão. |
| `GET /api/account/purge-cron` | Diariamente às 03:00 UTC (`0 3 * * *`) | **Vercel Cron Nativo** ([`vercel.json`](../vercel.json)) | Executa o expurgo definitivo de dados de contas vencidas há >90 dias (retenção LGPD). |

---

## 2. Estratégia Híbrida: Plano Vercel Hobby (Zero Custo)

O plano **Vercel Hobby** limita crons nativos a frequências diárias. Para contornar essa restrição sem nenhum custo mensal, adotamos um modelo híbrido:

### Parte A: Crons Diários na Vercel ([`vercel.json`](../vercel.json))
Os jobs diários são gerenciados nativamente pela Vercel:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/account/dunning-cron",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/account/purge-cron",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### Parte B: Crons de Alta Frequência via cron-job.org (Gratuito)

Para `automations/cron` e `flows/cron`, utilize o serviço gratuito [cron-job.org](https://cron-job.org):

1. Crie uma conta gratuita em [cron-job.org](https://cron-job.org).
2. Adicione **Job 1 (Automations)**:
   - **Title**: `Flow Hub - Automations Cron`
   - **URL**: `https://seu-dominio.vercel.app/api/automations/cron`
   - **Schedule**: A cada 1 minuto
   - **HTTP Headers**:
     - `x-cron-secret`: `<SEU_AUTOMATION_CRON_SECRET>` *(ou `Authorization: Bearer <SEU_AUTOMATION_CRON_SECRET>`)*
3. Adicione **Job 2 (Flows Sweep)**:
   - **Title**: `Flow Hub - Flows Stale Sweep`
   - **URL**: `https://seu-dominio.vercel.app/api/flows/cron`
   - **Schedule**: A cada 5 ou 15 minutos
   - **HTTP Headers**:
     - `x-cron-secret`: `<SEU_AUTOMATION_CRON_SECRET>`
4. Adicione **Job 3 (Turnos do Atendimento Inteligente)**:
   - **Title**: `Flow Hub - AI Turns Drain`
   - **URL**: `https://seu-dominio.vercel.app/api/ai-service/turns/drain`
   - **Schedule**: A cada 1 minuto
   - **HTTP Headers**:
     - `x-cron-secret`: `<SEU_AI_TURNS_CRON_SECRET ou AUTOMATION_CRON_SECRET>`

### Parte C: Turnos conversacionais — o cron é a rede de recuperação

Fechar um turno exige acordar alguém poucos segundos depois da última mensagem
do cliente. Quem faz isso no fluxo normal **não é cron nenhum**: o webhook
conhece o instante exato do vencimento (`closes_at` volta do append) e agenda
um despertador para ele no ciclo pós-resposta. Sem varredura, sem jitter.

O despachante no Postgres (migration 069) cobre o que escapa disso — ciclo
pós-resposta que não rodou, deploy no meio, lease vencido, espera longa demais
para o caminho rápido:

- `ai_turn_dispatch_due()` é agendada por **pg_cron a cada 5 segundos**;
- ela **só faz a chamada HTTP quando existe turno vencido** — conta parada
  custa uma varredura de índice parcial e zero invocação serverless;
- a chamada sai por **pg_net**, com `app_url` lido de `public.system_config` e
  o segredo resolvido por `public.flowhub_internal_secret()` — que prefere o
  **Supabase Vault** (`flowhub_internal_cron_secret`) e só cai para
  `system_config` como legado, avisando no log.

O Job 3 acima é mais uma camada, para quando pg_cron ou pg_net estiverem
indisponíveis. Como toda reivindicação de turno é atômica, os três caminhos —
despertador, pg_cron e pinger — podem se sobrepor sem risco de resposta
duplicada: quem chega primeiro leva, e os outros não encontram nada.

Detalhes em [`architecture/ai-conversational-turns.md`](architecture/ai-conversational-turns.md).

---

## 3. Autenticação e Segurança

Todas as 4 rotas possuem verificação de segredo em tempo constante (`timingSafeEqual`), aceitando requisições de qualquer origem confiável (Vercel Cron ou Pinger Externo):

- **Variáveis de Ambiente**: `AUTOMATION_CRON_SECRET` ou `CRON_SECRET`
- **Formatos de Header Aceitos**:
  - `x-cron-secret: <SEGREDO>`
  - `Authorization: Bearer <SEGREDO>`

---

## 4. Migração Futura para Vercel Pro (100% Nativo na Vercel)

Caso a organização assine o plano **Vercel Pro** (~US$ 20/mês), **não é necessária nenhuma alteração no código das APIs**.

Basta centralizar os 4 agendamentos no arquivo [`vercel.json`](../vercel.json) e desativar os agendamentos no `cron-job.org`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/automations/cron",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/flows/cron",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/ai-service/turns/drain",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/account/dunning-cron",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/account/purge-cron",
      "schedule": "0 3 * * *"
    }
  ]
}
```

---

## 5. Invocação Manual e Testes

Em ambiente de desenvolvimento ou testes, qualquer rota pode ser disparada via `curl`:

```bash
# Teste manual de automações
curl -X GET "http://localhost:3000/api/automations/cron" \
  -H "x-cron-secret: SEU_SEGREDO_LOCAL"

# Teste manual de expurgo
curl -X GET "http://localhost:3000/api/account/purge-cron" \
  -H "Authorization: Bearer SEU_SEGREDO_LOCAL"

# Fecha e executa turnos conversacionais vencidos
curl -X POST "http://localhost:3000/api/ai-service/turns/drain" \
  -H "x-cron-secret: SEU_SEGREDO_LOCAL"
```
