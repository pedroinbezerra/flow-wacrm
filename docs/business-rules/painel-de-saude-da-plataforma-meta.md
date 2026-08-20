# Painel de Saúde da Plataforma Meta

Como o mantenedor do FlowHub descobre que a Meta mudou o chão debaixo do
produto — antes que isso vire chamado de cliente. E por que a tabela de
prazos deste painel é digitada à mão de propósito.

Estado em 20/08/2026. Construído e **exercitado contra a Meta real**: as
quatro fontes foram consultadas ao vivo e o painel encontrou problemas
verdadeiros na primeira execução (§4).

---

## 1. O problema

A Meta desliga coisas com data marcada, e o aviso não chega a ninguém em
particular. Uma versão da Graph API expira; um fluxo de onboarding é
descontinuado; um endpoint muda de comportamento. Nada disso quebra hoje —
quebra num dia futuro, sem aviso local, e o produto descobre pelo suporte.

O segundo problema é de outra natureza: quando algo falha, **saber de quem é
a culpa**. Sem um lugar que responda "a Cloud API está fora do ar agora?", a
equipe investiga o próprio código durante uma indisponibilidade da Meta —
gastando as horas em que menos se pode gastar.

Este painel responde às duas perguntas. Ele **não** é ferramenta de cliente:
o leitor é quem opera o FlowHub, e a tela vive atrás de `requireSuperAdmin`.

## 2. As quatro fontes, e o que cada uma pode

| Bloco | Fonte | Ao vivo? |
| --- | --- | --- |
| Capacidade de envio por conta | Health Status API — `GET /{id}?fields=health_status` | Sim |
| Serviços da Meta | `metastatus.com/data/orgs.json` | Sim |
| Anúncios | RSS do changelog da Business Messaging | Sim |
| Consumo de quota | Cabeçalhos `X-App-Usage` e `X-Business-Use-Case-Usage` | Sim |
| **Prazos de versão** | **Tabela mantida à mão** | **Não** |

**A fonte de status não é o RSS.** A página de status é uma SPA; o RSS serve
ao histórico de incidentes, não ao estado atual. O estado vem de um JSON
estático que a própria página consome, com todos os produtos e o estado de
cada serviço — estruturado, e por isso preferido. Foi descoberto lendo o
tráfego da página, não em documentação. **Nenhum destes endereços é
contratual**: se a Meta mudar o formato, a leitura degrada para "não foi
possível consultar" e a tela diz isso.

**O consumo de quota não custa chamada nenhuma.** Toda resposta da Graph API
já traz os cabeçalhos; o projeto os descartava. A captura acontece em
`throwMetaError` — por onde passa toda falha da Meta, que é exatamente
quando quota importa — e nos dois envios de maior volume. É *fire and
forget*: observabilidade nunca pode adicionar latência nem derrubar a
chamada que observa.

## 3. A decisão que este documento existe para registrar

**A tabela de prazos de versão é digitada à mão.** Está em
`src/lib/meta-platform/graph-versions.ts`, com data de conferência humana
no topo.

Num painel que se anuncia como monitoramento ao vivo, isso parece esquecimento.
Não é. **Não existe endpoint na Meta que devolva a data de expiração de uma
versão.** O que é consultável é a versão mais recente da plataforma e a
lista de depreciações do app; os prazos de morte das versões antigas só
existem em página de documentação. Isso foi procurado antes de a tabela ser
escrita.

Se alguém for "corrigir" isto depois: **esta é a razão de não estar
automatizado.** O caminho que parece óbvio — achar o endpoint — já foi
tentado.

Duas consequências desenhadas em cima disso:

- A tela **declara** que este quadro não vem de consulta ao vivo, e mostra a
  data da última conferência. Um prazo que envelhece calado é o defeito que
  o painel existe para matar (`FH-36.06`).
- Passados 120 dias sem reconferência, a própria tela avisa que os números
  podem estar velhos. A tabela sabe quando ela mesma ficou duvidosa.

## 4. Decisões que não são óbvias no código

**Nada nesta tela altera estado.** Nem na Meta, nem no banco. Uma tela de
diagnóstico que muda o que observa é uma tela em que não se confia — e
`/register`, troca de PIN e envio de mensagem ficam fora daqui por decisão,
não por falta de tempo.

**Ausência de resposta nunca é exibida como saúde.** Estado desconhecido da
Meta vira `desconhecido`, não `operacional`; `can_send_message` com valor
novo vira `UNKNOWN`, não `AVAILABLE`; e produto vale pelo seu pior serviço
(`FH-10.04`, `FH-41.05`). Cada bloco falha por conta própria: uma WABA que
não respondeu não derruba o quadro de incidentes.

**"Não consegui ler" e "não existe" são frases diferentes.** A primeira
versão desta tela dizia *"Nenhuma conexão cadastrada"* enquanto a leitura
tinha falhado — afirmando fato onde havia ignorância. Corrigido: com erro de
leitura, a tela diz que a lista pode estar incompleta e **mostra o motivo
real**, não uma mensagem genérica.

**O erro carrega o motivo, e isso não é descuido de segurança.** `FH-44.06`
proíbe expor detalhe interno; aqui o leitor é o mantenedor e o detalhe **é**
a informação — a mesma exceção que o `AGENTS.md` §10 prevê para telas onde o
termo técnico é o conteúdo. Foi essa escolha que revelou, em minutos, uma
coluna inexistente que uma mensagem genérica teria escondido (§5).

**Service role, não o client com RLS do usuário.** O painel é cross-tenant
por natureza. Com RLS de usuário a leitura volta quase vazia — e vazio aqui
seria lido como "ninguém com problema", o oposto da verdade. O acesso já foi
barrado por `requireSuperAdmin` antes da consulta. Os dados de outras contas
exibidos aqui têm a mesma proteção do dado do próprio usuário (`FH-11.05`):
ficam atrás do mesmo guarda, e não saem desta tela.

**O painel cruza o que guardamos com o que a Meta responde.** `registered_at`
e `last_registration_error` locais aparecem ao lado de `can_send_message` da
Meta. Divergência entre os dois é o sinal mais útil da tela — é onde mora o
problema que ninguém ainda percebeu.

## 5. Arquivos

| Arquivo | Papel |
| --- | --- |
| `src/lib/meta-platform/graph-versions.ts` | Calendário manual + avaliação de prazo |
| `src/lib/meta-platform/platform-status.ts` | Estado dos serviços da Meta |
| `src/lib/meta-platform/feeds.ts` | Leitura de RSS (changelog e incidentes) |
| `src/lib/meta-platform/health-status.ts` | Health Status API |
| `src/lib/meta-platform/app-usage.ts` | Captura e leitura dos cabeçalhos de quota |
| `src/lib/meta-platform/meta-platform.test.ts` | Cobertura das partes puras |
| `src/app/api/admin/meta-platform/route.ts` | Agrega tudo, atrás de `requireSuperAdmin` |
| `src/app/(dashboard)/admin/meta-platform/page.tsx` | Rota |
| `src/components/admin/meta-platform-panel.tsx` | A tela |
| `src/lib/whatsapp/meta-api.ts` | Pontos de captura de quota |

## 6. Verificação feita

- 30 testes novos nas partes puras; 599 no total (`vitest run`).
- `tsc --noEmit` limpo.
- **Painel acionado contra a Meta real.** Os quatro blocos responderam.

O painel encontrou, na primeira execução, problemas verdadeiros no número
conectado — `BLOCKED` para envio, com **141006** (erro no método de
pagamento, que bloqueia conversas iniciadas pelo negócio), **141010**
(verificação de negócio não concluída) e 138024/138025 (SIP não
configurado). Nenhum deles era conhecido antes de a tela existir. É o
comportamento pretendido: descobrir antes do chamado.

**As dez heurísticas do Capítulo 61 foram percorridas** em tarefa real,
com estados adversos, e produziram três achados — todos corrigidos nesta
entrega, nenhum registrado como dívida (`FH-61.01`, `FH-61.04`):

| # | Achado | Evidência | Correção |
| --- | --- | --- | --- |
| **H4**, **H7** | Dois `<h1>` com texto idêntico: o cabeçalho do shell já titula a página e o painel repetia | `document.querySelectorAll('h1')` devolvia dois nós com o mesmo texto | O `<h1>` do painel saiu; ficou só a linha descritiva |
| **H7** | O estado bruto da Meta vivia só em `title=`, alcançável por mouse — e é a **única** informação existente quando não sabemos traduzir o estado | 11 `span[title]` dentro de `main` | Com estado `desconhecido`, a frase original da Meta é exibida como texto |
| **H1**, **H7** | "Atualizar" trocava todo o conteúdo sem anunciar nada e sem mover foco | zero `[aria-live]` em `main` | Marca de horário virou região viva; o estado de carga também |

Verificado depois da correção: um único `<h1>` (no cabeçalho, fora de
`main`), uma região viva, zero informação presa em `title=`, 13 elementos
alcançáveis por teclado.

As demais heurísticas passaram sem achado: **H2** (nada é mutável nesta
tela), **H3** (não há campo a preencher), **H5** (cinco blocos, leitura
sequencial, nenhuma decisão exigida), **H6** (carga, erro, vazio, falha
parcial e sem-permissão têm estado próprio), **H8** (a tela não interrompe),
**H9** (é o eixo do desenho — §3 e §4), **H10** (cada bloco explica a
própria fonte no cabeçalho).

Três defeitos foram achados **pela verificação**, não pelos testes:

1. **RLS** — o route usava o client do usuário; a leitura cross-tenant
   voltava vazia.
2. **Coluna inventada** — `display_phone_number` não existe em
   `whatsapp_config`; veio de suposição. Substituída por `registered_at`,
   `last_registration_error` e `status`, que existem e servem melhor.
3. **Entidades de RSS** — a marcação era removida *antes* de as entidades
   serem decodificadas, então `&lt;b&gt;` ressurgia como `<b>` no texto; e
   faltava a forma hexadecimal (`&#x2014;`), que a Meta usa no changelog.

## 7. O que continua em aberto

- **Estados adversos de plataforma.** O comportamento com serviço da Meta
  realmente degradado ou fora do ar continua exercitado apenas por teste
  unitário — durante toda a verificação, todos os serviços responderam
  operacionais.
- **Alerta.** Por decisão, o painel só existe como tela: nada dispara
  sozinho, não há job agendado nem aviso em canal interno. Acrescentar isso
  depois não exige refazer o que está feito.
- **Histórico de incidentes.** A URL do feed por produto já é montada e
  devolvida pela API (`incidentFeedUrl`), mas a tela ainda não a consome —
  só mostra o estado atual.
- **Consumo por WABA.** `X-Business-Use-Case-Usage` é capturado e guardado
  por WABA, mas a tela exibe apenas o consumo do app.
- **Sem teste de ponta a ponta do route.** As partes puras têm cobertura; a
  agregação foi verificada acionando a tela, não por teste automatizado.
- **Cobertura de produtos.** Hoje o painel observa WhatsApp Business
  Platform, Graph API e Facebook Login. O JSON traz outros (Marketing API,
  Messenger, Catalog) — acrescentar é uma linha em `TRACKED_ORGS`.

### Fontes

- [Messaging and Calling Health Status](https://developers.facebook.com/documentation/business-messaging/whatsapp/support/health-status/)
- [WhatsApp for Business Platform Status](https://developers.facebook.com/documentation/business-messaging/whatsapp/support/api-status-page)
- [Graph API changelog — calendário de versões](https://developers.facebook.com/docs/graph-api/changelog)
- [Error codes](https://developers.facebook.com/documentation/business-messaging/whatsapp/support/error-codes)
- `https://metastatus.com/data/orgs.json` — estado dos serviços (não contratual)

---

## Conformidade constitucional

**Artigos aplicados:** FH-10.04, FH-41.05, FH-36.06, FH-44.06, FH-11.05

**Decisões constitucionais:**

- Estado desconhecido da Meta é exibido como desconhecido, nunca como
  operacional; produto resume-se pelo pior serviço — fundamento: FH-10.04.
- Falha parcial de leitura tem estado próprio, e "não consegui ler" nunca é
  apresentado como "não existe" — fundamento: FH-41.05.
- A tabela de prazos declara ser manual e mostra a data da última
  conferência; passados 120 dias, a tela avisa que pode estar velha —
  fundamento: FH-36.06.
- Dados de outras contas exibidos ao mantenedor ficam atrás do mesmo guarda
  do dado do próprio usuário e não saem desta tela — fundamento: FH-11.05.

**Interpretações adotadas:** `FH-44.06` proíbe expor detalhe interno. Aqui o
leitor é o mantenedor e o detalhe técnico é o conteúdo da tela, não um
vazamento — mesma exceção que o `AGENTS.md` §10 prevê para superfícies em
que o termo **é** a informação. A proibição foi lida como dirigida a texto
de usuário final.

**Lacunas encontradas:** nenhuma. As decisões couberam em artigos existentes.

**Dívidas identificadas:** nenhuma em aberto. A ausência de `requireRole`
em `POST` e `DELETE /api/whatsapp/config` foi encontrada como dívida
preexistente e **corrigida** — ver `reativacao-de-numero-e-pin-de-duas-etapas.md`
§5.4. Achado órfão (encontrado, não corrigido, não registrado) é
anti-padrão explícito do Capítulo 61 §7.

**Não verificado:**

- Comportamento da tela com serviço da Meta **realmente degradado ou fora do
  ar**. Todos os serviços estavam operacionais durante a verificação; os
  estados `degradado` e `fora` só foram exercitados por teste unitário, com
  payload construído à mão. É o motivo de **H6** ter sido avaliada com
  estado simulado, e não observado.
- Comportamento do bloco de quota com valores reais: nenhum cabeçalho havia
  sido observado até o fim da verificação, então as barras não chegaram a
  renderizar com dado vivo.
- A checklist do Capítulo 63 não foi percorrida item a item. As dez
  heurísticas do Capítulo 61 **foram** — resultado em §6.
