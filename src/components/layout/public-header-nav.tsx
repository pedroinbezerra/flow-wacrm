"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PublicHeaderNav() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  if (isAuthenticated === null) {
    return <div className="h-8 w-28 animate-pulse bg-muted/40 rounded-lg" />;
  }

  if (isAuthenticated) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-3.5 py-2 rounded-lg text-xs transition-colors shadow-sm"
      >
        <LayoutDashboard className="size-3.5" />
        <span>Ir para o Dashboard</span>
        <ArrowRight className="size-3.5" />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
        Entrar
      </Link>
      <Link
        href="/signup"
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg text-xs transition-colors"
      >
        Criar Conta
      </Link>
    </div>
  );
}
