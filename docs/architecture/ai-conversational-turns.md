# Turnos conversacionais do Atendimento Inteligente

> Como o FlowHub decide **quando** a IA fala, **o que** ela pretende fazer antes
> de falar, e **por que** uma resposta pronta às vezes não deve mais sair.

| Campo | Valor |
| --- | --- |
| Migration | `supabase/migrations/069_ai_conversational_turns.sql` |
| Módulos | `src/lib/ai-service/{engine,turn-store,turn-waiter,turn-runner,response-planner,turn-config}.ts` |
| Endpoint | `GET|POST /api/ai-service/turns/drain` (recuperação) |
| Artigos aplicados | `FH-43.09`, `FH-46.01`, `FH-46.04`, `FH-46.09`, `FH-52.04`, `FH-52.06`, `FH-53.10`, `FH-18.08` |

---

## 1. O problema

O WhatsApp não tem "enviar". Tem seis mensagens seguidas:

```
Qual o preço? E no Capuan em Caucaia
Mas não é pra logo. Tô em negociação do terreno
É um cajueiro de porte grande e alto
Não tem casas perto. É em um loteamento
Você corta árvore?
Bom dia
```

Para quem escreveu, isso é um pedido só, construído aos poucos. Para o
sistema anterior, eram seis webhooks, seis execuções da IA e seis respostas —
cada uma raciocinando sobre um pedaço.

**A mensagem é a unidade de transporte. O turno é a unidade de conversa.**

Havia um segundo problema, independente do primeiro: a decisão de mandar uma
mensagem intermediária ("deixa eu verificar isso para você") não estava
ancorada em nada. No exemplo acima a empresa não corta árvore — a resposta já
era conhecida e não havia absolutamente nada a verificar. Qualquer heurística
baseada em quantidade de mensagens, tamanho de texto ou contagem de tokens
teria mandado a mensagem mesmo assim, porque nenhuma delas sabe o que o agente
pretende fazer.

---

## 2. O fluxo

```
Webhook recebe mensagem
        │
        ├─→ persiste em `messages`  (inalterado: realtime, timeline, auditoria)
        │
        └─→ ai_turn_append_message  ── abre ou estende o turno aberto da conversa
                    │
                    │   (silêncio de `turn_inactivity_ms`, ou teto `turn_max_wait_ms`)
                    ▼
                    │
        ┌───────────┴────────────────────────────────────────────┐
        │                                                        │
   CAMINHO NORMAL                                        RECUPERAÇÃO
   after() do webhook espera até                  pg_cron 5s → pg_net →
   closes_at e reivindica direto                  /api/ai-service/turns/drain
   (ai_turn_claim_if_due)                         (ai_turn_claim_due)
        │                                                        │
        │  despertador obsoleto encerra                          │
        │  aqui, sem acordar nada                                │
        └───────────┬────────────────────────────────────────────┘
                    ▼
            turno reivindicado com lease + claim_token
                    │
                    ▼
                 runTurn
                    │
                    ├─ 1. carrega o turno inteiro (ordem, horário, tipo, anexos)
                    ├─ 2. PLANEJAMENTO  → o que é preciso fazer para responder isto?
                    ├─ 3. EXECUÇÃO      → resposta final começa a ser gerada
                    │        └─ corrida contra o limiar de presença
                    ├─ 4. ai_turn_begin_publish  ── ponto de não-retorno
                    └─ 5. envio + log
```

---

## 3. Agregação em turnos

### Quem acorda o turno

Fechar um turno exige acordar alguém **poucos segundos** depois da última
mensagem. São duas necessidades diferentes, e cada uma tem seu mecanismo:

| | Mecanismo | Cobre |
| --- | --- | --- |
| **Precisão** | Despertador pós-webhook (`turn-waiter.ts`) | O caminho normal |
| **Durabilidade** | pg_cron 5s → `ai_turn_dispatch_due()` → pg_net | O que escapa do primeiro |

**Precisão.** O webhook sabe, no instante do append, exatamente quando aquele
turno vai fechar — `closes_at` volta da RPC. Então ele agenda, no ciclo
pós-resposta (`after()`), um despertador para esse instante. Sem varredura,
sem jitter: o parâmetro configurado em 2,5s entrega ~2,5s.

**Durabilidade.** O `after()` não tem retry próprio e morre junto com a
invocação. Por isso o despachante no banco continua existindo — para o ciclo
pós-resposta que não rodou, o deploy no meio, o lease vencido, a espera longa
demais para o caminho rápido. Ele **não** está na rota crítica, e é por isso
que 5 segundos bastam.

**Por que não simplesmente encurtar o cron para 1s.** Resolveria o jitter na
força bruta, mas transformaria um problema que só existe quando chega mensagem
em 86.400 varreduras por dia, por ambiente, mesmo sem tráfego — com
`cron.job_run_details` crescendo junto, e ainda sobrando até 1s de incerteza.
O despertador aproveita justamente o evento que já sabe a resposta.

### O despertador é descartável por construção

O banco continua sendo a autoridade. O despertador não decide nada: ele
carrega um bilhete com o turno **como ele era ao nascer** e, ao acordar, pede
ao Postgres uma reivindicação atômica.

```sql
ai_turn_claim_if_due(turn_id, expected_generation, expected_closes_at, lease)
-- só reivindica se:
--   status = 'open'
--   AND generation  = expected_generation
--   AND closes_at   = expected_closes_at
--   AND closes_at  <= NOW()
```

Numa rajada, cada mensagem deixa um despertador para trás:

```
M1 → acorda 10:00:02.5, esperando geração 1
M2 → acorda 10:00:03.1, esperando geração 2
...
M6 → acorda 10:00:05.7, esperando geração 6
```

Quando o de M1 acorda, o turno está na geração 6. A reivindicação não casa e
ele encerra ali — **sem HTTP, sem runner, sem acordar ninguém.** Só o
despertador de M6 encontra o turno como o deixou.

É um debounce distribuído otimista, e a regra de corrida continua onde deve
estar: num `UPDATE` de linha única, não numa comparação em TypeScript. Se
todos os despertadores sumissem, nada se perde — a latência simplesmente volta
a ser a do cron.

> **Armadilha.** `expected_closes_at` precisa ser a string que o Postgres
> devolveu, repassada sem conversão. Um `new Date(...).toISOString()` no
> caminho truncaria os microssegundos, nenhuma reivindicação casaria, e o
> caminho rápido morreria **em silêncio** — parecendo funcionar, porque o cron
> cobriria tudo alguns segundos depois. Há teste fixando esse repasse.

### Latência resultante

| Cenário | Da última mensagem até o planner |
| --- | --- |
| Mensagem única | ~2,5s |
| Rajada | ~6s após a última mensagem (janela de rajada) |
| Turno longo | teto de 45s |
| Despertador perdido (raro) | + até 5s do cron |

`aggregation_wait_ms` mede isso em produção, e `TURN_WAITER_MAX_WAIT_MS`
(20s) é o corte acima do qual o caminho rápido não vale a pena: num turno que
já vai esperar 40s, ±5s do cron não muda percepção nenhuma.

### Janela ociosa e janela máxima

São coisas diferentes e foram separadas de propósito:

| Parâmetro | Padrão | O que é |
| --- | --- | --- |
| `turn_inactivity_ms` | **2,5s** | **Janela ociosa.** Silêncio que fecha o turno enquanto ele ainda é uma mensagem só. |
| — derivada — | 6s | Janela ociosa **depois que o turno virou rajada** (2 mensagens ou mais). |
| `turn_max_wait_ms` | 45s | **Janela máxima.** Teto absoluto contado da primeira mensagem. |

`closes_at = LEAST(now + janela aplicável, hard_deadline_at)`.

**Por que a janela ociosa escala.** As duas situações não têm nada a ver uma
com a outra. Quem manda "vocês abrem sábado?" e para de escrever não pode
esperar a janela de uma rajada antes de a IA sequer começar — 2,5s de silêncio
ali já são conclusivos, e uma janela longa vira latência pura numa pergunta
simples. Quem está na terceira linha de um raciocínio merece mais folga,
porque a pausa entre linhas de uma mesma fala é naturalmente maior que a pausa
depois da fala terminada.

O fator (`TURN_BURST_IDLE_MULTIPLIER = 2,4`, em `turn-config.ts`) é regra
derivada, e não um terceiro botão: a conta decide o ritmo com dois números, e
a escalada é o desdobramento do primeiro. Quem escolhe qual janela aplicar é
`ai_turn_append_message`, que já sabe se o turno tem uma mensagem ou várias.

Os valores vivem em `ai_service_config`, por conta, e são resolvidos por
`resolveTurnTiming()` — que também limita valores fora de faixa e impede a
janela de rajada de ultrapassar o teto. A validação
existe em três camadas de propósito: `CHECK` na migration, 400 explícito na
API, e limitação no resolver (para linhas legadas anteriores à migration 069,
que chegam sem as colunas).

---

## 4. Invariantes e concorrência

Nenhuma regra de corrida é decidida em TypeScript. Todas moram em RPC.

| # | Invariante | Onde é garantida |
| --- | --- | --- |
| 1 | No máximo um turno `open` por conversa | Índice único parcial `uq_ai_turns_open_per_conversation` |
| 2 | Uma mensagem pertence a no máximo um turno | `UNIQUE (message_id)` em `ai_turn_messages` |
| 3 | Uma resposta obsoleta nunca é publicada | `ai_turn_mark_external_attempt` vs. `ai_turn_append_message`, no mesmo lock de linha |
| 4 | Mensagem sem resposta publicada continua no contexto | `ai_turn_effective_messages` + `response_published` |

**Invariante 2 é a idempotência.** Replay de webhook não incrementa contador,
não estende janela e não abre turno: a mensagem já está vinculada, e o append
devolve o turno existente com `was_duplicate = true`.

**Invariante 3 é o requisito difícil.** O cenário:

```
Cliente: Quanto custa?
         [turno fecha, IA começa a processar]
Cliente: Na verdade preciso de 30 unidades.
```

`ai_turn_append_message` marca `superseded` na linha do turno antigo.
`ai_turn_begin_publish` e `ai_turn_mark_external_attempt` disputam a **mesma
linha**. O Postgres serializa por lock de linha; quem perde, perde inteiro. Se
o append ganhou, o `UPDATE` não casa nenhuma linha, a resposta em mãos morre
sem sair, e o turno novo responde considerando tudo.

A execução do LLM **não** é cancelada — cancelar seria caro e não é o
requisito. O requisito é que a resposta não seja publicada, e isso é decidido
depois de ela estar pronta, no último instante possível.

### Autorização interna ≠ efeito externo

São dois marcos, e confundi-los custa caro nas duas direções:

| Marco | O que significa | Reversível? |
| --- | --- | --- |
| `status = 'publishing'` | O executor decidiu responder. **Nada saiu.** | Sim — ainda invalidável, ainda recuperável |
| `external_attempt_at` preenchido | A primeira chamada ao WhatsApp foi tentada. | **Não** |

`ai_turn_begin_publish` faz o primeiro. `ai_turn_mark_external_attempt`, o
segundo — chamado imediatamente antes da primeira chamada à Meta, e só dela. A
janela entre os dois é um ida-e-volta ao Postgres; é o menor limite honesto que
dá para desenhar.

A separação resolve duas coisas ao mesmo tempo:

- **Invalidação** — `append` invalida turnos em `processing` *e* em
  `publishing` sem tentativa externa. Um turno que apenas se autorizou a falar
  não ganha com isso o direito de falar depois que a pessoa mudou de assunto.
- **Recuperação** — ver abaixo.

### Recuperação

O `claim_token` é um lease. O que acontece com um lease vencido depende
inteiramente de já ter havido efeito externo:

| Estado no momento da morte | O que acontece |
| --- | --- |
| `processing` | Volta para a fila, até o teto de tentativas. Nada saiu. |
| `publishing`, **sem** `external_attempt_at` | Volta para a fila. A autorização era interna; nada saiu. |
| `publishing`, **com** `external_attempt_at` | Encerra como `failed`, `outcome = 'external_result_unknown'`. **Não reenvia.** |
| Teto de tentativas esgotado | Encerra como `failed`, `outcome = 'lease_expired_max_attempts'`. |

O terceiro caso é o único em que a resposta se perde de vez, e é assim de
propósito: não se sabe se a Meta recebeu, e reenviar arriscaria uma segunda
resposta à mesma fala. Para o efeito externo a garantia é **no máximo uma
vez**, com estado explícito na auditoria em vez de reenvio automático — quem
decide o que fazer é o operador, olhando o `outcome`.

O segundo caso é o que o desenho anterior perdia: uma execução que morria entre
a autorização e a chamada era tratada como se tivesse falado, e a resposta
sumia sem nunca ter existido para o cliente.

A mensagem de presença tem sua própria trava, `presence_sent_at`: um turno
recuperado não repete o reconhecimento que o cliente já leu.

### Mensagem sem resposta continua sendo pergunta

Um turno invalidado não some da conversa. O cenário canônico:

```
Cliente: Quanto custa?
         [turno A fecha, entra em processing]
Cliente: Na verdade preciso de 30 unidades.
         [A é invalidado, B é criado]
```

Se o turno B recebesse apenas a segunda linha, a IA responderia "30 unidades de
quê?" — e a primeira pergunta teria sido engolida pelo próprio mecanismo que
existe para não perder o que a pessoa disse.

`ai_turn_effective_messages(turn_id)` devolve o **contexto efetivo**: as
mensagens do próprio turno, mais as de todo turno anterior da mesma conversa
encerrado sem resposta publicada, até a última resposta que de fato saiu.

O que marca a fronteira é `response_published`, gravado por `ai_turn_finish`
**somente quando algo chegou de fato ao cliente** — texto enviado ou mídia
enviada.

Os dois critérios andam juntos e de propósito:

| Desfecho | Status | Herda? |
| --- | --- | --- |
| Resposta enviada | `completed` | não — a fala foi coberta |
| Invalidado por mensagem nova | `superseded` | **sim** |
| Envio falhou, modelo não produziu texto, erro do provedor | `failed` | **sim** |
| Humano assumiu, limite horário, serviço desligado | `completed` | não |

A última linha é a que exige cuidado. São desfechos **deliberados**:
ressuscitar a fala do cliente na próxima execução da IA contrariaria a decisão
que acabou de ser tomada — a conversa agora é de uma pessoa. Por isso o status
importa tanto quanto o `response_published`: um turno que a IA decidiu não
responder é `completed`; um turno que a IA não conseguiu responder é `failed`.
Encerrar um envio que deu errado como `completed` faria a pergunta sumir do
contexto sem nunca ter sido respondida.

A ordenação atravessa turnos e é cronológica, então a fala reconstruída lê na
ordem em que foi dita.

### Estados

| Estado | Significado |
| --- | --- |
| `open` | acumulando mensagens |
| `processing` | reivindicado; planejamento/LLM em curso — **invalidável** |
| `publishing` | direito de publicar adquirido — **não invalidável** |
| `completed` | resposta publicada (ou desfecho legítimo sem resposta) |
| `superseded` | invalidado por entrada nova, handoff ou tomada de posse humana |
| `failed` | esgotou as tentativas |

---

## 5. Planejamento antes da resposta

`buildPlannerPrompt` → `parseResponsePlan` produz, antes da execução:

```ts
{
  intent, canAnswerNow, needsLookup, lookups[],
  knownPartial, strategy, presenceText, estimatedEffort, confidence
}
```

O planejador recebe o **índice** da base de conhecimento (categorias e
títulos), não o conteúdo — ele decide se a resposta está ao alcance, não a
redige. Isso mantém a chamada barata o bastante para caber antes de toda
execução.

O plano é gravado em `ai_conversation_turns.plan` **antes** da execução, para
existir no rastro mesmo que a execução falhe (`FH-53.10`).

O modelo é tratado como fonte não confiável. `parseResponsePlan` reconcilia as
incoerências do plano **ali**, e não adiante, quando já viraram mensagem:

- `needs_lookup: true` com `lookups: []` → vira `needsLookup: false`. Sem item,
  não há consulta.
- `partial_then_work` sem `known_partial` → vira `presence_then_work`.
- Saída que não é JSON → `FALLBACK_PLAN`: responde já, sem intermediária.

O fallback é deliberadamente o comportamento silencioso. Quando o planejamento
falha, o erro que se quer cometer é ficar calado até ter a resposta — nunca
prometer trabalho que ninguém sabe se existe.

---

## 6. Comunicação intermediária

### O que `lookups` governa — e o que não governa

`lookups` é o portão da **linguagem de ação**, não o portão da presença.

A distinção é o centro do módulo. Uma execução pode demorar sem que exista
consulta nenhuma acontecendo: base de conhecimento grande, resposta longa,
provedor lento. Obrigar silêncio ali trocaria um defeito por outro — a pessoa
fica sem sinal de que foi entendida, que é exatamente a falta que a presença
existe para cobrir.

| Plano | Pode reconhecer? | Pode dizer que está verificando? |
| --- | --- | --- |
| Sem `lookups` | **Sim** | Não |
| Com `lookups` | Sim | Sim, e apenas o que está em `lookups` |
| `strategy: 'decline'` | Não | Não |

`validateAcknowledgement` aplica isso em código, não confiando no modelo:

- **Recusa curta (`decline`)** — silêncio. Preceder "não trabalhamos com corte
  de árvores" de "entendi que você precisa derrubar um cajueiro" é redundância,
  não presença. A resposta inteira cabe numa frase.
- **Frase genérica de espera** — recusada sempre, com ou sem trabalho real.
  "Só um momento", "aguarde", "estou verificando", "ainda estou analisando"
  servem igualmente bem a qualquer conversa, e é isso que as desqualifica.
- **Afirmação de ação sem ação** — recusada. `claimsAction()` detecta "vou
  verificar / conferir / consultar / analisar / apurar…"; sem `lookups`, isso
  não é verdade (`FH-43.09`, `FH-46.04`, `FH-52.04`).
- **Acima de 320 caracteres** — recusada: passou disso, é a resposta final
  disfarçada de reconhecimento.

Os quatro comportamentos esperados, ponta a ponta:

```
sem lookup + resposta rápida
  → resposta final, sem nada antes

sem lookup + resposta demorando
  → "Ah, entendi. Então a ideia é manter os três usuários e todo o histórico."
  → resposta final

com lookup + resposta demorando
  → "Entendi, duas cobranças no mesmo cartão. Vou conferir esse pagamento."
  → resposta final

fora do escopo e imediatamente respondível
  → resposta final, sem presença
```

### A corrida

A presença **não atrasa** a resposta. As duas correm juntas:

```ts
Promise.race([finalPromise, delay(presenceThresholdMs)])
```

Se a resposta final chega antes do limiar, nada intermediário é dito — que é o
desfecho preferido, e o primeiro dos quatro casos acima. Se o limiar vence,
`ai_turn_mark_presence_sent` confere de uma vez que o turno ainda vale e que
este reconhecimento ainda não saiu; só então a mensagem é enviada.

O limiar é medido contra o tempo **real** de execução, nunca estimado
(`FH-46.01`, `FH-46.04`). Quem decide *se* a mensagem sai é o relógio; quem
decide *se ela é verdadeira* é o validador. As duas perguntas são separadas de
propósito.

A marca da presença não congela o turno: mandar um reconhecimento não dá a
ninguém o direito de publicar depois uma resposta que já ficou velha.

### Resposta parcial

Quando parte da resposta já é conhecida e outra parte depende de trabalho, a
ordem da mensagem composta importa: **a informação vem primeiro, a expectativa
depois**.

> Hoje não temos uma integração pronta com o XPTO.
>
> Sobre desenvolver uma integração específica e estimar custo, vou verificar
> como isso se encaixaria no seu caso.

É o que separa resposta parcial útil de mensagem de espera. Se a segunda metade
não passa no exame, a primeira sai sozinha — ela já vale mais que o silêncio e
não promete nada.

### Progresso

`validateProgressUpdate` exige etapa **concluída** e trabalho restante. Hoje a
execução tem uma etapa só — a geração da resposta — então nenhuma atualização
de progresso é emitida. **O silêncio aqui é o comportamento correto, não uma
lacuna**: narrar meio-caminho inexistente produziria exatamente o "ainda estou
verificando" que este trabalho remove. O validador é o contrato pronto para
quando existir camada de ferramentas.

### Presença entra desligada

`presence_enabled` tem padrão `false`. É efeito externo em nível de autonomia
3+ (`FH-18.08`): a conta liga sabendo o que liga.

---

## 7. Observabilidade

`ai_execution_logs` ganhou `turn_id`, `stage`, `plan`, `turn_message_count`,
`carried_over_message_count`, `aggregation_wait_ms`, `planning_ms`,
`generation_ms`, `perceived_latency_ms` e `superseded`.

`stage` distingue as manifestações da mesma estratégia: `plan`, `presence`,
`partial`, `progress`, `final`, `superseded`.

Métricas que permitem calibrar as janelas com dado real em vez de palpite:

| Pergunta | Como responder |
| --- | --- |
| A janela de silêncio está curta demais? | Distribuição de `turn_message_count`. Muitos turnos de 1 mensagem seguidos na mesma conversa = a janela corta a fala no meio. |
| Está longa demais? | `perceived_latency_ms` — o tempo que a pessoa do outro lado sentiu, da última mensagem dela até a resposta. |
| Quanto tempo de silêncio a agregação está introduzindo? | `aggregation_wait_ms`. |
| O planejamento está pagando o próprio custo? | `planning_ms` vs. `generation_ms`. O planejamento é uma inferência **serial** antes da resposta: `planning_ms` é latência que o cliente sente em toda conversa, inclusive nas que não precisavam de plano nenhum. Se ele se aproximar de `generation_ms`, o desenho precisa mudar (plano em paralelo, modelo menor, ou plano só a partir de N mensagens). |
| Quanto custa o planejamento em tokens? | Os tokens do planejador são somados aos da execução no log final — o custo é visível, não escondido. |
| Quanta fala está sendo herdada de turnos invalidados? | `carried_over_message_count`. Consistentemente acima de zero indica janela ociosa curta demais: o turno fecha antes de a pessoa terminar, e o trabalho é refeito. |
| Com que frequência uma resposta é descartada por obsolescência? | `stage = 'superseded'`. Muitos = a janela fecha antes de a pessoa terminar. |
| A presença está sendo útil ou virando ruído? | Proporção de `stage = 'presence'` sobre `stage = 'final'`. |

Uma resposta descartada por invalidação **é registrada** com o texto que teria
sido enviado, e não some silenciosamente.

Consumo passou a ser um evento `ai_execution` por **turno**, não por mensagem.

---

## 8. Compatibilidade

- `messages` é intocada. O turno é camada lógica sobre ela — histórico,
  timeline, realtime, auditoria e integração com o WhatsApp continuam vendo a
  granularidade original.
- `processInboundWithAIService` mantém a assinatura. O que mudou é o
  significado de `handled`: passou de "a IA já respondeu" para "a IA assumiu
  esta mensagem". A distinção importa porque, enquanto a pessoa continua
  escrevendo, ainda não existe resposta — e mesmo assim as automações de
  conteúdo precisam ficar fora, ou reagiriam a um texto que já tem dono.
- `turn_aggregation_enabled = false` devolve o comportamento anterior — uma
  resposta por mensagem — **sem** criar um segundo caminho de execução: o turno
  fecha na mesma invocação (`ai_turn_claim_one`) e quem responde continua sendo
  o mesmo runner. É a válvula de rollback.
- Tomada de posse humana (`PATCH .../handler`), handoff e injeção de prompt
  cancelam o turno aberto na hora. Sem isso, um turno aberto fecharia depois da
  tomada de posse e a IA responderia por cima do atendimento humano.
- O webhook e o drenador declaram `maxDuration = 60` explicitamente. O ciclo
  pós-resposta do webhook passou a incluir o despertador (até ~20s de espera)
  mais a execução da IA; herdar o default da plataforma cortaria esse caminho
  no meio. É teto, não reserva: o webhook comum continua terminando em menos
  de um segundo. 60s cabe em Hobby e em Pro.
- O drenador reivindica **um turno por vez**, com orçamento de parede de 45s.
  Um lote reivindicado de uma vez deixaria os últimos presos até o lease vencer
  se o tempo acabasse antes; assim, o que não coube nunca foi reivindicado e a
  passagem seguinte o pega na hora.

---

## 9. Divergência constitucional registrada

`FH-52.03` exige **revisão humana antes de qualquer comunicação externa gerada
por IA** (nível 5 da escala de autonomia, Anexo C §C3). O módulo de Atendimento
Inteligente opera em nível 3+ desde a migration 036: ele responde ao cliente
final sem revisão.

**A divergência é anterior a este trabalho e não é ampliada por ele** — o que
muda aqui é *quando* e *com base em quê* a IA fala, não *se* ela pode falar sem
revisão. Registrado por exigência do §0.11 do Volume 0 e de `FH-01.05`.

Mitigações presentes no desenho:

- O módulo inteiro entra desligado (`ai_service_config.enabled = false`).
- A presença conversacional entra desligada separadamente (`FH-18.08`).
- Toda entrada, contexto, plano e saída ficam auditáveis (`FH-53.10`).
- Nenhuma afirmação de ação é inventada pela camada de presença: dizer que
  algo está sendo verificado exige que algo esteja sendo verificado
  (`FH-52.04`, `FH-43.09`). Reconhecer o que a pessoa pediu não depende disso,
  porque reconhecer não afirma trabalho nenhum.
- Handoff automático por limite horário e por injeção de prompt permanece.

A regularização exige emenda registrada em
`docs/constituicao/ANEXO-E-registro-de-decisoes.md` — decisão de produto, fora
do alcance desta implementação.

---

## 10. Configuração operacional

Variáveis de ambiente:

```
AI_TURNS_CRON_SECRET=   # opcional; cai para AUTOMATION_CRON_SECRET / CRON_SECRET
```

### Segredo das chamadas internas do banco

A migration 046 guardava o segredo que autentica as chamadas de pg_net em
`public.system_config` — tabela comum, texto claro em repouso, presente em
dump e em backup. Para uma credencial que abre rota interna, isso é
armazenamento inadequado.

`public.flowhub_internal_secret()` passa a ser o único ponto de resolução, na
ordem: **Supabase Vault** → `system_config` (legado, com aviso no log) → GUC
`app.settings.internal_alerts_secret` (self-hosted sem Vault). O gatilho de
alertas de segurança da 046 foi repontado para o mesmo resolvedor: não faria
sentido proteger o segredo em um caminho e deixá-lo exposto no outro, sendo o
mesmo segredo.

Passo do operador, uma vez:

```sql
SELECT vault.create_secret(
  '<segredo>',
  'flowhub_internal_cron_secret',
  'Segredo das chamadas internas do FlowHub'
);
DELETE FROM public.system_config WHERE key = 'internal_alerts_secret';
```

Enquanto o passo não for dado, o comportamento é o de antes — nada quebra, e o
aviso aparece no log a cada leitura. Vale conferir o valor: a 046 semeou a
linha com o literal `'AUTOMATION_CRON_SECRET'`, que é um marcador de lugar e
não um segredo.

`system_config` precisa de `app_url` e `internal_alerts_secret` corretos para o
despachante pg_net funcionar — as mesmas linhas já usadas pelos alertas de
segurança (migration 046). Sem `app_url`, o despachante registra aviso e a fila
passa a depender só do cron HTTP.

Agendamento: ver `docs/automations-and-cron.md`.
