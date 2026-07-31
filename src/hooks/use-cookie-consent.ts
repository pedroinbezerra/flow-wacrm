"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CookiePreferences,
  getCookiePreferences,
  setCookiePreferences,
  acceptAllCookies,
  acceptNecessaryCookies,
  COOKIE_CONSENT_EVENT_NAME,
} from "@/lib/cookies/consent";

export function useCookieConsent() {
  const [preferences, setPreferencesState] = useState<CookiePreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Ler preferências iniciais após hidratação no cliente
    const current = getCookiePreferences();
    setPreferencesState(current);
    setIsLoaded(true);

    const handleConsentUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<CookiePreferences>;
      if (customEvent.detail) {
        setPreferencesState(customEvent.detail);
      } else {
        setPreferencesState(getCookiePreferences());
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT_NAME, handleConsentUpdate);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT_NAME, handleConsentUpdate);
    };
  }, []);

  const handleAcceptAll = useCallback(() => {
    const updated = acceptAllCookies();
    setPreferencesState(updated);
    setIsModalOpen(false);
  }, []);

  const handleAcceptNecessary = useCallback(() => {
    const updated = acceptNecessaryCookies();
    setPreferencesState(updated);
    setIsModalOpen(false);
  }, []);

  const handleSavePreferences = useCallback((options: { analytics: boolean }) => {
    const updated = setCookiePreferences(options);
    setPreferencesState(updated);
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    preferences,
    isLoaded,
    hasConsented: preferences !== null,
    isModalOpen,
    openModal,
    closeModal,
    acceptAll: handleAcceptAll,
    acceptNecessary: handleAcceptNecessary,
    savePreferences: handleSavePreferences,
  };
}
