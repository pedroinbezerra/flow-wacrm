# Novas Páginas — Solicitação de Direitos do Titular (LGPD) e Subprocessadores

Direcionamento para criar duas páginas públicas institucionais recomendadas
pela revisão jurídica do pacote de governança (Política de Privacidade, DPA,
RAT etc.): uma página onde qualquer titular (contato final de um cliente,
ou usuário de uma conta) pode abrir uma solicitação de direitos LGPD
diretamente com o DPO da Flow Hub, e uma página com a lista de
subprocessadores/fornecedores, hoje só documentada no RAT interno.

Nenhuma das duas existe hoje. Já existem três páginas públicas equivalentes
que servem de modelo de layout: `src/app/privacy/page.tsx`,
`src/app/terms/page.tsx` e `src/app/cookies/page.tsx`. Nenhuma rota especial
precisa ser registrada para torná-las públicas — o proxy
(`src/proxy.ts`, lista `protectedPaths`) só protege rotas dentro do
grupo `(dashboard)`; qualquer página criada fora desse grupo já nasce
pública.

---

## 0. Correção urgente e independente: e-mail do DPO desatualizado

Antes de tudo: as três páginas públicas existentes (`privacy/page.tsx`,
`terms/page.tsx`, `cookies/page.tsx`) têm hoje o e-mail do DPO
**hardcoded como `dpo@flow-crm.com`**. Esse não é o e-mail correto — o
e-mail oficial do DPO, usado em todos os documentos de governança (Política
de Privacidade, DPA, RAT etc.), é **`flowsystems@flowofc.com.br`**.

Isso precisa ser corrigido nos três arquivos **independentemente** do
restante deste documento, e o quanto antes: hoje, qualquer titular que
tentar exercer seus direitos pelo e-mail exibido no site está sendo
direcionado para um endereço que não existe ou não é monitorado.

## 1. O que precisa ser feito

### A. Página de Solicitação de Direitos do Titular (`/lgpd`)

Nova página pública, seguindo o mesmo template estrutural de
`src/app/cookies/page.tsx` (header com `FlowLogo` + `PublicHeaderNav`,
`<main>` centralizado com seções em cards, footer com os links
institucionais).

Conteúdo da página:
- Explicação curta dos direitos do titular (Art. 18 da LGPD), reaproveitando
  o texto já existente na seção correspondente de `privacy/page.tsx`.
- Deixar explícito que, se o solicitante é um **contato final** de um
  cliente contratante da Flow Hub, o pedido deve ser dirigido
  preferencialmente a esse negócio — mas que a Flow Hub também recebe e
  encaminha/orienta quando procurada diretamente (mesma lógica já usada na
  Política de Privacidade, seção 11).
- Um formulário com: nome, e-mail para contato, tipo de solicitação (acesso,
  correção, eliminação, portabilidade, oposição/revogação de consentimento,
  outro), e um campo de descrição livre.
- Submissão do formulário deve:
  1. Gravar a solicitação em uma nova tabela (nova migration,
     `supabase/migrations/048_dpo_requests.sql` ou próximo número livre),
     por exemplo `dpo_requests` com colunas: `id`, `name`, `email`,
     `request_type`, `description`, `status` (`open`/`in_progress`/`closed`),
     `created_at`, `closed_at`. Sem RLS de leitura pública — só Super Admin
     acessa.
  2. Notificar o DPO. Como não há hoje nenhuma biblioteca de envio de
     e-mail transacional instalada no projeto (`package.json` não tem
     Resend, Nodemailer, SendGrid, Postmark ou similar), a forma mais
     simples de resolver isso agora, sem adicionar uma dependência nova, é
     reaproveitar o mesmo mecanismo de alerta interno via WhatsApp
     operacional já usado para eventos de segurança e auditoria
     (`src/app/api/internal/alerts/security-event/route.ts` e a função
     `sendTextMessage` de `src/lib/whatsapp/meta-api.ts`), disparando uma
     mensagem para o WhatsApp operacional da Flow Systems sempre que uma
     nova solicitação for registrada. Adicionar e-mail transacional de
     verdade pode ficar para uma segunda iteração, se o volume justificar.
- Novo endpoint público: `POST /api/dpo-requests` (sem autenticação — é
  para titulares externos, que não têm conta na plataforma), fazendo o
  insert na tabela acima e disparando o alerta.
- Rate limiting básico no endpoint (reaproveitar o mecanismo de limitação de
  requisições já usado em outros endpoints públicos do projeto), para evitar
  abuso do formulário.

### B. Página de Subprocessadores (`/subprocessadores`)

Nova página pública, mesmo template visual das demais. Não precisa de
banco de dados — pode ser conteúdo estático (mesmo padrão já usado na
tabela de fornecedores de cookies dentro de `cookies/page.tsx`), reproduzindo
a tabela "Inventário de Operadores e Suboperadores" do RAT
(`docs/legal/RAT-Registro-Operacoes-Tratamento-FlowHub-v2.docx`): Supabase,
Vercel, Meta Platforms Inc., provedor de IA escolhido pelo cliente, Asaas,
Google LLC, Microsoft Corporation — com função, país e dados envolvidos.

Importante: como esse inventário já é mantido "vivo" no RAT (e tende a
crescer conforme a Flow Hub cresce), o ideal é que quem atualizar o RAT
lembre de atualizar esta página também — não há automação entre os dois
neste momento, é responsabilidade manual de manter sincronizado.

### C. Footer das páginas institucionais

Adicionar dois novos links no footer repetido em `privacy/page.tsx`,
`terms/page.tsx` e `cookies/page.tsx` (e nas duas páginas novas):
"Solicitações de Titular (LGPD)" → `/lgpd`, e "Subprocessadores" →
`/subprocessadores`.

## Critério de aceite

- E-mail do DPO corrigido para `flowsystems@flowofc.com.br` nas três
  páginas existentes.
- `/lgpd` acessível sem autenticação, com formulário funcional: ao enviar,
  cria um registro em `dpo_requests` e dispara o alerta operacional.
- Envio do formulário com campos obrigatórios vazios é rejeitado com
  mensagem de erro (validação básica).
- `/subprocessadores` acessível sem autenticação, com a tabela de
  fornecedores correspondente ao RAT atual.
- Footer das cinco páginas públicas institucionais (`privacy`, `terms`,
  `cookies`, `lgpd`, `subprocessadores`) com os mesmos links, incluindo os
  dois novos.
