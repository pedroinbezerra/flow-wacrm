"use client";

import React from "react";
import { 
  Users, 
  MessageSquare, 
  Sparkles, 
  Workflow, 
  Bot, 
  TrendingUp, 
  Layers,
  ShieldCheck 
} from "lucide-react";
import { FlowLogo } from "@/components/layout/flow-logo";

export function Layer04Hub() {
  const satellites = [
    {
      id: "hub-sat-1",
      icon: Users,
      title: "Pessoa",
      subtitle: "Identidade & Contexto",
      positionClass: "top-2 left-2 sm:left-10",
      className: "border-primary/40 shadow-primary/10",
    },
    {
      id: "hub-sat-2",
      icon: MessageSquare,
      title: "Conversa",
      subtitle: "WhatsApp & Multiagente",
      positionClass: "top-2 right-2 sm:right-10",
      className: "border-primary/40 shadow-primary/10",
    },
    {
      id: "hub-sat-3",
      icon: Sparkles,
      title: "Equipe",
      subtitle: "Presença & Notas Privadas",
      positionClass: "top-1/2 -translate-y-1/2 left-0 sm:left-2",
      className: "border-purple-500/40 shadow-purple-500/10",
    },
    {
      id: "hub-sat-4",
      icon: Workflow,
      title: "Processo",
      subtitle: "Funil Comercial & Kanban",
      positionClass: "top-1/2 -translate-y-1/2 right-0 sm:right-2",
      className: "border-purple-500/40 shadow-purple-500/10",
    },
    {
      id: "hub-sat-5",
      icon: Bot,
      title: "Automação",
      subtitle: "Inteligência Silenciosa",
      positionClass: "bottom-2 left-4 sm:left-14",
      className: "border-indigo-500/40 shadow-indigo-500/10",
    },
    {
      id: "hub-sat-6",
      icon: TrendingUp,
      title: "Resultado",
      subtitle: "Previsão & Auditoria",
      positionClass: "bottom-2 right-4 sm:right-14",
      className: "border-indigo-500/40 shadow-indigo-500/10",
    },
  ];

  return (
    <div className="layer-04 absolute inset-0 flex items-center justify-center px-4 sm:px-6 pointer-events-none opacity-0 z-40">
      
      {/* 1. Convergence Stage (Satellites in Orbit gravitating toward Hub Nucleus) */}
      <div className="hub-convergence-container absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6">
        
        {/* Header Title */}
        <div className="space-y-2 max-w-xl mx-auto mb-4 z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
            <Layers className="size-3.5" />
            <span>O Ponto de Convergência</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            O Hub onde tudo se conecta.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Não são ferramentas isoladas. É a integração natural do seu trabalho.
          </p>
        </div>

        {/* Orbital Stage Viewport with Fixed Radial Perimeter */}
        <div className="relative w-full max-w-3xl h-[400px] sm:h-[460px] flex items-center justify-center">
          
          {/* Outer & Inner Concentric Orbit Guide Rings */}
          <div 
            className="hub-orbit-ring-outer absolute size-[360px] sm:size-[440px] rounded-full border border-dashed border-primary/20 pointer-events-none"
            aria-hidden="true"
          />
          <div 
            className="hub-orbit-ring-inner absolute size-[220px] sm:size-[280px] rounded-full border border-dashed border-primary/25 pointer-events-none"
            aria-hidden="true"
          />

          {/* Central Nucleus Core */}
          <div className="hub-nucleus relative z-20 flex flex-col items-center justify-center p-5 sm:p-6 rounded-3xl bg-card border-2 border-primary/60 shadow-2xl shadow-primary/30 backdrop-blur-xl">
            <div className="size-12 sm:size-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-2 shadow-inner">
              <FlowLogo height={26} />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              NÚCLEO FLOWHUB
            </span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground font-medium">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Convergência Total</span>
            </div>
          </div>

          {/* 6 Satellites (Distributed around the perimeter) */}
          {satellites.map((sat) => {
            const Icon = sat.icon;
            return (
              <div
                key={sat.id}
                className={`hub-satellite ${sat.id} ${sat.positionClass} absolute z-30 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-card/95 border backdrop-blur-xl shadow-xl transition-shadow ${sat.className}`}
              >
                <div className="size-8 rounded-xl bg-card-2 flex items-center justify-center text-primary shrink-0 border border-border/60">
                  <Icon className="size-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-foreground leading-none">
                    {sat.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                    {sat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* 2. Simplification Stage (Condensation into Essential Message) */}
      <div className="hub-simplification-container absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-0">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20 shadow-sm">
            <ShieldCheck className="size-3.5" />
            <span>A Síntese da Experiência</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            Fazer o extraordinário parecer natural.
          </h2>

          <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto font-light">
            Toda a complexidade de atendimento, IA, fluxos e governança condensada em uma única camada fluida, silenciosa e sem fricção.
          </p>
        </div>
      </div>

    </div>
  );
}
