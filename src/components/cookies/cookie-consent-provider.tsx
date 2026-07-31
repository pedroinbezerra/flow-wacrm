"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { CookieBanner } from "./cookie-banner";
import { CookieModal } from "./cookie-modal";
import { CookiePreferences } from "@/lib/cookies/consent";

interface CookieConsentContextType {
  preferences: CookiePreferences | null;
  hasConsented: boolean;
  openPreferencesModal: () => void;
  acceptAll: () => void;
  acceptNecessary: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const {
    preferences,
    isLoaded,
    hasConsented,
    isModalOpen,
    openModal,
    closeModal,
    acceptAll,
    acceptNecessary,
    savePreferences,
  } = useCookieConsent();

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasConsented,
        openPreferencesModal: openModal,
        acceptAll,
        acceptNecessary,
      }}
    >
      {children}

      {/* Banner de consentimento (exibido no primeiro acesso) */}
      {isLoaded && !hasConsented && (
        <CookieBanner
          onAcceptAll={acceptAll}
          onAcceptNecessary={acceptNecessary}
          onOpenPreferences={openModal}
        />
      )}

      {/* Modal de gerenciamento de preferências */}
      <CookieModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentPreferences={preferences}
        onSavePreferences={savePreferences}
        onAcceptAll={acceptAll}
        onAcceptNecessary={acceptNecessary}
      />
    </CookieConsentContext.Provider>
  );
}

/**
 * Hook para abrir as configurações de cookies a partir de qualquer componente (ex: Rodapé).
 */
export function useCookieConsentModal() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsentModal deve ser usado dentro de um CookieConsentProvider");
  }
  return context;
}
