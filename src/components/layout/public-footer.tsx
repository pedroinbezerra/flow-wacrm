import React from "react";
import Link from "next/link";
import { CookiePreferencesTrigger } from "@/components/cookies/cookie-preferences-trigger";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 py-8 text-xs text-muted-foreground bg-background/50">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <p>© {currentYear} Flow Hub — FLOW SYSTEMS LTDA (CNPJ 62.479.299/0001-66).</p>
          <p className="text-[11px] text-muted-foreground/80">
            Todos os direitos reservados. Plataforma em conformidade com a LGPD (Lei nº 13.709/2018).
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Termos de Uso
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacidade
          </Link>
          <Link href="/cookies" className="hover:text-foreground transition-colors">
            Cookies
          </Link>
          <Link href="/security" className="hover:text-foreground transition-colors">
            Segurança
          </Link>
          <Link href="/dpa" className="hover:text-foreground transition-colors">
            DPA
          </Link>
          <Link href="/subprocessadores" className="hover:text-foreground transition-colors">
            Subprocessadores
          </Link>
          <Link href="/lgpd" className="text-primary font-medium hover:underline">
            Solicitações LGPD
          </Link>
          <CookiePreferencesTrigger />
        </div>
      </div>
    </footer>
  );
}
