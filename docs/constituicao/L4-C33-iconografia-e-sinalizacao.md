# Capítulo 33 — Iconografia e Sinalização

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 15, 21, 29, 30, 38, 41 |
| É pré-requisito de | Capítulos 35, 36, 40 |
| Artigos | `FH-33.01` a `FH-33.10` |

---

## 0. Núcleo Normativo

**`FH-33.01`** — Ícone é **reforço**, não substituto do texto. Ícone sozinho só é
permitido nos casos da lista fechada de §6.
> **Verificação:** este ícone sem rótulo pertence à lista fechada? → SIM = cumpre | NÃO = viola.

**`FH-33.02`** — **Um ícone, um significado**, em todo o produto. O mesmo símbolo
**NUNCA** representa conceitos diferentes em áreas diferentes.
> **Verificação:** este símbolo já representa outro conceito em alguma parte do produto? → NÃO = cumpre | SIM = viola.

**`FH-33.03`** — Ícone sem rótulo visível **DEVE** ter rótulo acessível e dica ao
apontar ou focar (`FH-38`, `FH-48.07`).
> **Verificação:** o ícone sem rótulo tem nome acessível e dica? → SIM = cumpre | NÃO = viola.

**`FH-33.04`** — Status é **sistema unificado**: cada estado tem forma, cor e texto
próprios, aplicados igualmente em todo o produto (`FH-41.10`).
> **Verificação:** este status usa a representação canônica de forma, cor e texto? → SIM = cumpre | NÃO = viola.

**`FH-33.05`** — Ícone **decorativo** é proibido em área operacional densa. Ícone
sem função consome atenção e espaço de quem trabalha (`FH-08.06`).
> **Verificação:** este ícone informa, identifica ou aciona algo? → SIM = cumpre | NÃO = viola.

**`FH-33.06`** — O produto usa **um único conjunto** de ícones, com estilo, peso e
grade consistentes. Mistura de conjuntos é proibida.
> **Verificação:** o ícone pertence ao conjunto canônico? → SIM = cumpre | NÃO = viola.

**`FH-33.07`** — O tamanho do ícone **DEVE** derivar da escala tipográfica do
contexto em que aparece, mantendo alinhamento óptico com o texto adjacente.
> **Verificação:** o tamanho deriva da escala e alinha com o texto ao lado? → SIM = cumpre | NÃO = viola.

**`FH-33.08`** — Ícone **NUNCA** é o único portador de estado crítico. Estados que
exigem ação **DEVEM** ter texto (`FH-15.08`, `FH-29.04`).
> **Verificação:** removendo o ícone, o estado crítico continua compreensível? → SIM = cumpre | NÃO = viola.

**`FH-33.09`** — Ícone novo exige registro no catálogo, com o conceito que
representa e o termo canônico correspondente (`FH-21.02`).
> **Verificação:** o ícone está registrado com conceito e termo canônico? → SIM = cumpre | NÃO = viola.

**`FH-33.10`** — Indicadores numéricos **DEVEM** declarar o que contam. Número sem
referência é proibido (`FH-15.11`).
> **Verificação:** é possível saber o que este número conta sem abrir nada? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula **ícones, status e indicadores** — os elementos que carregam
significado sem palavras e que, por isso, são os mais fáceis de tornar ambíguos.

---

## 2. Perguntas que este capítulo responde

- Quando um ícone pode estar sozinho?
- Ícone precisa de rótulo?
- Como represento status?
- Como evito que dois ícones parecidos signifiquem coisas diferentes?
- Posso usar ícone decorativo?

---

## 3. Definições

**Ícone funcional** — representa uma ação, um objeto ou um estado.

**Ícone decorativo** — não carrega informação. Proibido em área operacional
(`FH-33.05`).

**Status** — representação visual de um estado (Capítulo 41).

**Indicador numérico** — número exibido junto a um elemento.

**Rótulo acessível** — nome legível por tecnologia assistiva.

---

## 4. Fundamento

**Por que ícone é reforço.** Ícones são aprendidos, não intuídos: quase nenhum
símbolo tem significado universal fora dos poucos consagrados por décadas de uso.
Um ícone sem rótulo funciona para quem já conhece e falha para todos os demais —
que é exatamente o inverso do que se pretende ao usá-lo para "simplificar". O
rótulo custa espaço; a ambiguidade custa erro.

**Por que um ícone, um significado.** Quando o mesmo símbolo representa conceitos
diferentes em áreas diferentes, o usuário perde a capacidade de generalizar e passa
a verificar cada ocorrência. Pior: ele generaliza errado — aplica o significado
aprendido em uma área e age indevidamente em outra.

**Por que status é sistema, não escolha local.** Estados aparecem em todas as
áreas, frequentemente lado a lado com estados de outras entidades. Se cada domínio
representar seu estado de um jeito, o usuário precisará aprender um vocabulário por
área — o que colide diretamente com `FH-05.02` e `FH-41.10`. A tríade obrigatória
(forma, cor, texto) garante ainda a redundância exigida por `FH-29.04`.

**Por que ícone decorativo é proibido em área densa.** Em tela operacional, cada
elemento compete por atenção com o trabalho. Um ícone sem função ocupa espaço,
adiciona um bloco de interpretação (`FH-15.01`) e não devolve nada. Em superfícies
de menor densidade — entrada, vazios, comunicação — o custo é menor e o uso é
permitido.

**Por que o tamanho deriva da tipografia.** Ícones desalinhados com o texto
adjacente produzem desconforto visual difuso e quebram o ritmo da linha. Derivar da
escala tipográfica resolve o alinhamento óptico automaticamente e mantém a
proporção em qualquer contexto.

**Por que indicadores declaram o que contam.** Um número isolado ao lado de um item
gera interpretação: são mensagens não lidas? pendências? total? Cada usuário
assume uma coisa, e algumas decisões serão tomadas sobre a suposição errada.

---

## 5. Princípios

**Ícone é aprendido, não intuído.**

**Um símbolo, um significado, para sempre.**

**Status é vocabulário do produto, não escolha de área.**

**Número sem referência gera interpretação — e interpretação gera erro.**

---

## 6. Regras normativas

### Lista fechada: ícone sem rótulo (`FH-33.01`)

Ícone pode aparecer sozinho **apenas** quando **todas** as condições se aplicam:

1. O significado é consagrado e estável no repertório geral (fechar, buscar,
   voltar, adicionar, mais opções).
2. Há dica ao apontar ou focar, com o termo canônico (`FH-33.03`).
3. O espaço é comprovadamente insuficiente para o rótulo — em barra de ações densa
   ou controle repetido em lista.
4. A ação é reversível ou não destrutiva. **Ação destrutiva nunca aparece apenas
   como ícone.**

Fora dessas condições, o ícone acompanha texto.

### Sistema de status (`FH-33.04`)

| Componente | Função | Obrigatório |
| --- | --- | --- |
| **Forma** | Distinguir sem depender de cor | Sim |
| **Cor** | Reforçar a categoria do estado (`FH-29.07`) | Sim |
| **Texto** | Nomear o estado com o termo canônico | Sim, salvo repetição em coluna já rotulada |

**Regra.** A mesma categoria de estado — sucesso, atenção, erro, neutro, em
andamento — usa a mesma tríade em todo o produto, independentemente da entidade.

### `FH-33.10` — Indicadores numéricos

**Certo.** Contador acompanhado do que conta, no próprio elemento ou em dica.

**Errado.** Número solto ao lado de um item de navegação. Cada usuário supõe uma
coisa diferente.

---

## 7. Anti-padrões

**Ícone-adivinhação.** Símbolo sozinho, sem dica, com significado específico do
produto.

**Símbolo polissêmico.** Mesmo ícone com significados distintos por área.

**Status regional.** Cada domínio com sua forma de representar estado.

**Ícone decorativo em tela densa.** Ocupação sem função.

**Conjunto misturado.** Ícones de estilos diferentes convivendo.

**Ícone desalinhado.** Tamanho não derivado do texto adjacente.

**Estado só por ícone.** Situação crítica sem texto.

**Contador mudo.** Número sem referência.

---

## 8. Impactos

**Cognitivo.** Status unificado transforma cinco vocabulários em um — redução direta
de blocos de interpretação (`FH-15.01`).

**Emocional.** Ícones ambíguos produzem hesitação constante e a sensação de que o
produto exige memorização.

**Produtividade.** Para o Operador, status reconhecível por forma permite avaliar
uma lista inteira sem ler.

**Percepção de qualidade.** Coerência de iconografia é um dos sinais mais imediatos
de sistema desenhado, e sua ausência é notada mesmo por quem não sabe nomear a
causa.

**Curva de aprendizagem.** Símbolos estáveis são aprendidos uma vez; símbolos
regionais precisam ser reaprendidos a cada área.

---

## 9. Riscos e trade-offs

**Risco: interfaces verbosas.** Exigir rótulo consome espaço. Mitigação: a lista
fechada de §6 permite ícone sozinho onde o espaço realmente falta.

**Risco: escassez de símbolos.** Um ícone por conceito esgota símbolos distintos.
Mitigação: quando não há símbolo claro, a resposta é texto — não um símbolo
ambíguo.

**Risco: rigidez do conjunto.** Um único conjunto limita expressividade.
Trade-off assumido: consistência de leitura vale mais que variedade.

**Trade-off central.** Trocamos economia de espaço por clareza de significado.
Rótulos ocupam área; ambiguidade ocupa tempo e produz erro.

---

## 10. Critérios de verificação

1. Todo ícone sem rótulo pertence à lista fechada.
2. Nenhum símbolo representa mais de um conceito.
3. Todo ícone sem rótulo tem nome acessível e dica.
4. Todo status usa a tríade canônica de forma, cor e texto.
5. Nenhum ícone decorativo aparece em área operacional densa.
6. Todos os ícones pertencem ao conjunto canônico.
7. Os tamanhos derivam da escala tipográfica do contexto.
8. Nenhum estado crítico depende apenas de ícone.
9. Todo ícone novo está registrado com conceito e termo canônico.
10. Todo indicador numérico declara o que conta.

---

## 11. Checklist do capítulo

- [ ] Este ícone reforça um texto ou está na lista fechada.
- [ ] O símbolo não significa outra coisa em outra área.
- [ ] Há nome acessível e dica.
- [ ] O status usa forma, cor e texto canônicos.
- [ ] Nenhum ícone decorativo em tela operacional.
- [ ] Todos vêm do mesmo conjunto.
- [ ] O tamanho alinha com o texto ao lado.
- [ ] O contador diz o que conta.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 15 (`FH-15.08`, `FH-15.11`), 21 (termos canônicos), 29
(`FH-29.04`, `FH-29.07`), 30 (escala), 38 (acessibilidade), 41 (estados).

**É pré-requisito de.** Capítulos 35 (componentes), 36 (densidade), 40
(notificação).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Conjunto de ícones | Biblioteca de ícones usada em `src/components/ui/` |
| Status | `src/components/ui/badge.tsx`, `src/lib/broadcast-status.ts`, `src/lib/template-status.ts` |
| Dicas | `src/components/ui/tooltip.tsx` |
| Termos canônicos | `src/i18n/messages/pt-BR.json`, `src/types/index.ts` |
| Tamanhos de ícone | Variantes em `src/components/ui/button.tsx` |
