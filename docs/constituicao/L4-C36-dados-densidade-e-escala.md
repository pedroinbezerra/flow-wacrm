# Capítulo 36 — Dados, Densidade e Escala

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 13, 15, 23, 24, 27, 30, 31, 46, 49 |
| É pré-requisito de | Capítulos 37, 56 |
| Artigos | `FH-36.01` a `FH-36.10` |

---

## 0. Núcleo Normativo

**`FH-36.01`** — Toda visualização de conjunto **DEVE** declarar a **prioridade de
suas colunas ou campos**: essencial, contextual ou secundário (`FH-22.04`).
> **Verificação:** a prioridade dos campos está declarada? → SIM = cumpre | NÃO = viola.

**`FH-36.02`** — A **identidade do item** permanece visível durante toda a leitura,
inclusive ao rolar horizontal ou verticalmente.
> **Verificação:** é possível saber a qual item pertence a informação em qualquer ponto da rolagem? → SIM = cumpre | NÃO = viola.

**`FH-36.03`** — Filtros aplicados **DEVEM** estar sempre visíveis e ser removíveis
em um passo, e **DEVEM** persistir conforme `FH-23.05`.
> **Verificação:** os filtros estão visíveis, removíveis em um passo e persistentes? → SIM = cumpre | NÃO = viola.

**`FH-36.04`** — A ordenação **DEVE** ser explícita, declarada e estável: mesma
ordenação produz sempre a mesma sequência.
> **Verificação:** a ordenação está declarada e produz sequência estável? → SIM = cumpre | NÃO = viola.

**`FH-36.05`** — Carregamento incremental **NUNCA** perde a posição do usuário nem
desloca conteúdo já lido (`FH-41.04`, `FH-46.03`).
> **Verificação:** carregar mais itens preserva posição e não desloca o já lido? → SIM = cumpre | NÃO = viola.

**`FH-36.06`** — Totalizadores e contagens **DEVEM** ser honestos: valor aproximado,
parcial ou defasado **DEVE** ser declarado como tal (`FH-07.10`, `FH-41.11`).
> **Verificação:** valores aproximados ou parciais estão declarados? → SIM = cumpre | NÃO = viola.

**`FH-36.07`** — Toda visualização **DEVE** ser verificada com o **volume máximo
previsto** (`FH-24.09`, `FH-27.07`).
> **Verificação:** a verificação incluiu o volume máximo previsto? → SIM = cumpre | NÃO = viola.

**`FH-36.08`** — Colunas e campos **NUNCA** se reordenam sozinhos entre sessões ou
por inferência do sistema (`FH-07.08`, `FH-18.11`).
> **Verificação:** a ordem dos campos muda sem ação do usuário? → NÃO = cumpre | SIM = viola.

**`FH-36.09`** — Exportação **DEVE** refletir exatamente o conjunto filtrado e
ordenado que o usuário está vendo, ou declarar explicitamente a diferença.
> **Verificação:** a exportação corresponde ao que está na tela, ou declara a diferença? → SIM = cumpre | NÃO = viola.

**`FH-36.10`** — Ajuste de densidade pelo usuário **PODE** existir, mas **NUNCA**
altera o modelo, a ordem dos campos nem a posição das ações (`FH-27.03`).
> **Verificação:** o ajuste de densidade altera modelo, ordem ou posição de ações? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo regula a apresentação de **grandes volumes**: listas, tabelas,
filtros, ordenação, paginação e agregações. É onde a operação comercial vive e onde
a densidade correta é uma exigência de trabalho, não uma preferência estética.

---

## 2. Perguntas que este capítulo responde

- Como mostro dezenas de milhares de registros?
- Onde ficam os filtros?
- Como preservo a posição do usuário?
- Como escolho o que mostrar quando não cabe tudo?
- Como evito que a tabela vire planilha ilegível?

---

## 3. Definições

**Campo essencial** — necessário para identificar ou decidir sobre o item.

**Campo contextual** — ajuda a decidir em alguns casos.

**Campo secundário** — raramente decide; pertence ao detalhe.

**Ancoragem** — permanência da identidade do item durante a rolagem.

**Carregamento incremental** — adição de itens conforme a necessidade.

**Volume máximo previsto** — a maior quantidade realista de itens.

---

## 4. Fundamento

**Por que declarar prioridade de campos.** Sem prioridade declarada, toda coluna
disputa espaço igualmente e a decisão de o que cortar acontece no momento em que o
espaço acaba — por quem estiver implementando, sem critério. Declarar antes
transforma responsividade (`FH-37.02`) e densidade em consequência de uma decisão
já tomada.

**Por que a identidade precisa de âncora.** Em tabelas largas, rolar horizontalmente
separa o valor da identidade do item — e o usuário lê um número sem saber de quem
é. É um erro silencioso e consequente: ele age sobre o registro errado.

**Por que filtros ficam visíveis.** Filtro invisível é a causa mais comum de "sumiu
o registro". O usuário conclui que o dado não existe, quando apenas está filtrado —
e, no pior caso, cria uma duplicata.

**Por que ordenação precisa ser estável.** Ordenação por campo com valores repetidos
produz sequências diferentes a cada carregamento se não houver critério de
desempate. O usuário percebe como "a lista embaralha sozinha", e a paginação passa
a repetir ou pular itens.

**Por que contagens precisam ser honestas.** Em bases grandes, contagem exata é
cara, e a tentação de aproximar é legítima. O que não é legítimo é aproximar em
silêncio: o usuário toma decisões sobre o número exibido — inclusive decisões de
envio, onde a diferença tem efeito externo (`FH-49.02`).

**Por que colunas não se reordenam sozinhas.** A posição das colunas é memória
motora (`FH-16.02`) e referência de leitura. Reordenar por relevância inferida
quebra a fluência do Operador em troca de um ganho que ele não pediu — a
arbitragem já registrada: previsibilidade vence personalização em estrutura.

**Por que a exportação espelha a tela.** O usuário exporta o que está vendo. Se o
arquivo contiver mais ou menos que isso, ele descobrirá tarde — depois de enviar o
arquivo a alguém.

---

## 5. Princípios

**Prioridade declarada antes; corte por consequência depois.**

**Valor sem identidade visível é valor perigoso.**

**Filtro invisível é a causa de metade dos "sumiu".**

**Aproximar é aceitável; aproximar em silêncio, não.**

---

## 6. Regras normativas

### Prioridade de campo (`FH-36.01`)

| Prioridade | Critério | Comportamento sob restrição de espaço |
| --- | --- | --- |
| **Essencial** | Identifica o item ou decide a ação | Nunca é removido (`FH-37.02`) |
| **Contextual** | Ajuda a decidir em parte dos casos | Pode ser agrupado ou movido para detalhe |
| **Secundário** | Raramente decide | Vai para o detalhe do item |

### `FH-36.04` — Ordenação estável

**Certo.** Ordenar por data com desempate por identificador — a sequência é sempre a
mesma.

**Errado.** Ordenar por um campo com muitos valores repetidos, sem desempate. A cada
carregamento a lista muda e a paginação repete itens.

### `FH-36.06` — Totalizadores honestos

**Certo.** "Mais de 10.000 contatos" quando a contagem exata não é viável;
"12.480 contatos" quando é.

**Errado.** Exibir um número aproximado com aparência de exato — especialmente
antes de uma ação em lote, onde ele determina o alcance.

### `FH-36.09` — Exportação fiel

**Certo.** Exportação do conjunto filtrado, com o filtro descrito no próprio
arquivo.

**Errado.** Exportar a base inteira quando a tela mostra um recorte — sem avisar.

---

## 7. Anti-padrões

**Tabela-planilha.** Todas as colunas com o mesmo peso, sem prioridade.

**Valor órfão.** Número sem identidade visível após rolagem.

**Filtro fantasma.** Critério aplicado e invisível.

**Lista embaralhada.** Ordenação sem desempate.

**Rolagem infinita amnésica.** Carregar mais e perder a posição.

**Contagem falsamente exata.** Aproximação sem declaração.

**Coluna migratória.** Ordem mudando entre sessões.

**Exportação divergente.** Arquivo diferente do que está na tela.

---

## 8. Impactos

**Cognitivo.** Prioridade declarada reduz o número de campos que o usuário
interpreta por linha — efeito direto sobre `FH-15.01`.

**Emocional.** "Sumiu o registro" é uma das experiências mais angustiantes em
sistema de trabalho; filtro visível a elimina.

**Produtividade.** Ancoragem e preservação de posição sustentam o padrão dominante
do Operador: percorrer, agir, continuar.

**Percepção de qualidade.** Tabelas que funcionam bem com volume alto são um dos
sinais mais convincentes de robustez.

**Curva de aprendizagem.** Colunas estáveis permitem que a leitura vire motora — o
usuário sabe onde olhar sem ler cabeçalho.

---

## 9. Riscos e trade-offs

**Risco: excesso de densidade.** Otimizar para volume pode tornar a tela ilegível
para arquétipos de menor familiaridade. Mitigação: `FH-13.09`.

**Risco: perda de informação por prioridade.** Campos secundários ficam menos
acessíveis. Mitigação: `FH-08.05` — a um nível de distância, no detalhe do item.

**Risco: custo de contagem exata.** Honestidade pode custar desempenho. Mitigação:
`FH-36.06` aceita aproximação **declarada** — o que é proibido é a aparência falsa
de exatidão.

**Trade-off central.** Trocamos completude visual por legibilidade sob volume. Cabe
menos por linha; a linha continua legível quando há dezenas de milhares delas.

---

## 10. Critérios de verificação

1. A prioridade de campos está declarada.
2. A identidade do item permanece visível durante toda a rolagem.
3. Filtros são visíveis, removíveis em um passo e persistentes.
4. A ordenação é declarada e estável.
5. Carregamento incremental preserva posição e não desloca conteúdo lido.
6. Valores aproximados ou parciais são declarados.
7. A verificação incluiu o volume máximo previsto.
8. Nenhuma coluna se reordena sem ação do usuário.
9. A exportação corresponde ao que está na tela ou declara a diferença.
10. Ajuste de densidade não altera modelo, ordem nem posição de ações.

---

## 11. Checklist do capítulo

- [ ] Declarei o que é essencial, contextual e secundário.
- [ ] A identidade do item fica visível ao rolar.
- [ ] Os filtros aplicados estão à vista e saem em um passo.
- [ ] A ordenação tem desempate e é estável.
- [ ] Carreguei mais itens: a posição se manteve.
- [ ] Números aproximados estão declarados como tais.
- [ ] Testei com o volume máximo previsto.
- [ ] A exportação reflete exatamente esta tela.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 13 (Operador), 15 (carga), 23 (`FH-23.05`), 24
(`FH-24.09`), 27 (`FH-27.07`), 30 (números), 31 (densidade), 46 (carregamento), 49
(lote).

**É pré-requisito de.** Capítulos 37 (responsividade), 56 (métricas ao usuário).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Tabelas e listas | `src/components/ui/table.tsx`, `scroll-area.tsx` |
| Listas de domínio | `src/components/contacts/`, `src/components/inbox/` |
| Filtros e ordenação | Componentes de listagem por domínio |
| Contagens e agregações | `src/lib/analytics/`, `src/lib/dashboard/` |
| Exportação | Rotas de exportação em `src/app/api/` |
