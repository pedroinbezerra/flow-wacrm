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
      title: "Contato",
      subtitle: "Histórico e contexto unificados",
      positionClass: "top-2 left-2 sm:left-10",
      className: "border-primary/40 shadow-primary/10",
    },
    {
      id: "hub-sat-2",
      icon: MessageSquare,
      title: "Conversa",
      subtitle: "Mensagens centralizadas em equipe",
      positionClass: "top-2 right-2 sm:right-10",
      className: "border-primary/40 shadow-primary/10",
    },
    {
      id: "hub-sat-3",
      icon: Sparkles,
      title: "Equipe",
      subtitle: "Presença e anotações internas",
      positionClass: "top-1/2 -translate-y-1/2 left-0 sm:left-2",
      className: "border-purple-500/40 shadow-purple-500/10",
    },
    {
      id: "hub-sat-4",
      icon: Workflow,
      title: "Processo",
      subtitle: "Funis e etapas organizadas",
      positionClass: "top-1/2 -translate-y-1/2 right-0 sm:right-2",
      className: "border-purple-500/40 shadow-purple-500/10",
    },
    {
      id: "hub-sat-5",
      icon: Bot,
      title: "Automação",
      subtitle: "Rotinas que poupam tempo",
      positionClass: "bottom-2 left-4 sm:left-14",
      className: "border-indigo-500/40 shadow-indigo-500/10",
    },
    {
      id: "hub-sat-6",
      icon: TrendingUp,
      title: "Resultado",
      subtitle: "Métricas e acompanhamento claro",
      positionClass: "bottom-2 right-4 sm:right-14",
      className: "border-indigo-500/40 shadow-indigo-500/10",
    },
  ];

  return (
    <div className="layer-04 absolute inset-0 flex items-center justify-center px-4 sm:px-6 pointer-events-none opacity-0 z-40">
      
      {/* 1. Convergence Stage (Satellites in Orbit gravitating toward Pure Circular Hub Sphere) */}
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
        <div className="relative w-full max-w-3xl h-[420px] sm:h-[480px] flex items-center justify-center">
          
          {/* Outer & Inner Concentric Orbit Guide Rings */}
          <div 
            className="hub-orbit-ring-outer absolute size-[360px] sm:size-[440px] rounded-full border border-dashed border-primary/20 pointer-events-none"
            aria-hidden="true"
          />
          <div 
            className="hub-orbit-ring-inner absolute size-[220px] sm:size-[280px] rounded-full border border-dashed border-primary/25 pointer-events-none"
            aria-hidden="true"
          />

          {/* Pure Celestial Sphere Nucleus Wrapper */}
          <div className="hub-nucleus-wrapper relative z-20 flex items-center justify-center">
            
            {/* Dedicated Pure Circular Ambient Glow */}
            <div 
              className="hub-nucleus-glow absolute size-40 rounded-full bg-primary/30 blur-3xl pointer-events-none opacity-0"
              aria-hidden="true"
            />

            {/* Pure Celestial Orb with a single ethereal light halo (Zero inner dual lines) */}
            <div className="hub-nucleus relative flex items-center justify-center size-28 sm:size-34 rounded-full bg-gradient-to-b from-primary/15 via-[#0c0c12] to-[#0c0c12] border border-primary/25 shadow-[0_0_35px_rgba(124,58,237,0.35),inset_0_0_25px_rgba(124,58,237,0.2)] transition-all duration-300">
              
              {/* Revealed FlowHub Logo (Pure floating graphic) */}
              <div className="hub-nucleus-logo relative z-10 flex items-center justify-center opacity-0 scale-75 pointer-events-none select-none">
                <FlowLogo height={36} className="brightness-125 contrast-125 drop-shadow-[0_0_20px_rgba(168,85,247,0.85)]" />
              </div>

            </div>

          </div>

          {/* 6 Satellites (Rectangular Pills distributed around the perimeter) */}
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
            <span>Síntese</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            Fazer o extraordinário parecer natural.
          </h2>

          <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto font-light">
            Toda a complexidade de conversas, negociações, automações e equipe condensada em uma única camada fluida, silenciosa e sem fricção.
          </p>
        </div>
      </div>

    </div>
  );
}
