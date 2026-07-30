import { describe, it, expect } from 'vitest'
import {
  buildSystemPrompt,
  parseAIResponse,
  AIServiceConfigData,
  AIKnowledgeItem,
  AIMediaItem,
} from './prompt-builder'

describe('Smart AI Service - Prompt Builder & Parser', () => {
  it('builds system prompt with business context, knowledge items, and media library', () => {
    const config: AIServiceConfigData = {
      company_name: 'TechStore',
      business_segment: 'Varejo de Eletrônicos',
      service_goal: 'Vender produtos e tirar dúvidas',
      communication_style: 'Descontraído e técnico',
      service_rules: 'Seja atencioso.',
      limitations: 'Não dê descontos acima de 10%.',
      handoff_instructions: 'Transfira se pedir atendente.',
    }

    const knowledge: AIKnowledgeItem[] = [
      {
        id: 'k1',
        category: 'Horários',
        title: 'Horário de Funcionamento',
        content: 'Segunda a Sexta das 9h às 18h.',
      },
    ]

    const media: AIMediaItem[] = [
      {
        id: 'm1111111-1111-1111-1111-111111111111',
        title: 'Catálogo de Produtos 2026',
        media_type: 'document',
        media_url: 'https://example.com/catalog.pdf',
        description: 'Enviar quando o cliente pedir o catálogo.',
      },
    ]

    const prompt = buildSystemPrompt(config, knowledge, media)

    expect(prompt).toContain('TechStore')
    expect(prompt).toContain('Varejo de Eletrônicos')
    expect(prompt).toContain('Horário de Funcionamento')
    expect(prompt).toContain('Catálogo de Produtos 2026')
    expect(prompt).toContain('HANDOFF_TO_HUMAN')
    expect(prompt).toContain('SEND_MEDIA')
  })

  it('parses AI response with text only', () => {
    const raw = 'Olá! Como posso ajudar você hoje?'
    const parsed = parseAIResponse(raw)

    expect(parsed.cleanText).toBe('Olá! Como posso ajudar você hoje?')
    expect(parsed.handoffRequested).toBe(false)
    expect(parsed.mediaIdsToSend).toHaveLength(0)
  })

  it('parses AI response with handoff request', () => {
    const raw =
      'Entendo que você deseja suporte financeiro. Estou transferindo para um especialista! HANDOFF_TO_HUMAN:Cliente solicitou suporte financeiro'
    const parsed = parseAIResponse(raw)

    expect(parsed.cleanText).toBe(
      'Entendo que você deseja suporte financeiro. Estou transferindo para um especialista!'
    )
    expect(parsed.handoffRequested).toBe(true)
    expect(parsed.handoffReason).toBe('Cliente solicitou suporte financeiro')
  })

  it('parses AI response with media send trigger', () => {
    const mediaId = '12345678-1234-1234-1234-123456789012'
    const raw = `Segue o nosso catálogo em PDF! SEND_MEDIA:${mediaId}`
    const parsed = parseAIResponse(raw)

    expect(parsed.cleanText).toBe('Segue o nosso catálogo em PDF!')
    expect(parsed.mediaIdsToSend).toContain(mediaId)
  })
})
