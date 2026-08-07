# Capítulo 40 — Notificação, Som e Canais Periféricos

| Campo | Valor |
| --- | --- |
| Livro | IV — Matéria (Design System) |
| Versão | 1.0.0 |
| Estado | Estável |
| Depende de | Capítulos 7 (P6), 9, 11, 15, 17, 43, 50 |
| É pré-requisito de | Capítulos 53, 54, 64 |
| Artigos | `FH-40.01` a `FH-40.10` |

---

## 0. Núcleo Normativo

**`FH-40.01`** — A escala de urgência é **fechada**: silencioso, periférico,
ambiente, interruptivo e bloqueante (§5). Nenhum nível fora dela.
> **Verificação:** o nível usado pertence à escala fechada? → SIM = cumpre | NÃO = viola.

**`FH-40.02`** — **Interromper é dívida.** Toda interrupção **DEVE** ser
justificável por consequência concreta para o usuário caso ela não ocorra
(`FH-07.07`).
> **Verificação:** existe consequência concreta se esta interrupção não acontecer? → SIM = cumpre | NÃO = viola.

**`FH-40.03`** — Notificações da mesma natureza **DEVEM** ser agrupadas. Uma
notificação por evento é proibida quando os eventos são equivalentes.
> **Verificação:** eventos equivalentes são agrupados em uma notificação? → SIM = cumpre | NÃO = viola.

**`FH-40.04`** — Som é **opcional e nunca é o único portador** de informação
(`FH-38.09`). O produto é integralmente utilizável em silêncio.
> **Verificação:** alguma informação depende de som? → NÃO = cumpre | SIM = viola.

**`FH-40.05`** — O usuário **DEVE** controlar quais canais recebem quais
notificações, com granularidade por tipo de evento.
> **Verificação:** existe controle por canal e por tipo de evento? → SIM = cumpre | NÃO = viola.

**`FH-40.06`** — **Urgência artificial é proibida.** Nenhuma notificação sugere
pressa que não exista de fato (`FH-11.01`, `FH-17.02`).
> **Verificação:** a urgência comunicada corresponde à urgência real? → SIM = cumpre | NÃO = viola.

**`FH-40.07`** — Notificações externas seguem a **mesma voz e sobriedade** da
interface (`FH-09.06`, `FH-01.02`).
> **Verificação:** a voz da notificação externa é a mesma da interface? → SIM = cumpre | NÃO = viola.

**`FH-40.08`** — Notificação fora do produto **NUNCA** expõe conteúdo sensível de
terceiros. Ela informa **que** algo ocorreu, sem revelar o conteúdo (`FH-11.05`).
> **Verificação:** a notificação externa expõe conteúdo de terceiros? → NÃO = cumpre | SIM = viola.

**`FH-40.09`** — Toda notificação **DEVE** oferecer ação direta ou caminho para o
contexto de origem. Notificação sem destino é ruído.
> **Verificação:** a notificação leva ao contexto ou oferece ação? → SIM = cumpre | NÃO = viola.

**`FH-40.10`** — Toda notificação **DEVE** ter origem identificável e caminho de
desativação alcançável a partir dela própria.
> **Verificação:** é possível saber a origem e desativá-la a partir da própria notificação? → SIM = cumpre | NÃO = viola.

---

## 1. Propósito

Este capítulo regula **como o sistema chama atenção fora do foco atual**. Ele é a
aplicação mais direta de P6 (silêncio como cortesia) e o principal instrumento de
proteção da atenção do usuário.

---

## 2. Perguntas que este capítulo responde

- O que merece interromper?
- O que espera?
- Como acumular sem virar ruído?
- Som é permitido?
- Como notificar sem gerar ansiedade?

---

## 3. Definições

**Canal** — meio pelo qual a notificação chega: interface, sistema operacional,
e-mail, mensagem.

**Urgência** — quanto a informação exige atenção imediata.

**Notificação periférica** — visível sem interromper, na visão lateral.

**Agrupamento** — reunião de eventos equivalentes em uma única notificação.

**Urgência artificial** — pressa comunicada sem correspondência com a realidade.

---

## 4. Fundamento

**Por que interromper é dívida.** Cada interrupção consome duas coisas: o instante da
leitura e a reconstrução do raciocínio interrompido (`FH-15.09`). A segunda é muito
maior que a primeira. Uma interrupção que não previne consequência concreta é
sempre um prejuízo líquido — e, pior, treina o usuário a ignorar interrupções, o
que degrada as importantes.

**Por que a escala é fechada.** Sem níveis definidos, toda notificação tende ao
mais alto — quem constrói acredita que o seu evento é importante. Uma escala com
critérios objetivos transforma "isto é importante?" em "qual a consequência de não
avisar agora?".

**Por que agrupar é obrigatório.** Notificação por evento não escala: em operação
real, dezenas de eventos equivalentes ocorrem por hora. O usuário passa a
descartar em bloco, sem ler — e descarta junto o que importava. O agrupamento
preserva a informação e reduz o custo de atenção a uma unidade.

**Por que som é sempre opcional.** Ambientes de trabalho compartilhados, contextos
de atendimento e preferências pessoais tornam o som inviável para muitos. Além
disso, som é o canal mais fácil de perder e o mais difícil de recuperar — quem não
ouviu não tem como consultar depois.

**Por que urgência artificial é proibida.** Ela funciona no curto prazo e destrói a
credibilidade do canal: depois de algumas urgências falsas, todas as notificações
passam a ser lidas como marketing. É o mesmo mecanismo de `FH-11.01`, aplicado à
atenção.

**Por que notificação externa não expõe conteúdo.** Notificações aparecem em telas
bloqueadas, em ambientes compartilhados e em dispositivos que outras pessoas veem.
O conteúdo é de terceiros — o cliente do usuário —, e sua exposição é violação de
`FH-11.05`. Informar que algo chegou é suficiente para a ação.

**Por que toda notificação tem origem e desligamento.** Sem origem identificável, o
usuário não sabe o que desativar. Sem caminho de desativação na própria
notificação, ele precisa procurar em configurações — e, como não encontra,
desativa tudo.

---

## 5. Escala de urgência

| Nível | Forma | Critério objetivo | Exemplo de situação |
| --- | --- | --- | --- |
| **1 — Silencioso** | Apenas registro consultável | Nenhuma ação esperada | Execução automática bem-sucedida |
| **2 — Periférico** | Indicador discreto, sem movimento | O usuário pode querer saber, sem pressa | Contador de itens novos |
| **3 — Ambiente** | Elemento visível na área de trabalho | Relevante para a próxima decisão | Conversa aguardando resposta |
| **4 — Interruptivo** | Notificação que exige percepção ativa | Consequência concreta se não for vista agora | Falha em envio em andamento |
| **5 — Bloqueante** | Impede continuar | Prosseguir causaria dano ou perda | Sessão expirada com trabalho pendente |

**Regra de escolha.** Use o **menor nível** cuja omissão produza consequência. Subir
de nível exige declarar qual consequência o nível inferior não evitaria.

**Nunca no nível 4 ou 5:** informação comercial, novidade de produto, sugestão,
lembrete sem prazo real.

---

## 6. Regras normativas

### `FH-40.03` — Agrupamento

**Certo.** "12 novas mensagens em 4 conversas" — uma notificação, com caminho.

**Errado.** Doze notificações separadas. O usuário descarta em bloco e perde a
décima terceira, que era diferente.

### `FH-40.05` — Controle por canal

O usuário **DEVE** poder decidir, por tipo de evento, quais canais o alcançam.
Controle apenas global — "notificações ligadas/desligadas" — não satisfaz este
artigo, porque força a escolha entre ruído e silêncio total.

### `FH-40.08` — Conteúdo em notificação externa

**Certo.** "Nova mensagem de um contato em Conversas."

**Errado.** Notificação em tela bloqueada exibindo o texto enviado por um cliente
do usuário.

### `FH-40.09` — Destino obrigatório

**Errado.** Notificação informando que algo aconteceu sem levar ao contexto — o
usuário precisa procurar, e o custo da interrupção dobra.

---

## 7. Anti-padrões

**Notificação por evento.** Uma por ocorrência, sem agrupamento.

**Escalada de urgência.** Tudo no nível interruptivo.

**Urgência fabricada.** Pressa que não existe fora da mensagem.

**Som obrigatório.** Informação que só chega por áudio.

**Controle binário.** Tudo ou nada, sem granularidade.

**Vazamento em tela bloqueada.** Conteúdo de terceiros exposto.

**Notificação sem destino.** Avisa e não leva a lugar nenhum.

**Origem desconhecida.** Impossível saber o que desativar.

---

## 8. Impactos

**Cognitivo.** Agrupamento e escala reduzem o número de interrupções por jornada —
a variável que mais afeta a capacidade de concluir tarefas complexas.

**Emocional.** Notificações excessivas produzem ansiedade permanente de baixo grau;
notificações calibradas produzem confiança de que nada importante passará
despercebido.

**Produtividade.** `FH-40.02` protege diretamente o tempo de concentração, que é o
recurso mais escasso do Operador.

**Percepção de qualidade.** Produtos que notificam demais são percebidos como
invasivos; produtos que notificam bem são percebidos como atentos.

**Curva de aprendizagem.** Escala consistente ensina o usuário a calibrar sua
própria atenção: ele aprende quais sinais exigem ação imediata.

---

## 9. Riscos e trade-offs

**Risco: informação perdida.** Preferir níveis baixos pode fazer algo importante
passar. Mitigação: o critério é a consequência concreta — se existe, o nível sobe.

**Risco: complexidade de controle.** Granularidade por evento e canal é mais cara.
Mitigação: sem ela, o usuário desliga tudo, o que é o pior resultado possível.

**Risco: notificações vagas.** Não expor conteúdo pode tornar o aviso pouco útil.
Mitigação: `FH-40.09` exige destino direto — o conteúdo está a um toque, no lugar
seguro.

**Trade-off central.** Trocamos alcance de comunicação por proteção da atenção.
Menos avisos chegam — e os que chegam são lidos.

---

## 10. Critérios de verificação

1. Todo nível usado pertence à escala fechada.
2. Toda interrupção tem consequência concreta declarada.
3. Eventos equivalentes são agrupados.
4. Nenhuma informação depende de som.
5. Existe controle por canal e por tipo de evento.
6. Nenhuma urgência comunicada é artificial.
7. Notificações externas usam a voz da interface.
8. Nenhuma notificação externa expõe conteúdo de terceiros.
9. Toda notificação leva ao contexto ou oferece ação.
10. Toda notificação tem origem identificável e caminho de desativação.

---

## 11. Checklist do capítulo

- [ ] Escolhi o menor nível cuja omissão teria consequência.
- [ ] Agrupei eventos equivalentes.
- [ ] O produto funciona inteiro sem som.
- [ ] O usuário pode ajustar por tipo e por canal.
- [ ] A urgência comunicada é real.
- [ ] A notificação externa não expõe conteúdo de cliente.
- [ ] A notificação leva a algum lugar.
- [ ] Dá para saber a origem e desligá-la dali mesmo.

---

## 12. Referências cruzadas

**Depende de.** Capítulos 7 (P6), 9 (voz), 11 (`FH-11.05`), 15 (`FH-15.09`), 17
(`FH-17.02`), 43 (feedback), 50 (tempo real).

**É pré-requisito de.** Capítulos 53 (IA), 54 (automações), 64 (métricas).
Completa a última matriz pendente do Anexo C.

---

## 13. Aterrissagem

| Conceito | Onde vive hoje |
| --- | --- |
| Notificações na interface | `src/components/themed-toaster.tsx` |
| Menções e alertas de equipe | `ConversationMention` em `src/types/index.ts` |
| Notificações de sistema | Rotas de API e integrações em `src/app/api/` |
| Preferências do usuário | `src/app/(dashboard)/settings/` |
| Eventos automáticos | `src/lib/automations/`, `docs/automations-and-cron.md` |
