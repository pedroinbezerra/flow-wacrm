# Constituição do Produto FlowHub

## Volume 0 — Índice Mestre e Arquitetura do Documento

> Este arquivo é o **mapa e a lei estrutural** da Constituição do FlowHub.
> Ele define o que a Constituição é, como ela se organiza, como cada capítulo
> deve ser escrito, como conflitos entre capítulos se resolvem e em que ordem
> os capítulos são expandidos.
>
> Nenhum capítulo pode ser escrito, alterado ou interpretado sem obedecer às
> regras deste Volume 0.

---

## 0.1 Status deste documento

| Campo | Valor |
| --- | --- |
| Nome canônico | Constituição do Produto FlowHub |
| Versão do documento | 1.1.0-draft |
| Estado | Arquitetura definida — capítulos em expansão |
| Idioma canônico | pt-BR |
| Local canônico | `docs/constituicao/` |
| Autoridade | Fonte de verdade máxima para decisões de produto e experiência |
| Público | Product Designers, Engenheiros, Arquitetos, PMs, Redatores, Agentes de IA |
| Pressuposto de leitura | O leitor tem competência técnica, mas **nunca conversou com os fundadores** |

---

## 0.2 Por que esta Constituição existe

Produtos morrem de duas formas. A primeira é rápida e visível: ninguém usa.
A segunda é lenta e invisível: o produto continua sendo usado, mas deixa de
ser **ele mesmo**. Cada nova tela é decidida por uma pessoa diferente, com um
critério diferente, em um momento diferente, sob uma pressão diferente. Nenhuma
decisão isolada parece errada. O conjunto vira incoerente. O usuário sente antes
de saber explicar: "ficou confuso", "não é mais tão bom", "parece outro sistema".

Essa segunda morte é sempre causada pela mesma coisa: **a identidade do produto
existia apenas na cabeça de algumas pessoas**. Quando essas pessoas saem, mudam
de time, ficam ocupadas ou são substituídas por agentes automatizados, a
identidade evapora. O que sobra é um acúmulo de funcionalidades.

A Constituição existe para tornar a identidade do FlowHub **externa às pessoas**.
Ela transfere o julgamento subjetivo de indivíduos para regras objetivas
escritas. Ela é o mecanismo pelo qual o FlowHub de 2035 continua sendo o FlowHub,
mesmo que nenhuma das pessoas que o criou ainda esteja presente, mesmo que a
tecnologia de interface tenha mudado por completo, mesmo que a maior parte do
código seja escrita por inteligências artificiais.

---

## 0.3 O que esta Constituição é — e o que não é

**Ela é:**

- A definição permanente da identidade do FlowHub.
- Um conjunto de **regras normativas** verificáveis, não de conselhos.
- O critério de aceite final de qualquer funcionalidade, tela ou fluxo.
- O contrato entre todas as pessoas e todos os agentes que evoluem o produto.
- Um documento **atemporal**: fala de princípios, comportamentos e obrigações,
  não de tecnologias específicas ou telas específicas.

**Ela não é:**

- Documentação técnica de implementação (isso vive em `AGENTS.md` e `docs/`).
- Manual do usuário final.
- Roadmap, backlog ou lista de funcionalidades.
- Guia de estilo visual isolado — o design system é uma **consequência** da
  filosofia, e está subordinado a ela.
- Um registro de como o produto está hoje. A Constituição descreve como o
  produto **deve ser**. Onde o produto atual contradiz a Constituição, o produto
  está errado, não a Constituição (ver Capítulo 66 — Dívida de Experiência).

---

## 0.4 Regra de ouro da escrita constitucional

Toda frase desta Constituição deve passar por três testes:

1. **Teste da objetividade** — duas pessoas competentes, lendo a mesma frase sem
   se conhecerem, chegam à mesma decisão? Se não, a frase é subjetiva e deve ser
   reescrita como regra objetiva.
2. **Teste da verificabilidade** — é possível olhar para uma tela, um fluxo ou um
   trecho de código e dizer com clareza "isto cumpre" ou "isto viola"? Se não, a
   regra ainda é um desejo, não uma norma.
3. **Teste da atemporalidade** — a frase continuará verdadeira se a tecnologia de
   interface mudar (voz, superfícies novas, agentes autônomos)? Se depende de uma
   tecnologia específica, ela pertence a um anexo de implementação, não ao corpo
   constitucional.

Se uma decisão subjetiva aparecer durante a escrita, ela **deve** ser convertida
em regra objetiva. Exemplo do que é proibido: "usar animações sutis". Exemplo do
que é exigido: "transições de estado interno duram entre 120 ms e 200 ms; entradas
de elementos que exigem atenção duram entre 200 ms e 320 ms; nenhuma animação
bloqueia entrada do usuário; toda animação é cancelável por nova ação".

---

## 0.5 Linguagem normativa obrigatória

Todos os capítulos usam exatamente estes cinco verbos normativos, sempre em
maiúsculas, com estes significados fixos:

| Termo | Significado | Consequência da violação |
| --- | --- | --- |
| **DEVE** | Obrigação absoluta. | Bloqueia entrega. Não existe exceção sem emenda constitucional. |
| **NUNCA** | Proibição absoluta. | Bloqueia entrega. Não existe exceção sem emenda constitucional. |
| **DEVERIA** | Obrigação forte. | Exige justificativa escrita e registrada para não cumprir (ver §0.9). |
| **PODE** | Permissão explícita. | Sem consequência. Marca território legítimo de escolha. |
| **EVITAR** | Desencorajamento forte. | Exige justificativa oral no review; registrada se recorrente. |

Nenhum outro verbo carrega força normativa. "Recomendamos", "é bom que",
"idealmente" e "sugerimos" são **proibidos** no corpo da Constituição, porque
delegam a decisão de volta ao julgamento individual — exatamente o problema que
este documento existe para eliminar.

---

## 0.6 Sistema de identificação de artigos

Toda regra normativa recebe um identificador permanente e imutável:

```
FH-<capítulo>.<sequência>
```

Exemplos: `FH-08.14`, `FH-39.02`, `FH-52.31`.

Regras deste sistema:

- O identificador **NUNCA** é reutilizado, mesmo que a regra seja revogada.
- Uma regra revogada permanece no documento marcada como `[REVOGADO em vX.Y.Z]`
  com o motivo e a regra que a substituiu. A Constituição preserva sua própria
  história porque decisões futuras precisam saber o que já foi tentado.
- Código, revisões, RFCs e comentários de PR **DEVEM** citar o identificador ao
  invocar uma regra. Exemplo de comentário aceitável em código:
  `// Confirmação suprimida por FH-45.07 (ação reversível em até 10s).`
- Agentes de IA **DEVEM** citar identificadores ao justificar decisões de
  experiência.

---

## 0.7 Estrutura interna obrigatória de cada capítulo

Todo capítulo, sem exceção, segue esta estrutura de treze seções. A uniformidade
não é burocracia: ela permite que qualquer pessoa — ou agente — encontre a
informação que precisa em qualquer capítulo sem aprender uma organização nova.

0. **Núcleo Normativo** — bloco compacto, no topo absoluto do capítulo, contendo
   todos os artigos do capítulo em forma de lista, sem fundamentação, sem
   exemplo, sem justificativa. É a primeira coisa do arquivo depois do título e
   dos metadados.

   Esta seção existe por uma razão prática: nenhum leitor — humano sob pressão ou
   agente com contexto limitado — consegue carregar a Constituição inteira antes
   de agir. O Núcleo Normativo garante que ler 5% do capítulo entregue 100% das
   obrigações. Quem precisa entender o *porquê* continua lendo; quem precisa
   apenas **não violar** já tem o suficiente.

   O Núcleo Normativo **NUNCA** contém regra que não esteja desenvolvida no corpo
   do capítulo, e o corpo **NUNCA** contém obrigação ausente do Núcleo. Divergência
   entre os dois é defeito grave do documento e **DEVE** ser corrigida antes de
   qualquer uso do capítulo.

1. **Propósito** — o que este capítulo governa e por que ele existe.
2. **Perguntas que este capítulo responde** — lista literal das dúvidas práticas
   que o leitor traz. Serve de índice de busca humano.
3. **Definições** — todo termo usado com sentido próprio, definido antes do uso.
   Nenhum termo pode ser usado antes de definido.
4. **Fundamento** — a razão humana, cognitiva, ergonômica, emocional ou de
   negócio. Explica o *porquê* antes do *o quê*, para que a regra sobreviva à
   mudança de contexto.
5. **Princípios** — as verdades de nível superior do capítulo (poucas, densas).
6. **Regras normativas** — artigos numerados com `FH-XX.NN`, cada um contendo:
   - o enunciado da regra;
   - a **verificação binária** (§0.10);
   - **quando aplicar**;
   - **quando NÃO aplicar** (a fronteira é tão obrigatória quanto a regra);
   - exemplo do certo e exemplo do errado, ambos concretos.
7. **Anti-padrões** — o que já se sabe que dá errado, nomeado, para que erros não
   sejam redescobertos a cada geração de time.
8. **Impactos** — obrigatoriamente os cinco eixos, cada um em texto próprio:
   impacto cognitivo; impacto emocional; impacto na produtividade; impacto na
   percepção de qualidade; impacto na curva de aprendizagem.
9. **Riscos e trade-offs** — o custo real de seguir a regra, admitido
   honestamente, e por que o custo vale a pena.
10. **Critérios de verificação** — como provar objetivamente que a regra foi
    cumprida. Cada critério é observável, testável ou mensurável.
11. **Checklist do capítulo** — lista curta de verificação para uso em review.
12. **Referências cruzadas** — capítulos dos quais este depende e capítulos que
    dependem dele.

Capítulos que envolvem conflito entre especialidades (por exemplo, densidade de
informação versus acessibilidade, ou automação versus controle do usuário)
**DEVEM** conter uma seção adicional **"Conflito e arbitragem"**, na qual as
visões divergentes são apresentadas de forma justa e a decisão final é declarada
com justificativa. A Constituição nunca deixa um conflito em aberto.

---

## 0.8 Hierarquia normativa e resolução de conflitos

Quando dois trechos da Constituição parecerem exigir coisas opostas, a decisão
segue esta ordem de precedência, do mais forte para o mais fraco:

1. **Livro I — Identidade e Filosofia** (Capítulos 5 a 12).
2. **Livro II — O Ser Humano** (Capítulos 13 a 19), com destaque para
   acessibilidade e integridade cognitiva.
3. **Livro V — Comportamento do Sistema** (Capítulos 41 a 51).
4. **Livro III — Estrutura** (Capítulos 20 a 27).
5. **Livro VI — Inteligência** (Capítulos 52 a 56).
6. **Livro IV — Matéria / Design System** (Capítulos 28 a 40).
7. **Livro VII — Linguagem** (Capítulos 57 a 60).
8. **Livro VIII — Governança** (Capítulos 61 a 68).

Sobre essa ordem — quatro regras de desempate que a atravessam e vencem sempre:

- **Segurança de dados e tenancy vencem qualquer regra de experiência.** Nenhuma
  simplificação de interface pode enfraquecer isolamento por conta, autorização
  ou consentimento.
- **Acessibilidade nunca é negociável por estética.** Se um efeito visual impede
  alguém de usar o produto, o efeito é removido, não a pessoa.
- **Reversibilidade vence velocidade.** Se a escolha é entre um fluxo mais rápido
  e um fluxo do qual o usuário consegue voltar, vence o reversível.
- **Compreensão vence poder.** Se uma capacidade poderosa só é utilizável por
  quem já domina o sistema, ela é redesenhada, adiada ou escondida — não enviada.

Se, mesmo assim, o conflito persistir, o caso vira **emenda constitucional**
(§0.9), nunca uma exceção informal. Exceções informais são o mecanismo pelo qual
constituições morrem.

---

## 0.9 Emenda, exceção e versionamento

- A Constituição usa versionamento semântico: `MAIOR.MENOR.CORREÇÃO`.
  - **MAIOR** — mudança de identidade, princípio fundamental ou hierarquia.
  - **MENOR** — novo capítulo, novo artigo, nova obrigação.
  - **CORREÇÃO** — clareza, exemplos, redação, sem mudança de obrigação.
- Toda emenda **DEVE** registrar: o que muda, por que muda, o que a motivou, o
  que passa a ser proibido, o que deixa de ser proibido e o impacto sobre o
  produto existente.
- Toda exceção a um **DEVERIA** **DEVE** ser registrada no Anexo E (Registro de
  Decisões), com autor, data, motivo e prazo de revisão. Exceção sem prazo é
  proibida: ela vira regra por inércia.
- Um **DEVE** ou **NUNCA** só cede por emenda formal. Nunca por urgência, prazo,
  pedido de cliente ou preferência pessoal.

---

## 0.10 Verificação binária: o que faz um artigo existir

Um artigo só é válido se puder ser **verificado sem julgamento**. Toda regra
`FH-XX.NN` **DEVE** vir acompanhada de uma linha de verificação que responda
`SIM` ou `NÃO`, jamais "depende", "razoavelmente" ou "de forma adequada".

Formato obrigatório:

```
> **Verificação:** <pergunta fechada> → SIM = cumpre | NÃO = viola.
```

Exemplos válidos:

- `> **Verificação:** existe pelo menos um caminho de teclado que executa esta ação sem uso de ponteiro? → SIM = cumpre | NÃO = viola.`
- `> **Verificação:** após a falha, o conteúdo digitado pelo usuário continua presente e editável na tela? → SIM = cumpre | NÃO = viola.`

Exemplos inválidos, e por quê:

- "A animação deve ser sutil." — subjetivo, não verificável.
- "O texto deve ser claro." — não existe teste binário para "claro".
- "Usar espaçamento adequado." — devolve a decisão ao julgamento individual.

Quando uma qualidade desejada não puder ser reduzida a verificação binária, ela
**DEVE** ser decomposta até que possa. "Texto claro" vira, por exemplo: cabe em
até N palavras; não contém termo fora do Anexo A; descreve o resultado da ação e
não o mecanismo interno. Se, esgotada a decomposição, a qualidade ainda for
irredutível, ela **NUNCA** vira artigo — vira **princípio** (seção 5 do capítulo),
que orienta mas não bloqueia entrega.

Essa separação é deliberada e estrutural: **princípio orienta, artigo bloqueia.**
Nada bloqueia uma entrega sem ser objetivamente verificável, e nada objetivamente
verificável fica de fora dos artigos.

**Volume mínimo por capítulo.** Todo capítulo **DEVE** produzir no mínimo 8
artigos verificáveis. Um capítulo que não consiga produzi-los está descrevendo
uma opinião, não uma norma — e **DEVE** ser fundido a outro capítulo ou
convertido em seção de fundamentação de um capítulo existente.

---

## 0.11 Regra de fallback: o que fazer quando a letra não cobre o caso

Esta seção é dirigida principalmente a quem decide sozinho — o desenvolvedor de
madrugada, o designer sem par disponível, o agente autônomo em execução sem
supervisão humana.

Quando nenhum artigo cobrir a situação, a decisão segue esta ordem, obrigatória e
nesta sequência:

1. **Procurar analogia.** Existe artigo governando situação estruturalmente
   equivalente? Se sim, aplicá-lo por analogia e registrar a analogia usada.
2. **Descer da hierarquia.** Não havendo analogia, decidir pelo princípio mais
   específico aplicável; não havendo, pelo Livro I; não havendo, pelo Capítulo 7.
3. **Escolher o caminho reversível.** Entre duas soluções defensáveis, escolher
   sempre aquela da qual o usuário consegue voltar, mesmo que seja a mais lenta,
   a mais verbosa ou a menos elegante.
4. **Não inventar padrão novo.** É **PROIBIDO** criar um padrão de interação,
   componente, termo ou comportamento inédito para resolver um caso não previsto.
   Reutilizar um padrão existente de forma imperfeita é sempre preferível a
   introduzir um padrão não constitucional — o primeiro produz uma tela mediana,
   o segundo produz uma fratura permanente no produto.
5. **Sinalizar.** Toda decisão tomada por fallback **DEVE** ser registrada como
   lacuna constitucional (Anexo E) e sinalizada explicitamente ao ser entregue.
   O texto do registro responde: qual era o caso, qual artigo faltou, o que foi
   decidido e por quê.

**Regra de parada.** Se cumprir o pedido exigir violar um **DEVE** ou um **NUNCA**,
quem executa **DEVE** interromper e sinalizar antes de implementar. Isso vale
integralmente para agentes autônomos: um agente **NUNCA** silencia uma violação
constitucional para satisfazer uma instrução de tarefa. Ele expõe o conflito,
propõe a alternativa conforme e aguarda decisão humana.

---

## 0.12 Camada de aterrissagem: do conceito ao artefato

A Constituição é escrita em termos atemporais — "token semântico", "primitiva
reutilizável", "isolamento por conta" — porque precisa sobreviver à troca de
tecnologia. Mas quem executa trabalha com arquivos concretos.

Por isso, todo capítulo cujo conteúdo tenha correspondência direta no código
**DEVE** conter uma seção final chamada **"Aterrissagem"**, mapeando cada conceito
ao artefato real onde ele vive hoje.

Regras da Aterrissagem:

- Ela mapeia **conceito → local**, nunca **conceito → instrução de implementação**.
  Dizer onde os tokens de cor vivem é aterrissagem; dizer como escrever a classe
  CSS é implementação e pertence ao `AGENTS.md`.
- Ela é a **única** parte do capítulo que pode envelhecer com a tecnologia. Se um
  caminho mudar, corrige-se a Aterrissagem em versão de CORREÇÃO, sem tocar nos
  artigos.
- Ela **NUNCA** cria obrigação nova. Se algo é obrigatório, é artigo; a
  Aterrissagem apenas localiza.
- Se o artefato citado não existir mais, a Aterrissagem **DEVE** ser corrigida
  antes de o capítulo ser usado como base para qualquer decisão.

O mapa consolidado de todas as aterrissagens vive no **Anexo F**.

---

## 0.13 Relação com o `AGENTS.md` e demais documentos do repositório

Existe uma separação de competência estrita, e ela **NUNCA** pode ser embaralhada:

| Documento | Governa | Exemplo do que decide |
| --- | --- | --- |
| **Constituição** (`docs/constituicao/`) | O **quê** e o **porquê** | Se esta ação precisa de confirmação ou de desfazer |
| **`AGENTS.md`** | O **como** implementar | Qual convenção de nome de arquivo, qual cliente Supabase usar |
| **`docs/business-rules/`, `docs/legal/`** | Obrigações legais e contratuais | Retenção de dados, LGPD, cobrança |

Regras de precedência entre documentos:

- Em conflito entre Constituição e `AGENTS.md` sobre **o que construir**, vence a
  Constituição.
- Em conflito sobre **como implementar** dentro deste repositório, vence o
  `AGENTS.md`.
- Obrigação legal vence ambos, sempre. Quando uma exigência legal contradisser um
  artigo constitucional, a lei prevalece e o artigo **DEVE** ser emendado para
  incorporar a restrição — nunca ignorado silenciosamente.

---

## 0.14 Convenções de arquivo e artefatos vivos

```
docs/constituicao/
  00-INDICE-E-ARQUITETURA.md        ← este arquivo
  ANEXO-B-indice-de-artigos.md      ← artefato vivo, atualizado a cada capítulo
  L0-C01-natureza-e-autoridade.md
  L0-C02-como-ler-e-aplicar.md
  ...
  L4-C29-tokens-cor-tema-e-modo.md
  ...
  ANEXO-A-glossario.md
```

- Um arquivo por capítulo. Nenhum capítulo é dividido em vários arquivos.
- Nome do arquivo: `L<livro>-C<capítulo com dois dígitos>-<slug-kebab-case>.md`.
- Todo capítulo abre com um bloco de metadados (versão, estado, dependências),
  imediatamente seguido do **Núcleo Normativo**.
- Idioma canônico pt-BR. Traduções são derivadas e nunca normativas.

**Artefatos vivos.** Três arquivos são atualizados **no mesmo ciclo** em que
qualquer capítulo é escrito ou alterado. Escrever um capítulo sem atualizá-los é
entrega incompleta:

| Artefato | Atualização obrigatória |
| --- | --- |
| `ANEXO-B-indice-de-artigos.md` | Todo artigo novo, alterado ou revogado |
| `ANEXO-A-glossario.md` | Todo termo definido pela primeira vez |
| `ANEXO-F-mapa-de-conformidade.md` | Toda Aterrissagem criada ou corrigida |

O Anexo B é o arquivo mais consultado de toda a Constituição na prática: é ele
que um agente carrega quando não tem contexto para os capítulos inteiros. Por
isso ele **NUNCA** é gerado ao final — nasce junto com o primeiro capítulo e
cresce a cada um.

---

# ÍNDICE MESTRE

Oito livros, 68 capítulos, 6 anexos.

| Livro | Tema | Capítulos | Pergunta que o livro responde |
| --- | --- | --- | --- |
| 0 | A Constituição | 1–4 | Como esta lei funciona? |
| I | Identidade e Filosofia | 5–12 | O que o FlowHub é? |
| II | O Ser Humano | 13–19 | Para quem, e como essa pessoa funciona? |
| III | Estrutura | 20–27 | Como o sistema se organiza na mente do usuário? |
| IV | Matéria (Design System) | 28–40 | De que o sistema é feito? |
| V | Comportamento do Sistema | 41–51 | Como o sistema se comporta? |
| VI | Inteligência | 52–56 | Como o sistema pensa e antecipa? |
| VII | Linguagem | 57–60 | Como o sistema fala? |
| VIII | Governança | 61–68 | Como o sistema permanece sendo ele mesmo? |
| Anexos | Instrumentos | A–F | Como aplicar isto no dia a dia? |

---

## LIVRO 0 — A CONSTITUIÇÃO

### Capítulo 1 — Natureza, autoridade e alcance
**Propósito.** Estabelecer que este documento é a fonte de verdade máxima do
produto, o que ele governa e o que ele não governa.
**Responde.** Quem manda quando há discordância? Isto vale para código? Vale
para decisões comerciais? Vale para agentes de IA? O que acontece se alguém
ignorar?
**Governa.** Toda decisão de UX, UI, arquitetura de informação, linguagem, IA,
automação, onboarding, acessibilidade e evolução.
**Depende de.** Nada. É o capítulo raiz.

### Capítulo 2 — Como ler, aplicar e interpretar
**Propósito.** Ensinar o uso prático: leitura por papel (designer, engenheiro,
PM, agente de IA), leitura por situação (nova tela, correção, refatoração),
método de interpretação quando a letra não cobre o caso.
**Responde.** Preciso ler tudo? Por onde começo? Como interpreto um caso não
previsto? O que faço quando a regra parece absurda no meu caso?
**Regra central antecipada.** Casos não previstos são decididos pelo princípio
mais específico aplicável; se não houver, pelo Livro I; e o caso **DEVE** virar
proposta de emenda.

### Capítulo 3 — Hierarquia normativa e resolução de conflitos
**Propósito.** Formalizar §0.8 com casos concretos de arbitragem: densidade vs.
respiro, automação vs. controle, velocidade vs. reversibilidade, poder vs.
simplicidade, consistência vs. otimização local.
**Responde.** Duas regras se chocam — qual vence? Quem decide? Como registro?

### Capítulo 4 — Emenda, versionamento e memória de decisões
**Propósito.** Processo formal de mudança da Constituição e preservação do
histórico de raciocínio.
**Responde.** Como mudo uma regra? Como registro uma exceção? Como sei por que
uma regra antiga existe? Como revogo sem perder a memória?

---

## LIVRO I — IDENTIDADE E FILOSOFIA

### Capítulo 5 — Definição canônica do FlowHub
**Propósito.** Definir o produto de forma permanente: um **sistema operacional
para operações comerciais**, que centraliza pessoas, comunicação, processos,
automações, inteligência e gestão em um ambiente único e coeso.
**Responde.** O que o FlowHub é em uma frase? O que ele não é? Por que ele não é
um CRM, uma ferramenta de atendimento, uma plataforma de automação, um chatbot
ou "uma ferramenta de WhatsApp"? Como explico o produto para alguém em 30
segundos sem citar concorrentes?
**Conteúdo obrigatório.** As não-definições e por que cada uma é recusada; o
conceito de ambiente único; a proibição de o usuário sentir que troca de módulo;
o teste de identidade ("isto pertence ao FlowHub?").
**Depende de.** Capítulos 1–4.

### Capítulo 6 — O problema central e a tese do produto
**Propósito.** Fixar a tese fundadora: **CRMs tradicionais exigem que o usuário
aprenda como o sistema funciona; o FlowHub aprende como o usuário trabalha.**
**Responde.** Que dor real existe? Por que as soluções atuais falham? O que
significa, concretamente, "o sistema aprende o usuário"? Como saber se uma
decisão caminha nessa direção ou contra ela?
**Conteúdo obrigatório.** O custo invisível do CRM tradicional (trabalho de
alimentar o sistema); a inversão FlowHub (o sistema alimenta a si mesmo a partir
do trabalho real); o **Teste da Direção** aplicável a qualquer feature.

### Capítulo 7 — Princípios Fundamentais (as leis invioláveis)
**Propósito.** Enunciar o núcleo filosófico do qual todo o restante deriva. É o
capítulo mais importante da Constituição.
**Responde.** Quais são as verdades que nunca mudam? Como uso um princípio para
decidir? O que fazer quando dois princípios colidem?
**Conteúdo obrigatório.** Cada princípio com: enunciado, fundamento, o que ele
obriga, o que ele proíbe, como se manifesta em uma tela, como se manifesta em
código, e o sinal de que ele foi violado.
**Núcleo previsto.** Complexidade pertence ao sistema, nunca ao usuário •
Antecipação com consentimento • Esforço mínimo por resultado • Nada surpreende,
tudo pode ser desfeito • Coerência acima de novidade • Silêncio como cortesia
(o sistema só interrompe quando importa) • Confiança se constrói com
previsibilidade • Poder progressivo (fácil no começo, profundo depois) •
Honestidade de estado (o sistema nunca finge) • Respeito ao tempo do usuário.

### Capítulo 8 — Filosofia da simplicidade
**Propósito.** Definir simplicidade como **ocultação de complexidade**, não como
ausência de capacidade — e transformar isso em regras aplicáveis.
**Responde.** Como adiciono poder sem adicionar complicação? Onde escondo
complexidade sem escondê-la do usuário que precisa dela? Quando revelar? Qual o
limite entre "simples" e "insuficiente"?
**Conteúdo obrigatório.** Camadas de revelação; padrão inteligente como forma de
simplicidade; o orçamento de decisões por tela; o teste do "poderia não estar
aqui?"; a diferença entre esconder e omitir; por que esconder mal feito destrói
confiança.

### Capítulo 9 — Identidade de marca e personalidade do sistema
**Propósito.** Definir a personalidade do FlowHub como entidade que age e fala —
antes de qualquer decisão visual ou verbal.
**Responde.** Se o FlowHub fosse uma pessoa, quem seria? Como ele reage a erro,
a sucesso, a espera, a fracasso do usuário? Ele faz piada? Ele se desculpa? Ele
comemora?
**Conteúdo obrigatório.** Traços de personalidade e seus opostos proibidos;
manifestação em visual, verbo, ritmo e comportamento; a regra da sobriedade
sob estresse (quanto pior o momento do usuário, mais discreto o sistema).

### Capítulo 10 — Promessas e contratos de confiança
**Propósito.** Enumerar as promessas implícitas que o produto faz e que **nunca**
podem ser quebradas.
**Responde.** O que o usuário tem direito de assumir sem verificar? O que o
sistema jamais faz pelas costas dele? O que acontece quando quebramos uma
promessa?
**Conteúdo obrigatório.** Promessa de preservação (nada digitado se perde);
promessa de reversibilidade; promessa de não-surpresa; promessa de veracidade
de estado; promessa de continuidade (o trabalho continua de onde parou);
promessa de isolamento (dados de uma conta nunca cruzam para outra).

### Capítulo 11 — Ética, privacidade e soberania do usuário
**Propósito.** Definir os limites éticos do produto, incluindo automação, IA,
dados pessoais e comunicação em massa.
**Responde.** O que o sistema pode decidir sozinho? O que exige consentimento?
Como tratamos dados de terceiros (os contatos do cliente)? Padrões escuros são
proibidos — quais exatamente? Como equilibrar eficiência de disparo com respeito
a quem recebe?
**Conteúdo obrigatório.** Proibição categórica de padrões escuros; consentimento
informado e revogável; direito ao silêncio do destinatário; minimização de
dados; transparência sobre o que a IA leu, gerou e enviou; conexão com LGPD e
com as políticas em `docs/legal/`.

### Capítulo 12 — Fronteiras: o que o FlowHub nunca será
**Propósito.** Proteger o produto do crescimento incoerente. Um produto se define
tanto pelo que recusa quanto pelo que faz.
**Responde.** Devemos construir isto? Como recuso um pedido sem parecer
arbitrário? Qual o teste de pertencimento?
**Conteúdo obrigatório.** Critérios objetivos de recusa; funcionalidades
tentadoras e proibidas; a diferença entre "não agora" e "nunca"; como registrar
uma recusa para que ela não volte a cada trimestre.

---

## LIVRO II — O SER HUMANO

### Capítulo 13 — Arquétipos operacionais
**Propósito.** Descrever quem usa o FlowHub por **papel operacional e carga
cognitiva**, não por demografia de marketing.
**Responde.** Para quem otimizamos primeiro? Quem é o usuário de maior volume?
Quem é o usuário de maior poder? Como uma decisão afeta cada arquétipo?
**Conteúdo obrigatório.** O operador de alto volume (atendimento contínuo, muitas
horas, teclado); o gestor (visão, decisão, mobilidade); o construtor (quem cria
flows e automações); o dono da conta (risco, custo, permissão); o visitante
ocasional. Para cada um: objetivo, ritmo, tolerância a erro, superfície
predominante, o que o irrita, o que o encanta.

### Capítulo 14 — Contexto real de uso
**Propósito.** Documentar as condições reais de operação, porque design feito
para o cenário ideal falha no cenário real.
**Responde.** Em que ambiente o produto é usado? Que interrupções existem? Qual
a qualidade de rede? Quantas abas concorrem? Quanto tempo o usuário tem?
**Conteúdo obrigatório.** Uso interrompido como norma, não exceção; jornadas de
8+ horas; múltiplos atendimentos simultâneos; conexão instável; telas pequenas;
ruído; pressa. Regras derivadas: retomada de contexto, preservação de rascunho,
tolerância a rede ruim, ausência de estados que exigem atenção contínua.

### Capítulo 15 — Psicologia cognitiva aplicada
**Propósito.** Fundamentar as regras de interface na forma como a atenção, a
memória de trabalho e a tomada de decisão funcionam.
**Responde.** Quantas opções são demais? Por que agrupar? Por que a ordem
importa? Por que um alerta a mais quebra a leitura de todos os outros? Quando o
usuário decide errado por culpa do design?
**Conteúdo obrigatório.** Carga intrínseca, extrínseca e germinativa; limite
prático da memória de trabalho e o que fazer com ele; reconhecimento em vez de
recordação; custo de troca de contexto; fadiga de decisão; efeito de posição;
ancoragem; o **orçamento cognitivo por tela** como instrumento normativo.

### Capítulo 16 — Comportamento, hábito e fluência
**Propósito.** Definir como o produto conduz o usuário de iniciante a fluente sem
puni-lo em nenhum dos estágios.
**Responde.** Como se forma um hábito no produto? Por que atalhos importam mesmo
que poucos usem? Como não travar o especialista para proteger o novato? Quando
remover um apoio que já não é necessário?
**Conteúdo obrigatório.** Curva de aprendizagem em três estágios (descoberta,
competência, fluência); repetição e previsibilidade motora; caminhos paralelos
(mouse, teclado, comando); ausência de "modo avançado" separado — a profundidade
vive no mesmo lugar da superfície.

### Capítulo 17 — Design emocional
**Propósito.** Definir o que o usuário deve **sentir**, e como isso se produz com
decisões concretas.
**Responde.** Como o produto transmite competência? Como se comemora sem ser
infantil? Como se acolhe um erro sem humilhar? O que fazer no pior momento do
usuário?
**Conteúdo obrigatório.** Estados afetivos-alvo (confiança calma, competência
percebida, alívio, orgulho discreto); emoções proibidas (culpa, ansiedade,
inferioridade, urgência artificial); relação entre estética e confiança;
celebração proporcional; a regra do momento difícil.

### Capítulo 18 — Confiança, controle e reversibilidade
**Propósito.** Regular a sensação de estar no controle — a variável que mais
determina se o usuário confia em um sistema que age sozinho.
**Responde.** Quando o sistema pode agir sem perguntar? Como o usuário desfaz?
O que precisa de confirmação? Como mostro o que o sistema fez em meu nome?
**Conteúdo obrigatório.** Escala de autonomia (informar, sugerir, agir com
desfazer, agir com confirmação, nunca agir); reversibilidade como padrão;
rastro de ações do sistema; previsibilidade como base de confiança; recuperação
de confiança após falha.

### Capítulo 19 — Ergonomia e economia de movimento
**Propósito.** Reduzir o custo físico do trabalho: distância percorrida, cliques,
trocas de dispositivo de entrada, alcance na tela.
**Responde.** Onde colocar a ação primária? Quantos cliques são aceitáveis? Como
medir o custo físico de um fluxo? Quando o teclado deve bastar?
**Conteúdo obrigatório.** Zonas de alcance por superfície; custo de troca
mouse↔teclado; agrupamento por sequência de uso real; alvos mínimos de toque;
proibição de ações destrutivas adjacentes a ações frequentes; medição de fluxo
por passos e por distância.

---

## LIVRO III — ESTRUTURA

### Capítulo 20 — Modelo mental canônico
**Propósito.** Descrever o modelo mental **único** que o FlowHub instala na
cabeça do usuário — e ao qual toda funcionalidade futura deve se encaixar.
**Responde.** Como o usuário pensa o sistema? Onde uma nova funcionalidade se
encaixa? Como sei que algo está "fora do modelo"?
**Conteúdo obrigatório.** O eixo Pessoa → Conversa → Processo → Resultado; a
noção de que tudo converge para o contato; a proibição de modelos concorrentes
dentro do mesmo produto; teste de encaixe de novas funcionalidades.

### Capítulo 21 — Ontologia do domínio
**Propósito.** Definir cada entidade do domínio, seu nome canônico, seu ciclo de
vida e suas relações — para que o vocabulário do produto, do código, do banco e
da interface seja o mesmo.
**Responde.** O que é um contato? Um negócio? Uma conversa? Um flow? Uma
automação? Um disparo? Uma conta? Qual a diferença entre coisas parecidas? Que
nome usar na interface?
**Conteúdo obrigatório.** Ficha de cada entidade (definição, atributos
essenciais, estados, transições, dono, escopo de conta); relações permitidas;
nomes proibidos e sinônimos banidos; regra de que nome de interface, nome de
código e nome de banco não podem divergir sem justificativa registrada.

### Capítulo 22 — Arquitetura da informação
**Propósito.** Regular como conteúdo, funções e dados se organizam em níveis,
grupos e prioridades.
**Responde.** Onde isto vai? Quantos níveis de profundidade são aceitáveis? Como
agrupo? Quando criar uma nova seção de topo? Como decido o que aparece primeiro?
**Conteúdo obrigatório.** Critérios de agrupamento (por tarefa, não por
tecnologia nem por estrutura de banco); limite de profundidade; regra de que
toda informação tem um lar único e canônico; hierarquia de prioridade por tela;
critérios para criar, fundir ou remover uma seção de navegação.

### Capítulo 23 — Padrões de navegação
**Propósito.** Definir como o usuário se move, sabe onde está e volta.
**Responde.** Quando uso página, painel lateral, modal ou navegação em pilha?
Como preservo contexto ao navegar? O que acontece com o botão voltar? Como
funciona a URL? Como retorno o usuário ao ponto exato de onde saiu?
**Conteúdo obrigatório.** Taxonomia de superfícies e a decisão objetiva entre
elas; regra de endereçabilidade (todo estado relevante tem endereço); regra de
retorno (toda saída tem volta previsível); proibição de modal sobre modal;
preservação de estado de lista, filtro, rolagem e rascunho.

### Capítulo 24 — Hierarquia visual e composição de tela
**Propósito.** Definir como uma tela se organiza antes de qualquer componente ser
escolhido.
**Responde.** O que o olho vê primeiro? Onde fica a ação primária? Quantas ações
primárias podem existir? Como uma tela cheia continua legível? Como componho uma
tela nova para que pareça FlowHub?
**Conteúdo obrigatório.** Regra da ação primária única por contexto; ordem de
leitura obrigatória (identidade → estado → conteúdo → ação); densidade e respiro;
alinhamento e ritmo; anatomia canônica de tela (cabeçalho, contexto, conteúdo,
ação); regra de que estrutura vem antes de estilo.

### Capítulo 25 — Jornada completa
**Propósito.** Mapear a experiência do primeiro contato até o uso maduro e a
eventual saída, definindo obrigações do produto em cada estágio.
**Responde.** Quais são os momentos que decidem retenção? Onde o usuário desiste?
O que o sistema deve fazer em cada estágio? O que é sucesso em cada fase?
**Conteúdo obrigatório.** Estágios (descoberta, ativação, primeiro valor,
rotina, expansão, maturidade, risco, saída); o conceito de **Primeiro Valor
Real** e sua obrigação de tempo; sinais de risco e resposta do produto; saída
digna (exportação, encerramento sem armadilha).

### Capítulo 26 — Onboarding
**Propósito.** Regular o processo de entrada como parte do produto, não como
camada externa.
**Responde.** O que ensinar e o que não ensinar? Tour é permitido? Quantos passos?
O que fazer com quem pula? Como o produto ensina sozinho, sem tutorial?
**Conteúdo obrigatório.** Proibição de ensinar antes de dar valor; onboarding
como configuração útil, não como apresentação; regra do "pulável sempre,
recuperável sempre"; aprendizado embutido no uso; onboarding por papel; onboarding
de quem entra numa conta já existente.

### Capítulo 27 — Primeira experiência e ciclo de vida da conta
**Propósito.** Definir os primeiros minutos e a evolução da conta ao longo do
tempo — de vazia a madura.
**Responde.** Como o sistema se comporta sem dado nenhum? Como se comporta com
volume alto? O que muda quando entram mais pessoas na conta? Como o produto
acompanha o crescimento sem virar outro produto?
**Conteúdo obrigatório.** Estado inaugural; dados de demonstração (permitidos ou
proibidos, e por quê); progressão de capacidade conforme maturidade; mudança de
densidade por volume; convite e chegada de novos membros.

---

## LIVRO IV — MATÉRIA (DESIGN SYSTEM)

### Capítulo 28 — Fundamentos do Design System
**Propósito.** Estabelecer o design system como aplicação obrigatória da
filosofia, com autoridade sobre implementações locais.
**Responde.** Quando posso criar algo novo? Quando devo reutilizar? Quem aprova
um componente novo? Como um padrão local vira sistema? Como um componente morre?
**Conteúdo obrigatório.** Regra da reutilização antes da criação; ciclo de vida
de componente (proposta, experimental, estável, depreciado, removido);
proibição de variantes locais não registradas; relação com `src/components/ui`.

### Capítulo 29 — Tokens: cor, tema e modo
**Propósito.** Regular todo uso de cor por meio de tokens semânticos, com o
sistema bidimensional **modo** (claro/escuro) × **acento** (identidade de cor).
**Responde.** Posso usar uma cor literal? O que cada token significa? Como
garanto que uma tela funcione nos dois modos e em todos os acentos? Como uso cor
para significado sem depender só dela?
**Conteúdo obrigatório.** Proibição de cor fora de token; significado semântico
fixo de cada token (fundo, superfície, primário, destrutivo, atenuado, borda);
regra da ortogonalidade modo × acento; cor nunca é o único portador de
significado; contraste mínimo obrigatório; cor de estado (sucesso, alerta, erro,
neutro) e seus limites.

### Capítulo 30 — Tipografia
**Propósito.** Definir a voz visual do texto e o sistema de escala.
**Responde.** Quantos tamanhos existem? Quando uso peso em vez de tamanho? Qual a
largura máxima de leitura? Como trato número, código, nome próprio e texto do
usuário? Como o texto se comporta quando é longo demais?
**Conteúdo obrigatório.** Escala fechada; hierarquia por peso e cor antes de
tamanho; altura de linha por função; truncamento e suas regras; texto do usuário
nunca é reescrito nem silenciosamente cortado sem acesso ao conteúdo completo.

### Capítulo 31 — Espaço, grid e ritmo
**Propósito.** Definir o espaço como elemento de significado, não como sobra.
**Responde.** Qual espaçamento usar entre o quê? Como o espaço comunica
agrupamento? Como manter ritmo em telas densas? Como não desperdiçar tela em
operação de alto volume?
**Conteúdo obrigatório.** Escala de espaçamento fechada; proximidade como
significado; densidade por tipo de tela (operacional vs. analítica vs. de
configuração); ritmo vertical; proibição de valores arbitrários.

### Capítulo 32 — Forma, elevação e profundidade
**Propósito.** Regular raio, borda, sombra e camadas como sistema de hierarquia
espacial.
**Responde.** O que fica acima do quê? Quando usar borda e quando usar sombra?
Quantas camadas existem? Como profundidade indica prioridade e não decoração?
**Conteúdo obrigatório.** Escala de raio derivada de token único; sistema de
camadas (base, superfície, flutuante, sobreposto, crítico); regra de que
elevação comunica relação, nunca estilo; consistência entre modos.

### Capítulo 33 — Iconografia e sinalização
**Propósito.** Regular ícones, indicadores, status e marcadores.
**Responde.** Quando um ícone pode estar sozinho? Ícone precisa de rótulo? Como
represento status? Como evito que dois ícones parecidos signifiquem coisas
diferentes?
**Conteúdo obrigatório.** Ícone como reforço, não substituto do texto (com
exceções fechadas e listadas); consistência semântica global (um ícone, um
significado, em todo o produto); status como sistema unificado; proibição de
ícone decorativo em área funcional densa.

### Capítulo 34 — Contratos de componente
**Propósito.** Definir o que todo componente do FlowHub deve garantir,
independentemente de qual seja.
**Responde.** O que um componente é obrigado a fazer? Como ele se comporta em
foco, erro, carregamento, desabilitado, vazio? Como ele responde ao teclado?
Como ele se comporta com conteúdo extremo?
**Conteúdo obrigatório.** Estados obrigatórios de todo componente; navegação por
teclado; comportamento sob conteúdo mínimo, típico e extremo; regra de que
componente não decide regra de negócio; API previsível e nomes consistentes.

### Capítulo 35 — Catálogo normativo de componentes
**Propósito.** Fixar quando usar cada família de componente e, sobretudo, quando
não usar.
**Responde.** Botão, link ou ação de menu? Modal, painel ou página? Tabela, lista
ou cartão? Aviso, notificação ou banner? Seleção simples ou múltipla?
**Conteúdo obrigatório.** Por família: propósito, quando usar, quando NUNCA usar,
alternativas, hierarquia de ação (primária, secundária, terciária, destrutiva),
erros comuns.

### Capítulo 36 — Dados, densidade e escala
**Propósito.** Regular a apresentação de grandes volumes: listas, tabelas,
filtros, ordenação, paginação, agregações.
**Responde.** Como mostro 10 mil registros? Onde ficam filtros? Como preservo
posição do usuário? Como escolho o que mostrar quando não cabe tudo? Como evito
que a tabela vire planilha ilegível?
**Conteúdo obrigatório.** Prioridade de coluna; ancoragem visual; filtro
persistente e visível; ordenação previsível; carregamento incremental sem perda
de posição; totalizadores honestos (nunca aproximar sem dizer).

### Capítulo 37 — Responsividade e adaptação de contexto
**Propósito.** Definir adaptação por **contexto de uso**, não apenas por largura
de tela.
**Responde.** O que muda no celular? O que nunca pode sumir? É legítimo remover
funcionalidade em tela pequena? Como priorizo quando o espaço acaba?
**Conteúdo obrigatório.** Princípio da paridade de capacidade (a mesma tarefa é
possível em qualquer superfície, ainda que por caminho diferente); ordem de
degradação (o que se compacta, o que se agrupa, o que se esconde, o que nunca
sai); toque vs. ponteiro; alcance físico; regra da ação primária sempre
alcançável.

### Capítulo 38 — Acessibilidade
**Propósito.** Garantir que o produto seja operável por todas as pessoas — regra
que não cede a nenhuma estética.
**Responde.** Qual o mínimo obrigatório? Como testo? O que é bloqueio de entrega?
Como trato movimento, contraste, foco, leitor de tela e teclado?
**Conteúdo obrigatório.** Contraste mínimo; foco sempre visível e nunca
suprimido; navegação completa por teclado; ordem de foco previsível; rótulos
programáticos; respeito à preferência de movimento reduzido; alvos mínimos;
nenhuma informação transmitida só por cor, só por som ou só por posição;
acessibilidade como critério de bloqueio, jamais como melhoria futura.

### Capítulo 39 — Movimento e animação
**Propósito.** Definir animação como comunicação de causa, continuidade e
hierarquia — nunca como enfeite.
**Responde.** Quando animar? Por quanto tempo? O que nunca pode ser animado? Como
animação ajuda a entender o que aconteceu? Como não atrasar quem tem pressa?
**Conteúdo obrigatório.** Faixas de duração por finalidade; regra da origem (o
que aparece, aparece de onde faz sentido); animação nunca bloqueia entrada;
cancelamento por nova ação; proibição de animação decorativa em fluxo repetitivo;
movimento reduzido como caminho equivalente, não degradado.

### Capítulo 40 — Notificação, som e canais periféricos
**Propósito.** Regular como o sistema chama atenção fora do foco atual.
**Responde.** O que merece interromper? O que espera? Como acumular sem virar
ruído? Som é permitido? Como notificar sem gerar ansiedade?
**Conteúdo obrigatório.** Escala de urgência (silencioso, periférico, ambiente,
interruptivo, bloqueante) com critérios objetivos; agrupamento; regra do
"interromper é dívida" — toda interrupção precisa justificar seu custo; controle
do usuário sobre canais; proibição de urgência artificial.

---

## LIVRO V — COMPORTAMENTO DO SISTEMA

### Capítulo 41 — Sistema de estados
**Propósito.** Definir o conjunto fechado de estados que qualquer tela,
componente ou operação pode assumir, e a obrigação de tratá-los todos.
**Responde.** Quais estados existem? É obrigatório desenhar todos? Como trato
sucesso parcial? Como represento algo que está acontecendo em segundo plano?
**Conteúdo obrigatório.** Catálogo fechado (inicial, carregando, vazio, parcial,
conteúdo, atualizando, erro, sem permissão, degradado, offline); obrigação de
projetar todos antes de considerar a tela pronta; transições entre estados sem
salto visual; proibição de estado indefinido.

### Capítulo 42 — Estados vazios
**Propósito.** Transformar ausência de dado em oportunidade de orientação.
**Responde.** O que mostrar quando não há nada? Como diferencio "nunca teve" de
"filtro não achou" de "foi tudo concluído"? O que ofereço ali?
**Conteúdo obrigatório.** Tipos de vazio e tratamento distinto obrigatório para
cada; estrutura do vazio (o que é isto, por que está vazio, o que fazer agora);
proibição de vazio decorativo sem caminho de ação; vazio como parte do ensino do
produto.

### Capítulo 43 — Sistema de feedback
**Propósito.** Garantir que toda ação tenha resposta perceptível, proporcional e
honesta.
**Responde.** Todo clique responde? Em quanto tempo? Onde a resposta aparece?
Quando uso resposta discreta e quando uso confirmação explícita? Como confirmo
algo que ainda vai terminar depois?
**Conteúdo obrigatório.** Regra da resposta imediata (percepção de causa em
janela fixa); proximidade da resposta ao ponto da ação; proporcionalidade;
feedback otimista e suas condições estritas de uso; proibição de silêncio após
ação.

### Capítulo 44 — Erros: prevenção, tratamento e recuperação
**Propósito.** Tratar erro como falha do sistema em prevenir, e não como falha do
usuário.
**Responde.** Como impeço o erro antes dele acontecer? Como escrevo uma mensagem
de erro? Onde ela aparece? Quando valido? O que faço com o trabalho do usuário
quando algo falha? O que nunca digo?
**Conteúdo obrigatório.** Prevenção acima de mensagem; anatomia obrigatória da
mensagem (o que houve, por que, o que fazer agora, como sair); validação no
momento certo; preservação absoluta do que foi digitado; proibição de culpar o
usuário, de expor detalhe interno e de erro sem saída; erro parcial em operação
em lote; erro de permissão vs. erro de sistema.

### Capítulo 45 — Confirmações, ações destrutivas e desfazer
**Propósito.** Regular o momento em que o sistema pergunta "tem certeza?" — e,
principalmente, quando ele não deve perguntar.
**Responde.** O que exige confirmação? O que exige desfazer em vez de
confirmação? Como escrevo uma confirmação? Quando exijo digitar o nome? Por
quanto tempo o desfazer fica disponível?
**Conteúdo obrigatório.** Matriz reversibilidade × impacto × alcance;
preferência estrutural por desfazer sobre confirmar; confirmação que descreve
consequência real, nunca genérica; proibição de confirmação em ação reversível
frequente (ela treina o usuário a ignorar avisos); tratamento de ação que afeta
terceiros (envio a destinatários) como categoria própria e irreversível.

### Capítulo 46 — Desempenho percebido
**Propósito.** Regular a percepção de tempo, que importa mais que o tempo
absoluto.
**Responde.** O que fazer enquanto carrega? Quando mostro esqueleto, quando
mostro progresso, quando não mostro nada? Como evito salto de layout? Como faço
o sistema parecer instantâneo sem mentir?
**Conteúdo obrigatório.** Faixas de tempo e resposta obrigatória em cada uma;
esqueleto que reproduz a forma final; reserva de espaço para evitar deslocamento;
antecipação de dado provável; progresso honesto (nunca barra falsa); trabalho em
segundo plano visível sem prender o usuário.

### Capítulo 47 — Sistema de busca
**Propósito.** Definir a busca como caminho universal de acesso, não como recurso
de listagem.
**Responde.** Onde a busca vive? O que ela alcança? Como ordena resultados? Como
lida com erro de digitação e com termos parciais? O que faz quando não acha
nada? Ela busca ações, além de dados?
**Conteúdo obrigatório.** Busca alcança entidades **e** ações; resposta
incremental; ordenação explicável; escopo sempre visível; resultado vazio com
caminho; busca respeita permissão e tenancy sem revelar existência de dado alheio.

### Capítulo 48 — Sistema de comandos e teclado
**Propósito.** Garantir o caminho de fluência: operar o produto sem tirar as mãos
do teclado.
**Responde.** O que precisa de atalho? Como escolho a tecla? Como o usuário
descobre? Como evito conflito com o navegador e com leitores de tela? Comandos
podem executar ações destrutivas?
**Conteúdo obrigatório.** Paleta de comandos como acesso universal; princípio da
descoberta passiva (atalhos se ensinam onde a ação vive); consistência global de
teclas; reserva de teclas; proibição de ação destrutiva sem confirmação por
atalho; equivalência funcional entre teclado e ponteiro.

### Capítulo 49 — Produtividade, lote e repetição
**Propósito.** Otimizar o trabalho repetitivo de alto volume, que é o coração da
operação comercial.
**Responde.** Quando ofereço ação em lote? Como mostro o que será afetado? Como
trato sucesso parcial? Como reduzo trabalho repetido? Quando o sistema deve
oferecer transformar repetição em automação?
**Conteúdo obrigatório.** Seleção previsível e persistente; declaração explícita
do alcance antes de agir; relatório de resultado por item; desfazer em lote;
detecção de repetição e oferta de automação (com consentimento, conforme
Capítulo 18).

### Capítulo 50 — Tempo real, presença e colaboração
**Propósito.** Regular o comportamento quando várias pessoas trabalham sobre os
mesmos dados ao mesmo tempo.
**Responde.** O que atualiza sozinho e o que espera? Como evito que a lista pule
sob o cursor? Como mostro que outra pessoa está no mesmo item? Como resolvo
conflito de edição? Como atribuo responsabilidade?
**Conteúdo obrigatório.** Regra da não-interferência (atualização nunca move o
que o usuário está manipulando); presença como informação, não vigilância;
resolução de conflito com preservação de trabalho; atribuição visível; limites
éticos do monitoramento de equipe.

### Capítulo 51 — Permissões, papéis e limites visíveis
**Propósito.** Definir como poder, papel, plano e limite aparecem na interface
sem gerar frustração ou vazamento de informação.
**Responde.** Escondo ou desabilito o que o usuário não pode fazer? Como explico
uma recusa? Como mostro limite de plano ou de consumo sem chantagem? Como o
usuário pede acesso?
**Conteúdo obrigatório.** Regra da explicação (recusa sempre diz o motivo e o
caminho); esconder vs. desabilitar com critério objetivo; nunca revelar dado de
outra conta nem por mensagem de erro; limites comunicados antes de serem
atingidos; caminho de solicitação de permissão sem sair do fluxo.

---

## LIVRO VI — INTELIGÊNCIA

### Capítulo 52 — Princípios de IA aplicada à experiência
**Propósito.** Definir o papel da inteligência artificial dentro do FlowHub —
como copiloto do trabalho real, nunca como enfeite tecnológico.
**Responde.** O que a IA pode fazer sozinha? O que sempre precisa de revisão
humana? Como mostro confiança e incerteza? O que faço quando a IA erra? Como
evito que a IA vire um chat isolado dentro do produto?
**Conteúdo obrigatório.** IA integrada ao fluxo, não em uma sala separada;
escala de autonomia herdada do Capítulo 18; obrigação de tornar visível o que a
IA usou como contexto; revisão humana obrigatória antes de qualquer comunicação
externa; a IA nunca inventa dado do cliente; degradação segura quando o modelo
falha; custo e consumo transparentes.

### Capítulo 53 — Padrões de interação com IA
**Propósito.** Padronizar como a inteligência aparece, sugere, executa e é
corrigida.
**Responde.** Como apresento uma sugestão? Como o usuário aceita, edita ou
recusa? Como aprendo com a recusa? Como diferencio texto gerado de texto humano?
Como espero por uma resposta lenta sem travar o trabalho?
**Conteúdo obrigatório.** Anatomia da sugestão (o que é, de onde veio, o que
acontece se eu aceitar); aceitação sempre editável; recusa como sinal de
aprendizado; marcação de conteúdo gerado; espera não bloqueante; limite de
frequência de sugestão para não virar ruído.

### Capítulo 54 — Automações e flows
**Propósito.** Definir a construção, a operação e a observabilidade de processos
automatizados — a funcionalidade de maior poder e maior risco do produto.
**Responde.** Como alguém constrói uma automação sem ser programador? Como
entende o que ela fará antes de ativar? Como vê o que aconteceu? Como conserta
quando falha? Como evito que uma automação cause dano em massa?
**Conteúdo obrigatório.** Legibilidade do fluxo (ler antes de executar);
simulação e pré-visualização; ativação consciente; histórico de execução
compreensível para não-técnicos; falha visível e recuperável; limites de
segurança contra efeito em massa; versão e alteração de automação em produção;
a automação nunca age fora do escopo da conta.

### Capítulo 55 — Personalização e adaptação
**Propósito.** Regular como o sistema aprende o usuário — cumprindo a tese do
Capítulo 6 sem violar a previsibilidade do Capítulo 18.
**Responde.** O que o sistema pode mudar sozinho? O que nunca muda de lugar? Como
o usuário percebe que algo mudou? Como ele desfaz uma adaptação? Como equilibro
"aprender o usuário" com "não surpreender o usuário"?
**Conteúdo obrigatório.** Camadas adaptáveis vs. camadas fixas (estrutura e
navegação nunca se reorganizam sozinhas); adaptação por prioridade e sugestão,
não por remoção; transparência da adaptação; reversibilidade; adaptação por
papel, por conta e por pessoa, com regras distintas.

### Capítulo 56 — Dados, métricas e insights ao usuário
**Propósito.** Regular como o produto apresenta números para que gerem decisão,
não interpretação errada.
**Responde.** Que número mostro primeiro? Como dou contexto a um número? Como
represento comparação, tendência e ausência de dado? Como evito métrica de
vaidade? Como não induzo conclusão falsa?
**Conteúdo obrigatório.** Número sempre acompanhado de referência temporal e de
comparação; honestidade estatística (amostra pequena declarada, dado incompleto
declarado); proibição de gráfico que distorce; insight sempre acionável; nunca
apresentar métrica que o usuário não pode influenciar como se fosse desempenho
dele.

---

## LIVRO VII — LINGUAGEM

### Capítulo 57 — Voz, tom e personalidade verbal
**Propósito.** Definir como o FlowHub fala em qualquer situação.
**Responde.** Trato o usuário por você? Uso imperativo? Como falo em erro, em
sucesso, em espera, em cobrança, em recusa? Uso humor? Uso emoji? Uso exclamação?
**Conteúdo obrigatório.** Traços de voz e opostos proibidos; tom variável por
situação com voz constante; regra da sobriedade proporcional à gravidade;
proibição de linguagem publicitária dentro do produto; escrita na perspectiva do
usuário, não do sistema.

### Capítulo 58 — Microcopy: regras de escrita de interface
**Propósito.** Transformar escrita de interface em disciplina objetiva.
**Responde.** Como nomeio um botão? Quantas palavras? Uso ponto final? Como
escrevo um rótulo, uma dica, um placeholder, um título de modal, um estado
vazio? Como escrevo números, datas e valores?
**Conteúdo obrigatório.** Botão descreve o resultado, não o mecanismo; economia
de palavras sem perda de clareza; proibição de jargão técnico e de tradução
literal; placeholder nunca substitui rótulo; padrões fixos de data, hora, moeda,
telefone, quantidade e nome próprio; capitalização e pontuação normatizadas.

### Capítulo 59 — Nomenclatura e vocabulário canônico
**Propósito.** Garantir que cada conceito tenha **um** nome, em toda a interface,
em todo o código, para sempre.
**Responde.** Como nomeio algo novo? Como resolvo dois nomes para a mesma coisa?
Como renomeio sem quebrar o modelo mental do usuário? Nome de interface pode
diferir do nome de código?
**Conteúdo obrigatório.** Dicionário controlado; termos proibidos; processo de
introdução de termo novo; processo de renomeação com transição; alinhamento
obrigatório entre interface, código, banco e documentação.

### Capítulo 60 — Internacionalização e localização
**Propósito.** Regular a existência do produto em mais de um idioma sem perder
identidade nem estrutura.
**Responde.** Todo texto precisa de chave? Como estruturo chaves? Como lido com
plural, gênero, variável e expansão de texto? O que nunca se traduz? Como trato
formato regional?
**Conteúdo obrigatório.** Proibição de texto fixo em componente; estrutura
hierárquica de chaves por domínio; tolerância de layout à expansão de texto;
tratamento de nomes próprios do produto; formatos regionais; pt-BR como idioma
canônico e origem da verdade.

---

## LIVRO VIII — GOVERNANÇA

### Capítulo 61 — Heurísticas do FlowHub
**Propósito.** Fornecer o conjunto de testes rápidos usados para avaliar qualquer
tela ou fluxo em minutos.
**Responde.** Como avalio algo rapidamente? Que perguntas sempre faço? Como
transformo uma impressão ruim em diagnóstico objetivo?
**Conteúdo obrigatório.** Heurísticas próprias do produto, cada uma com pergunta,
sinal de violação, gravidade e artigo constitucional correspondente.

### Capítulo 62 — Critérios de qualidade e definição de pronto
**Propósito.** Definir objetivamente quando algo pode ser lançado.
**Responde.** O que é "pronto"? O que bloqueia? O que é aceitável adiar? Quem
declara pronto? Como registro o que foi adiado?
**Conteúdo obrigatório.** Níveis de qualidade e o mínimo inegociável; lista de
bloqueios absolutos (acessibilidade, perda de dado, estado não tratado, ação
destrutiva sem saída, texto sem tradução, quebra de tenancy); débito registrado
com prazo.

### Capítulo 63 — Checklists de validação
**Propósito.** Operacionalizar a Constituição em listas usáveis no dia a dia.
**Responde.** O que verifico antes de começar? Durante? Antes de entregar? Como
reviso o trabalho de outra pessoa ou de um agente?
**Conteúdo obrigatório.** Checklist de nova funcionalidade; de nova tela; de novo
componente; de fluxo de IA; de automação; de acessibilidade; de linguagem; de
desempenho percebido; de revisão por agente autônomo.

### Capítulo 64 — Métricas de experiência
**Propósito.** Definir como se mede se a Constituição está sendo cumprida na
prática.
**Responde.** O que medir? Como sei que a experiência piorou? Que métrica é
enganosa? Como ligo métrica a princípio?
**Conteúdo obrigatório.** Métricas de esforço, de tempo até valor, de erro
evitado, de retomada, de adoção de caminho fluente, de confiança; anti-métricas
proibidas (engajamento por tempo de tela, cliques por sessão); ligação explícita
entre cada métrica e o princípio que ela protege.

### Capítulo 65 — Governança da experiência
**Propósito.** Definir quem decide o quê, e como decisões são registradas.
**Responde.** Quem aprova um desvio? Como escalono uma discordância? Como uma
decisão vira regra? Como impeço que decisões se percam?
**Conteúdo obrigatório.** Papéis e alçadas; rito de decisão; registro obrigatório;
regra de que ausência de dono não autoriza improviso.

### Capítulo 66 — Dívida de experiência e depreciação
**Propósito.** Tratar as partes do produto que contradizem a Constituição.
**Responde.** O que faço quando encontro algo fora do padrão? Corrijo agora?
Registro? Como deprecio um padrão antigo sem quebrar o hábito do usuário?
**Conteúdo obrigatório.** Classificação da dívida por gravidade; regra do
escoteiro com limite de escopo; proibição de propagar padrão errado por
consistência local; ciclo de depreciação e comunicação de mudança ao usuário.

### Capítulo 67 — Evolução contínua e pesquisa
**Propósito.** Definir como o produto aprende com o mundo real sem perder
identidade.
**Responde.** Como decido o que construir? Como uso feedback sem ser refém dele?
Como testo sem prejudicar usuário? Quando um pedido do cliente deve ser
recusado?
**Conteúdo obrigatório.** Fontes de evidência e seus pesos; regra de que
frequência de pedido não é justificativa suficiente; experimentação com limites
éticos; a Constituição como filtro obrigatório de qualquer ideia.

### Capítulo 68 — Como agentes de IA devem usar esta Constituição
**Propósito.** Instruir explicitamente sistemas autônomos que criarão, alterarão
e revisarão o FlowHub.
**Responde.** O que um agente deve ler antes de codar? Como cita regras? O que
ele nunca decide sozinho? Como sinaliza conflito com a Constituição? Como propõe
emenda?
**Conteúdo obrigatório.** Protocolo obrigatório de leitura por tipo de tarefa;
obrigação de citar artigos nas justificativas; proibição de inventar padrão novo
quando existe um constitucional; obrigação de parar e sinalizar quando o pedido
do usuário viola um **DEVE** ou **NUNCA**; relação hierárquica com `AGENTS.md`
(a Constituição rege o "o quê e por quê"; `AGENTS.md` rege o "como implementar").

---

## ANEXOS

### Anexo A — Glossário canônico
Todo termo do produto e do documento, com definição única, sinônimos proibidos e
capítulo de origem.

### Anexo B — Índice remissivo de artigos
Lista completa de `FH-XX.NN` com enunciado resumido, para consulta rápida e
citação em revisões.

### Anexo C — Matriz de decisão rápida
Tabelas de decisão objetivas para as escolhas mais frequentes: superfície,
confirmação vs. desfazer, esconder vs. desabilitar, nível de autonomia da IA,
tipo de feedback, tipo de estado vazio, urgência de notificação.

### Anexo D — Modelos de documento
Modelo de RFC de experiência, de revisão de funcionalidade, de proposta de
componente, de proposta de emenda constitucional.

### Anexo E — Registro de decisões e exceções
Histórico permanente: o que foi decidido, quando, por quê, por quanto tempo, e o
que foi aprendido depois.

### Anexo F — Mapa de conformidade
Estado atual do produto frente à Constituição: onde cumpre, onde não cumpre, e a
dívida registrada correspondente.

---

# PLANO DE EXPANSÃO

A expansão respeita a dependência entre capítulos: nenhum capítulo é escrito
antes daqueles dos quais deriva, porque isso produziria contradição.

| Onda | Capítulos | Por que nesta ordem |
| --- | --- | --- |
| 1 | 1–4 | A lei precisa existir antes do conteúdo. |
| 2 | 5–12 | Identidade e princípios: tudo depois deriva daqui. |
| **2.5** | **68 + Anexo C** | **Antecipação deliberada — ver nota abaixo.** |
| 3 | 13–19 | O ser humano define o que é "melhor" para todo o resto. |
| 4 | 20–27 | Estrutura mental antes de estrutura visual. |
| 5 | 41–51 | Comportamento antes de matéria: forma segue comportamento. |
| 6 | 28–40 | Design system como consequência, nunca como origem. |
| 7 | 52–56 | Inteligência sobre uma base já definida de autonomia e confiança. |
| 8 | 57–60 | Linguagem consolida vocabulário criado nas ondas anteriores. |
| 9 | 61–67 | Governança pressupõe todo o corpo normativo pronto. |
| 10 | Anexos A, D, E, F | Instrumentos derivados do texto completo. |

**Nota sobre a Onda 2.5.** O Capítulo 68 (protocolo de uso por agentes de IA) e o
Anexo C (matrizes de decisão) pertencem logicamente ao final da Constituição, mas
são **antecipados** para logo após a Onda 2. A razão é operacional: a partir da
Onda 3 o próprio documento passa a ser majoritariamente escrito e aplicado por
agentes, e um protocolo de uso escrito no fim chegaria depois de já ter sido
necessário dezenas de vezes. O Capítulo 68 é revisado ao final da Onda 9 para
incorporar o corpo completo — sua antecipação é de vigência, não de versão final.

O Anexo B, por ser artefato vivo (§0.14), não tem onda: ele cresce a cada
capítulo, desde o primeiro.

---

## Estado de expansão

| Capítulos | Estado | Artigos |
| --- | --- | --- |
| Volume 0 | ✅ Completo (v1.1.0) | — |
| 1 — Natureza, autoridade e alcance | ✅ Completo | `FH-01.01`–`FH-01.10` |
| 2 — Como ler, aplicar e interpretar | ✅ Completo | `FH-02.01`–`FH-02.11` |
| 3 — Hierarquia e conflitos | ✅ Completo | `FH-03.01`–`FH-03.11` |
| 4 — Emenda e memória | ✅ Completo | `FH-04.01`–`FH-04.12` |
| 5 — Definição canônica | ✅ Completo | `FH-05.01`–`FH-05.11` |
| 6 — Problema central e tese | ✅ Completo | `FH-06.01`–`FH-06.11` |
| 7 — Princípios Fundamentais | ✅ Completo | `FH-07.01`–`FH-07.12` |
| 8 — Filosofia da simplicidade | ✅ Completo | `FH-08.01`–`FH-08.11` |
| 9 — Identidade e personalidade | ✅ Completo | `FH-09.01`–`FH-09.10` |
| 10 — Promessas e confiança | ✅ Completo | `FH-10.01`–`FH-10.10` |
| 11 — Ética e soberania | ✅ Completo | `FH-11.01`–`FH-11.12` |
| 12 — Fronteiras do produto | ✅ Completo | `FH-12.01`–`FH-12.10` |
| 68 — Protocolo para agentes de IA | ✅ Completo (antecipado, Onda 2.5) | `FH-68.01`–`FH-68.15` |
| 13 — Arquétipos operacionais | ✅ Completo | `FH-13.01`–`FH-13.10` |
| 14 — Contexto real de uso | ✅ Completo | `FH-14.01`–`FH-14.11` |
| 15 — Psicologia cognitiva | ✅ Completo | `FH-15.01`–`FH-15.11` |
| 16 — Hábito e fluência | ✅ Completo | `FH-16.01`–`FH-16.10` |
| 17 — Design emocional | ✅ Completo | `FH-17.01`–`FH-17.10` |
| 18 — Confiança e controle | ✅ Completo | `FH-18.01`–`FH-18.11` |
| 19 — Ergonomia e movimento | ✅ Completo | `FH-19.01`–`FH-19.10` |
| 20 — Modelo mental canônico | ✅ Completo | `FH-20.01`–`FH-20.10` |
| 21 — Ontologia do domínio | ✅ Completo | `FH-21.01`–`FH-21.11` |
| 22 — Arquitetura da informação | ✅ Completo | `FH-22.01`–`FH-22.11` |
| 23 — Padrões de navegação | ✅ Completo | `FH-23.01`–`FH-23.11` |
| 24 — Composição de tela | ✅ Completo | `FH-24.01`–`FH-24.10` |
| 25 — Jornada completa | ✅ Completo | `FH-25.01`–`FH-25.10` |
| 26 — Onboarding | ✅ Completo | `FH-26.01`–`FH-26.10` |
| 27 — Ciclo de vida da conta | ✅ Completo | `FH-27.01`–`FH-27.10` |
| 28–67 | ⬜ Não iniciado | — |
| Anexo B — Índice de artigos | ♻️ Vivo — 301 artigos indexados | — |
| Anexo C — Matrizes de decisão | ♻️ Vivo — 16 matrizes ativas, 5 pendentes | — |
| Anexo E — Registro de decisões | ♻️ Vivo — estrutura pronta, sem entradas | — |
| Anexos A, D, F | ⬜ Não iniciado | — |

**Total de artigos vigentes:** 301. **Livros 0, I, II e III completos; Capítulo 68
vigente.**

**Regra de consistência entre capítulos.** Ao escrever qualquer capítulo, é
obrigatório: (a) reutilizar termos já definidos, sem criar sinônimos; (b) citar
artigos anteriores em vez de reescrever regras; (c) registrar em "Referências
cruzadas" toda dependência criada; (d) se um capítulo novo exigir alterar um
capítulo anterior, a alteração é feita no mesmo ciclo, nunca adiada — a
Constituição nunca contém duas verdades ao mesmo tempo.

---

*Volume 0 — versão 1.1.0. Alterações neste volume exigem emenda MAIOR, porque
mudam a estrutura da própria Constituição.*

**Histórico de emendas do Volume 0**

| Versão | Mudança | Motivo |
| --- | --- | --- |
| 1.0.0 | Criação da arquitetura: 8 livros, 68 capítulos, 6 anexos. | Definir a estrutura antes do conteúdo. |
| 1.1.0 | Núcleo Normativo obrigatório (§0.7.0); verificação binária obrigatória e volume mínimo de artigos (§0.10); regra de fallback e regra de parada (§0.11); camada de Aterrissagem (§0.12); precedência entre documentos do repositório (§0.13); artefatos vivos (§0.14); antecipação da Onda 2.5. | O Volume 0 original definia como escrever a Constituição, mas não a tornava executável por quem tem contexto limitado. As adições fecham a distância entre "documento correto" e "documento aplicável sem supervisão". |
