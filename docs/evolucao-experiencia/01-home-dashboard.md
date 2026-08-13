# Mapa de Evolução — Home (hoje "Dashboard")

| Campo | Valor |
| --- | --- |
| Área | Item 1 da navegação principal — `navigation.dashboard` |
| Rota atual | `/dashboard` — destino fixo de login para todo papel (`src/app/(auth)/login/page.tsx:98`) |
| Arquivos hoje envolvidos | `src/app/(dashboard)/dashboard/page.tsx`, `src/components/dashboard/*`, `src/lib/dashboard/*`, `src/components/onboarding/onboarding-checklist.tsx` |
| Status | Rascunho — mapa de evolução, não autoriza implementação por si só |
| Arquétipo declarado pela Constituição | **Analítica com entrada operacional** (`PRINCIPIO-FUNDADOR.md`, §"Home"; Volume II, cap. 4.6) |

---

## O problema atual

A tela hoje é um dashboard de KPIs no sentido mais literal: quatro cartões de
métrica (conversas ativas, novos contatos hoje, valor de negócios abertos,
mensagens enviadas hoje), quatro atalhos fixos de criação, um gráfico de linha
de conversas por período, um donut de pipeline, um gráfico de tempo de
resposta por dia da semana, um feed de atividade recente e um widget de
onboarding. Tecnicamente bem construído — estados de carregamento, vazio e
erro existem, os números têm período declarado, o layout é responsivo — mas a
**composição** é a de um relatório retrospectivo, não a de um ponto de
partida de trabalho.

Isso é exatamente o que a própria carta de princípios do produto proíbe para
esta área, textualmente:

> "Não é simplesmente um dashboard. Não é uma coleção de métricas. Não tenta
> mostrar tudo. Ela responde: **'O que importa agora?'**"
> — `docs/PRINCIPIO-FUNDADOR.md`, seção "Home"

A tela atual não responde a essa pergunta. Ela responde "o que aconteceu
recentemente" e "como estão os números" — perguntas legítimas, mas
secundárias. Nenhum elemento da tela diz ao usuário, ao abrir o produto pela
manhã: *estas três conversas estão esperando resposta há duas horas*, *este
negócio não se move há oito dias*, *esta automação está falhando desde
ontem*, *há pendências de documento vencendo hoje*. Toda essa informação já
existe em outras áreas do produto (Inbox, Pipelines, Automations, Document
Delivery) — a Home simplesmente não a agrega para o momento de entrada.

Há um desalinhamento estrutural adicional: a Home é o destino de login de
**todo** papel — Operador, Gestor, Construtor, Responsável (`FH-13.02`
estabelece exatamente essa ordem de prioridade em uso diário). Mas a
composição atual da tela — KPIs agregados, valor de pipeline, tendência de
mensagens — é conteúdo de leitura de Gestor/Responsável (sessões curtas,
decisão, visão geral), não de Operador (uso contínuo, "o que eu faço agora").
Quem entra no produto para atender é recebido com um relatório, não com uma
fila de trabalho. Isso não chega a ser uma violação literal de `FH-13.04`
("nunca degradar o Operador em tarefa de alta frequência para beneficiar
outro") porque a Home não está no caminho de nenhuma tarefa específica — mas
desperdiça exatamente o momento em que o produto tem mais chance de reduzir
esforço real, que é a entrada do dia.

## Três leituras

**Como funciona hoje.** Um dashboard analítico genérico: métricas agregadas,
gráficos de tendência, feed de atividade. Toda a inteligência está em
descrever o passado.

**Como poderia melhorar mantendo a estrutura atual.** Reordenar os widgets,
adicionar mais gráficos, deixar o feed de atividade mais rico, permitir
personalizar quais cartões aparecem. Isso deixaria o dashboard mais bonito e
mais configurável — e configurável é dívida (`FH-06.04`): cada preferência
que o usuário precisa ajustar é trabalho que o sistema deveria ter deduzido
sozinho. Essa rota resolve a superfície, não o problema: a tela continuaria
sendo um relatório, só que um relatório mais longo.

**Como seria reconstruída do zero.** Não como um dashboard com uma seção de
pendências anexada, mas como uma **fila de atenção operacional** com um
painel analítico abaixo dela — nessa ordem, porque a ordem *é* a decisão de
produto. O painel analítico de hoje não desaparece: ele deixa de ser a tela
inteira para se tornar a segunda metade dela. Esta é a leitura adotada abaixo.

## O objetivo da experiência

Ao abrir o FlowHub, a pessoa deve saber em menos de três segundos: *o que
precisa de mim agora, e o que está indo bem sem precisar de mim*. A sensação-
alvo é a do próprio Princípio Fundador — "eu sei por onde começar" — não "aqui
estão meus números". Isso vale igualmente para quem atende o dia inteiro e
para quem entra uma vez por semana para acompanhar: ambos encontram a mesma
tela, com a mesma ordem, porque nenhuma versão separada por papel é permitida
(`FH-13.05`) — o que muda é o que cada um encontra relevante nela, não a tela
em si.

## O que deve ser preservado

- **Todo o isolamento por conta.** As consultas em `src/lib/dashboard/queries.ts`
  já dependem inteiramente de RLS por sessão — nenhuma nova superfície pode
  reduzir esse isolamento (`FH-10.06`, `FH-03.02`).
- **Os cinco cálculos existentes como fonte de dado**, não como widgets fixos:
  conversas ativas, contatos novos, valor/quantidade de negócios abertos,
  mensagens enviadas, série de conversas por período, distribuição de
  pipeline, tempo de resposta por dia da semana. Nenhum desse trabalho de
  agregação é descartado — ele muda de lugar e de peso visual.
- **O mecanismo de onboarding** (`/api/onboarding/progress`,
  `OnboardingChecklist`) como capacidade — configuração útil que deixa estado
  real, pulável e recuperável (`FH-26.02`, `FH-26.03`). O que muda é a
  permanência dele na superfície principal, não sua existência.
- **A disciplina de estados já presente**: carregando, vazio, com dado — deve
  se estender à fila de atenção nova, não regredir.
- **Reutilização de componentes existentes** (`MetricCard`, `EmptyState`,
  `Skeleton`, cartões com `border-border`/`bg-card`) em vez de um sistema
  visual novo para a fila de atenção (`FH-28.01`, `FH-28.02`).

## O que pode ser descartado

- **A moldura de "dashboard de métricas" como enquadramento da tela.** A
  Constituição já nomeia isso como o erro a evitar; a implementação atual é
  dívida de experiência (`FH-01.06`), não precedente.
- **A posição de topo dos quatro cartões de métrica.** Eles continuam
  existindo, mas deixam de ser a primeira coisa vista — hoje ocupam o lugar
  que a ordem canônica (`FH-24.01`: identidade → estado → conteúdo → ação)
  reserva ao estado mais urgente, e hoje esse lugar é ocupado por números
  neutros, não por estado que pede ação.
- **A fila de atalhos fixos e idênticos para todos.** `QuickActions` hoje
  sempre mostra os mesmos quatro links, independentemente de haver ou não algo
  pendente que os torne relevantes agora. Pode continuar existindo como
  fallback (ver abaixo), mas não como a única forma de ação rápida.
- **A permanência indefinida do botão flutuante "Jornada"** depois que o
  checklist é dispensado. Reabrir onboarding continua sendo obrigatório
  (`FH-26.03`), mas não precisa ocupar espaço permanente na tela de maior
  frequência de uso do produto — um capítulo já com mecanismo natural para
  isso é `Configurações` ou o menu da conta.

## O que deve ser reinventado

O núcleo da reinvenção é uma seção nova, **Fila de Atenção**, computada
inteiramente a partir de dado que o sistema já observa — nenhum campo novo
pedido ao usuário (`FH-06.01`, `FH-06.02`) — cruzando quatro fontes que hoje
vivem isoladas em suas próprias áreas:

| Fonte | O que já existe | O que falta agregar |
| --- | --- | --- |
| Conversas sem resposta | `messages`, já usado em `loadResponseTime` | Conversas abertas cujo último evento é do cliente, ordenadas por tempo de espera |
| Negócios parados | `deals`, já usado em `loadPipelineDonut` | Negócios abertos sem atualização há N dias, com o estágio atual |
| Automações falhando | `automation_logs`, já usado em `loadActivity` | Falhas recentes não reconhecidas, agrupadas por automação |
| Pendências de documento | Domínio de `processes/document-delivery/pendencies` | Pendências vencidas ou vencendo, reaproveitando a lógica já existente naquela área — sem duplicá-la |

Cada item da fila é: o que é, há quanto tempo, e um único link de ação
direta para o lugar onde se resolve — a fila nunca resolve nada por si
(nível de autonomia 1, "informar" — `FH-18.01`, matriz C3 do Anexo C). Isso
não é um novo domínio de dado, é a primeira vez que dado de quatro áreas
diferentes converge no único ponto que o modelo mental do produto já promete
que existe: a Pessoa como centro de gravidade (`FH-20.02`).

O estado de fila vazia — nenhum item pendente — é o resultado desejado, não
um vazio comum: trata-se como conclusão (linha `Conclusão` da matriz C19 do
Anexo C), com reconhecimento discreto e proporcional (`FH-09.04`), nunca como
"nenhum dado encontrado".

## Qual experiência deve existir no lugar

Composição de cima para baixo, respeitando `FH-24.01` e `FH-24.03`:

1. **Identidade e estado geral** — um cabeçalho curto que substitui o título
   genérico "Dashboard" por uma frase de estado (ex.: quantos itens pedem
   atenção agora), não por um rótulo de seção do produto.
2. **Fila de Atenção** — a tarefa dominante da tela (`FH-08.09`). Densidade
   alta o suficiente para ser lida em segundos, mas sem exceder o orçamento de
   sete blocos de informação simultâneos (`FH-15.01`) — se houver mais de
   sete itens, a fila resume por categoria em vez de listar tudo.
3. **Ações rápidas contextuais** — os mesmos quatro atalhos de hoje continuam
   como padrão estável quando não há contexto mais relevante (`FH-16.02`:
   posição de ação frequente não muda sem motivo), mas cedem lugar a uma ação
   sugerida quando a Fila de Atenção aponta claramente para uma (ex.: muitas
   pendências de documento → atalho para revisá-las substitui, não some).
4. **Panorama** — o conteúdo analítico de hoje (cartões de métrica, gráfico de
   conversas, donut de pipeline, tempo de resposta), preservado quase
   integralmente, mas reclassificado como conteúdo de densidade média
   (arquétipo Analítico, `FH-24.07`) e explicitamente secundário à Fila de
   Atenção — não removido, reposicionado.
5. **Atividade recente** — mantém-se como registro do que aconteceu, distinto
   da Fila de Atenção (que é o que ainda pede decisão). As duas seções não
   são redundantes: uma é histórico, a outra é fila de trabalho.
6. **Onboarding** — visível de forma proeminente apenas durante o estado
   inaugural da conta (`FH-27.01`); depois de concluído ou dispensado, o
   ponto de retomada migra para fora da superfície de maior frequência.

Nenhuma dessas seções introduz navegação nova, nem modal, nem página — tudo
permanece endereçável em `/dashboard`, preservando o contrato de continuidade
já existente (`FH-10.05`).

## Quais fluxos devem mudar

- **Entrada diária do Operador**: hoje começa lendo números; passa a começar
  respondendo à Fila de Atenção. O fluxo de "abrir o produto → decidir o que
  fazer" perde uma etapa de interpretação (`FH-07.04`, esforço mínimo).
- **Retomada de onboarding**: hoje é um botão que convive permanentemente com
  a tela principal; passa a viver em um lugar estável fora da rota de maior
  frequência, mantendo a obrigação de ser recuperável (`FH-26.03`) sem
  competir com a tarefa dominante (`FH-24.06`).
- **Descoberta de negócios parados e automações falhando**: hoje exige que o
  usuário visite Pipelines ou Automations especificamente para notar o
  problema; passa a aparecer proativamente (nível de autonomia 1 — apenas
  informa, nunca age sozinho) no primeiro acesso do dia.

## Quais telas podem deixar de existir

Nenhuma. Inbox, Pipelines, Automations e Document Delivery continuam sendo o
lugar onde cada item da Fila de Atenção é de fato resolvido — a Home aponta
para lá, não os substitui (`FH-22.03`, "um lar, muitas janelas": a informação
tem um lar canônico único; a Fila de Atenção é uma janela para ele, não um
segundo lar).

## Quais novas etapas podem ser necessárias

Nenhuma etapa nova para o usuário — o objetivo explícito desta reconstrução é
remover interpretação, não adicionar passos (`FH-06.07`). As "etapas novas"
são inteiramente do lado do sistema: computar e ranquear os quatro tipos de
item da fila antes de renderizar a tela.

## Quais novos componentes ou padrões podem ser necessários

- **`AttentionQueue`** (nome provisório) — lista de itens heterogêneos
  (conversa, negócio, automação, pendência) com ícone por tipo, tempo
  decorrido e link de ação única. Deve ser composto a partir dos primitivos
  já existentes (badge, item de lista, `EmptyState`) — antes de propor um
  componente novo, esgotar a composição de primitivas existentes (`FH-28.02`,
  modelo D4 do Anexo D caso um componente genuinamente novo se mostre
  necessário).
- **Uma função de agregação server/client** equivalente às já existentes em
  `src/lib/dashboard/queries.ts` (`loadAttentionQueue`), que reaproveita a
  lógica de agrupamento por conversa já usada em `loadResponseTime` e a lógica
  de pendências já usada em `processes/document-delivery/pendencies` — sem
  duplicar regra de negócio em dois lugares (risco relevante: a definição de
  "pendência vencida" já existe naquela área e precisa ter uma única fonte de
  verdade).
- Nenhum padrão de interação novo é necessário — clique em item leva à área
  correspondente, exatamente como o feed de atividade já faz hoje.

## Quais impactos técnicos precisam ser considerados

- **Origem única da regra de negócio.** "Pendência vencida" e "negócio
  parado" (limiar de dias sem atividade) precisam de definição única,
  reutilizada pela Home e pela área de origem — não duas implementações do
  mesmo conceito.
- **Limiares sem configuração.** Um limiar como "sem resposta há mais de N
  horas" deve ter um padrão inteligente que funcione sem configuração
  (`FH-06.04`); expor esse número como preferência do usuário só se justifica
  se houver evidência real de que o padrão não serve, nunca por antecipação.
- **Custo de agregação em contas grandes.** O código atual já registra a
  mesma preocupação (`queries.ts`, comentário de topo): agregação é feita no
  cliente e pode não escalar. A Fila de Atenção soma mais uma fonte de
  agregação cross-domínio; é candidata natural a uma RPC consolidada se o
  volume de mensagens/negócios/automações justificar (`FH-24.09`, Capítulo
  36 — dados, densidade e escala).
- **Reaproveitamento de RLS existente.** Nenhuma das quatro fontes exige nova
  política de acesso — todas já são lidas hoje em outras áreas pelo mesmo
  usuário.
- **i18n.** Toda copy nova entra em `src/i18n/messages/pt-BR.json` sob uma
  chave própria (ex.: `dashboard.attention.*`), seguindo o padrão hierárquico
  já usado por `dashboard.activity.*`.

## Quais regras da documentação existente não podem ser violadas

- `FH-05.09` — agrupamento por tarefa do usuário, nunca por origem técnica do
  dado (a Fila de Atenção mistura quatro tabelas porque a tarefa do usuário
  — "o que preciso fazer" — é uma só).
- `FH-06.01`, `FH-06.02` — nenhum dado novo é pedido ao usuário; tudo é
  derivado do que o sistema já observa.
- `FH-06.04` — nenhum limiar vira configuração obrigatória sem evidência.
- `FH-08.02` — no máximo três decisões simultâneas na tarefa dominante; a
  Fila de Atenção é para escanear e agir, não para decidir múltiplas coisas
  ao mesmo tempo.
- `FH-13.05` — nenhuma versão separada da Home por papel; o que muda é
  relevância percebida, nunca a existência de uma tela paralela.
- `FH-15.01` — no máximo sete blocos de informação simultâneos na leitura
  principal.
- `FH-17.02`, `FH-17.07` — a Fila de Atenção informa, nunca cria urgência
  artificial nem mecânica de engajamento (sem contadores de sequência, sem
  "streak", sem linguagem de cobrança sobre itens pendentes).
- `FH-18.01`–`FH-18.08` — todo item da fila é nível de autonomia 1
  (informar); a fila nunca executa, nunca resolve, nunca decide por conta
  própria.
- `FH-22.03` — a informação de cada domínio continua morando no seu lar
  canônico (Inbox, Pipelines, Automations, Document Delivery); a Home é
  janela, não duplicata.
- `FH-24.01`, `FH-24.06` — ordem canônica de composição; nada compete com a
  tarefa dominante da tela.
- `FH-26.03`, `FH-26.09` — onboarding continua pulável e recuperável, nunca
  vira cobrança nem barra de completude coercitiva.
- `FH-42.02` e a matriz C19 do Anexo C — o estado de "fila vazia" é tratado
  como conclusão, nunca como ausência de dado.
- `FH-10.06` — nenhuma consulta nova pode revelar, direta ou indiretamente,
  dado de outra conta.

---

## Conformidade constitucional

**Artigos aplicados:** `FH-05.09`, `FH-06.01`, `FH-06.02`, `FH-06.04`,
`FH-06.07`, `FH-08.02`, `FH-08.09`, `FH-09.04`, `FH-10.05`, `FH-10.06`,
`FH-13.02`, `FH-13.04`, `FH-13.05`, `FH-15.01`, `FH-16.02`, `FH-17.02`,
`FH-17.07`, `FH-18.01`, `FH-20.02`, `FH-22.03`, `FH-24.01`, `FH-24.03`,
`FH-24.06`, `FH-24.07`, `FH-24.09`, `FH-26.02`, `FH-26.03`, `FH-27.01`,
`FH-28.01`, `FH-28.02`, `FH-42.02`

**Decisões constitucionais:**
- A Fila de Atenção assume nível de autonomia 1 (apenas informar) — fundamento: `FH-18.01`, matriz C3.
- Nenhuma versão de Home separada por papel; apenas reordenação de relevância — fundamento: `FH-13.05`.
- Limiares de "parado"/"vencido" nascem sem configuração exposta — fundamento: `FH-06.04`.

**Interpretações adotadas:** o arquétipo "analítica com entrada operacional",
citado no Princípio Fundador mas não decomposto em artigo isolado, foi lido
como: a Fila de Atenção segue a disciplina do Arquétipo Operacional (estado e
prioridade, Volume II §4.5) e o Panorama segue a disciplina do Arquétipo
Analítico (Volume II §4.6) — a mesma tela hospeda os dois, em ordem, sem
misturá-los num terceiro padrão inédito (proibido por §0.11.4 do Volume 0).

**Checklist aplicada:** C7 (esconder/revelar/remover), C13 (mudar de lugar),
C15 (superfície de navegação), C19 (estado vazio), C3 (autonomia).

**Bloqueios absolutos verificados:** 8/8 — nenhum presente nesta proposta
(documento de intenção; verificação plena repete-se na entrega real).

**Lacunas encontradas:** nenhuma — o caso está coberto por artigo direto ou
por analogia declarada acima (§0.11.1).

**Dívidas identificadas:** a definição de "negócio parado" e "pendência
vencida" hoje não existe como conceito único e nomeado em nenhum lugar do
código — precisa ser criada como fonte única antes ou durante a
implementação, não depois.

**Não verificado:** impacto real de performance em conta com volume alto de
mensagens/negócios — depende de medição em ambiente com dado real, não
verificável apenas por leitura do código atual.
