"use client"

import Link from 'next/link'
import { Briefcase, CheckCircle2, ChevronRight, FileText, MessageSquare, Zap } from 'lucide-react'
import type { ComponentType } from 'react'
import type { AttentionGroup, AttentionKind } from '@/lib/dashboard/types'
import { useTranslation } from '@/hooks/use-translation'
import { Skeleton } from './skeleton'

interface AttentionQueueProps {
  /** null while loading; empty array once loaded means "nothing pending". */
  groups: AttentionGroup[] | null
  loading: boolean
}

const KIND_ICON: Record<AttentionKind, ComponentType<{ className?: string }>> = {
  conversation: MessageSquare,
  deal: Briefcase,
  automation: Zap,
  pendency: FileText,
}

// The Home entry point for "what needs me right now" — see
// docs/evolucao-experiencia/01-home-dashboard.md. Every row here only
// informs (autonomy level 1, FH-18.01): it never resolves anything by
// itself, it links to the area that owns the item.
//
// Deliberately one shell, one list, one icon treatment — no per-kind
// accent color. Four different hues on four adjacent cards reads as
// four protagonists (i.e. none) per the color-distribution rule in
// docs/direcao-criativa/VOLUME-II-direcao-de-arte-de-paginas.md §6.11;
// a card grid also leaves dead space whenever fewer than 4 domains have
// something pending. A list (same shell as ActivityFeed, §6.18
// consistency) fills exactly as much room as there's real content.
export function AttentionQueue({ groups, loading }: AttentionQueueProps) {
  const { t } = useTranslation()

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{t('dashboard.attention.title')}</h2>
      </header>

      {loading || groups === null ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex items-center gap-3 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">{t('dashboard.attention.allClearTitle')}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.attention.allClearDescription')}</p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {groups.map((group) => {
            const Icon = KIND_ICON[group.kind]
            return (
              <li key={group.kind}>
                <Link
                  href={group.href}
                  className="group/row flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent"
                >
                  {/* Accent on the icon, not four decorative hues: these
                      rows ARE the page's one accent surface (~7% per
                      §6.11), and an item waiting on you is state, which
                      is what colour is for (§4.5). */}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover/row:bg-primary/20">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{group.headline}</p>
                    <p className="truncate text-xs text-muted-foreground">{group.detail}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover/row:text-foreground" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
