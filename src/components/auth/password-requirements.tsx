"use client";

import { Check, X } from "lucide-react";
import { validatePassword, PASSWORD_POLICY_MIN_LENGTH } from "@/lib/auth/password-policy";
import { cn } from "@/lib/utils";

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  if (!password) return null;

  const { checks } = validatePassword(password);

  const items = [
    { key: "minLength", label: `Pelo menos ${PASSWORD_POLICY_MIN_LENGTH} caracteres`, met: checks.minLength },
    { key: "hasUppercase", label: "Uma letra maiúscula (A-Z)", met: checks.hasUppercase },
    { key: "hasLowercase", label: "Uma letra minúscula (a-z)", met: checks.hasLowercase },
    { key: "hasDigit", label: "Um número (0-9)", met: checks.hasDigit },
    { key: "hasSymbol", label: "Um caractere especial ou símbolo (!@#$...)", met: checks.hasSymbol },
  ];

  return (
    <div className={cn("rounded-lg border border-border bg-card-2/60 p-3 text-xs space-y-1.5", className)}>
      <p className="font-medium text-foreground/80 mb-2">A senha deve conter:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-1.5 transition-colors">
            {item.met ? (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 shrink-0">
                <Check className="h-3 w-3" />
              </div>
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground/50 shrink-0">
                <X className="h-3 w-3" />
              </div>
            )}
            <span className={cn(item.met ? "text-emerald-400 font-medium" : "text-muted-foreground")}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
