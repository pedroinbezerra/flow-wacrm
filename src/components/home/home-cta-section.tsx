"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function HomeCtaSection() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 md:p-16 text-center space-y-8 shadow-2xl relative">
          {/* Ambient light glow */}
          <div className="aria-hidden:true pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-20">
            <div className="h-[300px] w-[300px] rounded-full bg-primary/30 blur-[100px]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="size-3.5" />
            <span>Comece Hoje Mesmo</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Sua nova experiência de trabalho começa aqui.
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Experimente o FlowHub gratuitamente e sinta a diferença de um ambiente projetado para retirar esforço do seu caminho.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-7 py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <LayoutDashboard className="size-4" />
                <span>Ir para o Dashboard</span>
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-7 py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span>Criar Conta Grátis</span>
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-card-2 border border-border hover:bg-card text-foreground font-medium px-6 py-3.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span>Já tem uma conta? Entrar</span>
                </Link>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-border/40 max-w-md mx-auto">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">
              FlowHub — Fazer o extraordinário parecer natural.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
