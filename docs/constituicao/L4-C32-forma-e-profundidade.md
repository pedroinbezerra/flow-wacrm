# Capítulo 32 — Forma, Elevação e Profundidade

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 23, 24, 28, 29, 31 |
| É pré-requisito de | Capítulos 35, 37, 39 |
| Artigos | `FH-32.01` a `FH-32.10` |

---

## 0. Núcleo Normativo

**`FH-32.01`** — A escala de raio é **derivada de um valor único do sistema**. Raio
arbitrário é proibido (`FH-28.09`).
> **Verificação:** todos os raios derivam da escala do sistema? → SIM = cumpre | NÃO = viola.

**`FH-32.02`** — O sistema de camadas é **fechado**: base, superfície, flutuante,
sobreposto e crítico. Camada nova exige emenda.
> **Verificação:** todas as camadas usadas pertencem ao sistema fechado? → SIM = cumpre | NÃO = viola.

**`FH-32.03`** — Elevação comunica **relação espacial**, nunca decoração. Todo
elemento elevado **DEVE** estar acima de algo por uma razão declarável.
> **Verificação:** é possível declarar por que este elemento está elevado? → SIM = cumpre | NÃO = viola.

**`FH-32.04`** — A escolha entre **borda** e **sombra** segue critério objetivo
(§6): borda delimita; sombra separa planos.
> **Verificação:** a escolha corresponde ao critério? → SIM = cumpre | NÃO = viola.

**`FH-32.05`** — A hierarquia de profundidade **DEVE** permanecer legível nos dois
modos. Onde a sombra não funcionar, a separação **DEVE** vir de superfície ou
borda (`FH-29.10`).
> **Verificação:** a hierarquia de profundidade é legível em modo claro e escuro? → SIM = cumpre | NÃO = viola.

**`FH-32.06`** — A ordem de empilhamento é **declarada e previsível**. Elemento de
camada superior **NUNCA** é coberto por elemento de camada inferior.
> **Verificação:** a ordem de empilhamento respeita a hierarquia de camadas? → SIM = cumpre | NÃO = viola.

**`FH-32.07`** — Profundidade **NUNCA** é o único indicador de interatividade
(`FH-15.08`, `FH-29.04`).
> **Verificação:** removendo a elevação, ainda é possível saber que o elemento é interativo? → SIM = cumpre | NÃO = viola.

**`FH-32.08`** — O raio é **consistente por família de componente**. Componentes
da mesma família compartilham o mesmo raio, em qualquer contexto.
> **Verificação:** este componente usa o raio canônico da sua família? → SIM = cumpre | NÃO = viola.

**`FH-32.09`** — Sobreposição **bloqueante** **DEVE** ser visualmente distinta da
não bloqueante, de forma imediata (`FH-23.01`).
> **Verificação:** é possível distinguir, à primeira vista, se a sobreposição bloqueia? → SIM = cumpre | NÃO = viola.

**`FH-32.10`** — Elevação **NUNCA** substitui hierarquia de conteúdo. Um elemento
não se torna importante por estar elevado (`FH-24.05`).
> **Verificação:** a importância deste elemento vem do conteúdo, e não da elevação? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula **raio, borda, sombra e camadas** como sistema de hierarquia
espacial. Ele transforma profundidade em linguagem: o que está acima do quê, e por
quê.

---

## 2. Perguntas que este capítulo responde

- O que fica acima do quê?
- Quando usar borda e quando usar sombra?
- Quantas camadas existem?
- Como profundidade indica prioridade sem virar decoração?
- Como manter a hierarquia nos dois modos?

---

## 3. Definições

**Raio** — arredondamento de cantos.

**Camada** — nível de profundidade dentro do sistema fechado.

**Elevação** — indicação visual de que um elemento está acima de outro.

**Bloqueante** — sobreposição que impede interação com o conteúdo abaixo.

**Família de componente** — conjunto de componentes com o mesmo papel estrutural.

---

## 4. Fundamento

**Por que camadas são fechadas.** Profundidade sem sistema vira competição: cada
elemento tenta ficar acima do anterior, e o resultado é uma pilha imprevisível em
que a ordem depende de quem escreveu por último. Um conjunto fechado com ordem
declarada torna a sobreposição determinística e depurável.

**Por que borda e sombra têm funções distintas.** Borda **delimita** — diz onde uma
coisa termina e outra começa, no mesmo plano. Sombra **separa planos** — diz que
uma coisa está acima de outra. Usá-las como intercambiáveis produz interfaces em
que tudo parece flutuar, e a elevação deixa de significar algo.

**Por que a hierarquia precisa sobreviver aos dois modos.** Sombras dependem de
contraste com o fundo; em superfícies escuras elas perdem força e a separação
desaparece. Uma hierarquia construída só com sombra funciona em um modo e colapsa
no outro — e ambos são a experiência real de alguém.

**Por que profundidade não indica interatividade sozinha.** Elevação é sutil e
percebida de forma desigual. Se ela for o único sinal de que algo é clicável, uma
parte dos usuários não descobrirá. O mesmo raciocínio de `FH-29.04`, aplicado ao
eixo espacial.

**Por que raio é consistente por família.** O raio é uma das pistas mais rápidas de
identidade visual: componentes com o mesmo raio são lidos como pertencentes ao
mesmo tipo. Raios variados dentro de uma família fazem o usuário procurar
diferenças funcionais que não existem.

**Por que elevação não cria importância.** Elevar um elemento pouco relevante o
coloca acima de conteúdo essencial e inverte a hierarquia de leitura definida em
`FH-24.01`. Importância vem de posição, peso e conteúdo — profundidade apenas
declara relação espacial.

---

## 5. Princípios

**Profundidade é relação, não ênfase.**

**Borda delimita; sombra separa planos.**

**Uma hierarquia que só existe em um modo não existe.**

**Elevar não torna importante.**

---

## 6. Regras normativas

### Sistema de camadas (`FH-32.02`)

| Camada | Contém | Bloqueia? |
| --- | --- | --- |
| **Base** | Fundo da aplicação | Não |
| **Superfície** | Conteúdo principal, cartões, listas | Não |
| **Flutuante** | Menus, dicas, sugestões (`FH-23.01`) | Não |
| **Sobreposto** | Painel lateral, modal | Painel: não · Modal: sim |
| **Crítico** | Avisos de sistema que impedem a operação | Sim |

**Ordem estrita.** Base < Superfície < Flutuante < Sobreposto < Crítico. Nenhum
elemento pode inverter essa ordem (`FH-32.06`).

### Borda ou sombra (`FH-32.04`)

| Use borda quando | Use sombra quando |
| --- | --- |
| Delimitar áreas no mesmo plano | Indicar que algo está acima do conteúdo |
| Separar campos, células, seções | Sinalizar elemento flutuante ou sobreposto |
| A separação precisa funcionar em qualquer modo | O elemento é temporário |
| A densidade é alta (borda ocupa menos) | O elemento é grande e precisa de destaque espacial |

**Combinação.** Borda e sombra podem coexistir em camada sobreposta, quando a
sombra sozinha não garante separação em ambos os modos (`FH-32.05`).

### `FH-32.09` — Bloqueante × não bloqueante

**Certo.** Modal escurece e desabilita o conteúdo abaixo; painel lateral mantém o
conteúdo visível e utilizável.

**Errado.** Painel que parece modal — o usuário não sabe se pode continuar
trabalhando atrás.

---

## 7. Anti-padrões

**Camada improvisada.** Nível criado localmente para "ficar por cima".

**Tudo flutuando.** Sombra em todos os elementos; elevação sem significado.

**Hierarquia de modo único.** Separação que some no modo escuro.

**Elevação como ênfase.** Elemento pouco relevante acima do essencial.

**Raio inconsistente.** Componentes da mesma família com arredondamentos
distintos.

**Profundidade solitária.** Interatividade indicada só por elevação.

**Ambiguidade de bloqueio.** Impossível saber se a sobreposição bloqueia.

---

## 8. Impactos

**Cognitivo.** Camadas previsíveis eliminam a dúvida sobre o que está ativo — o
usuário sabe imediatamente onde pode agir.

**Emocional.** Ambiguidade de bloqueio gera hesitação; hierarquia clara produz
sensação de controle.

**Produtividade.** Ordem de empilhamento determinística elimina uma classe inteira
de defeitos em que elementos se cobrem indevidamente.

**Percepção de qualidade.** Consistência de raio e elevação é lida como acabamento;
sua ausência, como montagem improvisada.

**Curva de aprendizagem.** Camadas com significado fixo permitem prever o
comportamento de uma sobreposição nunca vista.

---

## 9. Riscos e trade-offs

**Risco: rigidez de camadas.** Casos legítimos podem não caber. Mitigação: cinco
camadas cobrem os casos previstos; o excedente é lacuna e vira emenda.

**Risco: excesso de bordas.** Em telas densas, bordas podem gerar ruído visual.
Mitigação: a superfície pode substituir a borda quando o contraste for suficiente
em ambos os modos.

**Risco: perda de sofisticação visual.** Restringir sombras limita expressão.
Trade-off assumido — hierarquia legível vale mais que profundidade decorativa.

**Trade-off central.** Trocamos riqueza visual por legibilidade espacial. As telas
são mais planas e mais compreensíveis.

---

## 10. Critérios de verificação

1. Todos os raios derivam da escala do sistema.
2. Todas as camadas pertencem ao conjunto fechado.
3. Toda elevação tem razão declarável.
4. A escolha entre borda e sombra segue o critério.
5. A hierarquia de profundidade é legível nos dois modos.
6. A ordem de empilhamento respeita a hierarquia de camadas.
7. Nenhuma interatividade é indicada apenas por profundidade.
8. Cada família usa seu raio canônico.
9. Sobreposições bloqueantes são visualmente distintas.
10. Nenhuma importância decorre apenas de elevação.

---

## 11. Checklist do capítulo

- [ ] Todos os raios vieram da escala.
- [ ] A camada usada pertence ao sistema fechado.
- [ ] Sei dizer por que este elemento está elevado.
- [ ] Escolhi borda ou sombra pelo critério.
- [ ] Verifiquei a separação em modo claro e escuro.
- [ ] Nada indica interatividade só por elevação.
- [ ] Dá para saber, olhando, se a sobreposição bloqueia.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 23 (superfícies), 24 (`FH-24.05`), 28, 29 (modos), 31
(espaço).

**É pré-requisito de.** Capítulos 35 (componentes), 37 (responsividade), 39
(movimento).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Escala de raio | `--radius` e derivados em `src/app/globals.css` |
| Superfícies | `src/components/ui/card.tsx` |
| Camada flutuante | `popover.tsx`, `dropdown-menu.tsx`, `tooltip.tsx` |
| Camada sobreposta | `dialog.tsx` (bloqueante), `sheet.tsx` (não bloqueante) |
| Bordas | Token `--border` e `--input` |
