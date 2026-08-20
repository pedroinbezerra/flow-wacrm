import React from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { FileText, ShieldCheck, Scale, CheckCircle2, Building2 } from "lucide-react";

export const metadata = {
  title: "Modelo de Acordo de Tratamento de Dados (DPA) | Flow Hub",
  description: "Acordo de Tratamento de Dados (Data Processing Addendum - DPA) padrão da plataforma Flow Hub em conformidade com a LGPD.",
};

export default function DpaPublicPage() {
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
            Minuta Padrão de Acordo de Tratamento de Dados (DPA)
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Acordo de Tratamento de Dados (DPA)
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Este instrumento estabelece os direitos, deveres e compromissos técnicos assumidos pela <strong>FLOW SYSTEMS LTDA</strong> na condição de Operadora perante seus Clientes Contratantes (Controladores).
          </p>
        </div>

        {/* Resumo do Contrato */}
        <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
            <Building2 className="size-4 text-primary" />
            <span>Partes Integrantes</span>
          </div>
          <p>
            <strong>Operadora:</strong> FLOW SYSTEMS LTDA, inscrita no CNPJ sob o nº 62.479.299/0001-66.<br />
            <strong>Controladora:</strong> Pessoa física ou jurídica contratante da plataforma Flow Hub.<br />
            <strong>Integração:</strong> Este DPA é parte integrante dos <Link href="/terms" className="text-primary underline">Termos de Uso</Link> do Flow Hub.
          </p>
        </div>

        {/* Cláusulas do DPA */}
        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              1. Objeto e Papéis das Partes (LGPD Art. 5º)
            </h2>
            <p>
              O Cliente, na qualidade de <strong>Controlador</strong> dos Dados dos Titulares (contatos geridos no CRM), contrata a Flow Hub para tratá-los como <strong>Operadora</strong>, estritamente para viabilizar o funcionamento da plataforma (CRM, atendimento via WhatsApp, automações e assistente de IA). A Flow Hub trata os dados apenas conforme instruções documentadas do Cliente.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              2. Não Utilização para Fins Próprios ou Treino de IA Globais
            </h2>
            <p>
              A Flow Hub não utiliza os Dados dos Titulares para finalidades comerciais próprias, publicidade ou criação de perfis. A Flow Hub garante expressamente que os dados de conversas e contatos mantidos na conta do Cliente não são utilizados para treinar ou aprimorar modelos de Inteligência Artificial globais de terceiros nem em benefício de outros clientes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              3. Medidas de Segurança Adotadas
            </h2>
            <p>
              A Flow Hub implementa mecanismos de criptografia em trânsito (TLS 1.3) e em repouso (AES-256), isolamento lógico atômico entre contas via Row Level Security (RLS), controle de acesso por papéis (RBAC), registro auditável de acessos e monitoramento de segurança contínuo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              4. Subprocessadores de Infraestrutura & Modelo BYOK / BYOA
            </h2>
            <p>
              O Cliente autoriza o uso dos subprocessadores essenciais de infraestrutura contratados pela Flow Hub (Supabase e Vercel). No que tange às integrações contratadas diretamente pelo Cliente (Meta WhatsApp Cloud API e Provedores de IA sob o modelo BYOK/BYOA), o Cliente permanece responsável pelas credenciais e termos de uso perante esses fornecedores.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              5. Notificação de Incidentes (Art. 48 LGPD)
            </h2>
            <p>
              Em caso de incidente de segurança confirmado que afete os Dados dos Titulares, a Flow Hub notificará o Cliente sem atraso indevido, fornecendo detalhes da ocorrência e medidas adotadas para que o Controlador cumpra suas obrigações perante a ANPD e os titulares.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              6. Retenção, Carência e Descarte
            </h2>
            <p>
              Encerrada a relação contratual, aplica-se o período de carência de 90 (noventa) dias corridos, findo o qual os dados serão definitivamente excluídos ou anonimizados, respeitadas obrigações legais de guarda fiscal/contábil.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              7. Foro
            </h2>
            <p>
              Este instrumento é regido pelas leis da República Federativa do Brasil, ficando eleito o foro da Comarca de <strong>Fortaleza - CE</strong> para dirimir quaisquer controvérsias.
            </p>
          </section>
        </div>

        {/* DPO Footer box */}
        <div className="p-5 rounded-2xl border border-border bg-card text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Encarregado pelo Tratamento de Dados Pessoais (DPO)</p>
          <p>
            FLOW SYSTEMS LTDA — E-mail:{" "}
            <a href="mailto:flowsystems@flowofc.com.br" className="text-primary underline">
              flowsystems@flowofc.com.br
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
