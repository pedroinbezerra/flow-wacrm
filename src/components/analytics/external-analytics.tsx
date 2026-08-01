"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getCookiePreferences, COOKIE_CONSENT_EVENT_NAME, CookiePreferences } from "@/lib/cookies/consent";
import { useAuth } from "@/hooks/use-auth";

export function ExternalAnalytics() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Verificar consentimento inicial
    const prefs = getCookiePreferences();
    if (prefs?.analytics) {
      setAnalyticsAllowed(true);
    }

    // Escutar atualizações dinâmicas de consentimento
    const handleConsentUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<CookiePreferences>;
      if (customEvent.detail?.analytics) {
        setAnalyticsAllowed(true);
      } else {
        setAnalyticsAllowed(false);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT_NAME, handleConsentUpdate);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT_NAME, handleConsentUpdate);
    };
  }, []);

  // Injeção garantida do script do Microsoft Clarity no DOM quando o consentimento é fornecido
  useEffect(() => {
    if (!analyticsAllowed) return;

    if (!clarityId) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Clarity] Variável NEXT_PUBLIC_CLARITY_PROJECT_ID não definida. O rastreamento do Clarity está desativado.");
      }
      return;
    }

    if (typeof window === "undefined") return;

    // Inicializa objeto window.clarity se ainda não existir
    const win = window as any;
    win.clarity = win.clarity || function () {
      (win.clarity.q = win.clarity.q || []).push(arguments);
    };

    // Identifica o usuário logado no Clarity para vincular gravações de sessão
    if (user?.id) {
      try {
        win.clarity("identify", user.id);
      } catch (_e) {}
    }

    // Garante que a tag do script exista no head
    if (!document.getElementById("microsoft-clarity-script")) {
      const script = document.createElement("script");
      script.id = "microsoft-clarity-script";
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${clarityId}`;
      document.head.appendChild(script);
    }
  }, [analyticsAllowed, clarityId, user?.id]);

  // LGPD: Nenhuma ferramenta opcional de rastreamento é carregada antes do consentimento
  if (!analyticsAllowed) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 (GA4) Script */}
      {gaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
