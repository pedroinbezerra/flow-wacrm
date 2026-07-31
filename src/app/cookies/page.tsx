import React from "react";
import Link from "next/link";
import { FlowLogo } from "@/components/layout/flow-logo";
import { ShieldCheck, Cookie, Lock, BarChart3, HelpCircle, CheckCircle2 } from "lucide-react";
import { CookiePreferencesTrigger } from "@/components/cookies/cookie-preferences-trigger";
import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = {
  title: "Política de Cookies (LGPD) | Flow Hub",
  description: "Política de Cookies do Flow Hub (FLOW SYSTEMS LTDA - CNPJ 62.479.299/0001-66) em conformidade com a LGPD.",
};

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header / Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FlowLogo height={32} />
          </Link>
          <PublicHeaderNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Banner de Apresentação */}
        <div className="space-y-4 text-center md:text-left border-b border-border/50 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <ShieldCheck className="size-4" />
            Conformidade LGPD (Lei nº 13.709/2018)
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Política de Cookies e Transparência
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl">
                Última atualização: {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}.<br />
                FLOW SYSTEMS LTDA (CNPJ 62.479.299/0001-66) — Saiba como utilizamos cookies e tecnologias de rastreamento no Flow Hub.
              </p>
            </div>
            <div className="shrink-0">
              <CookiePreferencesTrigger variant="button">
                Gerenciar Preferências
              </CookiePreferencesTrigger>
            </div>
          </div>
        </div>

        {/* 1. O que são cookies */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Cookie className="size-5 text-primary" />
            1. O que São Cookies?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita o site do Flow Hub. Eles ajudam a reconhecer seu navegador, manter sua sessão de usuário segura e nos permitir entender como nossas páginas são utilizadas para aprimorar continuamente a experiência do produto.
          </p>
        </section>

        {/* 2. Categorias de Cookies */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">2. Categorias de Cookies Utilizados</h2>

          {/* 2.1 Estritamente Necessários */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Lock className="size-5 text-emerald-500" />
                <span>2.1 Cookies Estritamente Necessários</span>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                Sempre Ativos (Isentos de Consentimento)
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              São essenciais para o funcionamento do SaaS, incluindo login seguro, persistência de autenticação e proteção contra ataques de segurança. A recusa ou desativação destes cookies inviabiliza o acesso ao painel do CRM.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-semibold bg-muted/40">
                    <th className="p-2.5 rounded-l-lg">Cookie / Tecnologia</th>
                    <th className="p-2.5">Fornecedor</th>
                    <th className="p-2.5">Finalidade</th>
                    <th className="p-2.5 rounded-r-lg">Duração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-muted-foreground">
                  <tr>
                    <td className="p-2.5 font-medium text-foreground">sb-access-token / sb-refresh-token</td>
                    <td className="p-2.5">Supabase Auth (SSR)</td>
                    <td className="p-2.5">Manter a sessão autenticada do usuário com token JWT criptografado.</td>
                    <td className="p-2.5">Sessão / 7 dias</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-foreground">flow_cookie_preferences</td>
                    <td className="p-2.5">Flow Hub (Próprio)</td>
                    <td className="p-2.5">Armazenar a escolha de consentimento de cookies feita pelo usuário.</td>
                    <td className="p-2.5">Persistente (Navegador)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-foreground">flow_theme / flow_theme_mode</td>
                    <td className="p-2.5">Flow Hub (Próprio)</td>
                    <td className="p-2.5">Persistir as preferências visuais de tema (Dark/Light e cor de acento).</td>
                    <td className="p-2.5">Persistente (Navegador)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2.2 Desempenho e Análise */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <BarChart3 className="size-5 text-primary" />
                <span>2.2 Cookies de Desempenho e Análise</span>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                Opcional (Requer Consentimento Prévio)
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Utilizados exclusivamente para coletar métricas agregadas de tráfego, mapa de calor de telas e identificação de falhas de usabilidade. **Nenhuma destas ferramentas é carregada ou inicializada antes da sua autorização explícita.**
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-semibold bg-muted/40">
                    <th className="p-2.5 rounded-l-lg">Ferramenta</th>
                    <th className="p-2.5">Fornecedor</th>
                    <th className="p-2.5">Finalidade</th>
                    <th className="p-2.5 rounded-r-lg">Consentimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-muted-foreground">
                  <tr>
                    <td className="p-2.5 font-medium text-foreground">Google Analytics 4</td>
                    <td className="p-2.5">Google LLC</td>
                    <td className="p-2.5">Métricas de páginas visitadas, tempo de permanência e origem do tráfego.</td>
                    <td className="p-2.5 font-medium text-amber-500">Requer Aceite no Banner</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-foreground">Microsoft Clarity</td>
                    <td className="p-2.5">Microsoft Corporation</td>
                    <td className="p-2.5">Análise de mapa de cliques, rolagem de página e diagnósticos de UX.</td>
                    <td className="p-2.5 font-medium text-amber-500">Requer Aceite no Banner</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. Direitos e Revogação */}
        <section className="space-y-4 p-6 rounded-2xl border border-border bg-card/40">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            3. Como Alterar ou Revogar suas Preferências?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            De acordo com os Arts. 7º, IX e 18 da LGPD, você tem o direito de alterar ou revogar a autorização de cookies de análise a qualquer momento.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <CookiePreferencesTrigger variant="button">
              Abrir Painel de Preferências de Cookies
            </CookiePreferencesTrigger>
            <span className="text-xs text-muted-foreground">
              Ou utilize o link <strong>"Cookies"</strong> presente no rodapé de qualquer página.
            </span>
          </div>
        </section>

        {/* 4. Dúvidas / DPO */}
        <section className="space-y-2 text-sm text-muted-foreground border-t border-border/50 pt-8">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="size-4 text-primary" />
            4. Dúvidas sobre nossa Política de Cookies?
          </h3>
          <p>
            Caso deseje obter esclarecimentos adicionais sobre o tratamento de dados pessoais e cookies, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail{" "}
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
