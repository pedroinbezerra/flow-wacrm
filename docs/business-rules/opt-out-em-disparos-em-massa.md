# Respeitar Opt-out nos Disparos em Massa (Broadcast)

Direcionamento da Etapa 10 (Direitos do Usuário) da matriz de
conformidade.

## O problema

O webhook do WhatsApp (`src/app/api/whatsapp/webhook/route.ts:691-700`)
já detecta palavras-chave de descadastro ("sair", "stop", "parar",
"cancelar", "opt-out", "optout", "descadastrar", "descadastra") e marca
`contacts.opt_out = true` / `opt_out_at` automaticamente. Isso funciona.

O problema é que `src/app/api/whatsapp/broadcast/route.ts` recebe a
lista de destinatários (`recipients` ou `phone_numbers`) direto do corpo
da requisição e dispara para todos, em loop (linhas 189-254), sem
consultar `contacts.opt_out` em nenhum momento. Não há filtro nem no
frontend (só encontrei `opt_out` referenciado em
`contact-detail-view.tsx`, que é a tela de detalhe de um contato
individual, não a tela de broadcast) nem no backend. Um contato que já
pediu para sair continua recebendo campanhas em massa normalmente.

Isso é um risco duplo: descumprimento do direito de revogação de
consentimento (Art. 18 LGPD) e risco de penalização de qualidade do
número/WABA pela própria Meta, que monitora reclamações de usuários que
continuam recebendo mensagem depois de pedir para parar.

## O que precisa ser feito

Em `src/app/api/whatsapp/broadcast/route.ts`, depois de resolver
`recipients` (linha ~135) e antes do loop de envio (linha ~189):

1. Buscar em `contacts`, escopado por `account_id` (mesma conta já
   resolvida em `accountId`, linha 92), os contatos cujo telefone bate
   com os destinatários recebidos, trazendo `phone` e `opt_out`.
   Normalizar o telefone com `sanitizePhoneForMeta` (já importado) dos
   dois lados antes de comparar, para não perder casamento por
   diferença de formatação (prefixo `+`, DDD, etc. — mesma lógica que
   `phoneVariants` já trata para envio).
2. Antes de cada envio no loop, se o telefone do destinatário
   corresponder a um contato com `opt_out = true`, **não enviar** —
   empurrar para `results` com
   `{ phone, status: 'failed', error: 'Contato optou por não receber mensagens (opt-out)' }`
   e incrementar `failedCount`, do mesmo jeito que já é feito para
   telefone inválido (linhas 192-200), reaproveitando o padrão existente.
3. Isso vale independentemente de quem monta a lista de destinatários —
   não confiar em nenhum filtro que venha do frontend; a checagem tem
   que estar no backend, porque é o único lugar que garante que ela
   sempre roda.

## Critério de aceite

- Marcar um contato de teste com `opt_out = true` (via toggle na tela do
  contato, ou respondendo "PARAR" no WhatsApp) → disparar um broadcast
  incluindo o telefone desse contato → o envio para ele deve ser
  recusado no `results` com status `failed` e motivo de opt-out, sem
  chamar a API da Meta para esse destinatário.
- Contatos sem opt-out no mesmo broadcast continuam recebendo
  normalmente.
- Nenhuma regressão no fluxo de variantes de telefone
  (`phoneVariants`) nem no tratamento de erro de "recipient not
  allowed" já existente.
