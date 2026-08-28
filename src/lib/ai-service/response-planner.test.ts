import { describe, it, expect } from 'vitest'
import {
  buildTurnTranscript,
  composeIntermediateMessage,
  parseResponsePlan,
  validateAcknowledgement,
  validateKnownPartialText,
  validateProgressUpdate,
  FALLBACK_PLAN,
  type ResponsePlan,
  type TurnMessage,
} from './response-planner'

function msg(seq: number, text: string, over: Partial<TurnMessage> = {}): TurnMessage {
  return {
    id: `msg-${seq}`,
    seq,
    createdAt: new Date(Date.UTC(2026, 7, 27, 12, 0, seq * 5)).toISOString(),
    contentType: 'text',
    contentText: text,
    mediaUrl: null,
    mediaMimeType: null,
    metaMessageId: `wamid.${seq}`,
    interactiveReplyId: null,
    replyToMessageId: null,
    ...over,
  }
}

function plan(over: Partial<ResponsePlan> = {}): ResponsePlan {
  return { ...FALLBACK_PLAN, ...over }
}

describe('buildTurnTranscript', () => {
  it('entrega uma mensagem isolada como texto puro', () => {
    expect(buildTurnTranscript([msg(1, 'Bom dia')])).toBe('Bom dia')
  })

  it('preserva ordem e intervalo das mensagens do turno', () => {
    // O caso real: seis linhas seguidas que são um raciocínio só.
    const transcript = buildTurnTranscript([
      msg(1, 'Qual o preço? E no Capuan em Caucaia'),
      msg(2, 'Mas não é pra logo. Tô em negociação do terreno'),
      msg(3, 'Você corta árvore?'),
    ])

    expect(transcript).toContain('[+0s] Qual o preço? E no Capuan em Caucaia')
    expect(transcript).toContain('[+5s] Mas não é pra logo')
    expect(transcript).toContain('[+10s] Você corta árvore?')
    expect(transcript.split('\n')).toHaveLength(3)
  })

  it('ordena por chegada, não pelo horário que a Meta carimbou', () => {
    // Timestamps da Meta podem vir fora de ordem dentro do mesmo
    // segundo; `seq` é a ordem em que o webhook recebeu.
    const later = msg(1, 'primeira', {
      createdAt: new Date(Date.UTC(2026, 7, 27, 12, 0, 30)).toISOString(),
    })
    const earlier = msg(2, 'segunda', {
      createdAt: new Date(Date.UTC(2026, 7, 27, 12, 0, 29)).toISOString(),
    })

    const transcript = buildTurnTranscript([earlier, later])
    expect(transcript.indexOf('primeira')).toBeLessThan(transcript.indexOf('segunda'))
  })

  it('descreve anexos sem descartar o tipo da mensagem', () => {
    const transcript = buildTurnTranscript([
      msg(1, 'Olha a foto do terreno', {
        contentType: 'image',
        mediaMimeType: 'image/jpeg',
      }),
      msg(2, 'É esse aí'),
    ])

    expect(transcript).toContain('[imagem image/jpeg anexado]')
    expect(transcript).toContain('Olha a foto do terreno')
  })

  it('não perde uma mensagem só de mídia, sem legenda', () => {
    const transcript = buildTurnTranscript([
      msg(1, 'Segue o áudio'),
      msg(2, null as unknown as string, { contentType: 'audio', contentText: null }),
    ])

    expect(transcript).toContain('[áudio anexado]')
  })
})

describe('parseResponsePlan', () => {
  it('interpreta um plano bem formado', () => {
    const parsed = parseResponsePlan(
      JSON.stringify({
        intent: 'Saber se houve estorno de cobrança duplicada',
        can_answer_now: false,
        needs_lookup: true,
        lookups: ['consultar o pagamento no sistema financeiro'],
        known_partial: null,
        strategy: 'presence_then_work',
        acknowledgement_text: 'Entendi, duas cobranças no mesmo cartão. Vou conferir esse pagamento.',
        estimated_effort: 'long',
        confidence: 0.9,
      })
    )

    expect(parsed.needsLookup).toBe(true)
    expect(parsed.strategy).toBe('presence_then_work')
    expect(parsed.lookups).toHaveLength(1)
  })

  it('extrai o JSON mesmo quando vem embrulhado em cerca de código', () => {
    const parsed = parseResponsePlan(
      '```json\n{"intent":"x","can_answer_now":true,"needs_lookup":false,"lookups":[],"strategy":"immediate"}\n```'
    )
    expect(parsed.intent).toBe('x')
    expect(parsed.strategy).toBe('immediate')
  })

  it('degrada para o plano seguro quando a saída não é JSON', () => {
    expect(parseResponsePlan('desculpe, não entendi')).toEqual(FALLBACK_PLAN)
    expect(parseResponsePlan('')).toEqual(FALLBACK_PLAN)
  })

  it('recusa "vou consultar" sem nada a consultar', () => {
    // O modelo diz que precisa de consulta mas não nomeia nenhuma. Sem
    // item, não há consulta — e o texto que a afirmava perde o direito de
    // ser dito (a recusa em si é do validador, testada adiante).
    const parsed = parseResponsePlan(
      JSON.stringify({
        needs_lookup: true,
        lookups: [],
        strategy: 'presence_then_work',
        acknowledgement_text: 'Deixa eu verificar isso para você.',
        estimated_effort: 'long',
      })
    )

    expect(parsed.needsLookup).toBe(false)
    expect(parsed.strategy).toBe('immediate')
  })

  it('preserva o esforço estimado mesmo sem consulta prevista', () => {
    // Redigir uma resposta longa a partir de uma base grande demora sem
    // que exista consulta nenhuma. Zerar o esforço aqui esconderia a
    // única situação em que a presença sem lookup faz sentido.
    const parsed = parseResponsePlan(
      JSON.stringify({
        needs_lookup: false,
        lookups: [],
        strategy: 'immediate',
        estimated_effort: 'long',
      })
    )

    expect(parsed.needsLookup).toBe(false)
    expect(parsed.estimatedEffort).toBe('long')
  })

  it('vira presença quando pedem resposta parcial sem parte conhecida', () => {
    const parsed = parseResponsePlan(
      JSON.stringify({
        needs_lookup: true,
        lookups: ['orçar a integração'],
        known_partial: null,
        strategy: 'partial_then_work',
      })
    )

    expect(parsed.strategy).toBe('presence_then_work')
    expect(parsed.knownPartial).toBeNull()
  })

  it('limita a confiança à faixa 0..1', () => {
    expect(parseResponsePlan(JSON.stringify({ confidence: 42 })).confidence).toBe(1)
    expect(parseResponsePlan(JSON.stringify({ confidence: -3 })).confidence).toBe(0)
  })
})

describe('presença conversacional — o que pode ser dito, e quando', () => {
  // A regra não é "sem consulta, silêncio". `lookups` governa a LINGUAGEM
  // DE AÇÃO, não a existência da mensagem. Uma execução pode demorar sem
  // ferramenta nenhuma envolvida, e ali reconhecer continua sendo verdade.

  it('permite reconhecimento contextual mesmo sem nenhuma consulta', () => {
    // Cenário: sem lookup + resposta demorando.
    const noLookup = plan({
      intent: 'Confirmar escopo da migração',
      canAnswerNow: true,
      needsLookup: false,
      lookups: [],
      strategy: 'immediate',
      acknowledgementText:
        'Ah, entendi. Então a ideia é manter os três usuários e também todo o histórico atual.',
    })

    const verdict = validateAcknowledgement(noLookup, noLookup.acknowledgementText)
    expect(verdict.allowed).toBe(true)
  })

  it('recusa afirmação de consulta quando nenhuma consulta existe', () => {
    // Mesmo cenário anterior, mas o texto promete trabalho inexistente.
    const noLookup = plan({
      needsLookup: false,
      lookups: [],
      strategy: 'immediate',
      acknowledgementText: 'Entendi. Deixa eu verificar isso para você.',
    })

    const verdict = validateAcknowledgement(noLookup, noLookup.acknowledgementText)
    expect(verdict.allowed).toBe(false)
    expect(verdict.allowed === false && verdict.reason).toBe('unsupported_action_claim')
  })

  it('permite descrever a ação quando ela está de fato prevista', () => {
    // Cenário: com lookup + resposta demorando.
    const billing = plan({
      needsLookup: true,
      lookups: ['consultar o pagamento no sistema financeiro'],
      strategy: 'presence_then_work',
      acknowledgementText:
        'Entendi, você está falando de duas cobranças no mesmo cartão. Vou conferir o que aconteceu com esse pagamento.',
    })

    const verdict = validateAcknowledgement(billing, billing.acknowledgementText)
    expect(verdict.allowed).toBe(true)
  })

  it('cala quando a resposta é uma recusa curta e já conhecida', () => {
    // Cenário: solicitação fora do escopo e imediatamente respondível.
    // O caso do corte de árvore. Preceder "não fazemos isso" de "entendi
    // que você quer isso" é redundância, não presença.
    const treeCase = plan({
      intent: 'Quer saber se cortamos árvore',
      canAnswerNow: true,
      needsLookup: false,
      lookups: [],
      strategy: 'decline',
      acknowledgementText: 'Entendi que você precisa derrubar um cajueiro grande.',
    })

    const verdict = validateAcknowledgement(treeCase, treeCase.acknowledgementText)
    expect(verdict.allowed).toBe(false)
    expect(verdict.allowed === false && verdict.reason).toBe('answer_already_known')
  })

  it('recusa frase genérica de espera, com ou sem trabalho real', () => {
    const working = plan({
      needsLookup: true,
      lookups: ['consultar o pedido'],
      strategy: 'presence_then_work',
    })
    const idle = plan({ needsLookup: false, lookups: [], strategy: 'immediate' })

    for (const filler of [
      'Só um momento.',
      'Aguarde enquanto analiso.',
      'Estou verificando.',
      'Um instante.',
      'Ainda estou verificando.',
      'Só mais um momento.',
    ]) {
      for (const p of [working, idle]) {
        const verdict = validateAcknowledgement(p, filler)
        expect(verdict.allowed, `deveria recusar: ${filler}`).toBe(false)
      }
    }
  })

  it('recusa texto vazio e texto longo demais para ser reconhecimento', () => {
    const working = plan({ needsLookup: true, lookups: ['consultar'] })

    expect(validateAcknowledgement(working, '   ').allowed).toBe(false)
    expect(validateAcknowledgement(working, 'a'.repeat(400)).allowed).toBe(false)
  })
})


describe('validateKnownPartialText', () => {
  it('aceita o que já se sabe, dito como fato', () => {
    const verdict = validateKnownPartialText(
      'Hoje não temos uma integração pronta com o XPTO.'
    )
    expect(verdict.allowed).toBe(true)
  })

  it('recusa promessa de ação dentro da parte conhecida', () => {
    // A promessa pertence ao trecho de presença, que passa pelo portão
    // do trabalho real. Misturar deixaria a promessa entrar sem exame.
    const verdict = validateKnownPartialText('Vou verificar o preço para você.')
    expect(verdict.allowed).toBe(false)
    expect(verdict.allowed === false && verdict.reason).toBe('unsupported_action_claim')
  })
})

describe('composeIntermediateMessage', () => {
  it('põe a informação na frente e a expectativa depois — o caso XPTO', () => {
    const xpto = plan({
      needsLookup: true,
      lookups: ['avaliar viabilidade e custo de integração sob medida'],
      knownPartial: 'Hoje não temos uma integração pronta com o XPTO.',
      strategy: 'partial_then_work',
      acknowledgementText:
        'Sobre desenvolver uma integração específica e estimar custo, vou verificar como isso se encaixaria no seu caso.',
    })

    const verdict = composeIntermediateMessage(xpto)
    expect(verdict.allowed).toBe(true)
    if (verdict.allowed) {
      expect(verdict.text.indexOf('não temos uma integração pronta')).toBeLessThan(
        verdict.text.indexOf('vou verificar')
      )
    }
  })

  it('manda só a parte conhecida quando a promessa não passa no exame', () => {
    const partial = plan({
      needsLookup: true,
      lookups: ['orçar'],
      knownPartial: 'Hoje não temos uma integração pronta com o XPTO.',
      strategy: 'partial_then_work',
      acknowledgementText: 'Só um momento.',
    })

    const verdict = composeIntermediateMessage(partial)
    expect(verdict.allowed).toBe(true)
    if (verdict.allowed) {
      expect(verdict.text).toBe('Hoje não temos uma integração pronta com o XPTO.')
    }
  })

  it('não compõe nada quando o plano responde de imediato', () => {
    expect(composeIntermediateMessage(plan({ strategy: 'immediate' })).allowed).toBe(false)
  })
})

describe('validateProgressUpdate', () => {
  const twoStep = plan({
    needsLookup: true,
    lookups: ['localizar o pedido', 'conferir a cobrança'],
  })

  it('recusa atualização sem etapa concluída', () => {
    const verdict = validateProgressUpdate({
      plan: twoStep,
      completedSteps: [],
      text: 'Encontrei o pedido.',
    })
    expect(verdict.allowed).toBe(false)
    expect(verdict.allowed === false && verdict.reason).toBe('no_real_work')
  })

  it('aceita quando uma etapa terminou e ainda há trabalho', () => {
    const verdict = validateProgressUpdate({
      plan: twoStep,
      completedSteps: ['localizar o pedido'],
      text: 'Encontrei o pedido. Estou conferindo agora o que aconteceu com a cobrança.',
    })
    expect(verdict.allowed).toBe(true)
  })

  it('cala quando a última etapa terminou — aí o que existe é a resposta', () => {
    const verdict = validateProgressUpdate({
      plan: twoStep,
      completedSteps: ['localizar o pedido', 'conferir a cobrança'],
      text: 'Terminei de conferir.',
    })
    expect(verdict.allowed).toBe(false)
  })

  it('recusa narração vazia de progresso', () => {
    const verdict = validateProgressUpdate({
      plan: twoStep,
      completedSteps: ['localizar o pedido'],
      text: 'Continuo analisando.',
    })
    expect(verdict.allowed).toBe(false)
    expect(verdict.allowed === false && verdict.reason).toBe('generic_filler')
  })
})
