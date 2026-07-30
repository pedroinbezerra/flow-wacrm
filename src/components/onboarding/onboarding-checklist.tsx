"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import type { OnboardingJourneySummary, OnboardingStepKey } from "@/types";

import { useTranslation } from "@/hooks/use-translation";

interface OnboardingChecklistProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function OnboardingChecklist({
  open,
  onOpenChange,
}: OnboardingChecklistProps) {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<OnboardingJourneySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Carrega preferência do localStorage
  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem("flow_onboarding_checklist_dismissed") === "true";
      setDismissed(isDismissed);
    } catch (_e) {
      // Ignora erro de acesso ao localStorage
    }
  }, []);

  // Sincroniza se a prop `open` for passada externamente
  useEffect(() => {
    if (typeof open === "boolean") {
      setDismissed(!open);
    }
  }, [open]);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/progress");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (_e) {
      // Ignorar erros na busca do checklist
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleDismiss = () => {
    try {
      localStorage.setItem("flow_onboarding_checklist_dismissed", "true");
    } catch (_e) {}
    setDismissed(true);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  if (dismissed || loading || !summary) return null;

  return (
    <div
      id="tour-checklist"
      className="mb-6 overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-sm backdrop-blur transition-all"
    >
      {/* Header do Widget */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{t("onboarding.title")}</h3>
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {t("onboarding.percentageCompleted", { percentage: summary.percentage })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.is_fully_configured
                ? t("onboarding.fullyConfigured")
                : t("onboarding.stepsProgress", {
                    completed: summary.completed_steps,
                    total: summary.total_steps,
                  })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={t("onboarding.closeChecklist")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Barra de Progresso Visual */}
      <div className="h-1.5 w-full bg-muted/60">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${summary.percentage}%` }}
        />
      </div>

      {/* Lista de Passos */}
      {expanded && (
        <div className="p-5">
          {summary.is_fully_configured && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
              <div>
                <p className="font-semibold text-sm">{t("onboarding.fullyConfiguredBannerTitle")}</p>
                <p className="text-xs opacity-90">
                  {t("onboarding.fullyConfiguredBannerDesc")}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.steps.map((step) => {
              const stepTitleKey = `onboarding.steps.${step.step_key}.title`;
              const stepDescKey = `onboarding.steps.${step.step_key}.description`;

              return (
                <div
                  key={step.step_key}
                  className={`group relative flex flex-col justify-between rounded-lg border p-4 transition-all ${
                    step.completed
                      ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                      : "border-border/60 bg-background/50 hover:border-primary/40 hover:bg-accent/40"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-foreground">{t(stepTitleKey)}</h4>
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {t(stepDescKey)}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between border-t border-border/30">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {step.completed ? t("onboarding.completed") : t("onboarding.pending")}
                    </span>
                    {!step.completed && (
                      <Link
                        href={step.action_url}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        {t("onboarding.configure")}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
