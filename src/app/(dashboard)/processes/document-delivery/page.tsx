'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, PauseOctagon, Play, FileText, CheckCircle2, Clock, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { DocumentDeliveryProcess } from '@/lib/document-delivery/types';

export default function DocumentDeliveryProcessesPage() {
  const [processes, setProcesses] = useState<DocumentDeliveryProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchProcesses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/processes/document-delivery');
      if (res.ok) {
        const data = await res.json();
        setProcesses(data.processes || []);
      }
    } catch (err) {
      console.error('Failed to fetch processes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/processes/document-delivery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setProcesses((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleEmergencyPauseAll = async () => {
    try {
      for (const p of processes.filter((proc) => proc.status === 'active')) {
        await handleToggleStatus(p.id, 'active');
      }
    } catch (err) {
      console.error('Failed emergency pause:', err);
    }
  };

  const totalDelivered = processes.reduce((acc, p) => acc + (p.success_count || 0), 0);
  const totalPendencies = processes.reduce((acc, p) => acc + (p.pendency_count || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-emerald-500" />
            Entrega Automática de Documentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Processo pronto para orquestrar e enviar faturas, holerites e comprovantes sem armazenar os arquivos permanentemente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmergencyPauseAll}
            className="gap-2 text-xs font-semibold"
            title="Pausa de emergência em 1 clique"
          >
            <PauseOctagon className="h-4 w-4" />
            Pausa de Emergência
          </Button>

          <Link href="/processes/document-delivery/new">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              Novo Processo
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border space-y-2 bg-card">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documentos Entregues</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalDelivered}</span>
            <CheckCircle2 className="h-6 w-6 text-emerald-500/40" />
          </div>
        </Card>

        <Card className="p-5 border space-y-2 bg-card">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendentes de Revisão</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalPendencies}</span>
            <Clock className="h-6 w-6 text-amber-500/40" />
          </div>
        </Card>

        <Card className="p-5 border space-y-2 bg-card">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa de Confiança Médio</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">98.4%</span>
            <ShieldCheck className="h-6 w-6 text-blue-500/40" />
          </div>
        </Card>

        <Card className="p-5 border space-y-2 bg-card">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Economia Operacional</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">~{Math.round(totalDelivered * 4.5)} min</span>
            <Sparkles className="h-6 w-6 text-violet-500/40" />
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b pb-2">
        <Link href="/processes/document-delivery" className="font-semibold text-sm text-primary border-b-2 border-primary pb-2">
          Meus Processos ({processes.length})
        </Link>
        <Link href="/processes/document-delivery/pendencies" className="font-medium text-sm text-muted-foreground hover:text-foreground pb-2 flex items-center gap-1.5">
          Fila de Pendências
          {totalPendencies > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {totalPendencies}
            </span>
          )}
        </Link>
      </div>

      {/* Process List */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Carregando processos...
        </div>
      ) : processes.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-muted/20 border border-dashed rounded-xl p-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-semibold text-lg text-foreground">Nenhum processo configurado</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Crie seu primeiro processo de entrega automática de documentos em menos de 2 minutos utilizando o assistente guiado.
            </p>
          </div>
          <Link href="/processes/document-delivery/new">
            <Button className="gap-2 font-semibold">
              <Plus className="h-4 w-4" />
              Criar Primeiro Processo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processes.map((proc) => (
            <Card key={proc.id} className="p-6 border space-y-4 hover:shadow-md transition-all bg-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground leading-tight">{proc.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    Origem: <b>{proc.source_type.replace('_', ' ')}</b> — Pasta: <code>{proc.folder_name || 'Raiz'}</code>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={proc.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
                    {proc.status === 'active' ? 'Ativo' : 'Pausado'}
                  </Badge>
                  <Switch
                    checked={proc.status === 'active'}
                    onCheckedChange={() => handleToggleStatus(proc.id, proc.status)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 bg-muted/30 rounded-lg text-center text-xs">
                <div>
                  <span className="text-muted-foreground block">Execuções</span>
                  <span className="font-bold text-foreground">{proc.execution_count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Entregues</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{proc.success_count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Pendências</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{proc.pendency_count}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs border-t">
                <span className="text-muted-foreground">
                  Canal: <strong className="uppercase">{proc.delivery_channels.join(', ')}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Link href={`/processes/document-delivery/${proc.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Ver Trilha & Logs
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
