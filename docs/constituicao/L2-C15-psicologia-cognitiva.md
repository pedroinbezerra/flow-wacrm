# Capítulo 15 — Psicologia Cognitiva Aplicada

| Campo | Valor |
| --- | --- |
| Livro | II — O Ser Humano |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P1, P3), 8, 13, 14 |
| É pré-requisito de | Capítulos 22, 24, 31, 35, 36, 40, 43 |
| Artigos | `FH-15.01` a `FH-15.11` |

---

## 0. Núcleo Normativo

**`FH-15.01`** — **Orçamento cognitivo.** Além do limite de três decisões
(`FH-08.02`), nenhuma tela **PODE** exigir a interpretação simultânea de mais de
**sete blocos de informação distintos** para que a tarefa dominante seja
compreendida.
> **Verificação:** compreender a tarefa dominante exige interpretar mais de sete blocos distintos? → NÃO = cumpre | SIM = viola.

**`FH-15.02`** — **Reconhecimento acima de recordação.** Nenhuma tarefa **PODE**
exigir que o usuário lembre informação exibida em outra tela, em outro passo ou em
outro momento.
> **Verificação:** concluir esta tarefa exige lembrar algo que não está visível agora? → NÃO = cumpre | SIM = viola.

**`FH-15.03`** — Elementos **DEVEM** ser agrupados por **relação de uso** — o que é
usado junto fica junto. Agrupamento por origem no sistema, tipo de dado ou ordem
histórica de construção é proibido.
> **Verificação:** o agrupamento reflete como os elementos são usados juntos? → SIM = cumpre | NÃO = viola.

**`FH-15.04`** — Listas de opções **DEVEM** ser ordenadas por probabilidade de
escolha ou frequência real de uso, e **NUNCA** por ordem alfabética, ordem de
criação ou ordem interna, salvo quando a busca por nome for o modo dominante de
localização.
> **Verificação:** a ordem reflete probabilidade ou frequência real? → SIM = cumpre | NÃO = viola.

**`FH-15.05`** — Todo passo de um fluxo **DEVE** conter, visível, a informação
necessária para a decisão daquele passo. É proibido depender da memória de trabalho
entre passos.
> **Verificação:** a informação necessária a este passo está visível nele? → SIM = cumpre | NÃO = viola.

**`FH-15.06`** — É proibido exigir que o usuário **saia da tarefa** para obter
informação necessária a ela. A informação vem até o usuário; ele não vai buscá-la.
> **Verificação:** concluir esta tarefa exige navegar para outro lugar e voltar? → NÃO = cumpre | SIM = viola.

**`FH-15.07`** — Decisões repetitivas **DEVEM** ter padrão, e o padrão **DEVERIA**
refletir a escolha anterior do usuário quando ela for estável e observável.
> **Verificação:** esta decisão repetitiva tem padrão que dispensa nova deliberação? → SIM = cumpre | NÃO = viola.

**`FH-15.08`** — Nenhuma informação crítica é transmitida **apenas** por posição,
apenas por proximidade ou apenas por ausência de outro elemento.
> **Verificação:** a informação crítica permanece compreensível se o arranjo espacial mudar? → SIM = cumpre | NÃO = viola.

**`FH-15.09`** — O sistema **NUNCA** interrompe o usuário durante tarefa de alta
carga cognitiva — composição de texto, construção de automação, revisão de envio —
salvo para impedir dano irreversível.
> **Verificação:** existe interrupção durante tarefa de alta carga que não previne dano irreversível? → NÃO = cumpre | SIM = viola.

**`FH-15.10`** — Valores padrão, ordem de opções e destaque visual **NUNCA** podem
induzir decisão contrária ao interesse do usuário. Ancoragem a favor do sistema é
padrão escuro (`FH-11.01`).
> **Verificação:** o padrão e o destaque favorecem o interesse do usuário? → SIM = cumpre | NÃO = viola.

**`FH-15.11`** — Toda informação numérica **DEVE** vir acompanhada da referência
que a torna interpretável — período, comparação, unidade ou base de cálculo.
Número isolado não informa; ele apenas parece informar.
> **Verificação:** este número traz referência suficiente para ser interpretado sem cálculo mental? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo fundamenta as regras de interface no funcionamento real da atenção,
da memória e da tomada de decisão. Ele existe para que decisões de desenho sejam
discutidas por mecanismo, e não por preferência — e para que o custo cognitivo,
que é invisível, se torne contável.

---

## 2. Perguntas que este capítulo responde

- Quantas opções são demais?
- Por que agrupar? Por que a ordem importa?
- Por que um alerta a mais quebra a leitura de todos os outros?
- Quando o usuário decide errado por culpa do desenho?
- Posso interromper alguém que está escrevendo?
- Um número sozinho comunica alguma coisa?

---

## 3. Definições

**Carga intrínseca** — dificuldade inerente à tarefa. Não pode ser eliminada, só
organizada.

**Carga extrínseca** — dificuldade criada pelo desenho: informação mal organizada,
vocabulário obscuro, passos desnecessários. **Deve ser eliminada.**

**Carga germinativa** — esforço que constrói compreensão duradoura. É desejável e
deve ser preservada.

**Memória de trabalho** — capacidade de manter poucos elementos ativos
simultaneamente. Curta, frágil e destruída por interrupção.

**Bloco de informação** — conjunto que o usuário interpreta como unidade.
Agrupar bem reduz o número de blocos sem reduzir a informação.

**Fadiga de decisão** — degradação da qualidade das escolhas ao longo de uma
sequência de decisões.

**Ancoragem** — influência do primeiro valor apresentado sobre a decisão final.

---

## 4. Fundamento

**As três cargas, e qual delas eliminar.** Nem toda dificuldade é ruim. A carga
intrínseca pertence ao problema — negociar é difícil, e nenhuma interface muda
isso. A carga germinativa constrói competência: entender o modelo do produto exige
esforço que se paga. A carga extrínseca é a única que é puro desperdício: ela vem
do desenho, não do problema. Confundir as três leva a dois erros opostos —
simplificar até remover a substância (P1 mal aplicado, ver `FH-08.01`), ou aceitar
complexidade acidental como se fosse inerente.

**Por que sete blocos, e não sete elementos.** O limite prático da memória de
trabalho é da ordem de meia dúzia de unidades simultâneas. Mas "unidade" é
elástica: um grupo bem formado conta como um. É por isso que `FH-15.03` importa
tanto — agrupar bem não reduz informação, reduz **blocos**. Uma tela com quarenta
elementos em cinco grupos coerentes é mais leve que uma tela com doze elementos
soltos.

**Por que reconhecimento vence recordação.** Reconhecer algo presente é barato e
quase infalível; recordar algo ausente é caro e falha sob interrupção — que, pelo
Capítulo 14, é a condição normal deste produto. Toda vez que uma interface exige
lembrar um valor de outra tela, ela impõe uma tarefa de memória sob condições em
que a memória não funciona.

**Por que a ordem é uma decisão de produto.** Ordem alfabética parece neutra e não
é: ela distribui o custo igualmente entre opções desiguais. Se 80% das escolhas
recaem sobre três itens, colocá-los em posição arbitrária cobra tempo de busca em
80% das interações. A exceção legítima é quando o usuário chega sabendo o nome — aí
a ordem alfabética **é** a ordem por probabilidade.

**Por que a interrupção durante alta carga é especialmente cara.** A memória de
trabalho não é apenas reduzida pela interrupção: ela é **apagada**. Interromper
alguém que compõe uma resposta delicada não custa os segundos da interrupção;
custa a reconstrução do raciocínio, que é muito mais lenta. `FH-15.09` é a
aplicação mais dura de P6 (silêncio como cortesia).

**Por que ancoragem é questão ética, e não só cognitiva.** Valores padrão
influenciam decisões mesmo quando o usuário sabe disso. Essa influência é
inevitável — alguém precisa escolher o padrão. O que a torna legítima ou abusiva é
a direção: padrão a favor do usuário é serviço (`FH-08.03`); padrão a favor do
sistema é manipulação (`FH-11.01`). Por isso `FH-15.10` liga este capítulo ao de
ética.

**Por que número isolado não informa.** Um número sem referência obriga o usuário a
buscar comparação na memória ou em outra tela — ou, pior, a inventar uma. "42
conversas" não permite nenhuma decisão; "42 conversas, 18 a mais que ontem"
permite. Um número que parece informar e não informa é pior que nenhum: consome
atenção e produz conclusão frágil.

---

## 5. Princípios

**Elimine a carga extrínseca; organize a intrínseca; preserve a germinativa.**

**Agrupar bem é reduzir carga sem reduzir informação.**

**Nunca peça para lembrar o que você pode mostrar.**

**Interromper quem pensa custa o raciocínio, não os segundos.**

**Número sem referência não é informação.**

---

## 6. Regras normativas

### `FH-15.01` — Orçamento cognitivo

**Quando aplicar.** Em toda tela.

**Quando NÃO aplicar.** Em telas cuja tarefa dominante é comparar muitos itens —
aí a densidade é o trabalho, e aplica-se o Capítulo 36. Mesmo nelas, os **blocos**
de interpretação continuam limitados: a lista inteira é um bloco.

**Certo.** Uma tela de conversa: identidade, histórico, composição, contexto do
contato, ações — cinco blocos, cada um internamente denso.

**Errado.** A mesma informação distribuída em quinze áreas visuais sem hierarquia.

### `FH-15.02` — Reconhecimento

**Errado.** Exigir que o usuário lembre o nome exato de um modelo escolhido em um
passo anterior para digitá-lo depois.

### `FH-15.03` — Agrupamento por uso

**Quando NÃO aplicar.** Quando a relação de uso é genuinamente ambígua — aí a
decisão sobe para o Capítulo 22 (arquitetura da informação).

**Errado.** Agrupar campos por tipo de dado (todos os textos juntos, todas as
datas juntas). Espelha o modelo de dados, não o trabalho.

### `FH-15.04` — Ordem por probabilidade

**Quando NÃO aplicar.** Quando o usuário chega sabendo o nome do que procura e a
lista é longa — aí ordem alfabética com busca é o caminho.

### `FH-15.06` — Informação vem ao usuário

**Errado.** Para decidir um envio, precisar abrir outra área para conferir quantos
contatos têm telefone válido.

### `FH-15.09` — Não interromper quem pensa

**Quando NÃO aplicar.** Quando a interrupção previne dano irreversível — o envio
está prestes a sair para a lista errada, o limite está prestes a ser estourado.

**Errado.** Notificação de nova mensagem sobrepondo a composição de outra resposta.

### `FH-15.11` — Número com referência

**Quando NÃO aplicar.** Em contagens triviais e autoexplicativas dentro do próprio
contexto (o número de itens selecionados, por exemplo).

---

## 7. Anti-padrões

**Tela-inventário.** Tudo que existe sobre o assunto, sem hierarquia.

**Agrupamento por banco de dados.** Estrutura interna vazando na organização
visual.

**Ordem neutra.** Alfabética por omissão de decisão.

**Memória entre passos.** Fluxo que exige carregar valores de cabeça.

**Alerta empilhado.** Vários avisos simultâneos — nenhum é lido.

**Padrão a favor da casa.** Ancoragem que beneficia o sistema.

**Número decorativo.** Métrica exibida sem referência, que ninguém usa para decidir
e todos leem.

---

## 8. Impactos

**Cognitivo.** É o capítulo cujo objeto **é** o impacto cognitivo. Sua contribuição
principal é tornar contável o que costuma ser discutido por sensação: blocos,
passos, decisões.

**Emocional.** Carga excessiva produz sensação de incompetência — o usuário conclui
que ele é lento, não que a tela é ruim. Reduzir carga devolve competência
percebida.

**Produtividade.** `FH-15.04` e `FH-15.07` atuam sobre microdecisões repetidas
centenas de vezes; o ganho é composto e invisível individualmente.

**Percepção de qualidade.** Telas bem agrupadas são percebidas como "organizadas"
sem que o usuário saiba nomear o motivo. Agrupamento é a variável que mais
influencia essa impressão.

**Curva de aprendizagem.** Reconhecimento acima de recordação é o que permite
aprender por uso. Interfaces que exigem memorização exigem treinamento — proibido
por `FH-06.08`.

---

## 9. Riscos e trade-offs

**Risco: simplificação por remoção.** O limite de blocos pode ser cumprido
removendo informação necessária. Mitigação: `FH-08.07` e `FH-15.11` — estado e
referência não se removem; agrupa-se.

**Risco: personalização excessiva da ordem.** `FH-15.07` pode levar a interfaces
que mudam sozinhas. Mitigação: a arbitragem permanente já decidida —
previsibilidade vence personalização em estrutura (`FH-03.09`). O padrão se
adapta; a estrutura, não.

**Risco: rigidez numérica.** Sete blocos é um limite prático, não uma lei da
natureza. Mitigação: é limite de **blocos**, e agrupar bem reduz blocos sem
remover conteúdo. O limite força o agrupamento, que é o objetivo real.

**Trade-off central.** Trocamos densidade informacional imediata por
compreensibilidade. Cabe menos por tela, e decide-se melhor em cada uma.

---

## 10. Critérios de verificação

1. Nenhuma tela exige interpretar mais de sete blocos para a tarefa dominante.
2. Nenhuma tarefa exige lembrar informação não visível.
3. Agrupamentos refletem relação de uso, não origem no sistema.
4. Ordens refletem probabilidade ou frequência, salvo busca por nome.
5. Cada passo contém a informação necessária à sua decisão.
6. Nenhuma tarefa exige sair dela para obter informação.
7. Decisões repetitivas têm padrão.
8. Nenhuma informação crítica depende só de arranjo espacial.
9. Nenhuma interrupção ocorre durante tarefa de alta carga sem prevenir dano.
10. Nenhum padrão ou destaque favorece o sistema contra o usuário.
11. Todo número exibido traz referência interpretável.

---

## 11. Checklist do capítulo

- [ ] Contei os blocos de informação da tela — são sete ou menos.
- [ ] Nada exige lembrar de outra tela.
- [ ] Agrupei pelo que é usado junto, não pelo que é parecido.
- [ ] Ordenei por probabilidade, não por conveniência.
- [ ] Cada passo tem visível o que a decisão dele exige.
- [ ] Ninguém precisa sair da tarefa para concluí-la.
- [ ] Decisões repetidas têm padrão.
- [ ] Não interrompo quem está escrevendo ou construindo.
- [ ] Meus padrões favorecem o usuário, não o sistema.
- [ ] Todo número tem referência.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P1, P3, P6), 8 (orçamento de decisões), 13, 14.

**É pré-requisito de.** Capítulos 22, 24, 31, 35, 36, 40, 43, 56.

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Telas de maior carga | `src/components/inbox/`, `src/components/flows/`, `src/components/broadcasts/` |
| Agrupamento e hierarquia visual | `src/components/ui/card.tsx`, `separator.tsx`, `tabs.tsx` |
| Ordenação de opções | `src/components/ui/select.tsx`, `dropdown-menu.tsx` |
| Exibição de números com referência | `src/components/analytics/`, `src/components/tremor/`, `src/lib/analytics/` |
| Interrupções do sistema | `src/components/themed-toaster.tsx` |
