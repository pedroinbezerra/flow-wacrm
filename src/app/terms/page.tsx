import React from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { FileText, ShieldAlert, CheckCircle2, Scale, Cpu, Building2 } from "lucide-react";
import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = {
  title: "Termos de Uso | Flow Hub",
  description: "Termos e Condições de Uso da plataforma Flow Hub (FLOW SYSTEMS LTDA - CNPJ 62.479.299/0001-66).",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
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
            <Scale className="size-4" />
            Contrato de Licença de Uso de Software (SaaS)
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Termos e Condições de Uso
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.<br />
            Estes Termos regem a contratação da plataforma Flow Hub, operada por <strong>FLOW SYSTEMS LTDA</strong> (CNPJ 62.479.299/0001-66).
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" /> 1. Aceitação dos Termos & Objeto
            </h2>
            <p>
              O Flow Hub é uma plataforma SaaS para gestão de relacionamento com clientes (CRM), centralização de atendimentos no WhatsApp, automações e assistente de Inteligência Artificial. Ao criar uma conta ou utilizar o serviço, você declara ter lido, compreendido e aceito estes Termos de Uso e a{" "}
              <Link href="/privacy" className="text-primary underline font-medium">
                Política de Privacidade
              </Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Cpu className="size-5 text-purple-500" /> 2. Modelo "Traga sua Própria Credencial" (BYOK / BYOA)
            </h2>
            <p>
              A plataforma funciona sob o modelo BYOK (*Bring Your Own Key*) para a Meta WhatsApp Cloud API e BYOA (*Bring Your Own Agent*) para provedores de Inteligência Artificial. O Cliente é o único responsável por obter, configurar e manter a validade das credenciais e chaves de API junto a essas terceiras partes, bem como por arcar com eventuais custos de infraestrutura cobrados diretamente pela Meta ou provedores de IA.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-blue-500" /> 3. Responsabilidade do Usuário & Uso Aceitável
            </h2>
            <p>
              O Cliente compromete-se a utilizar a plataforma estritamente em conformidade com a legislação brasileira. É expressamente proibido:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs">
              <li>Realizar envio de mensagens não solicitadas (SPAM) ou violar os termos de política comercial do WhatsApp / Meta;</li>
              <li>Importar ou cadastrar dados pessoais de contatos sem a devida base legal prevista na LGPD;</li>
              <li>Transmitir conteúdos ilegais, difamatórios, discriminatórios ou que violem direitos de terceiros.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-500" /> 4. Conformidade com a LGPD e DPA
            </h2>
            <p>
              Nas operações de tratamento de dados dos contatos do WhatsApp do Cliente, o Cliente atua na condição de <strong>Controlador</strong> e a Flow Hub como <strong>Operadora</strong>. As regras detalhadas dessa relação estão dispostas no nosso{" "}
              <Link href="/dpa" className="text-primary underline font-medium">
                Acordo de Tratamento de Dados (DPA)
              </Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="size-5 text-emerald-500" /> 5. Cancelamento, Inadimplência e Foro
            </h2>
            <p>
              O cancelamento pode ser efetuado pelo painel da conta. Em caso de encerramento, aplica-se o período de carência de 90 (noventa) dias corridos para guarda de dados antes da eliminação definitiva. Este contrato é regido pelas leis brasileiras, sendo eleito o foro da Comarca de <strong>Fortaleza - CE</strong>.
            </p>
          </section>
        </div>

        {/* Contact DPO */}
        <section className="p-5 rounded-2xl border border-border bg-muted/20 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Dúvidas sobre os Termos ou Contratação?</p>
          <p>
            Encarregado de Dados (DPO):{" "}
            <a href="mailto:flowsystems@flowofc.com.br" className="text-primary underline font-medium">
              flowsystems@flowofc.com.br
            </a>
          </p>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
