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
            SCENE 1: CONTATO ("Nunca atender sem contexto")
           ========================================================================= */}
        <div className="editorial-scene editorial-scene-1 absolute inset-0 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 z-10">
          <div className="space-y-3.5 max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
              <Users className="size-3.5" />
              <span>01 · Contato</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Nunca atender sem contexto.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Cada contato traz histórico, anotações da equipe e negociações em andamento. Você sabe exatamente com quem está falando desde a primeira mensagem.
            </p>
          </div>

          <div className="editorial-obj-1 w-full max-w-md">
            <ContactCardSnippet className="border-primary/40 ring-1 ring-primary/20 shadow-2xl" />
          </div>
        </div>

        {/* =========================================================================
            SCENE 2: CONVERSA ("Toda a equipe no mesmo canal")
           ========================================================================= */}
        <div className="editorial-scene editorial-scene-2 absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-between gap-6 sm:gap-8 z-20 opacity-0 translate-y-8">
          <div className="space-y-3.5 max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
              <MessageSquare className="size-3.5" />
              <span>02 · Conversa</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Toda a equipe no mesmo canal.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Múltiplos membros atendem com o mesmo número. Anotações internas mantêm a equipe alinhada sem expor mensagens privadas para o contato.
            </p>
          </div>

          <div className="editorial-obj-2 w-full max-w-md space-y-2.5">
            <MessageBubbleSnippet 
              sender="IA da Operação"
              text="Fatura localizada no sistema. Posso enviar o documento ou transferir ao financeiro."
              time="14:36"
              variant="bot"
            />
            <InternalNoteSnippet />
          </div>
        </div>

        {/* =========================================================================
            SCENE 3: PROCESSO ("A conversa move o trabalho")
           ========================================================================= */}
        <div className="editorial-scene editorial-scene-3 absolute inset-0 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 z-30 opacity-0 translate-y-8">
          <div className="space-y-3.5 max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
              <Workflow className="size-3.5" />
              <span>03 · Processo</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              A conversa move o trabalho.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Cada mensagem atualiza etapas de vendas, organiza negociações e dispara tarefas sem exigir alternância de telas ou planilhas paralelas.
            </p>
          </div>

          <div className="editorial-obj-3 w-full max-w-md">
            <KanbanDealSnippet className="shadow-2xl ring-2 ring-primary/30" />
          </div>
        </div>

        {/* =========================================================================
            SCENE 4: RESULTADO ("Tudo visível. Nada disperso.")
           ========================================================================= */}
        <div className="editorial-scene editorial-scene-4 absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-between gap-6 sm:gap-8 z-40 opacity-0 translate-y-8">
          <div className="space-y-3.5 max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
              <ShieldCheck className="size-3.5" />
              <span>04 · Resultado</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Tudo visível. Nada disperso.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Métricas reais de atendimento, tempos de resposta claros e dados estritamente protegidos no espaço da sua conta. Tranquilidade para a liderança e agilidade para a equipe.
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
                Espaço exclusivo e protegido da sua conta
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
