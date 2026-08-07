# Capítulo 42 — Estados Vazios

| Campo | Valor |
| --- | --- |
| Livro | V — Comportamento do Sistema |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 17, 26, 27, 41 |
| É pré-requisito de | Capítulos 47, 51, 58 |
| Artigos | `FH-42.01` a `FH-42.10` |

---

## 0. Núcleo Normativo

**`FH-42.01`** — Existem **cinco tipos de vazio** (§5), e cada um **DEVE** receber
tratamento distinto. Tratar todos igual é violação.
> **Verificação:** o tipo de vazio foi identificado e recebeu tratamento próprio? → SIM = cumpre | NÃO = viola.

**`FH-42.02`** — Todo estado vazio **DEVE** responder três perguntas: **o que é este
lugar**, **por que está vazio** e **o que fazer agora**.
> **Verificação:** as três perguntas estão respondidas? → SIM = cumpre | NÃO = viola.

**`FH-42.03`** — Vazio **inaugural** **DEVE** oferecer a ação primária ali mesmo, sem
exigir navegação.
> **Verificação:** a ação primária está disponível no próprio estado vazio? → SIM = cumpre | NÃO = viola.

**`FH-42.04`** — Vazio por **filtro** **DEVE** exibir o filtro aplicado e oferecer
removê-lo em um passo.
> **Verificação:** o filtro está visível e removível em um passo? → SIM = cumpre | NÃO = viola.

**`FH-42.05`** — Vazio por **conclusão** — não há nada porque tudo foi resolvido —
**NUNCA** pode parecer erro, falta ou falha.
> **Verificação:** o vazio por conclusão é visualmente distinto do vazio por ausência? → SIM = cumpre | NÃO = viola.

**`FH-42.06`** — **NUNCA** existe vazio decorativo: ilustração, frase ou ícone sem
caminho de ação ou sem informação útil é proibido.
> **Verificação:** este vazio oferece ação ou informação útil? → SIM = cumpre | NÃO = viola.

**`FH-42.07`** — Estado vazio **NUNCA** culpa, cobra ou sugere que o usuário deixou
de fazer algo (`FH-17.04`, `FH-06.06`).
> **Verificação:** o texto atribui ao usuário a responsabilidade pelo vazio? → NÃO = cumpre | SIM = viola.

**`FH-42.08`** — O vazio **DEVE** ensinar o modelo: explicar o que aparecerá ali e
como aquilo se relaciona com o restante (`FH-26.05`).
> **Verificação:** o vazio explica o que aparecerá ali e de onde virá? → SIM = cumpre | NÃO = viola.

**`FH-42.09`** — Vazio **NUNCA** simula conteúdo: esqueleto permanente, dados
fantasma ou espaço reservado que parece dado são proibidos (`FH-07.10`,
`FH-27.02`).
> **Verificação:** algum elemento do vazio pode ser confundido com conteúdo real? → NÃO = cumpre | SIM = viola.

**`FH-42.10`** — Vazio **NUNCA** revela o que existiria se houvesse permissão ou
acesso (`FH-10.06`, `FH-51`).
> **Verificação:** o vazio revela existência de dado inacessível? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo transforma **ausência de dado em orientação**. O estado vazio é o
primeiro que todo usuário novo encontra e o que a equipe menos vê — e é, por isso,
o de maior desproporção entre importância e atenção recebida.

---

## 2. Perguntas que este capítulo responde

- O que mostrar quando não há nada?
- Como distingo "nunca teve" de "filtro não achou" de "tudo resolvido"?
- O que ofereço ali?
- Posso usar uma ilustração?
- O vazio pode ensinar?

---

## 3. Definições

**Vazio inaugural** — nunca houve conteúdo ali.

**Vazio por filtro** — há conteúdo, mas nenhum corresponde ao critério aplicado.

**Vazio por conclusão** — não há nada pendente porque tudo foi tratado.

**Vazio por permissão** — há conteúdo, mas este usuário não pode vê-lo.

**Vazio por falha** — não foi possível carregar. Tecnicamente é erro (Capítulo 44),
mas aparece no mesmo lugar e por isso integra o catálogo.

---

## 4. Fundamento

**Por que cinco tipos e não um.** Os cinco têm causas opostas e exigem respostas
opostas. Tratar todos como "nada aqui" produz confusão em quatro deles: o usuário
não sabe se deve criar algo, ajustar o filtro, comemorar, pedir acesso ou tentar de
novo. O custo de distinguir é baixo — muda o texto e a ação — e o benefício é a
diferença entre orientação e desorientação.

**Por que o vazio inaugural é o mais importante.** É o primeiro contato do usuário
com aquela área do produto. Se ele explica o que aquilo é e oferece o caminho, o
usuário aprende o modelo sem tutorial (`FH-26.01`). Se está em branco, o usuário
conclui que a área é inútil ou que o sistema está quebrado — e não volta.

**Por que "tudo concluído" precisa parecer diferente.** É o único vazio que
representa sucesso. Exibi-lo com a mesma aparência de "não há nada" transforma uma
conquista em sensação de vácuo. Para o Operador, chegar ao fim da fila é o objetivo
do dia — e o produto deve reconhecê-lo com discrição (`FH-09.04`), não ignorá-lo.

**Por que vazio decorativo é proibido.** Ilustrações em estados vazios são a forma
mais comum de confundir estética com utilidade. Elas ocupam o espaço onde deveria
estar a resposta às três perguntas de `FH-42.02` e não reduzem a desorientação —
apenas a tornam mais agradável de olhar. `FH-42.06` não proíbe elemento visual;
proíbe elemento visual **em lugar de** caminho.

**Por que o vazio não pode culpar.** "Você ainda não criou nenhum contato" e "Seus
contatos aparecerão aqui" carregam a mesma informação e produzem sensações
opostas. O primeiro atribui uma omissão; o segundo descreve o lugar. Como o vazio é
o primeiro contato, essa escolha define o tom da relação.

**Por que o vazio não pode revelar.** Um vazio que diz "você não tem permissão para
ver os 47 registros desta conta" acabou de revelar que existem 47 registros —
informação que o usuário não deveria ter. Este é o caso mais sutil de violação de
`FH-10.06`, e o mais comum.

---

## 5. Os cinco tipos e seus tratamentos

| Tipo | Causa | O que dizer | O que oferecer |
| --- | --- | --- | --- |
| **Inaugural** | Nunca houve nada | O que é este lugar e o que aparecerá aqui | Ação primária, ali mesmo |
| **Por filtro** | Critério não encontrou | Qual filtro está aplicado | Remover o filtro em um passo; ajustar o critério |
| **Por conclusão** | Tudo foi tratado | Que está tudo em dia | Nada obrigatório; reconhecimento discreto |
| **Por permissão** | Sem acesso | Que é necessário acesso, sem revelar o que existe | Caminho para solicitar (`FH-51`) |
| **Por falha** | Não foi possível carregar | O que houve, sem detalhe técnico | Tentar novamente (`FH-44`) |

### `FH-42.02` — As três perguntas

**Certo (inaugural).** "Suas conversas aparecerão aqui. Elas começam quando alguém
entra em contato por um dos seus canais." + ação de conectar canal.

**Errado.** "Nenhuma conversa." Responde apenas a segunda pergunta, e mal.

### `FH-42.04` — Vazio por filtro

**Certo.** "Nenhum contato com estas etiquetas." + filtro visível + "Limpar
filtros".

**Errado.** Mesma tela do vazio inaugural, oferecendo criar um contato — quando o
usuário tem milhares e apenas filtrou errado.

### `FH-42.05` — Vazio por conclusão

**Certo.** "Nenhuma conversa aguardando resposta." Tom neutro-positivo, sem
convite a criar nada.

**Errado.** "Nada aqui" com ilustração de caixa vazia — o usuário zerou a fila e o
produto exibe um vazio de fracasso.

---

## 6. Regras normativas

### `FH-42.03` — Ação no lugar

**Quando NÃO aplicar.** Quando a ação primária depende de permissão que o usuário
não tem — aí aplica-se `FH-42.10` e o tratamento por permissão.

### `FH-42.06` — Nada decorativo

**Quando NÃO aplicar.** Elemento visual **acompanhando** informação e ação é
permitido, desde que não ocupe o lugar delas nem viole `FH-09.02` em contexto
adverso.

### `FH-42.09` — Sem simulação

**Errado.** Esqueleto de carregamento que permanece indefinidamente quando não há
dado. O usuário espera por algo que nunca virá — e essa é a pior forma de estado
indefinido (`FH-41.03`).

### `FH-42.10` — Sem revelação

**Certo.** "Você não tem acesso a esta área. Solicitar acesso ao responsável pela
conta."

**Errado.** Qualquer texto que informe quantidade, nomes ou existência do conteúdo
inacessível.

---

## 7. Anti-padrões

**Vazio genérico.** Um só tratamento para os cinco tipos.

**Vazio decorativo.** Ilustração no lugar da resposta.

**Vazio acusatório.** Texto que atribui omissão ao usuário.

**Vazio de fracasso na conclusão.** Fila zerada apresentada como falta.

**Vazio mudo.** "Nenhum resultado." e nada mais.

**Esqueleto eterno.** Carregamento que nunca termina porque não há dado.

**Vazio indiscreto.** Revelação de conteúdo inacessível.

---

## 8. Impactos

**Cognitivo.** O vazio bem construído ensina o modelo mental sem exigir leitura de
documentação — é a forma mais barata de instrução que existe.

**Emocional.** Determina o tom do primeiro contato com cada área. Vazio acusatório
produz culpa; vazio orientador produz competência percebida.

**Produtividade.** `FH-42.04` resolve o caso mais frequente e mais frustrante:
filtro mal aplicado interpretado como ausência de dados.

**Percepção de qualidade.** Estados vazios cuidados são um dos sinais mais
confiáveis de produto maduro, justamente porque são o que a maioria negligencia.

**Curva de aprendizagem.** Para o usuário novo, o vazio inaugural **é** o
onboarding daquela área.

---

## 9. Riscos e trade-offs

**Risco: verbosidade.** Responder três perguntas pode gerar texto longo demais.
Mitigação: as regras de microcopy (Capítulo 58) limitam a extensão — três
perguntas não significam três parágrafos.

**Risco: excesso de convite à ação.** Todo vazio oferecendo criar algo vira
insistência. Mitigação: apenas o vazio inaugural oferece ação primária; conclusão
não oferece nada.

**Risco: custo de projeto.** Cinco tratamentos por lista é trabalho. Mitigação: o
tratamento é canônico e reutilizável (`FH-41.10`) — muda o texto, não a estrutura.

**Trade-off central.** Trocamos economia de desenho por orientação em um momento
crítico. Estados vazios custam tempo de projeto para telas que "não têm nada" — e é
exatamente onde o usuário mais precisa de ajuda.

---

## 10. Critérios de verificação

1. O tipo de vazio é identificado e tratado de forma própria.
2. As três perguntas estão respondidas.
3. O vazio inaugural oferece a ação primária no próprio lugar.
4. O vazio por filtro exibe e permite remover o filtro em um passo.
5. O vazio por conclusão é visualmente distinto e não parece falha.
6. Nenhum vazio é puramente decorativo.
7. Nenhum texto de vazio culpa ou cobra o usuário.
8. Todo vazio explica o que aparecerá ali.
9. Nenhum vazio simula conteúdo.
10. Nenhum vazio revela dado inacessível.

---

## 11. Checklist do capítulo

- [ ] Identifiquei qual dos cinco tipos é este.
- [ ] Respondi: o que é este lugar, por que está vazio, o que fazer agora.
- [ ] O inaugural traz a ação primária junto.
- [ ] O de filtro mostra o filtro e permite limpá-lo.
- [ ] O de conclusão não parece erro.
- [ ] Não há ilustração no lugar do caminho.
- [ ] Nenhum texto culpa o usuário.
- [ ] Nada revela conteúdo inacessível.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 17 (emoção), 26 (aprendizado no uso), 27 (estado
inaugural), 41 (catálogo de estados).

**É pré-requisito de.** Capítulos 47 (busca sem resultado), 51 (permissões), 58
(microcopy).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Estados vazios de listas | Componentes de cada domínio em `src/components/` |
| Textos de vazio | `src/i18n/messages/pt-BR.json` |
| Estado inaugural da conta | `src/app/(dashboard)/welcome/`, `src/lib/onboarding/` |
| Vazio por permissão | `src/components/ui/gated-button.tsx`, guards de rota |
| Busca sem resultado | Componentes de busca por domínio |
