import type { UserEventPayload } from "@/types";
import { getCookiePreferences } from "@/lib/cookies/consent";

declare global {
  interface Window {
    clarity?: (action: string, key: string, value?: string) => void;
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
  }
}

/**
 * Dispara um evento para a Camada Própria de Eventos do Flow Hub
 * e retransmite para Microsoft Clarity / Google Analytics 4 caso o consentimento de cookies esteja concedido.
 */
export async function trackEvent(
  eventName: string,
  eventData: Record<string, unknown> = {},
  pageUrl?: string
): Promise<void> {
  const payload: UserEventPayload = {
    event_name: eventName,
    event_data: eventData,
    page_url: pageUrl || (typeof window !== "undefined" ? window.location.pathname : undefined),
  };

  // 1) Enviar para a camada própria de eventos (API route internal)
  if (typeof window !== "undefined") {
    try {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => console.warn("[Analytics] Event track error:", err));
    } catch (_e) {
      // Ignorar erros de rede em telemetria não crítica
    }

    // Verificar se o usuário consentiu com os cookies de análise antes de transmitir para GA4 e Clarity
    const consent = getCookiePreferences();
    if (consent?.analytics) {
      // 2) Retransmitir para Google Analytics 4 (se gtag estiver carregado)
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, eventData);
      }

      // 3) Retransmitir marcação para Microsoft Clarity (se clarity estiver carregado)
      if (typeof window.clarity === "function") {
        window.clarity("set", eventName, JSON.stringify(eventData));
      }
    }
  }
}
