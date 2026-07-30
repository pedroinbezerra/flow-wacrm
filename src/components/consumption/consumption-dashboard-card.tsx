"use client";

import { useEffect, useState } from "react";
import { Cpu, Zap, MessageSquare, Bot, FileText, Activity, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AccountConsumptionSummary, ResourceType } from "@/types";

const RESOURCE_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  whatsapp_message: { label: "Mensagens WhatsApp", icon: MessageSquare },
  ai_execution: { label: "Execuções de IA", icon: Bot },
  audio_transcription: { label: "Transcrição de Áudio", icon: Zap },
  automation_execution: { label: "Automação de Fluxo", icon: Activity },
  webhook_dispatch: { label: "Eventos Webhook", icon: Cpu },
  pdf_generation: { label: "Geração de PDF", icon: FileText },
  ocr_scan: { label: "Digitalização OCR", icon: FileText },
};

export interface ConsumptionDashboardCardProps {
  initialSummary?: AccountConsumptionSummary | null;
}

export function ConsumptionDashboardCard({ initialSummary }: ConsumptionDashboardCardProps) {
  const [summary, setSummary] = useState<AccountConsumptionSummary | null>(initialSummary || null);
  const [loading, setLoading] = useState(!initialSummary);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/consumption/summary");
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar resumo de consumo computacional:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSummary) {
      fetchSummary();
    }
  }, [initialSummary]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
          Carregando telemetria de consumo computacional...
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const percentage = summary.usage_percentage;
  const isHighUsage = percentage >= 80;
  const isExceeded = percentage >= 100;

  return (
    <Card className="w-full border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Franquia Computacional Mensal</CardTitle>
            <Badge variant="outline" className="text-xs bg-accent/10 border-accent/20 text-accent-foreground">
              Dimensão Operacional
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Consumo real de infraestrutura em Créditos Computacionais ({summary.plan_name})
          </CardDescription>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={fetchSummary} title="Atualizar consumo">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Barra de Progresso da Franquia */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold tracking-tight">
                {summary.total_credits_used.toLocaleString("pt-BR")}
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                / {summary.monthly_allowance_credits.toLocaleString("pt-BR")} créditos
              </span>
            </div>
            <span className={`text-xs font-semibold ${isExceeded ? "text-red-500" : isHighUsage ? "text-amber-500" : "text-emerald-500"}`}>
              {percentage}% utilizado
            </span>
          </div>

          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isExceeded ? "bg-red-500" : isHighUsage ? "bg-amber-500" : "bg-gradient-to-r from-emerald-500 to-teal-400"
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>

          {isHighUsage && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>
                {isExceeded
                  ? "Sua conta ultrapassou a franquia base estimada. O serviço continuará ativo em modo Fair Use."
                  : "Consumo elevado de franquia computacional este mês."}
              </span>
            </div>
          )}
        </div>

        {/* Detalhamento por Categoria de Recurso */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Detalhamento por Recurso Computacional
          </h4>

          {summary.breakdown_by_resource.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Nenhum consumo computacional registrado neste período.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summary.breakdown_by_resource.map((item) => {
                const meta = RESOURCE_LABELS[item.resource_type] || {
                  label: item.resource_type,
                  icon: Activity,
                };
                const IconComponent = meta.icon;

                return (
                  <div
                    key={item.resource_type}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-md bg-background border border-border">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{meta.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.total_quantity.toLocaleString("pt-BR")} requisição(ões)
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">
                        {item.total_credits.toLocaleString("pt-BR")} cr.
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ~ R$ {item.total_estimated_cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
