# Capítulo 21 — Ontologia do Domínio

| Campo | Valor |
| --- | --- |
| Livro | III — Estrutura |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 5, 20 |
| É pré-requisito de | Capítulos 22, 41, 47, 51, 54, 59 |
| Artigos | `FH-21.01` a `FH-21.11` |

---

## 0. Núcleo Normativo

**`FH-21.01`** — Toda entidade do domínio **DEVE** possuir **ficha canônica**
contendo: definição, posição no eixo (`FH-20.01`), atributos essenciais, estados
possíveis, transições válidas, escopo e relação com a Pessoa.
> **Verificação:** a entidade possui ficha canônica completa? → SIM = cumpre | NÃO = viola.

**`FH-21.02`** — Cada entidade possui um **par canônico de nomes**: nome de
interface (pt-BR) ↔ nome de código (inglês), registrado na ficha. Qualquer outro
termo para a mesma entidade é sinônimo proibido (`FH-05.10`).
> **Verificação:** esta entidade é referida por algum termo fora do par canônico? → NÃO = cumpre | SIM = viola.

**`FH-21.03`** — Toda entidade de domínio **DEVE** ser escopada por conta. Não
existe entidade de domínio sem `account_id` ou sem herança de escopo declarada na
ficha.
> **Verificação:** a entidade é escopada por conta, direta ou por herança declarada? → SIM = cumpre | NÃO = viola.

**`FH-21.04`** — Toda entidade com ciclo de vida **DEVE** declarar seus estados e
as transições válidas entre eles. Estado não declarado e transição não prevista são
proibidos.
> **Verificação:** todos os estados e transições desta entidade estão declarados? → SIM = cumpre | NÃO = viola.

**`FH-21.05`** — As relações entre entidades **DEVEM** estar declaradas na ficha.
Criar relação nova entre entidades existentes exige atualização das fichas
envolvidas, no mesmo ciclo.
> **Verificação:** esta relação está declarada nas fichas das duas entidades? → SIM = cumpre | NÃO = viola.

**`FH-21.06`** — Entidade nova **NUNCA** é implementada antes de sua ficha existir.
> **Verificação:** a ficha foi escrita antes da implementação? → SIM = cumpre | NÃO = viola.

**`FH-21.07`** — Toda ficha **DEVE** declarar o ciclo completo, incluindo o fim:
como a entidade é arquivada, excluída, anonimizada ou retida, e por quanto tempo.
> **Verificação:** o fim do ciclo de vida está declarado, com prazo? → SIM = cumpre | NÃO = viola.

**`FH-21.08`** — Nenhuma entidade de domínio existe fora do eixo do Capítulo 20.
Entidades administrativas são declaradas explicitamente como tal.
> **Verificação:** a entidade ocupa posição no eixo ou está declarada como administrativa? → SIM = cumpre | NÃO = viola.

**`FH-21.09`** — Renomear uma entidade exige **transição comunicada** (`FH-16.09`)
e atualização simultânea de interface, código, banco, documentação e traduções.
Coexistência permanente de dois nomes é proibida.
> **Verificação:** a renomeação atualizou todas as camadas no mesmo ciclo? → SIM = cumpre | NÃO = viola.

**`FH-21.10`** — Atributo que só existe por razão técnica **NUNCA** aparece na
interface (`FH-08.08`). A ficha distingue atributos de domínio de atributos de
implementação.
> **Verificação:** algum atributo exibido existe apenas por razão de implementação? → NÃO = cumpre | SIM = viola.

**`FH-21.11`** — Toda entidade visível ao usuário **DEVE** ter estado observável e
histórico consultável, conforme `FH-20.10`.
> **Verificação:** o usuário consegue ver o estado atual e o histórico? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define **cada coisa que existe** no FlowHub: o que é, como se chama,
que estados assume e como se relaciona com as demais. Ele existe para que o
vocabulário do produto, do código, do banco de dados e do suporte seja **o mesmo**
— condição sem a qual o modelo mental do Capítulo 20 se dissolve na prática.

---

## 2. Perguntas que este capítulo responde

- O que é um contato? Uma conversa? Um negócio? Uma automação?
- Qual a diferença entre coisas parecidas?
- Que nome usar na interface? E no código?
- Que estados uma entidade pode ter?
- Posso criar uma entidade nova?
- Como renomear algo sem quebrar o entendimento do usuário?

---

## 3. Definições

**Entidade de domínio** — coisa que existe no mundo do usuário e que ele reconhece
como unidade.

**Entidade administrativa** — coisa que existe para operar a conta, não a operação
comercial. Fora do eixo (`FH-21.08`).

**Ficha canônica** — registro obrigatório de uma entidade (`FH-21.01`).

**Par canônico de nomes** — dupla interface/código que identifica a entidade.

**Estado** — condição atual da entidade, observável pelo usuário.

**Transição** — mudança válida entre dois estados.

---

## 4. Fundamento

**Por que ontologia vem antes de interface.** Toda tela é uma representação de
entidades e relações. Se as entidades não estão definidas, cada tela inventa a sua
própria versão — e o usuário passa a encontrar o mesmo conceito com nomes,
atributos e comportamentos diferentes em lugares diferentes. Esse é o mecanismo
mais comum de degradação de modelo mental, e ele é invisível durante a construção:
cada tela isolada parece coerente.

**Por que o par de nomes, e não um nome único.** A regra ideal seria um nome só. Na
prática, o código deste projeto é escrito em inglês e a interface em pt-BR — uma
divergência sistemática, deliberada e registrada. `FH-21.02` a formaliza como
**par canônico**: dois nomes, uma entidade, nenhum terceiro termo. O que se proíbe
não é a tradução; é o sinônimo — a mesma coisa chamada de três jeitos porque três
pessoas a nomearam em momentos diferentes.

**Por que estados precisam ser declarados.** Estado não declarado vira estado
implícito, e estado implícito é representado de formas diferentes em cada tela —
quando é representado. O usuário então encontra uma entidade que "está de algum
jeito" sem saber qual, o que viola diretamente P9 (honestidade de estado). A
declaração antecipada também revela transições impossíveis antes de elas virarem
defeito.

**Por que o fim do ciclo é obrigatório.** Entidades são criadas com entusiasmo e
morrem por acidente. Sem declaração de arquivamento, exclusão e retenção, cada
entidade acumula indefinidamente, e as obrigações legais de retenção
(`docs/legal/`) tornam-se impossíveis de cumprir porque ninguém sabe o que existe.
`FH-21.07` obriga a pensar o fim no começo — que é o único momento barato.

**Por que ficha antes de implementação.** Uma entidade implementada antes de
definida carrega para sempre as decisões acidentais do momento em que foi
codificada: atributos que existiam por conveniência, estados que surgiram de
condições booleanas, nomes escolhidos às pressas. Corrigir depois exige migração,
renomeação e retreinamento do usuário.

---

## 5. Catálogo de entidades

### Entidades de domínio

| Nome (interface) | Nome (código) | Posição no eixo | Escopo |
| --- | --- | --- | --- |
| Contato | `Contact` | **Pessoa** | Conta |
| Etiqueta | `Tag` | Pessoa (atributo) | Conta |
| Campo personalizado | `CustomField` | Pessoa (atributo) | Conta |
| Nota | `ContactNote` | Pessoa (histórico) | Conta |
| Conversa | `Conversation` | **Conversa** | Conta |
| Mensagem | `Message` | Conversa | Herda da conversa |
| Modelo de mensagem | `MessageTemplate` | Conversa (insumo) | Conta |
| Funil | `Pipeline` | **Processo** | Conta |
| Etapa | `PipelineStage` | Processo | Herda do funil |
| Negócio | `Deal` | Processo → **Resultado** | Conta |
| Quadro | `ConversationBoard` | Processo | Conta |
| Automação | `Automation` | Processo | Conta |
| Fluxo | `Flow` | Processo | Conta |
| Disparo | `Broadcast` | Conversa (em massa) | Conta |
| Destinatário de disparo | `BroadcastRecipient` | Conversa | Herda do disparo |

### Entidades administrativas (fora do eixo, `FH-21.08`)

| Nome (interface) | Nome (código) | Função |
| --- | --- | --- |
| Conta | `Account` | Unidade de isolamento (`FH-10.06`) |
| Membro | `AccountMember` | Pessoa da equipe, com papel |
| Convite | `AccountInvitation` | Entrada de membro |
| Perfil | `Profile` | Identidade do usuário |
| Plano / Assinatura | `CommercialPlan` / `Subscription` | Direitos e limites |
| Canal | `WhatsAppConfig` e equivalentes | Conexão com provedor |

### Fichas canônicas — entidades centrais

#### Contato (`Contact`)

- **Definição.** A pessoa com quem a operação se relaciona. É o centro do modelo
  (`FH-20.02`).
- **Atributos essenciais.** Identificação, meios de contato, etiquetas, campos
  personalizados, responsável.
- **Estados.** Ativo · Arquivado · Bloqueado para comunicação (opt-out,
  `FH-11.03`).
- **Transições.** Ativo ⇄ Arquivado; Ativo → Bloqueado (irreversível pelo
  remetente).
- **Relações.** Possui conversas, negócios, notas, etiquetas, campos; recebe
  disparos; é alvo de automações.
- **Fim do ciclo.** Exclusão a pedido do titular (LGPD) e retenção conforme
  `docs/business-rules/retencao-exclusao-inadimplencia.md`.

#### Conversa (`Conversation`)

- **Definição.** Interação contínua com um contato, através de um canal.
- **Atributos essenciais.** Contato, canal, responsável, status, última atividade.
- **Estados.** Aberta · Pendente · Resolvida · Arquivada.
- **Transições.** Todas reversíveis; nenhuma exige ordem (`FH-20.04`).
- **Relações.** Pertence a um contato; contém mensagens; pode originar negócio;
  pode ser item de quadro.
- **Fim do ciclo.** Arquivamento; retenção conforme política de dados.

#### Negócio (`Deal`)

- **Definição.** Oportunidade concreta conduzida por um funil até um desfecho.
- **Atributos essenciais.** Contato, funil, etapa, valor, responsável, status.
- **Estados.** Aberto · Ganho · Perdido.
- **Transições.** Aberto → Ganho/Perdido; reabertura permitida e registrada.
- **Relações.** Pertence a um contato; percorre etapas de um funil; pode se ligar
  a conversas.
- **Fim do ciclo.** Permanece como histórico do contato; nunca é excluído
  silenciosamente.

#### Automação (`Automation`) e Fluxo (`Flow`)

- **Definição.** Regra que executa ações quando uma condição ocorre. **Automação**
  é a regra; **Fluxo** é a estrutura visual encadeada de etapas.
- **Atributos essenciais.** Gatilho, condições, etapas, estado de ativação, autor.
- **Estados.** Rascunho · Ativa · Pausada · Arquivada.
- **Transições.** Rascunho → Ativa exige ativação consciente (`FH-18.08`).
- **Relações.** Age sobre contatos e conversas; gera execuções registradas
  (`FH-18.03`).
- **Fim do ciclo.** Arquivamento preserva o histórico de execuções.

**Fichas pendentes.** As demais entidades do catálogo terão ficha completa
produzida no ciclo em que forem tocadas por qualquer alteração (`FH-21.06`
aplica-se integralmente a entidades novas).

---

## 6. Regras normativas

### `FH-21.02` — Par canônico

**Quando aplicar.** Em toda referência à entidade: interface, código, banco,
documentação, suporte, tradução.

**Quando NÃO aplicar.** Não impede termos coloquiais em conversa informal; impede
que apareçam em qualquer artefato do produto.

**Errado.** A mesma coisa chamada de "contato" na navegação, "lead" no relatório e
"cliente" na mensagem de erro. O usuário conclui que são três coisas.

### `FH-21.03` — Escopo por conta

**Quando NÃO aplicar.** Entidades globais do sistema (catálogo de planos, por
exemplo), que **DEVEM** ser declaradas como tais na ficha.

### `FH-21.04` — Estados declarados

**Errado.** Um estado que existe apenas como combinação de campos booleanos, sem
nome, sem representação e sem transição definida.

### `FH-21.09` — Renomeação

**Certo.** Renomear em todas as camadas no mesmo ciclo, com aviso ao usuário e sem
manter o termo antigo.

**Errado.** Trocar o nome na interface e manter o antigo no código e no relatório.
Cria dois vocabulários e quebra o rastro entre o que o usuário vê e o que o suporte
lê.

---

## 7. Anti-padrões

**Entidade por conveniência.** Criada no código sem ficha, sem posição no eixo.

**Sinônimo regional.** Cada área do produto com seu termo para a mesma coisa.

**Estado fantasma.** Condição real sem nome nem representação.

**Entidade imortal.** Sem definição de arquivamento, exclusão ou retenção.

**Atributo técnico exposto.** Identificador interno visível sem motivo.

**Renomeação parcial.** Nome novo na interface, antigo no resto.

---

## 8. Impactos

**Cognitivo.** Vocabulário único elimina a tradução mental constante entre o que o
usuário vê e o que ele entende — a carga extrínseca mais persistente em sistemas de
gestão.

**Emocional.** Consistência de nomes produz confiança de que o sistema é uma coisa
só. Sinônimos produzem a suspeita de que existem dados duplicados em algum lugar.

**Produtividade.** Afeta principalmente suporte e equipe: quando usuário, atendente
e engenheiro usam o mesmo termo, o tempo de resolução cai drasticamente.

**Percepção de qualidade.** Ontologia inconsistente é percebida como desleixo, e é
uma das primeiras coisas que um avaliador experiente nota.

**Curva de aprendizagem.** Cada sinônimo é um conceito extra a aprender. Um
catálogo enxuto e consistente é o que permite aprender o produto por exploração.

---

## 9. Riscos e trade-offs

**Risco: burocracia de ficha.** Exigir ficha antes de implementar atrasa. Mitigação:
a ficha é curta — sete campos — e o custo de não tê-la é migração posterior.

**Risco: rigidez do catálogo.** Entidades novas legítimas podem ser desencorajadas.
Mitigação: `FH-21.06` exige ficha, não aprovação especial. O filtro de necessidade
é o Capítulo 12.

**Risco: divergência entre par de nomes.** Manter pt-BR e inglês sincronizados exige
disciplina. Mitigação: a ficha é a fonte única, e `FH-21.09` proíbe atualização
parcial.

**Trade-off central.** Trocamos liberdade de nomeação por unidade de vocabulário.
Nomear é rápido e prazeroso; renomear é caro e cobrado do usuário.

---

## 10. Critérios de verificação

1. Toda entidade tem ficha canônica completa.
2. Nenhuma entidade é referida por termo fora do par canônico.
3. Toda entidade de domínio é escopada por conta ou herda escopo declarado.
4. Todos os estados e transições estão declarados.
5. Toda relação está declarada nas fichas das duas pontas.
6. Nenhuma entidade foi implementada antes da ficha.
7. Todo ciclo de vida declara o fim, com prazo.
8. Nenhuma entidade de domínio está fora do eixo sem declaração administrativa.
9. Nenhuma renomeação deixou camadas desatualizadas.
10. Nenhum atributo puramente técnico aparece na interface.

---

## 11. Checklist do capítulo

- [ ] A entidade tem ficha completa antes de eu implementar.
- [ ] Usei o par canônico de nomes em todas as camadas.
- [ ] Declarei escopo por conta.
- [ ] Declarei estados e transições válidas.
- [ ] Declarei as relações nas duas pontas.
- [ ] Declarei como esta entidade termina e por quanto tempo é retida.
- [ ] Nenhum atributo técnico vazou para a interface.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 5 (`FH-05.10`), 20 (eixo).

**É pré-requisito de.** Capítulos 22 (arquitetura da informação), 41 (estados), 47
(busca), 51 (permissões), 54 (automações), 59 (nomenclatura), Anexo A (glossário).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Tipos de domínio | `src/types/index.ts` |
| Esquema e escopo por conta | `supabase/migrations/` (colunas `account_id`, políticas RLS) |
| Nomes de interface | `src/i18n/messages/pt-BR.json` |
| Regras de estado | `src/lib/broadcast-status.ts`, `src/lib/template-status.ts` |
| Retenção e exclusão | `docs/business-rules/retencao-exclusao-inadimplencia.md` |
