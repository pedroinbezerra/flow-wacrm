# Capítulo 5 — Definição Canônica do FlowHub

| Campo | Valor |
| --- | --- |
| Livro | I — Identidade e Filosofia |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 1–4 |
| É pré-requisito de | Todos os capítulos dos Livros I a VIII |
| Artigos | `FH-05.01` a `FH-05.11` |

---

## 0. Núcleo Normativo

**`FH-05.01`** — A definição canônica do FlowHub é: **um sistema operacional para
operações comerciais**, que centraliza pessoas, comunicação, processos,
automações, inteligência e gestão em um único ambiente coeso. Toda descrição do
produto — interna, comercial, na interface ou em documentação — **DEVE** ser
compatível com esta definição.
> **Verificação:** a descrição usada contradiz a definição canônica? → NÃO = cumpre | SIM = viola.

**`FH-05.02`** — O usuário **NUNCA** deve perceber que trocou de módulo. Ao mover-se
entre áreas do produto, permanecem constantes: o vocabulário, a estrutura de
tela, os padrões de interação, o comportamento de estados e o modelo de
navegação.
> **Verificação:** ao passar de uma área a outra, muda algum padrão de estrutura, vocabulário, estado ou navegação sem que a tarefa exija? → NÃO = cumpre | SIM = viola.

**`FH-05.03`** — É proibido justificar uma decisão de produto pela categoria de
software a que o FlowHub se assemelha. "É assim que CRMs fazem", "é o padrão de
ferramentas de atendimento" e equivalentes **NUNCA** constituem fundamento.
> **Verificação:** a justificativa se apoia em convenção de categoria em vez de artigo ou princípio? → NÃO = cumpre | SIM = viola.

**`FH-05.04`** — Toda informação operacional relevante **DEVE** ser alcançável a
partir da pessoa a que se refere, sem que o usuário precise saber em qual área do
sistema ela foi originada.
> **Verificação:** partindo do contato, é possível alcançar esta informação sem conhecer sua origem no sistema? → SIM = cumpre | NÃO = viola.

**`FH-05.05`** — Toda funcionalidade nova **DEVE** passar no **Teste de
Pertencimento**: encaixar-se no eixo **Pessoa → Conversa → Processo → Resultado**
(Capítulo 20). Funcionalidade que não encaixa **NUNCA** é construída sem emenda
que altere o modelo.
> **Verificação:** a funcionalidade se posiciona em algum ponto do eixo canônico? → SIM = cumpre | NÃO = viola.

**`FH-05.06`** — Nenhum canal de comunicação define a identidade do produto. Nomes
de canal, provedor ou tecnologia **NUNCA** aparecem em conceitos centrais,
navegação principal ou nomes de entidade — apenas onde o canal é, ele próprio, a
informação.
> **Verificação:** algum conceito central, item de navegação ou nome de entidade contém nome de canal, provedor ou tecnologia? → NÃO = cumpre | SIM = viola.

**`FH-05.07`** — Uma funcionalidade que exija do usuário aprender um modelo mental
próprio, diferente do modelo do produto, **DEVE** ser redesenhada ou recusada.
Complexidade conceitual isolada é fratura de identidade.
> **Verificação:** entender esta funcionalidade exige aprender conceitos que não existem no restante do produto? → NÃO = cumpre | SIM = viola.

**`FH-05.08`** — Nenhuma funcionalidade pode exigir que o usuário configure outra
área do sistema antes de produzir qualquer valor. Toda capacidade **DEVE** ter um
caminho de primeiro uso com padrões já aplicados.
> **Verificação:** existe caminho para obter valor desta funcionalidade sem configuração prévia em outra área? → SIM = cumpre | NÃO = viola.

**`FH-05.09`** — A navegação e a organização do produto **DEVEM** refletir tarefas
do usuário, **NUNCA** a estrutura interna do sistema, a organização das equipes,
o modelo de dados ou a arquitetura técnica.
> **Verificação:** algum agrupamento da interface só faz sentido para quem conhece a estrutura interna? → NÃO = cumpre | SIM = viola.

**`FH-05.10`** — A mesma entidade **DEVE** ter o mesmo nome em toda a interface,
em todo o código, em toda a documentação e em toda a comunicação. Sinônimos por
área são proibidos.
> **Verificação:** esta entidade é chamada por mais de um nome em algum ponto do produto? → NÃO = cumpre | SIM = viola.

**`FH-05.11`** — O FlowHub **NUNCA** é apresentado ao usuário como uma coleção de
funcionalidades. Descrições internas de produto, textos de interface e
comunicações **DEVEM** partir do que o usuário consegue fazer, não da lista do
que o sistema contém.
> **Verificação:** o texto descreve capacidade do usuário ou inventário do sistema? → Capacidade = cumpre | Inventário = viola.

---

## 1. Propósito

Este capítulo fixa **o que o FlowHub é**. Sem essa definição, todo o restante da
Constituição perde âncora: não há como avaliar se algo "pertence ao produto", se
uma tela "parece FlowHub" ou se uma funcionalidade deve existir.

Ele também fixa **o que o FlowHub não é** — e as não-definições fazem mais
trabalho normativo do que a definição, porque o risco real não é alguém
discordar da identidade. É alguém, sem perceber, importar a lógica de outra
categoria de software e construir a partir dela.

---

## 2. Perguntas que este capítulo responde

- O que é o FlowHub, em uma frase, sem citar concorrentes?
- Por que não chamamos isto de CRM?
- Se um cliente diz "quero um CRM", o que respondemos?
- Como sei se uma funcionalidade pertence ao produto?
- Por que não organizamos a navegação por módulos?
- O WhatsApp faz parte da identidade do produto?
- Pode existir uma área com padrões próprios, se ela for muito diferente?
- Como descrevo o produto na interface?

---

## 3. Definições

**Sistema operacional para operações comerciais** — ambiente onde o trabalho
comercial acontece integralmente, e não um sistema onde ele é registrado depois
de acontecer em outro lugar.

**Operação comercial** — o conjunto de atividades pelas quais uma organização
encontra, atende, negocia com e retém pessoas. Inclui comunicação, qualificação,
negociação, acompanhamento, execução de processo e análise.

**Módulo** — divisão interna do sistema. Existe para quem constrói. **NUNCA**
existe para quem usa.

**Ambiente coeso** — condição na qual padrões, vocabulário e comportamento não
variam conforme a área. É o oposto de um conjunto de ferramentas com login único.

**Canal** — meio pelo qual a comunicação trafega. É atributo de uma conversa,
jamais identidade do produto.

**Teste de Pertencimento** — verificação de `FH-05.05`.

---

## 4. Fundamento

**Por que "sistema operacional".** A expressão não é metáfora de marketing; ela
carrega uma obrigação técnica precisa. Um sistema operacional tem três
propriedades que definem o FlowHub: fornece um ambiente único no qual outras
coisas acontecem; abstrai a complexidade dos recursos subjacentes; e mantém
consistência de comportamento independentemente da tarefa executada. Um produto
que não tem essas três propriedades pode ser excelente — mas é uma ferramenta, e
ferramentas são substituíveis individualmente. Um ambiente não é.

**Por que as não-definições importam mais que a definição.** Cada categoria de
software carrega um conjunto de premissas invisíveis que vêm de brinde quando se
adota o rótulo:

- *CRM* traz a premissa de que o usuário alimenta o sistema — que existe um
  trabalho de registro separado do trabalho real. É exatamente a premissa que o
  Capítulo 6 rejeita.
- *Ferramenta de atendimento* traz a premissa de que a unidade central é o
  chamado, que abre e fecha. No FlowHub a unidade central é a pessoa, que
  permanece.
- *Plataforma de automação* traz a premissa de que o valor está na
  configuração — que o produto é uma tela em branco esperando ser programada.
- *Chatbot* traz a premissa de que a conversa é com a máquina.
- *"Ferramenta de WhatsApp"* traz a premissa mais perigosa de todas: que a
  identidade do produto depende de um canal que pertence a outra empresa e pode
  mudar de regra, de preço ou de existência.

Nenhuma dessas premissas é discutida quando alguém diz "vamos fazer como os CRMs
fazem". Elas entram inteiras, junto com o padrão copiado. Por isso `FH-05.03`
proíbe o argumento de categoria — não porque olhar para outros produtos seja
errado, mas porque **copiar uma solução sem importar o problema que ela resolvia
é o mecanismo pelo qual produtos perdem identidade**.

**Por que o canal não define o produto.** Hoje o WhatsApp é o canal dominante da
operação comercial no Brasil. Isso é uma condição de mercado, não uma verdade
permanente. Um produto cuja identidade está amarrada a um canal terceiro está
amarrado às decisões de outra empresa. `FH-05.06` protege contra isso de forma
concreta: canais são atributos de conversa. Quando outro canal se tornar
dominante, ele entra como atributo, e nenhuma parte da identidade precisa ser
reescrita.

**Por que a coesão é norma e não meta.** Produtos crescem por adição de áreas, e
cada área tende a ser construída por pessoas diferentes, em momentos diferentes,
com referências diferentes. O resultado padrão — o que acontece **sem** norma —
é um conjunto de ferramentas sob o mesmo login: mesma marca, mesmo menu, lógicas
distintas. O usuário percebe isso como esforço: a cada área, ele reaprende. A
coesão só existe se for obrigatória, porque é sempre mais barato, no curto prazo,
construir a área nova do jeito que for mais conveniente para quem constrói.

---

## 5. Princípios

**O produto é um ambiente, não um conjunto de ferramentas.** A diferença é
percebida pelo usuário na primeira vez em que ele muda de área.

**Categoria não é fundamento.** Semelhança com outros produtos nunca justifica
uma decisão.

**Canais passam; a operação permanece.** Nada que pertença a um terceiro pode
ocupar o centro da identidade.

**Se exige aprender um modelo novo, está fora do produto** — mesmo que seja útil.

---

## 6. Regras normativas

### `FH-05.01` — A definição canônica

**Quando aplicar.** Sempre que for necessário descrever, posicionar ou delimitar o
produto.

**Quando NÃO aplicar.** Não substitui a comunicação comercial, que pode usar
linguagem de mercado para ser compreendida. O limite: comunicação pode usar
palavras da categoria; **decisões de produto nunca podem usar a lógica da
categoria** (`FH-05.03`).

**Certo.** "Um sistema onde a operação comercial inteira acontece — atendimento,
negociação, processo e automação — sem trocar de ferramenta."

**Errado.** "Um CRM com automação e WhatsApp integrado." Descreve o produto como
soma de módulos e entrega a identidade a duas categorias e a um canal.

### `FH-05.02` — Ambiente único

**Quando aplicar.** Em toda área do produto, inclusive nas mais especializadas.

**Quando NÃO aplicar.** Quando a tarefa exige, por sua natureza, uma forma de
manipulação distinta — construir um fluxo visual é diferente de responder uma
conversa. Nesses casos, o que muda é a **superfície de manipulação**; permanecem
constantes o vocabulário, a estrutura de tela, o comportamento de estados, a
navegação e os padrões de ação.

**Certo.** O construtor de flows tem uma tela de trabalho própria, mas o
cabeçalho, o modelo de salvamento, o tratamento de erro, o vocabulário e o
caminho de volta são os mesmos do resto do produto.

**Errado.** Uma área com sua própria barra lateral, seu próprio conceito de
"salvar", seu próprio jeito de mostrar erro e seus próprios nomes para as mesmas
coisas. O usuário não a percebe como parte do sistema — percebe como outro
produto embutido, e o custo aparece como hesitação a cada entrada.

### `FH-05.03` — Proibição do argumento de categoria

**Quando aplicar.** Em toda discussão de desenho.

**Quando NÃO aplicar.** Referência externa é legítima como **evidência** de que
uma solução funciona, desde que acompanhada do problema que ela resolve e da
verificação de que esse problema existe aqui.

**Certo.** "Produtos com este padrão reduzem erro de seleção em massa. Nosso
problema é o mesmo: o usuário não vê quantos itens serão afetados. Aplico
`FH-49`."

**Errado.** "Todo CRM tem um campo de estágio obrigatório no cadastro." Descreve
uma convenção, não um problema.

### `FH-05.04` — Convergência para a pessoa

**Quando aplicar.** Em toda informação ligada a alguém: mensagem, negócio,
automação executada, nota, atividade, envio.

**Quando NÃO aplicar.** Em informação agregada que não pertence a ninguém em
particular (indicadores da conta, consumo, configuração).

**Certo.** Abrir um contato mostra o histórico de conversa, os negócios, os
disparos recebidos e as automações que agiram sobre ele — sem que o usuário
precise saber que cada um veio de uma área diferente do sistema.

**Errado.** Exigir que o usuário vá à área de disparos para descobrir se aquela
pessoa recebeu uma campanha. Isso obriga o usuário a conhecer a arquitetura
interna para responder uma pergunta sobre uma pessoa.

### `FH-05.05` — Teste de Pertencimento

**Quando aplicar.** Antes de iniciar qualquer funcionalidade nova.

**Quando NÃO aplicar.** Em funcionalidades de suporte à própria operação do
sistema (configuração, cobrança, permissões), que servem à conta e não à operação
comercial.

**Certo.** "Agendamento de retorno encaixa em *Processo*: é etapa de conduzir uma
pessoa a um resultado."

**Errado.** Construir um módulo de gestão financeira interna porque um cliente
pediu. Não encaixa no eixo — é outro produto. O caminho legítimo, se a decisão
for construir mesmo assim, é emenda ao modelo (Capítulo 20), com todas as
consequências analisadas.

### `FH-05.06` — Canal não é identidade

**Quando aplicar.** Ao nomear conceitos, entidades, seções de navegação e
funcionalidades.

**Quando NÃO aplicar.** Onde o canal é a informação: escolher por qual canal
enviar, exibir de qual canal veio uma mensagem, configurar a conexão com um
provedor. Aí o nome do canal é o conteúdo, e omiti-lo seria falta de clareza.

**Certo.** "Conversas", com o canal indicado em cada uma.

**Errado.** Uma seção de navegação chamada com o nome do canal. Isso ensina ao
usuário um modelo mental em que canais organizam o trabalho — e o dia em que um
segundo canal existir, o modelo quebra e a navegação precisa ser reaprendida.

### `FH-05.07` — Sem modelos mentais paralelos

**Quando aplicar.** Ao desenhar qualquer capacidade que introduza conceitos.

**Quando NÃO aplicar.** Quando o conceito novo é genuinamente irredutível e passa
a integrar o modelo do produto por emenda ao Capítulo 21 — passando, portanto, a
valer em todo lugar, e não apenas naquela área.

**Certo.** Reutilizar os conceitos existentes de contato, conversa, etapa e
automação para construir uma capacidade nova.

**Errado.** Introduzir, em uma única área, um conceito próprio que só existe ali,
com suas próprias regras e seu próprio vocabulário. O usuário passa a manter dois
modelos na cabeça, e a carga de troca de contexto reaparece a cada visita.

### `FH-05.08` — Valor sem configuração prévia

**Quando aplicar.** Em toda funcionalidade nova.

**Quando NÃO aplicar.** Quando a configuração é a própria funcionalidade
(conectar um canal, definir permissões da conta).

**Certo.** A funcionalidade funciona com padrões aplicados e oferece
personalização depois, no ponto de uso.

**Errado.** "Para usar isto, primeiro configure em três outras telas." Cada
configuração prévia obrigatória é um ponto de abandono, e o abandono acontece
antes de o usuário ter visto qualquer valor — ou seja, sem nenhuma razão para
persistir.

### `FH-05.09` — Organização por tarefa

**Quando aplicar.** Em navegação, agrupamentos, menus e organização de
configurações.

**Quando NÃO aplicar.** Em áreas administrativas destinadas a quem opera o
sistema, e não o negócio.

**Certo.** Agrupar por aquilo que o usuário quer fazer.

**Errado.** Agrupar espelhando tabelas do banco, times internos ou a ordem
histórica em que as funcionalidades foram construídas. O usuário não conhece
nenhuma dessas coisas e não deveria precisar conhecer.

### `FH-05.10` — Nome único por entidade

**Quando aplicar.** Sempre. Detalhado no Capítulo 59.

**Quando NÃO aplicar.** Nunca. Renomear exige transição planejada, jamais
coexistência permanente de dois nomes.

**Certo.** A mesma coisa se chama igual na interface, no código, no banco, na
documentação e no suporte.

**Errado.** Um conceito chamado de um jeito na navegação, de outro no relatório e
de um terceiro na mensagem de erro. O usuário conclui — corretamente — que são
coisas diferentes.

### `FH-05.11` — Capacidade, não inventário

**Quando aplicar.** Em textos de interface, estados vazios, onboarding e
comunicação de novidade.

**Quando NÃO aplicar.** Em documentação de referência, onde a enumeração é a
função do texto.

**Certo.** "Responda todas as conversas em um lugar só."

**Errado.** "Módulo de inbox com atribuição, status e notas." O usuário precisa
traduzir uma lista de peças em uma capacidade — trabalho que deveria ter sido
feito por quem escreveu.

---

## 7. Anti-padrões

**Produto-Frankenstein.** Áreas construídas em épocas diferentes, cada uma com sua
lógica. Sintoma: o usuário pergunta "por que aqui funciona diferente?".

**Importação de categoria.** Copiar um padrão de outro produto junto com premissas
não examinadas. Sintoma: campos obrigatórios que ninguém sabe justificar.

**Identidade emprestada de canal.** Nomear o produto ou suas seções pelo canal
dominante. Sintoma: a chegada de um segundo canal exige redesenho de navegação.

**Navegação-organograma.** A interface reflete a estrutura de quem construiu.
Sintoma: o usuário precisa saber "de quem é" a funcionalidade para encontrá-la.

**Ilha conceitual.** Uma área com vocabulário e modelo próprios. Sintoma: aquela
área concentra desproporcionalmente as dúvidas de suporte.

**Configuração como pedágio.** Valor só depois de configurar. Sintoma: alta
desistência antes do primeiro uso real.

---

## 8. Impactos

**Cognitivo.** A coesão elimina o custo de reaprendizagem por área. Em um produto
coeso, o usuário aprende um conjunto de padrões e o aplica em todo lugar; em um
produto fragmentado, ele mantém um modelo por área e paga o custo de troca a cada
transição. Esse custo é invisível individualmente e enorme no acumulado de uma
jornada de trabalho.

**Emocional.** Coesão produz sensação de solidez. Fragmentação produz desconfiança
difusa: quando uma área se comporta de forma inesperada, o usuário passa a
duvidar de todas — inclusive das que funcionam bem.

**Produtividade.** `FH-05.04` e `FH-05.08` atacam as duas maiores fontes de
desperdício em software de operação: procurar informação que existe e configurar
antes de trabalhar.

**Percepção de qualidade.** É o capítulo de maior efeito sobre a impressão geral.
O usuário raramente elogia coesão explicitamente — ele diz "é bem feito". O
inverso ele nomeia com precisão: "parece que foram vários sistemas colados".

**Curva de aprendizagem.** Um produto coeso tem curva única. Um produto
fragmentado tem uma curva por área, e a curva reinicia parcialmente a cada área
nova — o que torna a expansão de uso desproporcionalmente cara para o usuário.

---

## 9. Riscos e trade-offs

**Risco: uniformidade forçada.** Impor o mesmo padrão a tarefas de natureza
distinta pode piorar a tarefa especializada. Mitigado pela fronteira explícita de
`FH-05.02`: a superfície de manipulação pode variar; a gramática do sistema, não.

**Risco: recusar valor real.** O Teste de Pertencimento fará o produto recusar
funcionalidades que clientes querem e pagariam por. É um custo comercial real e
assumido. A alternativa — aceitar tudo — produz um produto que faz muitas coisas
sem ser bom em nenhuma identidade, e esse é o estado do qual não se volta.

**Risco: rigidez de nomenclatura.** `FH-05.10` torna renomeações caras. É
intencional: nomes são o modelo mental do usuário, e trocá-los custa mais a ele
do que a nós.

**Trade-off central.** Trocamos velocidade de expansão por integridade de
identidade. Cada funcionalidade demora mais para entrar porque precisa encaixar.
Em compensação, tudo que entra soma — em vez de apenas acumular.

---

## 10. Critérios de verificação

1. Nenhuma área do produto usa padrões estruturais, de vocabulário ou de estado
   divergentes sem justificativa registrada.
2. Nenhum item de navegação ou nome de entidade contém nome de canal, provedor ou
   tecnologia.
3. Toda informação ligada a uma pessoa é alcançável a partir dela.
4. Toda funcionalidade nova tem o Teste de Pertencimento registrado.
5. Nenhuma funcionalidade exige configuração em outra área para produzir valor.
6. Nenhuma entidade possui mais de um nome no produto.
7. Nenhuma justificativa de decisão se apoia em convenção de categoria.

---

## 11. Checklist do capítulo

- [ ] Consigo posicionar isto no eixo Pessoa → Conversa → Processo → Resultado.
- [ ] Estou reutilizando conceitos existentes, não criando um modelo paralelo.
- [ ] O vocabulário, a estrutura e o comportamento de estado são os do produto.
- [ ] Nenhum nome de canal ou tecnologia entrou em conceito central.
- [ ] Existe caminho de valor sem configuração prévia em outra área.
- [ ] A informação é alcançável a partir da pessoa a que se refere.
- [ ] Minha justificativa não é "é assim que fazem".

---

## 12. Referências cruzadas

**Depende de.** Capítulos 1–4.

**É pré-requisito de.** Capítulo 6 (tese), 7 (princípios), 12 (fronteiras), 20
(modelo mental), 21 (ontologia), 22 (arquitetura da informação), 59
(nomenclatura).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Áreas do produto | `src/app/(dashboard)/` |
| Navegação principal | `src/components/layout/sidebar.tsx` |
| Vocabulário de interface | `src/i18n/messages/pt-BR.json` |
| Entidades de domínio | `src/types/index.ts` |
| Convergência para a pessoa | `src/app/(dashboard)/contacts/`, `src/lib/contacts/` |
| Canais e provedores (atributo, não identidade) | `src/lib/whatsapp/` |
