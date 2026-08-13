# Anexo A — Glossário Canônico

> **Artefato vivo.** É a fonte única de nomes do produto (`FH-59.01`). Todo termo
> usado em interface, código, banco, documentação e suporte **DEVE** constar
> aqui. Termo novo exige registro **antes** do uso (`FH-59.04`).

| Campo | Valor |
| --- | --- |
| Versão | 1.1.0 |
| Termos de domínio | 15 |
| Termos administrativos | 6 |
| Termos da Constituição | 20 |
| Termos proibidos | 12 + 7 em comunicação (§6.1) |

---

## Como usar

- **Ao nomear algo:** procure aqui primeiro. Se o conceito já existe, use o termo
  registrado. Se não existe, registre antes de implementar (`FH-59.04`,
  `FH-21.06`).
- **Ao revisar:** qualquer termo fora deste anexo é achado (`FH-59.01`).
- **Par canônico:** cada entidade tem um nome de interface (pt-BR) e um de código
  (inglês). Os dois são canônicos; um terceiro termo é sinônimo proibido
  (`FH-21.02`).

---

## 1. Entidades de domínio

| Termo (interface) | Código | Definição | Eixo |
| --- | --- | --- | --- |
| **Contato** | `Contact` | A pessoa com quem a operação se relaciona. Centro do modelo. | Pessoa |
| **Etiqueta** | `Tag` | Marcador livre aplicado a contatos, criado pelo usuário. | Pessoa |
| **Campo personalizado** | `CustomField` | Atributo adicional definido pela conta. | Pessoa |
| **Nota** | `ContactNote` | Registro escrito por um membro sobre um contato. | Pessoa |
| **Conversa** | `Conversation` | Interação contínua com um contato, por um canal. | Conversa |
| **Mensagem** | `Message` | Unidade de comunicação dentro de uma conversa. | Conversa |
| **Modelo de mensagem** | `MessageTemplate` | Conteúdo pré-aprovado para envio. | Conversa |
| **Disparo** | `Broadcast` | Envio de um modelo a vários destinatários. | Conversa |
| **Destinatário** | `BroadcastRecipient` | Contato incluído em um disparo, com estado próprio. | Conversa |
| **Funil** | `Pipeline` | Sequência de etapas que conduz negócios a um desfecho. | Processo |
| **Etapa** | `PipelineStage` | Posição de um negócio dentro de um funil. | Processo |
| **Negócio** | `Deal` | Oportunidade concreta conduzida por um funil. | Processo → Resultado |
| **Quadro** | `ConversationBoard` | Organização visual de conversas por raia. | Processo |
| **Automação** | `Automation` | Regra que executa ações quando uma condição ocorre. | Processo |
| **Fluxo** | `Flow` | Estrutura visual encadeada de etapas de uma automação. | Processo |

## 2. Entidades administrativas

*Fora do eixo canônico (`FH-21.08`): servem à conta, não à operação comercial.*

| Termo (interface) | Código | Definição |
| --- | --- | --- |
| **Conta** | `Account` | Unidade de isolamento de dados. Fronteira de tenancy. |
| **Membro** | `AccountMember` | Pessoa da equipe com papel atribuído na conta. |
| **Convite** | `AccountInvitation` | Solicitação de entrada de um membro. |
| **Perfil** | `Profile` | Identidade individual de quem usa o produto. |
| **Plano** | `CommercialPlan` | Conjunto de direitos e limites contratados. |
| **Canal** | — | Meio pelo qual a comunicação trafega. **Atributo de conversa, nunca identidade** (`FH-05.06`). |

## 3. Papéis

| Termo | Definição |
| --- | --- |
| **Responsável pela conta** | Quem responde por risco, custo e acesso. |
| **Administrador** | Quem gerencia configuração e membros. |
| **Agente** | Quem opera atendimento e processos. |
| **Observador** | Quem apenas consulta. |

> **Papel ≠ arquétipo** (`FH-13.06`). Papel é permissão; arquétipo é modo de
> trabalho.

## 4. Arquétipos operacionais

| Termo | Definição |
| --- | --- |
| **Operador** | Atende e responde continuamente. Maior volume, maior frequência. |
| **Gestor** | Acompanha, decide e distribui. Sessões curtas. |
| **Construtor** | Desenha processos e automações. Uso episódico e deliberado. |
| **Responsável** | Responde pela conta, custo e permissões. |
| **Visitante** | Entra raramente, para uma tarefa específica. |

## 5. Termos da Constituição

| Termo | Definição | Origem |
| --- | --- | --- |
| **Artigo** | Regra normativa verificável, identificada por `FH-XX.NN`. | §0.6 |
| **Verificação binária** | Pergunta fechada que responde cumpre/viola. | §0.10 |
| **Núcleo Normativo** | Bloco compacto de artigos no topo de cada capítulo. | §0.7 |
| **Aterrissagem** | Mapeamento conceito → artefato real. | §0.12 |
| **Fallback** | Procedimento quando nenhum artigo cobre o caso. | §0.11 |
| **Lacuna** | Situação real sem artigo aplicável. | `FH-02.08` |
| **Precedente** | Decisão registrada que vincula casos equivalentes. | `FH-02.06` |
| **Cláusula pétrea** | Proteção que só pode ser fortalecida. | `FH-04.12` |
| **Eixo canônico** | Pessoa → Conversa → Processo → Resultado. | `FH-20.01` |
| **Teste de Pertencimento** | Verificação de encaixe no eixo. | `FH-05.05` |
| **Teste da Direção** | Verificação de para quem o esforço é transferido. | `FH-06.01` |
| **Custo Permanente** | Manutenção + suporte + carga cognitiva + restrição futura. | `FH-12.06` |
| **Primeiro Valor Real** | Primeiro resultado útil reconhecido pelo usuário. | `FH-25.01` |
| **Escala de autonomia** | Cinco níveis: informar, sugerir, agir com desfazer, agir com confirmação, nunca agir. | `FH-18.01` |
| **Orçamento de decisões** | Máximo de três decisões simultâneas por tarefa dominante. | `FH-08.02` |
| **Bloqueio absoluto** | Violação que impede a entrega e nunca vira dívida. | `FH-62.01` |
| **Dívida de experiência** | Parte do produto que contradiz a Constituição. | `FH-66` |
| **Bloco de Conformidade** | Declaração obrigatória ao final de toda entrega. | `FH-68.02` |
| **Alçada** | Nível de decisão exigido por um tipo de escolha. | `FH-65.01` |
| **Anti-métrica** | Número que sobe quando a experiência piora. | `FH-64.02` |

---

## 6. Termos proibidos

| Proibido | Use | Motivo |
| --- | --- | --- |
| Lead, cliente, pessoa (como entidade) | **Contato** | Um conceito, um termo (`FH-59.02`) |
| Ticket, chamado, atendimento (como entidade) | **Conversa** | Premissa de "abre e fecha" não pertence ao modelo (`FH-05.03`) |
| Card, cartão (como entidade) | **Negócio** | Card é representação visual, não entidade |
| Pipeline (na interface) | **Funil** | Interface é pt-BR (`FH-21.02`) |
| Workflow, jornada (como entidade) | **Automação** ou **Fluxo** | Termos já registrados |
| Campanha | **Disparo** | Vocabulário publicitário (`FH-57.05`) |
| Bot, assistente virtual | — | A IA nunca simula identidade (`FH-53.08`) |
| Módulo (na interface) | — | Módulo existe para quem constrói (`FH-05.02`) |
| Usuário final | **Destinatário** ou **Contato** | Ambíguo entre quem usa e quem recebe |
| Nome de canal como seção | — | Canal é atributo (`FH-05.06`) |
| Sistema (como sujeito de fala) | — | O produto não se personifica (`FH-57.10`) |
| Registro, item, objeto (na interface) | Nome da entidade | Termos técnicos genéricos (`FH-59.08`) |

### 6.1 Termos técnicos em comunicação ao usuário final

Proibidos como argumento, título, cartão, dica, benefício ou selo (`FH-59.11`).
Livres em documentação técnica. A coluna "Comunique" indica a consequência —
nunca o mecanismo.

| Proibido | Comunique | Motivo |
| --- | --- | --- |
| BYOK, BYOA, "suas chaves de API" | **Você está no controle.** Suas conexões permanecem sob seu controle | Sigla não definida convertida em benefício (`FH-59.09`) |
| RLS, multi-tenant, "isolamento", "segurança bancária" | **Seu espaço permanece seu.** Cada operação permanece isolada e protegida | Requisito de segurança convertido em slogan (`FH-57.11`) |
| Retenção zero, "não armazenamos" | **Seus dados continuam sendo seus.** O FlowHub trabalha com seus arquivos sem tomar posse deles | Propriedade interna convertida em claim (`FH-57.11`) |
| LGPD, DPA, "conformidade" | **Seus dados merecem transparência.** Privacidade faz parte de como o FlowHub foi construído | Obrigação legal convertida em argumento (`FH-57.12`) |
| Supabase, Meta, nome de fornecedor | — | Fornecedor não é benefício (`FH-59.10`) |
| API, JWT, webhook, serverless, Redis | — | Detalhe arquitetural não é linguagem de usuário (`FH-58.03`) |
| "API Oficial" como selo | O que ela permite ao usuário | Meio apresentado como fim (`FH-57.11`) |

**Exceção.** Onde o termo **é** a informação — a tela de configuração em que a
pessoa cola uma credencial, a página de subprocessadores, o texto legal — ele é
correto e obrigatório (`FH-59.10`). A proibição atinge o uso **persuasivo**, não o
uso **operacional**.

---

## 7. Termos criados pelo usuário

Nomes de **etiquetas, campos personalizados, funis, etapas e quadros** são criados
pela conta e **NUNCA** são normalizados, corrigidos ou reinterpretados pelo sistema
(`FH-59.07`, `FH-58.11`). Este anexo governa o vocabulário **do produto**, não o
vocabulário **do usuário**.

---

*Anexo A v1.1.0. Atualização obrigatória a cada termo novo, renomeação ou
banimento (`FH-04.08`, `FH-59.04`).*
