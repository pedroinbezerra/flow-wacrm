"use client";

import React from "react";
import { Settings } from "lucide-react";
import { useCookieConsentModal } from "./cookie-consent-provider";

interface CookiePreferencesTriggerProps {
  variant?: "button" | "link";
  className?: string;
  children?: React.ReactNode;
}

export function CookiePreferencesTrigger({
  variant = "link",
  className = "",
  children,
}: CookiePreferencesTriggerProps) {
  const { openPreferencesModal } = useCookieConsentModal();

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={openPreferencesModal}
        className={
          className ||
          "inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        }
      >
        <Settings className="size-3.5" />
        {children || "Gerenciar Minhas Preferências de Cookies"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openPreferencesModal}
      className={className || "hover:text-foreground transition-colors cursor-pointer text-left"}
    >
      {children || "Preferências de Cookies"}
    </button>
  );
}
