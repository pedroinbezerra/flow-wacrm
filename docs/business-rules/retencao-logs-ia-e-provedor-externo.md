# Regras de Negócio — Retenção dos Logs de Execução da IA e Alerta de Provedor Externo Customizado

Direcionamento para dois ajustes decididos na Etapa 9 (Inteligência
Artificial) da matriz de conformidade. Nenhum dos dois é bug — são
melhorias de minimização de dados e de transparência com o cliente.

---

## 1. Expurgo do texto dos logs de execução da IA (180 dias)

### Contexto

`ai_execution_logs` (`037_ai_audit_and_security.sql`) grava, a cada
interação processada pela IA, o texto completo da mensagem recebida
(`inbound_message_text`) e da resposta gerada (`outbound_text`), além de
metadados (`model_used`, tokens, `execution_time_ms`,
`knowledge_item_ids`, `media_item_ids`, `handoff_triggered`,
`handoff_reason`). Essa tabela não tem expurgo próprio hoje — só é
apagada via `ON DELETE CASCADE` quando a conta inteira é excluída
(`purge-cron`). Ou seja, enquanto a conta estiver ativa, o texto completo
de cada conversa processada pela IA fica retido para sempre.

Essa tabela existe para auditoria de segurança, depuração e métricas de
uso — não é o registro oficial de conversa (isso já vive em `messages`).
Por minimização de dados, o conteúdo textual não precisa ficar retido
indefinidamente; os metadados (tokens, modelo, tempo, se houve handoff),
sim, podem ficar por mais tempo para fins de billing/analytics.

### O que precisa ser feito

Adicionar um passo de expurgo de texto em `ai_execution_logs` para linhas
com `created_at` a mais de **180 dias**: apagar apenas
`inbound_message_text` e `outbound_text` (setar como `NULL`), mantendo a
linha e os demais campos intactos.

```sql
UPDATE public.ai_execution_logs
SET inbound_message_text = NULL, outbound_text = NULL
WHERE created_at < NOW() - INTERVAL '180 days'
  AND (inbound_message_text IS NOT NULL OR outbound_text IS NOT NULL);
```

**Não criar um novo endpoint/cron separado.** Já estamos no limite de 2
cron jobs nativos da Vercel (plano Hobby), ocupados por `dunning-cron` e
`purge-cron`. A forma mais simples é **adicionar esse passo dentro do
handler existente de `src/app/api/account/purge-cron/route.ts`**, que já
roda diariamente e já é o lugar natural para rotinas de retenção/expurgo.
Basta incluir essa query como mais uma etapa da execução, com seu próprio
contador no objeto `results` retornado (ex:
`aiLogsScrubbedCount`), sem impactar a lógica de purga de contas que já
existe ali.

### Critério de aceite

- Rodar o cron/rota manualmente com uma linha de teste em
  `ai_execution_logs` com `created_at` de mais de 180 dias atrás → texto
  vira `NULL`, mas a linha continua existindo com os demais campos.
- Uma linha com menos de 180 dias não deve ser alterada.
- A purga de contas (`purgedAccountsCount`) precisa continuar funcionando
  exatamente como antes — esse é só mais um passo, não uma substituição.

---

## 2. Aviso e confirmação ao configurar provedor de IA customizado

### Contexto

O campo `openai_api_url` (`ai_service_config.openai_api_url`) é livre —
o cliente pode apontar para qualquer endpoint "compatível com OpenAI",
não só a OpenAI oficial. Isso é intencional (é o modelo BYOK do produto),
mas hoje não existe nenhum aviso na hora em que o cliente muda esse valor
do padrão. Como a Flow Hub não tem visibilidade nem controle sobre esse
endpoint quando ele é customizado, o cliente precisa confirmar de forma
explícita que está ciente de que a responsabilidade pela escolha desse
fornecedor é dele.

Esse campo é editado em dois componentes que parecem ser telas paralelas
do mesmo formulário — ambos precisam do mesmo tratamento:

- `src/components/ai/ai-config-modal.tsx`
- `src/components/settings/ai-config-panel.tsx`

### O que precisa ser feito

Nos dois componentes acima, no campo de URL da API (hoje controlado por
`apiUrl`/`setApiUrl`):

1. Quando o valor digitado for **diferente** do padrão
   (`https://api.openai.com/v1`), exibir um aviso inline, por exemplo:
   > "Você está usando um provedor de IA diferente da OpenAI oficial. A
   > Flow Hub não tem relação contratual nem visibilidade sobre esse
   > fornecedor — a responsabilidade pela contratação, segurança e uso
   > dos dados enviados a ele é sua."
2. Exigir uma confirmação explícita (checkbox, ex: "Estou ciente e assumo
   a responsabilidade por este provedor externo") antes de permitir
   salvar a configuração com uma URL customizada. Enquanto não marcado,
   o botão de salvar deve ficar desabilitado (só quando a URL for
   diferente do padrão — se for a URL padrão da OpenAI, salva normal,
   sem essa fricção extra).
3. Não é necessário persistir esse "aceite" em uma tabela nova — a
   fricção no momento de salvar já cumpre o objetivo. Se quiser reforçar
   com rastreabilidade, pode gravar em `updated_at`/log genérico já
   existente, mas isso é opcional.

### Critério de aceite

- Deixar a URL no valor padrão da OpenAI → salva sem nenhum aviso extra.
- Trocar para qualquer outra URL → aviso aparece, botão de salvar fica
  bloqueado até marcar o checkbox.
- Comportamento idêntico nos dois componentes listados.

---

## Observação sobre o texto legal

O ajuste correspondente no Termos de Uso (deixar explícito que o cliente
escolhe e responde pelo provedor de IA quando customiza a URL) **não faz
parte deste direcionamento** — isso será redigido junto com a revisão
completa dos documentos legais, depois que a Matriz de Conformidade for
validada em todas as etapas, conforme combinado desde o início deste
trabalho.
