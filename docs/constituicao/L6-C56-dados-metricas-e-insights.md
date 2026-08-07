# Capítulo 56 — Dados, Métricas e Insights ao Usuário

| Campo | Valor |
| --- | --- |
| Livro | VI — Inteligência |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 11, 15, 29, 36, 41, 50, 51 |
| É pré-requisito de | Capítulos 64, 67 |
| Artigos | `FH-56.01` a `FH-56.10` |

---

## 0. Núcleo Normativo

**`FH-56.01`** — Todo número exibido **DEVE** trazer **referência temporal e
comparação** que o tornem interpretável sem cálculo mental (`FH-15.11`).
> **Verificação:** o número é interpretável sem cálculo mental? → SIM = cumpre | NÃO = viola.

**`FH-56.02`** — **Honestidade estatística.** Amostra pequena, período incompleto,
dado parcial e defasagem **DEVEM** ser declarados (`FH-41.11`, `FH-36.06`).
> **Verificação:** as limitações do dado estão declaradas? → SIM = cumpre | NÃO = viola.

**`FH-56.03`** — Nenhuma representação visual **PODE** distorcer a relação entre
valores: escala truncada, proporção incorreta ou eixo manipulado são proibidos.
> **Verificação:** a proporção visual corresponde à proporção dos valores? → SIM = cumpre | NÃO = viola.

**`FH-56.04`** — Todo insight **DEVE** ser **acionável**: indicar o que fazer ou
levar ao contexto onde a ação acontece.
> **Verificação:** o insight leva a uma ação ou a um contexto de decisão? → SIM = cumpre | NÃO = viola.

**`FH-56.05`** — **NUNCA** apresentar como desempenho de uma pessoa aquilo que ela
não controla.
> **Verificação:** a métrica atribuída a alguém depende de fatores fora do controle dessa pessoa? → NÃO = cumpre | SIM = viola.

**`FH-56.06`** — Toda métrica exibida **DEVE** declarar **como é calculada**, de
forma acessível no próprio contexto.
> **Verificação:** é possível saber como o número foi calculado, sem sair da tela? → SIM = cumpre | NÃO = viola.

**`FH-56.07`** — Comparação entre pessoas **NUNCA** é apresentada como classificação
ou julgamento (`FH-11.07`, `FH-50.09`).
> **Verificação:** a comparação serve para coordenar, e não para classificar pessoas? → SIM = cumpre | NÃO = viola.

**`FH-56.08`** — Toda métrica respeita **permissão e isolamento por conta**, sem
revelar por agregação o que não pode ser visto individualmente (`FH-10.06`).
> **Verificação:** é possível inferir dado inacessível a partir de agregados? → NÃO = cumpre | SIM = viola.

**`FH-56.09`** — **Ausência de dado** é declarada como ausência. **NUNCA** é
representada como zero (`FH-07.10`).
> **Verificação:** ausência de dado aparece como ausência, e não como zero? → SIM = cumpre | NÃO = viola.

**`FH-56.10`** — Exportação de métricas **DEVE** usar o mesmo cálculo, período e
filtro exibidos na tela (`FH-36.09`).
> **Verificação:** o exportado corresponde exatamente ao exibido? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula como o produto **apresenta números ao usuário**, para que
gerem decisão correta em vez de interpretação equivocada. Ele trata do risco mais
silencioso do produto: um número apresentado com precisão aparente e significado
errado.

---

## 2. Perguntas que este capítulo responde

- Que número mostro primeiro?
- Como dou contexto a um número?
- Como represento comparação, tendência e ausência de dado?
- Como evito métrica de vaidade?
- Como não induzo conclusão falsa?

---

## 3. Definições

**Métrica** — valor calculado a partir de dados do sistema.

**Insight** — interpretação apresentada pelo produto sobre uma métrica.

**Referência** — informação que torna o número interpretável: período, comparação,
base.

**Métrica de vaidade** — número que sobe sem relação com resultado do usuário.

**Agregação reveladora** — total que permite inferir dado individual protegido.

---

## 4. Fundamento

**Por que número isolado é pior que nenhum número.** Um valor sem referência não
informa, mas **parece** informar: o usuário lê, sente que sabe algo e decide sobre
uma base inexistente. É o modo de falha mais perigoso da apresentação de dados,
porque não gera dúvida — gera falsa confiança.

**Por que honestidade estatística é regra.** Em contas pequenas ou períodos curtos,
variações grandes são ruído. Apresentar uma variação percentual sobre poucos casos
com a mesma aparência de uma tendência real induz decisão sobre acaso.
`FH-56.02` não exige explicar estatística ao usuário; exige **não esconder** que a
base é frágil.

**Por que a proporção visual não pode mentir.** O olho lê proporção antes do
número. Uma escala truncada faz uma diferença pequena parecer grande, e a
conclusão se forma antes da leitura do valor. Como a distorção normalmente
favorece quem construiu o gráfico, ela se aproxima de padrão escuro
(`FH-11.01`).

**Por que insight precisa ser acionável.** Insight que não indica caminho é
observação — consome atenção e não produz decisão. Pior: cria a impressão de que o
produto está ajudando quando apenas está falando.

**Por que não atribuir o incontrolável.** Métricas de desempenho individual que
dependem de fatores externos — volume recebido, qualidade do contato, sazonalidade
— produzem julgamento injusto e comportamento defensivo. As pessoas passam a
otimizar a métrica em vez do trabalho, degradando o próprio dado (`FH-11.07`).

**Por que agregados podem vazar.** Um total, uma média ou uma contagem sobre um
conjunto pequeno permite inferir o valor individual — especialmente quando o
usuário conhece parte dos membros do conjunto. É a violação mais sutil de
`FH-10.06` e a mais fácil de introduzir sem perceber.

**Por que ausência não é zero.** Zero afirma que algo aconteceu zero vezes;
ausência afirma que não se sabe. Tratá-los igual produz gráficos com quedas que
nunca existiram e conclusões sobre períodos sem coleta.

---

## 5. Princípios

**Número sem referência produz falsa confiança — pior que ignorância.**

**A proporção visual é lida antes do valor.**

**Insight que não leva a lugar nenhum é ruído com aparência de ajuda.**

**Não se atribui a uma pessoa o que ela não controla.**

**Zero é um fato; ausência é a falta dele.**

---

## 6. Regras normativas

### Anatomia de um número exibido (`FH-56.01`)

| Elemento | Obrigatório | Exemplo de conteúdo |
| --- | --- | --- |
| Valor | Sim | O número |
| Período | Sim | "nos últimos 7 dias" |
| Comparação | Sim, quando existir base | "18 a mais que no período anterior" |
| Base de cálculo | Acessível no contexto (`FH-56.06`) | "considera conversas com primeira resposta" |
| Limitação | Sim, quando houver | "período ainda em andamento" |

### `FH-56.03` — Representação fiel

| Proibido | Motivo |
| --- | --- |
| Escala que não parte da origem em comparação de grandeza | Amplia diferenças reais |
| Proporções que não correspondem aos valores | Induz conclusão pela forma |
| Ordem de séries variável entre gráficos | Impede comparação (`FH-29.08`) |
| Interpolação sobre dados ausentes | Cria dados que não existem (`FH-56.09`) |

### `FH-56.05` e `FH-56.07` — Métricas sobre pessoas

**Certo.** "Tempo médio de primeira resposta da equipe: X. Distribuição por
período do dia." — apoia decisão de escala e processo.

**Errado.** Classificação individual por volume atendido, exibida como desempenho —
depende de quantas conversas chegaram a cada um, o que a pessoa não controla.

---

## 7. Anti-padrões

**Número solto.** Valor sem período nem comparação.

**Variação sobre nada.** Percentual dramático sobre poucos casos.

**Gráfico persuasivo.** Escala manipulada para reforçar uma conclusão.

**Insight decorativo.** Observação sem caminho de ação.

**Ranking de pessoas.** Comparação individual como julgamento.

**Vazamento por agregação.** Total que revela o individual.

**Zero inventado.** Ausência representada como zero.

**Exportação divergente.** Arquivo com cálculo diferente do da tela.

---

## 8. Impactos

**Cognitivo.** Referência e base de cálculo eliminam a reconstrução mental do
significado — o usuário lê e decide, em vez de ler e deduzir.

**Emocional.** Métricas individuais mal construídas produzem ansiedade e
comportamento defensivo em equipes inteiras.

**Produtividade.** Insight acionável elimina o passo de descobrir o que fazer com a
informação.

**Percepção de qualidade.** Honestidade estatística é rara e percebida como
seriedade; números inflados produzem desconfiança generalizada quando a inflação é
descoberta.

**Curva de aprendizagem.** Base de cálculo acessível ensina o modelo de dados do
produto durante o uso.

---

## 9. Riscos e trade-offs

**Risco: excesso de ressalvas.** Declarar toda limitação pode poluir a leitura.
Mitigação: a limitação aparece onde é relevante para a decisão, não em toda
exibição.

**Risco: menos impacto visual.** Gráficos honestos são menos dramáticos.
Trade-off assumido: drama visual é persuasão, não informação.

**Risco: custo de cálculo declarado.** Expor a base exige documentá-la. Custo
assumido: métrica cuja base ninguém sabe explicar não deveria estar exibida.

**Trade-off central.** Trocamos números impressionantes por números confiáveis. Os
painéis vendem menos e sustentam decisão.

---

## 10. Critérios de verificação

1. Todo número traz referência temporal e comparação.
2. Limitações do dado estão declaradas.
3. Nenhuma representação visual distorce proporção.
4. Todo insight leva a ação ou contexto.
5. Nenhuma métrica atribui a alguém o que não controla.
6. Toda métrica declara como é calculada.
7. Nenhuma comparação entre pessoas é apresentada como classificação.
8. Nenhum agregado revela dado inacessível.
9. Ausência de dado é declarada como ausência.
10. A exportação corresponde exatamente ao exibido.

---

## 11. Checklist do capítulo

- [ ] Cada número tem período e comparação.
- [ ] Declarei amostra pequena, período parcial e defasagem.
- [ ] A proporção visual corresponde aos valores.
- [ ] Cada insight leva a algum lugar.
- [ ] Nenhuma métrica pessoal depende do incontrolável.
- [ ] Dá para ver como o número é calculado.
- [ ] Nenhum agregado revela o individual.
- [ ] Ausência aparece como ausência, não como zero.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 11 (`FH-11.07`), 15 (`FH-15.11`), 29 (`FH-29.08`), 36
(`FH-36.06`, `FH-36.09`), 41 (`FH-41.11`), 50 (`FH-50.09`), 51 (permissões).

**É pré-requisito de.** Capítulos 64 (métricas de experiência), 67 (evolução).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Painéis e indicadores | `src/app/(dashboard)/dashboard/`, `src/components/dashboard/` |
| Cálculo de métricas | `src/lib/analytics/`, `src/lib/dashboard/` |
| Visualizações | `src/components/tremor/`, `src/components/analytics/` |
| Cores de série | Tokens `--chart-*` em `src/app/globals.css` |
| Consumo e cota | `src/lib/consumption/` |
