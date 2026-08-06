# Capítulo 20 — Modelo Mental Canônico

| Campo | Valor |
| --- | --- |
| Livro | III — Estrutura |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 5, 6, 12, 15 |
| É pré-requisito de | Capítulos 21–27, 47, 52, 54 |
| Artigos | `FH-20.01` a `FH-20.10` |

---

## 0. Núcleo Normativo

**`FH-20.01`** — O modelo mental canônico do FlowHub é o eixo
**Pessoa → Conversa → Processo → Resultado**. Toda funcionalidade **DEVE** ocupar
uma posição declarada nesse eixo.
> **Verificação:** é possível declarar em que ponto do eixo esta funcionalidade se posiciona? → SIM = cumpre | NÃO = viola.

**`FH-20.02`** — A **Pessoa** é o centro do modelo. Toda informação operacional
**DEVE** convergir para ela e ser alcançável a partir dela (`FH-05.04`).
> **Verificação:** esta informação é alcançável a partir da pessoa a que se refere? → SIM = cumpre | NÃO = viola.

**`FH-20.03`** — **NUNCA** existirá modelo mental concorrente dentro do produto. É
proibido introduzir uma segunda forma de organizar o trabalho que compita com o
eixo canônico.
> **Verificação:** esta funcionalidade introduz uma organização do trabalho paralela ao eixo? → NÃO = cumpre | SIM = viola.

**`FH-20.04`** — Nenhuma etapa do eixo é **pré-requisito rígido** de outra. O
usuário **DEVE** poder entrar por qualquer ponto: registrar uma pessoa sem
conversa, iniciar uma conversa sem processo, concluir um resultado sem etapas
intermediárias.
> **Verificação:** existe etapa do eixo que o sistema obriga a cumprir antes de outra? → NÃO = cumpre | SIM = viola.

**`FH-20.05`** — Toda entidade nova **DEVE** declarar sua posição no eixo e sua
relação com a Pessoa antes de ser implementada.
> **Verificação:** a declaração de posição e de relação com a Pessoa existe? → SIM = cumpre | NÃO = viola.

**`FH-20.06`** — O modelo é **único e invariável**: não muda por conta, segmento,
porte, plano ou preferência.
> **Verificação:** o modelo apresentado varia entre contas ou planos? → NÃO = cumpre | SIM = viola.

**`FH-20.07`** — Navegação, busca, relatórios e inteligência artificial **DEVEM**
refletir o mesmo modelo. Nenhuma superfície pode organizar o mundo de outra forma.
> **Verificação:** esta superfície organiza a informação segundo o eixo canônico? → SIM = cumpre | NÃO = viola.

**`FH-20.08`** — Localizar qualquer informação **NUNCA** pode exigir conhecimento
da estrutura interna do sistema, do módulo de origem ou do modelo de dados.
> **Verificação:** encontrar isto exige saber em que parte do sistema foi criado? → NÃO = cumpre | SIM = viola.

**`FH-20.09`** — Alterar o eixo canônico é **emenda MAIOR** (`FH-04.01`), com
análise de impacto sobre todo o produto.
> **Verificação:** houve alteração do eixo? Se SIM, existe emenda MAIOR com análise de impacto? → SIM = cumpre | NÃO = viola.

**`FH-20.10`** — Todo elemento do eixo **DEVE** possuir estado observável e
histórico consultável. Elemento sem estado visível não pertence ao modelo.
> **Verificação:** é possível ver o estado atual e o histórico deste elemento? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo descreve o **único** modelo mental que o FlowHub instala na cabeça
do usuário — e ao qual toda funcionalidade futura deve se encaixar. Ele é o
instrumento que impede o produto de virar uma coleção de áreas com lógicas
próprias, e o critério pelo qual se decide onde algo novo pertence.

---

## 2. Perguntas que este capítulo responde

- Como o usuário pensa o sistema?
- Onde uma funcionalidade nova se encaixa?
- Como sei que algo está "fora do modelo"?
- Preciso cadastrar antes de conversar?
- Uma entidade nova pode existir sem relação com pessoas?
- O modelo pode variar por tipo de cliente?

---

## 3. Definições

**Modelo mental** — representação simplificada que o usuário constrói sobre como o
sistema funciona. Ele a constrói sempre, corretamente ou não; o produto só decide
se ajuda ou atrapalha.

**Pessoa** — o ser humano com quem a operação se relaciona. No produto,
materializa-se como contato.

**Conversa** — a interação contínua com uma pessoa, através de qualquer canal.

**Processo** — a sequência de etapas pela qual a organização conduz uma pessoa a
um desfecho.

**Resultado** — o desfecho da condução: negócio fechado, atendimento resolvido,
pessoa qualificada, oportunidade perdida.

**Modelo concorrente** — segunda forma de organizar o mesmo trabalho, que obriga o
usuário a manter dois esquemas mentais.

---

## 4. Fundamento

**Por que existe um eixo, e não uma lista de módulos.** O usuário não organiza o
trabalho por funcionalidade; ele organiza por narrativa. Uma pessoa aparece,
conversa acontece, um processo é conduzido, um resultado ocorre. Essa é a estrutura
real da operação comercial, independentemente de qual software a suporte. Quando o
produto adota essa estrutura como esqueleto, o usuário não precisa traduzir entre
o que ele faz e o que o sistema oferece — e é justamente essa tradução constante
que torna CRMs tradicionais cansativos.

**Por que a Pessoa é o centro, e não o negócio.** Colocar o negócio no centro — a
escolha da maioria dos CRMs — cria um problema estrutural: uma pessoa pode ter
vários negócios ao longo do tempo, e a relação com ela é mais duradoura que
qualquer um deles. Um sistema centrado em negócios fragmenta o histórico da
relação em registros desconectados, e a informação mais valiosa — o que já
aconteceu com essa pessoa — fica espalhada. Centrar na pessoa preserva a
continuidade, que é o ativo real da operação comercial.

**Por que nenhuma etapa é pré-requisito.** Sistemas costumam exigir a ordem
"correta": cadastre, depois converse, depois classifique. Mas a realidade chega
fora de ordem — a pessoa escreve antes de existir no sistema. Exigir a sequência
força o usuário a fazer trabalho administrativo antes do trabalho real, o que
viola `FH-06.01` diretamente. `FH-20.04` estabelece que o eixo é uma **narrativa**,
não um fluxo obrigatório: ele descreve como as coisas se relacionam, não em que
ordem devem ser criadas.

**Por que modelos concorrentes são proibidos.** Cada modelo adicional obriga o
usuário a decidir, a cada tarefa, qual esquema aplicar — e essa decisão é pura
carga extrínseca (`FH-15`). Pior: quando dois modelos convivem, a mesma informação
tende a existir nos dois, e eles divergem. O usuário perde a confiança em ambos.

**Por que o modelo não varia.** A tentação de adaptar o modelo por segmento
("para clínicas, o centro é o paciente; para imobiliárias, o imóvel") produz
produtos diferentes sob o mesmo nome, com documentação, suporte e evolução
divididos. `FH-20.06` fecha essa porta, e o Capítulo 12 já a havia listado como
fronteira permanente.

**Por que estado e histórico são obrigatórios.** Um elemento sem estado observável
não pode ser incorporado ao modelo mental: o usuário não consegue prever seu
comportamento nem explicar o que aconteceu. `FH-20.10` conecta o modelo à
honestidade de estado (P9): pertencer ao eixo implica ser observável.

---

## 5. O eixo canônico

```
   PESSOA  ─────►  CONVERSA  ─────►  PROCESSO  ─────►  RESULTADO
     ▲                                                      │
     └──────────────────────────────────────────────────────┘
                    tudo retorna e converge para a pessoa
```

| Elemento | Pergunta que responde | Materializa-se como |
| --- | --- | --- |
| **Pessoa** | Com quem estamos lidando? | Contato, com histórico, atributos e relações |
| **Conversa** | O que foi dito, quando, por quem? | Thread contínua, multicanal, com estado e responsável |
| **Processo** | Onde isso está, e o que vem agora? | Etapas, funis, automações, tarefas, quadros |
| **Resultado** | O que aconteceu no fim? | Negócio ganho/perdido, atendimento resolvido, métrica |

**Regras de leitura do eixo:**

- A direção é narrativa, não obrigatória (`FH-20.04`).
- Todo elemento à direita **DEVE** ser rastreável até a Pessoa à esquerda
  (`FH-20.02`).
- Funcionalidades de suporte à operação do sistema — conta, cobrança, permissões,
  configuração — **não** ocupam posição no eixo. Elas servem à conta, não à
  operação comercial, e por isso `FH-20.05` não se aplica a elas.

---

## 6. Regras normativas

### `FH-20.01` — Teste de posicionamento

**Quando aplicar.** Antes de construir qualquer funcionalidade de operação.

**Quando NÃO aplicar.** Em funcionalidades administrativas da conta.

**Certo.** "Agendamento de retorno ocupa *Processo*: é etapa de condução."

**Errado.** Construir algo cuja posição no eixo ninguém consegue declarar. Se não
se posiciona, ou é administrativo, ou não pertence ao produto (`FH-12.01`).

### `FH-20.02` — Convergência para a Pessoa

**Quando NÃO aplicar.** Em informação agregada que não pertence a ninguém em
particular: indicadores da conta, consumo, configuração.

**Errado.** Um registro de execução de automação que só é visível na área de
automações, sem aparecer no histórico da pessoa afetada.

### `FH-20.03` — Sem modelos concorrentes

**Quando NÃO aplicar.** Uma **visualização** diferente dos mesmos dados não é um
modelo concorrente. Ver processos em quadro ou em lista são duas visões do mesmo
modelo. O que é proibido é uma segunda ontologia — outra entidade central, outro
vocabulário, outra forma de relacionar as coisas.

**Errado.** Introduzir um conceito paralelo de "ficha" que concorre com contato,
com atributos próprios e histórico separado.

### `FH-20.04` — Entrada por qualquer ponto

**Quando NÃO aplicar.** Quando a dependência é factual e não administrativa: não
existe mensagem sem conversa, nem execução sem automação.

**Errado.** Exigir que um contato tenha etapa definida antes de permitir responder
a ele.

### `FH-20.07` — Coerência entre superfícies

**Errado.** Uma busca que retorna resultados agrupados por módulo interno em vez
de por entidade do modelo. Isso ensina ao usuário a estrutura do sistema em vez de
reforçar o modelo do domínio.

---

## 7. Anti-padrões

**Produto centrado no negócio.** Histórico da pessoa fragmentado entre registros.

**Ordem obrigatória.** Cadastro antes de atendimento.

**Ontologia paralela.** Segunda entidade central introduzida por uma área.

**Modelo por segmento.** Estruturas distintas por tipo de cliente.

**Órfão de eixo.** Funcionalidade que ninguém consegue posicionar.

**Busca por módulo.** Superfície que expõe a arquitetura interna.

---

## 8. Impactos

**Cognitivo.** Um modelo único é aprendido uma vez e aplicado sempre. É a maior
economia cognitiva estrutural disponível — maior que qualquer otimização de tela
isolada.

**Emocional.** Coerência de modelo produz a sensação de que o sistema "faz
sentido". Sua ausência produz a sensação de estar sempre procurando.

**Produtividade.** `FH-20.02` elimina a busca por informação que existe mas está em
outro lugar — uma das maiores fontes de desperdício em sistemas modulares.

**Percepção de qualidade.** O modelo é invisível quando bem feito. Quando mal
feito, aparece como "não sei onde encontrar as coisas" — que o usuário
frequentemente atribui a si mesmo.

**Curva de aprendizagem.** O modelo é a primeira coisa aprendida e a que mais
acelera tudo depois. Modelos concorrentes multiplicam a curva por área.

---

## 9. Riscos e trade-offs

**Risco: forçar encaixe.** Funcionalidades legítimas podem ser distorcidas para
caber no eixo. Mitigação: a saída legítima é emenda (`FH-20.09`), não distorção —
e `FH-12` permite simplesmente recusar.

**Risco: rigidez frente a novos domínios.** Se a operação comercial mudar
estruturalmente, o eixo pode envelhecer. Mitigação: emenda MAIOR com evidência.

**Risco: centralidade excessiva da Pessoa.** Alguns dados legítimos não pertencem a
ninguém. Mitigação: a fronteira de `FH-20.02` já exclui informação agregada.

**Trade-off central.** Trocamos flexibilidade de modelagem por unidade de
compreensão. Algumas funcionalidades serão mais difíceis de acomodar. Em troca, o
usuário aprende um esquema e o aplica ao produto inteiro, hoje e daqui a dez anos.

---

## 10. Critérios de verificação

1. Toda funcionalidade de operação declara sua posição no eixo.
2. Toda informação ligada a alguém é alcançável a partir da pessoa.
3. Nenhuma funcionalidade introduz organização paralela do trabalho.
4. Nenhuma etapa do eixo é pré-requisito administrativo de outra.
5. Toda entidade nova declara posição e relação com a Pessoa.
6. O modelo é idêntico em todas as contas e planos.
7. Navegação, busca, relatórios e IA usam o mesmo modelo.
8. Localizar informação não exige conhecer a estrutura interna.
9. Todo elemento do eixo tem estado observável e histórico.

---

## 11. Checklist do capítulo

- [ ] Consigo declarar a posição disto no eixo.
- [ ] A informação chega até a pessoa a que se refere.
- [ ] Não criei conceito central paralelo.
- [ ] Não exigi ordem administrativa antes do trabalho real.
- [ ] O modelo continua idêntico para todas as contas.
- [ ] A busca e os relatórios refletem o mesmo modelo.
- [ ] O elemento tem estado observável e histórico.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 5 (identidade), 6 (tese), 12 (fronteiras), 15
(cognição).

**É pré-requisito de.** Capítulos 21 (ontologia), 22 (arquitetura da informação),
23 (navegação), 25 (jornada), 47 (busca), 52 (IA), 54 (automações).

---

## 13. Aterrissagem

| Elemento do eixo | Onde vive hoje |
| --- | --- |
| Pessoa | `src/app/(dashboard)/contacts/`, `src/lib/contacts/` |
| Conversa | `src/app/(dashboard)/inbox/`, `src/components/inbox/`, `src/lib/conversation-boards/` |
| Processo | `src/app/(dashboard)/pipelines/`, `flows/`, `automations/`, `boards/` |
| Resultado | `src/app/(dashboard)/dashboard/`, `src/lib/analytics/`, `src/lib/dashboard/` |
| Fora do eixo (administrativo) | `src/app/(dashboard)/settings/`, `admin/`, `src/lib/plans/` |
