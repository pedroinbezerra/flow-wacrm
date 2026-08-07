# Capítulo 39 — Movimento e Animação

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 9, 15, 32, 38, 41, 43, 46 |
| É pré-requisito de | Capítulo 40 |
| Artigos | `FH-39.01` a `FH-39.10` |

---

## 0. Núcleo Normativo

**`FH-39.01`** — Toda animação pertence a uma **faixa de duração por finalidade**
(§5). Duração fora das faixas é proibida.
> **Verificação:** a duração corresponde à faixa da finalidade? → SIM = cumpre | NÃO = viola.

**`FH-39.02`** — Animação **comunica causa, origem ou continuidade**. Movimento sem
função comunicativa é proibido.
> **Verificação:** é possível declarar o que esta animação comunica? → SIM = cumpre | NÃO = viola.

**`FH-39.03`** — Animação **NUNCA** bloqueia entrada. O usuário pode agir durante
qualquer transição.
> **Verificação:** é possível interagir durante a animação? → SIM = cumpre | NÃO = viola.

**`FH-39.04`** — Toda animação é **cancelável por nova ação**, sem esperar sua
conclusão.
> **Verificação:** uma nova ação interrompe a animação em curso? → SIM = cumpre | NÃO = viola.

**`FH-39.05`** — Animação decorativa é proibida em **fluxo repetitivo**. O que
encanta na primeira vez atrasa na centésima (`FH-13.10`).
> **Verificação:** esta animação aparece em fluxo de alta frequência sem função comunicativa? → NÃO = cumpre | SIM = viola.

**`FH-39.06`** — Com **movimento reduzido**, o caminho é **equivalente**, nunca
degradado (`FH-38.07`).
> **Verificação:** com movimento reduzido, a comunicação permanece completa? → SIM = cumpre | NÃO = viola.

**`FH-39.07`** — Nenhuma informação essencial depende de movimento para ser
percebida (`FH-38.09`).
> **Verificação:** parando o movimento, a informação permanece disponível? → SIM = cumpre | NÃO = viola.

**`FH-39.08`** — Animação **NUNCA** atrasa o resultado. O efeito ocorre no momento
da ação; a animação apenas o acompanha (`FH-46.09`).
> **Verificação:** o resultado depende do término da animação? → NÃO = cumpre | SIM = viola.

**`FH-39.09`** — Entrada e saída são **consistentes por família de componente**: o
mesmo tipo de elemento aparece e desaparece sempre da mesma forma (`FH-07.08`).
> **Verificação:** este componente entra e sai como os demais da família? → SIM = cumpre | NÃO = viola.

**`FH-39.10`** — Nenhuma animação ocorre em conteúdo **sob leitura ou manipulação**
(`FH-15.09`, `FH-50.01`).
> **Verificação:** algo se move enquanto o usuário lê ou manipula? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo define animação como **comunicação de causa, continuidade e
hierarquia** — nunca como enfeite. Ele existe porque movimento é o recurso visual
mais fácil de usar mal: agrada na demonstração e cobra na repetição.

---

## 2. Perguntas que este capítulo responde

- Quando animar? Por quanto tempo?
- O que nunca pode ser animado?
- Como a animação ajuda a entender o que aconteceu?
- Como não atrasar quem tem pressa?
- O que fazer com movimento reduzido?

---

## 3. Definições

**Transição de estado** — mudança de aparência de um elemento existente.

**Entrada/saída** — surgimento ou desaparecimento de um elemento.

**Movimento de origem** — animação que mostra de onde algo veio.

**Animação decorativa** — movimento sem função comunicativa.

**Movimento reduzido** — preferência do sistema por menos animação.

---

## 4. Fundamento

**Por que movimento comunica.** O olho acompanha mudança melhor do que compara
estados. Uma transição bem construída responde três perguntas sem texto: o que
mudou, de onde veio, e o que isso tem a ver com o que eu fiz. Sem ela, o usuário
compara mentalmente o antes e o depois — trabalho cognitivo que a animação
elimina.

**Por que duração é normativa.** É a variável que separa animação útil de animação
irritante, e é decidida por gosto na ausência de regra. Curta demais não é
percebida e não comunica; longa demais atrasa quem já sabe o que vai acontecer. As
faixas de §5 existem para que a discussão seja sobre finalidade, não sobre
sensibilidade.

**Por que nunca bloquear entrada.** Bloquear durante animação transfere ao usuário o
custo de uma escolha estética. Para o Operador, que executa por memória motora
(`FH-14.06`), isso significa que a segunda ação da sequência é ignorada — e ele
precisa repetir, sem saber por quê.

**Por que decoração é proibida em fluxo repetitivo.** É a aplicação direta de
`FH-17.01`: emoções sustentáveis vencem emoções intensas. Uma animação encantadora
executada duzentas vezes por dia deixa de encantar e passa a custar — em tempo, em
atenção e em irritação acumulada.

**Por que movimento reduzido exige equivalência.** Desligar animações sem
substituir a comunicação que elas faziam entrega uma experiência pior a quem já
tem uma restrição — o que colide com `FH-38.01`. O caminho equivalente mantém a
comunicação por outros meios: posição, contraste, texto.

**Por que animação não atrasa o resultado.** Quando o efeito só acontece ao fim da
transição, a animação deixa de ser acompanhamento e vira espera. É a forma mais
comum de tornar um produto lento sem que nada esteja tecnicamente lento
(`FH-46.09`).

---

## 5. Faixas de duração por finalidade

| Finalidade | Duração relativa | Exemplo de uso |
| --- | --- | --- |
| **Reação imediata** | Quase imperceptível | Controle respondendo ao toque (`FH-43.01`) |
| **Transição de estado** | Curta | Mudança de cor, expansão de linha |
| **Entrada de elemento pequeno** | Curta a média | Dica, menu, mensagem |
| **Entrada de elemento grande** | Média | Painel lateral, modal |
| **Movimento de origem** | Média | Item que se move entre listas ou etapas |
| **Transição de contexto** | Média a longa | Mudança entre áreas — apenas quando comunica direção |

**Regras transversais.** A duração cresce com o tamanho do elemento e com a
distância percorrida, nunca com a importância percebida. Elementos que aparecem em
fluxo de alta frequência usam sempre a faixa mais curta aplicável.

---

## 6. Regras normativas

### `FH-39.02` — Função comunicativa

| Função | O que comunica | Exemplo |
| --- | --- | --- |
| **Causa** | Que a mudança decorreu da ação do usuário | Elemento reage no ponto do clique |
| **Origem** | De onde o elemento veio | Painel entra do lado em que foi acionado |
| **Continuidade** | Que é o mesmo objeto em outro lugar | Item que se move entre etapas |
| **Hierarquia** | Que algo está acima do plano | Sobreposição que se eleva (`FH-32.03`) |

Animação que não exerce nenhuma das quatro é decorativa e cai em `FH-39.05`.

### `FH-39.03` e `FH-39.04` — Entrada durante o movimento

**Certo.** Painel abrindo enquanto o usuário já digita no campo que está entrando;
nova ação interrompe a transição e assume.

**Errado.** Interface inerte até a transição terminar — a segunda ação da sequência
motora se perde.

### `FH-39.10` — Nada se move sob leitura

**Errado.** Item que se reposiciona na lista enquanto o usuário lê — colide também
com `FH-50.01`.

---

## 7. Anti-padrões

**Movimento decorativo.** Animação sem função comunicativa.

**Transição bloqueante.** Interface inerte até terminar.

**Encanto repetido.** Celebração animada em ação frequente.

**Origem falsa.** Elemento que entra de um lado sem relação com a ação.

**Resultado adiado.** Efeito só ao fim da animação.

**Redução degradante.** Movimento reduzido entregando experiência pior.

**Informação em movimento.** Estado percebido só por animação.

**Entrada inconsistente.** Mesmo tipo de componente entrando de formas diferentes.

---

## 8. Impactos

**Cognitivo.** Movimento de origem e continuidade eliminam a comparação mental
entre estados — economia direta de memória de trabalho.

**Emocional.** Animação bem calibrada produz sensação de fluidez; mal calibrada
produz a sensação de que o sistema é lento, mesmo quando não é.

**Produtividade.** `FH-39.03`, `FH-39.05` e `FH-39.08` protegem o fluxo de alta
frequência — onde qualquer atraso se multiplica.

**Percepção de qualidade.** Transições consistentes por família são percebidas como
polimento; transições variadas, como improviso.

**Curva de aprendizagem.** Movimento que mostra origem ensina a estrutura da
interface sem texto — o usuário aprende de onde as coisas vêm.

---

## 9. Riscos e trade-offs

**Risco: austeridade excessiva.** Proibir decoração pode produzir interface seca.
Mitigação: as quatro funções comunicativas cobrem a maior parte do movimento
desejável — o que sobra é justamente o dispensável.

**Risco: inconsistência entre famílias.** Muitas faixas podem gerar variedade.
Mitigação: `FH-39.09` fixa o comportamento por família.

**Risco: cancelamento complexo.** Tornar tudo interrompível custa implementação.
Custo assumido: é o que protege a fluência motora.

**Trade-off central.** Trocamos expressividade animada por respeito ao tempo. O
produto impressiona menos em demonstração e cansa menos em uso diário.

---

## 10. Critérios de verificação

1. Toda animação pertence a uma faixa de duração declarada.
2. Toda animação comunica causa, origem, continuidade ou hierarquia.
3. Nenhuma animação bloqueia entrada.
4. Toda animação é cancelável por nova ação.
5. Nenhuma animação decorativa existe em fluxo repetitivo.
6. Movimento reduzido entrega experiência equivalente.
7. Nenhuma informação essencial depende de movimento.
8. Nenhum resultado depende do término da animação.
9. Entradas e saídas são consistentes por família.
10. Nada se move sob leitura ou manipulação.

---

## 11. Checklist do capítulo

- [ ] Sei o que esta animação comunica.
- [ ] A duração está na faixa da finalidade.
- [ ] Consigo agir durante a transição.
- [ ] Uma nova ação interrompe a anterior.
- [ ] Não há decoração em fluxo repetitivo.
- [ ] Com movimento reduzido, nada se perde.
- [ ] O resultado acontece na hora, não ao fim da animação.
- [ ] Nada se move enquanto o usuário lê.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 9 (`FH-09.02`), 15 (`FH-15.09`), 32 (elevação), 38
(`FH-38.07`), 41 (transições), 43 (reação), 46 (percepção de tempo).

**É pré-requisito de.** Capítulo 40 (notificação).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Transições de componente | Classes de transição nas primitivas de `src/components/ui/` |
| Animações utilitárias | `tw-animate-css` importado em `src/app/globals.css` |
| Entradas de sobreposição | `dialog.tsx`, `sheet.tsx`, `popover.tsx` |
| Reação imediata | `active:` e `transition-colors` em `button.tsx` |
