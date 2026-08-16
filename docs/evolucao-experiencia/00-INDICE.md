# Mapas de Evolução de Experiência

> Documentos desta pasta não são Constituição, não são Direção Artística e não
> são `AGENTS.md`. São **propostas** de reconstrução de experiência — o
> equivalente estendido de um RFC de Experiência (`docs/constituicao/ANEXO-D-modelos.md`,
> modelo D2) para trabalhos de reinvenção, não apenas de tela nova.
>
> Cada mapa responde: qual é o problema real, o que a Constituição já obriga
> preservar, o que pode ser descartado por ser apenas hábito de implementação,
> e qual experiência deveria existir no lugar. Nenhum mapa autoriza violar um
> artigo `DEVE`/`NUNCA` — onde uma proposta esbarra em um desses, o documento
> sinaliza o conflito em vez de decidir por conta própria (`FH-01.05`, §0.11 do
> Volume 0).
>
> **Princípio orientador.** Esta pasta é a aplicação prática de
> `docs/LIBERDADE-DE-SOLUCAO.md`: a implementação atual de cada área é ponto de
> partida para compreensão, nunca limite criativo. Antes de escrever um mapa,
> percorrer as três leituras do método (como funciona hoje, como melhora
> mantendo a estrutura, como seria reconstruído do zero) — a terceira é a que
> mais frequentemente falta e a que este documento existe para garantir que
> não falte.
>
> **Método.** Cada área é percorrida na ordem em que aparece na navegação
> principal (`src/components/layout/sidebar.tsx`), de cima para baixo — não
> por urgência de negócio, apenas para que a cobertura seja sistemática e
> nada fique esquecido por não ter sido pedido explicitamente.

## Estado da cobertura

| # | Área | Rota | Mapa | Status |
| --- | --- | --- | --- | --- |
| 1 | Dashboard (Home) | `/dashboard` | [`01-home-dashboard.md`](01-home-dashboard.md) | Implementado (parcial) — ver nota de implementação no mapa |
| 2 | Inbox | `/inbox` | [`02-inbox.md`](02-inbox.md) | Rascunho |
| 3 | Boards | `/boards` | — | Pendente |
| 4 | Contacts | `/contacts` | [`04-contacts.md`](04-contacts.md) | Implementado |
| 5 | Pipelines | `/pipelines` | — | Pendente |
| 6 | Broadcasts | `/broadcasts` | — | Pendente |
| 7 | Automations | `/automations` | [`07-automations.md`](07-automations.md) | Rascunho |
| 8 | Document Delivery | `/processes/document-delivery` | — | Pendente |
| 9 | Flows | `/flows` | [`09-flows.md`](09-flows.md) | Implementado |
| 10 | AI Assistant | `/ai-assistant` | — | Pendente |
| 11 | Central de Ajuda & FAQ | `/faq` | [`11-faq.md`](11-faq.md) | Implementado |
| — | Settings (fora da navegação principal) | `/settings` | — | Pendente, avaliar por último |

Um mapa muda de "Rascunho" para "Aprovado" apenas por decisão explícita do
responsável de produto. Nenhuma implementação começa a partir de um mapa em
rascunho.
