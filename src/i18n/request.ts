import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LOCALE } from './config'
import messages from './messages/pt-BR.json'

export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages,
  timeZone: 'America/Sao_Paulo',
  now: new Date(),
}))
