import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCookiePreferences,
  setCookiePreferences,
  acceptAllCookies,
  acceptNecessaryCookies,
  hasUserConsented,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_EVENT_NAME,
} from "./consent";

describe("Módulo de Consentimento de Cookies (consent.ts)", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    const listeners: Record<string, ((e: Event) => void)[]> = {};

    const localStorageMock = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k of Object.keys(store)) {
          delete store[k];
        }
      },
    };

    const windowMock = {
      localStorage: localStorageMock,
      addEventListener: (type: string, cb: (e: Event) => void) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(cb);
      },
      removeEventListener: (type: string, cb: (e: Event) => void) => {
        if (listeners[type]) {
          listeners[type] = listeners[type].filter((l) => l !== cb);
        }
      },
      dispatchEvent: (event: Event) => {
        const cbs = listeners[event.type] || [];
        cbs.forEach((cb) => cb(event));
        return true;
      },
    };

    vi.stubGlobal("window", windowMock);
    vi.stubGlobal("localStorage", localStorageMock);
    vi.stubGlobal("CustomEvent", class CustomEvent extends Event {
      detail: any;
      constructor(type: string, options?: { detail?: any }) {
        super(type);
        this.detail = options?.detail;
      }
    });

    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("deve retornar null quando nenhuma preferência foi salva", () => {
    expect(getCookiePreferences()).toBeNull();
    expect(hasUserConsented()).toBe(false);
  });

  it("deve salvar e retornar a preferência 'Somente Necessários'", () => {
    const result = acceptNecessaryCookies();

    expect(result.necessary).toBe(true);
    expect(result.analytics).toBe(false);
    expect(hasUserConsented()).toBe(true);

    const saved = getCookiePreferences();
    expect(saved?.analytics).toBe(false);
    expect(saved?.necessary).toBe(true);
  });

  it("deve salvar e retornar a preferência 'Aceitar Todos'", () => {
    const result = acceptAllCookies();

    expect(result.necessary).toBe(true);
    expect(result.analytics).toBe(true);
    expect(hasUserConsented()).toBe(true);

    const saved = getCookiePreferences();
    expect(saved?.analytics).toBe(true);
  });

  it("deve disparar o evento customizado no window ao atualizar preferências", () => {
    const listener = vi.fn();
    window.addEventListener(COOKIE_CONSENT_EVENT_NAME, listener);

    setCookiePreferences({ analytics: true });

    expect(listener).toHaveBeenCalledTimes(1);
    const eventArg = listener.mock.calls[0][0] as any;
    expect(eventArg.detail.analytics).toBe(true);

    window.removeEventListener(COOKIE_CONSENT_EVENT_NAME, listener);
  });

  it("deve lidar de forma segura com JSON inválido no localStorage", () => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "invalid-json{");
    expect(getCookiePreferences()).toBeNull();
  });
});
