# Capítulo 38 — Acessibilidade

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 3 (`FH-03.02`), 29, 30, 33, 34, 37, 48 |
| É pré-requisito de | Capítulos 39, 62, 63 |
| Artigos | `FH-38.01` a `FH-38.11` |

> Acessibilidade é **cláusula pétrea** (`FH-04.12`) e vence qualquer regra de
> experiência (`FH-03.02(b)`). Nenhum artigo deste capítulo cede a prazo, estética
> ou prioridade comercial.

---

## 0. Núcleo Normativo

**`FH-38.01`** — Acessibilidade é **critério de bloqueio de entrega**, nunca
melhoria futura. Violação impede o envio (`FH-62`).
> **Verificação:** existe violação de acessibilidade nesta entrega? → NÃO = cumpre | SIM = bloqueia.

**`FH-38.02`** — O indicador de foco é **sempre visível** e **NUNCA** é suprimido,
em nenhum elemento interativo (`FH-34.08`).
> **Verificação:** o foco é visível em todos os elementos interativos? → SIM = cumpre | NÃO = viola.

**`FH-38.03`** — Toda funcionalidade é **operável integralmente por teclado**, sem
armadilhas de foco e sem exigir ponteiro (`FH-48.02`).
> **Verificação:** é possível concluir toda tarefa só com teclado, sem ficar preso? → SIM = cumpre | NÃO = viola.

**`FH-38.04`** — O contraste mínimo é satisfeito em **todos os modos e acentos**,
para texto, ícones funcionais, bordas de campo e indicadores de estado
(`FH-29.05`).
> **Verificação:** o contraste foi verificado em todas as combinações e elementos? → SIM = cumpre | NÃO = viola.

**`FH-38.05`** — Todo elemento interativo tem **nome acessível** que descreve sua
função, coerente com o rótulo visível quando houver (`FH-34.07`).
> **Verificação:** todo elemento interativo tem nome acessível coerente? → SIM = cumpre | NÃO = viola.

**`FH-38.06`** — A estrutura da página é **semântica**: hierarquia de títulos,
regiões, listas e agrupamentos refletem a organização real do conteúdo.
> **Verificação:** a estrutura semântica reflete a hierarquia visual? → SIM = cumpre | NÃO = viola.

**`FH-38.07`** — A preferência por **movimento reduzido** é respeitada, com caminho
**equivalente**, nunca degradado (`FH-39.06`).
> **Verificação:** com movimento reduzido, a experiência permanece equivalente? → SIM = cumpre | NÃO = viola.

**`FH-38.08`** — Todo alvo interativo respeita a **dimensão mínima utilizável** da
superfície (`FH-19.04`, `FH-31.08`).
> **Verificação:** todos os alvos atingem o mínimo? → SIM = cumpre | NÃO = viola.

**`FH-38.09`** — Nenhuma informação depende **exclusivamente** de cor, som, posição,
forma ou movimento (`FH-29.04`, `FH-33.08`).
> **Verificação:** removendo cada canal isoladamente, a informação sobrevive? → SIM = cumpre | NÃO = viola.

**`FH-38.10`** — Mudanças dinâmicas relevantes — resultado de ação, erro, chegada de
conteúdo — **DEVEM** ser anunciadas a tecnologias assistivas, sem roubar o foco do
usuário.
> **Verificação:** mudanças relevantes são anunciadas sem mover o foco? → SIM = cumpre | NÃO = viola.

**`FH-38.11`** — Toda entrega **DEVE** ser verificada **só com teclado** e **com
leitor de tela** antes de ser considerada pronta.
> **Verificação:** as duas verificações foram realizadas? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo garante que o produto seja **operável por todas as pessoas**. Ele não
descreve um conjunto de melhorias: descreve o mínimo abaixo do qual o produto não
é entregável.

---

## 2. Perguntas que este capítulo responde

- Qual o mínimo obrigatório?
- Como testo?
- O que bloqueia entrega?
- Como trato movimento, contraste, foco e leitor de tela?
- Acessibilidade pode ser adiada?

---

## 3. Definições

**Nome acessível** — texto que identifica a função de um elemento para tecnologia
assistiva.

**Armadilha de foco** — situação em que o foco entra em uma região e não consegue
sair pelo teclado.

**Movimento reduzido** — preferência do sistema por menos animação.

**Anúncio** — comunicação de mudança dinâmica a tecnologias assistivas.

**Caminho equivalente** — alternativa que entrega o mesmo resultado com o mesmo
esforço.

---

## 4. Fundamento

**Por que acessibilidade bloqueia entrega.** A violação de acessibilidade não produz
uma experiência pior: produz **ausência** de experiência. A perda é binária, não
gradual — a pessoa consegue usar ou não consegue. Valores binários não podem ser
negociados contra melhorias graduais, e é por isso que `FH-03.02(b)` a colocou
entre os desempates transversais e `FH-04.12` a tornou pétrea.

**Por que foco visível é o artigo mais violado.** O indicador de foco é
frequentemente removido por parecer "sujo" em telas limpas. A remoção não afeta
quem usa ponteiro — e torna o produto inoperável para quem navega por teclado, que
inclui pessoas com deficiência motora, usuários de leitor de tela e o Operador
fluente do Capítulo 16. Uma decisão estética que exclui três grupos.

**Por que operação por teclado é a base.** Ela sustenta simultaneamente
acessibilidade e fluência (`FH-48.02`) — mesma implementação, duas exigências. Isso
também significa que o argumento "poucos usam teclado" é factualmente errado: é o
único caminho para uma parte dos usuários.

**Por que redundância de canal.** Cor, som, posição e movimento falham para
públicos diferentes e em condições diferentes. A regra de `FH-38.09` é
operacional: remova cada canal isoladamente e verifique se a informação sobrevive.
Se não sobrevive, ela dependia de um canal que nem todos percebem.

**Por que movimento reduzido exige equivalência.** Tratar a preferência como
"desligar animações" costuma produzir transições abruptas que perdem a relação de
causa (`FH-39.02`) — a pessoa recebe uma experiência pior, não uma diferente. O
caminho equivalente preserva a comunicação com outros meios.

**Por que anunciar sem roubar foco.** Mudanças não anunciadas são invisíveis para
quem usa leitor de tela — o resultado da ação simplesmente não existe. Mover o foco
para anunciar resolve isso e cria outro problema: interrompe o que a pessoa estava
fazendo, exatamente como uma interrupção visual não solicitada (`FH-15.09`).

---

## 5. Princípios

**Perda de acessibilidade é binária, não gradual.**

**Foco visível não é detalhe estético; é a única pista de onde se está.**

**Todo canal falha para alguém — redundância é a regra.**

**Alternativa equivalente, nunca versão pior.**

---

## 6. Regras normativas

### Verificações obrigatórias antes da entrega (`FH-38.11`)

| # | Verificação | O que observar |
| --- | --- | --- |
| 1 | **Só teclado** | Concluir a tarefa inteira; foco sempre visível; sem armadilha; escape funciona (`FH-48.09`) |
| 2 | **Leitor de tela** | Nomes acessíveis corretos; estrutura semântica coerente; mudanças anunciadas |
| 3 | **Contraste** | Texto, ícones funcionais, bordas e estados, em todos os modos e acentos |
| 4 | **Sem cor** | A informação sobrevive à remoção da cor |
| 5 | **Movimento reduzido** | Experiência equivalente, não degradada |
| 6 | **Alvos** | Dimensão mínima em toque e ponteiro |

### `FH-38.06` — Estrutura semântica

**Certo.** Hierarquia de títulos correspondendo à hierarquia visual; listas
marcadas como listas; regiões identificadas.

**Errado.** Títulos escolhidos por tamanho visual, quebrando a hierarquia —
comum quando a decisão de estilo antecede a de estrutura (`FH-24.04`).

### `FH-38.10` — Anúncio sem roubo de foco

**Certo.** Resultado de operação anunciado em região dedicada; o foco permanece
onde estava.

**Errado.** Mover o foco para a mensagem de sucesso — interrompe o fluxo e obriga
a voltar manualmente.

---

## 7. Anti-padrões

**Foco removido.** Indicador suprimido por estética.

**Armadilha de foco.** Sobreposição da qual não se sai pelo teclado.

**Nome ausente.** Controle identificado apenas por ícone.

**Título decorativo.** Hierarquia semântica quebrada por escolha visual.

**Só cor.** Estado comunicado exclusivamente por cor.

**Movimento reduzido degradado.** Preferência tratada como versão pior.

**Mudança silenciosa.** Resultado que não existe para leitor de tela.

**Foco sequestrado.** Anúncio que interrompe a navegação.

**Acessibilidade adiada.** Registrada como melhoria futura — proibido por
`FH-38.01`.

---

## 8. Impactos

**Cognitivo.** Estrutura semântica correta beneficia todos: ela é a mesma
hierarquia que orienta a leitura visual.

**Emocional.** Um produto inoperável comunica exclusão de forma inequívoca. Um
produto acessível não é notado — e essa é a intenção.

**Produtividade.** Operação completa por teclado é o mesmo investimento que sustenta
a fluência do Operador (`FH-48`).

**Percepção de qualidade.** Foco bem tratado, contraste correto e leitura por
tecnologia assistiva são sinais imediatos de engenharia cuidadosa.

**Curva de aprendizagem.** Estrutura semântica coerente torna a navegação previsível
para quem depende dela — e reduz o esforço de todos.

---

## 9. Riscos e trade-offs

**Risco: custo de verificação.** Seis verificações por entrega. Custo assumido e
inegociável: é o único capítulo cujo custo não se discute (`FH-04.12`).

**Risco: restrição estética.** Foco visível e contraste limitam escolhas visuais.
Trade-off já arbitrado — acessibilidade vence estética, sempre (`FH-03.09`).

**Risco: conformidade superficial.** Cumprir a letra sem verificar o uso real —
nomes acessíveis genéricos, por exemplo. Mitigação: `FH-38.11` exige verificação
por uso, não por inspeção de código.

**Trade-off central.** Não há. Este é o único capítulo em que a Constituição não
reconhece contrapartida: o custo é aceito integralmente.

---

## 10. Critérios de verificação

1. Nenhuma violação de acessibilidade existe na entrega.
2. O foco é visível em todos os elementos interativos.
3. Toda tarefa é concluível só com teclado, sem armadilhas.
4. O contraste é satisfeito em todos os modos, acentos e tipos de elemento.
5. Todo elemento interativo tem nome acessível coerente.
6. A estrutura semântica reflete a hierarquia real.
7. Movimento reduzido entrega experiência equivalente.
8. Todos os alvos atingem a dimensão mínima.
9. Nenhuma informação depende de um único canal.
10. Mudanças relevantes são anunciadas sem roubar o foco.
11. As verificações por teclado e leitor de tela foram realizadas.

---

## 11. Checklist do capítulo

- [ ] Naveguei a tarefa inteira só com teclado.
- [ ] O foco esteve visível em cada parada.
- [ ] Não fiquei preso em nenhuma região.
- [ ] Ouvi a tela com leitor: nomes e estrutura fazem sentido.
- [ ] Verifiquei contraste em todos os modos e acentos.
- [ ] Removi a cor mentalmente: a informação sobreviveu.
- [ ] Com movimento reduzido, a experiência é equivalente.
- [ ] Os alvos têm tamanho suficiente.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 3 (`FH-03.02(b)`), 4 (`FH-04.12`), 29 (contraste), 30
(tamanho mínimo), 33 (ícones), 34 (contratos), 37 (superfícies), 48 (teclado).

**É pré-requisito de.** Capítulos 39 (movimento), 62 (qualidade), 63 (checklists).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Foco | Token `--ring`, classes `focus-visible:` nas primitivas |
| Contraste | Tokens em `src/app/globals.css`, verificados por modo e acento |
| Semântica e nomes | Primitivas de `src/components/ui/` (base em componentes acessíveis) |
| Movimento reduzido | Preferência do sistema respeitada nas transições |
| Verificação | `pnpm lint`, mais verificação manual por teclado e leitor de tela |
