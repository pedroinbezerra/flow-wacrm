"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { GuidedTour } from "@/components/onboarding/guided-tour";
import { ExternalAnalytics } from "@/components/analytics/external-analytics";

import { DunningBanner } from "@/components/account/dunning-banner";
import { AccountSuspendedModal } from "@/components/account/account-suspended-modal";
import { WelcomeRedirector } from "@/components/onboarding/welcome-redirector";
import { SupportFloatingWidget } from "@/components/support/support-floating-widget";

// Auth-gated dashboard shell. Extracted from the layout so the layout
// itself can stay a server component and export metadata (noindex) —
// client components can't export Next's metadata object.

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { user, loading, hasNoWorkspace, signOut } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  // Sidebar drawer state — only used on mobile. On lg+ the sidebar is
  // always visible and this stays at `false` (ignored by the component).
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const combined = `${window.location.hash}&${window.location.search}`.toLowerCase();
      if (
        combined.includes("otp_expired") ||
        combined.includes("token_expired") ||
        combined.includes("error=access_denied") ||
        combined.includes("invalid+or+has+expired")
      ) {
        const supabase = createClient();
        void supabase.auth.signOut().then(() => {
          window.location.href = "/reset-password?expired=true";
        });
        return;
      }
    }

    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // A identidade está autenticada, mas não participa de ambiente algum — a
  // última participação foi encerrada com o app aberto, ou o ambiente em uso
  // foi excluído. Em vez de renderizar um painel que não consegue carregar
  // nada, a tela diz o que houve. Falha explícita, não tela vazia.
  if (hasNoWorkspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <div className="max-w-sm space-y-4 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            {t("navigation.workspace.none")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("navigation.workspace.noneBody")}
          </p>
          <button
            type="button"
            onClick={signOut}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("navigation.signOut")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="tour-welcome" className="flex h-screen overflow-hidden bg-background">
      {/* Telemetria e Analytics Externos (Clarity + GA4) */}
      <ExternalAnalytics />
      {/* Redirecionador automático para o 1º acesso de novos usuários */}
      <WelcomeRedirector />
      {/* Tour Guiado Interativo (Driver.js) */}
      <GuidedTour />
      {/* Modal de bloqueio por suspensão ou carência de exclusão */}
      <AccountSuspendedModal />
      {/* Modal / Drawer de Suporte ao Cliente acionado por Header e Sidebar */}
      <SupportFloatingWidget />
      {/* Reports this tab's online/away presence once we know a user is
          signed in. Headless — renders nothing. */}
      <PresenceHeartbeat />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Banner de alerta de inadimplência / carência */}
        <DunningBanner />
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        {/* Thinner horizontal padding on mobile so cards have room to breathe. */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </AuthProvider>
  );
}
