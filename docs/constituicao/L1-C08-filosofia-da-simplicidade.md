# Capítulo 8 — Filosofia da Simplicidade

| Campo | Valor |
| --- | --- |
| Livro | I — Identidade e Filosofia |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 5, 6, 7 (P1, P8) |
| É pré-requisito de | Capítulos 15, 22, 24, 34, 35, 36 |
| Artigos | `FH-08.01` a `FH-08.11` |

---

## 0. Núcleo Normativo

**`FH-08.01`** — Simplicidade no FlowHub significa **ocultar complexidade**, jamais
**reduzir capacidade**. É proibido remover poder do usuário e chamar o resultado
de simplificação.
> **Verificação:** esta mudança remove alguma capacidade que o usuário possuía? → NÃO = cumpre | SIM = viola.

**`FH-08.02`** — Toda tela tem **orçamento de decisões**: no máximo **três decisões
simultâneas** exigidas do usuário para concluir a tarefa dominante. O excedente
**DEVE** ir para revelação progressiva, padrão inteligente ou outro momento.
> **Verificação:** concluir a tarefa dominante exige mais de três decisões simultâneas? → NÃO = cumpre | SIM = viola.

**`FH-08.03`** — O padrão inteligente é a forma primária de simplicidade. Antes de
oferecer uma escolha ao usuário, **DEVE** ser demonstrado que o sistema não pode
decidir sozinho com informação que já possui.
> **Verificação:** o sistema poderia decidir isto sozinho com o que já sabe? → NÃO = cumpre | SIM = viola.

**`FH-08.04`** — Esconder **NUNCA** é omitir. Toda capacidade ocultada **DEVE**
possuir caminho de descoberta no próprio ponto de uso, sem exigir documentação,
busca ou conhecimento prévio.
> **Verificação:** existe caminho visível de descoberta desta capacidade no ponto onde ela é útil? → SIM = cumpre | NÃO = viola.

**`FH-08.05`** — Nenhuma capacidade fica a mais de **um nível de profundidade** do
ponto onde é útil. Capacidade escondida atrás de dois ou mais passos de revelação
é considerada inexistente.
> **Verificação:** quantos passos separam esta capacidade do ponto de uso? → 1 ou 0 = cumpre | 2+ = viola.

**`FH-08.06`** — Todo elemento de tela **DEVE** justificar sua presença: ele
informa uma decisão, permite uma ação, ou revela um estado. Elemento que não faz
nenhuma das três **DEVE** ser removido.
> **Verificação:** este elemento informa decisão, permite ação ou revela estado? → SIM = cumpre | NÃO = viola.

**`FH-08.07`** — Simplicidade **NUNCA** é obtida removendo informação de estado.
Quando simplicidade e honestidade de estado colidirem, vence a honestidade
(P9 > P1 nesta colisão específica).
> **Verificação:** a simplificação removeu alguma informação sobre o estado real do sistema? → NÃO = cumpre | SIM = viola.

**`FH-08.08`** — Complexidade acidental **NUNCA** aparece na interface:
identificadores internos, códigos de erro técnicos, nomes de tabela, jargão de
implementação e conceitos de fornecedor.
> **Verificação:** existe na interface algum termo ou código que só faz sentido para quem construiu o sistema? → NÃO = cumpre | SIM = viola.

**`FH-08.09`** — Cada tela tem **uma tarefa dominante**. Tarefas secundárias
existem, mas **NUNCA** competem visualmente com a dominante nem exigem decisão
para que ela seja concluída.
> **Verificação:** é possível nomear a tarefa dominante desta tela em uma frase? → SIM = cumpre | NÃO = viola.

**`FH-08.10`** — Excesso de conteúdo **NUNCA** é resolvido apenas por abas, rolagem
ou agrupamento visual. Toda divisão **DEVE** ser precedida de decisão de
prioridade sobre o que é essencial.
> **Verificação:** houve decisão explícita de prioridade antes da divisão? → SIM = cumpre | NÃO = viola.

**`FH-08.11`** — É proibido responder a uma dificuldade adicionando elemento à
tela. A primeira resposta considerada **DEVE** sempre ser remover, agrupar ou
decidir pelo usuário.
> **Verificação:** a solução adotada adiciona elemento sem que remover, agrupar ou decidir tenha sido considerado e descartado por escrito? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

O Capítulo 7 estabeleceu o princípio P1: complexidade pertence ao sistema. Este
capítulo o transforma em método — como esconder complexidade sem escondê-la de
quem precisa dela, e onde está a fronteira entre simples e insuficiente.

---

## 2. Perguntas que este capítulo responde

- Como adiciono poder sem adicionar complicação?
- Quantas opções são demais em uma tela?
- Onde escondo o que é avançado?
- Qual a diferença entre esconder e omitir?
- Posso remover uma funcionalidade pouco usada em nome da simplicidade?
- A tela ficou cheia. Divido em abas?
- Um usuário se confundiu. Adiciono uma explicação?

---

## 3. Definições

**Complexidade essencial** — a que pertence ao problema do usuário. Não pode ser
eliminada, apenas absorvida ou organizada.

**Complexidade acidental** — a que existe por causa de como o sistema foi
construído. Sempre pode e deve ser eliminada da percepção do usuário.

**Orçamento de decisões** — número máximo de escolhas simultâneas exigidas para
concluir a tarefa dominante de uma tela.

**Revelação progressiva** — expor capacidade adicional no ponto de uso, quando o
contexto a torna pertinente.

**Tarefa dominante** — a razão pela qual o usuário abriu aquela tela.

**Simplificação falsa** — remoção de capacidade apresentada como melhoria de
experiência. Proibida por `FH-08.01`.

---

## 4. Fundamento

**Simplicidade não é ausência; é alocação.** Um produto simples e um produto
limitado parecem idênticos no primeiro dia e são opostos no centésimo. A
diferença está em onde a complexidade foi colocada: um a absorveu, o outro a
descartou junto com a capacidade. Descartar é fácil, barato e produz uma primeira
impressão excelente — por isso é a armadilha mais comum em produtos que se
declaram simples.

**O orçamento de decisões existe porque atenção é finita.** A memória de trabalho
humana opera com poucos elementos simultâneos, e cada decisão pendente ocupa um
deles. Uma tela que exige três decisões deixa espaço para o usuário pensar sobre o
próprio trabalho; uma tela que exige sete consome a capacidade inteira, e o
usuário decide por eliminação, aceitando o primeiro caminho plausível em vez do
melhor. O número três não é arbitrário: é o limite abaixo do qual o usuário ainda
consegue manter o objetivo original em mente enquanto decide.

**Por que esconder é diferente de omitir.** Esconder bem feito é o que produz a
sensação de poder progressivo (P8): a capacidade está lá, aparece quando faz
sentido, e quem precisa dela a encontra sem procurar. Esconder mal feito é
indistinguível de não ter: a capacidade existe, ninguém a encontra, e a equipe
acredita que ela foi entregue. `FH-08.05` fixa o limite em um nível porque cada
nível adicional de profundidade reduz drasticamente a descoberta — a maioria dos
usuários nunca abre o segundo.

**Por que a primeira resposta é sempre remover.** Diante de uma dificuldade, a
resposta instintiva é adicionar: um rótulo, uma dica, um aviso, um campo. Cada
adição resolve o caso imediato e piora o conjunto, porque consome orçamento de
decisão de todos os usuários para atender à confusão de alguns. `FH-08.11` inverte
a ordem de consideração — não proíbe adicionar, exige que remover, agrupar e
decidir pelo usuário sejam considerados e descartados **por escrito** antes.

**O limite da simplicidade.** `FH-08.07` marca a fronteira que não se cruza:
esconder complexidade nunca inclui esconder a verdade sobre o estado do sistema.
Uma interface que omite que algo falhou parcialmente é mais simples e é
desonesta — e a desonestidade custa confiança, que é o único ativo que não se
reconstrói com uma correção.

---

## 5. Princípios

**Complexidade se aloca, não se elimina.** A pergunta nunca é "como reduzir?", é
"quem paga?".

**Simples é o que exige pouco, não o que faz pouco.**

**O que está a dois cliques de distância não existe.**

**Adicionar é a última resposta, nunca a primeira.**

---

## 6. Regras normativas

### `FH-08.01` — Ocultar, não amputar

**Quando aplicar.** Em toda proposta de "simplificar".

**Quando NÃO aplicar.** Quando a capacidade removida é comprovadamente inutilizada
**e** sua remoção passa pelo ciclo de depreciação (Capítulo 66). Remover é
legítimo; chamar remoção de simplificação não é.

**Certo.** Uma configuração usada por poucos deixa de aparecer no fluxo principal
e passa a viver no ponto de uso, acessível a um nível.

**Errado.** Excluir a configuração e comunicar como "interface mais limpa". Quem a
usava perdeu capacidade, e a limpeza foi paga por ele.

### `FH-08.02` — Orçamento de decisões

**Quando aplicar.** Em toda tela com formulário, configuração ou fluxo.

**Quando NÃO aplicar.** Em telas cuja tarefa dominante **é** decidir entre muitas
opções — uma seleção de destinatários, por exemplo. Aí a decisão é o trabalho, e o
que se aplica é o Capítulo 36 (densidade e escala).

**Certo.** Um envio pede o essencial e aplica padrões ao resto, com ajuste fino
disponível a um nível.

**Errado.** Sete campos obrigatórios porque cada um pareceu importante para
alguém. O resultado é que o usuário preenche rápido e errado, e a qualidade do
dado cai justamente por excesso de exigência.

### `FH-08.03` — Padrão antes de escolha

**Quando aplicar.** Antes de introduzir qualquer opção.

**Quando NÃO aplicar.** Quando a escolha depende de informação que só o usuário
tem, ou quando errar tem consequência externa (`FH-07.03`).

### `FH-08.04` — Esconder com descoberta

**Quando aplicar.** Em toda capacidade não exposta no primeiro nível.

**Quando NÃO aplicar.** Em capacidades administrativas de conta, cujo lugar
canônico é a área de configurações.

**Certo.** A ação avançada aparece no menu do próprio item sobre o qual atua.

**Errado.** A ação existe apenas por atalho de teclado não anunciado em lugar
nenhum. Existe para quem já sabe — ou seja, para ninguém novo.

### `FH-08.05` — Um nível de profundidade

**Quando aplicar.** Sempre.

**Quando NÃO aplicar.** Em fluxos de configuração inicial, percorridos uma vez.

### `FH-08.06` — Justificação de presença

**Quando aplicar.** Em revisão de qualquer tela.

**Quando NÃO aplicar.** Em elementos estruturais de orientação (cabeçalho de
seção, indicador de posição), que revelam estado por definição.

**Errado.** Ícone decorativo em área operacional densa; texto que repete o que o
título já disse; contador que ninguém usa para decidir.

### `FH-08.07` — Honestidade acima de limpeza

**Quando aplicar.** Sempre que a simplificação tocar representação de estado.

**Quando NÃO aplicar.** Nunca.

**Errado.** Exibir "concluído" em uma operação com falhas parciais porque mostrar
o detalhe "polui" a tela. O usuário descobrirá depois, no pior momento possível, e
passará a desconfiar de todos os "concluído" do produto.

### `FH-08.08` — Sem complexidade acidental

**Quando aplicar.** Em todo texto de interface.

**Quando NÃO aplicar.** Quando o identificador é necessário para o usuário agir
fora do sistema (falar com suporte, conferir em outro serviço). Nesse caso ele é
informação, e deve vir com o motivo pelo qual está sendo mostrado.

### `FH-08.09` — Uma tarefa dominante

**Quando aplicar.** No desenho de qualquer tela.

**Quando NÃO aplicar.** Em painéis de visão geral, cuja tarefa dominante é
justamente orientar para outras tarefas.

### `FH-08.10` — Prioridade antes de divisão

**Quando aplicar.** Sempre que uma tela "não couber".

**Quando NÃO aplicar.** Quando as seções representam tarefas genuinamente
distintas, e não fragmentos da mesma.

**Errado.** Distribuir vinte campos em quatro abas. O usuário continua com vinte
decisões — agora com o custo adicional de não ver todas ao mesmo tempo e de não
saber em qual aba está o que procura.

### `FH-08.11` — Remover antes de adicionar

**Quando aplicar.** Diante de qualquer dificuldade relatada.

**Quando NÃO aplicar.** Quando a dificuldade decorre de informação genuinamente
ausente — e mesmo aí, `FH-06.08` exige redesenho antes de explicação.

---

## 7. Anti-padrões

**Simplicidade por amputação.** Remover capacidade e chamar de foco. Sintoma:
usuários antigos relatam que o produto piorou depois de uma "melhoria".

**Menu-depósito.** Tudo que não coube vai para um menu genérico. Sintoma: menu com
itens sem relação entre si.

**Aba como solução.** Dividir sem priorizar. Sintoma: usuários abrem todas as abas
procurando algo.

**Tooltip terapêutico.** Explicar em vez de consertar. Sintoma: dicas explicando o
significado de rótulos.

**Densidade confundida com complexidade.** Remover informação útil de uma tela
operacional em nome do respiro. Sintoma: o operador abre duas telas para ver o que
via em uma.

---

## 8. Impactos

**Cognitivo.** É o capítulo de efeito mais direto sobre carga. O orçamento de
decisões converte um conceito de psicologia cognitiva em restrição verificável, o
que permite discuti-lo sem apelo a gosto.

**Emocional.** Simplicidade bem executada produz competência percebida: o usuário
se sente capaz. Simplicidade por amputação produz frustração em quem perdeu
capacidade, e essa frustração é dirigida ao produto de forma duradoura.

**Produtividade.** Padrões inteligentes (`FH-08.03`) e limite de profundidade
(`FH-08.05`) removem tempo de decisão e tempo de procura — as duas maiores fontes
de desperdício em tarefas repetitivas.

**Percepção de qualidade.** `FH-08.06` e `FH-08.08` são os que mais afetam a
impressão de acabamento. Interface com elementos injustificados ou vocabulário
técnico é lida como inacabada, mesmo quando funciona perfeitamente.

**Curva de aprendizagem.** A revelação progressiva permite que a curva seja suave
no início sem impor teto depois. É o mecanismo que sustenta P8.

---

## 9. Riscos e trade-offs

**Risco: subestimar o usuário.** Levado ao extremo, o orçamento de decisões
produz interfaces que escondem o que o especialista precisa. Mitigação:
`FH-08.05` garante que a profundidade está sempre a um nível, e P8 proíbe
separá-la em modo avançado.

**Risco: esconder o essencial.** A fronteira entre esconder e omitir depende de
julgamento sobre o que é essencial. Mitigação: `FH-08.04` exige caminho de
descoberta, e `FH-08.07` protege o núcleo inegociável — estado nunca se esconde.

**Risco: paralisia por justificação.** `FH-08.06` e `FH-08.11` adicionam atrito ao
processo de desenho. É atrito deliberado, aplicado no momento mais barato de
corrigir.

**Trade-off central.** Trocamos velocidade de adição por qualidade de conjunto.
Adicionar é sempre mais rápido do que decidir o que não adicionar. O custo dessa
troca aparece no cronograma; o benefício aparece na década.

---

## 10. Critérios de verificação

1. Nenhuma capacidade foi removida sob a justificativa de simplificação.
2. Nenhuma tela exige mais de três decisões simultâneas na tarefa dominante.
3. Toda opção oferecida tem padrão que funciona sem intervenção.
4. Toda capacidade oculta tem caminho de descoberta no ponto de uso.
5. Nenhuma capacidade está a mais de um nível de profundidade.
6. Todo elemento de tela informa decisão, permite ação ou revela estado.
7. Nenhuma informação de estado foi removida em nome de limpeza.
8. Nenhum termo técnico interno aparece na interface.

---

## 11. Checklist do capítulo

- [ ] Consigo nomear a tarefa dominante desta tela em uma frase.
- [ ] Contei as decisões simultâneas exigidas — são três ou menos.
- [ ] Toda opção tem padrão inteligente que funciona sozinho.
- [ ] O que escondi tem caminho de descoberta visível no ponto de uso.
- [ ] Nada essencial ficou a dois níveis de distância.
- [ ] Todo elemento presente justifica sua presença.
- [ ] Não removi informação de estado para deixar mais limpo.
- [ ] Considerei remover, agrupar e decidir antes de adicionar.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 5, 6, 7 (P1, P8, P9).

**É pré-requisito de.** Capítulo 15 (carga cognitiva), 22 (arquitetura da
informação), 24 (composição de tela), 34 e 35 (componentes), 36 (densidade).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Telas com maior orçamento de decisão | `src/components/broadcasts/`, `src/components/flows/forms/` |
| Revelação progressiva | `src/components/ui/popover.tsx`, `dropdown-menu.tsx`, `sheet.tsx`, `accordion.tsx` |
| Padrões inteligentes | Valores padrão em `src/lib/` e formulários de domínio |
| Vocabulário de interface | `src/i18n/messages/pt-BR.json` |
