"use client";

import { Database, Activity, HardDrive, Zap, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, RefreshCw, KeyRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UpstashRedisMetrics } from "@/lib/rate-limit";

interface UpstashRedisCardProps {
  metrics: UpstashRedisMetrics | null;
  onRefresh?: () => void;
  loading?: boolean;
}

export function UpstashRedisCard({ metrics, onRefresh, loading }: UpstashRedisCardProps) {
  if (!metrics) {
    return null;
  }

  const isConnected = metrics.status === "connected";
  const isFallback = metrics.status === "fallback_in_memory";

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isConnected ? "bg-emerald-500/10 text-emerald-500" : isFallback ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"}`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Rate Limit & Upstash Redis
                {isConnected && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" /> Conectado (Upstash Redis REST)
                  </Badge>
                )}
                {isFallback && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" /> Fallback em Memória (Node Map)
                  </Badge>
                )}
                {metrics.status === "error" && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <ShieldAlert className="h-3 w-3" /> Erro de Conexão
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {isConnected
                  ? "Monitoramento em tempo real de comandos, consumo de memória e operações/seg no Upstash Redis"
                  : "Variáveis de ambiente UPSTASH_REDIS_REST_URL/TOKEN não detectadas. Limitação operando em memória."}
              </CardDescription>
            </div>
          </div>

          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading} className="h-8 text-xs self-end sm:self-auto">
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Atualizar Métricas
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {isFallback && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <KeyRound className="h-4 w-4 text-amber-500" />
              <span>Como ativar o Upstash Redis em Produção (Vercel / Multi-instância):</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Para evitar que requisições paralelas distribuídas entre instâncias serverless ultrapassem a cota por usuário, defina no seu arquivo <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px]">.env.local</code> ou no painel da Vercel:
            </p>
            <div className="font-mono text-[11px] bg-background/80 p-2.5 rounded-lg border border-border/50 select-all space-y-1">
              <div>UPSTASH_REDIS_REST_URL=https://...upstash.io</div>
              <div>UPSTASH_REDIS_REST_TOKEN=AX...</div>
            </div>
          </div>
        )}

        {metrics.error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Erro ao consultar API do Upstash: </span>
              {metrics.error}
            </div>
          </div>
        )}

        {/* Grid de Métricas do Redis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Comandos Processados */}
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total de Comandos</span>
              <Activity className="h-4 w-4 text-violet-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {metrics.totalCommandsProcessed !== undefined ? metrics.totalCommandsProcessed.toLocaleString("pt-BR") : "N/A"}
            </div>
            <p className="text-[11px] text-muted-foreground">Comandos Redis executados</p>
          </div>

          {/* Uso de Memória */}
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Uso de Memória</span>
              <HardDrive className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{metrics.usedMemory || "N/A"}</div>
            <p className="text-[11px] text-muted-foreground">Alocação de memória RAM atômica</p>
          </div>

          {/* Operações por Segundo */}
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Ops / Segundo</span>
              <Zap className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {metrics.instantaneousOpsPerSec !== undefined ? `${metrics.instantaneousOpsPerSec} ops/s` : "N/A"}
            </div>
            <p className="text-[11px] text-muted-foreground">Vazão instantânea de requisições</p>
          </div>

          {/* DB Size / Chaves de Rate Limit */}
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Chaves Ativas (DB Size)</span>
              <Cpu className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {metrics.dbSize !== undefined ? metrics.dbSize.toLocaleString("pt-BR") : "N/A"}
            </div>
            <p className="text-[11px] text-muted-foreground">Janelas de rate limit ativas</p>
          </div>
        </div>

        {/* Detalhes de Cache & Keyspace (se disponível) */}
        {isConnected && (metrics.keyspaceHits !== undefined || metrics.keyspaceMisses !== undefined) && (
          <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-medium text-foreground">Keyspace Hits:</span>{" "}
                {metrics.keyspaceHits?.toLocaleString("pt-BR") ?? 0}
              </div>
              <div>
                <span className="font-medium text-foreground">Keyspace Misses:</span>{" "}
                {metrics.keyspaceMisses?.toLocaleString("pt-BR") ?? 0}
              </div>
            </div>
            <div className="text-[11px] italic">
              Provedor: Upstash Redis Global Serverless
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
