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

---

## Nota de implementação

Implementado em `src/components/dashboard/attention-queue.tsx`,
`src/lib/dashboard/queries.ts` (`loadAttentionQueue` e as quatro funções de
domínio) e `src/app/(dashboard)/dashboard/page.tsx` (reordenação: Header →
Onboarding → **Fila de Atenção** → Ações rápidas → Panorama → Atividade
recente). `formatRelativeTime` foi extraído para
`src/lib/dashboard/relative-time.ts` e reaproveitado pelo feed de atividade,
removendo a duplicata que existia ali.

**Escopo coberto:** as quatro fontes (conversas sem resposta, negócios
parados, automações falhando, pendências de documento), como quatro cartões
de resumo — nunca item a item — cada um com contagem exata, o exemplo mais
urgente e um link de nível de autonomia 1 para a área que resolve.

**Deliberadamente adiado, não esquecido:**
- **Renomear "Dashboard" no cabeçalho/rótulo de navegação.** Fica como
  decisão separada — mexe em nome de entidade em interface, código e
  navegação ao mesmo tempo (`FH-05.10`), não algo para decidir de passagem
  dentro desta mudança.
- **Ações rápidas contextuais.** O bloco continua estático (os mesmos quatro
  atalhos de sempre); substituí-lo dinamicamente pela ação mais relevante da
  Fila de Atenção fica para quando houver evidência de que o padrão fixo não
  basta.
- **Reposicionar a retomada de onboarding para fora da Home.** O
  `OnboardingChecklist` e o botão flutuante "Jornada" não foram tocados: o
  elemento `#tour-checklist` é âncora de um tour guiado ativo
  (`src/components/onboarding/guided-tour.tsx`), e movê-lo sem revisar o tour
  arriscaria quebrá-lo silenciosamente. Vale como item de acompanhamento.

**Dívida encontrada durante a implementação, fora do escopo deste mapa:** a
página `/processes/document-delivery/pendencies` descarta o resultado real
da chamada à API e sempre renderiza `setPendencies([])` — ou seja, a fila de
pendências manuais está sempre vazia na tela de origem, independentemente do
que exista em `document_delivery_pendencies`. A Fila de Atenção da Home lê a
tabela diretamente e por isso mostra a contagem real; a página de destino
para onde ela aponta, porém, não. Registrado como tarefa separada.

---

## Segunda rodada — Panorama, com evidência de uso real

Depois da primeira implementação, o construtor do sistema usou a Home no dia
a dia e relatou a sensação que a Constituição pede para evitar: "tem muita
coisa, muita informação, nenhuma delas tão útil" — e nomeou especificamente
o que considerava útil: a **Fila de Atenção**, **Conversas ao longo do
tempo** e **Tempo médio de resposta**. Não mencionou nem como útil nem como
inútil o Feed de Atividade e as Ações Rápidas. Não mencionou como útil os
quatro cartões de métrica nem o donut de pipeline.

Esse relato é evidência qualitativa direta de quem usa o produto
diariamente (arquétipo Operador/Construtor), não volume de pedidos
(`FH-12.02` não se aplica — isso não é "pediram muito", é "isso me atrapalha
agora"). Ele confirma, com uso real, o diagnóstico já registrado na primeira
rodada deste mapa: a tela ainda carregava um "Panorama" que era mais
inventário de números do que decisão de produto.

**Decisão, confirmada com o construtor antes de implementar:**

| Elemento | Decisão | Fundamento |
| --- | --- | --- |
| 4 cartões de métrica (conversas ativas, novos contatos, valor de negócios, mensagens hoje) | **Removidos da Home** | Cada número já tem lar canônico em outra área (Inbox, Contacts, Pipelines — `FH-22.03`); nenhum permitia agir, só exibia contagem (Regra de Ouro do Princípio Fundador) |
| Donut de pipeline | **Removido da Home** | Mesmo motivo — lar canônico é `/pipelines` |
| Conversas ao longo do tempo | Mantido | Nomeado como útil |
| Tempo médio de resposta | Mantido | Nomeado como útil |
| Ações rápidas | Mantido | Não é leitura passiva — é atalho de ação real; não citado como problema |
| Atividade recente | Mantido | Log leve de "o que aconteceu", distinto da Fila de Atenção; não citado como problema |

**Implementado:** `src/app/(dashboard)/dashboard/page.tsx` foi reescrito —
removidos os imports, estados, chamadas de carregamento (`loadMetrics`,
`loadPipelineDonut`) e blocos JSX de `MetricCard`/`SkeletonCard`/
`PipelineDonut`. Ordem final da tela: Header → Onboarding → **Fila de
Atenção** → Ações rápidas → Conversas ao longo do tempo → Tempo médio de
resposta → Atividade recente.

**Não deletado (segunda rodada):** os componentes `src/components/dashboard/metric-card.tsx`
e `src/components/dashboard/pipeline-donut.tsx`, e as funções `loadMetrics`/
`loadPipelineDonut` em `src/lib/dashboard/queries.ts`, continuam no
repositório — sem nenhum chamador depois desta mudança. Decisão deliberada:
"remover da Home" (o que foi pedido e confirmado) é diferente de "apagar a
funcionalidade do produto" (não foi pedido). Ficam disponíveis caso um lar
canônico futuro precise deles (ex.: um resumo de pipeline dentro da própria
`/pipelines`) — se isso não se concretizar, é candidato legítimo de remoção
futura por `FH-12.09` (permanência exige decisão, não inércia), não por
inércia agora.

---

## Terceira rodada — os gráficos mostravam forma, não significado

Com o Panorama reduzido, o construtor olhou a tela renderizada com dado real
e disse que ainda parecia "genérica" e "mal feita". A observação estava
certa, e a causa era estrutural, não estética.

**Diagnóstico.** Os dois gráficos violavam o artigo mais específico que
existe para o arquétipo Analítico (Volume II §4.6):

> "Hierarquia começa pelo número que importa, não pelo gráfico mais bonito."
> "Nenhum gráfico existe sem uma pergunta que ele responde."

Nenhum dos dois começava por um número. Ambos começavam por uma tela de
desenho. Com o dado real da conta, o resultado era:

- **Conversas ao longo do tempo:** 240px de canvas para 12 mensagens em 30
  dias — uma linha reta no zero com um pico. Nenhum total, nenhuma leitura.
  A forma existia; o significado, não.
- **Tempo de primeira resposta:** uma barra roxa isolada de 54,3 min, com a
  meta de 2 min existindo **apenas como um selo no cabeçalho** — nunca
  desenhada no gráfico. O usuário via uma barra alta sem nenhum meio de
  julgar se alta era ruim. A cor era decorativa (violeta padrão),
  independentemente do desempenho, violando `FH-29.02` (token escolhido pela
  função, nunca pela aparência).

**Defeito de honestidade encontrado no caminho (`FH-07.10`, `FH-10.04`).** O
gráfico de tempo de resposta passava `avgMinutes ?? 0` para a série. Um dia
**sem nenhuma amostra** era desenhado como uma barra de zero minuto — que lê
como "respondemos instantaneamente", exatamente o oposto da verdade ("não
temos dado"). Um estado exibido que afirmava mais certeza do que existia.

**Implementado:**

| Mudança | Fundamento |
| --- | --- |
| Ambos os cards passam a abrir com o número que responde à pergunta ("12 mensagens nos últimos 30 dias", "54.3m semana passada"), com o gráfico rebaixado a evidência de apoio | Volume II §4.6 |
| Veredito explícito contra a meta, em token de estado: "27× acima da meta de 2m" em `destructive` | `FH-29.02`, `FH-29.04` |
| Meta agora **desenhada** no gráfico como linha de referência tracejada | §4.6 — sem isso o gráfico não responde pergunta nenhuma |
| Barras coloridas por significado: acima da meta em `destructive`, dentro da meta em `primary` | `FH-29.02` |
| Dia sem amostra vira um traço na linha de base, nunca uma barra de zero | `FH-07.10`, `FH-10.04` |
| Cabeçalho nunca lidera com "—": mostra a semana que tem dado, rotulada | `FH-15.11` (todo número vem com referência) |
| Legenda do gráfico de conversas fundida ao resumo (os pontos coloridos ficam nos próprios totais), eliminando uma linha e uma borda redundantes | Volume II §6.4 |
| Números formatados: meta de 2 min lê "2m", não "2.0m" | Volume II §6.19 |
| O selo da meta deixou de ser vermelho permanente e passou a ser neutro — vermelho ali era decoração, já que o selo indica configuração, não estado | `FH-29.02` |

O gráfico de barras do Tremor foi substituído por SVG dedicado neste card:
a biblioteca não desenha linha de referência nem colore barra por
significado, e sem essas duas coisas o gráfico não cumpre §4.6. O de
conversas continua no SVG próprio que já existia, apenas com altura reduzida
(240px → 170px), porque canvas vazio não é ritmo, é espaço morto
(`FH-31.10` — espaço nunca é decoração).

---

## Quarta rodada — largura morta, tela sem reação, e o que sobrou

Três observações do construtor sobre a tela renderizada, todas procedentes.

### 1. Gráficos "desalinhados horizontalmente" — defeito técnico, não estética

O `viewBox` dos dois gráficos tinha **largura fixa** (760 e 720) enquanto o
container é fluido (~1500px). Com o `preserveAspectRatio` padrão do SVG
(`xMidYMid meet`), o desenho é escalado para caber na **altura** e
centralizado — sobrando centenas de pixels mortos de cada lado, e ainda
renderizando todo o texto em escala não nativa.

Corrigido com `src/components/dashboard/use-element-width.ts`: um
`ResizeObserver` mede o container e alimenta a largura do `viewBox`, de modo
que **1 unidade SVG = 1 pixel CSS**. Sem letterbox, sem escala, texto no
tamanho real. Vale para os dois gráficos.

### 2. "Sem vida, parece tudo desativado" — correção de excesso da rodada 2

Na terceira rodada removi as quatro cores decorativas da Fila de Atenção e
das Ações Rápidas. A correção estava certa no diagnóstico e **errada na
dose**: a regra é ~7% de acento (§6.11), não zero. Pior, a Fila de Atenção é
exatamente onde a cor tem função — um item esperando por você é **estado**, e
comunicar estado e prioridade é para o que a cor serve no arquétipo
operacional (§4.5).

Restaurado com critério: **um** tom de acento (não quatro), aplicado ao ícone
de cada linha; e reação de apontamento real (§6.16 — "alvo interativo muda de
superfície no apontamento"), com fundo, ícone e seta respondendo juntos.
Lição registrada: remover cor decorativa não é o mesmo que remover cor.

### 3. Atividade Recente — removida

Pergunta do construtor: *"que informação útil realmente me traz?"*. Resposta
honesta: nenhuma que não esteja melhor em outro lugar. Toda linha duplicava
Inbox (mensagens novas) ou Pipelines (mudança de negócio), sem nenhuma
decisão associada — falha em `FH-08.06` (todo elemento informa decisão,
permite ação ou revela estado) e em `FH-22.03` (lar canônico único). O
componente `activity-feed.tsx` e `loadActivity` permanecem no repositório sem
chamador, mesmo critério da segunda rodada.

### 4. Checklist de onboarding concluído não ocupa mais a Home

Observado durante a verificação: com o `localStorage` limpo, a "Jornada de
Implantação" reabria ocupando ~500px acima da Fila de Atenção — **com 100%
concluído**. Um checklist terminado comemorando a cada visita viola
`FH-09.04` (celebração proporcional; trivial nunca se celebra) e empurra a
tarefa dominante para baixo da dobra (`FH-24.06`).

Agora, quando `is_fully_configured` é verdadeiro, ele não se renderiza
sozinho: devolve o controle ao pai (o gatilho do cabeçalho reaparece) e
continua acessível a um clique — `FH-26.03` (recuperável sempre) preservado.
Enquanto houver etapa pendente, o comportamento é o de antes.

A decisão de auto-ocultar é tomada no retorno da requisição de progresso, não
em um efeito, para não disparar `setState` em cascata durante a renderização.
O `#tour-checklist`, que é âncora do tour guiado
(`src/components/onboarding/guided-tour.tsx`), continua existindo quando o
checklist está visível — o tour só é afetado em conta 100% configurada, em
que não há mais etapa a ensinar.

**Estado final da Home:** Cabeçalho → (Onboarding, só se houver o que fazer)
→ **Precisa de você** → Ações rápidas → Conversas ao longo do tempo → Tempo
médio de primeira resposta.

---

## Quinta rodada — o cabeçalho prescrito, enfim implementado

O item 1 de "Qual experiência deve existir no lugar" — *"um cabeçalho curto
que substitui o título genérico 'Dashboard' por uma frase de estado"* — tinha
sido especificado e **não implementado**. A tela continuava abrindo com
`<h1>Dashboard</h1>` e a descrição *"Análise em tempo real entre conversas,
contatos, negócios, transmissões e automações."*

Encontrado por outro caminho: o produto imprime o título da página **duas
vezes** — uma no cabeçalho do shell, outra como `<h1>` dentro de `main`. Na
Home isso custava caro duas vezes. Primeiro porque o lugar que `FH-24.01`
reserva ao estado mais urgente estava ocupado por um rótulo de seção.
Segundo porque a descrição enumerava funcionalidades em vez de dizer o que
muda para quem usa (`FH-57.11`) e reinstalava, em texto, a moldura de
"dashboard de métricas" que a primeira rodada tinha descartado — a própria
tela se apresentando como aquilo que ela deixou de ser.

Agora a Home abre com a frase de estado, derivada da mesma consulta que
alimenta a Fila de Atenção — somando os itens de todos os domínios, porque a
pergunta do usuário é uma só (`FH-05.09`):

| Estado | Frase |
| --- | --- |
| Carregando | "Verificando o que precisa de você…" |
| Consulta falhou | "Não foi possível verificar o que precisa de você agora" |
| Fila vazia | "Nada pedindo atenção agora" |
| Com itens | "{n} item(ns) pede(m) sua atenção" |

A frase informa e não cobra (`FH-17.02`, `FH-17.07`): sem contador de
sequência, sem cor de alarme, sem linguagem de dívida. Fila vazia é
**conclusão**, não ausência de dado (`FH-42.02`) — e por isso não diz "0
itens". Falha de consulta não vira "tudo em dia": afirmar calmaria sem ter
verificado é o mesmo erro que `FH-10.04` proíbe em qualquer outro estado.

Peso visual: a frase entra com o mesmo tamanho que o `<h1>` tinha
(`text-2xl`). Não é detalhe estético — ao remover o título de uma outra tela
sem repor peso equivalente, a linha de ações à direita ficou sem âncora e o
cabeçalho desandou. Substituir conteúdo não dispensa sustentar a estrutura.

As chaves `dashboard.title` e `dashboard.description` ficaram sem chamador e
foram removidas.

**Pendente:** as outras sete telas com título duplicado (`/contacts`,
`/broadcasts`, `/flows`, `/automations`, `/ai-assistant`, `/settings`,
`/admin/analytics`). Cada uma precisa de decisão própria sobre o que ocupa o
lugar — apagar o `<h1>` sem repor é o que produz o cabeçalho órfão descrito
acima.
