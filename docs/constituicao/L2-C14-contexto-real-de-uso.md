# Capítulo 14 — Contexto Real de Uso

| Campo | Valor |
| --- | --- |
| Livro | II — O Ser Humano |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 10, 13 |
| É pré-requisito de | Capítulos 19, 37, 41, 43, 46, 50 |
| Artigos | `FH-14.01` a `FH-14.11` |

> Design feito para o cenário ideal falha no cenário real. Este capítulo descreve
> as condições em que o FlowHub é efetivamente usado — não as condições em que
> gostaríamos que fosse.

---

## 0. Núcleo Normativo

**`FH-14.01`** — **Interrupção é a norma, não a exceção.** Todo fluxo **DEVE** ser
retomável exatamente do ponto em que foi interrompido, inclusive após horas,
troca de dispositivo ou encerramento do navegador.
> **Verificação:** interrompendo este fluxo em qualquer ponto e retornando depois, o usuário reencontra o estado exato? → SIM = cumpre | NÃO = viola.

**`FH-14.02`** — Nenhuma tela **PODE** exigir atenção contínua para não perder
estado. Sair, olhar outra coisa e voltar **NUNCA** destrói trabalho nem exige
recomeço.
> **Verificação:** afastar-se da tela por tempo indeterminado causa perda de estado ou de trabalho? → NÃO = cumpre | SIM = viola.

**`FH-14.03`** — O sistema **DEVE** suportar trabalho simultâneo em vários itens
sem perda, mistura ou sobreposição de contexto.
> **Verificação:** trabalhar em dois itens alternadamente preserva o estado de ambos? → SIM = cumpre | NÃO = viola.

**`FH-14.04`** — Toda ação relevante **DEVE** ser tolerante a falha de rede:
preserva o que foi produzido, informa o estado real e permite repetir sem refazer.
> **Verificação:** interrompendo a rede durante esta ação, o trabalho é preservado e o estado é honesto? → SIM = cumpre | NÃO = viola.

**`FH-14.05`** — Nenhuma capacidade **essencial** pode depender de tela grande.
Superfícies pequenas podem exigir caminho diferente, **nunca** impedir a tarefa
(`FH-37`).
> **Verificação:** esta capacidade essencial é alcançável em superfície pequena, ainda que por outro caminho? → SIM = cumpre | NÃO = viola.

**`FH-14.06`** — Fluxos de alta frequência **DEVEM** ser executáveis sem leitura:
posição estável, rótulos constantes e resultado previsível permitem execução por
memória motora.
> **Verificação:** um usuário experiente executa este fluxo sem precisar ler a tela? → SIM = cumpre | NÃO = viola.

**`FH-14.07`** — Nenhuma informação essencial é transmitida **apenas** por som,
apenas por cor ou apenas por movimento.
> **Verificação:** removendo som, cor e movimento, a informação continua acessível? → SIM = cumpre | NÃO = viola.

**`FH-14.08`** — O produto **NUNCA** exige estar em primeiro plano para funcionar
corretamente. Trocar de aba, de janela ou de aplicativo **NUNCA** interrompe
operação em curso nem descarta trabalho.
> **Verificação:** sair do produto durante uma operação a interrompe ou descarta trabalho? → NÃO = cumpre | SIM = viola.

**`FH-14.09`** — Expiração de sessão **NUNCA** descarta trabalho não salvo. A
reautenticação devolve o usuário ao ponto exato, com o conteúdo intacto.
> **Verificação:** após expiração e novo acesso, o trabalho em andamento continua disponível? → SIM = cumpre | NÃO = viola.

**`FH-14.10`** — Toda entrega **DEVE** ser verificada em **contexto adverso**: rede
degradada, interrupção no meio do fluxo, superfície pequena e sessão longa.
Verificação apenas em condição ideal é insuficiente.
> **Verificação:** os quatro cenários adversos foram verificados? → SIM = cumpre | NÃO = viola.

**`FH-14.11`** — O sistema **NUNCA** pressupõe que o usuário lembra o que estava
fazendo. Ao retornar, o contexto **DEVE** ser reconstituído visualmente, sem
depender da memória dele.
> **Verificação:** ao retornar, é possível saber o que estava em andamento sem esforço de recordação? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo documenta as condições reais de operação e as converte em
obrigações. Ele existe porque o ambiente onde o produto é construído — tela
grande, rede boa, atenção dedicada, uma tarefa por vez — é o oposto do ambiente
onde ele é usado.

---

## 2. Perguntas que este capítulo responde

- Em que ambiente o produto é realmente usado?
- Quantas interrupções acontecem?
- Qual a qualidade de rede que devo assumir?
- Posso supor que o usuário termina o que começou?
- O que acontece quando a sessão expira no meio de um texto?
- Preciso testar em condição ruim?

---

## 3. Definições

**Interrupção** — qualquer evento que desvia a atenção do usuário: cliente
falando, telefone, colega, outra conversa, notificação externa.

**Contexto adverso** — condição real e frequente que degrada a experiência: rede
instável, superfície pequena, sessão longa, atenção fragmentada.

**Retomada** — ato de voltar a uma tarefa interrompida. É a operação mais
frequente do produto, e a menos projetada na maioria dos sistemas.

**Memória motora** — capacidade de executar uma sequência por repetição, sem
leitura consciente.

**Trabalho em andamento** — qualquer conteúdo produzido e ainda não concluído.

---

## 4. Fundamento

**A jornada real.** O Operador do FlowHub trabalha em blocos de poucos minutos,
raramente ininterruptos. Ele conduz várias conversas ao mesmo tempo, cada uma com
contexto próprio; alterna entre elas dezenas de vezes por hora; e faz isso durante
oito horas ou mais. Nesse regime, **a retomada é a operação dominante** — mais
frequente que qualquer ação de negócio do produto. Um sistema que trata retomada
como caso secundário está otimizando para a exceção.

**Por que rede ruim é premissa, não risco.** Operações comerciais acontecem em
lojas, em campo, em prédios com sinal irregular, em conexões compartilhadas. A
rede degradada não é evento raro: é condição recorrente. Um sistema que assume
conectividade estável falha exatamente quando o usuário mais precisa dele —
durante um atendimento, com o cliente esperando.

**Por que a perda de trabalho é o pior defeito possível.** Já estabelecido como
promessa (`FH-10.01`), aqui ganha o contexto que o torna frequente: quanto mais
interrupções, mais oportunidades de perda. Um texto perdido depois de vinte
minutos de escrita não é um defeito técnico na percepção do usuário — é uma
traição, e ele passa a redigir em outro lugar e colar, o que anula o valor do
produto.

**Por que execução sem leitura importa.** Um Operador experiente não lê a
interface: ele reconhece formas e posições e executa por memória motora. Isso é
o que permite atender rápido. Cada mudança de posição de elemento frequente
destrói essa camada de fluência e devolve o usuário à leitura consciente — que é
cinco a dez vezes mais lenta. Por isso `FH-14.06` conversa diretamente com
`FH-16.02` (estabilidade motora).

**Por que verificar em contexto adverso é obrigatório.** Defeitos de contexto
adverso não aparecem em ambiente de desenvolvimento; aparecem em produção, no
usuário, no pior momento. `FH-14.10` desloca a descoberta para o momento mais
barato — e é a única regra deste capítulo que exige trabalho de verificação, e não
de desenho.

**Por que não presumir memória.** Depois de trinta minutos em outra conversa, o
usuário não lembra o que estava fazendo. Se o sistema exige que ele reconstitua o
contexto mentalmente, o custo da retomada se soma dezenas de vezes por dia. A
obrigação de `FH-14.11` é que o **sistema** carregue essa reconstrução.

---

## 5. Princípios

**A retomada é a operação mais frequente do produto.**

**Rede ruim é premissa, não exceção.**

**O usuário nunca lembra; o sistema sempre mostra.**

**Fluência é motora: posição estável vale mais que rótulo perfeito.**

---

## 6. Regras normativas

### `FH-14.01` — Retomada exata

**Quando aplicar.** Em todo fluxo de mais de um passo, toda composição de texto,
toda configuração.

**Quando NÃO aplicar.** Quando o usuário descartou deliberadamente.

**Certo.** Uma resposta pela metade continua ali no dia seguinte, no mesmo lugar,
com indicação de quando foi escrita.

**Errado.** Rascunho preservado apenas na sessão atual — o que falha exatamente no
caso que mais importa: o retorno no dia seguinte.

### `FH-14.03` — Trabalho simultâneo

**Quando aplicar.** Em conversas, negócios, edições e composições paralelas.

**Errado.** Rascunho global compartilhado entre conversas — o texto escrito para um
cliente aparece na conversa de outro. É perda de contexto e risco de vazamento
para terceiro.

### `FH-14.04` — Tolerância a rede

**Quando aplicar.** Em toda ação que dependa de servidor.

**Quando NÃO aplicar.** Não autoriza fingir sucesso: estado exibido continua
honesto (`FH-07.10`). Preservar o conteúdo é obrigatório; declarar entregue o que
não foi é proibido.

**Certo.** Falha de rede no envio: o texto permanece, o estado indica não enviado,
e há ação de repetir sem redigitar.

### `FH-14.06` — Execução sem leitura

**Quando aplicar.** Em fluxos executados muitas vezes por jornada.

**Quando NÃO aplicar.** Em ações destrutivas — nelas, a leitura é proteção, e a
execução automática por memória é justamente o risco (`FH-16.07`).

### `FH-14.09` — Expiração sem perda

**Quando aplicar.** Em toda tela com conteúdo em produção.

**Errado.** Redirecionar para autenticação descartando o formulário. O usuário
perde o trabalho por uma decisão de segurança que poderia preservá-lo.

### `FH-14.10` — Verificação adversa

**Quando aplicar.** Antes de toda entrega com efeito perceptível.

**Cenários mínimos:** rede degradada durante ação; interrupção no meio do fluxo
com retorno posterior; superfície pequena; sessão longa com expiração.

---

## 7. Anti-padrões

**Fluxo de fôlego único.** Só funciona se concluído de uma vez.

**Rascunho de sessão.** Preservação que não sobrevive ao fechamento.

**Estado global vazado.** Contexto de um item aparecendo em outro.

**Otimismo de rede.** Sucesso declarado antes da confirmação, sem reconciliação.

**Perda por segurança.** Expiração que descarta trabalho.

**Teste em condição ideal.** Verificação apenas com rede boa, tela grande e
atenção dedicada.

---

## 8. Impactos

**Cognitivo.** `FH-14.11` transfere ao sistema o custo de reconstituir contexto —
o custo cognitivo mais frequente da jornada, pago dezenas de vezes ao dia.

**Emocional.** Perda de trabalho é a experiência que mais rapidamente destrói
confiança. Tolerância a contexto adverso é o que faz o produto ser percebido como
sólido.

**Produtividade.** A retomada é a operação dominante; otimizá-la tem efeito maior
que otimizar qualquer funcionalidade de negócio isolada.

**Percepção de qualidade.** Produtos que funcionam mal em rede ruim são
percebidos como frágeis, independentemente de sua qualidade em condição ideal.

**Curva de aprendizagem.** `FH-14.06` sustenta a fluência motora, que é o que
diferencia o usuário do centésimo dia do usuário do primeiro.

---

## 9. Riscos e trade-offs

**Risco: complexidade de persistência.** Preservar estado em muitos pontos é caro e
introduz sincronização. Custo assumido: é a alocação de complexidade que P1 exige.

**Risco: estado obsoleto.** Restaurar contexto antigo pode confundir se o mundo
mudou. Mitigação: restaurar **e** informar o que mudou desde então
(`FH-10.05`).

**Risco: sobrecarga de verificação.** Quatro cenários adversos por entrega custa
tempo. Mitigação: são os quatro que concentram os defeitos que chegam ao usuário.

**Trade-off central.** Trocamos simplicidade de implementação por robustez em
condição real. É a diferença entre um produto que impressiona em demonstração e um
que sobrevive à jornada de trabalho.

---

## 10. Critérios de verificação

1. Todo fluxo é retomável do ponto exato, após qualquer intervalo.
2. Nenhuma tela perde estado por afastamento do usuário.
3. Trabalho simultâneo em vários itens preserva o estado de todos.
4. Falha de rede preserva conteúdo e mantém estado honesto.
5. Nenhuma capacidade essencial é impossível em superfície pequena.
6. Fluxos frequentes são executáveis sem leitura.
7. Nenhuma informação essencial depende só de som, cor ou movimento.
8. Sair do produto não interrompe operação nem descarta trabalho.
9. Expiração de sessão preserva o trabalho em andamento.
10. Os quatro cenários adversos foram verificados antes da entrega.

---

## 11. Checklist do capítulo

- [ ] Interrompi o fluxo no meio e voltei: o estado é o mesmo?
- [ ] Fechei o navegador e voltei no dia seguinte: o rascunho está lá?
- [ ] Trabalhei em dois itens alternadamente: nada se misturou?
- [ ] Derrubei a rede durante a ação: o conteúdo sobreviveu e o estado é honesto?
- [ ] Testei em superfície pequena: a tarefa essencial é possível?
- [ ] A sessão expirou: o trabalho continuou disponível?
- [ ] Um usuário experiente executa isto sem ler a tela?

---

## 12. Referências cruzadas

**Depende de.** Capítulos 10 (promessas), 13 (arquétipos).

**É pré-requisito de.** Capítulos 19 (ergonomia), 37 (responsividade), 41
(estados), 43 (feedback), 46 (desempenho percebido), 50 (colaboração).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Trabalho simultâneo em conversas | `src/components/inbox/message-thread.tsx` |
| Sessão e reautenticação | `src/lib/supabase/client.ts`, `src/lib/auth/`, `src/hooks/` |
| Tempo real e reconexão | `src/lib/presence.ts`, canais de realtime |
| Estado de fluxo longo | `src/components/flows/flow-builder.tsx`, `src/components/broadcasts/` |
| Superfícies pequenas | Componentes responsivos em `src/components/ui/` |
