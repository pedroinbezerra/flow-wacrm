/**
 * OpenAI / BYOK Client Helper for Smart AI Service.
 *
 * Supports standard OpenAI endpoints as well as compatible providers
 * (Groq, OpenRouter, DeepSeek, local LLM proxies, etc.) by specifying
 * a custom `baseUrl`.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenAICompletionArgs {
  apiKey: string
  baseUrl?: string
  model?: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
  signal?: AbortSignal
}

export interface OpenAICompletionResult {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export function composeAbortSignal(signal?: AbortSignal, timeoutMs?: number): AbortSignal | undefined {
  const hasTimeout = typeof timeoutMs === 'number'

  // Se timeout foi explicitamente informado e é <= 0 (ex: orçamento esgotado), aborta imediatamente
  if (hasTimeout && timeoutMs <= 0) {
    return AbortSignal.abort(
      new Error(`Timeout de ${timeoutMs}ms excedido (orçamento de execução esgotado)`),
    )
  }

  // Se não há timeout nem signal externo
  if (!hasTimeout && !signal) {
    return undefined
  }

  // Se há apenas timeout positivo (sem signal externo)
  if (hasTimeout && !signal) {
    return AbortSignal.timeout(timeoutMs)
  }

  // Se há apenas signal externo (sem timeout)
  if (!hasTimeout && signal) {
    return signal
  }

  // Se há ambos: se o signal externo já estiver abortado, prevalece imediatamente
  if (signal!.aborted) {
    return signal
  }

  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any([signal!, AbortSignal.timeout(timeoutMs!)])
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(new Error(`Timeout de ${timeoutMs}ms excedido`)),
    timeoutMs,
  )
  signal!.addEventListener(
    'abort',
    () => {
      clearTimeout(timeoutId)
      controller.abort(signal!.reason)
    },
    { once: true },
  )
  return controller.signal
}

/**
 * Executes a Chat Completion request using fetch.
 */
export async function createChatCompletion(
  args: OpenAICompletionArgs
): Promise<OpenAICompletionResult> {
  const {
    apiKey,
    baseUrl = 'https://api.openai.com/v1',
    model = 'gpt-4o-mini',
    messages,
    temperature = 0.3,
    maxTokens = 500,
    timeoutMs,
    signal,
  } = args

  if (!apiKey) {
    throw new Error('Chave de API (BYOK) não configurada.')
  }

  // Normalize base URL
  const sanitizedBaseUrl = baseUrl.replace(/\/+$/, '')
  const endpoint = `${sanitizedBaseUrl}/chat/completions`

  const effectiveSignal = composeAbortSignal(signal, timeoutMs)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
    signal: effectiveSignal,
  })

  if (!response.ok) {
    let errorDetails = `Erro HTTP ${response.status}`
    try {
      const errJson = await response.json()
      if (errJson?.error?.message) {
        errorDetails = errJson.error.message
      }
    } catch {
      // response was not JSON
    }
    throw new Error(`Provedor de IA respondeu com erro: ${errorDetails}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content || ''

  return {
    content,
    usage: data?.usage,
  }
}

/**
 * Tests BYOK connection by sending a lightweight ping request.
 */
export async function testOpenAIConnection(
  apiKey: string,
  baseUrl: string = 'https://api.openai.com/v1',
  model: string = 'gpt-4o-mini'
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await createChatCompletion({
      apiKey,
      baseUrl,
      model,
      messages: [{ role: 'user', content: 'Responder "OK" para teste de conexão.' }],
      maxTokens: 10,
    })

    if (result.content) {
      return { success: true, message: 'Conexão estabelecida com sucesso!' }
    }
    return { success: false, message: 'Nenhuma resposta retornada pelo provedor.' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Falha na conexão com o provedor de IA.',
    }
  }
}
