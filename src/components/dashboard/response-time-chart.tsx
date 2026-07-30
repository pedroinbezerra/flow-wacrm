"use client"

import { useState } from 'react'
import { Clock, Pencil, Settings2, Check } from 'lucide-react'
import { DOW_SHORT_MON_FIRST } from '@/lib/dashboard/date-utils'
import type { ResponseTimeSummary } from '@/lib/dashboard/types'
import { useTranslation } from '@/hooks/use-translation'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { BarChart } from '@/components/tremor/bar-chart'
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
const CATEGORY = 'Avg minutes'

export function ResponseTimeChart({
  data,
  loading,
  thresholdMinutes: propThreshold,
  onTargetUpdated,
}: ResponseTimeChartProps) {
  const { t } = useTranslation()
  const { accountId, responseTimeTargetMinutes, refreshProfile, canEditSettings } = useAuth()
  const supabase = createClient()

  const currentTarget = propThreshold ?? responseTimeTargetMinutes ?? 5
  const [targetInput, setTargetInput] = useState<number>(currentTarget)
  const [saving, setSaving] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const hasData = data?.buckets.some((b) => b.avgMinutes != null) ?? false

  const chartData =
    data?.buckets.map((b, i) => ({
      day: DOW_SHORT_MON_FIRST[i],
      [CATEGORY]: b.avgMinutes ?? 0,
      samples: b.samples,
    })) ?? []

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
        <div className="flex items-center gap-3 text-right text-xs">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-medium text-rose-300 tabular-nums hover:bg-rose-500/20 hover:border-rose-500/60 transition-all"
                  title="Clique para alterar a meta"
                />
              }
            >
              <span>{t('dashboard.target', { minutes: currentTarget })}</span>
              <Pencil className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
            </PopoverTrigger>

            <PopoverContent align="end" className="w-72 p-4 bg-popover text-popover-foreground">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    <Settings2 className="h-4 w-4 text-primary" />
                    {t('dashboard.editTargetTitle')}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('dashboard.editTargetDesc')}
                  </p>
                </div>

                {/* Presets Rápidos */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTargetInput(m)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                        targetInput === m
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                {/* Custom Number Input */}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    type="number"
                    min={1}
                    max={1440}
                    value={targetInput}
                    onChange={(e) => setTargetInput(parseInt(e.target.value, 10) || 0)}
                    className="h-8 text-xs"
                  />
                  <span className="text-xs text-muted-foreground font-medium">min</span>
                  <Button
                    size="sm"
                    disabled={saving || targetInput <= 0}
                    onClick={() => handleSaveTarget(targetInput)}
                    className="h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {saving ? t('common.saving') : t('dashboard.saveTarget')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {data && (data.thisWeekAvg != null || data.lastWeekAvg != null) && (
            <div>
              <div className="text-muted-foreground">
                {t('dashboard.thisWeek')}{' '}
                <span className="font-medium text-foreground tabular-nums">
                  {fmt(data.thisWeekAvg)}
                </span>
              </div>
              <div className="text-muted-foreground">
                {t('dashboard.lastWeek')}{' '}
                <span className="tabular-nums">{fmt(data.lastWeekAvg)}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="p-5">
        {loading || !data ? (
          <Skeleton className="h-[260px] w-full" />
        ) : !hasData ? (
          <EmptyState
            icon={Clock}
            title={t('dashboard.noRepliesRecorded')}
            hint={t('dashboard.chartFillsAsYouReply')}
          />
        ) : (
          <BarChart
            data={chartData}
            index="day"
            categories={[CATEGORY]}
            colors={['violet']}
            valueFormatter={(value) => `${value.toFixed(1)}m`}
            showLegend={false}
            yAxisWidth={48}
            className="h-[260px]"
          />
        )}
      </div>
    </section>
  )
}

function fmt(mins: number | null): string {
  if (mins == null) return '—'
  if (mins < 1) return `${Math.max(1, Math.round(mins * 60))}s`
  if (mins < 60) return `${mins.toFixed(1)}m`
  return `${(mins / 60).toFixed(1)}h`
}
