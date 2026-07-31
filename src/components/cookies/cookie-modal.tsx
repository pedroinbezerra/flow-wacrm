"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Lock, BarChart3, Check } from "lucide-react";
import { CookiePreferences } from "@/lib/cookies/consent";

interface CookieModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: CookiePreferences | null;
  onSavePreferences: (options: { analytics: boolean }) => void;
  onAcceptAll: () => void;
  onAcceptNecessary: () => void;
}

export function CookieModal({
  isOpen,
  onClose,
  currentPreferences,
  onSavePreferences,
  onAcceptAll,
  onAcceptNecessary,
}: CookieModalProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (currentPreferences) {
      setAnalyticsEnabled(currentPreferences.analytics);
    } else {
      setAnalyticsEnabled(false);
    }
  }, [currentPreferences, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Cookie className="size-4" />
            </div>
            <h2 id="cookie-modal-title" className="text-base font-semibold text-foreground">
              Preferências de Cookies
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
            Nós respeitamos sua privacidade de acordo com a LGPD. Escolha quais categorias de cookies você permite ativar no Flow Hub. Cookies essenciais funcionam sempre para garantir o acesso ao sistema.
          </p>

          <div className="space-y-4">
            {/* Categoria 1: Necessários */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Lock className="size-4 text-emerald-500" />
                  <span>Estritamente Necessários</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  Sempre Ativos
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Essenciais para o funcionamento da plataforma, login seguro via Supabase Auth, validação de sessão em rotas autenticadas e proteção do aplicativo. Não podem ser desativados.
              </p>
            </div>

            {/* Categoria 2: Análise e Desempenho */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <BarChart3 className="size-4 text-primary" />
                  <span>Desempenho e Análise</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utilizamos o Google Analytics 4 e Microsoft Clarity para medir métricas de navegação e entender como a plataforma é utilizada. O bloqueio destas ferramentas não afetará seu uso do CRM.
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t border-border/40 flex items-center justify-between">
            <span>Para mais detalhes, consulte nossa</span>
            <Link
              href="/cookies"
              onClick={onClose}
              className="text-primary underline hover:text-primary/90 font-medium transition-colors"
            >
              Política de Cookies completa
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-4 px-6 border-t border-border/80 bg-muted/20">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onAcceptNecessary}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
            >
              Somente necessários
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
            >
              Aceitar todos
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSavePreferences({ analytics: analyticsEnabled })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Check className="size-3.5" />
            Salvar preferências
          </button>
        </div>
      </div>
    </div>
  );
}
