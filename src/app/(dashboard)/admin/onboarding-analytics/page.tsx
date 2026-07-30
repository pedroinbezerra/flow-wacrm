"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowDownRight,
  BarChart3,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { OnboardingAnalyticsSummary, OnboardingStepKey } from "@/types";

const STEP_NAMES: Record<OnboardingStepKey, string> = {
  connect_whatsapp: "Conectar WhatsApp",
  create_first_flow: "Criar 1º Fluxo",
  import_contacts: "Importar Contatos",
  create_first_campaign: "Criar 1ª Campanha",
  send_first_campaign: "Enviar 1ª Campanha",
  invite_team: "Convidar Equipe",
};

import { useTranslation } from "@/hooks/use-translation";

export default function OnboardingAnalyticsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<OnboardingAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STEP_NAMES: Record<OnboardingStepKey, string> = {
    connect_whatsapp: t("onboarding.steps.connect_whatsapp.title"),
    create_first_flow: t("onboarding.steps.create_first_flow.title"),
    import_contacts: t("onboarding.steps.import_contacts.title"),
    create_first_campaign: t("onboarding.steps.create_first_campaign.title"),
    send_first_campaign: t("onboarding.steps.send_first_campaign.title"),
    invite_team: t("onboarding.steps.invite_team.title"),
  };

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/onboarding-analytics");
        if (!res.ok) {
          throw new Error(t("onboarding.analytics.errorTitle"));
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || t("errors.serverError"));
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [t]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t("onboarding.analytics.loadingMetrics")}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive">
        <p className="font-semibold">{t("onboarding.analytics.errorTitle")}</p>
        <p className="text-xs opacity-90 mt-1">{error}</p>
      </div>
    );
  }

  // Prepara dados para o gráfico de funil / etapas
  const stepChartData = Object.entries(STEP_NAMES).map(([key, name]) => {
    const stats = data.step_breakdown?.[key as OnboardingStepKey] || {
      total_started: 0,
      completed: 0,
      skipped: 0,
    };
    return {
      name,
      completed: stats.completed,
      skipped: stats.skipped,
      pending: Math.max(0, data.started_onboarding - stats.completed - stats.skipped),
    };
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {t("onboarding.analytics.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("onboarding.analytics.subtitle")}
          </p>
        </div>
      </div>

      {/* Cartões de Indicadores Chave */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t("onboarding.analytics.startedCount")}</span>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.started_onboarding}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("onboarding.analytics.registeredTotal", { total: data.total_users })}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t("onboarding.analytics.completedCount")}</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{data.completed_onboarding}</p>
          <p className="text-xs text-emerald-500 mt-1 font-medium">
            {t("onboarding.analytics.conversionRate", { rate: data.completion_rate })}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t("onboarding.analytics.avgSetupTime")}</span>
            <Clock className="h-5 w-5 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">~15 min</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("onboarding.analytics.avgSetupDesc")}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t("onboarding.analytics.trialConversion")}</span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">+38%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("onboarding.analytics.trialConversionDesc")}
          </p>
        </div>
      </div>

      {/* Gráfico de Adoção por Etapa */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t("onboarding.analytics.stepCompletionChartTitle")}
        </h3>
        <p className="text-xs text-muted-foreground mb-6">
          {t("onboarding.analytics.stepCompletionChartSubtitle")}
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stepChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="completed" name={t("onboarding.analytics.chartCompleted")} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="skipped" name={t("onboarding.analytics.chartSkipped")} fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
