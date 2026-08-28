/**
 * Parâmetros temporais do turno conversacional.
 *
 * Os números aqui não são detalhe de implementação: eles definem quanto
 * tempo a IA fica ouvindo antes de decidir que a pessoa terminou de
 * falar, e a partir de quando o silêncio começa a incomodar. São decisão
 * de experiência, ficam persistidos por conta em `ai_service_config` e
 * este módulo é o único lugar que sabe resolver e limitar os valores.
 *
 * Os defaults abaixo são ponto de partida deliberado, não constante
 * arbitrária — e existem para ser recalibrados com
 * `ai_execution_logs.aggregation_wait_ms` e `perceived_latency_ms`.
 */

export interface TurnTimingConfig {
  /** Turno desligado devolve o comportamento antigo: uma resposta por mensagem. */
  aggregationEnabled: boolean
  /**
   * JANELA OCIOSA. Silêncio após a última mensagem que fecha o turno
   * enquanto ele ainda é uma mensagem só.
   */
  inactivityMs: number
  /**
   * Janela ociosa depois que o turno virou rajada (duas mensagens ou
   * mais). Derivada de `inactivityMs`, não configurada em separado — ver
   * `TURN_BURST_IDLE_MULTIPLIER`.
   */
  burstInactivityMs: number
  /** JANELA MÁXIMA DO TURNO. Teto absoluto, para quem escreve sem parar. */
  maxWaitMs: number
  /** Presença conversacional habilitada para a conta. */
  presenceEnabled: boolean
  /** Tempo real de execução a partir do qual o silêncio vira perceptível. */
  presenceThresholdMs: number
  /** Atualizações de progresso habilitadas para a conta. */
  progressUpdatesEnabled: boolean
}

/**
 * Quanto a janela ociosa cresce depois que o turno deixou de ser uma
 * mensagem só.
 *
 * Existe porque as duas situações não têm nada a ver uma com a outra.
 * Quem manda "vocês abrem sábado?" e para de escrever não deveria esperar
 * a janela de uma rajada antes de a IA sequer começar — 2,5s de silêncio
 * ali já são conclusivos. Quem está na terceira linha de um raciocínio
 * merece mais folga, porque a pausa entre linhas de uma mesma fala é
 * naturalmente maior que a pausa depois da fala terminada.
 *
 * É regra derivada e não um terceiro botão de configuração: a conta
 * decide o ritmo com dois números — a janela ociosa e o teto — e este
 * fator é o desdobramento do primeiro.
 */
export const TURN_BURST_IDLE_MULTIPLIER = 2.4

/**
 * Ponto de partida.
 *
 * `inactivity` 2,5s: silêncio conclusivo depois de uma mensagem única.
 * Vira 6s (× 2,4) assim que a segunda mensagem chega.
 *
 * `maxWait` 45s: quem escreve doze linhas seguidas recebe resposta do
 * que já disse; o resto vira o turno seguinte.
 *
 * `presenceThreshold` 6s: abaixo disso a resposta final costuma chegar
 * antes, e qualquer mensagem intermediária seria ruído.
 */
export const TURN_TIMING_DEFAULTS: TurnTimingConfig = {
  aggregationEnabled: true,
  inactivityMs: 2_500,
  burstInactivityMs: 6_000,
  maxWaitMs: 45_000,
  // Efeito externo em nível de autonomia 3+ entra desligado (FH-18.08).
  presenceEnabled: false,
  presenceThresholdMs: 6_000,
  progressUpdatesEnabled: false,
}

/**
 * Limites duros. Espelham o CHECK da migration 069 — a validação existe
 * nas duas camadas de propósito: o banco impede o dado ruim de entrar, e
 * aqui impedimos um valor legado ou corrompido de virar comportamento.
 */
export const TURN_TIMING_BOUNDS = {
  inactivityMs: { min: 500, max: 120_000 },
  maxWaitMs: { min: 5_000, max: 600_000 },
  presenceThresholdMs: { min: 1_000, max: 120_000 },
} as const

/** Lease do executor sobre um turno reivindicado. */
export const TURN_CLAIM_LEASE_MS = 120_000

/** Tentativas antes de o turno sair da fila como falha. */
export const TURN_MAX_ATTEMPTS = 3

/** Turnos drenados por invocação do endpoint. */
export const TURN_DRAIN_BATCH_SIZE = 10

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(Math.round(value), min), max)
}

/** Linha de `ai_service_config`, na forma frouxa em que o Supabase devolve. */
export interface TurnTimingRow {
  turn_aggregation_enabled?: boolean | null
  turn_inactivity_ms?: number | string | null
  turn_max_wait_ms?: number | string | null
  presence_enabled?: boolean | null
  presence_threshold_ms?: number | string | null
  progress_updates_enabled?: boolean | null
}

function num(raw: number | string | null | undefined, fallback: number): number {
  if (raw === null || raw === undefined || raw === '') return fallback
  const parsed = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Resolve os parâmetros efetivos de uma conta.
 *
 * Contas criadas antes da migration 069 chegam aqui com as colunas
 * ausentes; o resultado é o default, não um NaN silencioso virando
 * `setTimeout(NaN)`.
 */
export function resolveTurnTiming(row: TurnTimingRow | null | undefined): TurnTimingConfig {
  const source = row ?? {}

  const inactivityMs = clamp(
    num(source.turn_inactivity_ms, TURN_TIMING_DEFAULTS.inactivityMs),
    TURN_TIMING_BOUNDS.inactivityMs.min,
    TURN_TIMING_BOUNDS.inactivityMs.max,
  )

  const maxWaitMs = Math.max(
    clamp(
      num(source.turn_max_wait_ms, TURN_TIMING_DEFAULTS.maxWaitMs),
      TURN_TIMING_BOUNDS.maxWaitMs.min,
      TURN_TIMING_BOUNDS.maxWaitMs.max,
    ),
    // Um teto menor que a janela de inatividade fecharia todo turno na
    // primeira mensagem — sem agregação nenhuma, e sem ninguém perceber.
    inactivityMs,
  )

  return {
    aggregationEnabled: source.turn_aggregation_enabled ?? TURN_TIMING_DEFAULTS.aggregationEnabled,
    inactivityMs,
    // A janela de rajada nunca ultrapassa o teto do turno: se ultrapassasse,
    // o teto passaria a ser o único critério de fechamento e a janela
    // ociosa deixaria de existir na prática.
    burstInactivityMs: Math.min(
      Math.round(inactivityMs * TURN_BURST_IDLE_MULTIPLIER),
      maxWaitMs,
    ),
    maxWaitMs,
    presenceEnabled: source.presence_enabled ?? TURN_TIMING_DEFAULTS.presenceEnabled,
    presenceThresholdMs: clamp(
      num(source.presence_threshold_ms, TURN_TIMING_DEFAULTS.presenceThresholdMs),
      TURN_TIMING_BOUNDS.presenceThresholdMs.min,
      TURN_TIMING_BOUNDS.presenceThresholdMs.max,
    ),
    progressUpdatesEnabled:
      source.progress_updates_enabled ?? TURN_TIMING_DEFAULTS.progressUpdatesEnabled,
  }
}
