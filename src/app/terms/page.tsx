import React from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { FileText, ShieldAlert, CheckCircle2, Scale } from "lucide-react";

export const metadata = {
  title: "Termos de Uso | Flow WACRM",
  description: "Termos e Condições de Uso da plataforma Flow WACRM.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
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
            <Scale className="size-4" />
            Contrato de Licença de Uso de Software
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Termos e Condições de Uso
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
            Ao criar uma conta ou utilizar o Flow WACRM, você concorda com estes termos.
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" /> 1. Aceitação dos Termos
            </h2>
            <p>
              Estes Termos regem o acesso e a utilização dos serviços fornecidos pelo Flow WACRM. Caso você não concorde com qualquer disposição destes Termos, não deverá utilizar a plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-blue-500" /> 2. Descrição do Serviço & Responsabilidade do Usuário
            </h2>
            <p>
              O Flow WACRM é uma plataforma SaaS para gestão de relacionamentos com clientes, atendimentos centralizados no WhatsApp, automações e inteligência artificial. O Usuário é inteiramente responsável por:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs">
              <li>Obter o consentimento prévio e válido dos contatos importados para a plataforma;</li>
              <li>Respeitar as políticas comerciais e anticorrupção da Meta e do WhatsApp Cloud API;</li>
              <li>Não utilizar o serviço para envio de SPAM, conteúdos ilegais ou abusivos.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-500" /> 3. Conformidade com a LGPD
            </h2>
            <p>
              O contratante atua na condição de **Controlador** dos dados de seus clientes finais, cabendo ao Flow WACRM a condição de **Operador**. O Flow WACRM disponibiliza ferramentas para cumprimento das obrigações legais da LGPD, como exportação e anonimização de dados.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Scale className="size-5 text-purple-500" /> 4. Cancelamento e Encerramento
            </h2>
            <p>
              O Usuário pode cancelar sua assinatura a qualquer momento através do painel de configurações da conta. Após o encerramento, os dados serão mantidos conforme a Política de Privacidade ou até solicitação formal de exclusão.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Flow WACRM. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-primary font-medium">Termos de Uso</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
