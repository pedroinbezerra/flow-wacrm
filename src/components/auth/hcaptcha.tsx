"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

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
          theme="dark"
        />
      </div>
    );
  }
);

HCaptchaWidget.displayName = "HCaptchaWidget";
