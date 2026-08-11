"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  MessageSquare, 
  Kanban, 
  Bot, 
  Building2,
  Tag,
  ShieldCheck,
  LayoutDashboard,
  CheckCircle2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function HomeHero() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"inbox" | "kanban" | "ai">("inbox");

  const simulatedMessages = [
    { sender: "Contato", text: "Olá! Gostaria de consultar a proposta comercial para minha empresa.", time: "14:32" },
    { sender: "FlowHub IA", text: "Olá! Seja bem-vindo à nossa empresa. Sou o assistente virtual. Posso apresentar os detalhes e conectar você ao consultor responsável.", time: "14:32", isBot: true },
    { sender: "Contato", text: "Perfeito, gostaria de falar com o consultor comercial.", time: "14:33" },
    { sender: "Agente (Carlos)", text: "Olá! Sou o Carlos da equipe comercial. Já vinculei seu atendimento ao Funil de Vendas e estou enviando nossa proposta.", time: "14:33" }
  ];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40">
      {/* Background ambient light */}
      <div className="aria-hidden:true pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-25 dark:opacity-15">
        <div className="h-[550px] w-[550px] rounded-full bg-primary/20 blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {/* Header Content */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Motto Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20 backdrop-blur-sm shadow-sm">
            <Sparkles className="size-3.5" />
            <span>Fazer o extraordinário parecer natural.</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
            Sua empresa não precisa de cinco ferramentas diferentes para vender pelo WhatsApp.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Pare de alternar entre abas, planilhas e sistemas separados. O FlowHub reúne atendimento, equipe, inteligência e vendas em um único ambiente onde tudo simplesmente flui.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <LayoutDashboard className="size-4" />
                <span>Ir para o Dashboard</span>
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span>Começar Agora</span>
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-card border border-border hover:bg-card-2 text-foreground font-medium px-6 py-3.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span>Entrar no Sistema</span>
                </Link>
              </>
            )}

            <a
              href="#flow-concept"
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById("flow-concept");
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 font-medium"
            >
              <span>Ver como flui</span>
              <ArrowRight className="size-3" />
            </a>
          </div>

          {/* Trust points - Human consequences */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              <span>Sem custos ocultos por mensagem</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>Conexão direta ao WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="size-4 text-primary" />
              <span>Seus dados protegidos e isolados</span>
            </div>
          </div>
        </div>

        {/* Workspace Preview Mockup - Pure Serene Convergence */}
        <div className="relative mx-auto max-w-5xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden transition-all">
          {/* Top Bar */}
          <div className="bg-card-2 border-b border-border/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-red-500/80 inline-block" />
                <span className="size-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="size-3 rounded-full bg-green-500/80 inline-block" />
              </div>
              <div className="h-4 w-px bg-border mx-1" />
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Building2 className="size-3.5 text-primary" />
                <span>FlowHub Operations Workspace</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px]">
                  Operação em Tempo Real
                </span>
              </div>
            </div>

            {/* Quiet Switcher */}
            <div className="flex items-center gap-1 bg-background/60 p-1 rounded-lg border border-border/60 text-xs">
              <button
                onClick={() => setActiveTab("inbox")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium",
                  activeTab === "inbox"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquare className="size-3.5" />
                <span>Conversa</span>
              </button>
              <button
                onClick={() => setActiveTab("kanban")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium",
                  activeTab === "kanban"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Kanban className="size-3.5" />
                <span>Funil de Vendas</span>
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium",
                  activeTab === "ai"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Bot className="size-3.5" />
                <span>Inteligência</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview Body */}
          <div className="p-4 sm:p-6 min-h-[380px] bg-background/50 flex flex-col justify-between">
            {activeTab === "inbox" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full animate-in fade-in-50 duration-300 ease-out">
                {/* Conversation List */}
                <div className="md:col-span-4 border border-border/70 rounded-xl bg-card p-3 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-1 border-b border-border/40 flex justify-between items-center">
                    <span>Conversas Ativas</span>
                    <span className="text-[10px] bg-primary-soft text-primary px-1.5 py-0.5 rounded font-mono">4 online</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-primary-soft/40 border border-primary/20 flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      TS
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-foreground truncate">Tech Solutions Ltda</p>
                        <span className="text-[10px] text-muted-foreground">14:33</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">Atendimento vinculado ao Funil de Vendas...</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium flex items-center gap-1">
                          <Tag className="size-2.5" /> Contato Prioritário
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg hover:bg-card-2 border border-transparent flex items-start gap-3 opacity-70">
                    <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0">
                      MB
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-foreground truncate">Mercado & Bens</p>
                        <span className="text-[10px] text-muted-foreground">12:10</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">Boleto e comprovante entregues diretamente.</p>
                    </div>
                  </div>
                </div>

                {/* Message Thread */}
                <div className="md:col-span-8 border border-border/70 rounded-xl bg-card p-4 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        TS
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">Tech Solutions Ltda (+55 11 98877-6655)</h4>
                        <p className="text-[10px] text-muted-foreground">Responsável: Carlos (Comercial) · Atendimento sem troca de contexto</p>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded bg-card-2 border border-border text-[11px] text-foreground font-medium flex items-center gap-1.5">
                      <Kanban className="size-3 text-primary" />
                      <span>Funil: Negociação (R$ 48.000)</span>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 text-xs">
                    {simulatedMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "max-w-[85%] rounded-xl p-3 space-y-1 transition-all",
                          msg.sender === "Contato"
                            ? "bg-card-2 text-foreground border border-border/60 self-start"
                            : msg.isBot
                            ? "bg-purple-500/10 text-purple-200 border border-purple-500/20 ml-auto"
                            : "bg-primary-soft/50 text-foreground border border-primary/20 ml-auto"
                        )}
                      >
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground gap-2">
                          <span className="font-semibold">{msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="Digite para responder ou aperte '/' para notas internas..."
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground focus:outline-none cursor-default"
                    />
                    <button className="bg-primary text-primary-foreground font-medium px-3.5 py-2 rounded-lg text-xs shrink-0">
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "kanban" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full animate-in fade-in-50 duration-300 ease-out">
                <div className="border border-border/70 rounded-xl bg-card p-3 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-foreground border-b border-border/40 pb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-blue-500" />
                      Novo Contato
                    </span>
                    <span className="text-[10px] text-muted-foreground">R$ 15.000</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card-2 border border-border/80 space-y-2 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-foreground">Grupo Alfa Brasil</span>
                      <span className="text-[10px] font-mono text-primary bg-primary-soft px-1.5 py-0.5 rounded">R$ 15.000</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Entrega de comprovantes pelo WhatsApp.</p>
                  </div>
                </div>

                <div className="border border-border/70 rounded-xl bg-card p-3 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-foreground border-b border-border/40 pb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-purple-500" />
                      Em Negociação
                    </span>
                    <span className="text-[10px] text-muted-foreground">R$ 48.000</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card-2 border border-primary/40 space-y-2 shadow-sm ring-1 ring-primary/20">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-foreground">Tech Solutions Ltda</span>
                      <span className="text-[10px] font-mono text-primary bg-primary-soft px-1.5 py-0.5 rounded">R$ 48.000</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Proposta comercial vinculada ao atendimento.</p>
                  </div>
                </div>

                <div className="border border-border/70 rounded-xl bg-card p-3 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-foreground border-b border-border/40 pb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      Fechado Ganho
                    </span>
                    <span className="text-[10px] text-muted-foreground">R$ 92.000</span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-foreground">Distribuidora Hards</span>
                      <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">R$ 92.000</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Contrato assinado em execução automática.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="border border-border/70 rounded-xl bg-card p-4 space-y-4 animate-in fade-in-50 duration-300 ease-out">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="size-5 text-primary" />
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Atendimento Inteligente</h4>
                      <p className="text-[10px] text-muted-foreground">A IA entende o contexto e responde sem interromper a equipe</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ativo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-card-2 border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground">Base de Conhecimento</span>
                    <p className="font-semibold text-foreground">Conhecimento real do negócio</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card-2 border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground">Transição Humana</span>
                    <p className="font-semibold text-foreground">Transfere quando necessário</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card-2 border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground">Sem Ruído</span>
                    <p className="font-semibold text-foreground">Naturalidade acima de tudo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
