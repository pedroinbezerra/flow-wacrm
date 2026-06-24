export const LOCALES = ['pt-BR', 'en'] as const
export const DEFAULT_LOCALE = 'pt-BR'

// Configuração de getRequestConfig para next-intl
// Usado para importar mensagens no servidor
export default {
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  timeZone: 'America/Sao_Paulo',
  now: new Date(),
}
