# Capítulo 50 — Tempo Real, Presença e Colaboração

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 10, 11, 14, 41, 43, 46 |
| É pré-requisito de | Capítulos 51, 56 |
| Artigos | `FH-50.01` a `FH-50.10` |

---

## 0. Núcleo Normativo

**`FH-50.01`** — **Não-interferência.** Atualização em tempo real **NUNCA** move,
substitui ou remove o elemento que o usuário está manipulando, lendo ou
selecionando (`FH-41.09`).
> **Verificação:** a atualização altera o elemento sob manipulação, leitura ou seleção? → NÃO = cumpre | SIM = viola.

**`FH-50.02`** — Novidade é **anunciada, não imposta**. Conteúdo novo em lista
ativa **DEVE** ser sinalizado com ação para incorporá-lo, e não inserido
automaticamente.
> **Verificação:** conteúdo novo é anunciado com ação, em vez de inserido sozinho? → SIM = cumpre | NÃO = viola.

**`FH-50.03`** — Presença é **informação operacional** e **NUNCA** instrumento de
controle individual (`FH-11.07`).
> **Verificação:** esta informação de presença serve para coordenar o trabalho, e não para julgar a pessoa? → SIM = cumpre | NÃO = viola.

**`FH-50.04`** — Conflito de edição **DEVE** preservar o trabalho de **todos** os
envolvidos. Sobrescrita silenciosa é proibida (`FH-10.01`).
> **Verificação:** em conflito, o trabalho de ambos permanece recuperável? → SIM = cumpre | NÃO = viola.

**`FH-50.05`** — Responsabilidade **DEVE** ser visível: quem está atendendo, quem
está editando, quem é responsável pelo item.
> **Verificação:** é possível saber quem está atuando sobre este item? → SIM = cumpre | NÃO = viola.

**`FH-50.06`** — Ação executada por outra pessoa **DEVE** ser rastreável: quem fez,
o quê e quando (`FH-18.03`).
> **Verificação:** é possível identificar autor, ação e momento? → SIM = cumpre | NÃO = viola.

**`FH-50.07`** — Perda e retomada de conexão **DEVEM** ser visíveis, com
sincronização automática e sem perda de trabalho (`FH-41.07`).
> **Verificação:** a desconexão é visível e a reconexão sincroniza sem perder trabalho? → SIM = cumpre | NÃO = viola.

**`FH-50.08`** — Atividade alheia em andamento é exibida como **sinal**, nunca como
conteúdo. Texto não enviado de outra pessoa **NUNCA** é exibido.
> **Verificação:** algum conteúdo não confirmado de outra pessoa é exibido? → NÃO = cumpre | SIM = viola.

**`FH-50.09`** — Nenhuma funcionalidade colaborativa **PODE** ser reaproveitada
como monitoramento: histórico de presença, tempo de inatividade e registro de
comportamento individual não são exibidos como desempenho (`FH-11.07`).
> **Verificação:** alguma informação colaborativa é apresentada como avaliação individual? → NÃO = cumpre | SIM = viola.

**`FH-50.10`** — A ordem dos eventos exibida **DEVE** ser consistente com a ordem
real. **NUNCA** exibir efeito antes da causa nem reordenar histórico já lido.
> **Verificação:** a ordem exibida corresponde à ordem real dos eventos? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula o comportamento do produto quando **várias pessoas trabalham
sobre os mesmos dados ao mesmo tempo** — condição normal em um sistema de operação
comercial com equipe.

---

## 2. Perguntas que este capítulo responde

- O que atualiza sozinho e o que espera?
- Como evito que a lista pule sob o cursor?
- Como mostro que outra pessoa está no mesmo item?
- Como resolvo conflito de edição?
- Presença é vigilância?

---

## 3. Definições

**Tempo real** — atualização do conteúdo sem ação do usuário.

**Presença** — indicação de que alguém está atuando em determinado contexto.

**Conflito de edição** — duas pessoas alterando o mesmo dado simultaneamente.

**Sinal de atividade** — indicação de que alguém está fazendo algo, sem revelar o
conteúdo.

**Não-interferência** — princípio de que a atualização nunca perturba a manipulação
em curso.

---

## 4. Fundamento

**Por que a não-interferência é a regra central.** Atualização automática é
valiosa até o instante em que ela move o alvo sob o cursor. Nesse momento, o
usuário clica no que não pretendia — e o erro parece dele. Em um sistema onde o
clique errado pode enviar algo a um cliente, isso é inaceitável. `FH-50.01` e
`FH-50.02` resolvem separando **saber que há novidade** de **incorporar a
novidade**: a primeira é automática, a segunda é do usuário.

**Por que presença não é vigilância.** A informação técnica é a mesma; o que muda é a
finalidade e a forma de exibição. "Ana está nesta conversa agora" coordena e evita
resposta duplicada. "Ana ficou inativa 47 minutos hoje" julga. A fronteira de
`FH-11.07` é a finalidade, e `FH-50.09` fecha a porta lateral mais comum:
funcionalidades criadas para coordenar sendo reaproveitadas como métrica de
desempenho individual.

**Por que o conflito preserva os dois lados.** A resolução mais simples — o último
que salva vence — destrói trabalho silenciosamente e viola `FH-10.01`. Como o
usuário que perdeu não é avisado, ele só descobre depois, quando o dado está
errado. Preservar ambos e sinalizar o conflito é mais trabalhoso e é a única
solução compatível com a promessa de preservação.

**Por que conteúdo não confirmado de terceiros não aparece.** Exibir o que outra
pessoa está digitando cria dois problemas: revela rascunho que ela pode não querer
enviar, e produz informação que desaparece — o que confunde o histórico. O sinal
("está escrevendo") transmite o que importa para coordenar sem nenhum dos dois
efeitos.

**Por que a ordem dos eventos é sagrada.** Um histórico que se reordena depois de
lido destrói a capacidade de raciocinar sobre a conversa: o usuário reconstrói o
contexto e chega a conclusões diferentes a cada leitura. Efeito antes da causa —
ver a resposta antes da pergunta — é a forma mais grave, e acontece com
sincronização mal ordenada.

---

## 5. Princípios

**Saber da novidade é automático; incorporá-la é do usuário.**

**A mesma informação coordena ou vigia — a diferença é a finalidade.**

**Conflito não se resolve escolhendo um lado em silêncio.**

**Histórico que se reordena destrói o raciocínio sobre ele.**

---

## 6. Regras normativas

### O que atualiza sozinho e o que espera

| Situação | Comportamento obrigatório |
| --- | --- |
| Item fora da visão do usuário | Atualiza automaticamente |
| Item visível, não manipulado | Atualiza com sinalização discreta |
| Item sob leitura, cursor ou seleção | **Não atualiza**; anuncia (`FH-50.01`) |
| Novo item no topo de lista ativa | Anuncia com contagem e ação (`FH-50.02`) |
| Item removido por outra pessoa | Sinaliza no lugar; nunca some sob o cursor |
| Campo em edição | **Nunca** é sobrescrito (`FH-50.04`) |

### `FH-50.02` — Anúncio de novidade

**Certo.** "3 novas conversas" no topo, com ação para incorporar.

**Errado.** Itens inseridos automaticamente empurrando a lista no instante do
clique — o defeito mais comum de listas em tempo real.

### `FH-50.04` — Conflito de edição

**Certo.** Detectar a divergência, preservar as duas versões e pedir ao usuário que
escolha, mostrando o que difere.

**Errado.** Sobrescrever com a última gravação. Alguém perdeu trabalho e não foi
avisado.

### `FH-50.09` — Colaboração não vira monitoramento

**Certo.** Ver quem está atendendo uma conversa agora, para não duplicar.

**Errado.** Relatório de tempo de atividade individual apresentado como
desempenho. Viola `FH-11.07` e degrada o próprio dado — as pessoas passam a
otimizar a métrica.

---

## 7. Anti-padrões

**Lista saltitante.** Conteúdo novo inserido sob o cursor.

**Sobrescrita silenciosa.** Último a salvar vence, sem aviso.

**Rascunho alheio exposto.** Texto não enviado de outra pessoa visível.

**Presença-vigilância.** Coordenação convertida em avaliação.

**Sumiço sob o dedo.** Item removido por outro usuário desaparecendo no instante do
clique.

**Histórico instável.** Reordenação após leitura.

**Autoria anônima.** Alteração sem indicação de quem fez.

---

## 8. Impactos

**Cognitivo.** Não-interferência preserva a memória de trabalho: o usuário não
precisa reconstruir o contexto depois de cada atualização.

**Emocional.** Sobrescrita silenciosa é uma das experiências mais desmoralizantes
em software colaborativo. Preservar ambos os lados protege a confiança na equipe,
não só no sistema.

**Produtividade.** Presença visível elimina trabalho duplicado — dois atendentes
respondendo a mesma pessoa é desperdício e constrangimento diante do cliente.

**Percepção de qualidade.** Listas estáveis sob atualização são um dos sinais mais
evidentes de engenharia cuidadosa.

**Curva de aprendizagem.** Rastreabilidade de autoria permite entender o que
aconteceu sem perguntar a colegas — reduz a dependência de conhecimento tácito da
equipe.

---

## 9. Riscos e trade-offs

**Risco: informação desatualizada.** Não atualizar o que está sob manipulação pode
manter dado antigo à vista. Mitigação: `FH-41.11` — o estado declara sua defasagem;
o anúncio informa que há novidade.

**Risco: excesso de sinalização.** Anunciar toda mudança gera ruído. Mitigação: P6 e
`FH-43.03` — agrupar e sinalizar de forma proporcional.

**Risco: complexidade de conflito.** Preservar dois lados exige mais que sobrescrever.
Custo assumido: é a promessa de preservação (`FH-10.01`).

**Trade-off central.** Trocamos frescor absoluto do dado por estabilidade da
interface. O usuário pode ver, por alguns segundos, um estado um pouco antigo — e
nunca perde o clique, o contexto ou o trabalho.

---

## 10. Critérios de verificação

1. Nenhuma atualização altera elemento sob manipulação, leitura ou seleção.
2. Conteúdo novo é anunciado com ação, nunca inserido sozinho.
3. Nenhuma informação de presença serve para julgar pessoas.
4. Conflitos preservam o trabalho de todos os envolvidos.
5. É possível saber quem está atuando sobre cada item.
6. Toda ação de terceiros é rastreável em autor, tipo e momento.
7. Desconexão é visível e a reconexão sincroniza sem perda.
8. Nenhum conteúdo não confirmado de outra pessoa é exibido.
9. Nenhuma funcionalidade colaborativa é apresentada como avaliação individual.
10. A ordem exibida corresponde à ordem real dos eventos.

---

## 11. Checklist do capítulo

- [ ] Testei com atualização chegando enquanto eu manipulava a lista.
- [ ] Novidade aparece como anúncio, não como inserção.
- [ ] Consigo ver quem está atuando no item.
- [ ] Simulei conflito de edição: nenhum trabalho se perdeu.
- [ ] Derrubei a conexão: a reconexão sincronizou sem perda.
- [ ] Nenhum rascunho alheio é exibido.
- [ ] Nada aqui pode ser lido como vigilância individual.
- [ ] A ordem dos eventos é estável e causal.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 10 (preservação), 11 (`FH-11.07`), 14 (rede), 41
(estados), 43 (feedback), 46 (desempenho).

**É pré-requisito de.** Capítulos 51 (permissões), 56 (métricas ao usuário).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Presença | `src/lib/presence.ts`, `src/components/presence/` |
| Tempo real | Canais de realtime do Supabase, hooks em `src/hooks/` |
| Atribuição de conversas | `src/components/inbox/`, `src/lib/conversation-boards/` |
| Menções e colaboração | `ConversationMention` em `src/types/index.ts` |
| Rastro de ações | Logs de automação e histórico por entidade |
