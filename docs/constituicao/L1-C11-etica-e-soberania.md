# Capítulo 11 — Ética, Privacidade e Soberania do Usuário

| Campo | Valor |
| --- | --- |
| Livro | I — Identidade e Filosofia |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P2, P4, P9), 10 |
| É pré-requisito de | Capítulos 18, 49, 50, 51, 52, 54, 56 |
| Artigos | `FH-11.01` a `FH-11.12` |

> Este capítulo governa decisões com consequência sobre pessoas que **não são
> usuárias do FlowHub** — os contatos do cliente. Elas não escolheram estar aqui e
> não podem reclamar conosco. Por isso a proteção delas é obrigação nossa, não do
> nosso cliente.

---

## 0. Núcleo Normativo

**`FH-11.01`** — Padrões escuros são **categoricamente proibidos**. Inclui, sem
esgotar: opção de recusa escondida ou desigual à de aceite; consentimento
pré-marcado; linguagem que envergonha quem recusa; contagem regressiva
artificial; escassez falsa; custo revelado tarde; assinatura fácil e cancelamento
difícil; interface que induz erro em favor do sistema.
> **Verificação:** existe elemento que induz o usuário a decidir contra o próprio interesse por desenho? → NÃO = cumpre | SIM = viola.

**`FH-11.02`** — Consentimento **DEVE** ser informado, específico, revogável e
tão fácil de retirar quanto de conceder.
> **Verificação:** retirar o consentimento custa o mesmo ou menos do que concedê-lo? → SIM = cumpre | NÃO = viola.

**`FH-11.03`** — **Direito ao silêncio do destinatário.** Manifestação de recusa
em receber comunicação **DEVE** ser honrada imediatamente, em todos os canais e
fluxos, e **NUNCA** pode ser revertida por quem envia.
> **Verificação:** existe caminho pelo qual alguém que recusou volte a receber comunicação? → NÃO = cumpre | SIM = viola.

**`FH-11.04`** — **Minimização.** O sistema coleta, exibe, armazena e transmite
apenas o dado necessário à finalidade declarada. Dado coletado "porque pode ser
útil um dia" é proibido.
> **Verificação:** cada dado coletado tem finalidade declarada e atual? → SIM = cumpre | NÃO = viola.

**`FH-11.05`** — Dados de terceiros — os contatos do cliente — recebem **o mesmo
nível de proteção** que os dados do usuário. Não existe categoria de dado menos
protegida por pertencer a quem não usa o produto.
> **Verificação:** algum dado de terceiro tem proteção, retenção ou exposição menos rigorosa que a de dado do usuário? → NÃO = cumpre | SIM = viola.

**`FH-11.06`** — **Transparência de IA.** Sempre que a inteligência artificial ler,
gerar ou agir, o usuário **DEVE** poder saber: o que foi lido como contexto, o que
foi gerado e o que foi efetivamente enviado ou executado.
> **Verificação:** é possível, na interface, saber o que a IA leu, gerou e executou? → SIM = cumpre | NÃO = viola.

**`FH-11.07`** — Presença e atividade de membros da equipe são **informação
operacional**, nunca instrumento de vigilância. É proibido expor métricas
individuais como julgamento, ranking punitivo ou registro de inatividade
minuto a minuto.
> **Verificação:** alguma informação sobre um membro da equipe serve mais para julgá-lo do que para coordenar o trabalho? → NÃO = cumpre | SIM = viola.

**`FH-11.08`** — O produto **NUNCA** facilita comunicação não solicitada em massa
fora das regras do canal e da legislação aplicável. Capacidade técnica não
autoriza uso.
> **Verificação:** esta funcionalidade permite comunicação em massa sem base legal e sem respeito às regras do canal? → NÃO = cumpre | SIM = viola.

**`FH-11.09`** — **Portabilidade sem fricção.** O usuário exporta seus dados em
formato utilizável, sem pedido, sem espera artificial e sem perda de informação
essencial.
> **Verificação:** a exportação é autosserviço, completa e em formato utilizável? → SIM = cumpre | NÃO = viola.

**`FH-11.10`** — Em conflito entre eficiência comercial do usuário e respeito ao
destinatário, **vence o destinatário**.
> **Verificação:** a solução privilegia o alcance do envio em detrimento do controle de quem recebe? → NÃO = cumpre | SIM = viola.

**`FH-11.11`** — Toda funcionalidade que trate dado pessoal **DEVE** ter finalidade,
base legal e prazo de retenção declarados antes de ser construída.
> **Verificação:** finalidade, base legal e retenção estão declaradas? → SIM = cumpre | NÃO = viola.

**`FH-11.12`** — Obrigações legais e contratuais registradas em `docs/legal/` e
`docs/business-rules/` prevalecem sobre qualquer artigo desta Constituição
(`FH-03.06`).
> **Verificação:** a solução contraria alguma obrigação registrada nesses documentos? → NÃO = cumpre | SIM = viola.

---

## 1. Propósito

Este capítulo define os limites éticos do produto. Ele existe porque o FlowHub
opera sobre um desequilíbrio de poder incomum: quem sofre as consequências do uso
— a pessoa que recebe as mensagens — não é quem decide, não é quem paga e não tem
canal conosco.

---

## 2. Perguntas que este capítulo responde

- O que o sistema pode decidir sozinho?
- O que exige consentimento, e de quem?
- Como tratamos dados dos contatos do nosso cliente?
- Quais padrões escuros exatamente são proibidos?
- Podemos mostrar métricas individuais da equipe?
- Como equilibrar eficiência de disparo com respeito a quem recebe?
- O que o usuário precisa saber sobre o que a IA faz?
- Quando a lei entra em conflito com a experiência?

---

## 3. Definições

**Padrão escuro** — desenho que induz o usuário a decidir contra o próprio
interesse por meio de assimetria, ocultação, pressão ou confusão deliberadas.

**Destinatário** — pessoa que recebe comunicação enviada através do FlowHub. Não
é usuária do produto.

**Titular de dado** — pessoa a quem o dado pessoal se refere, seja usuário ou
destinatário.

**Consentimento específico** — autorização para uma finalidade determinada.
Autorização genérica **nunca** é consentimento.

**Vigilância** — coleta ou exibição de informação sobre pessoas com finalidade de
controle, e não de coordenação do trabalho.

**Base legal** — fundamento jurídico que autoriza o tratamento de um dado pessoal.

---

## 4. Fundamento

**O desequilíbrio que define este capítulo.** Em quase todo software, o usuário é
quem sofre as consequências das decisões de produto. No FlowHub, não: uma decisão
sobre facilidade de disparo em massa afeta principalmente pessoas que nunca
abriram o produto. Elas não podem reclamar conosco, não podem trocar de
fornecedor e não sabem que existimos. Quando um grupo sofre consequências sem ter
voz, a proteção precisa ser estrutural — escrita como regra, não deixada ao
julgamento de quem opera.

**Por que padrões escuros são proibidos de forma categórica.** Eles funcionam: é
por isso que existem. Aumentam conversão, retenção e aceitação no curto prazo.
Também são, na prática, uma transferência de valor obtida por meio de erro
induzido — e o usuário eventualmente percebe. Quando percebe, ele não conclui que
uma tela era enganosa; conclui que a empresa é enganosa, e reinterpreta
retroativamente tudo que aceitou. O ganho é imediato e mensurável; o custo é
tardio, difuso e maior.

**Por que o consentimento precisa ser simétrico.** A assimetria entre conceder e
retirar é a forma mais comum de padrão escuro por ser fácil de justificar
internamente ("ninguém pediu para facilitar"). `FH-11.02` estabelece o teste
objetivo: contar os passos dos dois lados. Se retirar custa mais, é padrão
escuro, independentemente da intenção.

**Por que o silêncio do destinatário é absoluto.** Quem recusou receber
comunicação exerceu o único poder que tem. Se esse poder puder ser revertido por
quem envia — por reimportação de lista, nova campanha ou reativação manual —, ele
não é um direito, é uma sugestão. `FH-11.03` fecha essa porta: a recusa pertence
ao destinatário, não ao remetente, e não é revertida pelo remetente em nenhuma
circunstância.

**Por que dados de terceiros têm proteção igual.** Existe uma tendência natural em
sistemas B2B de tratar o dado do cliente do cliente como "dado do cliente" — um
ativo do usuário. Juridicamente e eticamente, ele é dado pessoal de alguém.
`FH-11.05` remove a categoria intermediária: a proteção acompanha a pessoa, não a
relação comercial.

**Por que presença não é vigilância.** Saber quem está atendendo agora coordena o
trabalho e evita duplicidade — isso é útil e legítimo. Registrar quanto tempo cada
pessoa ficou inativa transforma a mesma informação em instrumento de controle.
A fronteira de `FH-11.07` é a finalidade: se a informação serve para **coordenar**,
é operacional; se serve para **julgar**, é vigilância. Sistemas de vigilância
também degradam o dado que coletam, porque as pessoas passam a otimizar a métrica
em vez do trabalho.

**Por que a transparência da IA é obrigatória.** A IA age sobre conversas reais
com clientes reais. Se o usuário não souber o que ela leu como contexto, ele não
pode avaliar se a sugestão faz sentido; se não souber o que foi enviado, não pode
corrigir o que saiu errado. Sem transparência, a única postura racional é
desconfiar de tudo — o que anula o valor da funcionalidade.

---

## 5. Princípios

**Quem não tem voz precisa de proteção estrutural.**

**Recusar deve custar o mesmo que aceitar.**

**Capacidade técnica não é autorização.**

**Informação sobre pessoas serve para coordenar, nunca para julgar.**

**O ganho obtido por indução ao erro é dívida, não receita.**

---

## 6. Regras normativas

### `FH-11.01` — Padrões escuros

**Quando aplicar.** Em toda decisão que envolva escolha do usuário: aceite,
recusa, cancelamento, upgrade, consentimento, exclusão.

**Quando NÃO aplicar.** Não proíbe recomendar nem destacar a opção mais comum.
A fronteira é objetiva: **destacar** é apresentar uma opção com mais proeminência
mantendo as demais igualmente acessíveis e compreensíveis; **induzir** é tornar
a opção contrária mais difícil, menos visível ou constrangedora.

**Certo.** "Cancelar assinatura" com o mesmo peso visual de "Manter", uma tela,
sem oferta intermediária obrigatória.

**Errado.** Botão de recusa em texto cinza pequeno; "Não, prefiro perder meus
resultados"; cancelamento que exige passar por três ofertas.

### `FH-11.02` — Consentimento simétrico

**Quando aplicar.** Em todo consentimento: comunicação, dados, integrações, IA.

**Quando NÃO aplicar.** Quando a retirada exige verificação de identidade por
razão de segurança — aí o custo adicional protege o titular, não o sistema.

### `FH-11.03` — Silêncio do destinatário

**Quando aplicar.** Em todo envio, automação, disparo e integração.

**Quando NÃO aplicar.** Nunca. A recusa **DEVE** valer inclusive contra
reimportação de lista, criação de novo contato com o mesmo número e nova conta do
mesmo usuário quando identificável.

**Errado.** Opt-out que vale apenas para a campanha em que foi manifestado.

### `FH-11.04` — Minimização

**Quando aplicar.** Ao definir campos, logs, exportações e integrações.

**Quando NÃO aplicar.** Quando a retenção é exigida por obrigação legal — aí a
lei define o prazo (`FH-11.12`).

### `FH-11.05` — Proteção igual para terceiros

**Quando aplicar.** Em armazenamento, exibição, log, exportação, envio a
provedores externos e treinamento de modelos.

**Errado.** Registrar conteúdo de conversas de destinatários em log de depuração
sem prazo e sem finalidade declarada.

### `FH-11.06` — Transparência de IA

**Quando aplicar.** Em toda funcionalidade que use modelos.

**Quando NÃO aplicar.** Não exige exibir o mecanismo interno do modelo — exige
exibir **contexto lido, conteúdo gerado e ação executada**.

### `FH-11.07` — Presença sem vigilância

**Quando aplicar.** Em presença, atribuição, tempo de resposta e relatórios de
equipe.

**Quando NÃO aplicar.** Métricas agregadas da operação são legítimas. A distinção
é entre medir o **processo** e vigiar a **pessoa**.

**Certo.** Ver quem está atendendo uma conversa agora, para evitar duplicidade.

**Errado.** Registro de inatividade individual exibido como desempenho.

### `FH-11.08` — Comunicação em massa

**Quando aplicar.** Em disparos, automações e integrações de envio.

**Quando NÃO aplicar.** Não impede comunicação legítima e consentida — impede
facilitação de envio sem base.

### `FH-11.09` — Portabilidade

**Quando aplicar.** Sempre.

**Errado.** Exportação mediante solicitação ao suporte, com prazo de dias.

### `FH-11.10` — Destinatário vence eficiência

Arbitragem permanente já registrada em `FH-03.09`.

### `FH-11.11` — Declaração prévia

**Quando aplicar.** Antes de construir qualquer funcionalidade que trate dado
pessoal.

### `FH-11.12` — Prevalência legal

Ver `FH-03.06`. Quando a lei contraria um artigo, a lei prevalece **e** o artigo é
emendado no mesmo ciclo.

---

## 7. Anti-padrões

**Recusa de segunda classe.** Aceitar é um clique; recusar são três.

**Opt-out local.** Recusa que vale só naquele envio.

**Log eterno.** Conteúdo de conversa em log sem prazo nem finalidade.

**Painel de vigilância.** Métricas individuais apresentadas como julgamento.

**IA opaca.** Sugestão sem origem visível — proibida também por P9.

**Consentimento guarda-chuva.** Uma autorização genérica usada para justificar
qualquer tratamento futuro.

**Exportação como obstáculo.** Portabilidade que existe formalmente e é
inutilizável na prática.

---

## 8. Impactos

**Cognitivo.** Ausência de padrões escuros reduz a vigilância que o usuário
precisa manter sobre a própria interface. Em produtos que induzem, o usuário lê
cada tela com desconfiança — o que é lento e cansativo.

**Emocional.** Este capítulo determina se o usuário sente que o sistema está do
lado dele. `FH-11.07` determina se a equipe sente que trabalha com uma ferramenta
ou sob um supervisor.

**Produtividade.** `FH-11.09` e `FH-11.02` reduzem trabalho administrativo.
`FH-11.07`, ao evitar vigilância, preserva a qualidade do dado operacional — em
sistemas de vigilância, as pessoas otimizam a métrica.

**Percepção de qualidade.** Ética percebida é componente direto de confiança. Um
único padrão escuro descoberto contamina a leitura de todo o produto.

**Curva de aprendizagem.** Interfaces honestas são aprendidas mais rápido, porque
o usuário não precisa aprender a se defender delas.

---

## 9. Riscos e trade-offs

**Risco: desvantagem competitiva de curto prazo.** Concorrentes que usam padrões
escuros terão métricas melhores em conversão e retenção. Trade-off assumido: são
métricas emprestadas do futuro.

**Risco: atrito com o usuário pagante.** `FH-11.03` e `FH-11.10` limitam o que o
cliente pode fazer com a própria base. Alguns pedirão o contrário. É o caso mais
claro em que o produto protege terceiros contra o interesse imediato de quem paga
— e é uma decisão de identidade, não de conveniência.

**Risco: custo de conformidade.** Declarar finalidade, base legal e retenção antes
de construir adiciona etapa. É a etapa mais barata do ciclo — descobrir depois
custa incidente.

**Trade-off central.** Trocamos poder do cliente sobre a base dele por proteção de
quem não escolheu estar ali. Essa troca define o caráter do produto e é a menos
negociável de todas.

---

## 10. Critérios de verificação

1. Nenhuma escolha do usuário é apresentada com assimetria que induza ao erro.
2. Retirar consentimento custa o mesmo ou menos que concedê-lo.
3. Recusa de destinatário é global, permanente e não reversível pelo remetente.
4. Todo dado coletado tem finalidade declarada e atual.
5. Dados de terceiros têm o mesmo nível de proteção que os do usuário.
6. É possível saber o que a IA leu, gerou e executou.
7. Nenhuma informação sobre pessoas é exibida como julgamento individual.
8. Exportação é autosserviço, completa e utilizável.
9. Finalidade, base legal e retenção estão declaradas antes da construção.

---

## 11. Checklist do capítulo

- [ ] Contei os passos: recusar custa o mesmo que aceitar?
- [ ] A recusa do destinatário vale em todos os fluxos, para sempre?
- [ ] Cada dado que coleto tem finalidade atual declarada.
- [ ] Dados de terceiros estão tão protegidos quanto os do usuário.
- [ ] O usuário consegue ver o que a IA leu, gerou e executou.
- [ ] Nenhuma métrica individual vira julgamento.
- [ ] A exportação funciona sozinha e é completa.
- [ ] Verifiquei `docs/legal/` e `docs/business-rules/`.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P2, P4, P9), 10 (promessas).

**É pré-requisito de.** Capítulo 18, 49, 50 (colaboração e presença), 51
(permissões), 52 (IA), 54 (automações), 56 (métricas).

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Opt-out em disparos | `docs/business-rules/opt-out-em-disparos-em-massa.md`, `src/lib/broadcast-status.ts` |
| Direitos do titular (LGPD) | `docs/business-rules/correcao-endpoints-direitos-titular-lgpd.md`, `docs/business-rules/pagina-solicitacao-lgpd-e-subprocessadores.md` |
| Retenção e exclusão | `docs/business-rules/retencao-exclusao-inadimplencia.md` |
| Logs de IA e provedor externo | `docs/business-rules/retencao-logs-ia-e-provedor-externo.md` |
| Mídia de IA em bucket privado | `docs/business-rules/privatizacao-bucket-ai-service-media.md` |
| Presença de equipe | `src/lib/presence.ts`, `src/components/presence/` |
| Políticas legais | `docs/legal/` |
