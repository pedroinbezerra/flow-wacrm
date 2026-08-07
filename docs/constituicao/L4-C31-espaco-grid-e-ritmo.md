# Capítulo 31 — Espaço, Grid e Ritmo

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 15, 19, 24, 28, 30 |
| É pré-requisito de | Capítulos 32, 35, 36, 37 |
| Artigos | `FH-31.01` a `FH-31.10` |

---

## 0. Núcleo Normativo

**`FH-31.01`** — A escala de espaçamento é **fechada**. Valor arbitrário é proibido
(`FH-24.08`, `FH-28.09`).
> **Verificação:** todos os espaçamentos pertencem à escala? → SIM = cumpre | NÃO = viola.

**`FH-31.02`** — **Proximidade comunica agrupamento.** O espaço interno de um grupo
**DEVE** ser sempre menor que o espaço que o separa dos demais.
> **Verificação:** o espaço interno de cada grupo é menor que o espaço externo? → SIM = cumpre | NÃO = viola.

**`FH-31.03`** — A densidade **DEVE** corresponder ao tipo de tela: operacional,
analítica ou de configuração (`FH-24.07`).
> **Verificação:** a densidade corresponde ao tipo e à frequência de uso da tela? → SIM = cumpre | NÃO = viola.

**`FH-31.04`** — O ritmo vertical **DEVE** ser consistente dentro de uma tela e
entre telas equivalentes.
> **Verificação:** telas equivalentes usam o mesmo ritmo vertical? → SIM = cumpre | NÃO = viola.

**`FH-31.05`** — Agrupamento **crítico** **NUNCA** depende exclusivamente de espaço:
exige também borda, superfície ou título (`FH-15.08`).
> **Verificação:** o agrupamento crítico sobrevive à perda da percepção de espaço? → SIM = cumpre | NÃO = viola.

**`FH-31.06`** — As margens de borda **DEVEM** ser consistentes por tipo de
superfície. Cada tipo tem um valor, aplicado em todo o produto.
> **Verificação:** esta superfície usa a margem canônica do seu tipo? → SIM = cumpre | NÃO = viola.

**`FH-31.07`** — O espaço **DEVE** ser reservado para os estados futuros do
conteúdo, evitando deslocamento na transição (`FH-46.03`).
> **Verificação:** o espaço já está reservado para o conteúdo que chegará? → SIM = cumpre | NÃO = viola.

**`FH-31.08`** — Densidade **NUNCA** reduz alvos interativos abaixo do mínimo
utilizável (`FH-19.04`). Espaço visual pode diminuir; área sensível, não.
> **Verificação:** os alvos permanecem acima do mínimo mesmo em densidade alta? → SIM = cumpre | NÃO = viola.

**`FH-31.09`** — O grid é **derivado do sistema** e idêntico entre telas do mesmo
tipo. Grid ad hoc por tela é proibido.
> **Verificação:** o grid usado é o do sistema para este tipo de tela? → SIM = cumpre | NÃO = viola.

**`FH-31.10`** — O espaço **NUNCA** é usado como decoração. Todo espaço maior que o
padrão **DEVE** comunicar separação, hierarquia ou agrupamento.
> **Verificação:** cada espaço acima do padrão comunica algo? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo trata o espaço como **elemento de significado**, e não como sobra. Ele
define a escala, as regras de agrupamento por proximidade e a calibração de
densidade por tipo de tela.

---

## 2. Perguntas que este capítulo responde

- Qual espaçamento usar entre o quê?
- Como o espaço comunica agrupamento?
- Como manter ritmo em telas densas?
- Como não desperdiçar tela em operação de alto volume?

---

## 3. Definições

**Escala de espaçamento** — conjunto fechado de valores disponíveis.

**Espaço interno** — distância entre elementos do mesmo grupo.

**Espaço externo** — distância entre grupos distintos.

**Ritmo vertical** — regularidade das distâncias na direção da leitura.

**Densidade** — quantidade de informação por área.

**Alvo interativo** — área sensível a clique ou toque (`FH-19.04`).

---

## 4. Fundamento

**Por que o espaço é significado.** A percepção humana agrupa por proximidade antes
de qualquer outra pista — antes de borda, de cor e de título. Isso significa que o
espaço **já está comunicando** algo, sempre; a única escolha é se ele comunica o
que se pretendia. Espaçamentos arbitrários produzem agrupamentos falsos, e o
usuário lê relações que não existem.

**Por que interno menor que externo.** É a regra prática que faz a proximidade
funcionar. Quando ela se inverte — elementos de grupos diferentes mais próximos
entre si que os do mesmo grupo —, a interface comunica exatamente o oposto da
estrutura real. É o defeito de espaçamento mais comum e o mais confuso para quem
usa.

**Por que densidade varia por tipo de tela.** Já arbitrado em `FH-03.09`: em tela
operacional, respiro excessivo cobra rolagem e deslocamento o dia inteiro; em tela
de configuração, densidade excessiva cobra erro em decisão pontual. O critério é a
frequência de uso, que é medida (`FH-13.10`), não a preferência estética.

**Por que agrupamento crítico não depende só de espaço.** Espaço é percebido de
forma diferente conforme tamanho de tela, zoom e visão do usuário. Quando o
agrupamento carrega informação essencial — quais campos pertencem a qual etapa,
por exemplo —, ele precisa de reforço redundante, pela mesma lógica de
`FH-29.04`.

**Por que reservar espaço antes.** Espaço reservado é a forma mais barata de
eliminar salto de layout (`FH-41.04`, `FH-46.03`), que é o defeito que faz o
usuário clicar no que não pretendia.

**Por que densidade não reduz alvos.** Densidade visual e área sensível são
dimensões independentes: é possível aproximar elementos mantendo a área de toque
adequada. Confundi-las produz interfaces que parecem elegantes e falham no uso
real, especialmente em superfícies de toque.

---

## 5. Princípios

**O espaço sempre comunica; a escolha é comunicar o certo.**

**Interno menor que externo — sempre.**

**Densidade se calibra por frequência de uso, não por gosto.**

**Espaço visual pode encolher; área sensível, não.**

---

## 6. Regras normativas

### Densidade por tipo de tela (`FH-31.03`)

| Tipo | Espaço entre grupos | Espaço interno | Justificativa |
| --- | --- | --- | --- |
| **Operacional** | Reduzido | Mínimo | Uso contínuo; rolagem é custo diário |
| **Analítica** | Médio | Reduzido | Leitura e comparação exigem separação clara |
| **Configuração** | Amplo | Médio | Decisão pontual; erro é o custo dominante |

### `FH-31.02` — Proximidade na prática

**Certo.** Rótulo e campo próximos; conjunto de campos de uma etapa mais distante
da etapa seguinte.

**Errado.** Rótulo igualmente distante do próprio campo e do campo anterior — o
usuário não sabe a qual pertence.

### `FH-31.07` — Reserva de espaço

**Certo.** A área destinada a mensagens de validação existe desde o início, vazia.

**Errado.** Mensagem de erro surgindo e empurrando o botão para baixo no instante
do clique.

### `FH-31.10` — Espaço não decorativo

**Errado.** Margem generosa aplicada porque "ficou mais bonito", sem comunicar
separação — em tela operacional, isso é rolagem cobrada de quem usa o dia inteiro.

---

## 7. Anti-padrões

**Escala aberta.** Valores ad hoc por tela.

**Proximidade invertida.** Grupos mais próximos entre si que internamente.

**Densidade uniforme.** Mesma respiração em tela operacional e de configuração.

**Ritmo quebrado.** Distâncias verticais irregulares na mesma tela.

**Agrupamento frágil.** Estrutura crítica comunicada só por espaço.

**Salto de layout.** Espaço não reservado para estados.

**Alvo apertado.** Densidade reduzindo a área sensível.

**Grid improvisado.** Cada tela com sua própria estrutura.

---

## 8. Impactos

**Cognitivo.** Agrupamento correto reduz blocos de informação (`FH-15.01`) sem
remover conteúdo — é a forma mais eficiente de baixar carga.

**Emocional.** Ritmo consistente produz a sensação de ordem; espaçamento irregular
produz desconforto difuso que o usuário não sabe nomear.

**Produtividade.** Densidade calibrada em telas operacionais economiza rolagem e
deslocamento em cada uso.

**Percepção de qualidade.** Espaçamento é o que mais distingue interfaces
profissionais de amadoras — e é percebido antes de qualquer leitura.

**Curva de aprendizagem.** Agrupamentos previsíveis permitem inferir a estrutura de
uma tela nova em segundos.

---

## 9. Riscos e trade-offs

**Risco: densidade excessiva.** Otimizar para o Operador pode tornar a tela ilegível
para os demais. Mitigação: `FH-13.09` — o teto é o arquétipo de menor
familiaridade com acesso legítimo.

**Risco: rigidez da escala.** Casos específicos podem pedir valores intermediários.
Mitigação: se a escala não cobre um caso real e recorrente, é lacuna — emenda, não
exceção local.

**Risco: reserva de espaço vazio.** Espaço reservado para estados pode parecer
desperdício. Mitigação: o custo é pequeno perto do salto de layout que ele evita.

**Trade-off central.** Trocamos liberdade de composição por previsibilidade
espacial. Telas se parecem mais — e é isso que torna a estrutura inferível.

---

## 10. Critérios de verificação

1. Todos os espaçamentos pertencem à escala fechada.
2. O espaço interno é menor que o externo em todos os grupos.
3. A densidade corresponde ao tipo e à frequência da tela.
4. O ritmo vertical é consistente entre telas equivalentes.
5. Nenhum agrupamento crítico depende só de espaço.
6. As margens seguem o valor canônico do tipo de superfície.
7. O espaço para estados futuros está reservado.
8. Nenhum alvo interativo está abaixo do mínimo.
9. O grid é o do sistema para aquele tipo de tela.
10. Todo espaço acima do padrão comunica algo.

---

## 11. Checklist do capítulo

- [ ] Todos os valores vieram da escala.
- [ ] O espaço interno é menor que o externo.
- [ ] A densidade corresponde ao tipo de tela.
- [ ] Agrupamentos críticos têm reforço além do espaço.
- [ ] Reservei espaço para mensagens e estados.
- [ ] Os alvos continuam grandes o bastante.
- [ ] Usei o grid do sistema.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 15 (agrupamento), 19 (alvos), 24 (`FH-24.07`,
`FH-24.08`), 28, 30 (ritmo).

**É pré-requisito de.** Capítulos 32 (forma), 35 (componentes), 36 (densidade de
dados), 37 (responsividade).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Escala de espaçamento | Utilitários do Tailwind aplicados via `cn` |
| Superfícies e margens | `src/components/ui/card.tsx`, `separator.tsx` |
| Telas operacionais densas | `src/components/inbox/` |
| Telas de configuração | `src/app/(dashboard)/settings/` |
| Estrutura da tela | `src/app/(dashboard)/dashboard-shell.tsx` |
