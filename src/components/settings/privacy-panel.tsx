"use client";

import React from "react";
import Link from "next/link";
import {
  Cookie,
  Lock,
  BarChart3,
  ShieldCheck,
  ExternalLink,
  FileText,
  Scale,
  Shield,
  Server,
  UserCheck,
  Mail,
  Download,
} from "lucide-react";
import { SettingsPanelHead } from "./settings-panel-head";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { useTranslation } from "@/hooks/use-translation";
import { CookiePreferencesTrigger } from "@/components/cookies/cookie-preferences-trigger";

export function PrivacyPanel() {
  const { preferences, isLoaded } = useCookieConsent();
  const { t } = useTranslation();

  const isAnalyticsAllowed = preferences?.analytics ?? false;

  return (
    <section className="max-w-3xl animate-in fade-in-50 duration-200 space-y-8">
      <SettingsPanelHead
        title={t("settings.privacy.title")}
        description={t("settings.privacy.description")}
        scope="account"
      />

      {/* Card de Status Atual do Consentimento */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("settings.privacy.cookieConsent")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("settings.privacy.lgpdRef")}
              </p>
            </div>
          </div>
          <CookiePreferencesTrigger variant="button">
            {t("settings.privacy.changePreferences")}
          </CookiePreferencesTrigger>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Lock className="size-4 text-emerald-500" />
              <span>{t("settings.privacy.necessaryCookies")}</span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
              {t("settings.privacy.alwaysActive")}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <BarChart3 className="size-4 text-primary" />
              <span>{t("settings.privacy.analyticsCookies")}</span>
            </div>
            {isLoaded ? (
              isAnalyticsAllowed ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  {t("settings.privacy.authorized")}
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                  {t("settings.privacy.blocked")}
                </span>
              )
            ) : (
              <span className="text-[11px] text-muted-foreground">{t("settings.privacy.loading")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Bloco 1: Central de Documentos Legais */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          {t("settings.privacy.legalDocsTitle")}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Link
            href="/privacy"
            target="_blank"
            className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="size-4 text-primary shrink-0" />
              <div>
                <span className="font-medium text-foreground block group-hover:underline">
                  {t("settings.privacy.privacyPolicy")}
                </span>
                <span className="text-[11px] text-muted-foreground">{t("settings.privacy.privacyPolicyDesc")}</span>
              </div>
            </div>
            <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary" />
          </Link>

          <Link
            href="/terms"
            target="_blank"
            className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <Scale className="size-4 text-purple-500 shrink-0" />
              <div>
                <span className="font-medium text-foreground block group-hover:underline">
                  {t("settings.privacy.termsOfUse")}
                </span>
                <span className="text-[11px] text-muted-foreground">{t("settings.privacy.termsOfUseDesc")}</span>
              </div>
            </div>
            <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary" />
          </Link>

          <Link
            href="/dpa"
            target="_blank"
            className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-medium text-foreground block group-hover:underline">
                  {t("settings.privacy.dpaAgreement")}
                </span>
                <span className="text-[11px] text-muted-foreground">{t("settings.privacy.dpaAgreementDesc")}</span>
              </div>
            </div>
            <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary" />
          </Link>

          <Link
            href="/security"
            target="_blank"
            className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="size-4 text-blue-500 shrink-0" />
              <div>
                <span className="font-medium text-foreground block group-hover:underline">
                  {t("settings.privacy.securityInfo")}
                </span>
                <span className="text-[11px] text-muted-foreground">{t("settings.privacy.securityInfoDesc")}</span>
              </div>
            </div>
            <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary" />
          </Link>

          <Link
            href="/subprocessadores"
            target="_blank"
            className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors flex items-center justify-between group sm:col-span-2"
          >
            <div className="flex items-center gap-2.5">
              <Server className="size-4 text-amber-500 shrink-0" />
              <div>
                <span className="font-medium text-foreground block group-hover:underline">
                  {t("settings.privacy.subprocessors")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {t("settings.privacy.subprocessorsDesc")}
                </span>
              </div>
            </div>
            <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary" />
          </Link>
        </div>
      </div>

      {/* Bloco 2: Seus Direitos LGPD (Autoatendimento) */}
      <div className="p-5 rounded-xl border border-border bg-card/40 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <UserCheck className="size-4 text-emerald-500" />
          {t("settings.privacy.rightsTitle")}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("settings.privacy.rightsDesc")}
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4 text-primary shrink-0" />
            <span>
              {t("settings.privacy.dpoOfficial")}{" "}
              <strong className="text-foreground">flowsystems@flowofc.com.br</strong>
            </span>
          </div>

          <Link
            href="/lgpd"
            target="_blank"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-xs shrink-0"
          >
            <Download className="size-3.5" />
            {t("settings.privacy.openLgpdRequest")}
          </Link>
        </div>
      </div>
    </section>
  );
}
