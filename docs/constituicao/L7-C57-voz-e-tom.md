# Capítulo 57 — Voz, Tom e Personalidade Verbal

| Campo | Valor |
| --- | --- |
| Livro | VII — Linguagem |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 9, 11, 17, 40, 52 |
| É pré-requisito de | Capítulos 58, 59, 60 |
| Artigos | `FH-57.01` a `FH-57.10` |

---

## 0. Núcleo Normativo

**`FH-57.01`** — A **voz é constante**; o **tom varia** conforme a situação. Os
cinco traços de `FH-09.01` valem em qualquer texto do produto.
> **Verificação:** este texto é compatível com os cinco traços? → SIM = cumpre | NÃO = viola.

**`FH-57.02`** — O usuário é tratado em **segunda pessoa direta**, sem formalidade
cerimoniosa nem informalidade forçada.
> **Verificação:** o texto fala com o usuário de forma direta e adulta? → SIM = cumpre | NÃO = viola.

**`FH-57.03`** — Todo texto é escrito da **perspectiva do usuário**, não do sistema.
O que interessa é o que ele consegue ou não fazer, não o que o sistema conseguiu ou
não executar.
> **Verificação:** o texto fala do trabalho do usuário, e não do funcionamento interno? → SIM = cumpre | NÃO = viola.

**`FH-57.04`** — **Sobriedade proporcional à gravidade**: quanto pior o momento,
menor a expressividade verbal (`FH-09.02`, `FH-17.03`).
> **Verificação:** a expressividade aumentou em momento adverso? → NÃO = cumpre | SIM = viola.

**`FH-57.05`** — Linguagem publicitária é **proibida dentro do produto**:
superlativos, adjetivos de venda, chamadas persuasivas e autoelogio (`FH-09.03`).
> **Verificação:** o texto vende algo em vez de informar? → NÃO = cumpre | SIM = viola.

**`FH-57.06`** — Emoji **NUNCA** substitui palavra nem carrega significado sozinho, e
**NUNCA** aparece em erro, limite, cobrança ou perda.
> **Verificação:** existe emoji carregando significado ou em contexto adverso? → NÃO = cumpre | SIM = viola.

**`FH-57.07`** — Exclamação é **proibida** em erro, limite, confirmação e ação
destrutiva. Fora desses contextos, é usada com parcimônia.
> **Verificação:** há exclamação em contexto adverso ou de decisão? → NÃO = cumpre | SIM = viola.

**`FH-57.08`** — **Sem humor onde há dano** (`FH-09.05`). Leveza é permitida apenas
onde não há risco, erro, custo ou frustração.
> **Verificação:** há tom leve em contexto de dano? → NÃO = cumpre | SIM = viola.

**`FH-57.09`** — A voz da **IA é a voz do produto**. Texto gerado segue as mesmas
regras deste capítulo (`FH-09.06`, `FH-53.08`).
> **Verificação:** o texto gerado segue a mesma voz da interface? → SIM = cumpre | NÃO = viola.

**`FH-57.10`** — Dentro do produto, o sistema **NUNCA** se personifica em primeira
pessoa. Ele descreve fatos e ações, não a si mesmo (`FH-09.03`, `FH-09.07`).
> **Verificação:** o texto personifica o sistema? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo define **como o FlowHub fala** em qualquer situação. Ele converte a
personalidade do Capítulo 9 em regras verbais aplicáveis a qualquer texto —
interface, e-mail, notificação e conteúdo gerado por IA.

---

## 2. Perguntas que este capítulo responde

- Trato o usuário por você?
- Como falo em erro, sucesso, espera, cobrança e recusa?
- Uso humor? Emoji? Exclamação?
- O sistema pode falar de si mesmo?
- A IA fala igual à interface?

---

## 3. Definições

**Voz** — o conjunto permanente de traços que caracteriza a comunicação.

**Tom** — a variação da voz conforme a situação.

**Perspectiva do usuário** — redação centrada no que ele faz e obtém.

**Linguagem publicitária** — texto que persuade em vez de informar.

**Personificação** — atribuir ao sistema identidade, vontade ou sentimento.

---

## 4. Fundamento

**Por que voz constante e tom variável.** A voz é caráter; o tom é
circunstância. Uma pessoa séria não deixa de ser séria ao dar uma boa notícia — ela
apenas fala diferente. Quando a voz muda entre áreas, o usuário percebe entidades
diferentes falando com ele, e a confiança se fragmenta (`FH-09.06`).

**Por que perspectiva do usuário.** "O sistema não conseguiu processar a
solicitação" descreve o funcionamento interno; "Não foi possível salvar suas
alterações" descreve o que aconteceu com o trabalho dele. A primeira exige tradução
mental e comunica que o produto é o protagonista; a segunda é imediatamente
acionável. É a aplicação direta de P1 — a complexidade interna não vaza, nem pelo
texto.

**Por que linguagem publicitária é proibida dentro do produto.** O usuário já
comprou. Persuadi-lo enquanto ele trabalha consome atenção que pertence à tarefa e
compromete a credibilidade dos textos que realmente importam — quando o produto
avisa algo urgente, ele precisa ser lido como informação, não como promoção.

**Por que emoji e exclamação são restritos.** Ambos carregam intensidade emocional,
e intensidade em momento adverso é lida como insensibilidade (`FH-09.02`). Emoji
tem um problema adicional: seu significado varia entre culturas e plataformas, e
seu conteúdo não é acessível de forma confiável a leitores de tela — o que colide
com `FH-38.09` quando ele carrega significado sozinho.

**Por que o sistema não se personifica.** Textos em primeira pessoa criam a
expectativa de um interlocutor que não existe. Além de gerar constrangimento leve,
essa expectativa é explorada por padrões que a Constituição já proíbe: um sistema
que "sente muito" está simulando emoção (`FH-09.07`) e frequentemente evitando
dizer o que de fato aconteceu.

**Por que a IA fala igual.** Para o usuário, tudo que aparece na tela é o produto
falando. Se o texto gerado tiver outra voz — mais entusiasmada, mais formal, mais
prolixa —, o usuário percebe duas entidades e passa a desconfiar de qual está
falando em cada momento (`FH-53.04` resolve a marcação; este artigo resolve a
voz).

---

## 5. Princípios

**Voz é caráter; tom é circunstância.**

**Fale do trabalho dele, não do funcionamento seu.**

**Quanto pior o momento, menos palavras.**

**O produto informa; ele não vende para quem já comprou.**

---

## 6. Regras normativas

### Tom por situação (`FH-57.01`)

| Situação | Tom | O que evitar |
| --- | --- | --- |
| Trabalho rotineiro | Neutro, econômico | Comentário desnecessário |
| Sucesso comum | Silêncio (`FH-43.06`) | Parabenizar o trivial |
| Conquista real | Reconhecimento breve | Celebração inflada |
| Espera | Informativo | Pedido de paciência |
| Erro | Factual e resolutivo | Desculpa, humor, ilustração |
| Limite atingido | Factual, com alternativa | Pressão comercial |
| Recusa por permissão | Explicativo e neutro | Linguagem de falha |
| Vazio inaugural | Orientador, levemente acolhedor | Cobrança, tutela |

### `FH-57.03` — Perspectiva

**Certo.** "Não foi possível enviar para 3 contatos. Eles não têm telefone
válido."

**Errado.** "O sistema falhou ao processar 3 registros do lote."

### `FH-57.05` — Sem publicidade interna

**Certo.** "Automações executam ações quando uma condição acontece."

**Errado.** "Descubra o poder incrível das nossas automações inteligentes!"

### `FH-57.10` — Sem personificação

**Certo.** "Não foi possível concluir. Tente novamente."

**Errado.** "Eu não consegui fazer isso agora, desculpe!"

---

## 7. Anti-padrões

**Voz por área.** Cada domínio com um estilo verbal.

**Perspectiva do sistema.** Textos que descrevem o funcionamento interno.

**Publicidade interna.** Persuasão dentro do fluxo de trabalho.

**Entusiasmo no desastre.** Exclamação e emoji em erro.

**Empatia performática.** Sistema pedindo desculpas.

**Tutela.** Explicação não solicitada sobre o que o usuário acabou de fazer.

**IA com voz própria.** Texto gerado destoando da interface.

---

## 8. Impactos

**Cognitivo.** Perspectiva do usuário elimina a tradução mental entre o que o
sistema diz e o que aconteceu com o trabalho.

**Emocional.** O tom em momento adverso é o que o usuário lembra — é aqui que o
Capítulo 17 se materializa em palavras.

**Produtividade.** Textos econômicos e diretos reduzem o tempo de leitura em
elementos que aparecem centenas de vezes por dia.

**Percepção de qualidade.** Voz consistente é lida como maturidade; oscilação de
tom, como falta de cuidado.

**Curva de aprendizagem.** Voz previsível permite ao usuário calibrar rapidamente o
que é importante e o que é rotineiro.

---

## 9. Riscos e trade-offs

**Risco: frieza.** Sobriedade pode parecer distante. Mitigação: o traço
*respeitoso* — direto não é seco; o calor se expressa em utilidade.

**Risco: rigidez.** Proibir emoji e exclamação limita expressividade. Trade-off
assumido: expressividade cansa com a repetição; clareza não.

**Risco: uniformidade excessiva.** Todos os textos parecidos. Mitigação: o tom
varia por situação — a tabela de §6 cobre oito contextos distintos.

**Trade-off central.** Trocamos personalidade marcante por confiabilidade verbal. O
produto fala menos e é levado mais a sério quando fala.

---

## 10. Critérios de verificação

1. Todo texto é compatível com os cinco traços.
2. O usuário é tratado de forma direta e adulta.
3. Todo texto fala do trabalho dele, não do sistema.
4. A expressividade diminui nos momentos adversos.
5. Nenhum texto interno é publicitário.
6. Nenhum emoji carrega significado ou aparece em contexto adverso.
7. Nenhuma exclamação aparece em erro, limite ou decisão.
8. Nenhum humor aparece onde há dano.
9. Textos gerados por IA seguem a mesma voz.
10. O sistema não se personifica.

---

## 11. Checklist do capítulo

- [ ] O texto fala do trabalho do usuário.
- [ ] O tom corresponde à situação da tabela.
- [ ] Nada de exclamação ou emoji em erro, limite ou confirmação.
- [ ] Nenhuma frase vende algo.
- [ ] O sistema não fala de si mesmo nem pede desculpas.
- [ ] O texto gerado por IA soa igual ao resto do produto.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 9 (personalidade), 11 (ética), 17 (emoção), 40
(notificação), 52–53 (IA).

**É pré-requisito de.** Capítulos 58 (microcopy), 59 (nomenclatura), 60 (i18n).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Textos de interface | `src/i18n/messages/pt-BR.json` |
| Mensagens de sistema | `src/components/themed-toaster.tsx` |
| Textos de erro | Chave `errors` em `src/i18n/messages/pt-BR.json` |
| Texto gerado por IA | `src/lib/ai-service/` |
| Comunicações externas | Modelos de e-mail e notificação em `src/app/api/` |
