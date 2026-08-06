# Capítulo 13 — Arquétipos Operacionais

| Campo | Valor |
| --- | --- |
| Livro | II — O Ser Humano |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 5, 6, 7 |
| É pré-requisito de | Capítulos 14–19, 24, 36, 37, 51 |
| Artigos | `FH-13.01` a `FH-13.10` |

---

## 0. Núcleo Normativo

**`FH-13.01`** — Os cinco arquétipos de §5 são a **única segmentação válida** de
usuário para decisões de produto. Segmentação demográfica, por porte de empresa,
por setor ou por persona de marketing **NUNCA** fundamenta decisão de experiência.
> **Verificação:** a decisão se fundamenta em arquétipo operacional? → SIM = cumpre | NÃO = viola.

**`FH-13.02`** — Quando uma decisão afeta uso **diário**, a ordem de prioridade
entre arquétipos é: **Operador → Gestor → Construtor → Responsável → Visitante**.
Quem paga o custo com mais frequência decide primeiro.
> **Verificação:** havendo conflito em tarefa diária, a solução privilegiou o arquétipo de maior frequência de uso? → SIM = cumpre | NÃO = viola.

**`FH-13.03`** — Toda funcionalidade **DEVE** declarar o arquétipo primário que
serve e o impacto sobre os demais.
> **Verificação:** a declaração de arquétipo primário e impactos existe? → SIM = cumpre | NÃO = viola.

**`FH-13.04`** — Nenhuma decisão pode melhorar a experiência de um arquétipo
**degradando** a do Operador em tarefa de alta frequência.
> **Verificação:** esta mudança adiciona passos, decisões ou espera a uma tarefa de alta frequência do Operador? → NÃO = cumpre | SIM = viola.

**`FH-13.05`** — **NUNCA** existirá versão, modo ou produto separado por arquétipo.
Todos operam o mesmo sistema, com a mesma gramática (`FH-05.02`, `FH-07.09`).
> **Verificação:** a solução cria interface estruturalmente distinta por tipo de usuário? → NÃO = cumpre | SIM = viola.

**`FH-13.06`** — **Papel** (permissão, definido pela conta) e **arquétipo** (modo de
trabalho, definido pelo comportamento) são conceitos distintos. É proibido inferir
um do outro ou usar permissão como proxy de necessidade.
> **Verificação:** a decisão usa papel de permissão como substituto de arquétipo? → NÃO = cumpre | SIM = viola.

**`FH-13.07`** — Toda tarefa acessível ao **Visitante** **DEVE** ser executável sem
aprendizado prévio, sem treinamento e sem contexto acumulado.
> **Verificação:** alguém que entra pela primeira vez conclui esta tarefa sem instrução externa? → SIM = cumpre | NÃO = viola.

**`FH-13.08`** — O **Construtor** **NUNCA** é obrigado a conhecer conceitos de
programação, estrutura de dados ou lógica técnica para criar automações e
processos.
> **Verificação:** construir isto exige conceito técnico de implementação? → NÃO = cumpre | SIM = viola.

**`FH-13.09`** — Toda tela **DEVE** ser utilizável pelo arquétipo de **menor
familiaridade** que legitimamente a acessa. Otimizar para o especialista **NUNCA**
pode tornar a tela inacessível ao iniciante.
> **Verificação:** o arquétipo de menor familiaridade com acesso legítimo consegue usar esta tela? → SIM = cumpre | NÃO = viola.

**`FH-13.10`** — **Frequência de uso** é o critério que define densidade, atalho,
posição e otimização — nunca a preferência de quem constrói nem a importância
declarada da funcionalidade.
> **Verificação:** as decisões de densidade e posição derivam de frequência real de uso? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo define **para quem o produto é otimizado** — e, sobretudo, como
resolver o conflito quando otimizar para um piora para outro. Sem essa definição,
"o usuário" vira uma abstração que cada pessoa preenche com quem tem em mente
naquele momento, e decisões contraditórias parecem todas justificadas.

---

## 2. Perguntas que este capítulo responde

- Para quem otimizamos primeiro?
- Quem é o usuário de maior volume? E o de maior poder?
- Como sei se uma decisão prejudica alguém?
- Podemos ter uma versão simplificada para quem usa pouco?
- Papel de permissão define necessidade de interface?
- Quem constrói automação precisa pensar como programador?

---

## 3. Definições

**Arquétipo operacional** — padrão de trabalho definido por objetivo, frequência,
ritmo e tolerância a erro. Não é cargo, não é permissão, não é demografia.

**Papel** — nível de permissão atribuído pela conta. Governado pelo Capítulo 51.

**Frequência de uso** — quantas vezes por jornada uma tarefa é executada. Critério
objetivo, medido, nunca estimado por intuição.

**Familiaridade** — quanto contexto acumulado o usuário tem sobre o produto.

**Tarefa de alta frequência** — executada muitas vezes ao dia pelo mesmo usuário.

---

## 4. Fundamento

**Por que arquétipos e não personas.** Personas de marketing descrevem quem compra;
arquétipos descrevem quem trabalha. As duas informações são úteis, para decisões
diferentes. O erro comum é usar a primeira para decidir a segunda: otimizar a
interface para o perfil de compra do decisor, que muitas vezes usa o produto uma
vez por semana, enquanto quem passa oito horas nele é outra pessoa, sem voz na
compra.

**Por que o Operador vem primeiro.** A prioridade de `FH-13.02` não é hierárquica
nem política; é aritmética. Um passo adicional em uma tarefa executada duzentas
vezes por dia custa duzentas vezes mais do que o mesmo passo em uma tarefa
semanal. Quando uma decisão beneficia quem usa pouco e prejudica quem usa muito, o
custo agregado é quase sempre negativo — mesmo quando quem usa pouco tem mais
poder na organização.

**Por que a prioridade não é absoluta.** Ela vale para conflitos em **uso diário**.
Em decisões que não afetam a rotina operacional — configuração da conta,
cobrança, relatório mensal — o arquétipo primário é outro, e otimizar para o
Operador ali seria otimizar para quem não está.

**Por que papel não define arquétipo.** É tentador usar permissão como atalho: quem
é administrador vê mais, quem é agente vê menos. Mas permissão responde "o que
esta pessoa pode fazer", e arquétipo responde "como esta pessoa trabalha". Um
responsável pela conta pode ser também o operador de maior volume em uma equipe
pequena. Confundir os dois produz interfaces que escondem do administrador
justamente as ferramentas de trabalho que ele mais usa.

**Por que não existe versão simplificada.** A tentação de criar um "modo básico"
para quem usa pouco é forte e sempre malsucedida: divide o produto, duplica a
manutenção, fragmenta o vocabulário e impede a progressão natural do usuário
(P8). A solução constitucional é revelação progressiva no mesmo lugar
(`FH-08.04`), e não bifurcação.

---

## 5. Os cinco arquétipos

### A1 — Operador

Quem atende, responde e conduz conversas o dia inteiro.

| Dimensão | Característica |
| --- | --- |
| Objetivo | Responder bem e rápido, sem deixar ninguém esperando |
| Frequência | Uso contínuo, jornada inteira |
| Ritmo | Alto, interrompido, múltiplos itens simultâneos |
| Entrada | Teclado predominante; mouse como complemento |
| Tolerância a erro | Baixa — erro é visto pelo cliente dele |
| O que o irrita | Passos extras, espera, perda de contexto, confirmação redundante |
| O que o encanta | O sistema já ter preparado o que ele ia fazer |

### A2 — Gestor

Quem acompanha, decide e distribui trabalho.

| Dimensão | Característica |
| --- | --- |
| Objetivo | Saber onde está o problema antes que ele cresça |
| Frequência | Várias vezes ao dia, sessões curtas |
| Ritmo | Rápido para diagnosticar, lento para decidir |
| Entrada | Frequentemente superfície pequena, em movimento |
| Tolerância a erro | Média — erro custa decisão errada |
| O que o irrita | Número sem contexto, dado que não explica a causa |
| O que o encanta | Ver a origem de um número em um passo |

### A3 — Construtor

Quem desenha processos, automações e fluxos.

| Dimensão | Característica |
| --- | --- |
| Objetivo | Fazer o sistema trabalhar sozinho, sem quebrar nada |
| Frequência | Episódica e concentrada |
| Ritmo | Lento, deliberado, iterativo |
| Entrada | Superfície grande, sessão longa |
| Tolerância a erro | Muito baixa — erro dele afeta terceiros em massa |
| O que o irrita | Não conseguir prever o efeito antes de ativar |
| O que o encanta | Simular e ver exatamente o que aconteceria |

### A4 — Responsável pela conta

Quem responde pelo risco, pelo custo e pelo acesso.

| Dimensão | Característica |
| --- | --- |
| Objetivo | Manter a operação funcionando, segura e dentro do custo |
| Frequência | Baixa, mas em momentos críticos |
| Ritmo | Cauteloso |
| Entrada | Variável |
| Tolerância a erro | Mínima — erro afeta a organização inteira |
| O que o irrita | Consequência descoberta tarde; custo sem aviso prévio |
| O que o encanta | Saber o impacto antes de confirmar |

### A5 — Visitante

Quem entra raramente, para uma tarefa específica.

| Dimensão | Característica |
| --- | --- |
| Objetivo | Resolver uma coisa e sair |
| Frequência | Rara, sem acúmulo de contexto |
| Ritmo | Hesitante |
| Entrada | Qualquer |
| Tolerância a erro | Alta para si, baixa para o sistema — desiste rápido |
| O que o irrita | Precisar aprender algo para uma tarefa única |
| O que o encanta | Conseguir sem perguntar a ninguém |

---

## 6. Regras normativas

### `FH-13.02` — Ordem de prioridade

**Quando aplicar.** Em conflito que afeta tarefa diária.

**Quando NÃO aplicar.** Em superfícies cujo arquétipo primário não é o Operador:
configuração de conta (A4), construção de automação (A3), relatórios (A2). Aplicar
a prioridade fora de contexto otimiza para quem não está usando.

**Certo.** Uma melhoria no relatório que adicionaria um passo ao atendimento é
redesenhada para não tocar o fluxo de atendimento.

**Errado.** Adicionar um campo obrigatório na resposta a uma conversa porque
facilita um relatório mensal. Custo diário para benefício mensal.

### `FH-13.04` — Proteção do Operador

**Quando aplicar.** Em toda alteração que toque fluxo de alta frequência.

**Quando NÃO aplicar.** Quando o passo adicionado previne dano irreversível
(`FH-03.02`) — segurança vence frequência.

### `FH-13.07` — Visitante sem aprendizado

**Quando aplicar.** Em convites, aprovações, formulários públicos, tarefas
pontuais.

**Errado.** Uma aprovação que exige entender o vocabulário do produto para decidir.

### `FH-13.08` — Construtor sem tecnicidade

**Quando aplicar.** Em automações, flows, condições e campos calculados.

**Quando NÃO aplicar.** Quando o conceito pertence ao **negócio** do usuário, e não
à implementação — regras do canal, prazos, limites de envio.

**Errado.** Exigir compreensão de expressão condicional, estrutura de dados ou
tipo de variável para montar uma automação.

### `FH-13.09` — Teto pelo menos familiar

**Quando aplicar.** Em toda tela com acesso multiarquétipo.

**Quando NÃO aplicar.** Em telas de acesso restrito a um único arquétipo por
permissão.

---

## 7. Anti-padrões

**Otimização para o comprador.** A interface serve a quem decidiu a compra, não a
quem trabalha.

**Modo básico.** Bifurcação do produto por familiaridade. Proibido por `FH-13.05`.

**Permissão como interface.** Esconder ferramentas por papel em vez de por
necessidade. Proibido por `FH-13.06`.

**Construtor-programador.** Expor lógica técnica em ferramenta de automação.

**Frequência estimada.** Decidir densidade e posição por intuição sobre o que é
importante, em vez de por uso real.

**Média de todos.** Otimizar para um usuário médio que não existe, deixando todos
os arquétipos igualmente mal atendidos.

---

## 8. Impactos

**Cognitivo.** `FH-13.09` protege o iniciante do custo de telas otimizadas para
especialistas — sem impor teto ao especialista, o que seria a solução preguiçosa.

**Emocional.** A prioridade explícita de `FH-13.02` legitima a experiência de quem
usa o produto o dia inteiro e raramente tem voz nas decisões de compra.

**Produtividade.** É o capítulo que converte prioridade em aritmética: passos ×
frequência. Torna discutível por número o que normalmente é discutido por opinião.

**Percepção de qualidade.** Produtos que otimizam para o comprador são percebidos
como "bonitos e ruins de usar" por quem trabalha neles — e é essa percepção que
determina renovação.

**Curva de aprendizagem.** `FH-13.05` mantém uma curva única. Bifurcação por modo
cria duas curvas e impede a travessia de uma para a outra.

---

## 9. Riscos e trade-offs

**Risco: negligenciar arquétipos de baixa frequência.** A prioridade pode ser lida
como permissão para descuidar de A4 e A5. Mitigação: `FH-13.09` e `FH-13.07`
estabelecem pisos independentes de prioridade.

**Risco: densidade excessiva.** Otimizar para o Operador pode produzir telas
ilegíveis para os demais. Mitigação: `FH-13.09` novamente — o teto é o arquétipo
menos familiar com acesso legítimo.

**Risco: rigidez da ordem.** Casos reais podem não caber. Mitigação: a ordem vale
para uso diário; fora dele, o arquétipo primário é declarado por `FH-13.03`.

**Trade-off central.** Trocamos a satisfação uniforme de todos pela proteção de
quem usa mais. É uma escolha explícita de quem carrega o custo — e essa escolha
sempre existe. A diferença é fazê-la conscientemente.

---

## 10. Critérios de verificação

1. Toda funcionalidade declara arquétipo primário e impacto sobre os demais.
2. Nenhuma decisão adiciona passos a tarefa de alta frequência sem prevenir dano.
3. Nenhuma segmentação de experiência usa demografia, porte ou setor.
4. Nenhuma interface estruturalmente distinta foi criada por tipo de usuário.
5. Nenhuma decisão usa papel de permissão como proxy de necessidade.
6. Tarefas de visitante são executáveis sem aprendizado prévio.
7. Nenhuma construção de automação exige conceito técnico.
8. Densidade e posição derivam de frequência real medida.

---

## 11. Checklist do capítulo

- [ ] Declarei o arquétipo primário desta funcionalidade.
- [ ] Verifiquei o impacto sobre os outros quatro.
- [ ] Não adicionei passos ao fluxo diário do Operador.
- [ ] O arquétipo menos familiar com acesso legítimo consegue usar esta tela.
- [ ] Não criei modo, versão ou produto separado.
- [ ] Não usei papel de permissão como substituto de necessidade.
- [ ] Minhas decisões de densidade vêm de frequência real, não de intuição.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 5, 6, 7.

**É pré-requisito de.** Capítulos 14 (contexto), 15 (cognição), 16 (fluência), 19
(ergonomia), 24 (composição), 36 (densidade), 37 (responsividade), 51
(permissões).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Superfície do Operador | `src/app/(dashboard)/inbox/`, `src/components/inbox/` |
| Superfície do Gestor | `src/app/(dashboard)/dashboard/`, `src/lib/analytics/` |
| Superfície do Construtor | `src/app/(dashboard)/flows/`, `automations/`, `src/components/flows/` |
| Superfície do Responsável | `src/app/(dashboard)/settings/`, `src/lib/plans/`, `src/lib/consumption/` |
| Superfície do Visitante | `src/app/(auth)/`, convites em `src/components/settings/invite-member-dialog.tsx` |
| Papéis de permissão (≠ arquétipo) | `src/hooks/` (permissões), `roles` em `src/i18n/messages/pt-BR.json` |
