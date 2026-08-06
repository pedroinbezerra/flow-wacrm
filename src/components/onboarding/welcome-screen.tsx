"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { saveTourCompletion } from "@/lib/onboarding/user-tours";
import { FlowLogo } from "@/components/layout/flow-logo";
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Zap,
  HeartHandshake,
  MessageSquare,
  Headphones,
  CheckCircle2,
} from "lucide-react";

export function WelcomeScreen() {
  const router = useRouter();
  const { user, account, profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const userName = profile?.full_name?.split(" ")[0] || "parceiro(a)";

  // Gravação automática e imediata no Banco de Dados (Supabase) assim que a tela é aberta
  React.useEffect(() => {
    if (!user?.id || !account?.id) return;
    const supabase = createClient();
    void saveTourCompletion(supabase, account.id, user.id, "welcome_screen");
    try {
      localStorage.setItem(`flow_welcome_seen_${user.id}`, "true");
    } catch (_e) {}
  }, [user?.id, account?.id]);

  // Marca a conclusão ao clicar em um botão e navega
  const completeWelcome = async (destinationUrl?: string) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (user?.id && account?.id) {
        const supabase = createClient();
        await saveTourCompletion(supabase, account.id, user.id, "welcome_screen");
      }
      if (user?.id) {
        try {
          localStorage.setItem(`flow_welcome_seen_${user.id}`, "true");
        } catch (_e) {}
      }
    } catch (err) {
      console.error("[welcome-screen] Erro ao marcar boas-vindas como concluída:", err);
    } finally {
      if (destinationUrl) {
        router.push(destinationUrl);
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-accent/15 p-6 sm:p-12 shadow-md">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-4" />
              Boas-vindas ao Flow Hub
            </div>

            <div className="flex items-center gap-2">
              <FlowLogo className="h-7 w-auto" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Olá, {userName}! Seja muito bem-vindo(a). 👋
            </h1>
            <p className="text-base text-foreground/80 sm:text-lg leading-relaxed max-w-3xl">
              Estamos muito felizes e ansiosos por estar juntos com você nesta jornada de crescimento e automação.
            </p>
          </div>

          {/* Destaque Institucional Flow Systems */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-semibold text-sm sm:text-base">
              <HeartHandshake className="size-5 shrink-0" />
              Nosso compromisso com você
            </div>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              Saiba que você <strong className="text-foreground font-semibold">não conta apenas com uma ferramenta poderosa</strong>. Conte com toda a equipe da <strong className="text-primary font-bold">Flow Systems</strong> para otimizar seus processos, evoluir seu atendimento e resolver qualquer problema sempre que precisar. Estamos ao seu lado em cada etapa!
            </p>
          </div>

          {/* Botões de Ação Principal */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => completeWelcome("/dashboard")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            >
              {submitting ? "Carregando..." : "Ir para o Dashboard"}
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => completeWelcome("/faq")}
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-5 py-3 text-sm font-medium text-foreground shadow-xs transition-all hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              <HelpCircle className="size-4 text-primary" />
              Ver Central de Ajuda & FAQ
            </button>
          </div>
        </div>

        {/* Círculos decorativos de fundo */}
        <div className="absolute -bottom-16 -right-16 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -left-16 size-60 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      </div>

      {/* 3 Pilares da Parceria Flow Systems */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2 shadow-xs transition-all hover:border-primary/40">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Tecnologia & Agilidade</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            WhatsApp API Oficial da Meta com disparo de mensagens, automações e atendimento multiagente em tempo real.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2 shadow-xs transition-all hover:border-primary/40">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
            </div>
          <h3 className="text-base font-semibold text-foreground">Evolução Contínua</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Constantes atualizações de recursos, melhorias na IA e acompanhamento dedicado às demandas da sua empresa.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2 shadow-xs transition-all hover:border-primary/40">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Headphones className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Suporte Flow Systems</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Time de especialistas pronto para apoiar sua operação, tirar dúvidas e otimizar seus fluxos de atendimento.
          </p>
        </div>
      </div>

      {/* Card de Recursos e Direcionamento ao Dashboard */}
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
            <CheckCircle2 className="size-4" />
            Primeiros passos na plataforma
          </div>
          <h3 className="text-base font-semibold text-foreground">Tudo pronto para começar!</h3>
          <p className="text-xs text-muted-foreground max-w-lg">
            Acesse o Dashboard para visualizar o resumo do seu atendimento e explorar todos os recursos em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={submitting}
            onClick={() => completeWelcome("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Acessar o Dashboard
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
