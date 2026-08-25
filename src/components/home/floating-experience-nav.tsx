"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { FlowLogo } from "@/components/layout/flow-logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function FloatingExperienceNav() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState<string>("opening");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = totalScroll > 0 ? currentScroll / totalScroll : 0;

      if (progress < 0.35) {
        setActiveSection("opening");
      } else if (progress < 0.60) {
        setActiveSection("flow");
      } else if (progress < 0.80) {
        setActiveSection("editorial");
      } else if (progress < 0.92) {
        setActiveSection("hub");
      } else {
        setActiveSection("access");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToPercent = (percent: number) => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: totalScroll * percent,
      behavior: "smooth",
    });
  };

  return (
    <nav 
      aria-label="Navegação da Experiência"
      className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-full border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl transition-all">
        
        {/* Logo / Brand Pill */}
        <button
          onClick={() => scrollToPercent(0)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-card-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <FlowLogo height={22} />
        </button>

        {/* Section Jump Anchors (Visible on desktop & tablet) */}
        <div className="hidden md:flex items-center gap-1 border-x border-border/60 px-2 text-xs font-medium text-muted-foreground">
          <button
            onClick={() => scrollToPercent(0.18)}
            className={cn(
              "px-2.5 py-1 rounded-full transition-colors",
              activeSection === "opening" ? "text-foreground bg-card-2 font-semibold" : "hover:text-foreground"
            )}
          >
            Intenção
          </button>
          <button
            onClick={() => scrollToPercent(0.48)}
            className={cn(
              "px-2.5 py-1 rounded-full transition-colors",
              activeSection === "flow" ? "text-foreground bg-card-2 font-semibold" : "hover:text-foreground"
            )}
          >
            Fluxo
          </button>
          <button
            onClick={() => scrollToPercent(0.68)}
            className={cn(
              "px-2.5 py-1 rounded-full transition-colors",
              activeSection === "editorial" ? "text-foreground bg-card-2 font-semibold" : "hover:text-foreground"
            )}
          >
            Visão
          </button>
          <button
            onClick={() => scrollToPercent(0.86)}
            className={cn(
              "px-2.5 py-1 rounded-full transition-colors",
              activeSection === "hub" ? "text-foreground bg-card-2 font-semibold" : "hover:text-foreground"
            )}
          >
            Hub
          </button>
          <button
            onClick={() => scrollToPercent(0.96)}
            className={cn(
              "px-2.5 py-1 rounded-full transition-colors",
              activeSection === "access" ? "text-foreground bg-card-2 font-semibold" : "hover:text-foreground"
            )}
          >
            Acesso
          </button>
        </div>

        {/* Action Button */}
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-sm"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Dashboard</span>
          </Link>
        ) : (
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors shadow-sm"
            >
              <span>Começar</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        )}

      </div>
    </nav>
  );
}
