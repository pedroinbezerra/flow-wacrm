# Capítulo 1 — Natureza, Autoridade e Alcance

| Campo | Valor |
| --- | --- |
| Livro | 0 — A Constituição |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Volume 0 |
| É pré-requisito de | Todos os capítulos |
| Artigos | `FH-01.01` a `FH-01.10` |

---

## 0. Núcleo Normativo

> Leia esta seção e você não violará este capítulo. Leia o restante e você saberá
> decidir casos que este capítulo não previu.

**`FH-01.01`** — A Constituição é a fonte de verdade máxima para toda decisão de
produto e experiência. Nenhuma decisão dessa natureza é válida se contradiz um
artigo vigente.
> **Verificação:** a decisão contradiz algum artigo vigente? → NÃO = cumpre | SIM = viola.

**`FH-01.02`** — A Constituição alcança **toda superfície na qual uma pessoa
percebe o FlowHub**, sem exceção: interface web, interface móvel, e-mail
transacional, notificação, mensagem enviada em nome do usuário, texto gerado por
IA, mensagem de erro exposta ao usuário, conteúdo de exportação e comunicação de
mudança de produto.
> **Verificação:** existe superfície percebida pelo usuário nesta entrega que foi projetada sem consultar a Constituição? → NÃO = cumpre | SIM = viola.

**`FH-01.03`** — Nenhum acordo verbal, decisão de reunião, pedido de cliente,
pressão de prazo, preferência pessoal ou hierarquia organizacional revoga,
suspende ou flexibiliza um artigo. Somente emenda formal (Capítulo 4) altera a
Constituição.
> **Verificação:** a exceção aplicada está registrada como emenda ou como exceção formal no Anexo E? → SIM = cumpre | NÃO = viola.

**`FH-01.04`** — Quem executa é responsável por conhecer os artigos aplicáveis à
sua tarefa. Desconhecimento não é justificativa aceita em revisão.
> **Verificação:** quem executou consegue nomear os artigos que governam a entrega? → SIM = cumpre | NÃO = viola.

**`FH-01.05`** — A Constituição vincula agentes de inteligência artificial
exatamente nos mesmos termos em que vincula pessoas. Um agente **NUNCA** possui
autoridade para decidir contra um artigo, nem quando instruído a fazê-lo por uma
tarefa.
> **Verificação:** o agente interrompeu e sinalizou ao encontrar conflito entre a tarefa e um **DEVE**/**NUNCA**? → SIM = cumpre | NÃO = viola.

**`FH-01.06`** — A Constituição descreve o produto que **deve ser**, não o produto
que **é**. Divergência entre o produto atual e a Constituição é dívida de
experiência (Capítulo 66) e **NUNCA** autoriza nova violação. É proibido usar "o
resto do produto já faz assim" como justificativa.
> **Verificação:** a justificativa da decisão se apoia em precedente do produto atual que viola a Constituição? → NÃO = cumpre | SIM = viola.

**`FH-01.07`** — A Constituição **NÃO** governa: preço, modelo comercial, roadmap,
prioridade de negócio, escolha de fornecedor, escolha de tecnologia, nem decisão
de arquitetura interna sem efeito perceptível pelo usuário. Invocá-la nesses
domínios é uso indevido.
> **Verificação:** a decisão em disputa produz efeito perceptível pelo usuário? → SIM = a Constituição se aplica | NÃO = não se aplica.

**`FH-01.08`** — Toda entrega que altera a experiência percebida **DEVE** declarar,
por escrito e de forma localizável, os artigos aplicados e as decisões
constitucionais tomadas.
> **Verificação:** existe registro escrito citando ao menos um `FH-XX.NN` nesta entrega? → SIM = cumpre | NÃO = viola.

**`FH-01.09`** — Resumos, extratos, versões condensadas, guias derivados e
memórias de agentes **NUNCA** possuem valor normativo. Apenas o texto vigente em
`docs/constituicao/` vincula. Em divergência entre um resumo e o texto original,
prevalece sempre o original.
> **Verificação:** a decisão se apoia exclusivamente em resumo, memória ou conhecimento prévio, sem verificação no texto vigente? → NÃO = cumpre | SIM = viola.

**`FH-01.10`** — A Constituição **DEVE** permanecer acessível, versionada e legível
para toda pessoa e todo agente que trabalha no produto. Documento inacessível não
vincula, e a inacessibilidade é falha do produto, não do leitor.
> **Verificação:** o documento está no repositório, versionado e alcançável a partir do `AGENTS.md`? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo estabelece **por que este documento tem poder**, **sobre o que ele
tem poder** e **sobre o que ele não tem**. Sem essa definição, a Constituição
seria apenas mais um documento de boas intenções em um repositório — lido uma
vez, citado nunca, contradito diariamente.

Ele responde à pergunta que antecede todas as outras: *quando este documento e a
vontade de alguém discordam, quem vence?*

---

## 2. Perguntas que este capítulo responde

- Quem manda quando há discordância sobre uma decisão de produto?
- Isto vale para o código, ou só para o design?
- Vale para textos de e-mail, notificações e mensagens enviadas ao cliente final?
- Vale para o que a IA escreve?
- Um agente autônomo é obrigado a seguir?
- E se o cliente pagante pedir o contrário?
- E se o produto atual já faz diferente?
- O que acontece se alguém simplesmente ignorar?
- A Constituição decide qual banco de dados usar? Qual o preço do plano?
- Posso confiar no resumo que um agente fez da Constituição?

---

## 3. Definições

**Decisão de produto** — qualquer escolha que altere o que o usuário percebe,
entende, sente, consegue ou não consegue fazer. Inclui o que é construído, como
se comporta, como é nomeado, quando aparece e o que acontece quando falha.

**Decisão de implementação** — qualquer escolha sobre como algo é construído
internamente, sem efeito perceptível. Governada pelo `AGENTS.md`.

**Superfície percebida** — todo ponto de contato no qual uma pessoa forma uma
impressão sobre o FlowHub. Não se limita à tela do produto.

**Vinculação** — a obrigação de obedecer. Um documento vincula quando sua
violação bloqueia entrega.

**Dívida de experiência** — parte do produto existente que contradiz a
Constituição e ainda não foi corrigida. Definida em detalhe no Capítulo 66.

**Uso indevido** — invocar a Constituição para vencer uma discussão fora do seu
alcance. É violação de `FH-01.07` e enfraquece a autoridade do documento.

---

## 4. Fundamento

Autoridade documental não se declara: ela se constrói por três mecanismos, e este
capítulo instala os três.

**O primeiro é o alcance explícito.** Documentos que não dizem sobre o que
mandam são contornados pela via mais simples: "isso aqui é outra coisa". Quando o
alcance é enumerado — incluindo superfícies que normalmente escapam, como o texto
de um e-mail transacional ou uma mensagem gerada por IA — a saída pela
tangente deixa de existir.

**O segundo é o limite explícito.** Um documento que pretende mandar em tudo
perde autoridade rapidamente, porque será invocado em discussões onde não tem
competência, perderá algumas, e cada derrota corrói a legitimidade nas discussões
onde deveria vencer. Por isso `FH-01.07` recusa território de propósito. A
Constituição não opina sobre preço nem sobre banco de dados — e essa recusa é
justamente o que a torna incontestável quando opina sobre confirmação de ação
destrutiva.

**O terceiro é a assimetria entre violar e cumprir.** Cumprir precisa ser barato:
ler o Núcleo Normativo e seguir. Violar precisa ser caro: exige emenda formal,
registro, justificativa e prazo. Quando essa assimetria se inverte — quando é
mais fácil abrir exceção do que cumprir — a constituição morre em meses, e morre
sem que ninguém perceba, porque cada exceção isolada parecia razoável.

O ponto mais delicado é `FH-01.06`. Em todo produto real, o código existente
contradiz o ideal em algum lugar. Se a Constituição fosse interpretada como
descrição do estado atual, cada violação existente viraria precedente, e o
documento passaria a legitimar exatamente aquilo que existe para corrigir. Por
isso a divergência é classificada como dívida: ela é reconhecida, registrada e
paga — mas nunca imitada.

---

## 5. Princípios

**A identidade do produto não pode morar em pessoas.** Pessoas saem, esquecem,
mudam de opinião sob pressão. O que está escrito e é verificável sobrevive.

**Autoridade limitada é autoridade forte.** Recusar competência fora do próprio
domínio é o que permite exercê-la integralmente dentro dele.

**Cumprir deve ser mais barato que violar.** Todo desenho de processo em torno da
Constituição obedece a esta assimetria.

**O produto atual não é argumento.** O que existe é evidência do que foi possível
até aqui, nunca prova do que é certo.

---

## 6. Regras normativas

Os artigos estão enunciados na seção 0. Abaixo, o desenvolvimento de cada um: em
que situação se aplica, em que situação não se aplica, e como se manifesta na
prática.

### `FH-01.01` — Supremacia

**Quando aplicar.** Sempre que houver divergência sobre uma decisão de produto,
independentemente de quem sustenta cada posição.

**Quando NÃO aplicar.** Em decisões sem efeito perceptível pelo usuário
(`FH-01.07`) e em obrigações legais, que prevalecem (`FH-03.07`).

**Certo.** "Não vamos remover a confirmação deste envio em massa. `FH-45` trata
ação que afeta terceiros como categoria irreversível. Se discordarmos da regra, o
caminho é propor emenda."

**Errado.** "Concordo que a regra existe, mas neste caso específico o cliente é
grande e está com pressa."

### `FH-01.02` — Alcance total das superfícies

**Quando aplicar.** Em qualquer artefato que o usuário lê, vê, ouve ou recebe.

**Quando NÃO aplicar.** Em logs internos, telemetria, mensagens de erro que nunca
chegam ao usuário e documentação de engenharia.

**Certo.** O texto de um e-mail de convite para a conta passa pelas regras de
linguagem (Capítulos 57–59) como qualquer texto de tela.

**Errado.** Tratar notificações e e-mails como "comunicação", fora do produto, e
escrevê-los com voz publicitária enquanto a interface segue outra voz. O usuário
não separa os dois: para ele, é o mesmo sistema falando.

### `FH-01.03` — Imunidade a pressão

**Quando aplicar.** Sempre, e especialmente quando houver urgência. Urgência é
justamente a condição na qual constituições são desmontadas.

**Quando NÃO aplicar.** Nunca. Não há exceção. Há apenas emenda.

**Certo.** Registrar uma exceção formal a um **DEVERIA**, com prazo de revisão de
até 90 dias e responsável nomeado.

**Errado.** "Depois a gente arruma." Sem registro e sem prazo, "depois" significa
"nunca", e a violação vira o novo padrão por inércia.

### `FH-01.04` — Responsabilidade de quem executa

**Quando aplicar.** Em toda tarefa que produza efeito perceptível.

**Quando NÃO aplicar.** Não exime quem revisa: revisor que aprova violação
responde igualmente.

**Certo.** Antes de construir, consultar o Anexo B pelos artigos do domínio
tocado.

**Errado.** Construir primeiro e verificar conformidade só na revisão. Isso
transforma a Constituição em obstáculo de fim de fila, e obstáculos de fim de
fila são removidos quando o prazo aperta.

### `FH-01.05` — Vinculação de agentes de IA

**Quando aplicar.** Em toda execução autônoma ou assistida que altere o produto.

**Quando NÃO aplicar.** Em exploração, análise e leitura que não produzam
alteração.

**Certo.** O agente identifica que a tarefa pede remover o foco visível de um
componente, reconhece violação de acessibilidade, interrompe, explica e propõe
alternativa.

**Errado.** O agente cumpre a instrução literal, entrega, e menciona a violação
apenas se perguntado. Silêncio sobre violação constitucional é, ele próprio, uma
violação.

### `FH-01.06` — Dever-ser, não é-ser

**Quando aplicar.** Sempre que o produto existente for usado como argumento.

**Quando NÃO aplicar.** Quando o padrão existente **está** em conformidade — aí
ele deve ser seguido, por consistência (`FH-03.06`).

**Certo.** "Esta tela antiga não trata o estado vazio. Vou tratar na minha e
registrar a dívida da antiga."

**Errado.** "As outras telas não tratam estado vazio, então a minha também não
precisa."

### `FH-01.07` — Limites de competência

**Quando aplicar.** Ao recusar o uso da Constituição em discussão fora do seu
domínio.

**Quando NÃO aplicar.** Quando a decisão aparentemente técnica ou comercial
produz efeito perceptível — a escolha de um provedor que aumenta a latência de
envio, por exemplo, é decisão técnica **com** efeito percebido, e a Constituição
se aplica ao efeito, não à escolha do provedor.

**Certo.** "A Constituição não decide qual biblioteca usar. Decide que o
resultado precisa responder dentro da faixa do `FH-46`."

**Errado.** Citar a Constituição para vencer uma discussão de precificação.

### `FH-01.08` — Rastreabilidade da decisão

**Quando aplicar.** Em toda entrega com efeito perceptível.

**Quando NÃO aplicar.** Em correção de defeito que restaura comportamento já
conforme.

**Certo.** Descrição de mudança contendo: "Estado vazio tratado por `FH-42.03`;
ação primária única por `FH-24.02`."

**Errado.** Entregar sem rastro. Sem rastro, a decisão não pode ser revisada nem
aprendida, e o mesmo debate se repete a cada trimestre.

### `FH-01.09` — Primazia do texto vigente

**Quando aplicar.** Sempre que a fonte da regra for memória, resumo ou
conhecimento prévio.

**Quando NÃO aplicar.** O Núcleo Normativo e o Anexo B **não** são resumos: são
partes normativas do próprio documento, mantidas em sincronia obrigatória.

**Certo.** Abrir o capítulo e confirmar o texto do artigo antes de citá-lo.

**Errado.** Um agente aplicar uma regra "lembrada" de outra sessão. Memória de
agente é resumo — e resumos derivam. Derivação de resumo é o mecanismo pelo qual
uma constituição vira folclore.

### `FH-01.10` — Acessibilidade do documento

**Quando aplicar.** Sempre.

**Quando NÃO aplicar.** Nunca.

**Certo.** Documento no repositório, versionado com o código, referenciado no
`AGENTS.md`.

**Errado.** Documento em ferramenta externa, sem versionamento, desatualizado em
relação ao produto. Um documento que não acompanha o código diverge dele — e
quando diverge, perde autoridade de forma irreversível.

---

## 7. Anti-padrões

**Constituição decorativa.** Existe, é bonita, ninguém consulta. Sintoma: nenhuma
entrega cita artigos. Causa: falta de gatilho obrigatório de leitura. Correção:
`FH-01.08` e o protocolo do Capítulo 2.

**Exceção silenciosa.** A regra é violada sem registro, "só desta vez". Sintoma:
o produto tem comportamentos inexplicáveis que ninguém sabe justificar. Causa:
ausência de custo para violar.

**Legitimação retroativa.** Algo já foi entregue fora do padrão e a regra é
reinterpretada para acomodar. Sintoma: artigos que ficam mais vagos com o tempo.
Correção: `FH-04.09`.

**Constituição como arma.** Artigos citados fora de contexto para vencer disputas
pessoais ou de território. Efeito: as pessoas passam a evitar o documento.
Correção: `FH-01.07`.

**Deriva por resumo.** Cada equipe ou agente mantém sua versão condensada; as
versões divergem; ninguém percebe. Correção: `FH-01.09`.

---

## 8. Impactos

**Cognitivo.** Reduz drasticamente a carga de decisão recorrente. Sem
constituição, cada escolha é decidida do zero, com todo o custo de deliberação e
negociação. Com ela, a maioria das decisões vira consulta. O custo cognitivo se
desloca de "decidir" para "localizar" — e localizar é muito mais barato.

**Emocional.** Reduz conflito interpessoal. Discordâncias deixam de ser embates
de gosto ou de senioridade e passam a ser questões de conformidade. Isso protege
especialmente quem tem menos poder na organização: o argumento de autoridade
perde força diante de um artigo escrito.

**Produtividade.** O ganho não está na primeira entrega, está a partir da décima.
Há custo inicial de consulta e de registro. O retorno vem da eliminação de
retrabalho, de rediscussão e de correção tardia de decisões incoerentes.

**Percepção de qualidade.** É o impacto de maior alcance e o mais invisível. O
usuário nunca lerá a Constituição, mas percebe seu efeito: telas que se parecem,
comportamentos que se repetem, sistema que não surpreende. Coerência é lida como
cuidado, e cuidado é lido como qualidade.

**Curva de aprendizagem.** Alta no início para quem chega — há um documento a
conhecer. Muito baixa depois, e muito mais baixa do que a alternativa real, que é
aprender por tentativa, erro e correção em revisão. A Constituição substitui anos
de contexto tácito por leitura estruturada.

---

## 9. Riscos e trade-offs

**Risco: rigidez.** Uma regra escrita pode estar errada e ainda assim ser
obrigatória. É um custo real e assumido. A mitigação é o Capítulo 4, que torna a
emenda um caminho legítimo, rápido e sem estigma. Regra errada se emenda; regra
errada não se ignora.

**Risco: burocracia.** Registro e citação custam tempo. A mitigação é o Núcleo
Normativo: a maior parte das decisões é resolvida em segundos, e o registro só é
exigido de quem altera experiência percebida.

**Risco: uso político.** O documento pode virar instrumento de disputa. Mitigado
por `FH-01.07` e pela exigência de verificação binária: um artigo objetivo é
difícil de instrumentalizar, porque a resposta não depende de quem argumenta
melhor.

**Risco: obsolescência.** Regras podem envelhecer. Mitigado pela separação entre
artigos (atemporais) e Aterrissagem (datada), e pelo versionamento semântico.

**O trade-off central.** Trocamos flexibilidade individual por coerência
coletiva. Um designer isolado produzirá, ocasionalmente, uma solução melhor do
que a constitucional. Vinte pessoas e agentes trabalhando sem constituição
produzirão, com certeza, um produto incoerente. A troca vale a pena porque
incoerência é irreversível na percepção do usuário, enquanto uma solução ótima
perdida pode ser recuperada por emenda.

---

## 10. Critérios de verificação

1. Toda entrega com efeito perceptível cita ao menos um artigo.
2. Nenhuma exceção existe sem registro no Anexo E, com responsável e prazo.
3. Nenhuma justificativa de decisão se apoia em precedente não conforme do
   produto atual.
4. O `AGENTS.md` referencia a Constituição e a hierarquia entre eles.
5. Agentes de IA sinalizam conflito antes de implementar, e o registro dessa
   sinalização existe.
6. O documento está versionado junto ao código, no mesmo repositório.

---

## 11. Checklist do capítulo

- [ ] Sei quais artigos governam o que estou construindo.
- [ ] Minha decisão não contradiz artigo vigente.
- [ ] Se contradiz, abri proposta de emenda ou registro de exceção — não segui
      assim mesmo.
- [ ] Considerei todas as superfícies percebidas, não apenas a tela.
- [ ] Não usei o produto atual como justificativa para repetir uma violação.
- [ ] Registrei os artigos aplicados de forma localizável.
- [ ] Verifiquei o texto vigente, não minha memória dele.

---

## 12. Referências cruzadas

**Depende de.** Volume 0 (§0.5 linguagem normativa, §0.10 verificação binária,
§0.11 fallback, §0.13 relação entre documentos).

**É pré-requisito de.** Todos os capítulos. Em especial: Capítulo 2 (como
aplicar), Capítulo 3 (conflitos), Capítulo 4 (emenda), Capítulo 66 (dívida),
Capítulo 68 (agentes).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Texto vigente da Constituição | `docs/constituicao/` |
| Consulta rápida de artigos | `docs/constituicao/ANEXO-B-indice-de-artigos.md` |
| Gatilho de leitura obrigatória | `AGENTS.md`, seção 0 |
| Regras de implementação (não constitucionais) | `AGENTS.md`, seções 1–16 |
| Obrigações legais que prevalecem | `docs/legal/`, `docs/business-rules/` |
| Registro de exceções e decisões | `docs/constituicao/ANEXO-E-registro-de-decisoes.md` |
