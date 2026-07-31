"use client";

import React from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Settings } from "lucide-react";

interface CookieBannerProps {
  onAcceptAll: () => void;
  onAcceptNecessary: () => void;
  onOpenPreferences: () => void;
}

export function CookieBanner({
  onAcceptAll,
  onAcceptNecessary,
  onOpenPreferences,
}: CookieBannerProps) {
  return (
    <div
      role="region"
      aria-label="Consentimento de Cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-card/95 backdrop-blur-md border-t border-border/80 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8">
        {/* Ícone e Texto Explicativo */}
        <div className="flex items-start gap-3.5 flex-1">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="size-5" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span>Valorizamos sua privacidade</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="size-3" /> LGPD
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
              Utilizamos cookies estritamente necessários para o funcionamento e login no Flow Hub, além de cookies opcionais de análise (Google Analytics 4 e Microsoft Clarity) para entender a utilização e como podemos melhorar o FlowHub. Você pode escolher quais tecnologias aceita ativar. Saiba mais na nossa{" "}
              <Link
                href="/cookies"
                className="text-primary underline underline-offset-2 hover:text-primary/90 font-medium transition-colors"
              >
                Política de Cookies
              </Link>.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={onOpenPreferences}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            <Settings className="size-3.5" />
            Configurar
          </button>

          <button
            type="button"
            onClick={onAcceptNecessary}
            className="flex-1 md:flex-initial inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted/80 text-foreground transition-colors"
          >
            Somente necessários
          </button>

          <button
            type="button"
            onClick={onAcceptAll}
            className="flex-1 md:flex-initial inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}
