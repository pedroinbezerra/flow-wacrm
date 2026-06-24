'use client'

import React, { createContext } from 'react'
import messages from '@/i18n/messages/pt-BR.json'

type Messages = typeof messages

interface I18nContextType {
  messages: Messages
  locale: 'pt-BR'
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nContext.Provider value={{ messages, locale: 'pt-BR' }}>
      {children}
    </I18nContext.Provider>
  )
}
