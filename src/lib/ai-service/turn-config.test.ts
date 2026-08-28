import { describe, it, expect } from 'vitest'
import {
  resolveTurnTiming,
  TURN_BURST_IDLE_MULTIPLIER,
  TURN_TIMING_BOUNDS,
  TURN_TIMING_DEFAULTS,
} from './turn-config'

describe('resolveTurnTiming', () => {
  it('usa os defaults quando a conta nunca configurou nada', () => {
    expect(resolveTurnTiming(null)).toEqual(TURN_TIMING_DEFAULTS)
    expect(resolveTurnTiming({})).toEqual(TURN_TIMING_DEFAULTS)
  })

  it('entrega presença desligada por padrão', () => {
    // Efeito externo em nível de autonomia 3+ entra desligado: a conta
    // liga sabendo o que liga.
    expect(resolveTurnTiming(null).presenceEnabled).toBe(false)
    expect(resolveTurnTiming(null).progressUpdatesEnabled).toBe(false)
  })

  it('respeita valores válidos da conta', () => {
    const timing = resolveTurnTiming({
      turn_aggregation_enabled: true,
      turn_inactivity_ms: 12_000,
      turn_max_wait_ms: 90_000,
      presence_enabled: true,
      presence_threshold_ms: 4_000,
      progress_updates_enabled: true,
    })

    expect(timing.inactivityMs).toBe(12_000)
    expect(timing.maxWaitMs).toBe(90_000)
    expect(timing.presenceThresholdMs).toBe(4_000)
    expect(timing.presenceEnabled).toBe(true)
  })

  it('não faz uma pergunta única esperar a janela de uma rajada', () => {
    // O default da janela ociosa é curto de propósito: quem manda uma
    // linha e para não pode ficar segundos em silêncio antes de a IA
    // sequer começar.
    expect(TURN_TIMING_DEFAULTS.inactivityMs).toBeLessThanOrEqual(3_000)
  })

  it('estende a janela ociosa depois que o turno vira rajada', () => {
    const timing = resolveTurnTiming({ turn_inactivity_ms: 3_000, turn_max_wait_ms: 60_000 })

    expect(timing.burstInactivityMs).toBe(
      Math.round(3_000 * TURN_BURST_IDLE_MULTIPLIER)
    )
    expect(timing.burstInactivityMs).toBeGreaterThan(timing.inactivityMs)
  })

  it('não deixa a janela de rajada ultrapassar o teto do turno', () => {
    // Se ultrapassasse, o teto viraria o único critério de fechamento e a
    // janela ociosa deixaria de existir na prática.
    const timing = resolveTurnTiming({ turn_inactivity_ms: 30_000, turn_max_wait_ms: 40_000 })

    expect(timing.burstInactivityMs).toBeLessThanOrEqual(timing.maxWaitMs)
  })

  it('limita valores fora de faixa em vez de propagar comportamento estranho', () => {
    const tooSmall = resolveTurnTiming({ turn_inactivity_ms: 10 })
    expect(tooSmall.inactivityMs).toBe(TURN_TIMING_BOUNDS.inactivityMs.min)

    const tooBig = resolveTurnTiming({ turn_inactivity_ms: 999_999 })
    expect(tooBig.inactivityMs).toBe(TURN_TIMING_BOUNDS.inactivityMs.max)
  })

  it('nunca deixa o teto do turno abaixo da janela de inatividade', () => {
    // Um teto menor fecharia todo turno na primeira mensagem: a
    // agregação existiria na configuração e não no comportamento.
    const timing = resolveTurnTiming({
      turn_inactivity_ms: 60_000,
      turn_max_wait_ms: 5_000,
    })

    expect(timing.maxWaitMs).toBeGreaterThanOrEqual(timing.inactivityMs)
  })

  it('sobrevive a valor não numérico sem virar NaN', () => {
    // Um NaN aqui viraria setTimeout(NaN) — que dispara imediatamente e
    // faria o turno fechar sem agregar nada, sem erro visível.
    const timing = resolveTurnTiming({
      turn_inactivity_ms: 'não é número' as unknown as number,
      presence_threshold_ms: null,
    })

    expect(Number.isFinite(timing.inactivityMs)).toBe(true)
    expect(timing.presenceThresholdMs).toBe(TURN_TIMING_DEFAULTS.presenceThresholdMs)
  })

  it('aceita numérico em string, como o Postgres às vezes devolve', () => {
    const timing = resolveTurnTiming({ turn_inactivity_ms: '9000' })
    expect(timing.inactivityMs).toBe(9_000)
  })
})
