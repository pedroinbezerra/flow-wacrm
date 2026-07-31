# Detecção de Incidentes — Sentry, Health Check e Alerta de Eventos Críticos

Direcionamento da Etapa 11 (Riscos): fecha a lacuna de "detecção depende
de alguém notar manualmente" no Plano de Resposta a Incidentes
(`docs/governance/plano-resposta-a-incidentes.md`), e resolve também a
pendência de observabilidade registrada na Etapa 7.

Três frentes independentes, pode implementar em qualquer ordem.

---

## 1. Sentry (erros de aplicação)

- Criar um projeto no Sentry (plano gratuito cobre o volume atual) —
  isso é uma ação de conta, não de código; quem criar o projeto vai
  receber um DSN.
- Instalar `@sentry/nextjs` e rodar o wizard de integração
  (`npx @sentry/wizard@latest -i nextjs`), que gera
  `sentry.client.config.ts`, `sentry.server.config.ts` e
  `sentry.edge.config.ts` automaticamente e instrumenta o
  `next.config.ts`.
- Guardar o DSN em `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` no `.env` e na
  Vercel (Production + Preview).
- Configurar alerta por e-mail (ou Slack, se tiverem) no próprio painel
  do Sentry para qualquer erro novo/não visto antes — isso é
  configuração no Sentry, não código.
- Não precisa instrumentar manualmente cada rota — a integração
  Next.js captura exceções não tratadas automaticamente nas API routes
  e no client. Rotas que já fazem `console.error` em blocos `catch`
  continuam funcionando normalmente; o Sentry captura em paralelo.

### Critério de aceite
- Forçar um erro proposital numa rota de teste → aparece no painel do
  Sentry em poucos segundos → alerta chega por e-mail.

---

## 2. Endpoint de Health Check

- Criar `GET /api/health` (público, sem autenticação — é para ferramenta
  de uptime externa bater nele).
- Deve fazer uma checagem leve e rápida de conectividade com o banco
  (ex: `SELECT 1` ou uma query `count` barata numa tabela pequena via
  `supabaseAdmin()`), não só retornar 200 fixo — senão o monitor nunca
  pega o caso de "app de pé, banco fora".
- Resposta: `200 { status: "ok", db: "ok", timestamp }` em caso normal;
  `503 { status: "error", db: "error" }` se a checagem do banco falhar.
- Não expor detalhes de erro interno no corpo da resposta (mensagem de
  exceção, stack trace) — isso é endpoint público.
- Depois de criado, cadastrar no UptimeRobot (ou serviço equivalente
  gratuito) apontando para
  `https://<domínio-de-produção>/api/health`, intervalo de 5 minutos,
  com alerta por e-mail configurado na própria ferramenta.

### Critério de aceite
- `curl https://.../api/health` retorna 200 com o banco acessível.
- Simular falha de conexão com o banco (ambiente de teste) → endpoint
  retorna 503, não 200.

---

## 3. Alerta em tempo real para eventos críticos já registrados

Hoje `ai_security_events`, `super_admin_audit_logs` e
`account_deletion_audit_logs` já gravam eventos relevantes, mas nada
notifica ninguém — fica esperando alguém consultar. Objetivo: quando um
evento crítico for inserido, mandar um alerta imediato.

### 3.1 Endpoint interno de alerta

Criar `POST /api/internal/alerts/security-event`, protegido por um
segredo compartilhado (mesmo padrão já usado nos crons —
`x-cron-secret` / `Authorization: Bearer`, pode reaproveitar
`AUTOMATION_CRON_SECRET` ou criar `INTERNAL_ALERTS_SECRET` dedicado).
Recebe `{ source: string, summary: string, details?: object }` e envia
uma mensagem de WhatsApp para um número interno de operação da Flow
Systems.

Para o envio, **não** reaproveitar o `whatsapp_config` criptografado por
conta (isso é BYOK de cliente, não faz sentido pra alerta interno).
Criar credenciais próprias da Flow Systems, novas variáveis de
ambiente:

- `INTERNAL_ALERTS_WHATSAPP_PHONE_NUMBER_ID`
- `INTERNAL_ALERTS_WHATSAPP_ACCESS_TOKEN`
- `INTERNAL_ALERTS_WHATSAPP_TO` (número que deve receber o alerta)

Se essas variáveis não estiverem configuradas, o endpoint deve apenas
logar (`console.warn`) e retornar sucesso — não travar o fluxo que
disparou o alerta por falta de configuração, mesmo padrão de
degradação graciosa já usado no rate limiter (Upstash → fallback).

### 3.2 Gatilho automático no banco

Nova migration usando a extensão `pg_net` (já disponível no Supabase)
para dar `AFTER INSERT` nas três tabelas, chamando o endpoint acima via
`net.http_post`:

- `ai_security_events` — apenas quando `severity = 'critical'` (não
  gerar ruído para `warning`/`info`).
- `super_admin_audit_logs` — todo `INSERT` (conceder ou revogar é
  sempre relevante).
- `account_deletion_audit_logs` — todo `INSERT` (purga definitiva de
  conta é sempre relevante).

Cada trigger monta um payload simples (`source`, `summary` com os dados
principais da linha, `details` com a linha inteira) e chama
`net.http_post` para
`https://<domínio-de-produção>/api/internal/alerts/security-event`,
com o header do segredo compartilhado.

### Critério de aceite
- Inserir manualmente uma linha de teste em `super_admin_audit_logs` →
  mensagem chega no WhatsApp interno em poucos segundos.
- Inserir uma linha em `ai_security_events` com `severity = 'warning'`
  → não dispara alerta (só `critical` dispara).
- Com as variáveis de ambiente de alerta ausentes, o fluxo que gerou o
  evento (ex: concessão de super admin) continua funcionando
  normalmente, sem erro para o usuário.
