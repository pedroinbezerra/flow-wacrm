# Capítulo 65 — Governança da Experiência

| Campo | Valor |
| --- | --- |
| Livro | VIII — Governança |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 1, 2, 3, 4, 61, 62, 63 |
| É pré-requisito de | Capítulos 66, 67, 68 |
| Artigos | `FH-65.01` a `FH-65.10` |

---

## 0. Núcleo Normativo

**`FH-65.01`** — As **alçadas de decisão** (§5) são declaradas. Nenhuma decisão de
experiência é tomada fora da alçada correspondente.
> **Verificação:** a decisão foi tomada dentro da alçada declarada? → SIM = cumpre | NÃO = viola.

**`FH-65.02`** — Toda decisão de experiência **DEVE** ser registrada com autor,
data, artigos e fundamento (`FH-01.08`, `FH-03.08`).
> **Verificação:** existe registro com autor, data, artigos e fundamento? → SIM = cumpre | NÃO = viola.

**`FH-65.03`** — Ausência de dono **NUNCA** autoriza improviso. Aplica-se o fallback
(§0.11) e registra-se a lacuna.
> **Verificação:** não havendo dono, o fallback foi aplicado e registrado? → SIM = cumpre | NÃO = viola.

**`FH-65.04`** — A **escalada** segue caminho declarado: executor → revisor →
alçada superior → emenda. Pular etapas é proibido.
> **Verificação:** a escalada seguiu o caminho declarado? → SIM = cumpre | NÃO = viola.

**`FH-65.05`** — Decisão que se repita **DEVE** virar precedente registrado ou
artigo (`FH-02.06`, `FH-02.10`).
> **Verificação:** decisões recorrentes viraram precedente ou artigo? → SIM = cumpre | NÃO = viola.

**`FH-65.06`** — Toda entrega com efeito perceptível **DEVE** passar por revisão de
segunda pessoa ou segundo agente, com checklist (`FH-63.06`).
> **Verificação:** houve revisão independente com checklist? → SIM = cumpre | NÃO = viola.

**`FH-65.07`** — **Quem propõe não aprova sozinho.** Aprovação da própria proposta é
proibida em decisões de alçada 2 ou superior.
> **Verificação:** a aprovação foi dada por alguém diferente de quem propôs? → SIM = cumpre | NÃO = viola.

**`FH-65.08`** — Prazo, urgência ou pressão comercial **NUNCA** alteram a alçada
necessária (`FH-01.03`, `FH-03.07`).
> **Verificação:** a alçada foi reduzida por urgência? → NÃO = cumpre | SIM = viola.

**`FH-65.09`** — Toda exceção tem **responsável nomeado** e prazo (`FH-04.06`).
Exceção coletiva ou anônima é inválida.
> **Verificação:** a exceção tem pessoa nomeada e prazo? → SIM = cumpre | NÃO = viola.

**`FH-65.10`** — A governança se aplica **igualmente a pessoas e agentes**
(`FH-01.05`). Agentes têm alçada 1 e **NUNCA** aprovam decisões próprias.
> **Verificação:** o agente atuou dentro da alçada 1, sem autoaprovar? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define **quem decide o quê** e como as decisões são registradas. Ele
existe porque uma constituição sem processo de decisão vira um conjunto de regras
que cada um interpreta sozinho.

---

## 2. Perguntas que este capítulo responde

- Quem aprova um desvio?
- Como escalono uma discordância?
- Como uma decisão vira regra?
- Como impeço que decisões se percam?
- Agentes podem decidir?

---

## 3. Definições

**Alçada** — nível de decisão exigido por um tipo de escolha.

**Executor** — quem constrói.

**Revisor** — quem verifica de forma independente.

**Precedente** — decisão registrada que vincula casos equivalentes (`FH-02.06`).

**Escalada** — passagem de uma decisão para a alçada seguinte.

---

## 4. Fundamento

**Por que alçadas declaradas.** Sem elas, a decisão é tomada por quem estiver
presente — o que produz resultados diferentes para o mesmo problema conforme a
composição da sala. Alçadas transformam "quem decide?" em consulta, e removem a
disputa de autoridade do caminho da entrega.

**Por que registro obrigatório.** Decisões não registradas são retomadas do zero
alguns meses depois, tipicamente por pessoas diferentes, chegando a conclusões
opostas. O registro é o que permite que a organização acumule julgamento em vez de
apenas acumular decisões.

**Por que ausência de dono não libera.** É a brecha mais explorada em qualquer
governança: "não tinha ninguém para decidir". O fallback (§0.11) já cobre o caso —
analogia, hierarquia, reversível, sem inventar padrão, com registro. Decidir
sozinho é legítimo; decidir sozinho **e em silêncio** não é.

**Por que quem propõe não aprova.** Não por desconfiança, mas por limitação
cognitiva: quem construiu não enxerga os próprios pontos cegos, e a autoaprovação
elimina justamente a função da revisão. É a mesma lógica de `FH-61.10` — a
autoavaliação antecipa a revisão, não a substitui.

**Por que urgência não muda alçada.** Urgência é exatamente a condição em que
governanças são desmontadas, e o desmonte é permanente: uma vez aceito que o prazo
reduz a alçada, todo prazo passa a reduzi-la. `FH-65.08` fecha a porta antes de ela
ser usada pela primeira vez.

**Por que agentes têm alçada 1.** Agentes executam e propõem com competência, mas
não respondem por consequências — não podem ser responsabilizados, não participam
do contexto comercial e não têm continuidade entre sessões (`FH-01.09`). Alçada 1
permite todo o valor da execução autônoma sem transferir a responsabilidade da
decisão.

---

## 5. Alçadas de decisão

| Alçada | Tipo de decisão | Quem decide | Registro |
| --- | --- | --- | --- |
| **1 — Execução** | Aplicação de artigo existente a um caso previsto | Executor (pessoa ou agente) | Bloco de Conformidade |
| **2 — Interpretação** | Caso não previsto, analogia, escolha entre leituras possíveis | Executor + revisor independente | Anexo E (lacuna ou precedente) |
| **3 — Arbitragem** | Conflito entre artigos; exceção a **DEVERIA** | Alçada superior nomeada | Anexo E (precedente ou exceção) |
| **4 — Emenda** | Alteração de artigo, princípio ou estrutura | Rito do Capítulo 4 | Emenda formal + artefatos vivos |

**Regras de alçada:**

- A alçada é determinada pelo **tipo de decisão**, nunca pela urgência
  (`FH-65.08`).
- Decisão de alçada superior **NUNCA** é tomada por quem tem alçada inferior — o
  caminho é escalar (`FH-65.04`).
- Agentes atuam em **alçada 1** e **propõem** nas demais (`FH-65.10`,
  `FH-68.04`).
- Nenhuma alçada autoriza violar **DEVE**/**NUNCA** — isso é sempre emenda
  (`FH-01.03`).

---

## 6. Regras normativas

### `FH-65.04` — Caminho de escalada

| Situação | Escalar para |
| --- | --- |
| Artigo aplicável, aplicação clara | Não escala — alçada 1 |
| Caso não previsto | Alçada 2, com registro de lacuna |
| Dois artigos em conflito | Alçada 3, após tentar `FH-03.01`–`FH-03.04` |
| A regra parece errada | Alçada 4 — proposta de emenda, com evidência |
| Pedido exige violar **DEVE**/**NUNCA** | Parada obrigatória (`FH-68.03`) e alçada 4 |

### `FH-65.02` — Conteúdo mínimo do registro

Autor · data · artigos envolvidos · alternativas consideradas · decisão · alcance
(quais casos futuros vincula) · status.

---

## 7. Anti-padrões

**Decisão de corredor.** Tomada informalmente, sem registro.

**Alçada elástica.** Nível reduzido por prazo.

**Autoaprovação.** Quem propõe também aprova.

**Órfão como licença.** "Não tinha dono" usado para improvisar.

**Escalada saltada.** Emenda proposta sem tentar interpretação e arbitragem.

**Precedente oral.** "A gente decidiu isso ano passado", sem registro.

**Agente decisor.** Agente aprovando a própria proposta.

---

## 8. Impactos

**Cognitivo.** Alçadas eliminam a deliberação sobre quem decide — que costuma
custar mais tempo que a decisão em si.

**Emocional.** Reduz conflito interpessoal: a discussão passa a ser sobre alçada e
artigo, não sobre autoridade.

**Produtividade.** Registro elimina rediscussão recorrente, um dos maiores
desperdícios em times de produto.

**Percepção de qualidade.** Governança consistente é o que impede que o produto
oscile conforme quem está decidindo naquele trimestre.

**Curva de aprendizagem.** Para quem chega, o registro de decisões é a única fonte
do raciocínio por trás do que existe.

---

## 9. Riscos e trade-offs

**Risco: burocracia.** Quatro alçadas podem emperrar decisões simples. Mitigação:
a maioria é alçada 1, resolvida pelo próprio executor com registro mínimo.

**Risco: gargalo em alçada superior.** Poucas pessoas para arbitrar. Mitigação:
`FH-65.05` converte recorrência em artigo, drenando a fila.

**Risco: registro ritual.** Registrar sem conteúdo útil. Mitigação: `FH-65.02`
define o conteúdo mínimo, incluindo alternativas consideradas.

**Trade-off central.** Trocamos autonomia individual por consistência
institucional. Decisões demoram um pouco mais e valem para além de quem as tomou.

---

## 10. Critérios de verificação

1. Toda decisão foi tomada dentro da alçada correspondente.
2. Toda decisão tem registro com autor, data, artigos e fundamento.
3. Ausência de dono resultou em fallback registrado, não em improviso.
4. A escalada seguiu o caminho declarado.
5. Decisões recorrentes viraram precedente ou artigo.
6. Toda entrega teve revisão independente com checklist.
7. Nenhuma aprovação foi dada por quem propôs.
8. Nenhuma alçada foi reduzida por urgência.
9. Toda exceção tem responsável nomeado e prazo.
10. Agentes atuaram em alçada 1, sem autoaprovar.

---

## 11. Checklist do capítulo

- [ ] Identifiquei a alçada desta decisão.
- [ ] Registrei autor, data, artigos e alternativas.
- [ ] Se faltou dono, apliquei o fallback e registrei a lacuna.
- [ ] Escalei pelo caminho, sem pular etapas.
- [ ] A revisão foi feita por outra pessoa ou agente.
- [ ] Nenhuma urgência alterou a alçada.
- [ ] Toda exceção tem nome e prazo.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 1 (autoridade), 2 (interpretação), 3 (conflitos), 4
(emenda), 61–63 (avaliação e checklists).

**É pré-requisito de.** Capítulos 66 (dívida), 67 (evolução), 68 (agentes).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Registro de decisões | `docs/constituicao/ANEXO-E-registro-de-decisoes.md` |
| Modelos de proposta e revisão | `docs/constituicao/ANEXO-D-modelos.md` |
| Revisão de mudanças | Histórico do repositório e revisão de alterações |
| Convenções de contribuição | `CONTRIBUTING.md` |
| Registro de mudanças do produto | `CHANGELOG.md` |
