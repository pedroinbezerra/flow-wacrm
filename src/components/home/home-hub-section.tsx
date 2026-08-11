"use client";

import React, { useState } from "react";
import { 
  Users, 
  MessageSquare, 
  Workflow, 
  TrendingUp, 
  ArrowRight, 
  Building2, 
  Tag, 
  Kanban, 
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HubPillarData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  description: string;
}

export function HomeHubSection() {
  const [activePillar, setActivePillar] = useState<number>(0);

  const hubPillars: HubPillarData[] = [
    {
      id: "person",
      number: "01",
      title: "Pessoas & Histórico",
      subtitle: "Identidade Unificada do Cliente",
      icon: Users,
      badge: "Contexto Total",
      description: "Cada cliente chega com suas tags, campos personalizados, histórico de conversas e notas da equipe. Você nunca atende no escuro."
    },
    {
      id: "conversation",
      number: "02",
      title: "Conversa Colaborativa",
      subtitle: "Equipe & IA no Mesmo Espaço",
      icon: MessageSquare,
      badge: "Multiatendente",
      description: "Múltiplos agentes com o mesmo número oficial do WhatsApp. A IA atende com conhecimento real do negócio e transfere com contexto."
    },
    {
      id: "process",
      number: "03",
      title: "Processos & Funis",
      subtitle: "Automação e Funil Integrados",
      icon: Workflow,
      badge: "Automação Integrada",
      description: "Fluxos visuais sem código, entrega automática de documentos a partir da sua nuvem e atualização de fases no Funil sem trocar de tela."
    },
    {
      id: "result",
      number: "04",
      title: "Clareza de Resultados",
      subtitle: "Previsão Comercial & Auditoria",
      icon: TrendingUp,
      badge: "Previsão Real",
      description: "Receita ponderada do funil de vendas, métricas de tempo de resposta da equipe e trilha completa de auditoria em tempo real."
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-card/30 border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
            <Layers className="size-3.5" />
            <span>O Conceito de Hub</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            O ponto de convergência onde tudo se encontra
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            O Hub não é uma coleção de módulos soltos. É a experiência de ter pessoas, conversas, processos e ações conectados naturalmente em um único ambiente.
          </p>
        </div>

        {/* Pillar Switcher Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {hubPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isActive = activePillar === idx;
            return (
              <button
                key={pillar.id}
                onClick={() => setActivePillar(idx)}
                className={cn(
                  "p-5 rounded-2xl text-left border transition-all relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-ring",
                  isActive
                    ? "bg-card border-primary shadow-md ring-1 ring-primary/30"
                    : "bg-card/40 border-border/70 hover:bg-card hover:border-border"
                )}
              >
                <div className="flex items-center justify-between pb-3">
                  <span className={cn(
                    "text-xs font-mono font-bold px-2 py-0.5 rounded-md",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {pillar.number}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {pillar.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <Icon className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">{pillar.title}</h3>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {pillar.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Convergence Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Description Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                <span className="size-2 rounded-full bg-primary animate-ping" />
                <span>Ponto de Convergência {hubPillars[activePillar].number}</span>
              </div>

              <h3 className="text-2xl font-bold text-foreground">
                {hubPillars[activePillar].title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {hubPillars[activePillar].description}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setActivePillar((prev) => (prev + 1) % hubPillars.length)}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <span>Explorar próximo elemento de convergência</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Simulation Column */}
            <div className="lg:col-span-7 border border-border/80 rounded-xl bg-background p-5 space-y-4 shadow-inner text-xs">
              {activePillar === 0 && (
                <div className="space-y-4 animate-in fade-in-50 duration-300 ease-out">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      Ficha Unificada do Contato
                    </span>
                    <span className="text-[10px] text-muted-foreground">Hub Integrado</span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-4">
                    <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      MS
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-foreground text-sm">Mariana Souza</h4>
                        <span className="text-muted-foreground text-[11px]">+55 11 97654-3210</span>
                      </div>
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-primary" /> Logística Expresso S/A
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded bg-primary-soft text-primary text-[10px] font-medium flex items-center gap-1">
                          <Tag className="size-2.5" /> VIP
                        </span>
                        <span className="px-2 py-0.5 rounded bg-primary-soft text-primary text-[10px] font-medium flex items-center gap-1">
                          <Tag className="size-2.5" /> Contrato Anual
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePillar === 1 && (
                <div className="space-y-3 animate-in fade-in-50 duration-300 ease-out">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="size-4 text-primary" />
                      Conversa Colaborativa & IA
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">2 agentes na conversa</span>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    <div className="p-3 rounded-xl bg-card text-foreground border border-border max-w-[85%]">
                      <span className="text-[10px] text-muted-foreground font-semibold block">Mariana Souza (Cliente)</span>
                      <p className="leading-relaxed pt-0.5">Gostaria de integrar a emissão de boletos no WhatsApp.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary-soft text-foreground border border-primary/20 max-w-[85%] ml-auto">
                      <span className="text-[10px] text-primary font-semibold block">FlowHub IA (Silenciosa)</span>
                      <p className="leading-relaxed pt-0.5">Sim! O FlowHub monitora sua pasta e realiza o envio automático com leitura inteligente dos arquivos.</p>
                    </div>
                  </div>
                </div>
              )}

              {activePillar === 2 && (
                <div className="space-y-3 animate-in fade-in-50 duration-300 ease-out">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-2">
                      <Workflow className="size-4 text-primary" />
                      Processo no Kanban & Automação
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">R$ 36.000 / ano</span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                    <span className="text-[10px] text-muted-foreground block font-medium">Estágio Comercial:</span>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <Kanban className="size-4 text-primary" /> Em Negociação (Probabilidade: 75%)
                    </p>
                  </div>
                </div>
              )}

              {activePillar === 3 && (
                <div className="space-y-3 animate-in fade-in-50 duration-300 ease-out">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-primary" />
                      Resultados & Auditoria
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">Atualizado agora</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
                      <span className="text-[10px] text-muted-foreground block">Tempo Médio 1ª Resposta</span>
                      <p className="text-base font-bold font-mono text-foreground">1.4 min</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
                      <span className="text-[10px] text-muted-foreground block">Valor Ponderado</span>
                      <p className="text-base font-bold font-mono text-foreground">R$ 142.500</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
