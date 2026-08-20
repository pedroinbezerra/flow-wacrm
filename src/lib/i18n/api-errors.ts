type SupportedApiLocale = 'pt-BR' | 'en-US'

type ApiErrorKey =
  | 'whatsapp.wabaEqualsPhoneNumber'
  | 'whatsapp.invalidWabaConfig'
  | 'whatsapp.metaNonexistingMessageTemplates'
  | 'whatsapp.templateMissingAtMeta'
  | 'whatsapp.templateFromAnotherNumber'
  | 'whatsapp.templateJustDetectedMissing'
  | 'whatsapp.templateMissingCannotEdit'
  | 'whatsapp.templateUnderReviewCannotEdit'
  | 'whatsapp.templateTerminalCannotEdit'
  | 'whatsapp.templateNeverSubmitted'

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
  // Modelo vive dentro da conta de WhatsApp Business do numero. Trocar o
  // numero conectado nao leva modelo junto: o catalogo antigo deixa de
  // existir para a conexao nova. Estas tres mensagens cobrem os tres
  // momentos em que a pessoa encontra esse fato — antes do envio, no
  // envio de um modelo de outro numero, e quando a propria Meta recusa.
  // Falam da consequencia e do proximo passo; "WABA" nao aparece porque
  // saber o nome do recurso nao ajuda ninguem a mandar a mensagem.
  'whatsapp.templateMissingAtMeta': {
    'en-US':
      'This template no longer exists in the WhatsApp account behind this number, so it cannot be sent. Open Settings, sync your templates, and submit it again for approval.',
    'pt-BR':
      'Este modelo nao existe mais na conta de WhatsApp deste numero, entao nao ha o que enviar. Abra Configuracoes, sincronize os modelos e envie este para aprovacao de novo.',
  },
  'whatsapp.templateFromAnotherNumber': {
    'en-US':
      'This template belongs to a number that is no longer the one connected. Templates do not move between numbers — sync your templates in Settings and submit this one for approval on the current number.',
    'pt-BR':
      'Este modelo e de um numero que nao esta mais conectado. Modelo nao acompanha troca de numero — sincronize os modelos em Configuracoes e envie este para aprovacao no numero atual.',
  },
  'whatsapp.templateJustDetectedMissing': {
    'en-US':
      'Meta refused this template: it no longer exists in the WhatsApp account behind this number. We marked it as unavailable so it stops being offered. Submit it again for approval to use it.',
    'pt-BR':
      'A Meta recusou este modelo: ele nao existe mais na conta de WhatsApp deste numero. Ja marcamos o modelo como indisponivel para ele parar de ser oferecido. Envie para aprovacao de novo para voltar a usar.',
  },
  // Editar um modelo altera o que existe na Meta. Quando nao ha nada la
  // — porque sumiu, porque ainda esta em analise, ou porque a Meta o
  // encerrou — o produto precisa dizer qual e o caminho, e nao devolver
  // o nome do estado interno.
  'whatsapp.templateMissingCannotEdit': {
    'en-US':
      'This template no longer exists in the WhatsApp account behind this number, so there is nothing to edit. Submit it again for approval to recreate it on the current number.',
    'pt-BR':
      'Este modelo nao existe mais na conta de WhatsApp deste numero, entao nao ha o que editar. Envie para aprovacao de novo para recria-lo no numero atual.',
  },
  'whatsapp.templateUnderReviewCannotEdit': {
    'en-US':
      'This template is under review at Meta and cannot be edited until the review ends. It usually takes up to 24 hours.',
    'pt-BR':
      'Este modelo esta em analise na Meta e nao pode ser editado ate a revisao terminar. Costuma levar ate 24 horas.',
  },
  'whatsapp.templateTerminalCannotEdit': {
    'en-US':
      'Meta closed this template, so it can no longer be edited. Create a new template with the content you need.',
    'pt-BR':
      'A Meta encerrou este modelo, entao ele nao pode mais ser editado. Crie um modelo novo com o conteudo que voce precisa.',
  },
  'whatsapp.templateNeverSubmitted': {
    'en-US':
      'This template was never sent to Meta for approval, so there is nothing to edit there. Use "New template" to submit it.',
    'pt-BR':
      'Este modelo nunca foi enviado para aprovacao da Meta, entao nao ha o que editar la. Use "Novo modelo" para envia-lo.',
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
