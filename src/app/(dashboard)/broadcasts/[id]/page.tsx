'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Broadcast, BroadcastRecipient, RecipientStatus } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Users,
  Send,
  CheckCheck,
  Eye,
  AlertCircle,
  MessageCircle,
  Filter,
  Download,
  ChevronDown,
  Trash2,
  Copy,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getBroadcastStatus,
  getRecipientStatus,
} from '@/lib/broadcast-status';
import { useCan } from '@/hooks/use-can';

interface StatCardProps {
  label: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, total, icon, color }: StatCardProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 transition-all hover:border-border">
      <div className="flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="inline-flex items-center rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value.toLocaleString()}</p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

interface FunnelStep {
  label: string;
  value: number;
  color: string;
}

function FunnelChart({ title, steps }: { title: string; steps: FunnelStep[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      <div className="space-y-3">
        {steps.map((step) => {
          const pctOfMax = Math.max(3, Math.round((step.value / max) * 100));
          const pctOfSent =
            steps[0].value > 0
              ? Math.round((step.value / steps[0].value) * 100)
              : 0;
          return (
            <div key={step.label} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                {step.label}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted/60">
                <div
                  className={`h-full rounded-full ${step.color} transition-all duration-500`}
                  style={{ width: `${pctOfMax}%` }}
                />
              </div>
              <div className="w-28 shrink-0 text-right font-mono text-xs flex items-center justify-end gap-1.5">
                <span className="font-bold text-foreground">{step.value.toLocaleString()}</span>
                <span className="text-[11px] text-muted-foreground">({pctOfSent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const RECIPIENT_PAGE_SIZE = 25;

const RECIPIENT_STATUSES: readonly RecipientStatus[] = [
  'pending',
  'sent',
  'delivered',
  'read',
  'replied',
  'failed',
];

function toCsv(rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return rows.map((r) => r.map(escape).join(',')).join('\n');
}

function downloadBlob(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function BroadcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const canSend = useCan('send-messages');
  const broadcastId = params.id as string;

  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [recipients, setRecipients] = useState<BroadcastRecipient[]>([]);
  const [page, setPage] = useState(0);
  const [totalRecipientsCount, setTotalRecipientsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RecipientStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Debounce search query for server-side execution
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch initial Broadcast metadata
  useEffect(() => {
    async function fetchBroadcast() {
      try {
        const supabase = createClient();
        const { data: bc, error: bcError } = await supabase
          .from('broadcasts')
          .select('*')
          .eq('id', broadcastId)
          .single();

        if (bcError) throw bcError;
        setBroadcast(bc);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('broadcasts.failedLoad'));
      } finally {
        setLoading(false);
      }
    }

    void fetchBroadcast();
  }, [broadcastId, t]);

  // Server-Side Lazy Load & Pagination for Recipients with ilike search
  useEffect(() => {
    async function fetchRecipients() {
      setLoadingRecipients(true);
      try {
        const supabase = createClient();
        const from = page * RECIPIENT_PAGE_SIZE;
        const to = from + RECIPIENT_PAGE_SIZE - 1;

        const selectQuery = debouncedSearch.trim()
          ? '*, contact:contacts!inner(*)'
          : '*, contact:contacts(*)';

        let query = supabase
          .from('broadcast_recipients')
          .select(selectQuery, { count: 'exact' })
          .eq('broadcast_id', broadcastId);

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        if (debouncedSearch.trim()) {
          const term = `%${debouncedSearch.trim()}%`;
          query = query.or(`contact.name.ilike.${term},contact.phone.ilike.${term}`);
        }

        const { data: recs, count, error: recsError } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (recsError) throw recsError;
        setRecipients(recs ?? []);
        if (count !== null) setTotalRecipientsCount(count);
      } catch (err) {
        console.error('Failed to load recipients:', err);
      } finally {
        setLoadingRecipients(false);
      }
    }

    void fetchRecipients();
  }, [broadcastId, page, statusFilter, debouncedSearch]);

  const totalPages = Math.ceil(totalRecipientsCount / RECIPIENT_PAGE_SIZE) || 1;

  async function handleExport() {
    if (!broadcast || exporting) return;
    setExporting(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('broadcast_recipients')
        .select('*, contact:contacts(*)')
        .eq('broadcast_id', broadcastId)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: allRecs, error: expErr } = await query;
      if (expErr) throw expErr;

      const header = [
        t('broadcasts.export.contact'),
        t('broadcasts.export.phone'),
        t('common.status'),
        t('broadcasts.export.sentAt'),
        t('broadcasts.export.deliveredAt'),
        t('broadcasts.export.readAt'),
        t('broadcasts.export.repliedAt'),
        t('broadcasts.export.error'),
      ];
      const rows = (allRecs ?? []).map((r) => [
        r.contact?.name ?? '',
        r.contact?.phone ?? '',
        r.status,
        r.sent_at ?? '',
        r.delivered_at ?? '',
        r.read_at ?? '',
        r.replied_at ?? '',
        r.error_message ?? '',
      ]);
      const csv = toCsv([header, ...rows]);
      const safeName = broadcast.name.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
      downloadBlob(`broadcast-${safeName}-${broadcastId.slice(0, 8)}.csv`, csv);
    } catch (err) {
      toast.error(t('broadcasts.failedExport') || 'Erro ao exportar CSV');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error: delErr } = await supabase
      .from('broadcasts')
      .delete()
      .eq('id', broadcastId);
    setDeleting(false);
    if (delErr) {
      toast.error(t('broadcasts.failedDelete'));
      return;
    }
    toast.success(t('broadcasts.successDelete'));
    router.push('/broadcasts');
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !broadcast) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? t('broadcasts.notFound')}</p>
        <Button variant="outline" onClick={() => router.push('/broadcasts')}>
          {t('broadcasts.backToBroadcasts')}
        </Button>
      </div>
    );
  }

  const status = getBroadcastStatus(broadcast.status);

  const funnelSteps: FunnelStep[] = [
    { label: t('broadcasts.sent'), value: broadcast.sent_count, color: 'bg-primary' },
    { label: t('broadcasts.delivered'), value: broadcast.delivered_count, color: 'bg-teal-500' },
    { label: t('broadcasts.read'), value: broadcast.read_count, color: 'bg-blue-500' },
    { label: t('broadcasts.replied'), value: broadcast.replied_count, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/broadcasts')}
            className="border-border"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{broadcast.name}</h1>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${status.classes}`}
              >
                {status.label}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span>{t('broadcasts.template')}: {broadcast.template_name}</span>
              <span>-</span>
              <span>
                {t('broadcasts.createdDate', {
                  date: new Date(broadcast.created_at).toLocaleDateString(),
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clone Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/broadcasts/new?cloneFrom=${broadcast.id}`)}
            className="border-border text-foreground hover:bg-muted"
          >
            <Copy className="h-3.5 w-3.5" />
            {t('broadcasts.duplicateBroadcast')}
          </Button>

          {/* Delete Action */}
          {confirmDelete ? (
            <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm">
              <span className="text-red-700 dark:text-red-300">{t('broadcasts.deleteConfirm')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="h-7 border-border bg-transparent text-muted-foreground hover:bg-muted"
              >
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                disabled={deleting || !canSend}
                className="h-7 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? t('broadcasts.deleting') : t('common.confirm')}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={broadcast.status === 'sending'}
              onClick={() => setConfirmDelete(true)}
              title={
                broadcast.status === 'sending'
                  ? t('broadcasts.cantDeleteWhileSending')
                  : t('broadcasts.deleteTitle')
              }
              className="border-destructive/30 bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats — Adaptive Dual-Theme Contrast */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label={t('broadcasts.statTotalRecipients')}
          value={broadcast.total_recipients}
          total={broadcast.total_recipients}
          icon={<Users className="h-4 w-4" />}
          color="bg-muted text-muted-foreground"
        />
        <StatCard
          label={t('broadcasts.statSent')}
          value={broadcast.sent_count}
          total={broadcast.total_recipients}
          icon={<Send className="h-4 w-4" />}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label={t('broadcasts.statDelivered')}
          value={broadcast.delivered_count}
          total={broadcast.total_recipients}
          icon={<CheckCheck className="h-4 w-4" />}
          color="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        />
        <StatCard
          label={t('broadcasts.statRead')}
          value={broadcast.read_count}
          total={broadcast.total_recipients}
          icon={<Eye className="h-4 w-4" />}
          color="bg-blue-500/10 text-blue-700 dark:text-blue-300"
        />
        <StatCard
          label={t('broadcasts.statReplied')}
          value={broadcast.replied_count}
          total={broadcast.total_recipients}
          icon={<MessageCircle className="h-4 w-4" />}
          color="bg-purple-500/10 text-purple-700 dark:text-purple-300"
        />
        <StatCard
          label={t('broadcasts.statFailed')}
          value={broadcast.failed_count}
          total={broadcast.total_recipients}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-red-500/10 text-red-700 dark:text-red-300"
        />
      </div>

      <FunnelChart title={t('broadcasts.funnelTitle')} steps={funnelSteps} />

      {/* Recipients Table */}
      <div className="rounded-xl border border-border bg-card space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-foreground">
            {t('broadcasts.recipients')} ({totalRecipientsCount})
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Recipient Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('broadcasts.searchRecipientsPlaceholder')}
                className="h-8 w-60 sm:w-64 pl-8 text-xs border-border bg-muted text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Filter Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-border text-muted-foreground hover:bg-muted"
                  />
                }
              >
                <Filter className="h-3.5 w-3.5" />
                {statusFilter === 'all'
                  ? t('broadcasts.allStatuses')
                  : getRecipientStatus(statusFilter).label}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-border bg-popover">
                <DropdownMenuItem
                  onClick={() => {
                    setPage(0);
                    setStatusFilter('all');
                  }}
                  className={
                    statusFilter === 'all' ? 'text-primary font-medium' : 'text-popover-foreground'
                  }
                >
                  {t('broadcasts.allStatuses')}
                </DropdownMenuItem>
                {RECIPIENT_STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => {
                      setPage(0);
                      setStatusFilter(s);
                    }}
                    className={
                      statusFilter === s
                        ? 'text-primary font-medium'
                        : 'text-popover-foreground'
                    }
                  >
                    {getRecipientStatus(s).label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export CSV Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={recipients.length === 0 || exporting}
              className="h-8 text-xs border-border text-muted-foreground hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? t('common.exporting') || 'Exportando…' : t('broadcasts.exportCsv')}
            </Button>
          </div>
        </div>

        {loadingRecipients && recipients.length === 0 ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {t('broadcasts.sampleAudienceEmpty')}
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">{t('broadcasts.export.contact')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('broadcasts.export.phone')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('common.status')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('broadcasts.export.sentAt')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('broadcasts.export.deliveredAt')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('broadcasts.export.readAt')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('broadcasts.export.error')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient) => {
                    const rStatus = getRecipientStatus(recipient.status);
                    return (
                      <TableRow key={recipient.id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          {recipient.contact?.name ?? t('contacts.unnamed')}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {recipient.contact?.phone ?? '-'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${rStatus.classes}`}
                          >
                            {rStatus.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {recipient.sent_at
                            ? new Date(recipient.sent_at).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {recipient.delivered_at
                            ? new Date(recipient.delivered_at).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {recipient.read_at
                            ? new Date(recipient.read_at).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-red-600 dark:text-red-400">
                          {recipient.error_message ?? '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Server-Side Pagination Bar for Recipients */}
            {totalRecipientsCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
                <span>
                  Exibindo <span className="font-medium text-foreground">{page * RECIPIENT_PAGE_SIZE + 1}</span>-
                  <span className="font-medium text-foreground">{Math.min((page + 1) * RECIPIENT_PAGE_SIZE, totalRecipientsCount)}</span> de{' '}
                  <span className="font-medium text-foreground">{totalRecipientsCount}</span> destinatários
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0 || loadingRecipients}
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
                    disabled={(page + 1) * RECIPIENT_PAGE_SIZE >= totalRecipientsCount || loadingRecipients}
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
    </div>
  );
}


