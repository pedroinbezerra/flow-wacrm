# Capítulo 16 — Comportamento, Hábito e Fluência

| Campo | Valor |
| --- | --- |
| Livro | II — O Ser Humano |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P7, P8), 13, 14, 15 |
| É pré-requisito de | Capítulos 26, 27, 48, 49, 55 |
| Artigos | `FH-16.01` a `FH-16.10` |

---

## 0. Núcleo Normativo

**`FH-16.01`** — O produto **DEVE** atender integralmente os três estágios de
domínio — **descoberta, competência e fluência** — sem exigir que o usuário mude
de modo, de tela ou de caminho ao progredir entre eles.
> **Verificação:** os três estágios são atendidos no mesmo caminho, sem bifurcação? → SIM = cumpre | NÃO = viola.

**`FH-16.02`** — **Estabilidade motora.** A posição de ações frequentes **NUNCA**
muda sem emenda ao padrão e comunicação prévia ao usuário. Reorganização
silenciosa é proibida.
> **Verificação:** esta mudança altera a posição de uma ação frequente sem emenda e sem comunicação? → NÃO = cumpre | SIM = viola.

**`FH-16.03`** — Toda ação frequente **DEVE** ter caminho completo por ponteiro
**e** por teclado, com resultado idêntico.
> **Verificação:** esta ação é executável integralmente pelos dois caminhos, com o mesmo resultado? → SIM = cumpre | NÃO = viola.

**`FH-16.04`** — **Descoberta passiva.** Todo atalho **DEVE** ser exibido no ponto
onde a ação vive, para quem está executando pelo caminho lento. Atalho anunciado
apenas em documentação é considerado inexistente.
> **Verificação:** o atalho é visível junto da ação que ele executa? → SIM = cumpre | NÃO = viola.

**`FH-16.05`** — Apoios de aprendizagem **NUNCA** são obrigatórios nem permanentes.
Todo apoio **DEVE** ser dispensável em um passo e **NUNCA** reaparecer depois de
dispensado, salvo por solicitação do usuário.
> **Verificação:** o apoio é dispensável e permanece dispensado? → SIM = cumpre | NÃO = viola.

**`FH-16.06`** — O sistema **NUNCA** premia, pontua, classifica ou cobra o estágio
de domínio do usuário. Progresso de aprendizagem é dele, não métrica do produto.
> **Verificação:** existe elemento que avalia, pontua ou cobra o nível de domínio do usuário? → NÃO = cumpre | SIM = viola.

**`FH-16.07`** — Nenhum caminho fluente pode ser **mais arriscado** que o caminho
lento. Atalhos **NUNCA** executam ação destrutiva sem a mesma proteção do caminho
completo.
> **Verificação:** o caminho rápido oferece a mesma proteção contra erro que o caminho lento? → SIM = cumpre | NÃO = viola.

**`FH-16.08`** — Capacidade que **não é descoberta em uso normal** é considerada
inexistente. Repetição **NUNCA** pode ser condição para descobrir uma capacidade.
> **Verificação:** esta capacidade é descoberta no uso normal, sem instrução externa? → SIM = cumpre | NÃO = viola.

**`FH-16.09`** — Mudança de padrão estabelecido **DEVE** ter transição comunicada:
aviso prévio, explicação do que mudou e caminho para a nova forma. Coexistência
permanente de duas formas é proibida (`FH-05.10`).
> **Verificação:** a mudança foi comunicada com explicação e caminho, sem manter as duas formas para sempre? → SIM = cumpre | NÃO = viola.

**`FH-16.10`** — Fluência **NUNCA** é exigida. O produto funciona integralmente
para quem permanecer no estágio de competência para sempre.
> **Verificação:** alguma tarefa essencial depende de conhecimento de fluência (atalho, gesto, comando)? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo define como o produto conduz o usuário de iniciante a fluente **sem
punir nenhum dos estágios** — e como protege a fluência conquistada, que é o ativo
mais frágil e mais valioso da relação entre um operador e sua ferramenta.

---

## 2. Perguntas que este capítulo responde

- Como se forma um hábito no produto?
- Atalhos importam se poucos usam?
- Como não travar o especialista para proteger o novato?
- Quando remover um apoio que já não é necessário?
- Posso mudar a posição de um botão?
- Como o usuário descobre o que existe?
- É aceitável que alguém nunca fique fluente?

---

## 3. Definições

**Descoberta** — estágio em que o usuário não sabe o que existe nem onde está.

**Competência** — estágio em que ele executa suas tarefas com leitura consciente.

**Fluência** — estágio em que ele executa por memória motora, sem leitura.

**Memória motora** — automatização de sequência por repetição. Rápida, econômica e
destruída por mudança de posição.

**Descoberta passiva** — aprender algo enquanto se faz outra coisa, sem ter
procurado.

**Apoio de aprendizagem** — elemento temporário que orienta o iniciante.

---

## 4. Fundamento

**Por que os três estágios convivem no mesmo caminho.** A tentação é servir cada
estágio com uma solução própria — tutorial para o novato, modo avançado para o
veterano. O resultado é conhecido: o novato nunca sai do tutorial, o veterano
nunca encontra o modo avançado, e a travessia entre estágios não acontece.
`FH-16.01` obriga a solução mais difícil e única que funciona: um caminho que
serve aos três, com profundidade revelada progressivamente (`FH-08.04`).

**Por que a estabilidade motora é sagrada.** A fluência é construída por
repetição: depois de centenas de execuções, a mão sabe onde ir sem que os olhos
precisem confirmar. Isso é o que permite ao Operador atender rápido. Mover uma
ação frequente destrói essa camada inteira — e o custo não é o tempo de reaprender
a nova posição, é a **desconfiança**: o usuário volta a olhar antes de clicar, e
essa verificação permanece por muito tempo. Uma reorganização visualmente melhor
pode custar semanas de produtividade.

**Por que atalhos importam mesmo com pouca adoção.** Atalhos parecem investimento
de baixo retorno: poucos usam. Mas quem usa são justamente os de maior volume — o
Operador do Capítulo 13, cuja produtividade multiplica por frequência. Além disso,
`FH-16.03` produz um efeito colateral obrigatório e valioso: garantir caminho
completo por teclado é a mesma exigência da acessibilidade (Capítulo 38). Um
produto navegável por teclado é operável por quem não usa ponteiro, por escolha ou
por necessidade.

**Por que a descoberta é passiva.** Ninguém procura o que não sabe que existe. Uma
capacidade que só é encontrada por quem lê documentação, assiste treinamento ou
pergunta a um colega está, para efeitos práticos, ausente. `FH-16.08` transforma
isso em critério: se não se descobre em uso normal, não existe — e a resposta
correta é redesenhar a exposição, não escrever documentação (`FH-06.08`).

**Por que o atalho não pode ser mais perigoso.** Fluência significa executar sem
ler. Se um atalho dispara ação destrutiva com a mesma facilidade com que dispara
uma ação comum, a fluência vira risco: a mão executa antes de a atenção chegar.
`FH-16.07` exige simetria de proteção — o caminho rápido é rápido para o comum, e
igualmente protegido para o perigoso.

**Por que a fluência nunca é exigida.** Muitos usuários permanecerão para sempre no
estágio de competência, e isso é legítimo — especialmente para os arquétipos de
baixa frequência (A4, A5). Um produto que só é plenamente utilizável por quem
domina atalhos exclui a maioria e transforma domínio em pré-requisito, quando ele
deveria ser recompensa.

---

## 5. Princípios

**Um caminho, três estágios.**

**Posição estável vale mais que posição ótima.**

**O que não se descobre em uso normal não existe.**

**Fluência é recompensa, nunca requisito.**

---

## 6. Regras normativas

### `FH-16.02` — Estabilidade motora

**Quando aplicar.** Em toda ação de uso frequente.

**Quando NÃO aplicar.** Quando a posição atual viola a Constituição — por exemplo,
uma ação destrutiva adjacente a uma frequente (`FH-19`). Aí a correção é
obrigatória, e aplica-se `FH-16.09` (transição comunicada).

**Certo.** Mover uma ação frequente apenas por emenda ao padrão, com aviso prévio e
explicação.

**Errado.** Reposicionar por melhoria estética, em uma entrega qualquer, sem aviso.

### `FH-16.03` — Caminhos paralelos

**Quando aplicar.** Em toda ação frequente.

**Quando NÃO aplicar.** Em ações raras e complexas, onde o caminho por ponteiro é
suficiente — desde que a operação permaneça acessível por teclado para fins de
acessibilidade (`FH-38`). A distinção: `FH-16.03` exige **atalho**;
acessibilidade exige **alcance**. Alcance nunca é dispensável.

### `FH-16.04` — Descoberta passiva

**Certo.** O menu que executa a ação mostra, ao lado, a combinação de teclas
equivalente.

**Errado.** Lista de atalhos em uma página de ajuda. Serve a quem já procura, isto
é, a quem já sabe.

### `FH-16.05` — Apoios dispensáveis

**Quando aplicar.** Em dicas de primeiro uso, destaques de novidade, orientações
iniciais.

**Errado.** Apoio que reaparece a cada sessão. Depois da terceira vez, ele deixa de
ser ajuda e vira ruído — e treina o usuário a ignorar destaques, inclusive os
importantes.

### `FH-16.07` — Simetria de proteção

**Errado.** Um atalho que exclui definitivamente sem confirmação, enquanto o botão
equivalente confirma. O caminho fluente virou o caminho perigoso.

### `FH-16.09` — Transição de padrão

**Quando aplicar.** Em toda mudança de posição, nome ou comportamento estabelecido.

**Quando NÃO aplicar.** Em correção de defeito que restaura o comportamento
esperado.

**Certo.** Aviso antes da mudança, explicação do que muda e por quê, e o novo
caminho apontado no lugar antigo por período determinado.

**Errado.** Manter as duas formas indefinidamente "para não incomodar". Isso cria
duas verdades no produto e viola `FH-05.10`.

---

## 7. Anti-padrões

**Modo avançado.** Bifurcação por estágio. Proibido por P8 e `FH-16.01`.

**Reorganização estética.** Mover elementos frequentes por gosto visual.

**Atalho secreto.** Existe, é útil, ninguém sabe.

**Tutorial perpétuo.** Apoio que nunca some.

**Gamificação de domínio.** Pontuar o quanto o usuário sabe usar o produto.

**Atalho armadilha.** Caminho rápido com menos proteção que o lento.

**Convivência eterna.** Duas formas de fazer a mesma coisa, para sempre.

---

## 8. Impactos

**Cognitivo.** A fluência é a maior economia cognitiva disponível: executar sem ler
libera a atenção inteira para o trabalho. `FH-16.02` protege essa economia; violá-
la a destrói de uma vez.

**Emocional.** Fluência produz sensação de domínio, que é uma das experiências mais
gratificantes em ferramentas de trabalho. Perdê-la por uma mudança não solicitada
produz frustração desproporcional — e justificada.

**Produtividade.** Atalhos e estabilidade motora atuam sobre o arquétipo de maior
volume. É onde o ganho por unidade de esforço de construção é maior.

**Percepção de qualidade.** Produtos estáveis são percebidos como maduros. Produtos
que mudam de lugar são percebidos como instáveis, mesmo quando cada mudança
individual é uma melhoria.

**Curva de aprendizagem.** É o capítulo que governa a curva inteira: `FH-16.08`
determina a subida (o que se descobre), `FH-16.01` determina a continuidade (sem
degraus), `FH-16.10` determina que não há teto obrigatório.

---

## 9. Riscos e trade-offs

**Risco: imobilismo.** `FH-16.02` pode congelar melhorias legítimas de layout.
Mitigação: a mudança é permitida por emenda com comunicação — o custo existe para
que a decisão seja consciente, não para impedi-la.

**Risco: poluição por atalhos visíveis.** `FH-16.04` adiciona informação à
interface. Mitigação: a exibição ocorre no contexto da ação, de forma discreta, e
conta como parte do bloco daquela ação (`FH-15.01`).

**Risco: descoberta forçada.** Tentar garantir descoberta pode gerar destaques
insistentes. Mitigação: `FH-16.05` limita apoios; a descoberta se resolve por
posicionamento, não por chamada de atenção.

**Trade-off central.** Trocamos liberdade de reorganizar por preservação de
fluência. Quem constrói perde flexibilidade; quem usa ganha velocidade permanente.
É a mesma troca de toda a Constituição, aplicada ao espaço.

---

## 10. Critérios de verificação

1. Os três estágios são atendidos no mesmo caminho.
2. Nenhuma ação frequente mudou de posição sem emenda e comunicação.
3. Toda ação frequente tem caminho por ponteiro e por teclado.
4. Todo atalho é visível no ponto da ação.
5. Nenhum apoio é obrigatório ou reaparece após dispensado.
6. Nenhum elemento avalia ou pontua o domínio do usuário.
7. Nenhum caminho rápido tem menos proteção que o lento.
8. Toda capacidade é descoberta em uso normal.
9. Toda mudança de padrão teve transição comunicada.
10. Nenhuma tarefa essencial exige conhecimento de fluência.

---

## 11. Checklist do capítulo

- [ ] O iniciante e o veterano usam o mesmo caminho?
- [ ] Não movi nenhuma ação frequente.
- [ ] Existe caminho por teclado com o mesmo resultado.
- [ ] O atalho aparece ao lado da ação.
- [ ] O apoio é dispensável e não volta.
- [ ] O caminho rápido protege tanto quanto o lento.
- [ ] Esta capacidade é descoberta sem documentação.
- [ ] Se mudei um padrão, comuniquei e não deixei as duas formas.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P7, P8), 13 (arquétipos), 14 (execução sem leitura),
15 (reconhecimento).

**É pré-requisito de.** Capítulos 26 (onboarding), 27 (ciclo de vida), 48
(comandos e teclado), 49 (produtividade), 55 (personalização).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Posições estáveis de navegação | `src/components/layout/sidebar.tsx`, `src/components/flows/header.tsx` |
| Caminhos por teclado | Primitivas em `src/components/ui/` (dialog, dropdown, select, tabs) |
| Apoios de aprendizagem | `src/components/ui/contextual-help.tsx`, `src/lib/onboarding/` |
| Ações frequentes do Operador | `src/components/inbox/` |
| Comunicação de mudança | `CHANGELOG.md` |
