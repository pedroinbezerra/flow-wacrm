"use client";

import React from "react";
import { 
  CheckCircle2, 
  Layers, 
  Sparkles,
  MessageSquare,
  Building2,
  Users,
  Workflow,
  Zap
} from "lucide-react";
import { 
  ContactCardSnippet, 
  MessageBubbleSnippet, 
  InternalNoteSnippet, 
  KanbanDealSnippet, 
  AutomationNodeSnippet 
} from "../shared/real-ui-snippets";
import { cn } from "@/lib/utils";

export function Layer02Flow() {
  const steps = [
    { title: "Uma conversa começa", subtitle: "Um contato envia mensagem no canal da sua empresa." },
    { title: "O contexto se reúne", subtitle: "Histórico, dados cadastrais e anotações carregam no mesmo espaço." },
    { title: "A equipe colabora", subtitle: "Membros atuam em conjunto com anotações internas que o contato não vê." },
    { title: "O negócio avança", subtitle: "A oportunidade e seu valor progridem pelas etapas do funil." },
    { title: "A rotina executa", subtitle: "Documentos e mensagens são enviados automaticamente com confirmação." },
  ];

  return (
    <div className="layer-02 absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8 pointer-events-none opacity-0 z-20">
      
      {/* Main Flow Stage Card */}
      <div className="flow-stage-card relative w-full max-w-5xl mx-auto rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-2xl overflow-hidden p-6 sm:p-8 md:p-10">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
              <Layers className="size-3.5" />
              <span>Como o Trabalho Acontece</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Acontecimentos contínuos, sem troca de contexto.
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-card-2 px-3 py-1.5 rounded-xl border border-border/60 shrink-0 self-start sm:self-auto">
            <Sparkles className="size-3.5 text-primary" />
            <span>Linha do Tempo Integrada</span>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 pt-6 items-center">
          
          {/* Left: Step Checklist */}
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold block pb-1">
              Etapas da Operação
            </span>

            {steps.map((step, idx) => (
              <div
                key={idx}
                id={`flow-step-item-${idx}`}
                className={cn(
                  `flow-step-item flow-step-${idx} p-3 rounded-2xl border transition-all duration-300`,
                  idx === 0 
                    ? "bg-card-2 border-primary/50 text-foreground shadow-sm ring-1 ring-primary/20" 
                    : "bg-transparent border-transparent text-muted-foreground opacity-40"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flow-step-indicator size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-primary">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Dynamic Single-Scene Canvas */}
          <div className="lg:col-span-8 relative h-[360px] sm:h-[400px] rounded-2xl border border-border/60 bg-background/70 overflow-hidden shadow-inner flex items-center justify-center p-4 sm:p-6">
            
            {/* Scene 0: Conversation message arrives */}
            <div className="flow-scene flow-scene-0 absolute inset-0 flex flex-col justify-center p-4 sm:p-8 space-y-3 z-10 transition-all">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary border-b border-border/40 pb-2">
                <MessageSquare className="size-3.5" />
                <span>Nova Mensagem Recebida</span>
              </div>
              <MessageBubbleSnippet 
                sender="Mariana Souza" 
                text="Olá! Gostaria de consultar uma proposta para implantação na Logística Expresso." 
                time="14:32" 
                variant="user"
                className="shadow-xl"
              />
              <p className="text-[11px] text-muted-foreground pt-2">
                Conversa conectada diretamente sem intermediários ou perda de histórico.
              </p>
            </div>

            {/* Scene 1: Contact context appears */}
            <div className="flow-scene flow-scene-1 absolute inset-0 flex flex-col justify-center p-4 sm:p-8 space-y-3 z-20 opacity-0 pointer-events-none transition-all">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary border-b border-border/40 pb-2">
                <Building2 className="size-3.5" />
                <span>Ficha e Contexto do Contato</span>
              </div>
              <ContactCardSnippet className="shadow-xl border-primary/30" />
            </div>

            {/* Scene 2: Collaborative team and internal note */}
            <div className="flow-scene flow-scene-2 absolute inset-0 flex flex-col justify-center p-4 sm:p-8 space-y-3 z-30 opacity-0 pointer-events-none transition-all">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 border-b border-border/40 pb-2">
                <Users className="size-3.5" />
                <span>Colaboração e Anotações Internas</span>
              </div>
              <MessageBubbleSnippet 
                sender="IA da Operação" 
                text="Identificado contato corporativo. Dados vinculados à ficha comercial do consultor Carlos." 
                time="14:33" 
                variant="bot"
                className="shadow-md"
              />
              <InternalNoteSnippet className="shadow-md" />
            </div>

            {/* Scene 3: Deal in pipeline */}
            <div className="flow-scene flow-scene-3 absolute inset-0 flex flex-col justify-center p-4 sm:p-8 space-y-3 z-40 opacity-0 pointer-events-none transition-all">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary border-b border-border/40 pb-2">
                <Workflow className="size-3.5" />
                <span>Negócio em Andamento no Funil</span>
              </div>
              <KanbanDealSnippet className="shadow-xl" />
            </div>

            {/* Scene 4: Automation execution */}
            <div className="flow-scene flow-scene-4 absolute inset-0 flex flex-col justify-center p-4 sm:p-8 space-y-3 z-50 opacity-0 pointer-events-none transition-all">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 border-b border-border/40 pb-2">
                <Zap className="size-3.5" />
                <span>Rotina Executada com Sucesso</span>
              </div>
              <AutomationNodeSnippet className="shadow-md" />
              <MessageBubbleSnippet 
                sender="Carlos" 
                text="Proposta técnica e condições comerciais enviadas com confirmação de entrega." 
                time="14:35" 
                variant="agent"
                className="shadow-md"
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
