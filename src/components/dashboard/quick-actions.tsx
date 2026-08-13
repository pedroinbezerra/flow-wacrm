"use client"

import Link from 'next/link'
import { UserPlus, Briefcase, Radio, Zap } from 'lucide-react'
import type { ComponentType } from 'react'
import { useTranslation } from '@/hooks/use-translation'

// Quick-action shortcuts. Each navigates to the page that owns the
// relevant "create" flow. We deliberately don't try to auto-open any
// modal on the target page — that'd require touching those pages,
// which is out of scope here.
//
// One icon treatment for all four — no per-item accent hue. Four
// different colors on four adjacent icons reads as decoration, not
// meaning (docs/direcao-criativa/VOLUME-II-direcao-de-arte-de-paginas.md
// §6.11: cor nunca é o único portador de significado; se uma tela tem
// quatro cores de acento simultâneas, ela tem quatro protagonistas —
// ou seja, nenhum). These are all the same kind of thing (a create
// shortcut), so they get the same visual weight.
interface Action {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

const ACTIONS: (t: ReturnType<typeof useTranslation>['t']) => Action[] = (t) => [
  { label: t('dashboard.quickAction.newContact'), href: '/contacts', icon: UserPlus },
  { label: t('dashboard.quickAction.newDeal'), href: '/pipelines', icon: Briefcase },
  { label: t('dashboard.quickAction.newBroadcast'), href: '/broadcasts/new', icon: Radio },
  { label: t('dashboard.quickAction.newAutomation'), href: '/automations/new', icon: Zap },
]

export function QuickActions() {
  const { t } = useTranslation()
  const actions = ACTIONS(t)
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((a) => {
        const Icon = a.icon
        return (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground">{a.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
