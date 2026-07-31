# Correção — `system_config` para os Alertas de Segurança em Tempo Real

A migration `046_security_event_alert_triggers.sql` inseriu dois valores
incorretos em `public.system_config`, que fazem o pipeline de alerta
(`pg_net` → `/api/internal/alerts/security-event` → WhatsApp) falhar
silenciosamente (a função tem `EXCEPTION WHEN OTHERS THEN RAISE WARNING`,
então o erro não aparece em lugar nenhum visível). Dois ajustes,
naturezas diferentes:

## 1. `app_url` — pode ir em migration normal

Domínio de produção real: **`https://www.flowhub.flowofc.com.br`**
(o valor atual, `https://flow.systems`, está errado).

Criar uma nova migration (`047_fix_system_config_app_url.sql` ou próximo
número livre):

```sql
UPDATE public.system_config
SET value = 'https://www.flowhub.flowofc.com.br', updated_at = NOW()
WHERE key = 'app_url';
```

## 2. `internal_alerts_secret` — NÃO pode ir em migration versionada

O valor atual (`'AUTOMATION_CRON_SECRET'`) é a string literal do nome da
variável, não o segredo de verdade — por isso a autenticação do endpoint
sempre falha. A correção parece simples (um `UPDATE` trocando pelo valor
real), mas **esse valor não pode ser escrito num arquivo de migration
commitado no Git** — isso vazaria o segredo de produção no histórico do
repositório, legível por qualquer um com acesso ao código.

Rodar manualmente, direto no SQL Editor do Supabase (produção), fora do
versionamento:

```sql
UPDATE public.system_config
SET value = '<valor real de AUTOMATION_CRON_SECRET ou INTERNAL_ALERTS_SECRET aqui>',
    updated_at = NOW()
WHERE key = 'internal_alerts_secret';
```

Use o mesmo valor que já está configurado como `AUTOMATION_CRON_SECRET`
(ou `INTERNAL_ALERTS_SECRET`, se tiverem criado uma variável dedicada)
na Vercel — tem que ser idêntico ao que o endpoint em
`src/app/api/internal/alerts/security-event/route.ts` lê de
`process.env`.

## Critério de aceite

- Inserir uma linha de teste em `super_admin_audit_logs` (ou revogar/
  conceder um super admin de teste) → mensagem de alerta chega no
  WhatsApp interno configurado em `INTERNAL_ALERTS_WHATSAPP_TO`.
- Conferir nos logs do Supabase (Database → Logs) que não há mais
  `WARNING: notify_security_event_alert failed` após o ajuste.
