# Capítulo 55 — Personalização e Adaptação

| Campo | Valor |
| --- | --- |
| Livro | VI — Inteligência |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 6, 7 (P7), 11, 16, 18, 27, 52 |
| É pré-requisito de | Capítulos 64, 67 |
| Artigos | `FH-55.01` a `FH-55.10` |

---

## 0. Núcleo Normativo

**`FH-55.01`** — **Camadas fixas e adaptáveis.** Estrutura, navegação, posição de
ações e vocabulário **NUNCA** se adaptam sozinhos. Adaptação atua apenas sobre
prioridade, ordem de sugestões e padrões de valor.
> **Verificação:** esta adaptação toca estrutura, navegação, posição ou vocabulário? → NÃO = cumpre | SIM = viola.

**`FH-55.02`** — Adaptação atua por **prioridade e sugestão**, **NUNCA** por
remoção. Nada desaparece porque o sistema julgou irrelevante.
> **Verificação:** algo foi removido da visão por inferência do sistema? → NÃO = cumpre | SIM = viola.

**`FH-55.03`** — **Transparência.** Toda adaptação perceptível **DEVE** ser
identificável: o usuário sabe que houve adaptação e por quê (`FH-06.09`).
> **Verificação:** é possível saber que houve adaptação e qual foi o critério? → SIM = cumpre | NÃO = viola.

**`FH-55.04`** — Toda adaptação é **reversível** em um passo, e a reversão persiste
(`FH-18.05`).
> **Verificação:** é possível desfazer a adaptação em um passo, de forma duradoura? → SIM = cumpre | NÃO = viola.

**`FH-55.05`** — Os três escopos — **pessoa, papel e conta** — têm regras próprias e
**NUNCA** se confundem. Adaptação de escopo pessoal jamais altera o que outros
veem.
> **Verificação:** o escopo da adaptação está declarado e respeitado? → SIM = cumpre | NÃO = viola.

**`FH-55.06`** — **Preferência explícita vence inferência**, sempre. O que o usuário
declarou **NUNCA** é sobreposto pelo que o sistema inferiu.
> **Verificação:** alguma inferência sobrepôs uma preferência declarada? → NÃO = cumpre | SIM = viola.

**`FH-55.07`** — Adaptação **NUNCA** cria diferença de **capacidade** entre
usuários. Todos podem fazer as mesmas coisas; o que varia é a ordem em que as
coisas aparecem.
> **Verificação:** a adaptação altera o que o usuário consegue fazer? → NÃO = cumpre | SIM = viola.

**`FH-55.08`** — **NUNCA** há adaptação silenciosa em elemento de memória motora —
posição de ações frequentes, ordem de colunas, atalhos (`FH-16.02`, `FH-36.08`).
> **Verificação:** algum elemento de memória motora mudou por inferência? → NÃO = cumpre | SIM = viola.

**`FH-55.09`** — Adaptação **NUNCA** usa dados de terceiros — os contatos do
cliente — para construir perfil comportamental (`FH-11.04`, `FH-11.05`).
> **Verificação:** a adaptação usa dado de terceiro para perfilar? → NÃO = cumpre | SIM = viola.

**`FH-55.10`** — O **estado inicial é idêntico para todos**. Nenhuma conta nova
recebe experiência diferente por inferência de segmento ou porte (`FH-20.06`,
`FH-27.03`).
> **Verificação:** contas novas recebem o mesmo estado inicial? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula **como o sistema aprende o usuário** — cumprindo a tese do
Capítulo 6 sem violar a previsibilidade do Capítulo 18. É o capítulo que resolve a
tensão mais delicada da Constituição.

---

## 2. Perguntas que este capítulo responde

- O que o sistema pode mudar sozinho?
- O que nunca muda de lugar?
- Como o usuário percebe que algo mudou?
- Como ele desfaz uma adaptação?
- Como equilibro "aprender o usuário" com "não surpreender o usuário"?

---

## 3. Definições

**Adaptação** — mudança de comportamento baseada em observação.

**Preferência explícita** — escolha declarada pelo usuário.

**Inferência** — conclusão do sistema a partir de comportamento observado.

**Camada fixa** — parte do produto que nunca se adapta.

**Camada adaptável** — parte que pode variar por relevância.

**Escopo** — alcance da adaptação: pessoa, papel ou conta.

---

## 4. Fundamento

**A tensão que este capítulo resolve.** O Capítulo 6 exige que o sistema aprenda como
o usuário trabalha; o Capítulo 18 exige previsibilidade absoluta. Levadas ao
extremo, as duas se excluem: um sistema que aprende muda, e mudança não solicitada
é surpresa. A arbitragem já estava registrada em `FH-03.09` — previsibilidade vence
personalização **em estrutura** —, e este capítulo a operacionaliza separando o que
pode variar do que não pode.

**Por que estrutura é intocável.** A localização das coisas é memória motora
(`FH-16.02`) e âncora do modelo mental (`FH-20`). Reordenar a navegação por
relevância inferida entrega um ganho pequeno — um item mais perto — em troca de um
custo grande: a destruição da fluência construída por repetição. Além disso,
estrutura variável impede que usuários se ajudem entre si, porque cada um vê um
produto diferente.

**Por que adaptar por prioridade, e não por remoção.** Priorizar é reversível pela
simples busca; remover exige que o usuário saiba que algo existe e onde procurar.
Como a inferência erra, a remoção transforma erro do sistema em capacidade perdida
para o usuário.

**Por que preferência explícita vence inferência.** Quando o usuário declarou algo,
ele já respondeu à pergunta que a inferência tenta adivinhar. Sobrepor sua
declaração comunica que o sistema sabe melhor — e é a forma mais rápida de destruir
a confiança construída no Capítulo 18.

**Por que os escopos não se confundem.** Adaptação pessoal que altera o que a equipe
vê produz confusão em colaboração (`FH-50`): duas pessoas discutindo a mesma tela
veem coisas diferentes. Adaptação de conta que altera preferências pessoais
sobrepõe escolhas legítimas. A separação é o que torna a adaptação segura em
ambiente multiusuário.

**Por que dado de terceiro não perfila.** Os contatos do cliente não escolheram
estar aqui e não consentiram com perfilamento comportamental (`FH-11`). Usar seus
dados para adaptar a experiência do usuário é tratá-los como matéria-prima de um
produto do qual não participam.

**Por que o estado inicial é igual para todos.** Inferir segmento ou porte no
primeiro acesso significa decidir, sem informação, que tipo de produto aquela
pessoa deve ver. Erros aí são caros e invisíveis: o usuário nunca saberá o que
deixou de ver.

---

## 5. Camadas fixas e adaptáveis

| Camada | Adapta? | Justificativa |
| --- | --- | --- |
| Modelo mental e ontologia | **Nunca** | `FH-20.06`, `FH-21.02` |
| Navegação e sua ordem | **Nunca** | `FH-16.02`, `FH-22.09` |
| Posição de ações | **Nunca** | `FH-16.02` |
| Vocabulário | **Nunca** | `FH-05.10` |
| Ordem de colunas | **Nunca** por inferência | `FH-36.08` |
| Ordem de resultados de busca | **Sim**, por relevância declarável | `FH-47.03` |
| Ordem de sugestões da IA | **Sim** | `FH-53.06` |
| Valores padrão de formulário | **Sim**, se reversíveis | `FH-06.04`, `FH-15.07` |
| Destaque de itens prováveis | **Sim**, sem remover os demais | `FH-55.02` |
| Ofertas e próximos passos | **Sim** | `FH-25.02` |

**Regra de leitura.** Se a adaptação muda **onde algo está**, é proibida. Se muda
**o que aparece primeiro**, é permitida — com transparência e reversão.

---

## 6. Regras normativas

### `FH-55.03` — Transparência da adaptação

**Certo.** "Ordenado pelos que você mais usa" — com opção de voltar à ordem padrão.

**Errado.** Reordenar em silêncio. O usuário percebe que "mudou" e não sabe o quê,
por quê, nem como voltar.

### `FH-55.05` — Escopos

| Escopo | Quem afeta | Exemplo legítimo |
| --- | --- | --- |
| **Pessoa** | Apenas quem escolheu | Preferência de tema, densidade, ordenação pessoal |
| **Papel** | Todos com o mesmo papel | Conjunto de capacidades disponíveis (`FH-51`) |
| **Conta** | Todos da conta | Configuração de canal, funis, etiquetas |

**Nunca:** adaptação de escopo pessoal alterando o que outros veem, nem adaptação
de conta sobrepondo preferência pessoal.

### `FH-55.06` — Precedência

Ordem obrigatória: **preferência explícita > padrão da conta > inferência do
sistema**. A inferência só atua onde não há declaração.

---

## 7. Anti-padrões

**Navegação inteligente.** Menu que se reordena por uso.

**Ocultação por relevância.** Sistema escondendo o que julgou pouco usado.

**Adaptação muda.** Mudança percebida sem explicação.

**Reversão temporária.** Desfazer que volta a ser sobreposto na sessão seguinte.

**Escopo vazado.** Preferência pessoal alterando a visão da equipe.

**Inferência soberana.** Sistema ignorando o que o usuário declarou.

**Perfil de terceiro.** Dados de contatos alimentando adaptação.

**Boas-vindas segmentada.** Experiência inicial diferente por porte inferido.

---

## 8. Impactos

**Cognitivo.** Manter estrutura fixa preserva a memória espacial; adaptar
prioridade reduz a busca. A combinação entrega o ganho sem o custo.

**Emocional.** Adaptação transparente é percebida como atenção; adaptação silenciosa
é percebida como perda de controle — o mesmo evento, sinais opostos.

**Produtividade.** Padrões que refletem escolhas anteriores eliminam decisões
repetidas (`FH-15.07`), sem custo de reaprendizado.

**Percepção de qualidade.** É onde o produto demonstra a tese do Capítulo 6: o
sistema aprendeu o usuário sem que ele precisasse configurar nada.

**Curva de aprendizagem.** Estrutura estável permite que o conhecimento seja
transferido entre pessoas — um usuário ensina o outro porque veem o mesmo produto.

---

## 9. Riscos e trade-offs

**Risco: adaptação insuficiente.** Restringir tanto pode tornar o sistema estático.
Mitigação: a camada adaptável cobre onde o ganho é real — sugestões, padrões,
prioridade.

**Risco: inferência errada.** Ordenar por relevância pode enterrar o que importa.
Mitigação: `FH-55.02` proíbe remoção — o item continua alcançável.

**Risco: complexidade de escopo.** Três escopos exigem disciplina. Mitigação:
`FH-55.05` exige declaração explícita do escopo.

**Trade-off central.** Trocamos personalização profunda por previsibilidade
compartilhada. O produto se adapta menos do que poderia — e continua sendo o mesmo
produto para todos que trabalham juntos.

---

## 10. Critérios de verificação

1. Nenhuma adaptação toca estrutura, navegação, posição ou vocabulário.
2. Nenhuma adaptação remove itens da visão.
3. Toda adaptação perceptível é identificável e explicada.
4. Toda adaptação é reversível em um passo, de forma duradoura.
5. O escopo de cada adaptação está declarado e é respeitado.
6. Nenhuma inferência sobrepõe preferência explícita.
7. Nenhuma adaptação altera capacidade entre usuários.
8. Nenhum elemento de memória motora muda por inferência.
9. Nenhum dado de terceiro alimenta perfilamento.
10. Todas as contas novas recebem o mesmo estado inicial.

---

## 11. Checklist do capítulo

- [ ] Esta adaptação muda **onde** algo está? Se sim, é proibida.
- [ ] Nada sumiu por decisão do sistema.
- [ ] O usuário sabe que houve adaptação e por quê.
- [ ] Desfazer leva um passo e persiste.
- [ ] O escopo está declarado.
- [ ] O que o usuário declarou prevalece.
- [ ] Nenhum dado de contato alimenta perfil.
- [ ] Contas novas começam iguais.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 6 (`FH-06.09`, `FH-06.11`), 7 (P7), 11 (privacidade), 16
(`FH-16.02`), 18 (`FH-18.05`, `FH-18.11`), 27 (`FH-27.03`), 52 (IA).

**É pré-requisito de.** Capítulos 64 (métricas), 67 (evolução).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Preferências pessoais | Tema e modo em `src/lib/themes.ts`, `src/app/(dashboard)/settings/` |
| Padrões de conta | Configurações em `src/app/(dashboard)/settings/` |
| Ordenação por relevância | Listas e busca por domínio |
| Sugestões da IA | `src/lib/ai-service/`, `src/components/ai/` |
| Escopo por papel | Hooks de permissão em `src/hooks/` |
