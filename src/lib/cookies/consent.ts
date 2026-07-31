/**
 * Gerenciamento de Consentimento de Cookies (LGPD)
 * 
 * Este módulo gerencia as preferências de cookies do usuário no Flow Hub.
 * Os cookies estritamente necessários (sessão e autenticação via Supabase SSR)
 * funcionam independentemente das escolhas de rastreamento/análise.
 */

export interface CookiePreferences {
  /** Cookies indispensáveis para login, sessão e funcionamento do CRM (sempre true) */
  necessary: true;
  /** Cookies de análise de comportamento e métricas (GA4, Microsoft Clarity) */
  analytics: boolean;
  /** Data/hora ISO do momento da concessão do consentimento */
  timestamp: string;
  /** Versão da política de consentimento aceita */
  version: string;
}

export const COOKIE_CONSENT_STORAGE_KEY = "flow_cookie_preferences";
export const COOKIE_CONSENT_CURRENT_VERSION = "1.0";
export const COOKIE_CONSENT_EVENT_NAME = "flow-cookie-consent-updated";

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  timestamp: "",
  version: COOKIE_CONSENT_CURRENT_VERSION,
};

/**
 * Obtém as preferências de cookies salvas no localStorage.
 * Retorna null caso o usuário ainda não tenha registrado nenhuma escolha.
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<CookiePreferences>;
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : new Date().toISOString(),
      version: typeof parsed.version === "string" ? parsed.version : COOKIE_CONSENT_CURRENT_VERSION,
    };
  } catch (_err) {
    // localStorage pode falhar em navegação privada restrita ou ambientes sem permissão
    return null;
  }
}

/**
 * Registra/atualiza as preferências de cookies no localStorage e dispara o evento de atualização.
 */
export function setCookiePreferences(preferences: { analytics: boolean }): CookiePreferences {
  const updated: CookiePreferences = {
    necessary: true,
    analytics: preferences.analytics,
    timestamp: new Date().toISOString(),
    version: COOKIE_CONSENT_CURRENT_VERSION,
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT_NAME, { detail: updated }));
    } catch (_err) {
      // Ignorar falhas de gravação em storage restrito
    }
  }

  return updated;
}

/**
 * Utilitário para aceitar todas as categorias de cookies opcionais.
 */
export function acceptAllCookies(): CookiePreferences {
  return setCookiePreferences({ analytics: true });
}

/**
 * Utilitário para aceitar apenas os cookies estritamente necessários.
 */
export function acceptNecessaryCookies(): CookiePreferences {
  return setCookiePreferences({ analytics: false });
}

/**
 * Verifica se o usuário já registrou uma escolha válida de consentimento.
 */
export function hasUserConsented(): boolean {
  return getCookiePreferences() !== null;
}
