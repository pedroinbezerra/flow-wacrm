"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/use-translation'
import { Sparkles } from 'lucide-react'

import {
  loadAttentionQueue,
  loadConversationsSeries,
  loadResponseTime,
} from '@/lib/dashboard/queries'
import type {
  AttentionGroup,
  ConversationsSeriesPoint,
  ResponseTimeSummary,
} from '@/lib/dashboard/types'

import { QuickActions } from '@/components/dashboard/quick-actions'
import { AttentionQueue } from '@/components/dashboard/attention-queue'
import { ConversationsChart } from '@/components/dashboard/conversations-chart'
import { ResponseTimeChart } from '@/components/dashboard/response-time-chart'
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist"

type RangeDays = 7 | 30 | 90

function JourneyTriggerButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExpanded(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      onClick={onClick}
      className="group relative inline-flex h-8 items-center justify-center rounded-lg border border-primary/35 bg-primary/10 px-2.5 text-xs font-semibold text-primary shadow-sm hover:bg-primary/20 transition-all duration-500 ease-in-out"
      title={t("onboarding.triggerTitle")}
    >
      <Sparkles className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out ${
          expanded
            ? "max-w-xs opacity-100 ml-2"
            : "max-w-0 opacity-0 ml-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2"
        }`}
      >
        {t("onboarding.title")}
      </span>
    </button>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation()
  // Keep a stable ref for `t` so the data-fetching effect doesn't re-run
  // on every render. The `t` closure is recreated each render (new object
  // identity) but its output is always the same (static pt-BR dictionary).
  const tRef = useRef(t)
  tRef.current = t

  const [checklistOpen, setChecklistOpen] = useState<boolean>(true)
  // Distinguishes "open because nothing dismissed it yet" from "open
  // because the user just asked for it". A finished checklist only
  // renders in the second case — see OnboardingChecklist.
  const [checklistOpenedByUser, setChecklistOpenedByUser] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("flow_onboarding_checklist_dismissed") === "true"
      setChecklistOpen(!dismissed)
    } catch (_e) {}
  }, [])

  const handleActivateChecklist = () => {
    try {
      localStorage.setItem("flow_onboarding_checklist_dismissed", "false")
    } catch (_e) {}
    setChecklistOpenedByUser(true)
    setChecklistOpen(true)
  }

  const handleChecklistOpenChange = (next: boolean) => {
    setChecklistOpen(next)
    if (!next) setChecklistOpenedByUser(false)
  }

  const [range, setRange] = useState<RangeDays>(30)
  // Keep a cache per range so switching tabs doesn't re-fetch what we
  // already have. Ranges the user hasn't opened yet stay null and
  // trigger a fetch on first view.
  const [series, setSeries] = useState<Record<RangeDays, ConversationsSeriesPoint[] | null>>({
    7: null,
    30: null,
    90: null,
  })
  const [seriesLoading, setSeriesLoading] = useState(true)

  const [responseTime, setResponseTime] = useState<ResponseTimeSummary | null>(null)
  const [responseTimeLoading, setResponseTimeLoading] = useState(true)

  const [attention, setAttention] = useState<AttentionGroup[] | null>(null)
  const [attentionLoading, setAttentionLoading] = useState(true)

  // Fetch initial bundle (attention queue, activity, response-time, 30d series)
  useEffect(() => {
    const db = createClient()

    loadAttentionQueue(db, tRef.current)
      .then(setAttention)
      .catch((err) => console.error('[dashboard] attention queue failed:', err))
      .finally(() => setAttentionLoading(false))

    loadConversationsSeries(db, 30)
      .then((s) => setSeries((prev) => ({ ...prev, 30: s })))
      .catch((err) => console.error('[dashboard] series failed:', err))
      .finally(() => setSeriesLoading(false))

    loadResponseTime(db)
      .then(setResponseTime)
      .catch((err) => console.error('[dashboard] response time failed:', err))
      .finally(() => setResponseTimeLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Range switch handler — kept in an event callback (not an effect)
  // so the setState calls stay out of the react-hooks/set-state-in-effect
  // rule's way. The cached bucket check means switching back to a
  // previously-viewed range is instant and doesn't re-fetch.
  const handleRangeChange = useCallback(
    (r: RangeDays) => {
      setRange(r)
      if (series[r] !== null) return
      setSeriesLoading(true)
      const db = createClient()
      loadConversationsSeries(db, r)
        .then((s) => setSeries((prev) => ({ ...prev, [r]: s })))
        .catch((err) => console.error('[dashboard] series failed:', err))
        .finally(() => setSeriesLoading(false))
    },
    [series],
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dashboard.description")}
          </p>
        </div>

        {!checklistOpen && (
          <JourneyTriggerButton onClick={handleActivateChecklist} />
        )}
      </div>

      {/* Checklist de Implantação e Jornada de Onboarding */}
      <OnboardingChecklist
        open={checklistOpen}
        onOpenChange={handleChecklistOpenChange}
        openedByUser={checklistOpenedByUser}
      />

      {/* Fila de Atenção — "o que precisa de você agora". Vem antes de
          tudo o mais de propósito: é a tarefa dominante da tela.
          Ver docs/evolucao-experiencia/01-home-dashboard.md. */}
      <AttentionQueue groups={attention} loading={attentionLoading} />

      {/* Quick actions */}
      <QuickActions />

      {/* Conversas ao longo do tempo e tempo médio de resposta — os dois
          gráficos validados como úteis (ver "Nota de implementação" no
          mapa de evolução). Os quatro cartões de métrica e o donut de
          pipeline que existiam aqui foram removidos: cada número já vive
          no lar canônico dele (Inbox, Contacts, Pipelines — FH-22.03) e
          nenhum deixava o usuário agir, só mostrava contagem. */}
      <ConversationsChart
        series={series}
        loading={seriesLoading}
        range={range}
        onRangeChange={handleRangeChange}
      />

      <ResponseTimeChart data={responseTime} loading={responseTimeLoading} />
    </div>
  )
}
