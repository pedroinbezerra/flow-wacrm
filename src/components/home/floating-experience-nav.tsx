"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { FlowLogo } from "@/components/layout/flow-logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  STAGE_MOMENTS,
  goToStageStep,
  momentIdForStep,
  subscribeStageIndex,
} from "./experience-stage";

export function FloatingExperienceNav() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  // O palco não é mais atravessado por rolagem, então não há porcentagem para
  // ler. Ele anuncia o passo em que está e a barra apenas acompanha — sem
  // ouvinte de scroll e sem medir a altura do documento a cada evento.
  useEffect(() => subscribeStageIndex(setStepIndex), []);

  const activeMoment = momentIdForStep(stepIndex);

  return (
    <nav
      aria-label="Navegação da Experiência"
      className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-full border border-border/80 bg-card/95 shadow-xl">

        {/* Logo / Brand Pill */}
        <button
          onClick={() => goToStageStep(0)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-card-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <FlowLogo height={22} />
          <span className="sr-only">Voltar ao início da experiência</span>
        </button>

        {/* Âncoras dos momentos */}
        <div className="hidden md:flex items-center gap-1 border-x border-border/60 px-2 text-xs font-medium text-muted-foreground">
          {STAGE_MOMENTS.map((moment) => {
            const isActive = activeMoment === moment.id;
            return (
              <button
                key={moment.id}
                onClick={() => goToStageStep(moment.entry)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-colors",
                  isActive
                    ? "text-foreground bg-card-2 font-semibold"
                    : "hover:text-foreground"
                )}
              >
                {moment.title}
              </button>
            );
          })}
        </div>

        {/* Ação */}
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-sm"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Dashboard</span>
          </Link>
        ) : (
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors shadow-sm"
            >
              <span>Começar</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        )}

      </div>
    </nav>
  );
}
