'use client'

import { useContext } from 'react'
import { I18nContext } from '@/lib/i18n/provider'

type DictPath = 'common' | 'metadata' | 'auth' | 'navigation' | 'dashboard' | 'contacts' | 'broadcasts' | 'pipelines' | 'flows' | 'inbox' | 'settings' | 'errors' | 'time'

interface UseTranslationReturn {
  t: (key: string, params?: Record<string, string | number>, defaultValue?: string) => string
  locale: 'pt-BR'
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }, text)
}

export function useTranslation(): UseTranslationReturn {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider')
  }

  const t = (key: string, params?: Record<string, string | number>, defaultValue: string = key): string => {
    const value = getNestedValue(context.messages, key)
    const text = typeof value === 'string' ? value : defaultValue
    return interpolate(text, params)
  }

  return { t, locale: context.locale }
}
