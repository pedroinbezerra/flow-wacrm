"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getCookiePreferences, COOKIE_CONSENT_EVENT_NAME, CookiePreferences } from "@/lib/cookies/consent";

export function ExternalAnalytics() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

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

  // LGPD: Nenhuma ferramenta opcional de rastreamento é carregada antes do consentimento
  if (!analyticsAllowed) {
    return null;
  }

  return (
    <>
      {/* Microsoft Clarity Script */}
      {clarityId && (
        <Script
          id="microsoft-clarity-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `,
          }}
        />
      )}

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
