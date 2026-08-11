"use client";

import React, { useState } from "react";
import { 
  UserCheck, 
  MessageSquareText, 
  Workflow, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Kanban,
  Tag,
  Building2,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonPreview {
  header: string;
  contactName: string;
  phone: string;
  company: string;
  tags: string[];
  fields: { label: string; value: string }[];
  notes: string;
}

interface ConversationPreview {
  header: string;
  messages: { sender: string; text: string; time: string; isBot?: boolean }[];
}

interface ProcessPreview {
  header: string;
  pipelineStage: string;
  dealValue: string;
  automationTrigger: string;
  documentMonitor: string;
}

interface ResultPreview {
  header: string;
  metrics: { label: string; value: string; change: string }[];
}

const personData: PersonPreview = {
  header: "Ficha Unificada do Contato",
  contactName: "Mariana Souza",
  phone: "+55 11 97654-3210",
  company: "Logística Expresso S/A",
  tags: ["VIP", "Lead Inbound", "Contrato Anual"],
  fields: [
    { label: "Segmento", value: "Transportes & Logística" },
    { label: "Origem", value: "Campanha WhatsApp Direct" },
    { label: "Última Interação", value: "Hoje às 14:15" }
  ],
  notes: "Cliente interessado no envio automático de comprovantes de entrega."
};

const conversationData: ConversationPreview = {
  header: "Atendimento Colaborativo em Tempo Real",
  messages: [
    { sender: "Mariana Souza", text: "Preciso enviar os comprovantes de entrega diariamente para 200 clientes. Como funciona a entrega automática?", time: "14:15" },
    { sender: "FlowHub IA", text: "Olá Mariana! O FlowHub monitora sua pasta no Google Drive ou S3, lê o CPF/CNPJ pelo arquivo e dispara via WhatsApp sem armazenar o PDF nos nossos servidores.", time: "14:15", isBot: true },
    { sender: "Mariana Souza", text: "Excelente! Posso agendar uma demonstração técnica?", time: "14:16" },
    { sender: "Agente (Roberto)", text: "Com certeza, Mariana! Vou abrir o negócio no nosso Pipeline e agendar o horário.", time: "14:16" }
  ]
};

const processData: ProcessPreview = {
  header: "Execução de Processos Conectados",
  pipelineStage: "Em Negociação (Probabilidade 75%)",
  dealValue: "R$ 36.000 / ano",
  automationTrigger: "Robô de Triagem: Menu de Atendimento Ativo",
  documentMonitor: "Monitorando Google Drive / Comprovantes 2026 (Zero Retenção)"
};

const resultData: ResultPreview = {
  header: "Impacto Operacional & Previsão Comercial",
  metrics: [
    { label: "Tempo Médio 1ª Resposta", value: "1.4 min", change: "-82% vs anterior" },
    { label: "Valor Ponderado do Pipeline", value: "R$ 142.500", change: "+34% este mês" },
    { label: "Documentos Entregues", value: "1.240 arquivos", change: "100% auditado" }
  ]
};

export function HomeContinuumFlow() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: "person",
      number: "01",
      icon: UserCheck,
      title: "Pessoa",
      subtitle: "Identidade & Histórico do Cliente",
      description: "Tudo começa no contato. Cada cliente que chama no WhatsApp chega com suas tags, campos personalizados, histórico de conversas e notas internas unificadas.",
      badge: "Contexto Único"
    },
    {
      id: "conversation",
      number: "02",
      icon: MessageSquareText,
      title: "Conversa",
      subtitle: "Caixa de Entrada & Inteligência Colaborativa",
      description: "Atendimento centralizado com múltiplos agentes em um só número. Se a conversa exigir, a IA atende com a base de conhecimento do seu negócio e faz transição humana transparente.",
      badge: "Multi-atendente & IA"
    },
    {
      id: "process",
      number: "03",
      icon: Workflow,
      title: "Processo",
      subtitle: "Fluxos Visuais, Kanban & Disparo de Documentos",
      description: "Sem trocar de aplicativo, a conversa se conecta a um nó de automação no-code, atualiza a etapa no funil comercial e aciona o monitor de documentos externos.",
      badge: "Zero Troca de Contexto"
    },
    {
      id: "result",
      number: "04",
      icon: TrendingUp,
      title: "Resultado",
      subtitle: "Previsão Comercial, Tempo de Resposta & Auditoria",
      description: "O ciclo se fecha com dados concretos: receita ponderada prevista, redução do tempo de primeira resposta da equipe e rastreabilidade total de cada execução.",
      badge: "Métricas de Impacto"
    }
  ];

  return (
    <section id="continuum" className="py-20 md:py-28 bg-background border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20">
            <Workflow className="size-3.5" />
            <span>A Jornada Unificada</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Do primeiro contato ao resultado de negócios em uma experiência contínua
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            No FlowHub, as pessoas, as conversas, os processos e os resultados não vivem em sistemas separados. Tudo acontece no mesmo ambiente de trabalho.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "p-5 rounded-2xl text-left border transition-all relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-ring",
                  isActive
                    ? "bg-card border-primary shadow-lg ring-1 ring-primary/30"
                    : "bg-card/50 border-border/70 hover:bg-card hover:border-border"
                )}
              >
                <div className="flex items-center justify-between pb-3">
                  <span className={cn(
                    "text-xs font-mono font-bold px-2 py-0.5 rounded-md",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {step.number}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {step.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <Icon className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  <h3 className="font-semibold text-foreground text-base">{step.title}</h3>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {step.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Continuum Interactive Demonstration Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                <span className="size-2 rounded-full bg-primary animate-ping" />
                <span>Etapa {steps[activeStep].number} do Fluxo Operacional</span>
              </div>

              <h3 className="text-2xl font-bold text-foreground">
                {steps[activeStep].subtitle}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {steps[activeStep].description}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <span>Avançar para a próxima etapa</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Right Live Simulation Column */}
            <div className="lg:col-span-7 border border-border/80 rounded-xl bg-background p-5 space-y-4 shadow-inner">
              {/* Render dynamic preview according to active step */}
              {activeStep === 0 && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-primary" />
                      {personData.header}
                    </span>
                    <span className="text-[10px] text-muted-foreground">FlowHub Operations Engine</span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-4">
                    <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      MS
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-foreground text-sm">{personData.contactName}</h4>
                        <span className="text-muted-foreground text-[11px]">{personData.phone}</span>
                      </div>
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-primary" /> {personData.company}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {personData.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-primary-soft text-primary text-[10px] font-medium flex items-center gap-1">
                            <Tag className="size-2.5" /> {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {personData.fields.map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-card-2 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block">{f.label}</span>
                        <span className="font-semibold text-foreground text-[11px]">{f.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/90 text-[11px]">
                    <strong>Nota Interna da Equipe:</strong> {personData.notes}
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-primary" />
                      {conversationData.header}
                    </span>
                    <span className="text-[10px] text-muted-foreground">FlowHub Operations Engine</span>
                  </div>

                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {conversationData.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-xl max-w-[88%] space-y-1",
                          msg.sender === "Mariana Souza"
                            ? "bg-card text-foreground border border-border self-start"
                            : msg.isBot
                            ? "bg-purple-500/10 text-purple-200 border border-purple-500/20 ml-auto"
                            : "bg-primary-soft/60 text-foreground border border-primary/20 ml-auto"
                        )}
                      >
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                          <span className="font-semibold">{msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-primary" />
                      {processData.header}
                    </span>
                    <span className="text-[10px] text-muted-foreground">FlowHub Operations Engine</span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Kanban className="size-4 text-primary" /> Estágio Comercial no Kanban:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary-soft text-primary font-bold">
                        {processData.dealValue}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-medium">{processData.pipelineStage}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card-2 border border-border/80 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      <Bot className="size-4" />
                      <span>{processData.automationTrigger}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Menu de botões no WhatsApp ativo para triagem automática antes do atendimento.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card-2 border border-border/80 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <Zap className="size-4" />
                      <span>{processData.documentMonitor}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Identificação automática por CNPJ com leitura por OCR e envio seguro sem gravação em nuvem intermediária.
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-primary" />
                      {resultData.header}
                    </span>
                    <span className="text-[10px] text-muted-foreground">FlowHub Operations Engine</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {resultData.metrics.map((m, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-card border border-border space-y-1.5">
                        <span className="text-[10px] text-muted-foreground block font-medium">{m.label}</span>
                        <p className="text-lg font-bold text-foreground font-mono">{m.value}</p>
                        <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block">
                          {m.change}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-card-2 border border-border text-muted-foreground text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      Trilha de Auditoria & Governança 100% preservada
                    </span>
                    <span className="font-mono text-primary">Conta Multi-tenant Ativa</span>
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
