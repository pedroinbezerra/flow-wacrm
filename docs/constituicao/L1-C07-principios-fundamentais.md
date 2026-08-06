# Capítulo 7 — Princípios Fundamentais

| Campo | Valor |
| --- | --- |
| Livro | I — Identidade e Filosofia |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 1–6 |
| É pré-requisito de | Todos os capítulos posteriores |
| Artigos | `FH-07.01` a `FH-07.12` |

> **Este é o capítulo mais importante da Constituição.** Quando nenhuma outra
> regra couber, é aqui que a decisão se resolve (`FH-02.03`). Todo capítulo
> posterior é, em última instância, a aplicação destes dez princípios a um
> domínio específico.

---

## 0. Núcleo Normativo

**`FH-07.01`** — Os dez Princípios Fundamentais (§5) vinculam toda decisão de
produto. Nenhuma decisão pode contrariar um princípio, salvo quando artigo
específico e mais restrito a autorize expressamente.
> **Verificação:** a decisão contraria algum dos dez princípios sem artigo específico que a autorize? → NÃO = cumpre | SIM = viola.

**`FH-07.02`** — *(Complexidade pertence ao sistema)* Nenhuma complexidade interna
— arquitetura, limitação técnica, modelo de dados, restrição de fornecedor,
divisão de equipes — pode ser exposta ao usuário como decisão a tomar,
vocabulário a aprender ou etapa a cumprir.
> **Verificação:** alguma decisão, termo ou passo exigido do usuário existe por razão interna do sistema? → NÃO = cumpre | SIM = viola.

**`FH-07.03`** — *(Antecipação com consentimento)* O sistema **PODE** prever,
preparar, pré-preencher e sugerir. **NUNCA PODE** concluir, sem confirmação
explícita, ação com efeito externo, irreversível ou sobre terceiros.
> **Verificação:** o sistema concluiu ação com efeito externo, irreversível ou sobre terceiros sem confirmação explícita? → NÃO = cumpre | SIM = viola.

**`FH-07.04`** — *(Esforço mínimo)* Todo passo de uma tarefa frequente **DEVE**
produzir informação ou decisão necessária. Passo que apenas confirma, apenas
navega ou apenas separa etapas é proibido.
> **Verificação:** existe passo neste fluxo que não produz informação nem decisão necessária? → NÃO = cumpre | SIM = viola.

**`FH-07.05`** — *(Nada surpreende, tudo pode ser desfeito)* Toda ação do usuário
**DEVE** pertencer a uma de três categorias: reversível, confirmada, ou impossível
de errar. Não existe quarta categoria.
> **Verificação:** esta ação é reversível, confirmada ou impossível de errar? → SIM = cumpre | NÃO = viola.

**`FH-07.06`** — *(Coerência acima de novidade)* Entre uma solução nova e um padrão
existente que resolva o problema, vence o padrão existente. Novidade exige
demonstração de que o padrão existente falha, não de que a novidade agrada.
> **Verificação:** existe padrão constitucional que resolva este problema? Se SIM, ele foi usado? → SIM = cumpre | NÃO = viola.

**`FH-07.07`** — *(Silêncio como cortesia)* O sistema só interrompe o usuário
quando o custo de **não** interromper for maior que o custo de interromper. Toda
interrupção **DEVE** ser justificável por consequência concreta para o usuário.
> **Verificação:** existe consequência concreta para o usuário caso esta interrupção não ocorra? → SIM = cumpre | NÃO = viola.

**`FH-07.08`** — *(Previsibilidade)* O mesmo gesto **DEVE** produzir o mesmo
resultado em todo o produto, sempre. Comportamento que varia conforme a área, o
horário, o volume de dados ou o histórico do usuário é proibido, salvo quando a
variação for a informação em si.
> **Verificação:** este gesto produz resultado diferente do mesmo gesto em outra área do produto? → NÃO = cumpre | SIM = viola.

**`FH-07.09`** — *(Poder progressivo)* Nenhuma capacidade avançada pode residir em
área, tela ou modo separado do fluxo normal. Profundidade vive no mesmo lugar da
superfície, revelada progressivamente.
> **Verificação:** esta capacidade exige entrar em um "modo avançado", tela separada ou área paralela? → NÃO = cumpre | SIM = viola.

**`FH-07.10`** — *(Honestidade de estado)* O sistema **NUNCA** representa como
certo o que é incerto, como concluído o que está em andamento, como salvo o que
não foi persistido, nem como completo o que é parcial.
> **Verificação:** algum estado exibido afirma mais certeza do que o sistema realmente possui? → NÃO = cumpre | SIM = viola.

**`FH-07.11`** — *(Respeito ao tempo)* Nenhuma espera é imposta sem informação
sobre o que está acontecendo, e nenhum tempo do usuário é consumido em benefício
exclusivo do sistema.
> **Verificação:** existe espera sem informação, ou passo que serve apenas ao sistema? → NÃO = cumpre | SIM = viola.

**`FH-07.12`** — Toda entrega com efeito perceptível **DEVE** poder nomear qual
princípio ela serve. Entrega que não serve a nenhum princípio **DEVE** ser
reexaminada quanto à sua necessidade.
> **Verificação:** é possível nomear o princípio servido por esta entrega? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo enuncia as verdades permanentes das quais todo o restante da
Constituição deriva. Ele existe para dois usos:

1. **Decidir casos não previstos.** É o último degrau da ordem de interpretação
   (`FH-02.03`). Quando nada mais responde, os princípios respondem.
2. **Avaliar regras futuras.** Um artigo novo que contrarie um princípio é sinal
   de que o artigo está errado — ou de que o princípio precisa de emenda, o que é
   raríssimo e deliberadamente difícil.

---

## 2. Perguntas que este capítulo responde

- Quais são as verdades que não mudam?
- Como uso um princípio para decidir algo concreto?
- Como sei que um princípio foi violado?
- Dois princípios colidem. O que faço?
- Um princípio é abstrato demais para o meu caso. Ainda vale?
- Como um princípio se manifesta em código, não só em tela?

---

## 3. Definições

**Princípio** — verdade permanente que orienta decisões e da qual artigos podem
ser derivados. Princípio **não bloqueia entrega sozinho** (§0.10); artigos
bloqueiam. Mas princípio contrariado é fundamento suficiente para exigir
redesenho na revisão.

**Sinal de violação** — evidência observável de que um princípio foi rompido,
mesmo quando nenhum artigo específico foi violado.

**Efeito externo** — consequência que sai do sistema e alcança terceiros: envio de
mensagem, cobrança, chamada a serviço externo, alteração de dado de outra pessoa.

**Revelação progressiva** — técnica de expor capacidade adicional no próprio ponto
de uso, conforme o contexto a torne pertinente.

---

## 4. Fundamento

Princípios existem para resolver o problema da **cobertura incompleta**. Nenhum
conjunto finito de regras cobre um produto vivo: sempre haverá o caso que ninguém
previu, a tela que ninguém imaginou, a tecnologia que ainda não existia quando as
regras foram escritas.

Um documento sem princípios falha nesse ponto exato — e falha silenciosamente,
porque quem encontra o caso não coberto não percebe que está inventando: ele
acredita estar aplicando bom senso. O problema é que bom senso é individual, e
individualidade é justamente o que produz incoerência (Capítulo 1, §4).

Os dez princípios abaixo foram escolhidos por três critérios objetivos: **(a)**
cada um resolve uma classe inteira de decisões, não um caso; **(b)** cada um
sobrevive à mudança de tecnologia de interface; **(c)** cada um pode ser
verificado por um sinal observável, mesmo sem artigo específico.

Eles não são independentes entre si — colidem, e a colisão é normal. Quando
colidem, aplica-se a hierarquia do Capítulo 3, e as colisões mais frequentes já
estão arbitradas na tabela de `FH-03.09`.

---

## 5. Os Dez Princípios Fundamentais

### P1 — Complexidade pertence ao sistema, nunca ao usuário

**Enunciado.** Toda complexidade necessária para que algo funcione é
responsabilidade de quem constrói. O usuário recebe apenas a decisão que só ele
pode tomar.

**Fundamento.** Complexidade não desaparece: ela é apenas alocada. Quando o
sistema não a absorve, ela é transferida ao usuário na forma de escolhas,
conceitos e etapas. Essa transferência parece neutra para quem constrói — e é
brutalmente assimétrica: ela é paga uma vez pelo time e milhares de vezes pelos
usuários.

**Obriga.** Absorver decisão que o sistema pode tomar; escolher padrões
inteligentes; traduzir conceitos internos em conceitos do domínio do usuário;
tratar caso extremo em vez de expor sua existência.

**Proíbe.** Expor limitação técnica como escolha; usar vocabulário interno na
interface; pedir informação que só existe para satisfazer o modelo de dados.

**Em tela.** Um envio que precisa de janela de tempo, aprovação de modelo e
formatação de destinatário aparece como uma ação: enviar.

**Em código.** A camada de domínio absorve regra e caso extremo; o componente de
interface não decide regra de negócio nem expõe estados internos.

**Sinal de violação.** O usuário pergunta "o que isso quer dizer?" sobre algo que
não pertence ao negócio dele.

### P2 — Antecipação com consentimento

**Enunciado.** O sistema deve estar um passo à frente, e nunca um passo além.

**Fundamento.** Antecipar é o que produz a sensação de inteligência; agir sem
consentimento é o que a destrói. A fronteira não é o grau de acerto da
antecipação — é a **reversibilidade da consequência**. Antecipar errado sobre
algo reversível custa um clique; antecipar errado sobre algo externo pode custar
a relação do usuário com um cliente dele.

**Obriga.** Preparar, pré-preencher, sugerir, ordenar por probabilidade, deixar
tudo pronto para o "sim".

**Proíbe.** Concluir ação de efeito externo, irreversível ou sobre terceiros sem
confirmação explícita.

**Em tela.** A resposta sugerida aparece escrita, pronta, editável — e não é
enviada até que o usuário mande.

**Em código.** Efeito externo nunca é disparado no mesmo caminho que produz a
sugestão. A separação é estrutural, não convencional.

**Sinal de violação.** O usuário diz "eu não pedi isso".

### P3 — Esforço mínimo por resultado

**Enunciado.** O caminho entre a intenção do usuário e o resultado deve ser o mais
curto que a segurança e a compreensão permitirem.

**Fundamento.** Esforço é o custo real de qualquer software, e ele é pago em
unidades que ninguém mede: um clique a mais, uma tela a mais, uma decisão a mais.
Isoladamente, cada um é irrelevante; multiplicados pela frequência de uso, são a
diferença entre uma ferramenta que se usa e uma que se evita.

**Obriga.** Medir passos do fluxo principal; eliminar etapas que só separam;
oferecer caminhos diretos para tarefas frequentes.

**Proíbe.** Passo que só confirma que o usuário quer mesmo continuar; navegação
como etapa; formulário dividido em telas por organização visual.

**Em tela.** A ação mais frequente da área é alcançável sem navegação
intermediária.

**Em código.** Fluxos frequentes não dependem de estado espalhado por várias
rotas que precisam ser percorridas em ordem.

**Sinal de violação.** Alguém consegue descrever uma tarefa comum em uma frase, e
executá-la exige mais de três decisões.

### P4 — Nada surpreende, tudo pode ser desfeito

**Enunciado.** O usuário sempre sabe o que vai acontecer antes de acontecer, e
sempre consegue voltar depois.

**Fundamento.** A disposição de explorar um sistema é diretamente proporcional à
confiança de que explorar não causa dano. Um sistema do qual se pode voltar é
aprendido por experimentação — que é rápida, barata e agradável. Um sistema do
qual não se pode voltar é aprendido por instrução e medo — que é lento, caro e
gera evitação permanente de áreas inteiras do produto.

**Obriga.** Reversibilidade como padrão; declaração de consequência antes da
ação; preservação do que foi digitado.

**Proíbe.** Ação destrutiva sem saída; perda de trabalho por navegação, erro ou
falha de rede; consequência descoberta depois do fato.

**Em tela.** Uma exclusão comum se desfaz por alguns segundos; uma exclusão
irreversível declara exatamente o que será perdido.

**Em código.** Operações destrutivas são desenhadas com janela de reversão ou
confirmação explícita — nunca com exclusão imediata e silenciosa.

**Sinal de violação.** O usuário hesita antes de clicar em algo comum.

### P5 — Coerência acima de novidade

**Enunciado.** Um padrão previsível vence uma solução melhor porém isolada.

**Fundamento.** O valor de um padrão cresce com o número de vezes que ele se
repete, porque cada repetição confirma a expectativa do usuário e reduz o custo
da próxima. Uma exceção não custa apenas a si mesma: ela enfraquece a confiança
na previsibilidade de todas as outras ocorrências do padrão.

**Obriga.** Reutilizar antes de criar; generalizar por emenda quando a novidade
for realmente melhor.

**Proíbe.** Padrão local; variação estética; "só nesta tela".

**Em tela.** A mesma ação tem o mesmo nome, a mesma posição e o mesmo
comportamento em todo lugar.

**Em código.** Primitivas compartilhadas antes de variantes locais; nenhuma
variante não registrada.

**Sinal de violação.** Duas telas resolvem o mesmo problema de formas diferentes.

### P6 — Silêncio como cortesia

**Enunciado.** O sistema fala pouco, e cada vez que fala, importa.

**Fundamento.** Atenção é um recurso finito e não renovável dentro de uma jornada
de trabalho. Cada aviso gasta uma fração dela. Pior: avisos irrelevantes treinam
o usuário a ignorar avisos, e essa aprendizagem não distingue os importantes dos
demais. Um sistema que avisa demais é funcionalmente equivalente a um sistema que
não avisa.

**Obriga.** Justificar cada interrupção por consequência concreta; agrupar;
preferir informação periférica a interrupção.

**Proíbe.** Confirmação de sucesso de ação óbvia; aviso sobre o que o usuário
acabou de fazer; notificação sem consequência; urgência artificial.

**Em tela.** A maior parte das ações bem-sucedidas não produz mensagem alguma —
produz resultado visível.

**Em código.** Notificação é decisão de domínio, com critério de urgência
explícito, nunca efeito colateral de uma chamada bem-sucedida.

**Sinal de violação.** O usuário fecha mensagens sem ler.

### P7 — Confiança se constrói com previsibilidade

**Enunciado.** O mesmo gesto produz o mesmo resultado, sempre.

**Fundamento.** Confiança em software não vem de acerto ocasional; vem de
ausência de variação. Um sistema que acerta 95% das vezes de forma imprevisível é
percebido como menos confiável que um sistema que acerta 85% de forma
consistente — porque o segundo pode ser modelado mentalmente, e o primeiro
obriga a verificar tudo, sempre.

**Obriga.** Comportamento idêntico entre áreas; posição estável de elementos;
resultado independente de horário, volume ou histórico.

**Proíbe.** Interface que se reorganiza sozinha; atalho que muda de função;
comportamento que depende de estado invisível.

**Em tela.** O que estava ali continua ali, faz o mesmo.

**Em código.** Ausência de comportamento condicional invisível ao usuário; mesmo
contrato para a mesma operação em todo lugar.

**Sinal de violação.** O usuário verifica o resultado de uma ação que já executou
dezenas de vezes.

### P8 — Poder progressivo

**Enunciado.** Fácil no primeiro dia, profundo no centésimo — no mesmo lugar.

**Fundamento.** Separar "modo simples" de "modo avançado" divide o produto em
dois e obriga o usuário a uma migração explícita que a maioria nunca faz. O
resultado é que a profundidade existe e não é usada, e o iniciante nunca vira
fluente. A alternativa é a revelação progressiva: a capacidade adicional vive
exatamente onde a tarefa acontece, aparecendo quando o contexto a torna
pertinente.

**Obriga.** Superfície simples com profundidade acessível no ponto de uso;
caminhos paralelos (mouse, teclado, comando) para a mesma ação.

**Proíbe.** Modo avançado separado; tela de especialista; capacidade escondida
atrás de configuração.

**Em tela.** O atalho de teclado é ensinado ao lado da ação que ele executa, para
quem já está usando o mouse.

**Em código.** A mesma operação atende ao caminho simples e ao avançado — sem
duplicação de lógica que possa divergir com o tempo.

**Sinal de violação.** Usuários antigos usam o produto exatamente como no primeiro
dia.

### P9 — Honestidade de estado

**Enunciado.** O sistema nunca finge.

**Fundamento.** A representação de estado é o contrato mais básico entre software
e usuário. Quando ela mente — mostra salvo o que não salvou, completo o que é
parcial, certo o que é estimado — o dano não se limita ao caso: o usuário passa a
verificar tudo, e a verificação constante destrói o ganho de produtividade que o
sistema existe para gerar. Uma mentira de estado custa mais que dez falhas
admitidas.

**Obriga.** Distinguir inferido de confirmado; declarar dado parcial, estimado ou
desatualizado; mostrar o que está em andamento.

**Proíbe.** Progresso falso; sucesso otimista sem reconciliação; número
aproximado apresentado como exato; conteúdo gerado apresentado como verificado.

**Em tela.** Uma operação em lote com falhas parciais informa exatamente o que
falhou, e não "concluído".

**Em código.** Atualização otimista sempre reconcilia com o servidor e reverte
visivelmente em caso de falha.

**Sinal de violação.** O usuário confere em outro lugar algo que o sistema já
mostrou.

### P10 — Respeito ao tempo do usuário

**Enunciado.** O tempo do usuário pertence ao trabalho dele, não ao sistema.

**Fundamento.** Todo software impõe alguma espera. A diferença entre espera
aceitável e espera humilhante não está na duração, mas em duas propriedades:
saber o que está acontecendo e poder fazer outra coisa enquanto acontece. Espera
sem informação é interpretada como falha; espera que impede qualquer outra ação é
interpretada como desrespeito.

**Obriga.** Informar o que ocorre; permitir trabalho paralelo; devolver o usuário
exatamente ao ponto de onde saiu.

**Proíbe.** Tela travada por processo em segundo plano; espera silenciosa; refazer
trabalho por navegação; passo que serve apenas a necessidade interna do sistema.

**Em tela.** Um processamento longo continua sozinho e avisa ao terminar; o
usuário segue trabalhando.

**Em código.** Operações longas são assíncronas por desenho, com estado
observável, não bloqueantes por padrão.

**Sinal de violação.** O usuário espera olhando para a tela sem poder fazer nada.

---

## 6. Regras normativas

Os artigos deste capítulo convertem os princípios em obrigações verificáveis.
Abaixo, apenas as fronteiras de aplicação — o desenvolvimento conceitual está em
§5.

| Artigo | Princípio | Quando NÃO aplicar |
| --- | --- | --- |
| `FH-07.02` | P1 | Quando a complexidade é do **negócio** do usuário, não do sistema: regras do canal, exigências legais, decisões comerciais que só ele pode tomar. |
| `FH-07.03` | P2 | Em ações internas, reversíveis e sem efeito sobre terceiros — aí agir sem perguntar é o comportamento correto. |
| `FH-07.04` | P3 | Quando o passo existe para prevenir dano irreversível (`FH-45`) ou para obter consentimento (`FH-07.03`). |
| `FH-07.05` | P4 | Nunca. É a categorização obrigatória de toda ação. |
| `FH-07.06` | P5 | Quando o padrão existente foi demonstrado insuficiente **e** a nova solução é generalizada por emenda para todo o produto. |
| `FH-07.07` | P6 | Quando a informação é a própria tarefa do usuário (uma mensagem recebida não é interrupção do sistema; é o trabalho chegando). |
| `FH-07.08` | P7 | Quando a variação é a informação: um estado diferente **deve** parecer diferente. |
| `FH-07.09` | P8 | Em áreas administrativas destinadas a operar a conta, não o negócio. |
| `FH-07.10` | P9 | Nunca. |
| `FH-07.11` | P10 | Quando a espera é imposta por terceiro fora do controle do sistema — e mesmo aí, informar continua obrigatório. |
| `FH-07.12` | Todos | Em correção de defeito que restaura comportamento já conforme. |

**Colisões mais frequentes entre princípios, já arbitradas:**

| Colisão | Vence | Onde está decidido |
| --- | --- | --- |
| P2 (antecipação) × P4 (nada surpreende) | P4 | `FH-03.02(c)` |
| P3 (esforço mínimo) × P4 (reversibilidade) | P4 | `FH-03.02(c)` |
| P5 (coerência) × P3 (esforço mínimo) | P5 | `FH-03.05` |
| P6 (silêncio) × P9 (honestidade) | P9 | Estado real nunca é omitido para evitar ruído |
| P8 (poder) × P1 (simplicidade) | P1 na superfície, P8 na profundidade | Tabela `FH-03.09` |
| P10 (tempo) × P9 (honestidade) | P9 | Nunca fingir conclusão para parecer rápido |

---

## 7. Anti-padrões

**Princípio decorativo.** Citado em apresentações, ausente das decisões. Sintoma:
nenhuma entrega consegue nomear o princípio que serve (`FH-07.12`).

**Princípio como argumento retroativo.** Usado para justificar decisão já tomada
(`FH-02.09`).

**Colisão não arbitrada.** Dois princípios invocados por lados opostos, sem
aplicar a hierarquia. Resultado típico: meio-cumprimento, proibido por
`FH-03.11`.

**Simplicidade por subtração.** Interpretar P1 como "remover capacidade". P1 exige
esconder complexidade, jamais reduzir poder — a distinção é o Capítulo 8 inteiro.

**Antecipação sem freio.** Interpretar P2 como autorização para agir. P2 autoriza
preparar, não concluir.

---

## 8. Impactos

**Cognitivo.** Os princípios funcionam como esquema mental compartilhado: quem os
internaliza decide certo em casos novos sem consultar nada. É a forma mais barata
de conformidade que existe, porque não consome consulta.

**Emocional.** P4, P7 e P9 são os principais responsáveis pela sensação de
segurança. P6 e P10 são os principais responsáveis pela sensação de respeito.
Juntos, produzem o estado afetivo-alvo do Capítulo 17: confiança calma.

**Produtividade.** P3 e P10 atuam diretamente sobre tempo. P8 atua sobre o teto:
sem ele, o usuário fluente permanece limitado ao repertório do iniciante.

**Percepção de qualidade.** P5 e P7 são a origem da percepção de "produto bem
feito". Coerência e previsibilidade são lidas como cuidado, mesmo quando o
usuário não consegue nomeá-las.

**Curva de aprendizagem.** P8 é o princípio que governa a curva inteira. P1
determina sua inclinação inicial: cada complexidade absorvida pelo sistema é um
degrau que o usuário não precisa subir.

---

## 9. Riscos e trade-offs

**Risco: abstração inaplicável.** Princípios podem virar frases bonitas sem efeito.
Mitigação: cada princípio tem sinal de violação observável, e `FH-07.12` exige
que toda entrega nomeie o princípio servido.

**Risco: uso seletivo.** Escolher o princípio conveniente entre dez. Mitigação:
tabela de colisões arbitradas em §6 e `FH-02.09`.

**Risco: conservadorismo.** P5 e P7 desencorajam mudança, inclusive boa mudança. É
um custo real. A compensação é o caminho de emenda: novidade que se prove melhor
vira padrão de todo o produto, e não exceção local.

**Trade-off central.** Os princípios impõem custo constante a quem constrói para
remover custo constante de quem usa. P1 exige absorver complexidade; P2 exige
disciplina para não agir; P4 exige projetar reversibilidade em tudo; P9 exige
admitir incerteza que seria mais fácil esconder. Nenhum deles é o caminho barato.
São o caminho certo — e a diferença entre os dois é exatamente o que separa o
FlowHub de um produto médio.

---

## 10. Critérios de verificação

1. Toda entrega nomeia o princípio que serve.
2. Nenhuma decisão exposta ao usuário existe por razão interna do sistema.
3. Nenhuma ação de efeito externo ocorre sem confirmação explícita.
4. Toda ação está classificada como reversível, confirmada ou impossível de errar.
5. Nenhum padrão local foi criado sem emenda que o generalize.
6. Toda interrupção tem consequência concreta declarada.
7. Nenhum estado exibido afirma mais certeza do que o sistema possui.
8. Nenhuma capacidade avançada vive em modo separado.
9. Nenhuma espera ocorre sem informação.

---

## 11. Checklist do capítulo

- [ ] Sei qual princípio esta entrega serve.
- [ ] Nenhuma complexidade interna vazou para o usuário.
- [ ] O que o sistema antecipa, ele prepara — não conclui.
- [ ] Todo passo do fluxo produz informação ou decisão necessária.
- [ ] Toda ação é reversível, confirmada ou impossível de errar.
- [ ] Reutilizei padrão existente em vez de criar um novo.
- [ ] Cada interrupção tem consequência concreta.
- [ ] O mesmo gesto faz o mesmo que faz no resto do produto.
- [ ] Nenhuma capacidade foi para um "modo avançado".
- [ ] Nenhum estado exibido é mais otimista que a realidade.
- [ ] Nenhuma espera é silenciosa ou bloqueante sem necessidade.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 1–6.

**É pré-requisito de.** Todos os capítulos posteriores. Correspondências diretas:
P1 → Cap. 8; P2 → Cap. 18, 52, 55; P3 → Cap. 19, 49; P4 → Cap. 44, 45; P5 →
Cap. 28, 35; P6 → Cap. 40, 43; P7 → Cap. 23, 34; P8 → Cap. 16, 48; P9 → Cap. 41,
46, 56; P10 → Cap. 46, 50.

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Absorção de complexidade (P1) | `src/lib/` — regras de domínio fora dos componentes |
| Efeito externo com consentimento (P2, P4) | `src/lib/whatsapp/`, `src/lib/broadcasts` e fluxos de envio |
| Reversibilidade e confirmação (P4) | `src/components/ui/dialog.tsx`, `src/components/themed-toaster.tsx` |
| Coerência de padrões (P5) | `src/components/ui/` |
| Previsibilidade de comportamento (P7) | `src/hooks/`, contratos compartilhados |
| Honestidade de estado (P9) | Estados de carregamento e erro em cada rota de `src/app/(dashboard)/` |
