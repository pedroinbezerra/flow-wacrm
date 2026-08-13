# FLOW HUB — Creative Direction Document

## Volume II — Direção de Arte de Páginas

| Campo | Valor |
| --- | --- |
| Versão | 1.0 |
| Escopo | Qualquer página do FlowHub — pública, de admissão, operacional, analítica, de configuração ou documental |
| Alcance | Toda superfície visual construída para o FlowHub, dentro e fora do produto (`FH-01.02`). A página é o objeto primário; e-mail, notificação e material de aquisição seguem os mesmos princípios de cor, forma, espaço, movimento e texto |
| Volume irmão | `VOLUME-I-landing-page.md` — direção criativa da Landing Page |
| Autoridade | Subordinado à Constituição do Produto (`docs/constituicao/`) |
| Governa | Como uma página deve **parecer, respirar, se mover e ser lida** |
| Não governa | O que construir e por quê (Constituição) · Como codar (`AGENTS.md`) |

---

## Regra transversal deste documento

O Volume I foi escrito sob uma pergunta:

> "Se eu tivesse contratado a melhor agência de design SaaS do mundo para fazer o
> FlowHub, o que eles escreveriam?"

Este volume amplia a mesma pergunta para dentro do produto:

> **"Se a melhor equipe de design de produto do mundo desenhasse esta página — que
> alguém vai abrir doze vezes por dia, todos os dias, durante anos — o que ela
> entregaria?"**

Essa distinção é o eixo de todo o documento. A landing é vista uma vez e precisa
**impressionar**. Uma página de produto é vista mil vezes e precisa **desaparecer**.
São dois ofícios diferentes com a mesma assinatura estética.

---

## Precedência

1. Obrigação legal (`docs/legal/`, `docs/business-rules/`) vence tudo.
2. Constituição do Produto (`docs/constituicao/`) define **o que** e **por quê**.
3. Este documento define **a direção artística** de qualquer página.
4. `AGENTS.md` define **como implementar** no repositório.

Onde este documento parecer contradizer um artigo `FH-XX.NN`, o artigo vence e o
trecho deve ser emendado. Este volume nunca cria regra nova de produto: ele traduz
regra existente em decisão visual.

---

# Índice

| Cap. | Título | Pergunta que responde |
| --- | --- | --- |
| 1 | Visão estratégica da página | Para que uma página existe? |
| 2 | A marca dentro da página | Como o FlowHub se parece com ele mesmo? |
| 3 | Psicologia da página | O que a pessoa sente ao abrir isto? |
| 4 | Os seis arquétipos de página | Que tipo de página é esta? |
| 5 | Arquitetura visual | Como a página se organiza? |
| 6 | Direção de arte | Como a página se parece? |
| 7 | Design system aplicado | Com que material ela é feita? |
| 8 | Especificação por arquétipo | Como fica na prática? |
| 9 | Motion design | Como ela se move? |
| 10 | Texto como elemento visual | O que ela diz — e de onde esse texto veio? |
| 11 | Qualidade percebida | Ela é rápida, acessível e sólida? |
| 12 | Checklist de excelência | Está pronta? |
| 13 | Prompt mestre | Como pedir uma página assim? |

---

# CAPÍTULO 1 — VISÃO ESTRATÉGICA DA PÁGINA

## 1.1 Introdução

Uma página do FlowHub não é uma tela. É um **lugar de trabalho**.

Alguém vai abri-la no meio de um atendimento, com o telefone tocando, com um cliente
esperando resposta e com outras quatro abas abertas. Essa pessoa não veio admirar o
design. Ela veio resolver algo.

Toda decisão artística descrita neste documento existe para servir esse momento.

A Landing Page vende o primeiro clique. **A página do produto vende a renovação.**
Ela é vista centenas de vezes, e a percepção de qualidade não vem de um impacto
inicial: vem da ausência acumulada de atrito.

## 1.2 Objetivo principal

O objetivo de qualquer página do FlowHub é permitir que **uma pessoa conclua uma
tarefa dominante com o menor esforço mental possível**, saindo com a sensação de que
o sistema está sob controle.

Nenhum outro objetivo tem prioridade superior.

Se um elemento não ajuda a entender, decidir ou agir, ele não deve existir
(`FH-08.06`).

## 1.3 Objetivos secundários

Toda página também deve, simultaneamente:

- Confirmar que o produto é maduro e cuidado.
- Reduzir a chance de erro antes que ele aconteça.
- Ensinar o modelo mental do sistema sem parecer tutorial.
- Manter o vocabulário visual idêntico ao das demais páginas.
- Devolver ao usuário a sensação de que ele sabe o que está acontecendo.

## 1.4 O que NÃO é objetivo

- Impressionar.
- Demonstrar capacidade técnica.
- Mostrar tudo o que o módulo é capaz de fazer.
- Ser memorável visualmente.
- Ter personalidade própria diferente do restante do produto.

Uma página com identidade própria é um defeito de sistema, não uma virtude
(`FH-17.05`).

## 1.5 A filosofia central

Existe uma tentação recorrente ao construir telas de produto: preencher o espaço
disponível porque ele está disponível.

O FlowHub segue a direção oposta.

> **Quanto menos elementos existem na tela, mais importante cada elemento se torna.**

Densidade alta não é sinônimo de poluição. Uma planilha bem desenhada é densa e
calma ao mesmo tempo. O que cansa não é a quantidade de informação: é a quantidade de
**decisões visuais não resolvidas** entregues ao usuário.

## 1.6 A promessa central de cada página

Toda página do FlowHub faz a mesma promessa silenciosa:

> **"Você sabe onde está, o que aconteceu e o que fazer agora."**

Se qualquer uma das três não estiver respondida em cinco segundos, a página falhou —
por mais bonita que esteja.

## 1.7 A experiência desejada

Ao abrir qualquer página, a pessoa deve atravessar, em ordem:

| Etapa | Pensamento esperado |
| --- | --- |
| Localização | "Estou no lugar certo." |
| Situação | "Isto aqui está assim." |
| Prioridade | "Isto é o que importa agora." |
| Capacidade | "Consigo fazer o que vim fazer." |
| Confiança | "Nada vai quebrar se eu clicar." |
| Fluência | "Já sei fazer isto sem pensar." |

A fluência é o estado final desejado — e o único que só se conquista com repetição
sem surpresa. É por isso que consistência importa mais que criatividade
(`FH-16`).

## 1.8 O papel do conteúdo real

Na landing, o protagonista visual é o produto.

Dentro do produto, o protagonista é o **trabalho do usuário**: as conversas, os
contatos, os cards do funil, os números da conta.

Nenhum elemento de interface pode competir com o conteúdo que pertence ao usuário. A
interface é moldura. O dado é a obra.

## 1.9 Princípio da simplicidade

Simplicidade aqui não significa poucas funções. Significa **poucas decisões
simultâneas**.

O orçamento é explícito: no máximo três decisões simultâneas na tarefa dominante
(`FH-08.02`). Acima disso, a solução é priorizar, agrupar ou decidir pelo usuário —
nunca adicionar uma aba a mais (`FH-08.10`, `FH-08.11`).

## 1.10 Critérios de sucesso

Uma página está bem-sucedida quando, simultaneamente:

1. A tarefa dominante é nomeável em uma frase.
2. Existe exatamente uma ação primária visível.
3. A hierarquia sobrevive em preto e branco.
4. A página funciona nos dois modos e nos cinco acentos.
5. Nenhum valor visual foi escrito fora dos tokens.
6. Os estados vazio, carregando, erro e sem-permissão existem e foram desenhados.
7. Nada se desloca quando o conteúdo real chega.
8. A página continua legível com o volume máximo de dados.
9. Nenhum texto está fora do dicionário de i18n.
10. Um usuário experiente consegue completar a tarefa sem ler nada.

## 1.11 A Regra de Ouro

> **"Esta página torna mais fácil para alguém sob pressão entender a situação e agir
> com segurança — hoje, e na milésima vez?"**

Se a resposta for não, a decisão deve ser revista.

---

# CAPÍTULO 2 — A MARCA DENTRO DA PÁGINA

## 2.1 Introdução

A marca FlowHub não aparece nas páginas do produto por meio de logotipo, cor
institucional ou assinatura visual.

Ela aparece por meio de **comportamento**.

O usuário reconhece o FlowHub porque tudo responde do mesmo jeito, tudo está no mesmo
lugar, tudo usa o mesmo vocabulário e nada o surpreende negativamente.

## 2.2 Os cinco traços, traduzidos em pixels

A personalidade normativa do produto (`FH-09.01`) tem tradução visual direta:

| Traço | Como isso vira decisão visual |
| --- | --- |
| **Competente** | Alinhamento exato, densidade adequada, dado correto e formatado. Nada aproximado. |
| **Direto** | Título curto, rótulo curto, botão com verbo. Zero preâmbulo visual. |
| **Discreto** | Neutros dominam. Acento raro. Movimento mínimo. A interface não pede atenção. |
| **Respeitoso** | Nada pisca, nada interrompe, nada bloqueia sem motivo. Nada culpa o usuário. |
| **Confiante** | Sem excesso de explicação, sem tutela, sem elementos defensivos empilhados. |

## 2.3 Sobriedade proporcional

Quanto pior o momento, mais discreto o sistema fica (`FH-09.02`).

- Em erro: sem ilustração, sem humor, sem animação. Texto claro e caminho de saída.
- Em perda de dado ou falha de cobrança: apenas fato, consequência e ação.
- Em espera longa: informação honesta, nunca entretenimento.

Celebração existe, mas é rara e proporcional ao esforço (`FH-09.04`, `FH-17.06`).
Concluir um onboarding merece reconhecimento. Salvar um contato não merece nada.

## 2.4 A marca não ocupa espaço operacional

Dentro de um fluxo de trabalho, nenhum elemento existe para lembrar a pessoa de que
ela está usando o FlowHub (`FH-09.08`).

Sem marca-d'água. Sem logo repetido. Sem cor institucional decorativa. Sem
"powered by" interno. Sem badge de versão em tela operacional.

A marca vive no cabeçalho da conta, na tela de entrada e no e-mail. Não no meio da
tarefa.

## 2.5 Expressão visual só por token

Toda expressão de identidade acontece através do sistema de tokens (`FH-09.09`).

Não existem temas sazonais, campanhas visuais internas, banners de marketing dentro do
produto nem variações estéticas por módulo.

Se um módulo "precisa parecer diferente", o problema é de arquitetura da informação —
não de arte.

## 2.6 Como queremos que a página seja lembrada

Não queremos que o usuário lembre de nenhuma página específica.

Queremos que ele diga:

> "É um sistema que nunca me atrapalha."

Esse é o maior elogio possível para uma interface de trabalho, e o objetivo estético
final deste documento.

## 2.7 A Regra de Ouro do posicionamento visual

> **"Esta página parece ter sido feita pela mesma equipe, no mesmo dia, com o mesmo
> cuidado que todas as outras?"**

---

# CAPÍTULO 3 — PSICOLOGIA DA PÁGINA

## 3.1 Introdução

Toda página é uma conversa silenciosa. A diferença é que, dentro do produto, essa
conversa acontece **todos os dias com a mesma pessoa**.

Isso muda tudo. O que convence uma vez, irrita na décima. O que encanta na primeira
sessão, atrasa na centésima (`FH-39.05`).

## 3.2 A regra dos cinco segundos

Ao abrir qualquer página, três perguntas precisam ser respondidas quase sem leitura:

1. **Onde estou?** — cabeçalho, título, posição na navegação.
2. **O que aconteceu?** — estado, contagem, filtro ativo, avisos pendentes.
3. **O que faço agora?** — ação primária única e evidente.

Se o olho precisar procurar por onde começar, a hierarquia falhou.

## 3.3 O estado mental de quem abre a página

A pessoa quase nunca chega em estado neutro. Ela chega:

- no meio de outra tarefa;
- com pouco tempo;
- com atenção parcial;
- frequentemente com alguma ansiedade operacional ("perdi alguma mensagem?").

Isso significa que a página não deve começar exigindo. Deve começar **informando**.

Primeiro a situação. Depois as opções. Nunca o contrário.

## 3.4 Carga cognitiva

Cada elemento na tela consome atenção, mesmo quando ignorado.

Reduções obrigatórias:

- Uma tarefa dominante por página (`FH-08.09`).
- Uma ação primária por contexto (`FH-24.02`).
- No máximo três decisões simultâneas (`FH-08.02`).
- Um protagonista visual por bloco.
- Nenhuma informação repetida em dois lugares da mesma tela.

Quando houver dúvida entre explicar e simplificar, simplifique. Explicação é dívida
de design.

## 3.5 Redução de ansiedade

Dentro do produto, a ansiedade é diferente da ansiedade de compra. Ela soa assim:

- "Isso vai enviar mensagem para todo mundo?"
- "Isso apaga de verdade?"
- "Isso já salvou?"
- "Alguém da equipe vai ver isso?"
- "Consigo voltar atrás?"

O antídoto é visual e textual ao mesmo tempo:

- Toda decisão crítica declara **efeito, alcance e reversibilidade antes** de
  acontecer (`FH-17.09`).
- Ação destrutiva usa cor destrutiva, posição não primária e confirmação proporcional.
- Salvamento tem retorno visível — nunca silêncio.
- Nada relevante acontece sem feedback (`FH-43`).

## 3.6 Fluência e repetição

O objetivo final de uma página de produto é ser executada **sem leitura**.

Isso exige:

- posição estável dos elementos entre sessões;
- rótulos idênticos em todos os contextos;
- ausência de movimento em fluxo repetitivo;
- atalhos e alvos previsíveis;
- nenhuma mudança de layout por estado transitório.

Toda vez que a página muda de forma sem que o usuário tenha pedido, ela cobra
atenção de novo.

## 3.7 Honestidade visual

A interface nunca simula qualidade que não tem:

- Nada de progresso falso: barra só com medição real (`FH-46.04`).
- Nada de esqueleto eterno fingindo conteúdo (`FH-42.09`).
- Nada de número arredondado que sugere precisão inexistente.
- Nada de estado "sucesso" antes da confirmação do servidor.
- Nada de urgência artificial, contador ou mecânica de engajamento
  (`FH-17.07`, `FH-17.10`).

## 3.8 O princípio da demonstração aplicado ao produto

Na landing, demonstrar vale mais que explicar.

Dentro do produto, **o estado vale mais que a explicação**.

Em vez de um texto dizendo "suas automações estão ativas", mostre a lista com o
indicador de execução. Em vez de "você tem permissão limitada", mostre apenas o que a
pessoa pode fazer e diga onde pedir acesso.

## 3.9 As quatro emoções-alvo

Ao final da interação com qualquer página, a pessoa deve sentir:

| Emoção | Tradução |
| --- | --- |
| **Controle** | "Eu sei o que está acontecendo." |
| **Fluência** | "Foi rápido e não precisei pensar." |
| **Confiança** | "Nada vai quebrar sem me avisar." |
| **Tranquilidade** | "Não deixei nada para trás." |

Se uma dessas estiver ausente, algo na página está cobrando esforço indevido.

## 3.10 A Regra de Ouro da psicologia

> **"Esta página reduz a quantidade de coisas que a pessoa precisa segurar na
> cabeça?"**

---

# CAPÍTULO 4 — OS SEIS ARQUÉTIPOS DE PÁGINA

## 4.1 Por que arquétipos

Não existe uma direção de arte única que sirva a uma landing pública e a uma caixa de
entrada compartilhada. O erro mais comum em produtos SaaS é aplicar a estética de
marketing dentro da ferramenta — ou a densidade da ferramenta na página de vendas.

Antes de desenhar qualquer página, é obrigatório **declarar o arquétipo**. Ele define
densidade, papel da cor, papel do movimento e ritmo.

## 4.2 Tabela mestra

| # | Arquétipo | Exemplos no produto | Densidade | Papel da cor | Movimento | Tempo típico na página |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Pública** | Landing, `/terms`, `/privacy`, `/cookies` | Baixa | Conduz o olhar | Narrativo, generoso | 1 visita, minutos |
| 2 | **Admissão** | `/login`, `/signup`, `/join`, `/welcome` | Muito baixa | Um único ponto de atenção | Mínimo, de transição | Poucas visitas |
| 3 | **Operacional** | `inbox`, `contacts`, `pipelines`, `boards`, `processes` | Alta | Estado e prioridade | Quase nenhum | Horas por dia |
| 4 | **Analítica** | `dashboard`, relatórios, consumo | Média | Codificação de dados | Discreto, só de entrada | Minutos, recorrente |
| 5 | **Configuração** | `settings`, `admin`, `automations`, `flows` | Baixa | Estado e risco | Discreto | Raro, deliberado |
| 6 | **Documental** | `faq`, `lgpd`, `subprocessadores`, ajuda | Baixa | Quase nula | Nenhum | Sob demanda |

Densidade não é preferência estética. É consequência da tarefa (`FH-24.07`,
`FH-31.03`).

## 4.3 Arquétipo 1 — Pública

**Tarefa dominante:** decidir continuar.

- O produto é o protagonista visual. Nenhuma imagem genérica de banco.
- Espaço negativo generoso entre seções (o dobro do usado no produto).
- Uma mensagem por seção. Uma pergunta respondida por vez.
- Tipografia grande e contrastada; escala maior que a do produto.
- Movimento pode narrar — entradas por rolagem, sequências curtas.
- Sem carrossel automático, sem pop-up, sem autoplay com som.

**O que nunca fazer:** aplicar densidade de produto, empilhar funcionalidades em lista
ou tentar ensinar o sistema inteiro.

## 4.4 Arquétipo 2 — Admissão

**Tarefa dominante:** entrar, criar conta ou aceitar convite.

- Um único foco visual na tela. Nada mais compete.
- Campo, botão, erro. Nessa ordem.
- Zero navegação lateral. Zero distração. Zero venda adicional.
- Erro sempre no campo, nunca em alerta genérico no topo.
- Nada de ilustração decorativa: a página deve parecer um cartão de acesso, não uma
  peça publicitária.
- Estado de carregamento no próprio botão, com rótulo que diz o que está acontecendo.

**O que nunca fazer:** pedir informação que o sistema pode inferir depois
(`FH-08.03`), ou mostrar erro sem dizer como corrigir.

## 4.5 Arquétipo 3 — Operacional

**Tarefa dominante:** trabalhar. É onde o usuário vive.

Este é o arquétipo mais difícil e o mais importante do FlowHub.

- Densidade alta é correta e desejada. Espaço sobrando aqui é espaço perdido.
- A moldura encolhe: cabeçalhos baixos, bordas discretas, sombras quase ausentes.
- O conteúdo do usuário recebe o maior contraste da tela.
- A cor comunica **estado e prioridade**, nunca decoração: não lido, atribuído,
  atrasado, falhou.
- Movimento: praticamente nenhum. Nada anima em conteúdo sob leitura (`FH-39.10`).
- Alvos de toque nunca encolhem junto com o espaço visual (`FH-31.08`, `FH-38.08`).
- Espaço reservado para o conteúdo que vai chegar: nada pode saltar (`FH-31.07`,
  `FH-46.03`).
- Atualização em tempo real nunca rouba foco nem reordena o que está sendo lido.

**O que nunca fazer:** animar a chegada de itens em lista de alta frequência, usar
sombra para "dar vida", inserir ilustração, ou aumentar o espaçamento para "ficar
respirado" às custas de itens visíveis.

## 4.6 Arquétipo 4 — Analítica

**Tarefa dominante:** entender uma situação e decidir.

- Hierarquia começa pelo número que importa, não pelo gráfico mais bonito.
- Cores de série são fixas e estáveis entre visualizações e sessões (`FH-29.08`).
- Todo número tem unidade, período e origem declarados.
- Comparação exige alinhamento e algarismos de largura uniforme (`FH-30.07`).
- Nenhum gráfico existe sem uma pergunta que ele responde.
- Movimento: apenas entrada suave na primeira renderização. Nunca em atualização.

**O que nunca fazer:** gráfico decorativo, escala truncada que exagera variação,
paleta arco-íris, ou métrica sem contexto temporal.

## 4.7 Arquétipo 5 — Configuração

**Tarefa dominante:** mudar algo com consequência.

- Densidade baixa e ritmo lento. Aqui a pressa é inimiga.
- Cada opção declara o que muda, para quem e se dá para voltar (`FH-17.09`).
- Agrupamento por consequência, não por tela de implementação.
- Alternância aplica na hora; formulário aplica ao confirmar (`FH-35.04`).
- Ação destrutiva fica visualmente separada, com cor destrutiva e confirmação
  proporcional ao dano.
- Estado atual sempre visível antes da opção de mudança.

**O que nunca fazer:** esconder consequência atrás de um rótulo curto, usar toggle
para ação irreversível, ou misturar configuração de conta com configuração pessoal.

## 4.8 Arquétipo 6 — Documental

**Tarefa dominante:** encontrar e ler uma informação específica.

- Largura de leitura limitada (60–75 caracteres), sempre (`FH-30.03`).
- Hierarquia de títulos real e navegável.
- Zero movimento, zero cor decorativa, zero cartão dentro de cartão.
- Data de atualização visível quando o conteúdo tem efeito legal.
- Contraste e tamanho de corpo acima do mínimo: são páginas lidas com atenção.

**O que nunca fazer:** transformar texto legal em acordeões aninhados, ou reduzir
tamanho de fonte para "caber".

## 4.9 Os quatro estados transversais

Nenhum arquétipo está completo sem estes quatro estados desenhados **antes** da
entrega:

| Estado | Regra artística |
| --- | --- |
| **Vazio** | Responde: que lugar é este, por que está vazio, o que fazer agora (`FH-42.02`). Vazio inaugural traz a ação primária ali mesmo. Vazio nunca cobra nem culpa. |
| **Carregando** | Reproduz a forma do conteúdo conhecido (`FH-46.02`). Espaço já reservado. Nunca esqueleto eterno. |
| **Erro** | Diz o que houve, o que foi preservado e qual o próximo passo. Sem culpa, sem humor, sem ilustração (`FH-17.03`, `FH-17.04`). |
| **Sem permissão** | Mostra o que existe de fato e onde pedir acesso. Nunca revela conteúdo restrito, nem sugere o que existiria (`FH-42.10`). |

Uma página entregue sem esses quatro estados está incompleta, independentemente da
qualidade do estado feliz.

## 4.10 A Regra de Ouro dos arquétipos

> **"A densidade, a cor e o movimento desta página correspondem ao que a pessoa veio
> fazer aqui — ou ao que eu achei bonito?"**

---

# CAPÍTULO 5 — ARQUITETURA VISUAL DA PÁGINA

## 5.1 Estrutura antes de estilo

Nenhuma decisão estética acontece antes de a hierarquia estar definida (`FH-24.04`).

A ordem de trabalho é sempre:

1. Nomear a tarefa dominante em uma frase.
2. Definir a ação primária única.
3. Listar o que é identidade, o que é estado, o que é conteúdo e o que é ação.
4. Só então escolher componentes, espaçamento e cor.

Pular a etapa 1 produz telas bonitas e inutilizáveis.

## 5.2 Anatomia canônica

Toda página tem quatro camadas, nessa ordem de leitura (`FH-24.01`, `FH-24.03`):

```
IDENTIDADE   → onde estou: título da página, contexto da conta, migalha
     ↓
ESTADO       → o que aconteceu: contadores, filtros ativos, avisos, período
     ↓
CONTEÚDO     → o trabalho: lista, tabela, quadro, conversa, formulário
     ↓
AÇÃO         → o que faço: ação primária única + ações de apoio
```

A ausência de uma camada é permitida, desde que seja **declarada e intencional** —
nunca esquecimento.

## 5.3 O shell é moldura, não protagonista

A área autenticada usa Sidebar + Header + conteúdo rolável.

Regras artísticas do shell:

- O shell tem contraste **menor** que o conteúdo. Ele é fundo, não figura.
- A superfície do shell é distinta da superfície do conteúdo, mas por pouco.
- O item ativo na navegação é o único elemento de acento permanente da moldura.
- O cabeçalho da página tem altura mínima suficiente: cada pixel dele é roubado do
  trabalho.
- A moldura nunca rola junto com o conteúdo em telas operacionais.

## 5.4 Uma ação primária

Cada contexto tem exatamente uma ação primária (`FH-24.02`).

- Ela ocupa a posição primária — canto superior direito do cabeçalho da página, ou o
  fim do fluxo em formulários.
- Nenhuma ação secundária ocupa essa posição (`FH-24.10`).
- Ação destrutiva nunca é primária, nunca é a mais visível e nunca fica adjacente à
  ação mais usada.
- Quando existirem duas ações igualmente importantes, o problema é de escopo da
  página, não de layout.

## 5.5 Ritmo dentro de uma página densa

Ritmo em página de produto não se faz com grandes vazios. Faz-se com **três níveis de
espaço**:

| Nível | Uso | Efeito |
| --- | --- | --- |
| Espaço interno | Dentro de um item (linha, card, campo) | Legibilidade |
| Espaço de grupo | Entre itens do mesmo conjunto | Agrupamento |
| Espaço de separação | Entre blocos com assuntos diferentes | Hierarquia |

A regra é absoluta: **o espaço interno de um grupo é sempre menor que o espaço que o
separa dos demais** (`FH-31.02`). Quando essa relação se inverte, o olho agrupa
errado — e nenhuma borda conserta isso.

Todo espaço acima do padrão precisa comunicar alguma coisa (`FH-31.10`). Espaço
decorativo é proibido.

## 5.6 O fluxo do olhar

O olhar deve percorrer sempre o mesmo caminho previsível:

```
Título → Estado → Primeiro item de conteúdo → Ação primária → Detalhe
```

Se ao entrar numa seção o olho "passeia" procurando por onde começar, a hierarquia
falhou. O teste é direto: abra a página desfocada e veja se o protagonista continua
óbvio.

## 5.7 Largura, contêiner e rolagem

- Texto de leitura contínua nunca atravessa a tela inteira (`FH-30.03`).
- Conteúdo tabular pode usar a largura total: comparar exige alinhamento horizontal.
- Formulários de configuração usam coluna estreita, mesmo em tela larga.
- Uma página tem **um** eixo de rolagem principal. Rolagem dentro de rolagem é
  permitida apenas quando há um painel independente (conversa, detalhe lateral).
- Rolagem horizontal acidental é defeito (`FH-37.07`).

## 5.8 Arquitetura mobile

Mobile não é a página espremida. É a mesma tarefa com outra ergonomia
(`FH-37`).

- Nenhuma capacidade essencial é exclusiva de tela grande (`FH-37.06`).
- A ação primária fica alcançável com uma mão (`FH-37.05`).
- Tudo que aparece por apontamento tem caminho equivalente por toque (`FH-37.04`).
- Colunas viram empilhamento; tabela vira lista com os dois ou três campos que
  importam.
- Filtros e estado migram para uma barra fixa e compacta, nunca somem.
- Mudar orientação ou tamanho preserva o estado da página (`FH-37.09`).

## 5.9 A Regra de Ouro da arquitetura

> **"Consigo nomear a tarefa dominante desta página em uma frase — e apontar a única
> ação primária sem hesitar?"**

---

# CAPÍTULO 6 — DIREÇÃO DE ARTE

## 6.1 Maturidade acima de modernidade

Uma interface moderna impressiona. Uma interface madura tranquiliza.

O FlowHub escolhe maturidade.

Isso significa recusar deliberadamente: modismos visuais, efeitos de vidro em toda a
tela, neon, brilho permanente, formas orgânicas decorativas, tipografia expressiva e
qualquer recurso que envelheça em dezoito meses.

O objetivo não é uma interface memorável. É uma interface que continue parecendo
correta daqui a cinco anos.

## 6.2 A personalidade visual

Oito adjetivos governam toda decisão estética:

**Elegante · Minimalista · Técnica · Calma · Precisa · Silenciosa · Coerente ·
Atemporal**

Qualquer elemento que pareça infantil, exagerado, festivo ou chamativo apenas para
chamar atenção deve ser removido.

## 6.3 O trabalho do usuário é o protagonista

O ativo visual mais valioso de uma página de produto é o dado que pertence ao
usuário.

Consequências práticas:

- O maior contraste da tela vai para o conteúdo, não para a moldura.
- Rótulos, ícones e bordas usam tons atenuados.
- Nenhum elemento de interface pode ser mais visualmente forte do que uma mensagem de
  cliente, um nome de contato ou um valor de negociação.
- Quando a tela está cheia de dados reais, ela deve ficar **melhor**, não pior.

Toda tela precisa ser desenhada com volume máximo de dados, nunca com três itens
fictícios bem comportados (`FH-24.09`).

## 6.4 A filosofia do minimalismo

Minimalismo não é ausência de elementos. É ausência de elementos desnecessários.

Cada componente na tela responde à pergunta: **"que problema este elemento
resolve?"**. Sem resposta objetiva, ele sai.

Alvos frequentes de remoção:

- linhas divisórias redundantes com o espaço;
- ícones que repetem o que o rótulo já diz;
- gradientes decorativos;
- ilustrações genéricas;
- formas abstratas de fundo;
- animações sem função;
- textos de apoio que reafirmam o título;
- cartões dentro de cartões;
- badges que não mudam decisão nenhuma.

## 6.5 Hierarquia visual

Todo bloco tem **um** protagonista. Nunca dois.

A hierarquia é construída nesta ordem (`FH-24.05`, `FH-30.02`):

1. **Posição** — o que vem antes é mais importante.
2. **Peso** — mais peso tipográfico, mais importância.
3. **Cor de conteúdo** — texto pleno versus atenuado.
4. **Tamanho** — último recurso, nunca o primeiro.

Aumentar a fonte para criar hierarquia é o erro mais comum e o mais caro: ele consome
espaço e escala mal em telas densas.

**Teste obrigatório:** a hierarquia sobrevive em escala de cinza? Se não, ela depende
de cor — e isso é violação (`FH-29.04`, `FH-38.09`).

## 6.6 Espaço negativo

O espaço em branco é um componente de interface, não sobra.

Em páginas públicas, ele é generoso e cria elegância.

Em páginas operacionais, ele é **preciso**: separa grupos, cria ritmo de leitura
vertical e nada mais. Aqui, espaço excessivo custa itens visíveis — e itens visíveis
são produtividade.

Uma página nunca deve parecer apertada. Também nunca deve parecer vazia com dados
reais.

## 6.7 O papel da luz

O modo escuro é o padrão do produto. Isso impõe disciplina de luz.

- Luz destaca. Se tudo brilha, nada chama atenção.
- Nenhum brilho permanente, nenhum glow, nenhum neon.
- A hierarquia de superfícies no escuro se faz por **luminosidade crescente**:
  fundo → superfície → superfície secundária → flutuante.
- No modo claro, a mesma hierarquia se faz por sombra e borda, porque superfícies
  quase brancas não se distinguem por luminosidade.
- Onde a sombra não funcionar, a separação vem de superfície ou borda (`FH-32.05`).

Toda tela é verificada nos dois modos antes da entrega (`FH-29.10`).

## 6.8 Gradientes

Gradientes podem existir. Nunca como protagonistas.

Função permitida: criar profundidade quase imperceptível em superfícies grandes ou em
áreas de destaque pontual de páginas públicas.

Função proibida: preencher espaço, colorir cartões, criar "identidade" de módulo ou
chamar atenção.

Se alguém percebe o gradiente, ele está forte demais.

## 6.9 Sombra e borda: critério objetivo

A escolha nunca é estética (`FH-32.04`):

| Recurso | Quando usar | Como deve parecer |
| --- | --- | --- |
| **Borda** | Delimitar uma superfície no mesmo plano | Discreta, tom próximo ao fundo, quase invisível |
| **Sombra** | Separar planos: algo está acima de outra coisa | Ampla, muito suave, baixa opacidade, grande desfoque |

Sombra pequena e escura envelhece a interface imediatamente. Sombra permanente em
elementos que não estão acima de nada é decoração — e decoração por elevação é
proibida (`FH-32.03`).

Elevação nunca substitui hierarquia de conteúdo: um elemento não fica importante por
estar levantado (`FH-32.10`).

## 6.10 Forma e raio

O raio comunica precisão, não simpatia.

- Todo raio deriva do valor único do sistema (`FH-32.01`).
- O raio é consistente **por família de componente** (`FH-32.08`): todo botão tem o
  raio de botão, em qualquer contexto.
- Raio grande demais infantiliza; raio zero endurece. O sistema já resolveu esse
  equilíbrio — não reabra a discussão por tela.

## 6.11 Cor

Cor não decora. Cor orienta.

**Distribuição alvo em página de produto:**

| Papel | Proporção aproximada |
| --- | --- |
| Neutros (superfícies, texto, bordas) | ~90% |
| Acento (ação primária, item ativo, foco) | ~7% |
| Estado (sucesso, atenção, erro) | ~3% |

Em página pública, o acento pode subir — nunca acima de ~15%.

Regras invioláveis:

- Nenhuma cor literal. Só token semântico (`FH-29.01`).
- Token escolhido pela função, nunca pela aparência (`FH-29.02`).
- Modo e acento são eixos disjuntos: acento nunca redefine superfície (`FH-29.03`).
- Cor nunca é o único portador de significado (`FH-29.04`).
- Cores de estado são vocabulário fechado e não variam por acento (`FH-29.07`).
- Séries de dados mantêm a mesma cor entre gráficos e sessões (`FH-29.08`).
- Contraste verificado em **todos** os modos e **todos** os acentos (`FH-29.05`).

A interface nunca deve parecer um arco-íris. Se uma tela tem quatro cores de acento
simultâneas, ela tem quatro protagonistas — ou seja, nenhum.

## 6.12 Tipografia

A tipografia deve desaparecer. O usuário lembra da mensagem, nunca da fonte.

- Escala fechada. Tamanho fora da escala é proibido (`FH-30.01`).
- Poucos pesos. Quanto menos variação, mais elegante.
- Hierarquia por peso e cor antes de tamanho (`FH-30.02`).
- Altura de linha varia por função: maior em leitura contínua, menor em rótulos e
  dados tabulares (`FH-30.04`).
- Monoespaçada é reservada a dado técnico copiável — identificadores, códigos. Nunca
  por estilo (`FH-30.08`).
- Números comparáveis usam algarismos de largura uniforme (`FH-30.07`).
- Nenhum texto abaixo do mínimo legível, inclusive legendas e badges (`FH-30.09`).
- Truncar só com acesso ao conteúdo completo ali mesmo (`FH-30.05`).

Todo layout é verificado com nome longo, palavra sem espaço e texto traduzido
(`FH-30.10`).

## 6.13 Ícones

Um estilo, um tamanho por contexto, uma espessura de traço.

- Nunca misturar contorno, preenchido, 3D ou skeuomórfico.
- Ícone acompanha rótulo em navegação e ações; ícone sozinho só quando o significado é
  universal e há nome acessível (`FH-38.05`).
- Ícone nunca é o único indicador de estado.
- Ícone decorativo ao lado de título é ruído: remova.

A consistência importa mais do que o estilo escolhido.

## 6.14 Ilustração

Praticamente proibida.

Ilustrações envelhecem rápido, não escalam para múltiplos módulos, atrasam o
carregamento e raramente comunicam algo que a interface não consiga.

Exceção única: estado vazio inaugural, com uma marca gráfica extremamente simples,
monocromática, derivada de token, e sempre acompanhada da ação primária.

Nunca em erro. Nunca em espera. Nunca em página operacional.

## 6.15 Textura e fundo

Nenhuma. Sem ruído, sem padrão repetitivo, sem fundo complexo.

Quanto mais limpo o fundo, mais destaque o conteúdo recebe.

## 6.16 Microinterações

A interface responde ao usuário com elegância e discrição:

- Alvo interativo muda de superfície no apontamento — não de tamanho.
- Foco é sempre visível, com anel derivado do token de foco (`FH-38.02`).
- Botão pressionado responde no ato (`FH-46.07`).
- Nenhuma interação parece brinquedo. Nada quica, nada gira, nada pulsa.

Elevação nunca é o único indicador de interatividade (`FH-32.07`).

## 6.17 Densidade como estética

Em páginas operacionais, densidade bem executada **é** a estética.

Uma lista com trinta conversas legíveis, alinhadas, com estado claro e sem ruído é
mais bonita — e infinitamente mais valiosa — do que oito cartões espaçados com sombra.

Densidade correta se reconhece assim: mais informação por tela sem aumento de esforço
de leitura.

## 6.18 Referências de qualidade

Referências existem para absorver princípios, nunca para copiar layout:

**Linear · Stripe · Vercel · Raycast · Height · Superhuman · Notion · Figma ·
Supabase · Arc**

O que essas interfaces têm em comum:

- hierarquia imediatamente óbvia;
- paleta severamente controlada;
- tipografia impecável e escala curta;
- movimento discreto e funcional;
- densidade alta sem sensação de peso;
- consistência absoluta entre telas;
- ausência total de elementos supérfluos.

## 6.19 O efeito "produto caro"

A percepção de produto caro não vem de efeito visual. Vem da soma de pequenos
acertos:

- alinhamentos exatos;
- margens idênticas em contextos equivalentes;
- estados completos, inclusive os feios;
- transições curtas e coerentes;
- nada saltando ao carregar;
- números formatados corretamente;
- textos curtos e revisados;
- carregamento rápido;
- consistência sem exceção.

> **O luxo digital está na execução, não na quantidade de elementos.**

## 6.20 O que nunca fazer

Independentemente de evolução futura, estes princípios são permanentes.

Nunca usar:

- carrossel automático;
- pop-up interruptivo em fluxo de trabalho;
- vídeo com autoplay e som;
- animação decorativa em tela de uso diário;
- brilho, neon ou glow permanente;
- vidro fosco em toda a interface;
- sombra pequena e escura;
- mais de um acento simultâneo na mesma tela;
- ilustração em erro ou espera;
- cor literal escrita à mão;
- valor de espaçamento fora da escala;
- texto hardcoded sem i18n;
- contador falso, urgência artificial ou mecânica de engajamento;
- número sem origem;
- ícone sozinho sem nome acessível;
- tipografia expressiva ou fonte "divertida";
- densidade decorativa — espaço grande sem função.

## 6.21 A Regra de Ouro da direção de arte

> **"Este elemento faz o FlowHub parecer um software que uma empresa teria orgulho de
> usar todos os dias — inclusive no dia mais corrido?"**

Se a resposta for negativa, o elemento deve ser removido.

---

# CAPÍTULO 7 — DESIGN SYSTEM APLICADO

## 7.1 O material real

Este capítulo descreve **o material com que as páginas do FlowHub são feitas neste
repositório**. Ele não inventa sistema: aterrissa o que já existe.

| Camada | Onde vive |
| --- | --- |
| Tokens de cor, modo, acento e raio | `src/app/globals.css` |
| Catálogo de acentos e modos | `src/lib/themes.ts` |
| Primitivos de interface | `src/components/ui/` |
| Composição de classes | utilitário `cn` |
| Variantes visuais | `cva` |
| Textos | `src/i18n/messages/pt-BR.json` |

Regra permanente: **reutilizar antes de criar** (`FH-28.02`). Variante local não
registrada é proibida (`FH-28.04`).

## 7.2 Os dois eixos de tema

O sistema é bidimensional e ortogonal:

- **Modo** (`data-mode`): `light` | `dark` — governa superfícies neutras, texto,
  bordas e raio.
- **Acento** (`data-theme`): `violet` | `emerald` | `cobalt` | `amber` | `rose` —
  governa exclusivamente a cor primária e derivadas (`--primary*`, `--ring`,
  `--chart-1`, `--sidebar-primary*`).

Os dois conjuntos definem variáveis disjuntas. Qualquer acento funciona em qualquer
modo, sem ajuste.

**Consequência artística direta:** nenhuma composição pode depender de um acento
específico. Se uma tela "só fica boa em violeta", ela está errada.

## 7.3 Vocabulário de superfícies

| Token | Papel | Quando usar |
| --- | --- | --- |
| `background` | Plano de base | Fundo da página |
| `card` | Superfície de conteúdo | Blocos, painéis, tabelas |
| `card-2` | Superfície secundária | Cabeçalho de tabela, item em apontamento, campo dentro de card |
| `popover` | Camada flutuante | Menu, seletor, dica |
| `sidebar` | Moldura de navegação | Shell |
| `muted` | Fundo atenuado | Áreas de menor peso |
| `border` / `input` | Limite | Delimitação e campos |

Empilhamento canônico: `background` → `card` → `card-2` → `popover`.

Nunca criar uma quinta superfície improvisada com transparência aleatória. Camada
nova exige emenda (`FH-32.02`).

## 7.4 Conteúdo e ênfase

| Token | Uso |
| --- | --- |
| `foreground` | Texto principal e dado do usuário |
| `muted-foreground` | Rótulo, legenda, metadado, texto de apoio |
| `primary` | Ação principal, item ativo, identidade do acento |
| `primary-soft` / `primary-soft-2` | Superfície tingida de acento (pílula ativa, destaque de estado) |
| `destructive` | Ação com consequência de perda |
| `ring` | Foco |

Regra: dois níveis de texto bastam para quase toda página. Um terceiro nível é sinal
de hierarquia mal resolvida.

## 7.5 Espaçamento

A escala é fechada e baseada em 4px (`FH-31.01`, `FH-24.08`). Uso canônico:

| Valor | Aplicação típica |
| --- | --- |
| `1`–`2` (4–8px) | Entre rótulo e valor; ícone e texto |
| `3`–`4` (12–16px) | Interior de item de lista, célula, campo |
| `4`–`6` (16–24px) | Interior de card e painel |
| `6`–`8` (24–32px) | Entre blocos do mesmo assunto |
| `10`–`16` (40–64px) | Entre seções distintas de uma página |
| `20`+ (80px+) | Apenas páginas públicas, entre seções narrativas |

Nenhum valor arbitrário. Se um espaçamento "precisa" de um valor fora da escala, o
problema é a composição — não a escala.

## 7.6 Tipografia aplicada

Escala curta, papéis fixos:

| Papel | Escala | Peso | Cor |
| --- | --- | --- | --- |
| Título de página | `text-2xl`–`text-3xl` | 600 | `foreground` |
| Título de bloco | `text-base`–`text-lg` | 600 | `foreground` |
| Corpo / dado | `text-sm` | 400–500 | `foreground` |
| Apoio / metadado | `text-xs`–`text-sm` | 400 | `muted-foreground` |
| Rótulo de campo | `text-sm` | 500 | `foreground` |
| Legenda / badge | `text-xs` | 500 | conforme estado |

Em páginas públicas, a escala sobe um patamar inteiro — títulos maiores, corpo em
`text-base`/`text-lg`, mais respiro entre linhas.

Largura máxima de leitura contínua: 60–75 caracteres.

## 7.7 Botões

Hierarquia fechada (`FH-35.03`):

| Nível | Quantidade por contexto | Aparência |
| --- | --- | --- |
| Primária | Exatamente uma | Fundo `primary`, texto `primary-foreground` |
| Secundária | Poucas | Contorno ou superfície neutra |
| Terciária / ghost | Livre, discreta | Sem fundo, só texto ou ícone |
| Destrutiva | Rara | `destructive`, nunca em posição primária |

Estados obrigatórios em todos os níveis: normal, apontamento, foco, pressionado,
desabilitado, carregando. Um botão entregue sem estado de carregamento está
incompleto.

Botão executa, link navega. A aparência não decide isso (`FH-35.02`).

## 7.8 Campos e formulários

- Rótulo sempre visível. Placeholder nunca substitui rótulo.
- Erro no campo, com texto que diz como corrigir.
- Estado de sucesso é discreto — quase sempre desnecessário.
- Campo desabilitado explica por quê, quando o motivo não é óbvio.
- Formulário longo é agrupado por assunto, com espaçamento de separação entre grupos.

## 7.9 Listas, tabelas e cartões

A escolha é pela tarefa (`FH-35.05`):

| Forma | Tarefa | Sinal de escolha errada |
| --- | --- | --- |
| **Tabela** | Comparar valores | Colunas que ninguém compara |
| **Lista** | Percorrer e encontrar | Muitos campos por linha |
| **Cartão** | Reconhecer uma entidade | Dezenas de cartões idênticos rolando |

Cartão é a forma mais cara em espaço. Use-o quando o reconhecimento visual importa —
não como padrão.

## 7.10 Badges e indicadores

Badge destaca, não decora.

- Só existe se muda uma decisão ou comunica um estado real.
- Nunca dezenas na mesma tela.
- Nunca cor sozinha: sempre com texto ou forma (`FH-29.04`).

## 7.11 Ícones no sistema

- Um conjunto único em todo o produto.
- Tamanho alinhado à altura da linha de texto que acompanham.
- Espessura de traço constante.
- Cor herdada do contexto — nunca colorido por decoração.

## 7.12 A regra dos 95%

Noventa e cinco por cento de qualquer página deve ser montável apenas com o que já
existe em `src/components/ui/` e nos tokens.

Se você precisou de um valor fora do sistema, três hipóteses, nesta ordem:

1. A composição está errada.
2. O componente certo existe e não foi encontrado.
3. O sistema precisa de uma emenda — que se faz com proposta, não com exceção local
   (`FH-28.03`, `FH-28.05`).

Nunca a quarta hipótese: "só desta vez".

## 7.13 A Regra de Ouro do design system

> **"Consigo construir esta página inteira sem escrever um único valor visual à
> mão?"**

---

# CAPÍTULO 8 — ESPECIFICAÇÃO POR ARQUÉTIPO

Este capítulo é a aplicação prática dos capítulos anteriores. Cada arquétipo recebe
composição canônica, densidade, o que nunca fazer e critério de aprovação.

## 8.1 Página pública

**Composição:**

```
Cabeçalho enxuto (marca + 1 ação)
     ↓
Bloco de abertura: uma frase, uma imagem do produto, uma ação
     ↓
Seções alternando impacto e descanso — uma mensagem cada
     ↓
Ação final + rodapé
```

- Espaçamento entre seções: o dobro do padrão do produto.
- Uma pergunta respondida por seção; a seção seguinte responde a próxima dúvida.
- Toda rolagem entrega informação nova. Repetição gera abandono.
- Screenshots são ativos produzidos, com dados fictícios coerentes e nenhum erro
  visual.

**Critério de aprovação:** a proposta é compreendida antes da primeira rolagem.

## 8.2 Página de admissão

**Composição:**

```
Marca discreta
     ↓
Título curto (o que vai acontecer)
     ↓
Campos mínimos
     ↓
Ação primária única
     ↓
Saída secundária (voltar, outro método, ajuda)
```

- Coluna estreita e centralizada.
- Nada rola em tela de tamanho normal.
- Erro aparece em ≤300ms depois da resposta, no campo correspondente.
- Carregamento acontece no botão, com rótulo que informa o passo.

**Critério de aprovação:** alguém completa o fluxo sem ler nenhum texto de apoio.

## 8.3 Página operacional

**Composição:**

```
Cabeçalho baixo: título + estado (contagem, filtro ativo) + ação primária
     ↓
Barra de controle: busca, filtros, seleção — persistente, compacta
     ↓
Conteúdo em altura total, com rolagem própria
     ↓
Painel de detalhe (quando existir), com rolagem independente
```

- Densidade alta. Interior de item entre 12 e 16px.
- Estado por linha: não lido, atribuído, atrasado, com falha — sempre com texto ou
  forma além da cor.
- Seleção múltipla revela uma barra de ações em lote, sem deslocar a lista.
- Chegada de item novo em tempo real: sem animação, sem reordenar o que está sob
  leitura (`FH-39.10`, `FH-50`).
- Espaço reservado para tudo que ainda vai chegar (`FH-31.07`).

**Critério de aprovação:** a página continua legível e navegável com o volume máximo
de dados que uma conta grande produz (`FH-24.09`, `FH-46.10`).

## 8.4 Página analítica

**Composição:**

```
Cabeçalho: título + período + escopo
     ↓
Fileira de indicadores principais (no máximo quatro)
     ↓
Visualização principal — a que responde a pergunta central
     ↓
Detalhamentos secundários
```

- Cada indicador traz valor, unidade e comparação com período anterior — quando a
  comparação for honesta.
- Cores de série fixas e estáveis.
- Escala nunca truncada de forma a exagerar variação.
- Estado vazio de gráfico diz por que não há dado, não desenha gráfico falso.

**Critério de aprovação:** a pergunta central da página é respondida sem rolar.

## 8.5 Página de configuração

**Composição:**

```
Cabeçalho: título + escopo (conta ou pessoal)
     ↓
Grupos por consequência, com título e descrição curta
     ↓
Estado atual sempre antes do controle
     ↓
Ações destrutivas isoladas ao final, visualmente separadas
```

- Coluna estreita mesmo em tela larga.
- Densidade baixa, ritmo lento.
- Toda opção com consequência declara efeito, alcance e reversibilidade.
- Alternância aplica na hora; formulário aplica ao confirmar (`FH-35.04`).

**Critério de aprovação:** nenhuma opção pode ser acionada sem que a pessoa saiba o
que muda e para quem.

## 8.6 Página documental

**Composição:**

```
Título + data de atualização
     ↓
Sumário navegável (quando o texto for longo)
     ↓
Corpo em coluna de leitura
     ↓
Contato ou próximo passo
```

- Zero movimento, zero cor decorativa.
- Hierarquia de títulos real e semântica (`FH-38.06`).
- Conteúdo com efeito legal nunca fica escondido atrás de interação.

**Critério de aprovação:** o texto é encontrável, legível e imprimível.

## 8.7 Matriz de decisão rápida

| Situação | Decisão |
| --- | --- |
| Duas ações parecem igualmente primárias | A página tem escopo demais — divida |
| A tela ficou vazia com dados reais | Densidade errada para o arquétipo |
| A tela ficou ilegível com dados reais | Hierarquia dependente de pouco conteúdo |
| Precisei de uma cor nova | Estado não previsto — verifique o conjunto fechado |
| Precisei de um espaçamento fora da escala | Composição errada |
| A animação "deixa mais bonito" | Remova |
| O texto explica o que a interface deveria mostrar | Mostre o estado |
| Só fica bom em um acento | Dependência de cor — corrija |

---

# CAPÍTULO 9 — MOTION DESIGN

## 9.1 Função antes de estética

O movimento existe para comunicar **causa, origem ou continuidade** (`FH-39.02`).
Movimento sem função comunicativa é proibido.

O FlowHub é uma plataforma sobre fluxo. Isso não autoriza animar tudo: autoriza
mostrar continuidade onde ela existe de fato.

## 9.2 Faixas de duração

| Finalidade | Faixa | Exemplo |
| --- | --- | --- |
| Resposta imediata a gesto | 0–100ms | Apontamento, pressão, foco |
| Microtransição | 120–200ms | Abrir menu, revelar campo, trocar aba |
| Transição de superfície | 200–320ms | Painel lateral, modal, gaveta |
| Transição de contexto | 300–400ms | Troca de página, expansão de detalhe |
| Narrativa (apenas página pública) | até 600ms | Entrada por rolagem |

Duração fora das faixas é proibida (`FH-39.01`). Dentro do produto, a faixa narrativa
não existe.

## 9.3 Curvas

- Entrada: desaceleração (rápido no início, suave no fim).
- Saída: aceleração leve, mais curta que a entrada.
- Nada de elasticidade, quique ou sobressalto.
- Deslocamentos pequenos: 4 a 12px no produto; até 24px em página pública.

Toda animação deve parecer consequência de física, nunca efeito.

## 9.4 Hierarquia de movimento por arquétipo

| Arquétipo | O que pode animar |
| --- | --- |
| Pública | Entrada de seções, demonstração contínua do produto, transições de estado |
| Admissão | Transição entre passos, estado do botão |
| Operacional | Apenas apontamento, foco, abertura de painel e feedback de ação |
| Analítica | Entrada dos gráficos na primeira renderização |
| Configuração | Abertura de grupo, confirmação, feedback |
| Documental | Nada |

## 9.5 O que nunca animar

- Conteúdo sob leitura ou manipulação (`FH-39.10`).
- Chegada de itens em lista de alta frequência (`FH-39.05`).
- Números que o usuário precisa ler com precisão.
- Qualquer coisa que atrase o resultado da ação (`FH-39.08`).
- Reordenação automática de lista enquanto alguém interage com ela.

## 9.6 Regras invioláveis

- Animação nunca bloqueia entrada (`FH-39.03`).
- Toda animação é cancelável por nova ação (`FH-39.04`).
- Nenhuma informação essencial depende de movimento (`FH-39.07`).
- Entrada e saída são consistentes por família de componente (`FH-39.09`).
- Com movimento reduzido, o caminho é **equivalente**, nunca degradado (`FH-39.06`,
  `FH-38.07`) — a transição vira troca imediata, e nada de informação se perde.

## 9.7 A Regra de Ouro do movimento

> **"Consigo dizer, em uma frase, o que esta animação comunica — e ela ainda vale a
> pena na milésima repetição?"**

---

# CAPÍTULO 10 — TEXTO COMO ELEMENTO VISUAL

## 10.1 Texto é design

Em interface, o texto ocupa mais área que qualquer outro elemento. Escrever mal é
desenhar mal.

Todo texto de interface vive no dicionário de i18n (`src/i18n/messages/pt-BR.json`),
em chaves hierárquicas por domínio. Texto hardcoded é defeito, não atalho.

## 10.2 Comprimentos máximos

| Elemento | Limite |
| --- | --- |
| Título de página | 1 linha |
| Título de bloco | 1 linha |
| Descrição de apoio | 2 linhas |
| Rótulo de botão | 1 a 3 palavras |
| Estado vazio | 1 frase + 1 ação |
| Mensagem de erro | 1 frase de causa + 1 de caminho |
| Dica contextual | 1 frase |

Se não couber, o problema é de escopo — não de fonte.

## 10.3 Botões

Verbo + objeto. Sempre.

- Bom: "Criar contato", "Enviar campanha", "Excluir automação".
- Ruim: "Enviar", "OK", "Confirmar", "Continuar".

O rótulo deve fazer sentido lido isoladamente, fora de contexto — é assim que um leitor
de tela o entrega.

## 10.4 Erros

Estrutura fixa: **o que aconteceu → o que foi preservado → o que fazer**.

Nunca culpar o usuário (`FH-17.04`). Nunca humor (`FH-09.05`). Nunca jargão técnico
ou identificador interno (`FH-08.08`). Nunca desculpa performática (`FH-09.07`).

## 10.5 Estados vazios

Três respostas obrigatórias (`FH-42.02`): que lugar é este, por que está vazio, o que
fazer agora.

O vazio ensina o modelo mental: diz o que vai aparecer aqui e de onde virá
(`FH-42.08`). Nunca cobra, nunca culpa, nunca decora sem informar.

## 10.6 Números, datas e nomes

- Moeda sempre com formatação local e símbolo.
- Data relativa apenas quando a precisão não importa; caso contrário, data completa
  acessível.
- Nome de pessoa e de empresa nunca reescritos ou corrigidos pelo sistema
  (`FH-30.06`).
- Contagem grande sempre formatada, nunca truncada sem indicação.

## 10.7 Característica não é mensagem

Nenhum texto de usuário é derivado do nome da funcionalidade, da tecnologia, do
fornecedor ou do requisito que o originou (`FH-57.11`). A cadeia é obrigatória:

```
CAPACIDADE  → o que existe tecnicamente        (a implementação conhece)
     ↓
BENEFÍCIO   → o que isso permite ao usuário    (a documentação de produto define)
     ↓
PERCEPÇÃO   → o que ele deve sentir            (a direção de experiência define)
     ↓
COMUNICAÇÃO → como isso se diz                 (a interface expressa)
```

Nenhuma camada repete a linguagem da anterior.

Antes de escrever, declare o **registro** do conteúdo (`FH-57.13`): técnico,
funcional, benefício, experiencial ou comercial. Em registro experiencial ou
comercial, copiar a linguagem da especificação é proibido — a abstração sobe até a
consequência humana.

| Não escreva | Escreva |
| --- | --- |
| Meta BYOK & BYOA — você é dono das suas chaves de API | **Você está no controle.** Suas conexões permanecem sob seu controle |
| Retenção Zero de Documentos | **Seus dados continuam sendo seus.** O FlowHub trabalha com seus arquivos sem tomar posse deles |
| Isolamento Multi-tenant — segurança bancária por RLS | **Seu espaço permanece seu.** Cada operação permanece isolada e protegida |
| Conformidade LGPD | **Seus dados merecem transparência.** Privacidade faz parte de como o FlowHub foi construído |

Termos de tecnologia, arquitetura, segurança e conformidade não aparecem em texto de
usuário sem justificativa registrada (`FH-59.11`, Anexo A §6.1). A exceção é onde o
termo **é** a informação: a tela em que a pessoa cola uma credencial, a página de
subprocessadores, o texto legal. A proibição atinge o uso persuasivo, não o
operacional.

**Teste obrigatório antes de aceitar qualquer texto:**

> **"Estamos falando sobre o que construímos ou sobre o que isso muda para quem
> usa?"**

Se for a primeira, e o contexto não for explicitamente técnico, reescreva.

## 10.8 A Regra de Ouro do texto

> **"Este texto informa uma decisão — ou está pedindo desculpa por uma interface que
> não se explica?"**

E, antes dela: **o usuário não precisa admirar a arquitetura. Ele precisa sentir o
benefício que ela tornou possível.**

---

# CAPÍTULO 11 — QUALIDADE PERCEBIDA

## 11.1 Desempenho é estética

Uma página lenta é uma página feia, por melhor que seja o layout.

Regras:

- Espaço reservado antes do conteúdo chegar: nada se desloca (`FH-46.03`).
- Carregamento reproduz a forma do conteúdo conhecido (`FH-46.02`).
- Resposta ao gesto é sempre imediata, mesmo que o resultado demore (`FH-46.07`).
- Trabalho em segundo plano é visível e não bloqueia (`FH-46.06`).
- Progresso só com medição real (`FH-46.04`).
- Velocidade nunca é obtida por engano (`FH-46.09`).
- Verificação com rede degradada e conta grande, sempre (`FH-46.10`).

## 11.2 Acessibilidade bloqueia entrega

Acessibilidade não é melhoria futura (`FH-38.01`).

Antes de entregar qualquer página:

- Foco visível em todo elemento interativo, nunca suprimido (`FH-38.02`).
- Operação integral por teclado, sem armadilha de foco (`FH-38.03`).
- Contraste verificado em todos os modos e acentos (`FH-38.04`).
- Nome acessível coerente em todo controle (`FH-38.05`).
- Estrutura semântica refletindo a hierarquia real (`FH-38.06`).
- Alvos respeitando a dimensão mínima (`FH-38.08`).
- Nada dependendo de um único canal — cor, forma, posição, som ou movimento
  (`FH-38.09`).
- Mudanças dinâmicas anunciadas sem roubar o foco (`FH-38.10`).
- Verificação real com teclado **e** leitor de tela (`FH-38.11`).

## 11.3 Verificação de tema

Toda página é verificada em `light` e `dark`, e em pelo menos dois acentos distintos —
sendo um deles obrigatoriamente um acento claro (`amber`), que é onde o contraste de
`primary-foreground` costuma falhar (`FH-29.10`).

## 11.4 Páginas públicas

Além de tudo acima:

- Metadados exportados no `layout`/`page` server component.
- Título e descrição únicos e verdadeiros.
- Imagens dimensionadas e otimizadas; nada de screenshot pesado sem tratamento.
- Nenhum conteúdo essencial dependente de JavaScript para ser lido.

## 11.5 A Regra de Ouro da qualidade percebida

> **"Esta página seria aprovada por alguém usando apenas teclado, em rede ruim, no
> acento âmbar, com uma conta cheia de dados?"**

---

# CAPÍTULO 12 — CHECKLIST DE EXCELÊNCIA

## 12.1 Antes de desenhar

- [ ] Declarei o arquétipo da página.
- [ ] Nomeei a tarefa dominante em uma frase.
- [ ] Defini a ação primária única.
- [ ] Consultei o Anexo B e listei os artigos aplicáveis.
- [ ] Verifiquei se já existe uma página equivalente para reutilizar o padrão.

## 12.2 Durante

- [ ] Estrutura definida antes de estilo.
- [ ] Nenhum valor visual escrito à mão.
- [ ] Espaçamentos todos dentro da escala.
- [ ] Espaço interno de grupo menor que o espaço de separação.
- [ ] Hierarquia por posição e peso antes de cor.
- [ ] Um protagonista por bloco.
- [ ] Componentes reaproveitados de `src/components/ui/`.
- [ ] Todo texto no dicionário de i18n.
- [ ] Nenhum elemento sem função declarável.

## 12.3 Antes de entregar — a prova dos sete olhares

1. **Olhar desfocado** — o protagonista continua óbvio?
2. **Olhar em cinza** — a hierarquia sobrevive sem cor?
3. **Olhar cheio** — a página aguenta o volume máximo de dados?
4. **Olhar vazio** — os quatro estados existem e foram desenhados?
5. **Olhar de teclado** — dá para fazer tudo sem mouse, com foco visível?
6. **Olhar pequeno** — a mesma capacidade existe no celular, com uma mão?
7. **Olhar repetido** — na milésima vez, algo ainda atrapalha?

Se qualquer olhar falhar, a página não está pronta.

## 12.4 Critério final

Uma página do FlowHub está pronta quando ela **não chama atenção para si mesma** e,
ainda assim, alguém que entende de design percebe imediatamente que foi feita com
cuidado.

---

# CAPÍTULO 13 — PROMPT MESTRE

Este prompt deve ser usado por qualquer pessoa ou agente ao criar ou revisar uma
página do FlowHub. Preencha os campos entre colchetes.

```
CONTEXTO
Vou criar/revisar a página [nome/rota] do FlowHub.
Arquétipo: [pública | admissão | operacional | analítica | configuração | documental]
Tarefa dominante (uma frase): [ ... ]
Ação primária única: [ ... ]
Quem usa e com que frequência: [ ... ]

REGRAS QUE GOVERNAM ESTA ENTREGA
1. Constituição do Produto (docs/constituicao/) define o que construir e por quê.
   Ordem de carregamento: Anexo B → Anexo C → Núcleos Normativos → capítulo completo.
2. Este documento (docs/direcao-criativa/VOLUME-II-direcao-de-arte-de-paginas.md)
   define a direção artística. Se a página for a Landing, o Volume I
   (docs/direcao-criativa/VOLUME-I-landing-page.md) define conteúdo e sequência.
3. AGENTS.md define como implementar neste repositório.
4. Em conflito com artigo marcado DEVE/NUNCA: pare e sinalize antes de implementar.

DIREÇÃO ARTÍSTICA OBRIGATÓRIA
- Estrutura antes de estilo: identidade → estado → conteúdo → ação.
- Uma tarefa dominante, uma ação primária, no máximo três decisões simultâneas.
- Densidade correspondente ao arquétipo declarado.
- Hierarquia por posição e peso antes de cor; deve sobreviver em escala de cinza.
- Nenhuma cor literal, nenhum espaçamento fora da escala, nenhum raio arbitrário:
  só tokens de src/app/globals.css e primitivos de src/components/ui/.
- Neutros dominam (~90%); acento é raro; estado é vocabulário fechado.
- Sombra separa planos; borda delimita. Elevação nunca é decoração.
- Movimento só com função comunicativa, dentro das faixas de duração.
- Nenhuma ilustração, textura, gradiente protagonista ou brilho permanente.
- Todo texto no dicionário i18n pt-BR.
- Multi-tenant: toda leitura respeita account_id; nada vaza entre contas.

ENTREGÁVEL
1. Composição da página seguindo a anatomia canônica.
2. Os quatro estados: vazio, carregando, erro, sem permissão.
3. Comportamento em tela pequena, com paridade de capacidade.
4. Verificação em light e dark, em pelo menos dois acentos (um deles amber).
5. Verificação por teclado e com volume máximo de dados.
6. Bloco de Conformidade citando os artigos FH-XX.NN que sustentam as decisões.

PERGUNTAS DE APROVAÇÃO (todas devem ser SIM)
- Consigo nomear a tarefa dominante em uma frase?
- A ação primária é única e imediatamente localizável?
- A hierarquia sobrevive sem cor?
- A página aguenta o volume máximo de dados?
- Os quatro estados existem?
- Nenhum valor visual foi escrito à mão?
- Nada se desloca quando o conteúdo chega?
- Na milésima vez, nada atrapalha?
```

---

## Encerramento

O Volume I ensina a conquistar alguém em três minutos.

Este volume ensina a merecer essa pessoa todos os dias.

A landing precisa ser notada. O produto precisa ser esquecido — no melhor sentido
possível: esquecido porque nunca atrapalha, nunca surpreende e nunca cobra atenção que
deveria estar no cliente do outro lado da conversa.

> **A melhor página do FlowHub é aquela que ninguém comenta, e que ninguém consegue
> mais deixar de usar.**

---

## Bloco de Conformidade (`FH-68.02`)

**Artigos consultados e aplicados:**
`FH-08.02`, `FH-08.03`, `FH-08.06`, `FH-08.08`, `FH-08.09`, `FH-08.10`, `FH-08.11`,
`FH-09.01` a `FH-09.09`, `FH-17.03` a `FH-17.10`, `FH-24.01` a `FH-24.10`,
`FH-28.02` a `FH-28.09`, `FH-29.01` a `FH-29.10`, `FH-30.01` a `FH-30.10`,
`FH-31.01` a `FH-31.10`, `FH-32.01` a `FH-32.10`, `FH-35.02` a `FH-35.05`,
`FH-37.04` a `FH-37.09`, `FH-38.01` a `FH-38.11`, `FH-39.01` a `FH-39.10`,
`FH-42.02`, `FH-42.08` a `FH-42.10`, `FH-46.02` a `FH-46.10`, `FH-68.02`, `FH-68.08`.

**Natureza da entrega:** documento de direção artística. Não altera código, schema,
autorização ou tenancy.

**Conflitos identificados:** nenhum. Onde o Volume I (Landing Page) e a Constituição
divergem em ênfase — notadamente sobre movimento narrativo e uso de gradiente — este
volume restringe o uso ao arquétipo público e mantém a regra constitucional dentro do
produto.

**Precedência declarada:** Constituição > este documento > preferência estética
individual.
