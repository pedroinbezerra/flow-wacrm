import React from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { ShieldCheck, Lock, Eye, FileText, UserCheck, Mail, Cookie, Clock, Server } from "lucide-react";
import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = {
  title: "Política de Privacidade (LGPD) | Flow Hub",
  description: "Política de Privacidade e Proteção de Dados Pessoais do Flow Hub (FLOW SYSTEMS LTDA - CNPJ 62.479.299/0001-66) em conformidade com a LGPD.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header / Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FlowLogo height={44} />
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
            Conformidade LGPD (Lei nº 13.709/2018)
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.<br />
            O Flow Hub, operado pela <strong>FLOW SYSTEMS LTDA</strong> (CNPJ 62.479.299/0001-66), tem o compromisso de proteger sua privacidade e garantir total transparência no tratamento de dados pessoais.
          </p>
        </div>

        {/* Papéis de Tratamento */}
        <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-3 text-xs leading-relaxed text-muted-foreground">
          <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <UserCheck className="size-4 text-primary" />
            1. Definição de Papéis: Controlador vs. Operador
          </h2>
          <p>
            <strong>Como Controladora:</strong> A Flow Hub trata os dados cadastrais, financeiros e de acesso dos seus clientes contratantes (empresas e usuários logados) para viabilizar a prestação de serviços SaaS, faturamento e suporte.<br />
            <strong>Como Operadora:</strong> A Flow Hub trata os dados dos contatos finais (pessoas que conversam no WhatsApp com o negócio do cliente). Nesses casos, a empresa cliente é a <strong>Controladora</strong> dos dados e a Flow Hub atua estritamente sob as configurações e instruções do cliente.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="size-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">2. Coleta e Isolamento de Dados</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Coletamos apenas os dados estritamente necessários para prestação de serviços de CRM e automações no WhatsApp. Todos os dados são isolados logicamente por conta (*Row Level Security*) e protegidos por criptografia em trânsito (TLS 1.3) e em repouso (AES-256).
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Eye className="size-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">3. Privacidade no Uso de IA (BYOA)</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sob o modelo *Bring Your Own Agent*, os assistentes de IA utilizam integrações diretas. Não utilizamos histórico de conversas nem dados dos seus clientes para treinamento de modelos de inteligência artificial de terceiros ou globais.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="size-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <UserCheck className="size-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">4. Direitos do Titular (Art. 18 LGPD)</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Garantimos aos titulares o pleno exercício de seus direitos: confirmação de tratamento, acesso, correção, eliminação, portabilidade e revogação do consentimento. Solicitações podem ser abertas na nossa página dedicada{" "}
              <Link href="/lgpd" className="text-primary underline font-medium">
                Solicitações LGPD
              </Link>.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/50 space-y-3">
            <div className="size-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">5. WhatsApp & Meta Cloud API (BYOK)</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Utilizamos a API Oficial do WhatsApp Business (Meta Enterprise) no modelo de credenciais próprias do cliente (*Bring Your Own Key*), assegurando acordos formais de processamento de dados e suporte a mecanismos de *Opt-Out*.
            </p>
          </div>
        </div>

        {/* Retenção e Descarte */}
        <section className="space-y-3 border-t border-border/50 pt-8 text-xs text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            6. Ciclo de Retenção e Eliminação de Dados
          </h2>
          <p className="leading-relaxed">
            Conforme formalizado na nossa Política de Retenção e Eliminação de Dados, os dados permanecem armazenados durante a vigência do contrato. Em caso de encerramento da assinatura ou inadimplência não regularizada, aplica-se um período de carência de <strong>90 (noventa) dias corridos</strong> com dados intactos. Findo esse prazo, inicia-se a exclusão definitiva ou pseudonimização/anonimização automatizada, respeitadas obrigações legais de guarda fiscal e contábil.
          </p>
        </section>

        {/* Subprocessadores e Cookies */}
        <section className="space-y-3 text-xs text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Server className="size-4 text-primary" />
            7. Subprocessadores e Cookies
          </h2>
          <p className="leading-relaxed">
            Para consultar a lista completa dos nossos operadores de infraestrutura (Supabase, Vercel, Meta, Asaas etc.), acesse a nossa página de{" "}
            <Link href="/subprocessadores" className="text-primary underline font-medium">
              Subprocessadores
            </Link>. Para entender os cookies de sessão e análise, consulte nossa{" "}
            <Link href="/cookies" className="text-primary underline font-medium">
              Política de Cookies
            </Link>.
          </p>
        </section>

        {/* DPO Contact */}
        <section className="space-y-2 text-xs text-muted-foreground border-t border-border/50 pt-8">
          <h2 className="text-base font-semibold text-foreground">8. Contato do Encarregado de Proteção de Dados (DPO)</h2>
          <p className="flex items-center gap-2">
            Para dúvidas sobre esta política ou temas de privacidade, contate nosso Encarregado pelo e-mail:
            <a href="mailto:flowsystems@flowofc.com.br" className="text-primary underline hover:text-primary/90 font-medium inline-flex items-center gap-1">
              <Mail className="size-3.5" /> flowsystems@flowofc.com.br
            </a>
          </p>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
