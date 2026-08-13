"use client"

import { useRef, useState } from 'react'
import { Clock, Pencil, Settings2 } from 'lucide-react'
import { useElementWidth } from './use-element-width'
import type { ResponseTimeSummary, ResponseTimeBucket } from '@/lib/dashboard/types'
import { useTranslation } from '@/hooks/use-translation'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { EmptyState } from './empty-state'
import { Skeleton } from './skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'

interface ResponseTimeChartProps {
  data: ResponseTimeSummary | null
  loading: boolean
  thresholdMinutes?: number
  onTargetUpdated?: (newMinutes: number) => void
}

const PRESET_MINUTES = [2, 5, 10, 15, 30, 60]

export function ResponseTimeChart({
  data,
  loading,
  thresholdMinutes: propThreshold,
  onTargetUpdated,
}: ResponseTimeChartProps) {
  const { t } = useTranslation()
  const { accountId, responseTimeTargetMinutes, refreshProfile } = useAuth()
  const supabase = createClient()

  const currentTarget = propThreshold ?? responseTimeTargetMinutes ?? 5
  const [targetInput, setTargetInput] = useState<number>(currentTarget)
  const [saving, setSaving] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const hasData = data?.buckets.some((b) => b.avgMinutes != null) ?? false

  // The headline answers "am I responding fast enough?" — so it shows
  // whichever week actually has samples, labelled for which one it is.
  // Never lead with "—": a dash as the hero number tells the user
  // nothing while occupying the most valuable spot on the card.
  const headlineValue = data?.thisWeekAvg ?? data?.lastWeekAvg ?? null
  const headlineIsThisWeek = data?.thisWeekAvg != null

  const handleSaveTarget = async (minutesToSave: number) => {
    if (minutesToSave <= 0 || minutesToSave > 1440) {
      toast.error('Informe um valor entre 1 e 1440 minutos.')
      return
    }

    setSaving(true)
    try {
      if (accountId) {
        const { error } = await supabase
          .from('accounts')
          .update({ response_time_target_minutes: minutesToSave })
          .eq('id', accountId)

        if (error) throw error
        await refreshProfile()
      }

      try {
        localStorage.setItem('flow_response_time_target_minutes', String(minutesToSave))
      } catch (_e) {}

      onTargetUpdated?.(minutesToSave)
      toast.success(t('common.saved') || 'Meta atualizada com sucesso!')
      setPopoverOpen(false)
    } catch (err: any) {
      console.error('Failed to update response time target:', err)
      toast.error(err.message || 'Erro ao salvar a nova meta.')
    } finally {
      setSaving(false)
    }
  }

  const overTarget = headlineValue != null && headlineValue > currentTarget
  const factor = headlineValue != null && currentTarget > 0
    ? headlineValue / currentTarget
    : 0

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {t('dashboard.avgResponseTime')}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('dashboard.responseTimeDescription')}
          </p>
        </div>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums transition-colors hover:bg-muted hover:text-foreground"
                title="Clique para alterar a meta"
              />
            }
          >
            <span>{t('dashboard.target', { minutes: currentTarget })}</span>
            <Pencil className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
          </PopoverTrigger>

          <PopoverContent align="end" className="w-72 bg-popover p-4 text-popover-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Settings2 className="h-4 w-4 text-primary" />
                  {t('dashboard.editTargetTitle')}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('dashboard.editTargetDesc')}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTargetInput(m)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                      targetInput === m
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="number"
                  min={1}
                  max={1440}
                  value={targetInput}
                  onChange={(e) => setTargetInput(parseInt(e.target.value, 10) || 0)}
                  className="h-8 text-xs"
                />
                <span className="text-xs font-medium text-muted-foreground">min</span>
                <Button
                  size="sm"
                  disabled={saving || targetInput <= 0}
                  onClick={() => handleSaveTarget(targetInput)}
                  className="h-8 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? t('common.saving') : t('dashboard.saveTarget')}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </header>

      {loading || !data ? (
        <div className="p-5">
          <Skeleton className="h-[200px] w-full" />
        </div>
      ) : !hasData ? (
        <div className="p-5">
          <EmptyState
            icon={Clock}
            title={t('dashboard.noRepliesRecorded')}
            hint={t('dashboard.chartFillsAsYouReply')}
          />
        </div>
      ) : (
        <>
          {/* The answer, before the evidence: §4.6 da direção artística —
              "hierarquia começa pelo número que importa, não pelo gráfico
              mais bonito". */}
          <div className="px-5 pb-1 pt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                {fmt(headlineValue)}
              </span>
              <span className="text-xs text-muted-foreground">
                {headlineIsThisWeek
                  ? t('dashboard.responseVerdict.thisWeekLabel')
                  : t('dashboard.responseVerdict.lastWeekLabel')}
              </span>
            </div>
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                overTarget ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {overTarget
                ? t('dashboard.responseVerdict.over', {
                    factor: factor >= 10 ? Math.round(factor) : factor.toFixed(1),
                    target: fmt(currentTarget),
                  })
                : t('dashboard.responseVerdict.within', { target: fmt(currentTarget) })}
            </p>
            {!headlineIsThisWeek && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('dashboard.responseVerdict.noDataThisWeek')}
              </p>
            )}
          </div>

          <div className="px-5 pb-5 pt-2">
            <ResponseBars buckets={data.buckets} target={currentTarget} t={t} />
          </div>
        </>
      )}
    </section>
  )
}

// ------------------------------------------------------------
// Purpose-built bars. A generic bar chart can't draw the target line
// or colour a bar by whether it met that target — and without those
// two things the chart shows shape but no meaning: the user sees a
// tall bar with no way to judge whether tall is bad.
//
// It also renders "no samples" honestly. The previous version passed
// `avgMinutes ?? 0` to the chart, so a day with zero replies drew a
// zero-minute bar — reading as "answered instantly" when the truth was
// "no data at all" (FH-07.10, honestidade de estado).
// ------------------------------------------------------------

// Width is measured from the container so one SVG unit equals one CSS
// pixel — a fixed viewBox width letterboxes the drawing and strands
// dead space on both sides of a full-width card.
const VB_H = 150
const PAD = { top: 14, right: 8, bottom: 22, left: 8 }

const DOW_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'dom'] as const

function ResponseBars({
  buckets,
  target,
  t,
}: {
  buckets: ResponseTimeBucket[]
  target: number
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const VB_W = useElementWidth(wrapRef)

  const chartW = VB_W - PAD.left - PAD.right
  const chartH = VB_H - PAD.top - PAD.bottom

  // Scale to whichever is larger — the worst day or the target — with
  // headroom, so the target line is always on-canvas and comparable
  // even when every day beats it.
  const maxSample = buckets.reduce((m, b) => Math.max(m, b.avgMinutes ?? 0), 0)
  const maxY = Math.max(maxSample, target) * 1.2 || 1

  const slotW = chartW / buckets.length
  const barW = Math.min(slotW * 0.5, 44)
  const yFor = (v: number) => PAD.top + chartH - (v / maxY) * chartH
  const targetY = yFor(target)

  return (
    <div ref={wrapRef} className="w-full" style={{ height: VB_H }}>
      {VB_W > 0 && (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      role="img"
      aria-label={t('dashboard.avgResponseTime')}
    >
      {/* Baseline */}
      <line
        x1={PAD.left}
        x2={VB_W - PAD.right}
        y1={PAD.top + chartH}
        y2={PAD.top + chartH}
        className="stroke-border"
        strokeWidth={1}
      />

      {buckets.map((b, i) => {
        const cx = PAD.left + slotW * i + slotW / 2
        const label = t(`dashboard.dowShort.${DOW_KEYS[i]}`)
        const hasSample = b.avgMinutes != null
        const value = b.avgMinutes ?? 0
        const over = hasSample && value > target
        const barH = hasSample ? Math.max(2, PAD.top + chartH - yFor(value)) : 0

        return (
          <g key={i}>
            {hasSample ? (
              <>
                <rect
                  x={cx - barW / 2}
                  y={yFor(value)}
                  width={barW}
                  height={barH}
                  rx={3}
                  className={over ? 'fill-destructive/75' : 'fill-primary/70'}
                />
                <text
                  x={cx}
                  y={yFor(value) - 5}
                  textAnchor="middle"
                  className={cn(
                    'text-[11px] tabular-nums',
                    over ? 'fill-destructive' : 'fill-muted-foreground',
                  )}
                >
                  {fmt(value)}
                </text>
              </>
            ) : (
              // No samples: a flat tick on the baseline, never a bar.
              <line
                x1={cx - barW / 2}
                x2={cx + barW / 2}
                y1={PAD.top + chartH}
                y2={PAD.top + chartH}
                className="stroke-muted-foreground/30"
                strokeWidth={2}
              />
            )}
            <text
              x={cx}
              y={VB_H - 6}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {label}
            </text>
          </g>
        )
      })}

      {/* Target line, drawn last so it reads on top of the bars. This is
          the whole point of the chart: without it a tall bar is just a
          tall bar. */}
      <line
        x1={PAD.left}
        x2={VB_W - PAD.right}
        y1={targetY}
        y2={targetY}
        className="stroke-muted-foreground/70"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <text
        x={VB_W - PAD.right}
        y={targetY - 4}
        textAnchor="end"
        className="fill-muted-foreground text-[10px] tabular-nums"
      >
        {t('dashboard.target', { minutes: target })}
      </text>
    </svg>
      )}
    </div>
  )
}

function fmt(mins: number | null): string {
  if (mins == null) return '—'
  if (mins < 1) return `${Math.max(1, Math.round(mins * 60))}s`
  if (mins < 60) return `${trim(mins)}m`
  return `${trim(mins / 60)}h`
}

/** One decimal, but never a bare ".0" — a target of 2 reads "2m", not "2.0m". */
function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '')
}
