import type { AutomationTriggerType } from '@/types'

export interface TriggerMeta {
  label: string
  /** Tailwind classes for the Badge pill on the list row. */
  pillClass: string
}

export type Translator = (key: string, params?: Record<string, string | number>) => string

export const TRIGGER_META: Record<AutomationTriggerType, TriggerMeta> = {
  new_message_received: {
    label: 'Nova mensagem',
    pillClass: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  },
  first_inbound_message: {
    label: 'Primeira mensagem do contato',
    pillClass: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
  },
  keyword_match: {
    label: 'Correspondência de palavra-chave',
    pillClass: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  },
  new_contact_created: {
    label: 'Novo contato',
    pillClass: 'border-primary/30 bg-primary/10 text-primary',
  },
  conversation_assigned: {
    label: 'Conversa atribuída',
    pillClass: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  },
  tag_added: {
    label: 'Tag adicionada',
    pillClass: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  time_based: {
    label: 'Baseado em tempo',
    pillClass: 'border-slate-500/30 bg-slate-500/10 text-muted-foreground',
  },
}

export function triggerMeta(triggerType: AutomationTriggerType | string, t: Translator): TriggerMeta {
  const labelKey: Record<AutomationTriggerType, string> = {
    new_message_received: 'automations.triggerLabels.newMessage',
    first_inbound_message: 'automations.triggerLabels.firstMessageFromContact',
    keyword_match: 'automations.triggerLabels.keywordMatch',
    new_contact_created: 'automations.triggerLabels.newContact',
    conversation_assigned: 'automations.triggerLabels.conversationAssigned',
    tag_added: 'automations.triggerLabels.tagAdded',
    time_based: 'automations.triggerLabels.timeBased',
  }
  const meta = TRIGGER_META[triggerType as AutomationTriggerType];
  if (!meta) {
    return {
      label: triggerType,
      pillClass: 'border-slate-500/30 bg-slate-500/10 text-muted-foreground',
    };
  }
  return {
    ...meta,
    label: labelKey[triggerType as AutomationTriggerType]
      ? t(labelKey[triggerType as AutomationTriggerType])
      : triggerType,
  }
}

export function formatRelative(iso: string | null | undefined, t: Translator): string {
  if (!iso) return t('time.never')
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return t('time.never')
  const diffSec = Math.round((Date.now() - then) / 1000)
  if (diffSec < 60) return t('time.justNow')
  if (diffSec < 3600) return t('time.minutesAgo', { count: Math.floor(diffSec / 60) })
  if (diffSec < 86400) return t('time.hoursAgo', { count: Math.floor(diffSec / 3600) })
  if (diffSec < 2_592_000) return t('time.daysAgo', { count: Math.floor(diffSec / 86400) })
  return new Date(iso).toLocaleDateString()
}
