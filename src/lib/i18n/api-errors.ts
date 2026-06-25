type SupportedApiLocale = 'pt-BR' | 'en-US'

type ApiErrorKey =
  | 'whatsapp.wabaEqualsPhoneNumber'
  | 'whatsapp.invalidWabaConfig'
  | 'whatsapp.metaNonexistingMessageTemplates'

const API_ERROR_MESSAGES: Record<ApiErrorKey, Record<SupportedApiLocale, string>> = {
  'whatsapp.wabaEqualsPhoneNumber': {
    'en-US':
      'waba_id cannot be the same as phone_number_id. Use the WhatsApp Business Account ID (WABA) from Meta Business Manager, not the phone number ID.',
    'pt-BR':
      'waba_id nao pode ser igual ao phone_number_id. Use o WhatsApp Business Account ID (WABA) no Meta Business Manager, e nao o ID do numero de telefone.',
  },
  'whatsapp.invalidWabaConfig': {
    'en-US':
      'Invalid WhatsApp configuration: waba_id is equal to phone_number_id. Open Settings and set the real WhatsApp Business Account ID (WABA).',
    'pt-BR':
      'Configuracao do WhatsApp invalida: waba_id esta igual ao phone_number_id. Abra Settings e informe o WhatsApp Business Account ID (WABA) correto.',
  },
  'whatsapp.metaNonexistingMessageTemplates': {
    'en-US':
      'Meta rejected /{waba_id}/message_templates because the configured waba_id is not a WhatsApp Business Account ID. Check Settings and replace waba_id with the real WABA ID (do not use phone_number_id).',
    'pt-BR':
      'A Meta rejeitou /{waba_id}/message_templates porque o waba_id configurado nao e um WhatsApp Business Account ID. Verifique Settings e substitua o waba_id pelo WABA ID real (nao use phone_number_id).',
  },
}

function getLocaleFromRequest(request: Request): SupportedApiLocale {
  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? ''
  if (acceptLanguage.includes('pt-br') || acceptLanguage.includes('pt')) {
    return 'pt-BR'
  }
  return 'en-US'
}

export function tApiError(request: Request, key: ApiErrorKey): string {
  const locale = getLocaleFromRequest(request)
  return API_ERROR_MESSAGES[key][locale]
}
