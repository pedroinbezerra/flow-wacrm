/**
 * Planejamento de resposta.
 *
 * Entre "o turno fechou" e "a IA responde" existe uma decisão que hoje
 * não era tomada em lugar nenhum: *o que vai ser preciso fazer para
 * responder isto?*
 *
 * Sem essa etapa, a única forma de decidir se vale mandar uma mensagem
 * intermediária é olhar sinal errado — quantidade de mensagens, tamanho
 * do texto, contagem de tokens. Foi o que produziu o caso do corte de
 * árvore: oito mensagens seguidas sobre um serviço que a empresa não
 * presta, e um "deixa eu verificar isso para você" sobre nada.
 *
 * O plano responde: o que a pessoa pediu, se já dá para responder,
 * o que precisa ser consultado, o que já é sabido e pode ser dito agora.
 * A partir dele — e só a partir dele — o executor decide se existe algo
 * verdadeiro para dizer antes da resposta final.
 *
 * Este módulo é puro: monta prompt, interpreta saída e aplica as regras
 * de honestidade. Nada aqui fala com rede ou com banco.
 */

import type { ChatMessage } from './openai-client'
import type { AIKnowledgeItem, AIMediaItem } from './prompt-builder'

// ============================================================
// Turno
// ============================================================

/**
 * Uma mensagem do turno, na granularidade em que ela existe em
 * `messages`. O agrupamento em turno é camada lógica: nada aqui achata
 * anexo, tipo ou horário.
 */
export interface TurnMessage {
  id: string
  seq: number
  createdAt: string
  contentType: string
  contentText: string | null
  mediaUrl: string | null
  mediaMimeType: string | null
  /** Id da mensagem na Meta — usado para citar o cliente na resposta. */
  metaMessageId: string | null
  /** Id da opção tocada em botão/lista interativa, quando houver. */
  interactiveReplyId: string | null
  /** Id interno da mensagem citada em resposta com swipe. */
  replyToMessageId: string | null
}

const CONTENT_TYPE_LABEL: Record<string, string> = {
  text: 'texto',
  image: 'imagem',
  audio: 'áudio',
  video: 'vídeo',
  document: 'documento',
  location: 'localização',
  interactive: 'resposta a botão',
  sticker: 'figurinha',
}

function describeAttachment(message: TurnMessage): string | null {
  if (message.contentType === 'text') return null
  const label = CONTENT_TYPE_LABEL[message.contentType] ?? message.contentType
  const mime = message.mediaMimeType ? ` ${message.mediaMimeType}` : ''
  return `[${label}${mime} anexado]`
}

/**
 * Renderiza o turno para o modelo preservando ordem, horário, tipo e
 * anexos. É esta string que substitui o antigo "texto da última
 * mensagem" — o agente passa a receber tudo que a pessoa acabou de
 * dizer, de uma vez.
 */
export function buildTurnTranscript(messages: TurnMessage[]): string {
  if (messages.length === 0) return ''

  const ordered = [...messages].sort((a, b) => {
    // `seq` é a ordem de chegada no webhook. Ela vence o timestamp da
    // Meta, que pode vir fora de ordem entre mensagens do mesmo segundo.
    if (a.seq !== b.seq) return a.seq - b.seq
    return a.createdAt.localeCompare(b.createdAt)
  })

  if (ordered.length === 1) {
    const only = ordered[0]
    const attachment = describeAttachment(only)
    const text = (only.contentText ?? '').trim()
    return [attachment, text].filter(Boolean).join(' ')
  }

  const first = new Date(ordered[0].createdAt).getTime()

  return ordered
    .map((m) => {
      const offsetSec = Math.max(0, Math.round((new Date(m.createdAt).getTime() - first) / 1000))
      const parts = [describeAttachment(m), (m.contentText ?? '').trim()].filter(Boolean)
      const body = parts.join(' ') || '(sem conteúdo textual)'
      return `[+${offsetSec}s] ${body}`
    })
    .join('\n')
}

// ============================================================
// Plano
// ============================================================

/**
 * Estratégia conversacional escolhida para o turno.
 *
 * `immediate`          — dá para responder agora; nada intermediário.
 * `partial_then_work`  — parte já é sabida e pode ir na frente.
 * `presence_then_work` — nada útil a adiantar, mas há trabalho real.
 * `decline`            — a resposta é dizer que não; nada a verificar.
 */
export type ResponseStrategy =
  | 'immediate'
  | 'partial_then_work'
  | 'presence_then_work'
  | 'decline'

export interface ResponsePlan {
  /** O que a pessoa está pedindo, em uma linha. */
  intent: string
  /** Já existe informação suficiente para a resposta final. */
  canAnswerNow: boolean
  /** A resposta depende de consulta, ferramenta ou operação externa. */
  needsLookup: boolean
  /**
   * O que efetivamente será feito. Cada item precisa ser uma ação real:
   * é daqui que a mensagem de presença tira o direito de dizer que algo
   * está sendo feito.
   */
  lookups: string[]
  /** Informação já conhecida que pode ser dita antes do resto. */
  knownPartial: string | null
  strategy: ResponseStrategy
  /**
   * Reconhecimento contextual proposto pelo modelo — ainda não aprovado.
   *
   * Demonstra compreensão do que foi pedido. Pode descrever uma ação
   * apenas se `lookups` de fato prevê essa ação; sem `lookups`, ainda
   * pode existir, desde que se limite a compreender.
   */
  acknowledgementText: string | null
  estimatedEffort: 'none' | 'short' | 'long'
  /** 0..1. Abaixo do piso, tratamos o plano como não confiável. */
  confidence: number
}

/**
 * Plano de fallback: responde já, sem intermediária.
 *
 * É o comportamento seguro. Quando o planejamento falha, o erro que
 * queremos cometer é ficar calado até ter a resposta — nunca prometer
 * trabalho que ninguém sabe se existe.
 */
export const FALLBACK_PLAN: ResponsePlan = {
  intent: '',
  canAnswerNow: true,
  needsLookup: false,
  lookups: [],
  knownPartial: null,
  strategy: 'immediate',
  acknowledgementText: null,
  estimatedEffort: 'short',
  confidence: 0,
}

const PLANNER_SCHEMA = `{
  "intent": "string — o que a pessoa está pedindo, em uma frase",
  "can_answer_now": true | false,
  "needs_lookup": true | false,
  "lookups": ["string — cada consulta ou operação que REALMENTE será feita"],
  "known_partial": "string | null — o que já se sabe e pode ser dito agora",
  "strategy": "immediate | partial_then_work | presence_then_work | decline",
  "acknowledgement_text": "string | null — reconhecimento contextual do pedido",
  "estimated_effort": "none | short | long",
  "confidence": 0.0
}`

export interface PlannerPromptArgs {
  /** Persona e regras já montadas para o agente da conta. */
  agentBrief: string
  transcript: string
  knowledgeItems: AIKnowledgeItem[]
  mediaItems: AIMediaItem[]
  history: ChatMessage[]
}

/**
 * O planejador recebe o ÍNDICE da base de conhecimento, não o conteúdo
 * inteiro: ele decide se a resposta está ao alcance, não redige a
 * resposta. Mantém a chamada barata o bastante para caber antes de toda
 * execução.
 */
export function buildPlannerPrompt(args: PlannerPromptArgs): ChatMessage[] {
  const { agentBrief, transcript, knowledgeItems, mediaItems, history } = args

  const knowledgeIndex =
    knowledgeItems.length > 0
      ? knowledgeItems.map((k) => `- [${k.category}] ${k.title}`).join('\n')
      : '- (nenhum item cadastrado)'

  const mediaIndex =
    mediaItems.length > 0
      ? mediaItems.map((m) => `- ${m.title} (${m.media_type}): ${m.description}`).join('\n')
      : '- (nenhuma mídia cadastrada)'

  const historyBlock =
    history.length > 0
      ? history
          .slice(-6)
          .map((h) => `${h.role === 'user' ? 'Cliente' : 'Atendimento'}: ${h.content}`)
          .join('\n')
      : '(início da conversa)'

  const system = `Você é a etapa de PLANEJAMENTO do atendimento. Você NÃO fala com o cliente.
Sua única saída é um objeto JSON descrevendo como o turno será respondido.

${agentBrief}

=== ÍNDICE DA BASE DE CONHECIMENTO (títulos, não conteúdo) ===
${knowledgeIndex}

=== MÍDIAS DISPONÍVEIS ===
${mediaIndex}

=== REGRAS DO PLANEJAMENTO ===
1. "needs_lookup" só é true se existir consulta, ferramenta ou operação externa
   que será DE FATO executada. Redigir a resposta com o que já está na base de
   conhecimento NÃO é consulta.
2. "lookups" descreve ações reais. Se estiver vazio, "needs_lookup" é false.
3. Se o serviço pedido não é oferecido, ou se a base já responde, a estratégia é
   "decline" ou "immediate" — nunca "presence_then_work". Não existe nada a
   verificar sobre algo que já se sabe.
4. "known_partial" só é preenchido quando parte da resposta já é conhecida E
   outra parte depende de trabalho. Caso contrário, null.
5. "acknowledgement_text" demonstra que você entendeu o que a pessoa pediu,
   com as palavras do caso dela. Ele só será enviado se a resposta final
   demorar; se ela sair rápido, é descartado sem uso.
   - Com "lookups": pode dizer o que será feito — mas SOMENTE o que está em
     "lookups". Ex.: "Entendi, duas cobranças no mesmo cartão. Vou conferir o
     que aconteceu com esse pagamento."
   - Sem "lookups": pode reconhecer, confirmar ou reformular o pedido, e NÃO
     pode afirmar que algo está sendo verificado, consultado ou analisado.
     Ex.: "Ah, entendi. Então a ideia é manter os três usuários e também todo
     o histórico atual."
   - NUNCA use frase genérica de espera: "só um momento", "aguarde", "estou
     verificando", "já te retorno". Elas não dizem nada sobre a conversa.
   - Com "strategy": "decline", deixe null: a resposta é curta e sai inteira.
6. O texto respeita a personalidade e o tom do atendimento descritos acima.

Responda SOMENTE com o JSON, sem cercas de código, no formato:
${PLANNER_SCHEMA}`

  const user = `Conversa recente:
${historyBlock}

O cliente acabou de enviar (turno completo, em ordem):
${transcript}`

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

function coerceStrategy(raw: unknown): ResponseStrategy {
  const value = String(raw ?? '').trim()
  if (
    value === 'immediate' ||
    value === 'partial_then_work' ||
    value === 'presence_then_work' ||
    value === 'decline'
  ) {
    return value
  }
  return 'immediate'
}

function coerceEffort(raw: unknown): ResponsePlan['estimatedEffort'] {
  const value = String(raw ?? '').trim()
  if (value === 'none' || value === 'short' || value === 'long') return value
  return 'short'
}

function nonEmptyString(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Interpreta a saída do planejador.
 *
 * O modelo é tratado como fonte não confiável: qualquer campo malformado
 * degrada para o valor conservador, e as incoerências do próprio plano
 * são reconciliadas aqui — não adiante, quando já viraram mensagem.
 */
export function parseResponsePlan(raw: string): ResponsePlan {
  if (!raw || !raw.trim()) return { ...FALLBACK_PLAN }

  // O modelo às vezes embrulha o JSON em cerca de código ou o precede de
  // um parágrafo. Pegamos o primeiro objeto balanceado do texto.
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) return { ...FALLBACK_PLAN }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    return { ...FALLBACK_PLAN }
  }

  const lookups = Array.isArray(parsed.lookups)
    ? (parsed.lookups as unknown[])
        .map((l) => nonEmptyString(l))
        .filter((l): l is string => l !== null)
    : []

  // Reconciliação: "vou consultar" sem nada a consultar é a mentira que
  // este módulo existe para impedir. Sem itens, não há consulta.
  const needsLookup = parsed.needs_lookup === true && lookups.length > 0

  let strategy = coerceStrategy(parsed.strategy)
  const knownPartial = nonEmptyString(parsed.known_partial)

  if (!needsLookup && strategy === 'partial_then_work') {
    // Sem trabalho pela frente, "adiantar parte" não faz sentido: a
    // resposta inteira sai de uma vez.
    strategy = 'immediate'
  }
  if (!needsLookup && strategy === 'presence_then_work') {
    // Não há trabalho externo a anunciar. Isso NÃO cala o turno: a
    // execução ainda pode demorar, e um reconhecimento honesto continua
    // permitido — ele só não pode mais afirmar que algo está sendo feito.
    strategy = 'immediate'
  }
  if (strategy === 'partial_then_work' && !knownPartial) {
    strategy = 'presence_then_work'
  }

  const confidenceRaw = Number(parsed.confidence)
  const confidence = Number.isFinite(confidenceRaw)
    ? Math.min(Math.max(confidenceRaw, 0), 1)
    : 0

  return {
    intent: nonEmptyString(parsed.intent) ?? '',
    canAnswerNow: parsed.can_answer_now !== false,
    needsLookup,
    lookups,
    knownPartial: strategy === 'partial_then_work' ? knownPartial : null,
    strategy,
    acknowledgementText: nonEmptyString(parsed.acknowledgement_text),
    estimatedEffort: coerceEffort(parsed.estimated_effort),
    confidence,
  }
}

// ============================================================
// Honestidade da comunicação intermediária
// ============================================================

/**
 * Frases que só existem para ocupar o silêncio. Recusadas sempre —
 * inclusive quando há trabalho real acontecendo. Elas não comunicam
 * compreensão nem próximo passo; apenas simulam atividade, e servem
 * igualmente bem a qualquer conversa, que é justamente o defeito.
 */
const FILLER_PATTERNS: RegExp[] = [
  /^\s*(s[óo]|apenas)\s+(um|uns)\s+(momento|instante|minuto|segundo|segundinho)/i,
  /^\s*aguarde\b/i,
  /^\s*(um|s[óo] um)\s+(momento|instante|segundo)\s*[.!]?\s*$/i,
  /^\s*j[áa]\s+(te\s+)?(retorno|respondo|volto)\s*[.!]?\s*$/i,
  /^\s*estou\s+(verificando|analisando|checando|processando)\s*[.!]?\s*$/i,
  /^\s*(continuo|sigo)\s+(verificando|analisando|checando)\b/i,
  /^\s*ainda\s+estou\b/i,
  /^\s*s[óo]\s+mais\s+um\b/i,
]

/**
 * Verbos que afirmam operação em curso.
 *
 * Este é o gate da LINGUAGEM DE AÇÃO — não o gate da presença. A
 * distinção é o coração do módulo: uma execução pode demorar sem que
 * exista consulta nenhuma acontecendo, e nesse caso demonstrar
 * compreensão continua sendo verdade. O que não pode é dizer que algo
 * está sendo verificado quando nada está (`FH-43.09`, `FH-46.04`,
 * `FH-52.04`).
 */
const ACTION_CLAIM_PATTERN =
  /\b(vou|irei|vamos|deixa eu|deixe-me|estou|estamos)\s+\S*\s*(verificar|verificando|conferir|conferindo|consultar|consultando|checar|checando|analisar|analisando|buscar|buscando|procurar|procurando|levantar|levantando|validar|validando|confirmar|confirmando|apurar|apurando|pesquisar|pesquisando)/i

export type PresenceRejection =
  | 'no_real_work'
  | 'generic_filler'
  | 'unsupported_action_claim'
  | 'answer_already_known'
  | 'empty'
  | 'too_long'

export type PresenceVerdict =
  | { allowed: true; text: string }
  | { allowed: false; reason: PresenceRejection }

/** Presença é um reconhecimento curto; passou disso, é a resposta final disfarçada. */
const PRESENCE_MAX_CHARS = 320

/**
 * O texto afirma que alguma operação está em curso?
 *
 * Exportado porque é a fronteira entre "posso dizer isto sem trabalho por
 * trás" e "isto só é verdade se houver consulta".
 */
export function claimsAction(text: string): boolean {
  return ACTION_CLAIM_PATTERN.test(text)
}

/**
 * Decide se um reconhecimento contextual pode ser dito.
 *
 * A regra NÃO é "sem consulta, silêncio". Uma execução pode demorar sem
 * ferramenta nenhuma envolvida, e obrigar silêncio ali trocaria um
 * defeito por outro: a pessoa fica sem sinal de que foi entendida, que é
 * exatamente a falta que a presença existe para cobrir.
 *
 * O que `lookups` governa é a LINGUAGEM, não a existência da mensagem:
 *
 *   sem lookups → pode reconhecer, confirmar, reformular o pedido
 *                 não pode dizer que está verificando ou consultando
 *   com lookups → pode, além disso, descrever a ação prevista
 *
 * Quem decide SE a mensagem sai é o limiar de tempo real, no executor.
 * Este validador decide apenas se ela é verdadeira.
 */
export function validateAcknowledgement(
  plan: ResponsePlan,
  text: string | null,
): PresenceVerdict {
  const candidate = (text ?? '').trim()
  if (!candidate) return { allowed: false, reason: 'empty' }

  // A resposta já é conhecida e cabe em uma frase. Precedê-la de "entendi
  // que você quer X" para em seguida dizer "não fazemos X" é redundância,
  // não presença.
  if (plan.strategy === 'decline') {
    return { allowed: false, reason: 'answer_already_known' }
  }

  if (candidate.length > PRESENCE_MAX_CHARS) {
    return { allowed: false, reason: 'too_long' }
  }

  for (const pattern of FILLER_PATTERNS) {
    if (pattern.test(candidate)) {
      return { allowed: false, reason: 'generic_filler' }
    }
  }

  // Aqui, e só aqui, `lookups` manda: afirmar operação em curso exige
  // operação em curso.
  if (claimsAction(candidate) && (!plan.needsLookup || plan.lookups.length === 0)) {
    return { allowed: false, reason: 'unsupported_action_claim' }
  }

  return { allowed: true, text: candidate }
}

/**
 * Valida a parte da resposta que já é conhecida.
 *
 * A proibição aqui é mais estreita que no reconhecimento: este trecho
 * afirma fato. Promessa de ação pertence ao trecho de reconhecimento, que
 * passa pelo exame de `lookups`; deixá-la entrar por aqui seria contornar
 * o exame.
 */
export function validateKnownPartialText(text: string | null): PresenceVerdict {
  const candidate = (text ?? '').trim()
  if (!candidate) return { allowed: false, reason: 'empty' }
  if (candidate.length > PRESENCE_MAX_CHARS) return { allowed: false, reason: 'too_long' }

  for (const pattern of FILLER_PATTERNS) {
    if (pattern.test(candidate)) return { allowed: false, reason: 'generic_filler' }
  }

  if (claimsAction(candidate)) {
    return { allowed: false, reason: 'unsupported_action_claim' }
  }

  return { allowed: true, text: candidate }
}

/**
 * Monta a mensagem intermediária a partir do plano.
 *
 * A ordem importa: a parte já conhecida vem primeiro, porque ela é
 * informação; o reconhecimento do que falta vem depois, porque ele é
 * expectativa. É o que separa "resposta parcial útil" de "mensagem de
 * espera".
 */
export function composeIntermediateMessage(plan: ResponsePlan): PresenceVerdict {
  if (plan.strategy === 'partial_then_work' && plan.knownPartial) {
    const partial = validateKnownPartialText(plan.knownPartial)
    if (!partial.allowed) return partial

    const followUp = validateAcknowledgement(plan, plan.acknowledgementText)
    if (followUp.allowed) {
      return { allowed: true, text: `${partial.text}\n\n${followUp.text}` }
    }
    // A parte conhecida sozinha já é útil — vale mais que o silêncio, e
    // não promete nada.
    return partial
  }

  return validateAcknowledgement(plan, plan.acknowledgementText)
}

// ============================================================
// Progresso
// ============================================================

export interface ProgressUpdateInput {
  plan: ResponsePlan
  /** Etapas do plano efetivamente concluídas até agora. */
  completedSteps: string[]
  text: string | null
}

/**
 * Progresso só é comunicado quando houve progresso.
 *
 * Uma atualização exige etapa concluída de verdade e mais trabalho pela
 * frente — caso contrário, o que existe é a resposta final, e ela vem
 * sozinha (`FH-46.04`).
 */
export function validateProgressUpdate(input: ProgressUpdateInput): PresenceVerdict {
  const { plan, completedSteps, text } = input

  if (completedSteps.length === 0) {
    return { allowed: false, reason: 'no_real_work' }
  }
  // Última etapa concluída significa que a resposta está pronta: narrar
  // isso seria contar o processo em vez de responder.
  if (completedSteps.length >= plan.lookups.length) {
    return { allowed: false, reason: 'no_real_work' }
  }

  const candidate = (text ?? '').trim()
  if (!candidate) return { allowed: false, reason: 'empty' }
  if (candidate.length > PRESENCE_MAX_CHARS) return { allowed: false, reason: 'too_long' }

  for (const pattern of FILLER_PATTERNS) {
    if (pattern.test(candidate)) return { allowed: false, reason: 'generic_filler' }
  }

  return { allowed: true, text: candidate }
}

/** Exportado para teste e para reuso por quem precise auditar um texto. */
export const __honestyPatterns = { FILLER_PATTERNS, ACTION_CLAIM_PATTERN }
