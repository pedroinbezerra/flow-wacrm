'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Broadcast } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Radio, Plus, Copy } from 'lucide-react';
import { useCan } from '@/hooks/use-can';
import { GatedButton } from '@/components/ui/gated-button';
import { getBroadcastStatus } from '@/lib/broadcast-status';

/**
 * Poll cadence while any broadcast is sending. Kept modest so we don't
 * beat on Supabase — the aggregate trigger in migration 003 keeps
 * counts consistent; we just need to surface the freshest snapshot.
 */
const POLL_INTERVAL_MS = 5_000;
const PAGE_SIZE = 20;

function percent(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function RateCell({
  value,
  total,
  color,
}: {
  value: number;
  total: number;
  /** Tailwind bg class for the fill, e.g. "bg-primary" */
  color: string;
}) {
  const pct = percent(value, total);
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
        {pct}%
      </span>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BroadcastsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const canCreate = useCan('send-messages');
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Used to kick off polling only while something is actively sending.
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchBroadcasts() {
    try {
      const supabase = createClient();
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error: fetchError } = await supabase
        .from('broadcasts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;
      setBroadcasts(data ?? []);
      if (count !== null) setTotalCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('broadcasts.failedLoad'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchBroadcasts();
  }, [page]);

  const anySending = useMemo(
    () => broadcasts.some((b) => b.status === 'sending'),
    [broadcasts],
  );

  useEffect(() => {
    function startPolling() {
      if (pollTimer.current) return;
      pollTimer.current = setInterval(fetchBroadcasts, POLL_INTERVAL_MS);
    }
    function stopPolling() {
      if (!pollTimer.current) return;
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }

    function handleVisibilityChange() {
      if (!anySending) return;
      if (document.visibilityState === 'hidden') {
        stopPolling();
      } else {
        void fetchBroadcasts();
        startPolling();
      }
    }

    if (anySending && document.visibilityState === 'visible') {
      startPolling();
    } else {
      stopPolling();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [anySending]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  if (loading && broadcasts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {anySending && (
        <div
          role="progressbar"
          aria-label="Disparo em andamento"
          className="broadcast-indeterminate fixed inset-x-0 top-0 z-40 h-0.5 overflow-hidden bg-muted"
        >
          <div className="broadcast-indeterminate-bar h-0.5 bg-primary" />
          <style jsx>{`
            .broadcast-indeterminate-bar {
              width: 33%;
              transform: translateX(-100%);
              animation: broadcast-slide 1.6s cubic-bezier(0.4, 0, 0.2, 1)
                infinite;
            }
            @keyframes broadcast-slide {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(400%);
              }
            }
          `}</style>
        </div>
      )}

      <div id="tour-broadcasts-header" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('broadcasts.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('broadcasts.description')}
          </p>
        </div>
        <div id="tour-broadcasts-new">
          <GatedButton
            canAct={canCreate}
            gateReason="create broadcasts"
            onClick={() => router.push('/broadcasts/new')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t('broadcasts.new')}
          </GatedButton>
        </div>
      </div>

      {broadcasts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-card">
          <Radio className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{t('broadcasts.noBroadcasts')}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('broadcasts.noBroadcastsHint')}
          </p>
          <GatedButton
            canAct={canCreate}
            gateReason="create broadcasts"
            onClick={() => router.push('/broadcasts/new')}
            className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t('broadcasts.new')}
          </GatedButton>
        </div>
      ) : (
        <div className="space-y-4">
          <div id="tour-broadcasts-stats" className="overflow-x-auto rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">{t('common.name')}</TableHead>
                  <TableHead className="hidden text-muted-foreground md:table-cell">{t('broadcasts.template')}</TableHead>
                  <TableHead className="hidden text-right text-muted-foreground sm:table-cell">
                    {t('broadcasts.recipients')}
                  </TableHead>
                  <TableHead className="hidden text-muted-foreground lg:table-cell">{t('broadcasts.delivery')}</TableHead>
                  <TableHead className="hidden text-muted-foreground lg:table-cell">{t('broadcasts.read')}</TableHead>
                  <TableHead className="text-muted-foreground">{t('common.status')}</TableHead>
                  <TableHead className="hidden text-muted-foreground sm:table-cell">{t('common.date')}</TableHead>
                  <TableHead className="w-12 text-right text-muted-foreground">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((broadcast) => {
                  const status = getBroadcastStatus(broadcast.status);
                  const handleRowClick = () => {
                    if (broadcast.status === 'draft') {
                      router.push(`/broadcasts/new?draftId=${broadcast.id}`);
                    } else {
                      router.push(`/broadcasts/${broadcast.id}`);
                    }
                  };

                  return (
                    <TableRow
                      key={broadcast.id}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick();
                        }
                      }}
                      className="cursor-pointer border-border hover:bg-muted/50 focus-visible:bg-muted/50 outline-none"
                      onClick={handleRowClick}
                    >
                      <TableCell className="font-medium text-foreground">
                        {broadcast.name}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {broadcast.template_name}
                      </TableCell>
                      <TableCell className="hidden text-right text-muted-foreground tabular-nums sm:table-cell">
                        {broadcast.total_recipients}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <RateCell
                          value={broadcast.delivered_count}
                          total={broadcast.total_recipients}
                          color="bg-primary"
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <RateCell
                          value={broadcast.read_count}
                          total={broadcast.total_recipients}
                          color="bg-blue-500"
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${status.classes}`}
                        >
                          {status.pulse && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                            </span>
                          )}
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {new Date(broadcast.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t('broadcasts.cloneTitle')}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/broadcasts/new?cloneFrom=${broadcast.id}`);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Server-Side Pagination Bar */}
          {totalCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2 text-xs text-muted-foreground">
              <span>
                Exibindo <span className="font-medium text-foreground">{page * PAGE_SIZE + 1}</span>-
                <span className="font-medium text-foreground">{Math.min((page + 1) * PAGE_SIZE, totalCount)}</span> de{' '}
                <span className="font-medium text-foreground">{totalCount}</span> transmissões
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="h-8 border-border text-xs text-muted-foreground hover:bg-muted"
                >
                  {t('common.previous')}
                </Button>
                <span className="font-medium text-foreground px-2">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page + 1) * PAGE_SIZE >= totalCount}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 border-border text-xs text-muted-foreground hover:bg-muted"
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

