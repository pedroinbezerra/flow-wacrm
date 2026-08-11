"use client";

import React from "react";
import { 
  Zap, 
  Layers, 
  Bot, 
  BellOff, 
  CheckCircle2
} from "lucide-react";

export function HomeFlowSection() {
  const flowPillars = [
    {
      icon: Layers,
      title: "Sem troca de contexto",
      subtitle: "Tudo o que você precisa no mesmo plano visual",
      description: "Histórico de conversas, notas internas da equipe, estágio de vendas no Kanban e disparo de arquivos vivem juntos. O usuário não precisa navegar entre abas para trabalhar.",
      highlight: "Ausência de fragmentação"
    },
    {
      icon: Bot,
      title: "Inteligência silenciosa",
      subtitle: "A inteligência aparece como naturalidade",
      description: "A IA atende tirando dúvidas reais com a base de conhecimento da empresa e passa o bastão para os humanos sem árvores engessadas e sem alarde.",
      highlight: "Sem espetáculo"
    },
    {
      icon: BellOff,
      title: "Menos interrupções",
      subtitle: "O raciocínio continua sem sobressaltos",
      description: "Eliminamos modais excessivos, confirmações burocráticas e carregamentos agressivos. Se uma ação não exige parada, a experiência continua fluindo.",
      highlight: "Trabalho mais leve"
    }
  ];

  return (
    <section id="flow-concept" className="py-20 md:py-28 bg-background border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
            <Zap className="size-3.5" />
            <span>O Conceito de Flow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Ausência de atrito. A interface desaparece, a intenção permanece.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Flow não significa apenas velocidade. Significa que uma ação leva naturalmente à próxima, no momento certo e sem interromper o raciocínio da sua equipe.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {flowPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all space-y-4 shadow-sm flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-semibold group-hover:scale-105 transition-transform">
                    <Icon className="size-5" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-medium text-primary">
                      {pillar.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center gap-2 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>{pillar.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Philosophical Statement Banner */}
        <div className="p-8 rounded-2xl bg-card-2 border border-border text-center space-y-3 max-w-4xl mx-auto shadow-sm">
          <p className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
            Experiência & Identidade
          </p>
          <blockquote className="text-lg sm:text-xl font-semibold text-foreground italic leading-relaxed">
            &ldquo;O objetivo não é fazer o usuário pensar: &apos;Que sistema bonito.&apos; O objetivo é fazê-lo pensar: &apos;É muito mais fácil fazer isso aqui.&apos;&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
