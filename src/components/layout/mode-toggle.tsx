"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { mode, toggleMode } = useTheme();
  const { t } = useTranslation();
  const label =
    mode === "dark"
      ? t("navigation.toggleLightMode")
      : t("navigation.toggleDarkMode");

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {mode === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
