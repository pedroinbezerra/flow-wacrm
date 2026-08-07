# Capítulo 52 — Princípios de IA Aplicada à Experiência

| Campo | Valor |
| --- | --- |
| Livro | VI — Inteligência |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 6, 7 (P2, P9), 11, 18, 41, 44 |
| É pré-requisito de | Capítulos 53, 54, 55, 56 |
| Artigos | `FH-52.01` a `FH-52.11` |

---

## 0. Núcleo Normativo

**`FH-52.01`** — A inteligência artificial é **integrada ao fluxo de trabalho**.
**NUNCA** existirá como área separada à qual o usuário precise ir para obter ajuda
(`FH-05.02`, `FH-07.09`).
> **Verificação:** esta capacidade de IA está disponível no ponto onde o trabalho acontece? → SIM = cumpre | NÃO = viola.

**`FH-52.02`** — Toda capacidade de IA **DEVE** declarar seu nível de autonomia
(`FH-18.01`). O padrão é **sugerir** (nível 2); níveis superiores exigem
justificativa registrada (`FH-18.02`).
> **Verificação:** o nível está declarado e é o menor que resolve? → SIM = cumpre | NÃO = viola.

**`FH-52.03`** — **Revisão humana é obrigatória** antes de qualquer comunicação
externa gerada por IA. Não existe envio automático de conteúdo gerado a terceiros
(`FH-45.07`, `FH-11.10`).
> **Verificação:** existe caminho pelo qual conteúdo gerado chegue a terceiros sem revisão humana? → NÃO = cumpre | SIM = viola.

**`FH-52.04`** — A IA **NUNCA** inventa dado do cliente. Toda afirmação factual
apresentada **DEVE** ser rastreável à sua origem no sistema.
> **Verificação:** cada afirmação factual tem origem rastreável? → SIM = cumpre | NÃO = viola.

**`FH-52.05`** — O **contexto lido** pela IA **DEVE** ser consultável pelo usuário:
o que ela usou para chegar àquele resultado (`FH-11.06`).
> **Verificação:** é possível ver o que a IA leu? → SIM = cumpre | NÃO = viola.

**`FH-52.06`** — Incerteza **DEVE** ser declarada. Resultado provável **NUNCA** é
apresentado com a mesma confiança de fato verificado (`FH-07.10`, `FH-06.10`).
> **Verificação:** o grau de certeza é distinguível? → SIM = cumpre | NÃO = viola.

**`FH-52.07`** — **Degradação segura.** Quando a IA falhar ou estiver indisponível,
o produto continua funcionando integralmente, com o estado declarado
(`FH-41.06`).
> **Verificação:** o produto permanece plenamente utilizável sem IA? → SIM = cumpre | NÃO = viola.

**`FH-52.08`** — Custo e consumo **DEVEM** ser transparentes **antes** da execução
quando houver cobrança ou cota associada (`FH-27.06`, `FH-51.04`).
> **Verificação:** o usuário sabe o custo antes de acionar? → SIM = cumpre | NÃO = viola.

**`FH-52.09`** — Nenhuma tarefa essencial do produto **PODE** depender de IA. Toda
capacidade essencial tem caminho manual equivalente.
> **Verificação:** existe caminho sem IA para esta tarefa essencial? → SIM = cumpre | NÃO = viola.

**`FH-52.10`** — Erro da IA é **erro do sistema** (`FH-44`), nunca do usuário.
Mensagens **NUNCA** atribuem a ele a responsabilidade pelo resultado gerado.
> **Verificação:** a mensagem atribui ao usuário a responsabilidade pelo erro da IA? → NÃO = cumpre | SIM = viola.

**`FH-52.11`** — Todo dado enviado a provedor externo **DEVE** ter finalidade, base
legal e prazo de retenção declarados antes da construção (`FH-11.11`).
> **Verificação:** os três estão declarados e registrados? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define o **papel da inteligência artificial** dentro do FlowHub: um
copiloto do trabalho real, subordinado às mesmas regras de autonomia, confiança e
ética que governam qualquer outra capacidade do sistema.

---

## 2. Perguntas que este capítulo responde

- O que a IA pode fazer sozinha?
- O que sempre precisa de revisão humana?
- Como mostro confiança e incerteza?
- O que acontece quando a IA erra ou fica indisponível?
- Como evito que a IA vire um chat isolado dentro do produto?

---

## 3. Definições

**Capacidade de IA** — funcionalidade cujo resultado depende de modelo
probabilístico.

**Contexto lido** — conjunto de informações usadas para produzir o resultado.

**Afirmação factual** — declaração sobre dado real do usuário ou de seus contatos.

**Degradação segura** — funcionamento pleno do produto sem a camada de IA.

**Conteúdo gerado** — texto, resumo ou sugestão produzido por modelo.

---

## 4. Fundamento

**Por que integrada, nunca separada.** A "área de IA" é o padrão mais comum e o mais
inútil: ela obriga o usuário a sair do trabalho, explicar o contexto que o sistema
já tem e trazer o resultado de volta manualmente. Isso viola `FH-06.01` de forma
direta — transfere trabalho ao usuário — e transforma a inteligência em uma
ferramenta paralela, não em uma propriedade do produto.

**Por que o padrão é sugerir.** A escala de autonomia (`FH-18.01`) já estabelece a
regra do menor nível suficiente. Para IA ela é especialmente importante porque o
resultado é **probabilístico**: mesmo com alta taxa de acerto, o erro ocorre, e
seu custo depende inteiramente do nível de autonomia. Sugerir concentra quase todo
o valor percebido — o sistema demonstra que entendeu e prepara o trabalho — sem
nenhum dos riscos de agir.

**Por que revisão humana é absoluta antes de efeito externo.** Comunicação enviada
alcança terceiros que não usam o produto e não têm voz aqui (`FH-11`). Um erro
nesse ponto não é reversível: a mensagem chegou. Somando isso à natureza
probabilística do modelo, o resultado é a única categoria em que a Constituição não
admite automação — nem com alta confiança, nem com histórico de acerto
(`FH-18.11`).

**Por que a IA não inventa dado.** É a diferença entre uma ferramenta de trabalho e
uma ferramenta de risco. Se o resumo de uma conversa contiver um fato que ninguém
disse, o usuário poderá agir sobre ele com um cliente real. `FH-52.04` exige
rastreabilidade: toda afirmação factual aponta para sua origem, e o que não tem
origem não é apresentado como fato.

**Por que degradação segura.** Modelos falham, ficam lentos e mudam. Um produto que
depende de IA para funcionar herda toda a instabilidade dessa camada. `FH-52.07` e
`FH-52.09` mantêm a IA como **amplificador**, nunca como fundação — e essa
separação é o que permite adotar inteligência sem transferir risco ao usuário.

**Por que custo antes.** Capacidades de IA consomem cota ou geram cobrança.
Descobrir o custo depois de gastar é a mesma violação de `FH-27.06` — limite
descoberto no momento do uso —, agravada por ser irreversível.

---

## 5. Princípios

**A IA é propriedade do produto, não uma sala dentro dele.**

**Sugerir concentra o valor; agir concentra o risco.**

**O que não tem origem não é fato.**

**A IA amplifica; nunca sustenta.**

---

## 6. Regras normativas

### Níveis de autonomia aplicados à IA (`FH-52.02`)

| Nível | A IA… | Permitido | Exemplo de aplicação |
| --- | --- | --- | --- |
| 1 — Informar | Destaca algo relevante | Sempre | Sinalizar conversa sem resposta há muito tempo |
| 2 — Sugerir | Prepara conteúdo editável | **Padrão** | Rascunho de resposta pronto para revisar |
| 3 — Agir com desfazer | Executa efeito interno reversível | Com justificativa | Classificar ou organizar itens, com reversão |
| 4 — Agir com confirmação | Pede autorização antes | Com justificativa | Aplicar alteração ampla após revisão |
| 5 — Nunca agir | Só o humano executa | **Obrigatório** | Envio de conteúdo gerado a terceiros (`FH-52.03`) |

### `FH-52.06` — Declaração de incerteza

**Certo.** Resultado apresentado como sugestão, com o contexto que o originou
acessível e a possibilidade de editar antes de usar.

**Errado.** Resumo apresentado como registro factual, sem distinção do que foi
inferido (`FH-06.10`).

### `FH-52.07` — Degradação segura

**Certo.** Indisponibilidade da IA declarada; todas as tarefas continuam
executáveis manualmente.

**Errado.** Fluxo interrompido porque a camada de IA não respondeu.

---

## 7. Anti-padrões

**Sala de IA.** Área separada para onde o usuário vai buscar ajuda.

**Envio automático.** Conteúdo gerado alcançando terceiros sem revisão.

**Fato inventado.** Afirmação sem origem rastreável.

**Confiança uniforme.** Inferência com a mesma aparência de dado confirmado.

**Dependência estrutural.** Tarefa essencial impossível sem IA.

**Custo surpresa.** Consumo descoberto depois de gasto.

**Culpa transferida.** Mensagem que responsabiliza o usuário por resultado gerado.

**Contexto opaco.** Impossível saber o que a IA leu.

---

## 8. Impactos

**Cognitivo.** IA no ponto de uso elimina a troca de contexto e a reexplicação do
que o sistema já sabe.

**Emocional.** Rastreabilidade e incerteza declarada são o que permite delegar sem
ansiedade. Sem elas, a postura racional é verificar tudo — o que anula o ganho.

**Produtividade.** O nível 2 bem executado é o maior ganho disponível: o trabalho
preparatório é feito e a decisão permanece humana.

**Percepção de qualidade.** IA que erra com transparência é percebida como
ferramenta; IA que erra em silêncio é percebida como defeito do produto inteiro.

**Curva de aprendizagem.** Sugestões editáveis ensinam o usuário sobre as
capacidades do sistema durante o uso normal.

---

## 9. Riscos e trade-offs

**Risco: subutilização.** Exigir revisão humana limita ganhos de automação.
Trade-off assumido — o custo do erro externo é irreversível.

**Risco: custo de rastreabilidade.** Manter origem de cada afirmação encarece a
implementação. Custo assumido: sem isso, o resultado não é confiável e não será
usado.

**Risco: expectativa frustrada.** Usuários esperam automação total. Mitigação:
`FH-53.01` — a sugestão explicita o que fará, e a decisão permanece com quem
responde por ela.

**Trade-off central.** Trocamos autonomia da IA por confiabilidade da operação. O
produto faz menos sozinho — e o que ele faz pode ser delegado sem verificação.

---

## 10. Critérios de verificação

1. Toda capacidade de IA está no ponto de uso, não em área separada.
2. Todo nível de autonomia está declarado e é o menor suficiente.
3. Nenhum conteúdo gerado alcança terceiros sem revisão humana.
4. Toda afirmação factual é rastreável à origem.
5. O contexto lido é consultável.
6. A incerteza é distinguível da certeza.
7. O produto funciona integralmente sem IA.
8. Custo e consumo são conhecidos antes da execução.
9. Nenhuma tarefa essencial depende de IA.
10. Erros de IA são tratados como erros do sistema.
11. Dados enviados a provedor externo têm finalidade, base legal e prazo
    declarados.

---

## 11. Checklist do capítulo

- [ ] A IA aparece onde o trabalho acontece.
- [ ] Declarei o nível de autonomia e usei o menor possível.
- [ ] Nada gerado sai para terceiros sem revisão humana.
- [ ] Cada fato apresentado tem origem rastreável.
- [ ] O usuário consegue ver o que a IA leu.
- [ ] A incerteza está declarada.
- [ ] Desliguei a IA mentalmente: o produto continua funcionando.
- [ ] O custo é conhecido antes de gastar.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 6 (tese), 7 (P2, P9), 11 (`FH-11.06`, `FH-11.11`), 18
(autonomia), 41 (degradação), 44 (erros).

**É pré-requisito de.** Capítulos 53 (interação), 54 (automações), 55
(personalização), 56 (dados).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Camada de IA | `src/lib/ai-service/`, `src/components/ai/` |
| Superfície dedicada | `src/app/(dashboard)/ai-assistant/` |
| Consumo e cota | `src/lib/consumption/`, `src/components/consumption/` |
| Retenção de logs de IA | `docs/business-rules/retencao-logs-ia-e-provedor-externo.md` |
| Mídia gerada | `docs/business-rules/privatizacao-bucket-ai-service-media.md` |
