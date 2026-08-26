"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import { useTheme } from "@/hooks/use-theme";

export interface HCaptchaWidgetRef {
  resetCaptcha: () => void;
}

interface HCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Checks whether a valid, non-placeholder hCaptcha Site Key is configured.
 */
export function isCaptchaConfigured(): boolean {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  if (!siteKey) return false;
  const cleaned = siteKey.toLowerCase().trim();
  if (
    cleaned === "" ||
    cleaned.includes("your-") ||
    cleaned.includes("example") ||
    cleaned.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

export const HCaptchaWidget = forwardRef<HCaptchaWidgetRef, HCaptchaWidgetProps>(
  ({ onVerify, onExpire, onError, className }, ref) => {
    const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
    const hcaptchaRef = useRef<HCaptcha>(null);

    // O widget seguia fixo em `dark`: num tema claro, um bloco escuro no meio
    // do formulário. `Mode` é exatamente `"light" | "dark"`, os mesmos valores
    // que o hCaptcha aceita, então não há tradução a fazer.
    const { mode } = useTheme();

    const previousMode = useRef(mode);

    useEffect(() => {
      if (previousMode.current === mode) return;
      previousMode.current = mode;

      // O wrapper do hCaptcha observa a prop `theme` e, ao vê-la mudar,
      // destrói e recria o widget — o token obtido antes da troca deixa de ter
      // widget. Sem avisar, o formulário continuaria acreditando estar
      // verificado enquanto a tela volta a exibir um captcha por resolver: o
      // sistema afirmaria um estado que a tela nega (`FH-07.10`). Anunciar a
      // expiração devolve os dois à mesma verdade.
      onExpire?.();
    }, [mode, onExpire]);

    useImperativeHandle(ref, () => ({
      resetCaptcha: () => {
        hcaptchaRef.current?.resetCaptcha();
      },
    }));

    // If site key is not configured or is a placeholder, bypass rendering
    if (!isCaptchaConfigured() || !siteKey) {
      return null;
    }

    return (
      <div className={className || "my-3 flex justify-center"}>
        <HCaptcha
          ref={hcaptchaRef}
          sitekey={siteKey}
          onVerify={onVerify}
          onExpire={onExpire}
          onError={onError}
          theme={mode}
        />
      </div>
    );
  }
);

HCaptchaWidget.displayName = "HCaptchaWidget";
