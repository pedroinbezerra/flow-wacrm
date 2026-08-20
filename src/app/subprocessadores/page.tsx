import React from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { ShieldCheck, Server, Globe2, Layers, Cpu, Lock } from "lucide-react";

export const metadata = {
  title: "Subprocessadores e Fornecedores | Flow Hub",
  description: "Inventário público de operadores e fornecedores de infraestrutura da plataforma Flow Hub em conformidade com a LGPD.",
};

export default function SubprocessorsPage() {
  const subprocessors = [
    {
      name: "Supabase Inc.",
      role: "Banco de dados PostgreSQL, Autenticação SSR e Storage de mídias",
      region: "EUA (us-east-1, Norte da Virgínia)",
      data: "Todos os dados cadastrais e operacionais tratados na plataforma",
      category: "Infraestrutura Core",
    },
    {
      name: "Vercel Inc.",
      role: "Hospedagem da aplicação web e computação em borda (Edge)",
      region: "EUA",
      data: "Logs técnicos de requisições e dados em trânsito",
      category: "Infraestrutura Core",
    },
    {
      name: "Meta Platforms, Inc.",
      role: "API Oficial do WhatsApp Business (Modelo BYOK — Traga sua Credencial)",
      region: "EUA",
      data: "Mensagens, números de telefone e mídias trocadas com contatos finais",
      category: "Integração Principal",
    },
    {
      name: "Provedor de IA (ex: OpenAI Inc.)",
      role: "Assistente de atendimento e automação por Inteligência Artificial (BYOA)",
      region: "EUA / Variável conforme escolha do cliente",
      data: "Conteúdo de mensagens processadas pelo assistente configurado",
      category: "Inteligência Artificial",
    },
    {
      name: "Asaas Soluções de Pagamento S.A.",
      role: "Processamento de cobranças, assinaturas e emissão de notas fiscais (NF-e)",
      region: "Brasil",
      data: "Dados cadastrais, financeiros e fiscais (CPF/CNPJ, razão social)",
      category: "Faturamento & Fiscal",
    },
    {
      name: "Google LLC",
      role: "Google Analytics 4 (Métricas agregadas de usabilidade)",
      region: "EUA",
      data: "Dados de navegação anonimizados (exclusivamente mediante consentimento)",
      category: "Métricas & Desempenho",
    },
    {
      name: "Microsoft Corporation",
      role: "Microsoft Clarity (Diagnóstico de experiência de usuário e mapa de calor)",
      region: "EUA",
      data: "Dados de interação em tela (exclusivamente mediante consentimento)",
      category: "Métricas & Desempenho",
    },
  ];

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
            <ShieldCheck className="size-4" />
            Transparência & Governança (Art. 37 LGPD)
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Lista de Subprocessadores de Dados
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Para prestar nossos serviços com alta disponibilidade, segurança e transparência, o Flow Hub contrata parceiros tecnológicos de infraestrutura e processamento de dados.
          </p>
        </div>

        {/* Modelo BYOK / BYOA Warning */}
        <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-2 text-xs leading-relaxed text-muted-foreground">
          <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Cpu className="size-4 text-primary" />
            Modelo "Traga sua Própria Credencial" (BYOK / BYOA)
          </h2>
          <p>
            Diferenciamos os fornecedores de infraestrutura direta do Flow Hub daqueles configurados diretamente pelo cliente (ex: token da Meta WhatsApp API e chaves de IA do próprio cliente). Em relação às integrações próprias do cliente, a contratação e a gestão da relação ocorrem diretamente entre o cliente (Controlador) e o provedor correspondente.
          </p>
        </div>

        {/* Tabela de Subprocessadores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Server className="size-5 text-primary" />
              Inventário de Subprocessadores e Operadores
            </h2>
            <span className="text-xs text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold bg-muted/40">
                    <th className="p-3.5">Subprocessador</th>
                    <th className="p-3.5">Função no Flow Hub</th>
                    <th className="p-3.5">Região / Transferência</th>
                    <th className="p-3.5">Dados Envolvidos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-muted-foreground">
                  {subprocessors.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 font-medium text-foreground align-top">
                        <div className="space-y-1">
                          <span className="text-sm">{item.name}</span>
                          <span className="block text-[10px] text-primary/90 bg-primary/10 px-2 py-0.5 rounded-full w-fit font-medium">
                            {item.category}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 align-top leading-relaxed text-foreground/90">
                        {item.role}
                      </td>
                      <td className="p-3.5 align-top">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Globe2 className="size-3.5 text-muted-foreground shrink-0" />
                          <span>{item.region}</span>
                        </div>
                      </td>
                      <td className="p-3.5 align-top leading-relaxed">
                        {item.data}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Garantia de Segurança & Notificação de Mudanças */}
        <section className="p-6 rounded-2xl border border-border bg-card/50 space-y-3 text-xs text-muted-foreground">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Lock className="size-4 text-emerald-500" />
            Compromisso de Segurança e Notificação aos Clientes
          </h3>
          <p className="leading-relaxed">
            Todos os subprocessadores contratados pela FLOW SYSTEMS LTDA passam por rigorosa avaliação de segurança e estão sujeitos a obrigações contratuais de confidencialidade, criptografia e proteção de dados equivalentes às normas da LGPD. Clientes contratantes serão notificados sobre eventuais substituições ou inclusões relevantes de subprocessadores de infraestrutura.
          </p>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
