"use client";

import React from "react";
import { MessageSquare, TrendingUp, Workflow, Bot, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layer01Opening() {
  const intentPills = [
    { verb: "atender", icon: MessageSquare, label: "Conversas Contínuas" },
    { verb: "vender", icon: TrendingUp, label: "Funis e Negócios" },
    { verb: "acompanhar", icon: Workflow, label: "Processos e Etapas" },
    { verb: "automatizar", icon: Bot, label: "Rotinas Inteligentes" },
  ];

  return (
    <div className="layer-01 absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      
      {/* Ambient background light */}
      <div 
        className="layer-01-ambient absolute inset-0 flex items-center justify-center opacity-30"
        aria-hidden="true"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-primary/20 blur-[160px]" />
      </div>

      {/* Opening Hero (Silent intro) */}
      <div className="opening-hero-silent absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20 backdrop-blur-md mb-6 shadow-sm">
          <LayoutTemplate className="size-3.5" />
          <span>Sistema Operacional Comercial</span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-foreground font-sans uppercase">
          FLOWHUB
        </h1>

        <p className="text-lg sm:text-2xl text-muted-foreground font-light tracking-wide mt-4 max-w-xl">
          Fazer o extraordinário parecer natural.
        </p>

        <div className="mt-12 flex flex-col items-center gap-2 text-xs text-muted-foreground/60 font-mono">
          <span>Role para iniciar a experiência</span>
          <div className="w-4 h-7 rounded-full border border-muted-foreground/40 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>

      {/* Morphing Intent Card */}
      <div className="opening-intent-container absolute inset-0 flex items-center justify-center px-4 sm:px-6 z-20 opacity-0">
        <div className="opening-intent-card relative max-w-4xl w-full mx-auto p-8 sm:p-12 md:p-16 rounded-3xl border border-border/80 bg-card/85 backdrop-blur-2xl shadow-2xl text-center flex flex-col items-center justify-center">
          
          <div className="space-y-4 w-full">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary font-semibold block">
              Intenção Operacional
            </span>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Quero{" "}
              {/* Auto-Sizing Monolithic Grid Slot Window */}
              <span className="intent-slot-window relative inline-grid grid-cols-1 grid-rows-1 items-center justify-center align-middle mx-1.5 px-4 sm:px-6 py-1 rounded-2xl bg-primary-soft text-primary border border-primary/30 shadow-inner leading-none select-none">
                <span className="intent-word-0 col-start-1 row-start-1 flex items-center justify-center font-extrabold text-primary leading-none text-center whitespace-nowrap">
                  atender
                </span>
                <span className="intent-word-1 col-start-1 row-start-1 flex items-center justify-center font-extrabold text-primary leading-none text-center whitespace-nowrap opacity-0 pointer-events-none translate-y-4">
                  vender
                </span>
                <span className="intent-word-2 col-start-1 row-start-1 flex items-center justify-center font-extrabold text-primary leading-none text-center whitespace-nowrap opacity-0 pointer-events-none translate-y-4">
                  acompanhar
                </span>
                <span className="intent-word-3 col-start-1 row-start-1 flex items-center justify-center font-extrabold text-primary leading-none text-center whitespace-nowrap opacity-0 pointer-events-none translate-y-4">
                  automatizar
                </span>
              </span>{" "}
              sem perder o contexto.
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto pt-2">
              Uma única camada de trabalho onde pessoas, conversas e processos se conectam sem atrito.
            </p>
          </div>

          {/* Intent Pills Row */}
          <div className="intent-indicators-row flex flex-wrap items-center justify-center gap-3 pt-8">
            {intentPills.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  id={`intent-pill-${idx}`}
                  className={cn(
                    "intent-pill flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-300 border",
                    idx === 0
                      ? "intent-pill-active bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105 opacity-100 ring-1 ring-primary/40 font-semibold"
                      : "intent-pill-inactive bg-card-2/60 text-muted-foreground border-border/60 opacity-40 scale-100 font-normal"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
