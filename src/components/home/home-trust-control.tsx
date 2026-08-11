"use client";

import React from "react";
import { 
  ShieldCheck, 
  Key, 
  HardDrive, 
  Lock, 
  FileCheck2, 
  Check, 
  ArrowRight
} from "lucide-react";

export function HomeTrustControl() {
  const pillars = [
    {
      icon: Key,
      badge: "Você no Controle",
      title: "Suas conexões permanecem sob seu controle",
      description: "Você conecta diretamente seu número oficial do WhatsApp e seus provedores de inteligência. Sem intermediários inflacionando custos por mensagem.",
      highlights: ["Preço de custo direto", "Sem intermediários de mensagem", "Zero aprisionamento a provedores"]
    },
    {
      icon: HardDrive,
      badge: "Seus Dados Continuam Seus",
      title: "Trabalhamos com seus arquivos sem tomar posse deles",
      description: "O envio automático de faturas e comprovantes lê os documentos diretamente do seu serviço de armazenamento habitual sem gravar cópias permanentes nos nossos servidores.",
      highlights: ["Leitura direta do seu armazenamento", "Envio automático sem retenção", "Trilha clara de auditoria"]
    },
    {
      icon: Lock,
      badge: "Seu Espaço Permanece Seu",
      title: "Cada operação permanece isolada e protegida",
      description: "Sua empresa possui um ambiente estritamente isolado com políticas de proteção no banco de dados. Os dados de uma conta jamais cruzam com os de outra.",
      highlights: ["Isolamento rigoroso por conta", "Controle de acesso por permissões", "Proteção nativa contra vazamento"]
    },
    {
      icon: FileCheck2,
      badge: "Transparência por Princípio",
      title: "Privacidade tratada com o respeito que seu cliente exige",
      description: "Acordo claro de tratamento de dados, termos transparentes e ferramentas nativas para atender a requisitos corporativos de privacidade.",
      highlights: ["Acordo de dados transparente", "Respeito à privacidade nativo", "Governança e conformidade claras"]
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-card/40 border-b border-border/40 relative">
      <div className="max-w-6xl mx-auto px-6 space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
            <ShieldCheck className="size-3.5" />
            <span>Paz de Espírito & Controle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Tranquilidade para sua equipe, controle total da sua operação.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Construído para empresas que exigem transparência de custos, proteção de dados e infraestrutura sólida.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-card border border-border/80 hover:border-border transition-all space-y-4 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-semibold">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-card-2 px-2.5 py-1 rounded-full border border-border/60">
                    {p.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <ul className="pt-2 space-y-2 text-xs text-foreground font-medium">
                  {p.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="size-3.5 text-emerald-500 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Security & Privacy Commitment */}
        <div className="p-6 rounded-2xl bg-card-2 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-primary">
              <ShieldCheck className="size-4" />
              <span>Privacidade & Segurança por Padrão</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              Infraestrutura em nuvem segura e protegida desde o primeiro acesso.
            </p>
            <p className="text-xs text-muted-foreground">
              Toda a comunicação trafega criptografada com isolamento estrito entre contas para a total tranquilidade da sua equipe.
            </p>
          </div>

          <a
            href="/security"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
          >
            <span>Conhecer nossa Política de Segurança & Privacidade</span>
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
