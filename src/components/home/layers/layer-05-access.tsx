"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  LayoutDashboard, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  CheckCircle2 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Layer05Access() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  return (
    <div className="layer-05 absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8 pointer-events-none opacity-0 z-50">
      
      {/* Portal Card */}
      <div className="access-portal-card relative w-full max-w-4xl mx-auto rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-2xl p-6 sm:p-10 md:p-14 text-center flex flex-col items-center justify-center space-y-6">
        
        {/* Motto Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20 backdrop-blur-md shadow-sm">
          <Sparkles className="size-3.5" />
          <span>Acesso ao Sistema</span>
        </div>

        {/* Heading */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Sua nova experiência de trabalho começa agora.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Elimine o caos operacional. Reúna equipe, conversas, funil de vendas e inteligência em um ambiente onde tudo simplesmente flui.
          </p>
        </div>

        {/* Direct Entry Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-7 py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring group pointer-events-auto"
            >
              <LayoutDashboard className="size-4" />
              <span>Ir para o Dashboard</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-7 py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring group pointer-events-auto"
              >
                <span>Começar Gratuitamente</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-card-2 border border-border/80 hover:bg-card text-foreground font-medium px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring pointer-events-auto"
              >
                <span>Entrar no Sistema</span>
              </Link>
            </>
          )}
        </div>

        {/* Privacy & Governance Strip */}
        <div className="pt-5 border-t border-border/50 w-full max-w-xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>WhatsApp Oficial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary" />
              <span>Isolamento Estrito de Dados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Sem Custos Ocultos</span>
            </div>
          </div>

          <div>
            <Link
              href="/security"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium pointer-events-auto"
            >
              <span>Conhecer nossos compromissos de Segurança e Privacidade</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
