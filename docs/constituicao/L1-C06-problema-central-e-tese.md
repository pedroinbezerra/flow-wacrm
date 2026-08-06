# Capítulo 6 — O Problema Central e a Tese do Produto

| Campo | Valor |
| --- | --- |
| Livro | I — Identidade e Filosofia |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 1–5 |
| É pré-requisito de | Capítulos 7, 8, 26, 49, 52, 55, 67 |
| Artigos | `FH-06.01` a `FH-06.11` |

---

## 0. Núcleo Normativo

**`FH-06.01`** — A tese fundadora do FlowHub é: **CRMs tradicionais exigem que o
usuário aprenda como o sistema funciona; o FlowHub aprende como o usuário
trabalha.** Toda decisão de produto **DEVE** mover na direção da tese, nunca
contra ela.
> **Verificação:** esta decisão transfere esforço do usuário para o sistema, ou do sistema para o usuário? → Para o sistema = cumpre | Para o usuário = viola.

**`FH-06.02`** — Nenhuma funcionalidade pode exigir que o usuário registre
manualmente informação que o sistema já observou ou pode derivar do trabalho
real.
> **Verificação:** algum dado pedido ao usuário já é conhecido ou derivável pelo sistema? → NÃO = cumpre | SIM = viola.

**`FH-06.03`** — Toda funcionalidade nova **DEVE** declarar, por escrito, **qual
trabalho ela remove** do usuário. Declarar apenas a capacidade que adiciona é
insuficiente.
> **Verificação:** existe declaração escrita do trabalho removido? → SIM = cumpre | NÃO = viola.

**`FH-06.04`** — Toda configuração é dívida. Configuração nova só é permitida
acompanhada de um **padrão inteligente** que funcione integralmente sem que
alguém a toque.
> **Verificação:** a funcionalidade opera corretamente com o padrão, sem nenhuma configuração? → SIM = cumpre | NÃO = viola.

**`FH-06.05`** — O sistema **NUNCA** pune o desvio. Quando o usuário trabalha fora
do fluxo previsto, o sistema acomoda e registra; **NUNCA** bloqueia, oculta ou
força retorno ao caminho desenhado.
> **Verificação:** existe caminho de trabalho legítimo que o sistema impede por não ser o previsto? → NÃO = cumpre | SIM = viola.

**`FH-06.06`** — É proibido pressionar o usuário a alimentar o sistema. Barras de
completude de cadastro, cobranças por campos vazios, alertas por dado ausente e
métricas de preenchimento exibidas como desempenho **NUNCA** são usadas.
> **Verificação:** a interface cobra do usuário o preenchimento de algo que não bloqueia seu trabalho? → NÃO = cumpre | SIM = viola.

**`FH-06.07`** — Nenhuma funcionalidade nova pode aumentar o número de passos do
fluxo principal ao qual pertence. Se aumenta, **DEVE** ser redesenhada ou movida
para fora do fluxo principal.
> **Verificação:** o fluxo principal tem mais passos depois desta mudança? → NÃO = cumpre | SIM = viola.

**`FH-06.08`** — Problema de compreensão **NUNCA** é resolvido com treinamento,
tutorial, texto de ajuda ou documentação. Se o usuário precisa ser ensinado a
usar algo, o defeito está no desenho.
> **Verificação:** a solução proposta para a dificuldade é explicar em vez de redesenhar? → NÃO = cumpre | SIM = viola.

**`FH-06.09`** — Tudo que o sistema aprender sobre o modo de trabalhar do usuário
**DEVE** ser visível e reversível por ele. Aprendizado invisível é proibido.
> **Verificação:** o usuário consegue ver o que o sistema aprendeu e desfazer? → SIM = cumpre | NÃO = viola.

**`FH-06.10`** — Dado que o sistema deriva ou infere **DEVE** ser distinguível do
dado informado pelo usuário, em qualquer ponto onde apareça.
> **Verificação:** é possível distinguir dado inferido de dado informado? → SIM = cumpre | NÃO = viola.

**`FH-06.11`** — Quando o sistema detectar repetição no trabalho do usuário, ele
**DEVERIA** oferecer automatizá-la — e **NUNCA** automatizar sem consentimento
explícito.
> **Verificação:** houve automatização de padrão repetido sem consentimento explícito? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo define **o problema que o FlowHub existe para resolver** e a
direção permanente de evolução do produto. Ele é o critério mais usado para
decidir entre duas soluções tecnicamente válidas.

O Capítulo 5 respondeu *o que o produto é*. Este responde *por que ele precisa
existir* — e transforma essa resposta em teste aplicável.

---

## 2. Perguntas que este capítulo responde

- Que dor real existe, e por que as soluções atuais não resolvem?
- O que significa, na prática, "o sistema aprende o usuário"?
- Como sei se uma decisão caminha na direção da tese?
- Posso pedir mais um campo no cadastro?
- Posso adicionar uma configuração?
- O usuário não está usando direito. Faço um tutorial?
- O usuário trabalha "errado". Devo impedir?
- Posso automatizar algo que percebi que ele faz sempre?

---

## 3. Definições

**Trabalho real** — a atividade que gera valor para o negócio do usuário:
conversar, negociar, resolver, decidir, entregar.

**Trabalho de alimentação** — a atividade de informar ao sistema o que já
aconteceu no trabalho real. Não gera valor para o usuário; gera valor para o
sistema.

**Dado derivável** — informação que o sistema pode obter a partir do que já
observou, sem perguntar.

**Padrão inteligente** — valor pré-definido que funciona para a maioria dos casos
sem intervenção, escolhido a partir de contexto observado, não de suposição
genérica.

**Fluxo principal** — a sequência de passos que o usuário percorre na tarefa mais
frequente de uma área.

**Teste da Direção** — verificação de `FH-06.01`: a decisão move esforço do
usuário para o sistema, ou o contrário?

---

## 4. Fundamento

**O custo invisível do CRM tradicional.** Todo sistema de gestão comercial
tradicional opera sobre uma premissa que nunca é declarada: o usuário trabalha
em algum lugar — no telefone, na conversa, na reunião — e depois **conta ao
sistema** o que aconteceu. Esse "depois contar" é trabalho puro: consome tempo,
não produz valor para quem o executa e compete diretamente com o trabalho real.

A consequência é previsível e universal: o registro é feito por último, mal, ou
não é feito. O sistema fica desatualizado. Como está desatualizado, a gestão não
confia nele. Como a gestão não confia, ela cobra preenchimento. Como cobra
preenchimento, o usuário passa a preencher para cumprir a cobrança — não para
informar. O dado piora. A desconfiança aumenta. O ciclo se fecha.

Esse ciclo não é falha de disciplina dos usuários. É consequência direta do
desenho. Qualquer sistema que separe trabalho real de registro produzirá o mesmo
resultado, com qualquer equipe.

**A inversão do FlowHub.** A tese é que o sistema deve se alimentar do trabalho
real, e não do relato dele. A conversa acontece dentro do sistema, então o
histórico existe sem ninguém digitá-lo. O negócio avança porque algo aconteceu na
conversa, não porque alguém arrastou um cartão. A automação dispara porque uma
condição real ocorreu. O registro deixa de ser tarefa e passa a ser subproduto.

Isso não elimina toda entrada manual — algumas informações só existem na cabeça
do usuário. Mas muda o padrão: **a entrada manual é a exceção que precisa se
justificar**, não a norma. É exatamente isso que `FH-06.02` codifica.

**Por que configuração é dívida.** Cada opção de configuração parece flexibilidade
e é, na prática, uma decisão transferida ao usuário. Ela cobra três vezes: no
momento de decidir, no momento de descobrir onde decidir, e para sempre — porque
toda configuração multiplica os estados possíveis do sistema, e cada estado
possível é um caminho a ser desenhado, testado e suportado. `FH-06.04` não proíbe
configuração; exige que ela seja opcional de fato, com um padrão que funcione
sozinho. Se o padrão não funciona sozinho, não é configuração: é uma pergunta
obrigatória disfarçada.

**Por que treinamento é proibido como solução.** `FH-06.08` é o artigo que mais
gera resistência, porque documentar é sempre mais barato que redesenhar. Mas o
raciocínio é econômico, não idealista: o custo do redesenho é pago uma vez, por
quem constrói; o custo do treinamento é pago todas as vezes, por cada usuário,
para sempre. Um tutorial é uma dívida cobrada da pessoa errada. Além disso,
documentação é o mecanismo pelo qual defeitos de desenho se tornam permanentes:
uma vez explicado, o problema deixa de ser percebido como problema.

**Por que não punir o desvio.** Sistemas tendem a codificar o processo "correto" e
a bloquear o resto. Mas o processo real de uma operação comercial muda o tempo
todo, e quem sabe como ele funciona é quem opera — não quem desenhou o sistema
seis meses antes. Um sistema que bloqueia o desvio força o usuário a mentir para
ele: registrar o que o sistema aceita, e não o que aconteceu. O dado apodrece na
origem. `FH-06.05` inverte: o sistema acomoda o desvio e o registra fielmente. O
desvio recorrente vira, então, evidência de que o processo mudou — informação
valiosa, que o bloqueio teria destruído.

**Por que o aprendizado precisa ser visível.** A tese cria um risco próprio: um
sistema que aprende sozinho é um sistema que muda sozinho, e mudança não
solicitada é a definição de surpresa. `FH-06.09` e `FH-06.10` são o contrapeso —
e a arbitragem permanente do Capítulo 3 já a decidiu: **previsibilidade vence
personalização** em estrutura. O sistema aprende, mas nunca em segredo.

---

## 5. Princípios

**O registro é subproduto do trabalho, nunca tarefa adicional.**

**Toda pergunta ao usuário é uma falha do sistema em saber** — às vezes
inevitável, sempre a ser justificada.

**Configuração é decisão transferida.** Transferir decisão é transferir trabalho.

**Explicar é adiar o conserto.**

**O desvio é informação, não erro.**

---

## 6. Regras normativas

### `FH-06.01` — Teste da Direção

**Quando aplicar.** Em toda escolha entre alternativas de desenho.

**Quando NÃO aplicar.** Quando o esforço em questão é o próprio trabalho real do
usuário — escrever uma resposta a um cliente é trabalho dele, e o sistema não
deve substituí-lo sem que ele peça.

**Certo.** Preencher automaticamente o contato a partir da conversa recebida.

**Errado.** Exigir cadastro completo antes de permitir responder alguém que acabou
de escrever. O sistema colocou seu próprio requisito na frente do trabalho.

### `FH-06.02` — Proibição do trabalho de alimentação

**Quando aplicar.** Em todo formulário, campo obrigatório e etapa de registro.

**Quando NÃO aplicar.** Quando a informação só existe na cabeça do usuário e é
necessária para uma decisão do sistema — aí perguntar é legítimo, desde que se
pergunte no momento em que a informação importa, e não antecipadamente.

**Certo.** O sistema deriva canal, primeiro contato, última interação e histórico.
Pergunta apenas o que não pode saber.

**Errado.** Campo "origem do contato" obrigatório no cadastro, quando o sistema
sabe por onde a pessoa chegou.

### `FH-06.03` — Declaração de trabalho removido

**Quando aplicar.** Em toda funcionalidade nova.

**Quando NÃO aplicar.** Em correção de defeito.

**Certo.** "Remove: consultar duas telas e copiar manualmente o valor entre elas."

**Errado.** "Adiciona: visão consolidada." Não diz o que deixa de ser feito — e
funcionalidade que só adiciona capacidade, sem remover trabalho, tende a
adicionar carga.

### `FH-06.04` — Configuração exige padrão

**Quando aplicar.** Sempre que se propuser uma nova opção configurável.

**Quando NÃO aplicar.** Em configurações de conta obrigatórias por natureza
(dados fiscais, credenciais, permissões).

**Certo.** A funcionalidade opera com padrão derivado do comportamento da conta, e
a configuração existe para quem quiser divergir.

**Errado.** Uma opção sem valor padrão, ou com padrão que não funciona de fato —
o que obriga todo mundo a configurar e transforma a "flexibilidade" em pedágio.

### `FH-06.05` — Não punir o desvio

**Quando aplicar.** Em todo processo com etapas, ordem esperada ou pré-requisito.

**Quando NÃO aplicar.** Quando o bloqueio protege contra dano irreversível,
violação legal ou quebra de isolamento de dados — aí o bloqueio é obrigatório
(`FH-03.02`).

**Certo.** Permitir avançar um negócio para qualquer etapa, registrando o salto.

**Errado.** Impedir o avanço porque uma etapa anterior não foi marcada. O trabalho
aconteceu de qualquer forma; o sistema apenas se recusou a saber.

### `FH-06.06` — Sem cobrança de preenchimento

**Quando aplicar.** Em toda representação de completude.

**Quando NÃO aplicar.** Quando a ausência do dado bloqueia realmente uma ação que
o usuário está tentando executar — aí a informação é sobre a ação, não cobrança.

**Certo.** Um envio informa que dois contatos não têm telefone e oferece corrigir
ali.

**Errado.** Um medidor de "perfil 40% completo" no cadastro. Cria culpa por algo
que não impede nada e induz preenchimento de baixa qualidade — dado ruim entra no
sistema justamente para calar o medidor.

### `FH-06.07` — Sem crescimento do fluxo principal

**Quando aplicar.** Em toda adição a um fluxo existente.

**Quando NÃO aplicar.** Quando o passo adicionado **substitui** dois ou mais
passos anteriores.

**Certo.** A nova capacidade aparece como opção dentro de um passo já existente.

**Errado.** Mais uma tela no meio do fluxo mais usado do produto, porque era o
lugar mais fácil de encaixar. O custo é pago por todos os usuários, todos os dias,
para beneficiar poucos.

### `FH-06.08` — Redesenho, não explicação

**Quando aplicar.** Diante de qualquer evidência de dificuldade de uso.

**Quando NÃO aplicar.** Quando o conceito é externo ao produto e genuinamente
precisa ser conhecido — regras de um canal, exigências de um provedor, obrigação
legal. Aí explicar é legítimo, e a explicação deve estar no ponto de uso, não em
manual separado.

**Certo.** "Três usuários não encontraram esta ação. Vou mudar sua posição e seu
nome."

**Errado.** "Vou adicionar um texto explicando onde ela está." A explicação será
lida por uma fração das pessoas, uma vez, e o problema permanece para todas as
outras.

### `FH-06.09` — Aprendizado visível e reversível

**Quando aplicar.** Em toda adaptação baseada em comportamento observado.

**Quando NÃO aplicar.** Em otimizações internas sem efeito perceptível (ordem de
carregamento, cache).

**Certo.** "Priorizamos estes itens porque você os usa com frequência" — com
caminho para desativar.

**Errado.** Reordenar silenciosamente elementos que o usuário já localizava por
posição. O ganho de relevância é destruído pela perda de memória motora, e o
usuário não tem como recuperar o estado anterior.

### `FH-06.10` — Dado inferido é distinguível

**Quando aplicar.** Em toda exibição de dado derivado, inferido ou gerado.

**Quando NÃO aplicar.** Em dados objetivamente calculados a partir de fatos
registrados (totais, contagens, datas), que não são inferência.

**Certo.** Um dado sugerido pelo sistema é apresentado como sugestão até ser
confirmado.

**Errado.** Exibir inferência com a mesma aparência de dado confirmado. Quando a
inferência erra — e ela erra — o usuário perde a confiança em **todos** os dados,
inclusive nos corretos.

### `FH-06.11` — Repetição vira oferta, nunca imposição

**Quando aplicar.** Ao detectar padrão repetido de ações.

**Quando NÃO aplicar.** Quando a repetição é ocasional ou o padrão é ambíguo —
oferta errada é ruído, e ruído treina o usuário a ignorar ofertas.

**Certo.** "Você aplicou esta sequência 12 vezes esta semana. Quer transformá-la
em automação?" — com pré-visualização do que passaria a acontecer.

**Errado.** Criar a automação e avisar depois. Viola `FH-03.02(c)` e destrói a
previsibilidade que sustenta a confiança.

---

## 7. Anti-padrões

**Sistema faminto.** O produto pede mais do que devolve. Sintoma: cadastros longos
antes de qualquer valor.

**Flexibilidade como desculpa.** Não decidir e chamar de configuração. Sintoma:
tela de configurações crescendo mais rápido que o produto.

**Documentação como conserto.** Sintoma: base de ajuda extensa sobre a própria
interface — sinal de que a interface não se explica.

**Processo de papel.** Codificar no sistema o processo ideal e bloquear o real.
Sintoma: usuários mantendo planilhas paralelas.

**Gamificação de preenchimento.** Medalhas e barras por alimentar o sistema.
Sintoma: dados completos e falsos.

**Aprendizado furtivo.** O sistema muda sozinho sem avisar. Sintoma: "sumiu",
"mudou de lugar", "não confio mais".

---

## 8. Impactos

**Cognitivo.** Cada campo removido e cada configuração eliminada devolve
capacidade de atenção ao trabalho real. O efeito é composto: um formulário com
metade dos campos não é apenas duas vezes mais rápido — ele cabe inteiro na
memória de trabalho, o que muda qualitativamente a experiência de preenchê-lo.

**Emocional.** `FH-06.06` remove uma fonte constante e desnecessária de culpa.
`FH-06.05` remove a sensação de estar sendo vigiado e corrigido por um sistema que
conhece o trabalho menos do que quem o executa.

**Produtividade.** É o capítulo de maior impacto direto. Trabalho de alimentação
consome, em operações comerciais reais, parcela significativa do tempo produtivo.
Cada eliminação é ganho permanente e diário.

**Percepção de qualidade.** A tese produz a sensação descrita no direcionamento
fundador: o sistema "entende meu trabalho" e "está um passo à frente". Essa
percepção nasce de algo simples e difícil: não perguntar o que já se sabe.

**Curva de aprendizagem.** `FH-06.08` transfere a curva de aprendizagem do usuário
para o time de produto. É um custo real de construção, e é o custo certo: paga-se
uma vez, do lado que tem mais informação e mais capacidade de resolver.

---

## 9. Riscos e trade-offs

**Risco: inferência errada.** Um sistema que deriva erra às vezes, e erro de
inferência corrói confiança mais rápido do que ausência de inferência.
Mitigações: `FH-06.10` (distinguibilidade) e `FH-06.09` (reversibilidade). A
regra prática: infira, mostre que inferiu, deixe corrigir em um passo.

**Risco: rigidez por falta de configuração.** Casos legítimos podem não caber no
padrão. Mitigação: `FH-06.04` não proíbe configurar; exige que o padrão funcione
sozinho. Quem precisa divergir, diverge.

**Risco: custo de construção.** Derivar é mais caro que perguntar; redesenhar é
mais caro que documentar. Este é o trade-off central e ele é **deliberado**: o
FlowHub concentra custo em quem constrói para removê-lo de quem usa. Essa
transferência é a tese inteira, expressa em economia.

**Risco: acomodar desvio demais.** Um sistema que aceita tudo pode deixar de
oferecer estrutura. Mitigação: `FH-06.05` acomoda **e registra**. O desvio fica
visível e vira insumo de melhoria de processo, em vez de ser apagado por um
bloqueio.

---

## 10. Critérios de verificação

1. Nenhum campo obrigatório pede dado derivável.
2. Toda funcionalidade nova declara o trabalho que remove.
3. Toda configuração tem padrão que funciona sem intervenção.
4. Nenhum fluxo principal ganhou passos sem remover outros.
5. Nenhuma dificuldade de uso foi resolvida apenas com texto explicativo.
6. Nenhum indicador de completude cobra preenchimento não bloqueante.
7. Toda adaptação por comportamento é visível e reversível.
8. Dado inferido é distinguível de dado informado em todo ponto de exibição.

---

## 11. Checklist do capítulo

- [ ] Apliquei o Teste da Direção: esta decisão tira trabalho do usuário?
- [ ] Nenhum dado que peço já é conhecido pelo sistema.
- [ ] Declarei qual trabalho esta funcionalidade remove.
- [ ] Toda configuração que criei tem padrão que funciona sozinho.
- [ ] Não bloqueei nenhum caminho legítimo de trabalho.
- [ ] Não adicionei passos ao fluxo principal.
- [ ] Não estou resolvendo confusão com texto explicativo.
- [ ] O que o sistema infere está visível, distinguível e reversível.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 1–5.

**É pré-requisito de.** Capítulo 7 (princípios), 8 (simplicidade), 26
(onboarding), 49 (produtividade), 52–55 (inteligência e personalização), 67
(evolução).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Formulários de entrada manual | `src/components/contacts/contact-form.tsx`, `src/components/pipelines/deal-form.tsx` |
| Dados derivados da conversa | `src/lib/contacts/`, `src/lib/conversation-preview.ts` |
| Configuração da conta | `src/app/(dashboard)/settings/` |
| Detecção de repetição e automação | `src/lib/automations/`, `src/lib/flows/` |
| Onboarding e primeiro uso | `src/lib/onboarding/`, `src/app/(dashboard)/welcome/` |
