import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createChatCompletion } from './openai-client'

describe('openai-client — Timeouts e AbortSignal por Operação', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('repassa timeoutMs criando um AbortSignal no fetch', async () => {
    let capturedSignal: AbortSignal | undefined

    globalThis.fetch = vi.fn(async (_url, init) => {
      capturedSignal = init?.signal as AbortSignal
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: 'OK' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }) as unknown as typeof fetch

    const result = await createChatCompletion({
      apiKey: 'test-key',
      messages: [{ role: 'user', content: 'Olá' }],
      timeoutMs: 4_000,
    })

    expect(result.content).toBe('OK')
    expect(capturedSignal).toBeDefined()
  })

  it('repassa signal customizado fornecido explicitamente', async () => {
    const controller = new AbortController()
    let capturedSignal: AbortSignal | undefined

    globalThis.fetch = vi.fn(async (_url, init) => {
      capturedSignal = init?.signal as AbortSignal
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Resposta com custom signal' } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }) as unknown as typeof fetch

    const result = await createChatCompletion({
      apiKey: 'test-key',
      messages: [{ role: 'user', content: 'Olá' }],
      signal: controller.signal,
    })

    expect(result.content).toBe('Resposta com custom signal')
    expect(capturedSignal).toBe(controller.signal)
  })

  it('lança erro quando a requisição falha com status não-200', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          error: { message: 'Quota exceeded' },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }) as unknown as typeof fetch

    await expect(
      createChatCompletion({
        apiKey: 'test-key',
        messages: [{ role: 'user', content: 'Olá' }],
      })
    ).rejects.toThrow('Provedor de IA respondeu com erro: Quota exceeded')
  })

  it('compõe signal customizado e timeoutMs abortando pelo que ocorrer primeiro', async () => {
    const controller = new AbortController()
    let capturedSignal: AbortSignal | undefined

    globalThis.fetch = vi.fn(async (_url, init) => {
      capturedSignal = init?.signal as AbortSignal
      return new Promise((_resolve, reject) => {
        if (init?.signal?.aborted) {
          reject(new Error('Aborted'))
          return
        }
        init?.signal?.addEventListener('abort', () => reject(new Error('Aborted')))
      })
    }) as unknown as typeof fetch

    const callPromise = createChatCompletion({
      apiKey: 'test-key',
      messages: [{ role: 'user', content: 'Olá' }],
      signal: controller.signal,
      timeoutMs: 10_000,
    })

    controller.abort(new Error('Cancelamento'))

    await expect(callPromise).rejects.toThrow()
    expect(capturedSignal?.aborted).toBe(true)
  })

  it('timeoutMs = 0 gera abort imediato no composeAbortSignal do cliente de IA', async () => {
    let capturedSignal: AbortSignal | undefined

    globalThis.fetch = vi.fn(async (_url, init) => {
      capturedSignal = init?.signal as AbortSignal
      if (init?.signal?.aborted) {
        throw new Error('Aborted')
      }
      return new Response(JSON.stringify({ choices: [{ message: { content: 'OK' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as unknown as typeof fetch

    await expect(
      createChatCompletion({
        apiKey: 'test-key',
        messages: [{ role: 'user', content: 'Olá' }],
        timeoutMs: 0,
      })
    ).rejects.toThrow()

    expect(capturedSignal?.aborted).toBe(true)
  })
})
