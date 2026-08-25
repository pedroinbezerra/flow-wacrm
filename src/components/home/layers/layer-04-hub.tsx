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
  ShieldCheck,
} from "lucide-react";
import { FlowLogo } from "@/components/layout/flow-logo";

/**
 * MOMENTO 04 — O ponto de convergência.
 *
 * O núcleo era um corpo escuro literal (`#0c0c12`) com halo e sombra em violeta
 * fixo. Isso só funcionava sob uma condição: que a página inteira fosse escura e
 * que o acento fosse violeta. No modo claro virava uma mancha preta sobre papel
 * branco, e em qualquer outro acento a peça central continuava violeta enquanto
 * o resto da tela mudava de cor.
 *
 * A correção não é trocar o preto por um cinza: é trocar a ideia. Um corpo
 * celeste precisa de escuridão para existir. Uma **superfície** não precisa.
 * Aqui o centro é a própria superfície do produto (`card`) — clara no claro,
 * escura no escuro — e a convergência acende essa superfície com o acento em
 * vigor, em vez de pintá-la de uma cor decidida na mão.
 *
 * Base normativa: `FH-29.01` (nenhuma cor literal), `FH-29.03` (modo define
 * neutros, acento define primária, conjuntos disjuntos), `FH-29.05` e
 * `FH-29.10` (contraste verificado nos dois modos e em todos os acentos),
 * `FH-09.09` (expressão visual só por tokens).
 */
export function Layer04Hub() {
  // As seis órbitas não são seis categorias de cor. Cada uma nomeia um domínio
  // do trabalho, e a distinção entre elas é o texto — não o matiz da borda.
  // As bordas em roxo e índigo literais que existiam aqui codificavam um
  // agrupamento que não significa nada e que sobrevivia à troca de acento
  // (`FH-29.04`: cor nunca é o único portador de significado; `FH-24.05`:
  // hierarquia por posição e peso antes de cor).
  const satellites = [
    {
      id: "hub-sat-1",
      icon: Users,
      title: "Contato",
      subtitle: "Histórico e contexto unificados",
      positionClass: "top-2 left-2 sm:left-10",
    },
    {
      id: "hub-sat-2",
      icon: MessageSquare,
      title: "Conversa",
      subtitle: "Mensagens centralizadas em equipe",
      positionClass: "top-2 right-2 sm:right-10",
    },
    {
      id: "hub-sat-3",
      icon: Sparkles,
      title: "Equipe",
      subtitle: "Presença e anotações internas",
      positionClass: "top-1/2 -translate-y-1/2 left-0 sm:left-2",
    },
    {
      id: "hub-sat-4",
      icon: Workflow,
      title: "Processo",
      subtitle: "Funis e etapas organizadas",
      positionClass: "top-1/2 -translate-y-1/2 right-0 sm:right-2",
    },
    {
      id: "hub-sat-5",
      icon: Bot,
      title: "Automação",
      subtitle: "Rotinas que poupam tempo",
      positionClass: "bottom-2 left-4 sm:left-14",
    },
    {
      id: "hub-sat-6",
      icon: TrendingUp,
      title: "Resultado",
      subtitle: "Métricas e acompanhamento claro",
      positionClass: "bottom-2 right-4 sm:right-14",
    },
  ];

  return (
    <div className="layer-04 absolute inset-0 flex items-center justify-center px-4 sm:px-6 pointer-events-none opacity-0 invisible z-40 will-change-[transform,opacity]">

      {/* 1. Palco da convergência */}
      <div className="hub-convergence-container absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6">

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

        {/* Campo orbital */}
        <div className="relative w-full max-w-3xl h-[420px] sm:h-[480px] flex items-center justify-center">

          {/*
            Anéis-guia em acento de baixa opacidade. O acento é um tom médio,
            então destaca-se tanto do fundo claro quanto do escuro — um neutro
            de baixa opacidade só seria visível em um dos dois.
          */}
          <div
            className="hub-orbit-ring-outer absolute size-[360px] sm:size-[440px] rounded-full border border-dashed border-primary/25 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="hub-orbit-ring-inner absolute size-[220px] sm:size-[280px] rounded-full border border-dashed border-primary/35 pointer-events-none"
            aria-hidden="true"
          />

          {/* Núcleo */}
          <div className="hub-nucleus-wrapper relative z-20 flex items-center justify-center">

            {/*
              Halo de carga. Nasce apagado e é aceso pela timeline no momento em
              que os satélites se dissolvem: a luz é consequência da
              convergência, não um enfeite permanente (`FH-39.02` — o movimento
              comunica causa).
            */}
            <div
              className="hub-nucleus-glow absolute size-48 rounded-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)] pointer-events-none opacity-0 invisible"
              aria-hidden="true"
            />

            {/*
              O disco. Em repouso já é um lugar reconhecível — superfície do
              produto com um aro tênue de acento — sem depender de escuridão
              para se destacar.
            */}
            <div className="hub-nucleus relative flex items-center justify-center size-28 sm:size-34 rounded-full bg-card border border-primary/25 ring-1 ring-primary/10 shadow-xl">

              {/*
                Aro de convergência. Some em repouso e acende junto com o halo,
                dando ao disco a aparência de ter recebido tudo o que orbitava.
                É só borda e anel: o interior permanece `card`, de modo que a
                marca sempre pousa sobre a superfície de maior contraste
                disponível no modo em vigor.
              */}
              <div
                className="hub-nucleus-rim absolute inset-0 rounded-full border-2 border-primary/70 ring-4 ring-primary/15 pointer-events-none opacity-0"
                aria-hidden="true"
              />

              <div className="hub-nucleus-logo relative z-10 flex items-center justify-center opacity-0 invisible scale-75 pointer-events-none select-none">
                <FlowLogo height={36} />
              </div>

            </div>

          </div>

          {/* Seis órbitas */}
          {satellites.map((sat) => {
            const Icon = sat.icon;
            return (
              <div
                key={sat.id}
                className={`hub-satellite ${sat.id} ${sat.positionClass} absolute z-30 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-card border border-border shadow-lg`}
              >
                <div className="size-8 rounded-xl bg-primary-soft flex items-center justify-center text-primary shrink-0 border border-primary/20">
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

      {/* 2. Síntese */}
      <div className="hub-simplification-container absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-0 invisible">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20 shadow-sm">
            <ShieldCheck className="size-3.5" />
            <span>Síntese</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            Fazer o extraordinário parecer natural.
          </h2>

          <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto font-light">
            Toda a complexidade de conversas, negociações, automações e equipe
            condensada em uma única camada fluida, silenciosa e sem fricção.
          </p>
        </div>
      </div>

    </div>
  );
}
