import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadEffectiveTurnContext } from './turn-store'

/**
 * Banco falso com o mínimo que `loadEffectiveTurnContext` usa: a RPC do
 * contexto efetivo e a leitura das linhas de `messages`.
 *
 * O predicado SQL que decide QUAIS turnos entram no contexto vive na
 * migration 069 e não é executado aqui — não há Postgres na suíte. O que
 * estes testes cobrem é o outro lado do contrato: dada a saída da RPC, o
 * TypeScript preserva ordem, granularidade e a contagem de herdadas.
 */
function fakeDb(
  rpcRows: { message_id: string; seq: number; carried_over: boolean }[],
  messageRows: Record<string, unknown>[],
): SupabaseClient {
  return {
    rpc: vi.fn(async () => ({ data: rpcRows, error: null })),
    from: () => ({
      select: () => ({
        // O `.in(...)` é o último elo da cadeia nesta consulta.
        in: () => Promise.resolve({ data: messageRows, error: null }),
      }),
    }),
  } as unknown as SupabaseClient
}

function row(id: string, text: string, createdAt: string) {
  return {
    id,
    created_at: createdAt,
    content_type: 'text',
    content_text: text,
    media_url: null,
    media_mime_type: null,
    message_id: `wamid.${id}`,
    interactive_reply_id: null,
    reply_to_message_id: null,
  }
}

describe('loadEffectiveTurnContext', () => {
  it('preserva a ordem devolvida pela RPC, e não a do banco', async () => {
    // `seq` é único apenas dentro de um turno. Atravessando turnos, a
    // única ordenação válida é a que a RPC devolveu — o `.in(...)` do
    // PostgREST não garante ordem nenhuma.
    const db = fakeDb(
      [
        { message_id: 'mA', seq: 1, carried_over: true },
        { message_id: 'mB', seq: 2, carried_over: false },
      ],
      [
        row('mB', 'Na verdade preciso de 30 unidades.', '2026-08-27T12:00:30Z'),
        row('mA', 'Quanto custa?', '2026-08-27T12:00:00Z'),
      ],
    )

    const { messages } = await loadEffectiveTurnContext(db, 'turn-B')

    expect(messages.map((m) => m.id)).toEqual(['mA', 'mB'])
    expect(messages[0].contentText).toBe('Quanto custa?')
  })

  it('conta as mensagens herdadas de turnos sem resposta', async () => {
    const db = fakeDb(
      [
        { message_id: 'mA', seq: 1, carried_over: true },
        { message_id: 'mB', seq: 2, carried_over: false },
      ],
      [
        row('mA', 'Quanto custa?', '2026-08-27T12:00:00Z'),
        row('mB', 'Na verdade preciso de 30 unidades.', '2026-08-27T12:00:30Z'),
      ],
    )

    const { carriedOverCount } = await loadEffectiveTurnContext(db, 'turn-B')

    expect(carriedOverCount).toBe(1)
  })

  it('preserva a granularidade original de cada mensagem', async () => {
    // O turno é camada lógica sobre `messages`: tipo, anexo e id da Meta
    // continuam existindo em separado.
    const media = {
      ...row('mA', 'Olha a foto', '2026-08-27T12:00:00Z'),
      content_type: 'image',
      media_mime_type: 'image/jpeg',
      media_url: 'https://example.test/a.jpg',
    }
    const db = fakeDb([{ message_id: 'mA', seq: 1, carried_over: false }], [media])

    const { messages } = await loadEffectiveTurnContext(db, 'turn-A')

    expect(messages[0].contentType).toBe('image')
    expect(messages[0].mediaMimeType).toBe('image/jpeg')
    expect(messages[0].metaMessageId).toBe('wamid.mA')
  })

  it('devolve contexto vazio quando a RPC não encontra nada', async () => {
    const db = fakeDb([], [])
    const context = await loadEffectiveTurnContext(db, 'turn-inexistente')

    expect(context.messages).toEqual([])
    expect(context.carriedOverCount).toBe(0)
  })
})
