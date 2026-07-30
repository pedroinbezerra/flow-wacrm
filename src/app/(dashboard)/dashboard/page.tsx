"use client"

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import { formatCurrency } from '@/lib/currency'
import {
  MessageSquare,
  UserPlus,
  DollarSign,
  Send,
  Sparkles,
} from 'lucide-react'

import {
  loadActivity,
  loadConversationsSeries,
  loadMetrics,
  loadPipelineDonut,
  loadResponseTime,
} from '@/lib/dashboard/queries'
import type {
  ActivityItem,
  ConversationsSeriesPoint,
  MetricsBundle,
  PipelineDonutData,
  ResponseTimeSummary,
} from '@/lib/dashboard/types'

import { MetricCard } from '@/components/dashboard/metric-card'
import { SkeletonCard } from '@/components/dashboard/skeleton'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { ConversationsChart } from '@/components/dashboard/conversations-chart'
import { PipelineDonut } from '@/components/dashboard/pipeline-donut'
import { ResponseTimeChart } from '@/components/dashboard/response-time-chart'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
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
  const { defaultCurrency } = useAuth()
  const { t } = useTranslation()
  const [metrics, setMetrics] = useState<MetricsBundle | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)

  const [checklistOpen, setChecklistOpen] = useState<boolean>(true)

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
    setChecklistOpen(true)
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

  const [pipeline, setPipeline] = useState<PipelineDonutData | null>(null)
  const [pipelineLoading, setPipelineLoading] = useState(true)

  const [responseTime, setResponseTime] = useState<ResponseTimeSummary | null>(null)
  const [responseTimeLoading, setResponseTimeLoading] = useState(true)

  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  // Fetch initial bundle (metrics, activity, response-time, 30d series)
  useEffect(() => {
    const db = createClient()

    loadMetrics(db)
      .then(setMetrics)
      .catch((err) => console.error('[dashboard] metrics failed:', err))
      .finally(() => setMetricsLoading(false))

    loadConversationsSeries(db, 30)
      .then((s) => setSeries((prev) => ({ ...prev, 30: s })))
      .catch((err) => console.error('[dashboard] series failed:', err))
      .finally(() => setSeriesLoading(false))

    loadPipelineDonut(db)
      .then(setPipeline)
      .catch((err) => console.error('[dashboard] pipeline failed:', err))
      .finally(() => setPipelineLoading(false))

    loadResponseTime(db)
      .then(setResponseTime)
      .catch((err) => console.error('[dashboard] response time failed:', err))
      .finally(() => setResponseTimeLoading(false))

    loadActivity(db, t, 50)
      .then(setActivity)
      .catch((err) => console.error('[dashboard] activity failed:', err))
      .finally(() => setActivityLoading(false))
  }, [t])

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
      <OnboardingChecklist open={checklistOpen} onOpenChange={setChecklistOpen} />

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsLoading || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard
              title={t("dashboard.activeConversations")}
              value={metrics.activeConversations.current.toLocaleString()}
              icon={MessageSquare}
              delta={{
                sign: metrics.activeConversations.previous,
                label: deltaLabel(t, metrics.activeConversations.previous, 'dashboard.vsYesterday'),
              }}
            />
            <MetricCard
              title={t("dashboard.newContactsToday")}
              value={metrics.newContactsToday.current.toLocaleString()}
              icon={UserPlus}
              delta={{
                sign:
                  metrics.newContactsToday.current - metrics.newContactsToday.previous,
                label: deltaLabel(
                  t,
                  metrics.newContactsToday.current - metrics.newContactsToday.previous,
                  'dashboard.vsYesterday',
                ),
              }}
            />
            <MetricCard
              title={t("dashboard.openDealsValue")}
              value={formatCurrency(metrics.openDealsValue, defaultCurrency)}
              icon={DollarSign}
              subtitle={`${metrics.openDealsCount} ${metrics.openDealsCount === 1 ? t("dashboard.openDeal") : t("dashboard.openDeals")}`}
            />
            <MetricCard
              title={t("dashboard.messagesSentToday")}
              value={metrics.messagesSentToday.current.toLocaleString()}
              icon={Send}
              delta={{
                sign:
                  metrics.messagesSentToday.current - metrics.messagesSentToday.previous,
                label: deltaLabel(
                  t,
                  metrics.messagesSentToday.current - metrics.messagesSentToday.previous,
                  'dashboard.vsYesterday',
                ),
              }}
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <QuickActions />

      {/* Charts row */}
      {/* items-stretch (the grid default) stretches the two columns to
          match the tallest sibling; adding h-full on each wrapper and
          on the inner panels makes both cards actually fill that
          stretched height so their rounded borders line up. Without
          this, the pipeline card rendered at its natural (shorter)
          height while the line chart drove the row height. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="h-full lg:col-span-3">
          <ConversationsChart
            series={series}
            loading={seriesLoading}
            range={range}
            onRangeChange={handleRangeChange}
          />
        </div>
        <div className="h-full lg:col-span-2">
          <PipelineDonut
            data={pipeline}
            loading={pipelineLoading}
            currency={defaultCurrency}
          />
        </div>
      </div>

      {/* Response time */}
      <ResponseTimeChart data={responseTime} loading={responseTimeLoading} />

      {/* Activity feed */}
      <ActivityFeed items={activity} loading={activityLoading} />
    </div>
  )
}

// ------------------------------------------------------------

function deltaLabel(t: ReturnType<typeof useTranslation>['t'], delta: number, suffixKey: string): string {
  if (delta === 0) return `${t("dashboard.noChange")} ${t(suffixKey)}`
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toLocaleString()} ${t(suffixKey)}`
}
