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
    <div className="layer-01 absolute inset-0 flex items-center justify-center pointer-events-none z-10 will-change-[transform,opacity]">
      
      {/* Ambient background light */}
      {/*
        Luz ambiente por gradiente radial, e não por `blur-[160px]`. Um desfoque
        de 160px sobre 600px precisa ser reprocessado toda vez que a camada muda
        de opacidade ou escala — e ela muda a cada quadro da rolagem. O gradiente
        é rasterizado uma vez e depois só recomposto.
      */}
      <div 
        className="layer-01-ambient absolute inset-0 flex items-center justify-center opacity-15"
        aria-hidden="true"
      >
        <div className="h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_65%)]" />
      </div>

      {/* Opening Hero (Silent intro) */}
      <div className="opening-hero-silent absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20 mb-6 shadow-sm">
          <LayoutTemplate className="size-3.5" />
          <span>Sistema Operacional Comercial</span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-foreground font-sans uppercase">
          FLOWHUB
        </h1>

        <p className="text-lg sm:text-2xl text-muted-foreground font-light tracking-wide mt-4 max-w-xl">
          Fazer o extraordinário parecer natural.
        </p>

        <div className="mt-12 flex flex-col items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>Role para iniciar a experiência</span>
          <div className="w-4 h-7 rounded-full border border-muted-foreground/40 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>

      {/* Morphing Intent Card */}
      <div className="opening-intent-container absolute inset-0 flex items-center justify-center px-4 sm:px-6 z-20 opacity-0 invisible">
        <div className="opening-intent-card relative max-w-4xl w-full mx-auto p-8 sm:p-12 md:p-16 rounded-3xl border border-border/80 bg-card shadow-xl text-center flex flex-col items-center justify-center">
          
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
                <span className="intent-word-1 col-start-1 row-start-1 flex items-center justify-center font-extrabold text-primary leading-none text-center whitespace-nowrap opacity-0 invisible pointer-events-none translate-y-4">
                  vender
                </span>
                <span className="intent-word-2 col-start-1 row-start-1 flex items-center justify-center font-extrabold text-primary leading-none text-center whitespace-nowrap opacity-0 invisible pointer-events-none translate-y-4">
                  acompanhar
                </span>
                <span className="intent-word-3 col-start-1 row-start-1 flex items-center justify-center font-extrabold text-primary leading-none text-center whitespace-nowrap opacity-0 invisible pointer-events-none translate-y-4">
                  automatizar
                </span>
              </span>{" "}
              sem perder o contexto.
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto pt-2">
              Uma única camada de trabalho onde pessoas, conversas e processos se conectam sem atrito.
            </p>
          </div>

          {/*
            Intent Pills Row.

            Cada pílula carrega as duas faces empilhadas na mesma célula de
            grid: a apagada e a acesa. A troca é uma dissolvência de opacidade
            entre elas, conduzida pela timeline. Antes o estado ativo era
            reescrito trocando a `className` inteira, o que juntava recálculo de
            estilo com uma transição CSS própria correndo por fora do scroll.
            Ambas as faces usam o mesmo peso de fonte para que a caixa não mude
            de largura durante a dissolvência.
          */}
          <div className="intent-indicators-row flex flex-wrap items-center justify-center gap-3 pt-8">
            {intentPills.map((item, idx) => {
              const Icon = item.icon;
              const faceClass =
                "col-start-1 row-start-1 flex items-center gap-2 px-4 py-2 rounded-full text-xs border font-semibold";
              return (
                <div
                  key={idx}
                  id={`intent-pill-${idx}`}
                  className={cn(
                    "intent-pill inline-grid grid-cols-1 grid-rows-1 rounded-full",
                    `intent-pill-${idx}`,
                    idx === 0 ? "opacity-100 scale-105" : "opacity-40"
                  )}
                >
                  <div
                    className={cn(
                      faceClass,
                      `intent-pill-off-${idx}`,
                      "bg-card-2/60 text-muted-foreground border-border/60",
                      idx === 0 && "opacity-0"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{item.label}</span>
                  </div>

                  <div
                    className={cn(
                      faceClass,
                      `intent-pill-on-${idx}`,
                      "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 ring-1 ring-primary/40",
                      idx !== 0 && "opacity-0"
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="size-3.5" />
                    <span>{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
