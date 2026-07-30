import React from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { ShieldCheck, Lock, Eye, FileText, UserCheck, Mail } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade (LGPD) | Flow WACRM",
  description: "Política de Privacidade e Proteção de Dados Pessoais do Flow WACRM em conformidade com a LGPD (Lei 13.709/2018).",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header / Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FlowLogo height={32} />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg text-xs transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Banner */}
        <div className="space-y-4 text-center md:text-left border-b border-border/50 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <ShieldCheck className="size-4" />
            Conformidade LGPD (Lei nº 13.709/2018)
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
            O Flow WACRM tem o compromisso de proteger sua privacidade e garantir total transparência no tratamento dos dados pessoais.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="size-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">1. Princípios e Coleta de Dados</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Coletamos apenas os dados estritamente necessários para prestação de serviços de CRM, gestão de atendimento via WhatsApp e automações. Todos os dados são isolados por conta (*Row Level Security*) e protegidos por criptografia em trânsito e em repouso.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Eye className="size-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">2. Uso de Inteligência Artificial</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nosso assistente de IA opera com total transparência e auditoria. Não utilizamos histórico de conversas dos seus clientes para treinamento de modelos globais de terceiros. Todas as execuções possuem logs auditáveis de segurança e suporte a transbordo humano.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="size-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <UserCheck className="size-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">3. Direitos do Titular (Art. 18 LGPD)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Garantimos aos titulares dos dados o exercício pleno de seus direitos: confirmação de tratamento, acesso aos dados, portabilidade (exportação em JSON), correção de dados incompletos e revogação do consentimento com anonimização/esquecimento.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="size-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">4. Integração WhatsApp & Meta API</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Utilizamos exclusivamente a API Oficial do WhatsApp Business (Meta Enterprise), garantindo acordos formais de processamento de dados (DPA) e respeito rigoroso às solicitações de descadastramento (*Opt-Out*) realizadas pelos usuários finais.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-sm text-muted-foreground border-t border-border/50 pt-8">
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">5. Retenção e Descarte de Dados</h3>
            <p>
              Os dados de cadastro e atendimento são mantidos enquanto a conta do cliente estiver ativa ou conforme exigido por obrigação legal/regulatória. O cliente pode solicitar a eliminação dos dados ou acionar as ferramentas automatizadas de anonimização do painel a qualquer momento.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">6. Contato do Encarregado pelo Tratamento de Dados (DPO)</h3>
            <p className="flex items-center gap-2">
              Para exercer seus direitos de titular ou tirar dúvidas sobre esta Política, entre em contato com nosso Encarregado de Dados pelo e-mail:
              <a href="mailto:dpo@flow-crm.com" className="text-primary underline hover:text-primary/90 font-medium inline-flex items-center gap-1">
                <Mail className="size-3.5" /> dpo@flow-crm.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Flow WACRM. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link href="/privacy" className="text-primary font-medium">Política de Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
