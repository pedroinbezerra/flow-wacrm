'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Play, RefreshCw, FileText, ShieldCheck, Sparkles, Folder, CheckCircle } from 'lucide-react';
import { AuditLogTable } from '@/components/document-delivery/audit-log-table';
import { DocumentDeliveryProcess, DocumentDeliveryAuditLog } from '@/lib/document-delivery/types';

export default function DocumentDeliveryProcessDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [process, setProcess] = useState<DocumentDeliveryProcess | null>(null);
  const [logs, setLogs] = useState<DocumentDeliveryAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchDetailAndLogs = async () => {
    try {
      setIsLoading(true);
      const [procRes, logsRes] = await Promise.all([
        fetch(`/api/processes/document-delivery/${id}`),
        fetch(`/api/processes/document-delivery/logs?process_id=${id}&limit=50`),
      ]);

      if (procRes.ok) {
        const procData = await procRes.json();
        setProcess(procData.process);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch process detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetailAndLogs();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!process) return;
    const nextStatus = process.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/processes/document-delivery/${process.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setProcess((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleTriggerSync = async () => {
    if (!process) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/processes/document-delivery/${process.id}/run`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchDetailAndLogs();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Carregando detalhes do processo...
      </div>
    );
  }

  if (!process) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground">Processo não encontrado.</p>
        <Link href="/processes/document-delivery">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Link href="/processes/document-delivery">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{process.name}</h1>
              <Badge variant="outline" className={process.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
                {process.status === 'active' ? 'Ativo' : 'Pausado'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Origem: <b>{process.source_type.replace('_', ' ')}</b> — Pasta: <code>{process.folder_name || 'Raiz'}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border px-3 py-1.5 rounded-lg bg-card text-xs">
            <span className="text-muted-foreground">Status:</span>
            <Switch checked={process.status === 'active'} onCheckedChange={handleToggleStatus} />
          </div>

          <Button
            size="sm"
            onClick={handleTriggerSync}
            disabled={isSyncing || process.status === 'paused'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Executar Sincronização'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border text-center">
          <span className="text-xs text-muted-foreground uppercase">Total Execuções</span>
          <p className="text-xl font-bold text-foreground mt-1">{process.execution_count}</p>
        </Card>
        <Card className="p-4 border text-center">
          <span className="text-xs text-muted-foreground uppercase">Documentos Entregues</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{process.success_count}</p>
        </Card>
        <Card className="p-4 border text-center">
          <span className="text-xs text-muted-foreground uppercase">Pendências Geradas</span>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{process.pendency_count}</p>
        </Card>
        <Card className="p-4 border text-center">
          <span className="text-xs text-muted-foreground uppercase">Limite Mín. Confiança</span>
          <p className="text-xl font-bold text-foreground mt-1">{Math.round(process.confidence_threshold * 100)}%</p>
        </Card>
      </div>

      {/* Audit Log Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Trilha de Auditoria & Histórico de Execução (FH-11.06 / FH-53.10)
          </h2>
          <Button variant="outline" size="sm" onClick={fetchDetailAndLogs} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar Rastro
          </Button>
        </div>

        <AuditLogTable logs={logs} isLoading={isLoading} />
      </div>
    </div>
  );
}
