"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Building2, AlertTriangle, PlugZap, Layers, Shield, Activity } from "lucide-react";
import { toast } from "sonner";
import { AdminConsumptionIntelligence } from "@/components/admin/admin-consumption-intelligence";

interface AdminMetrics {
  mrr: number;
  arr: number;
  totalSubscriptions: number;
  activeSubscriptionsCount: number;
  trialingSubscriptionsCount: number;
  pastDueSubscriptionsCount: number;
  canceledSubscriptionsCount: number;
  wabaConnectedCount: number;
  totalAccountsCount: number;
  totalContactsCount: number;
  totalFlowsCount: number;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (res.ok) {
        setMetrics(data.metrics);
      } else {
        toast.error(data.error || "Erro ao carregar dados de inteligência comercial.");
      }
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
      toast.error("Falha ao se conectar com a API analítica.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="py-12 text-center text-sm text-muted-foreground">Carregando painel de inteligência comercial e monitoramento...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Inteligência Comercial & Monitoramento Operacional
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe indicadores de receita recorrente (MRR/ARR), saúde das assinaturas, consumo do Flow Hub e status da API Meta WhatsApp.
        </p>
      </div>

      {/* Main Financial KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Receita Recorrente Mensal (MRR)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-primary">
              R$ {metrics?.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">Faturamento recorrente atual do Flow Hub</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Receita Anual Projetada (ARR)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {metrics?.arr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">MRR x 12 meses de projeção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assinaturas Ativas
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics?.activeSubscriptionsCount} <span className="text-xs font-normal text-muted-foreground">/ {metrics?.totalSubscriptions} totais</span>
            </div>
            <div className="pt-1 flex gap-1">
              <Badge variant="outline" className="text-[10px] text-blue-500 bg-blue-500/10 border-blue-500/20">{metrics?.trialingSubscriptionsCount} em Trial</Badge>
              {metrics?.pastDueSubscriptionsCount ? (
                <Badge variant="destructive" className="text-[10px]">{metrics.pastDueSubscriptionsCount} Inadimplente(s)</Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              WhatsApp Meta WABA Ativas
            </CardTitle>
            <PlugZap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics?.wabaConnectedCount} <span className="text-xs font-normal text-muted-foreground">contas de WhatsApp</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium pt-1">✓ API Oficial Cloud operando normalmente</p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Usage Indicators */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Empresas & Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{metrics?.totalAccountsCount}</div>
            <p className="text-xs text-muted-foreground pt-1">Tenants registrados na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Volume de Contatos Atendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{metrics?.totalContactsCount}</div>
            <p className="text-xs text-muted-foreground pt-1">Total de contatos em todas as empresas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Fluxos de Automação Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{metrics?.totalFlowsCount}</div>
            <p className="text-xs text-muted-foreground pt-1">Fluxos interativos ativos na plataforma</p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Consumption, Telemetry & AI Pricing Insights */}
      <div className="pt-6 border-t border-border">
        <AdminConsumptionIntelligence />
      </div>
    </div>
  );
}
