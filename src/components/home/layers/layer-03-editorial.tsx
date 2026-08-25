"use client";

import React from "react";
import { 
  Users, 
  MessageSquare, 
  Workflow, 
  ShieldCheck 
} from "lucide-react";
import { 
  ContactCardSnippet, 
  MessageBubbleSnippet, 
  InternalNoteSnippet, 
  KanbanDealSnippet, 
  MetricSnippet 
} from "../shared/real-ui-snippets";

export function Layer03Editorial() {
  return (
    <div className="layer-03 absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8 pointer-events-none opacity-0 z-30">
      
      {/* Active Stage Container */}
      <div className="relative w-full max-w-5xl mx-auto h-[540px] sm:h-[480px] flex items-center justify-center">
        
        {/* =========================================================================
            SCENE 1: CONTEXTO ("Nunca atender no escuro")
           ========================================================================= */}
        <div className="editorial-scene editorial-scene-1 absolute inset-0 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 z-10">
          <div className="space-y-3.5 max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
              <Users className="size-3.5" />
              <span>01 · Contexto Total</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Nunca atender no escuro.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Cada cliente que entra em contato carrega sua história, tags, notas internas e negociações anteriores. A equipe atende com segurança desde o primeiro segundo.
            </p>
          </div>

          <div className="editorial-obj-1 w-full max-w-md">
            <ContactCardSnippet className="border-primary/40 ring-1 ring-primary/20 shadow-2xl" />
          </div>
        </div>

        {/* =========================================================================
            SCENE 2: COLABORAÇÃO ("Todo mundo no mesmo contexto")
           ========================================================================= */}
        <div className="editorial-scene editorial-scene-2 absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-between gap-6 sm:gap-8 z-20 opacity-0 translate-y-8">
          <div className="space-y-3.5 max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
              <MessageSquare className="size-3.5" />
              <span>02 · Colaboração Silenciosa</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Todo mundo no mesmo contexto.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Múltiplos agentes com o mesmo número oficial do WhatsApp. IA integrada com a base de conhecimento e notas internas privadas sem poluir a visão do cliente.
            </p>
          </div>

          <div className="editorial-obj-2 w-full max-w-md space-y-2.5">
            <MessageBubbleSnippet 
              sender="FlowHub IA (Silenciosa)"
              text="Fatura localizada. Deseja que eu envie ao cliente ou transfira para o financeiro?"
              time="14:36"
              variant="bot"
            />
            <InternalNoteSnippet />
          </div>
        </div>

        {/* =========================================================================
            SCENE 3: PROCESSO ("A conversa coloca o trabalho em movimento")
           ========================================================================= */}
        <div className="editorial-scene editorial-scene-3 absolute inset-0 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 z-30 opacity-0 translate-y-8">
          <div className="space-y-3.5 max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
              <Workflow className="size-3.5" />
              <span>03 · Processo Integrado</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              A conversa coloca o trabalho em movimento.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              As mensagens movem etapas de vendas no Kanban, disparam tarefas e entregam contratos diretamente sem alternar entre diferentes ferramentas ou planilhas.
            </p>
          </div>

          <div className="editorial-obj-3 w-full max-w-md">
            <KanbanDealSnippet className="shadow-2xl ring-2 ring-primary/30" />
          </div>
        </div>

        {/* =========================================================================
            SCENE 4: CONTROLE ("Tudo acontecendo. Nada escondido.")
           ========================================================================= */}
        <div className="editorial-scene editorial-scene-4 absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-between gap-6 sm:gap-8 z-40 opacity-0 translate-y-8">
          <div className="space-y-3.5 max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
              <ShieldCheck className="size-3.5" />
              <span>04 · Governança & Controle</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Tudo acontecendo. Nada escondido.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Auditoria em tempo real, tempos de resposta precisos e isolamento rigoroso de dados por conta. Tranquilidade para a liderança e clareza para a operação.
            </p>
          </div>

          <div className="editorial-obj-4 w-full max-w-md grid grid-cols-2 gap-2.5">
            <MetricSnippet 
              label="Tempo Médio 1ª Resposta" 
              value="1.4 min" 
              badge="-82% vs anterior" 
            />
            <MetricSnippet 
              label="Receita no Funil" 
              value="R$ 142.500" 
              badge="+34% este mês" 
            />
            <div className="col-span-2 p-3 rounded-2xl bg-card border border-border/80 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-foreground font-semibold">
                <ShieldCheck className="size-4 text-emerald-500" />
                Isolamento por Conta (Multi-tenant)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                Ativo & Seguro
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
