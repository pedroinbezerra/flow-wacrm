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
import { CookiePreferencesTrigger } from "@/components/cookies/cookie-preferences-trigger";

export function PrivacyPanel() {
  const { preferences, isLoaded } = useCookieConsent();

  const isAnalyticsAllowed = preferences?.analytics ?? false;

  return (
    <section className="max-w-3xl animate-in fade-in-50 duration-200 space-y-8">
      <SettingsPanelHead
        title="Privacidade, Governança e LGPD"
        description="Consulte os documentos legais, gerencie suas preferências de consentimento de cookies e exercite seus direitos de titular."
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
                Seu Consentimento de Cookies
              </h3>
              <p className="text-xs text-muted-foreground">
                LGPD (Lei nº 13.709/2018) — FLOW SYSTEMS LTDA
              </p>
            </div>
          </div>
          <CookiePreferencesTrigger variant="button">
            Alterar Preferências
          </CookiePreferencesTrigger>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Lock className="size-4 text-emerald-500" />
              <span>Cookies Necessários</span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
              Sempre Ativos
            </span>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <BarChart3 className="size-4 text-primary" />
              <span>Cookies de Análise</span>
            </div>
            {isLoaded ? (
              isAnalyticsAllowed ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  Autorizado (GA4/Clarity)
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                  Bloqueado
                </span>
              )
            ) : (
              <span className="text-[11px] text-muted-foreground">Carregando...</span>
            )}
          </div>
        </div>
      </div>

      {/* Bloco 1: Central de Documentos Legais */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          Documentos Legais e Contratuais da Plataforma
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
                  Política de Privacidade
                </span>
                <span className="text-[11px] text-muted-foreground">Tratamento de Dados & Papéis</span>
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
                  Termos de Uso
                </span>
                <span className="text-[11px] text-muted-foreground">Regras SaaS & Modelo BYOK</span>
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
                  Acordo DPA
                </span>
                <span className="text-[11px] text-muted-foreground">Operador ↔ Controlador</span>
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
                  Segurança da Informação
                </span>
                <span className="text-[11px] text-muted-foreground">Pilares & Criptografia</span>
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
                  Lista de Subprocessadores de Dados
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Infraestrutura Supabase, Vercel, Meta Cloud API, Asaas e Provedores de IA
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
          Canal de Direitos do Titular de Dados (Art. 18 LGPD)
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Você possui total direito de solicitar confirmação de tratamento, acesso, correção, eliminação de dados ou esclarecimentos técnicos diretamente com o nosso Encarregado pelo Tratamento de Dados Pessoais (DPO).
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4 text-primary shrink-0" />
            <span>
              DPO Oficial:{" "}
              <strong className="text-foreground">flowsystems@flowofc.com.br</strong>
            </span>
          </div>

          <Link
            href="/lgpd"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            <Download className="size-3.5" />
            Abrir Solicitação LGPD
          </Link>
        </div>
      </div>
    </section>
  );
}
