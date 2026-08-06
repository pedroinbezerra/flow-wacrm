# Capítulo 24 — Hierarquia Visual e Composição de Tela

| Campo | Valor |
| --- | --- |
| Livro | III — Estrutura |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 8, 13, 15, 19, 22, 23 |
| É pré-requisito de | Capítulos 28–36, 41, 42 |
| Artigos | `FH-24.01` a `FH-24.10` |

---

## 0. Núcleo Normativo

**`FH-24.01`** — **Ordem de leitura canônica.** Toda tela **DEVE** apresentar, nesta
sequência: **identidade** (o que é isto) → **estado** (como está) → **conteúdo** (o
que há) → **ação** (o que posso fazer).
> **Verificação:** a tela apresenta identidade, estado, conteúdo e ação nesta ordem? → SIM = cumpre | NÃO = viola.

**`FH-24.02`** — **Uma ação primária por contexto.** Cada tela ou painel tem
exatamente uma ação visualmente dominante. Ações adicionais são secundárias,
terciárias ou destrutivas — nunca primárias.
> **Verificação:** existe mais de uma ação com peso visual primário neste contexto? → NÃO = cumpre | SIM = viola.

**`FH-24.03`** — Toda tela **DEVE** seguir a **anatomia canônica**: cabeçalho de
identificação, faixa de contexto e estado, área de conteúdo, zona de ação. Ausência
de uma parte é decisão declarada, não omissão.
> **Verificação:** as quatro partes existem ou sua ausência está declarada? → SIM = cumpre | NÃO = viola.

**`FH-24.04`** — **Estrutura antes de estilo.** A composição — o que existe, em que
ordem e com que prioridade — **DEVE** ser decidida antes de qualquer decisão
visual.
> **Verificação:** a hierarquia de conteúdo foi definida antes das escolhas visuais? → SIM = cumpre | NÃO = viola.

**`FH-24.05`** — A hierarquia **DEVE** ser construída primeiro por **posição e
espaço**, depois por **peso tipográfico**, e só então por cor ou tamanho. Cor
**NUNCA** é o primeiro recurso de hierarquia.
> **Verificação:** removendo a cor, a hierarquia da tela permanece legível? → SIM = cumpre | NÃO = viola.

**`FH-24.06`** — Nada **PODE** competir visualmente com a tarefa dominante
(`FH-08.09`). Elementos secundários **DEVEM** ser subordinados de forma
inequívoca.
> **Verificação:** algum elemento secundário disputa atenção com a tarefa dominante? → NÃO = cumpre | SIM = viola.

**`FH-24.07`** — A densidade **DEVE** corresponder ao tipo de tela: **operacional**
(densa, para uso contínuo), **analítica** (média, para leitura e comparação),
**configuração** (espaçada, para decisão pontual).
> **Verificação:** a densidade corresponde ao tipo de tela e à sua frequência de uso? → SIM = cumpre | NÃO = viola.

**`FH-24.08`** — Alinhamentos e espaçamentos **DEVEM** derivar do sistema
(Capítulo 31). Valor arbitrário e alinhamento ad hoc são proibidos.
> **Verificação:** todos os espaçamentos e alinhamentos vêm do sistema? → SIM = cumpre | NÃO = viola.

**`FH-24.09`** — A hierarquia **DEVE** permanecer legível com **volume máximo de
dados**. Composição que só funciona com pouco conteúdo é composição incompleta.
> **Verificação:** com o volume máximo previsto, a hierarquia continua legível? → SIM = cumpre | NÃO = viola.

**`FH-24.10`** — Ações secundárias e destrutivas **NUNCA** ocupam a posição
reservada à ação primária, mesmo quando o espaço estiver livre.
> **Verificação:** alguma ação não primária ocupa a posição primária? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo define **como uma tela se organiza** antes de qualquer componente ser
escolhido. Ele é a ponte entre a arquitetura da informação (o que fica onde no
produto) e o design system (com que peças isso é construído).

---

## 2. Perguntas que este capítulo responde

- O que o olho vê primeiro?
- Onde fica a ação principal?
- Quantas ações primárias podem existir?
- Como uma tela cheia continua legível?
- Como componho uma tela nova para que pareça FlowHub?
- Quanto respiro usar?

---

## 3. Definições

**Ordem de leitura** — sequência em que a tela se apresenta ao olhar, não
necessariamente a ordem no código.

**Ação primária** — a ação que a maioria dos usuários executará naquela tela.

**Anatomia canônica** — estrutura obrigatória de quatro partes (`FH-24.03`).

**Tipo de tela** — classificação por finalidade e frequência: operacional,
analítica, configuração.

**Volume máximo previsto** — a maior quantidade de conteúdo que a tela realisticamente
exibirá.

---

## 4. Fundamento

**Por que a ordem identidade → estado → conteúdo → ação.** Ela reproduz a sequência
natural de orientação: antes de agir, a pessoa precisa saber onde está, em que
situação a coisa se encontra e o que existe ali. Telas que apresentam ação antes de
estado produzem o erro mais caro possível — agir sobre uma situação mal
compreendida. Essa ordem também é o que permite retomada rápida (`FH-14.11`): quem
volta depois de uma interrupção precisa reconstruir contexto na mesma sequência.

**Por que uma ação primária.** Duas ações com o mesmo peso não são duas opções
destacadas: são zero opções destacadas. O olhar não tem para onde ir, e a decisão
que deveria ser automática vira deliberação. Além disso, a existência de várias
primárias indica quase sempre que a tela tem mais de uma tarefa dominante, o que
viola `FH-08.09`.

**Por que estrutura antes de estilo.** Quando o visual é decidido primeiro, a
hierarquia passa a ser justificada pelo que já foi desenhado, e não pela
importância real do conteúdo. O sintoma é conhecido: telas bonitas em que o
elemento mais chamativo é o menos usado. `FH-24.04` inverte a ordem de decisão para
que a estética sirva à prioridade, e não o contrário.

**Por que cor é o último recurso.** Cor falha em três situações comuns e não
excepcionais: em modo claro versus escuro, para pessoas com percepção cromática
distinta e em telas sob luz forte. Uma hierarquia construída sobre posição, espaço
e peso funciona em todas elas; uma hierarquia construída sobre cor colapsa. O teste
de `FH-24.05` é direto: remova a cor e veja se ainda dá para trabalhar.

**Por que a densidade varia por tipo de tela.** É a arbitragem permanente já
registrada (`FH-03.09`): densidade vence em telas operacionais, respiro vence em
configuração. A razão é o custo dominante em cada contexto. No uso contínuo, o
custo é rolagem e deslocamento — respiro excessivo cobra o dia inteiro. Na decisão
pontual, o custo é erro — densidade excessiva cobra na hora errada.

**Por que a composição precisa suportar volume máximo.** Telas são desenhadas com
dados de exemplo curtos e bem-comportados. Na operação real, nomes são longos,
listas são grandes, textos transbordam. Uma hierarquia que só existe com pouco
conteúdo desaparece exatamente nas contas maiores — as que mais importam.

---

## 5. Princípios

**Antes de agir, o usuário precisa saber onde está e como as coisas estão.**

**Duas ações primárias equivalem a nenhuma.**

**Prioridade define estética, nunca o contrário.**

**Uma hierarquia que depende de cor não é hierarquia.**

---

## 6. Anatomia canônica

| Parte | Contém | Obrigatória |
| --- | --- | --- |
| **Cabeçalho de identificação** | O que é esta tela ou item; posição na estrutura (`FH-23.08`) | Sim |
| **Faixa de contexto e estado** | Situação atual, responsável, indicadores de estado (`FH-41`) | Sim, quando houver estado |
| **Área de conteúdo** | O trabalho em si | Sim |
| **Zona de ação** | Ação primária; secundárias subordinadas; destrutivas afastadas (`FH-19.03`) | Sim, quando houver ação |

**Regras de composição:**

- A posição da ação primária é **estável em todo o produto** (`FH-07.08`,
  `FH-16.02`).
- Ações destrutivas nunca compartilham agrupamento visual com a primária.
- A faixa de estado nunca é omitida para "limpar" a tela (`FH-08.07`).
- Cada parte pode ser densa internamente; o número de **partes** é fixo.

### `FH-24.02` — Ação primária única

**Quando NÃO aplicar.** Em telas cuja tarefa dominante é escolher entre alternativas
equivalentes — selecionar um caminho entre dois igualmente válidos. Aí não há ação
primária, e sim uma escolha, que deve ser apresentada como tal.

**Certo.** Uma tela de conversa: responder é primária; arquivar, atribuir e etiquetar
são secundárias.

**Errado.** Três botões com o mesmo peso, obrigando o usuário a ler os três a cada
visita.

### `FH-24.07` — Densidade por tipo

| Tipo | Exemplo de finalidade | Densidade | Frequência típica |
| --- | --- | --- | --- |
| Operacional | Atender, responder, percorrer itens | Alta | Contínua |
| Analítica | Comparar, diagnosticar, decidir | Média | Diária |
| Configuração | Ajustar, autorizar, contratar | Baixa | Episódica |

**Errado.** Aplicar densidade de configuração a uma tela de atendimento: o
Operador paga em rolagem o respiro que serviria a quem entra uma vez por mês.

---

## 7. Anti-padrões

**Ação antes de estado.** Botão de enviar visível antes de o usuário entender o que
será enviado.

**Primárias múltiplas.** Vários botões de destaque competindo.

**Hierarquia cromática.** Importância comunicada só por cor.

**Estilo primeiro.** Layout bonito com prioridade invertida.

**Composição frágil.** Hierarquia que some com conteúdo real.

**Respiro caro.** Densidade de configuração em tela operacional.

**Destrutivo no lugar de honra.** Excluir ocupando a posição da ação primária.

---

## 8. Impactos

**Cognitivo.** A ordem canônica reduz o tempo de orientação a quase zero em telas
repetidas — o usuário sabe onde olhar antes de a tela terminar de carregar.

**Emocional.** Composição previsível produz sensação de controle. Telas que mudam de
estrutura entre áreas produzem a sensação de estar em outro produto.

**Produtividade.** `FH-24.02` e a estabilidade de posição sustentam a fluência
motora do Capítulo 16.

**Percepção de qualidade.** É o capítulo que mais determina se uma tela "parece
FlowHub". Coerência de composição é percebida antes de qualquer detalhe visual.

**Curva de aprendizagem.** Anatomia fixa permite que uma tela nunca vista seja
compreendida em segundos — o usuário já sabe onde cada parte estará.

---

## 9. Riscos e trade-offs

**Risco: uniformidade excessiva.** A anatomia pode empobrecer telas de natureza
distinta. Mitigação: o número de partes é fixo, o conteúdo interno é livre.

**Risco: densidade mal calibrada.** Classificar errado o tipo de tela produz o pior
dos dois mundos. Mitigação: o critério é a frequência de uso, que é medida
(`FH-13.10`).

**Risco: rigidez da ação primária.** Algumas telas têm duas tarefas legítimas.
Mitigação: se há duas tarefas dominantes, o problema é a tela, não a regra —
aplica-se `FH-08.09`.

**Trade-off central.** Trocamos expressividade visual por previsibilidade
estrutural. Telas se parecem mais entre si — e é exatamente isso que permite
aprender uma e conhecer todas.

---

## 10. Critérios de verificação

1. Toda tela segue a ordem identidade → estado → conteúdo → ação.
2. Existe exatamente uma ação primária por contexto.
3. As quatro partes da anatomia existem ou sua ausência está declarada.
4. A hierarquia de conteúdo foi definida antes das escolhas visuais.
5. A hierarquia permanece legível sem cor.
6. Nenhum elemento secundário compete com a tarefa dominante.
7. A densidade corresponde ao tipo e à frequência da tela.
8. Todos os espaçamentos e alinhamentos vêm do sistema.
9. A hierarquia sobrevive ao volume máximo previsto.
10. Nenhuma ação não primária ocupa a posição primária.

---

## 11. Checklist do capítulo

- [ ] A tela responde, nesta ordem: o que é, como está, o que há, o que faço.
- [ ] Existe uma única ação primária.
- [ ] Defini a hierarquia antes de decidir o visual.
- [ ] Removi a cor mentalmente: a hierarquia sobrevive.
- [ ] Nenhum elemento secundário disputa atenção.
- [ ] A densidade corresponde ao tipo de tela.
- [ ] Testei com nomes longos e listas grandes.
- [ ] A ação destrutiva está longe da primária.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 8 (tarefa dominante), 13 (frequência), 15 (blocos), 19
(ergonomia), 22 (prioridade), 23 (superfícies).

**É pré-requisito de.** Capítulos 28–33 (design system), 34–35 (componentes), 36
(densidade), 41 (estados), 42 (vazios).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Shell e estrutura de tela | `src/app/(dashboard)/dashboard-shell.tsx`, `layout.tsx` |
| Cabeçalhos de rota | `page.tsx` de cada rota em `src/app/(dashboard)/` |
| Superfícies de conteúdo | `src/components/ui/card.tsx`, `table.tsx`, `scroll-area.tsx` |
| Ações e hierarquia de botão | `src/components/ui/button.tsx` (variantes) |
| Espaçamento e alinhamento | `src/app/globals.css` (escala de raio e tokens) |
