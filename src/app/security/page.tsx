import React from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  ShieldCheck,
  Lock,
  Server,
  KeyRound,
  FileCheck,
  RefreshCw,
  EyeOff,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Segurança e Compliance | Flow Hub",
  description: "Conheça o compromisso da Flow Hub com a segurança da informação, criptografia, isolamento multitenant e conformidade LGPD.",
};

export default function SecurityPublicPage() {
  const securityPillars = [
    {
      icon: Lock,
      title: "1. Criptografia em Trânsito e em Repouso",
      description:
        "Todas as conexões com o Flow Hub são protegidas por criptografia moderna TLS 1.3 via HTTPS. No banco de dados e no armazenamento de mídias (Supabase Storage), os dados em repouso utilizam criptografia forte AES-256.",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: Server,
      title: "2. Isolamento Multitenant Rigoroso (RLS)",
      description:
        "Utilizamos arquitetura multitenant com Row Level Security (RLS) diretamente na camada de banco de dados PostgreSQL. As queries são obrigatoriamente filtradas pelo account_id, impedindo vazamento de dados entre contas.",
      color: "text-primary bg-primary/10",
    },
    {
      icon: KeyRound,
      title: "3. Controle de Acesso Baseado em Papéis (RBAC)",
      description:
        "O acesso às contas é limitado a usuários explicitamente convidados. Perfis granulares (Proprietário, Administrador, Agente, Visualizador) garantem que cada operador acesse apenas as funções e dados necessários para seu trabalho.",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: EyeOff,
      title: "4. Privacidade em Inteligência Artificial (BYOA)",
      description:
        "O assistente de IA opera de forma isolada. O Flow Hub não utiliza dados ou conversas de clientes para treinamento de modelos de inteligência artificial de terceiros, preservando o sigilo comercial e a privacidade.",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      icon: RefreshCw,
      title: "5. Backups Diários e Resiliência",
      description:
        "Possuímos rotinas automatizadas de backup do banco de dados com retenção segura e redundância geográfica em data centers certificados (SOC 2, ISO 27001), garantindo recuperação em casos de desastre.",
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: FileCheck,
      title: "6. Gestão de Vulnerabilidades e Incidentes",
      description:
        "Manteremos Plano de Resposta a Incidentes estruturado para conter, avaliar e notificar eventuais anomalias técnicas com agilidade, em total respeito ao Art. 48 da LGPD.",
      color: "text-rose-500 bg-rose-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FlowLogo height={32} />
          </Link>
          <PublicHeaderNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Banner */}
        <div className="space-y-4 text-center md:text-left border-b border-border/50 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <ShieldCheck className="size-4" />
            Compromisso de Segurança da Informação
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Como Protegemos Seus Dados no Flow Hub
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            A FLOW SYSTEMS LTDA (CNPJ 62.479.299/0001-66) adota práticas reconhecidas de mercado para garantir confidencialidade, integridade e disponibilidade da plataforma.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {securityPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border bg-card/60 space-y-3 shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className={`size-10 rounded-lg flex items-center justify-center ${pillar.color}`}>
                  <Icon className="size-5" />
                </div>
                <h2 className="text-base font-semibold text-foreground">{pillar.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Seção de Contato DPO */}
        <section className="p-6 rounded-2xl border border-border bg-muted/20 space-y-3 text-xs text-muted-foreground">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            Dúvidas sobre Segurança ou Auditoria?
          </h3>
          <p className="leading-relaxed">
            Caso sua empresa necessite de informações adicionais sobre conformidade, questionários de segurança B2B ou detalhes do nosso Plano de Resposta a Incidentes, entre em contato com nosso DPO pelo e-mail{" "}
            <a href="mailto:flowsystems@flowofc.com.br" className="text-primary underline font-medium">
              flowsystems@flowofc.com.br
            </a>.
          </p>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
