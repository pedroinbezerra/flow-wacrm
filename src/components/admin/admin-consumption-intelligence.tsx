"use client";

import { useEffect, useState } from "react";
import { Sparkles, DollarSign, Activity, AlertTriangle, ShieldAlert, Cpu, RefreshCw, Lightbulb, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIConfigButton } from "@/components/ai/ai-config-modal";
import { UpstashRedisCard } from "@/components/admin/upstash-redis-card";
import type { AICommercialInsight, SuperAdminConsumptionIntelligence } from "@/types";
import type { UpstashRedisMetrics } from "@/lib/rate-limit";

export function AdminConsumptionIntelligence() {
  const [intelligence, setIntelligence] = useState<SuperAdminConsumptionIntelligence | null>(null);
  const [redisMetrics, setRedisMetrics] = useState<UpstashRedisMetrics | null>(null);
  const [insights, setInsights] = useState<AICommercialInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/consumption");
      if (res.ok) {
        const data = await res.json();
        if (data.intelligence) {
          setIntelligence(data.intelligence);
        }
        if (data.redisMetrics) {
          setRedisMetrics(data.redisMetrics);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar inteligência de consumo:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    try {
      setGeneratingAI(true);
      const res = await fetch("/api/admin/consumption/ai-insights", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.insights) {
          setInsights(data.insights);
        }
      }
    } catch (err) {
      console.error("Erro ao gerar insights com IA:", err);
    } finally {
      setGeneratingAI(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  if (loading && !intelligence && !redisMetrics) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
          Carregando dados de telemetria operacional da plataforma...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Inteligência Operacional & Fair Use</h2>
          <p className="text-sm text-muted-foreground">
            Medição de custo de infraestrutura real e telemetria de consumo do Flow Hub
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchIntelligence} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <AIConfigButton label="Configuração de IA" />

          <Button
            size="sm"
            onClick={generateAIInsights}
            disabled={generatingAI}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-sm"
          >
            <Sparkles className={`h-4 w-4 mr-2 ${generatingAI ? "animate-spin" : ""}`} />
            {generatingAI ? "Gerando Insights..." : "Analisar com IA"}
          </Button>
        </div>
      </div>

      {/* Upstash Redis Telemetry Card */}
      <UpstashRedisCard metrics={redisMetrics} onRefresh={fetchIntelligence} loading={loading} />

      {/* Cards de Métricas Chave */}
      {intelligence && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Contas Monitoradas</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-2">{intelligence.total_accounts_monitored}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Medição de telemetria ativa</p>
          </Card>

          <Card className="p-4 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Créditos Consumidos (30d)</span>
              <Cpu className="h-4 w-4 text-violet-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{intelligence.total_credits_consumed_30d.toLocaleString("pt-BR")}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Créditos computacionais totais</p>
          </Card>

          <Card className="p-4 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Custo Estimado Infra (30d)</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2">R$ {intelligence.total_estimated_cost_30d.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Custo direto acumulado</p>
          </Card>

          <Card className="p-4 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Custo Médio / Empresa</span>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-2">R$ {intelligence.average_cost_per_account.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Baseline por tenant ativo</p>
          </Card>
        </div>
      )}

      {/* Seção de Insights de IA para Precificação & Cotas */}
      {insights.length > 0 && (
        <Card className="border-violet-500/30 bg-violet-500/5 dark:bg-violet-950/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <CardTitle className="text-base font-bold text-violet-950 dark:text-violet-200">
                AI Commercial & Pricing Insights
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Recomendações estratégicas geradas pelo assistente de IA com base na telemetria
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-card border border-border space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{insight.title}</span>
                  <Badge
                    variant={insight.severity === "critical" ? "destructive" : insight.severity === "warning" ? "secondary" : "outline"}
                    className="text-[10px] uppercase"
                  >
                    {insight.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{insight.summary}</p>

                <div className="pt-2 border-t border-border/50 text-xs">
                  <span className="font-semibold text-foreground">Ação Recomendada: </span>
                  <span className="text-muted-foreground">{insight.recommended_action}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Impacto Estimado: {insight.estimated_financial_impact}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alertas de Fair Use (Consumo Atípico) */}
      {intelligence && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base font-bold">Monitor de Fair Use (Uso Atípico)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Empresas cujo consumo de créditos desvia significativamente da média da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {intelligence.fair_use_flags.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-4 text-center">
                Nenhuma anomalia de uso detectada. Todas as contas estão operando dentro das margens normais.
              </p>
            ) : (
              <div className="space-y-3">
                {intelligence.fair_use_flags.map((flag) => (
                  <div
                    key={flag.account_id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-muted/40 border border-border gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{flag.account_name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {flag.plan_name}
                        </Badge>
                        <Badge
                          variant={flag.status === "critical_fair_use" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {flag.status === "critical_fair_use" ? "Fair Use Crítico" : "Consumo Alto"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Consumo: {flag.total_credits_used.toLocaleString("pt-BR")} cr. (Franquia: {flag.monthly_allowance_credits.toLocaleString("pt-BR")}) • Z-Score: {flag.z_score}
                      </p>
                    </div>

                    <Button size="sm" variant="outline" className="text-xs">
                      <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                      Sugerir Upgrade Enterprise
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
