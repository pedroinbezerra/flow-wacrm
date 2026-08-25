"use client";

import React from "react";
import { 
  Building2, 
  Tag, 
  Bot, 
  CheckCircle2, 
  Kanban, 
  Zap, 
  Clock, 
  Lock 
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Recorte de Ficha Unificada de Contato
 */
export function ContactCardSnippet({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xl space-y-3.5",
      className
    )}>
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm ring-1 ring-primary/30">
            MS
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Mariana Souza</h4>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
              <Building2 className="size-3 text-primary" /> Logística Expresso S/A
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
          Online
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="px-2 py-0.5 rounded-md bg-primary-soft text-primary text-[10px] font-medium border border-primary/20 flex items-center gap-1">
          <Tag className="size-2.5" /> VIP
        </span>
        <span className="px-2 py-0.5 rounded-md bg-primary-soft text-primary text-[10px] font-medium border border-primary/20 flex items-center gap-1">
          <Tag className="size-2.5" /> Contrato Corporativo
        </span>
        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium">
          WhatsApp Direct
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="p-2 rounded-xl bg-card-2 border border-border/50">
          <span className="text-[10px] text-muted-foreground block">Telefone</span>
          <span className="text-xs font-semibold text-foreground font-mono">+55 11 97654-3210</span>
        </div>
        <div className="p-2 rounded-xl bg-card-2 border border-border/50">
          <span className="text-[10px] text-muted-foreground block">Última Interação</span>
          <span className="text-xs font-semibold text-foreground">Agora</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Balão de Mensagem Individual
 */
export function MessageBubbleSnippet({ 
  sender, 
  text, 
  time, 
  variant = "user",
  className 
}: { 
  sender: string; 
  text: string; 
  time: string; 
  variant?: "user" | "bot" | "agent";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3.5 space-y-1 shadow-lg border max-w-[90%]",
        variant === "user" && "bg-card-2 text-foreground border-border/80 self-start",
        variant === "bot" && "bg-primary-soft text-foreground border-primary/30 ml-auto",
        variant === "agent" && "bg-primary-soft text-foreground border-primary/30 ml-auto",
        className
      )}
    >
      <div className="flex items-center justify-between text-[10px] text-foreground/70 gap-3">
        <span className="font-semibold text-foreground flex items-center gap-1">
          {variant === "bot" && <Bot className="size-3 text-primary" />}
          {sender}
        </span>
        <span className="font-mono">{time}</span>
      </div>
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  );
}

/**
 * Nota Interna Colaborativa da Equipe (com barra /)
 */
export function InternalNoteSnippet({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 shadow-md space-y-1.5",
      className
    )}>
      <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
        <span className="flex items-center gap-1.5">
          <Lock className="size-3" />
          Nota Interna Privada · Apenas Equipe
        </span>
        <span className="font-mono text-muted-foreground">14:34</span>
      </div>
      <p className="text-xs text-foreground leading-relaxed">
        <strong className="text-amber-700 dark:text-amber-300">@Ana</strong> cliente solicitou faturamento direto. O negócio já foi aberto no Funil com R$ 48.000.
      </p>
    </div>
  );
}

/**
 * Card de Negócio no Funil Kanban
 */
export function KanbanDealSnippet({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-primary/40 bg-card p-4 shadow-xl space-y-3 ring-1 ring-primary/20",
      className
    )}>
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Kanban className="size-3 text-primary" /> Funil Comercial
        </span>
        <span className="text-xs font-mono font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-md">
          R$ 48.000
        </span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-foreground">Logística Expresso S/A</h4>
        <p className="text-[11px] text-muted-foreground pt-0.5">Implantação de Envio Automático & WhatsApp Multiagente</p>
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px]">
        <span className="px-2 py-0.5 rounded bg-primary-soft text-primary border border-primary/25 font-medium">
          Em Negociação (75%)
        </span>
        <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
          <Clock className="size-3 text-muted-foreground" /> Hoje
        </span>
      </div>
    </div>
  );
}

/**
 * Card de Automação em Execução Silenciosa
 */
export function AutomationNodeSnippet({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-lg space-y-2.5",
      className
    )}>
      <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <span className="flex items-center gap-2">
          <Zap className="size-4 text-emerald-600 dark:text-emerald-400" />
          Disparo Automático em Execução
        </span>
        <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Monitor de Nuvem: PDF identificado via OCR (CNPJ 62.479...) e despachado sem retenção intermediária.
      </p>
      <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-medium">
        <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
        <span>Status: Entregue diretamente no WhatsApp</span>
      </div>
    </div>
  );
}

/**
 * Métrica Operacional Viva
 */
export function MetricSnippet({ 
  label, 
  value, 
  badge, 
  className 
}: { 
  label: string; 
  value: string; 
  badge?: string; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "rounded-2xl border border-border/80 bg-card p-4 shadow-lg space-y-1.5",
      className
    )}>
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
        {label}
      </span>
      <p className="text-xl font-bold font-mono text-foreground tracking-tight">{value}</p>
      {badge && (
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded inline-block">
          {badge}
        </span>
      )}
    </div>
  );
}
