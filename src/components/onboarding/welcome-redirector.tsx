"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { fetchCompletedTours } from "@/lib/onboarding/user-tours";

/**
 * Componente headless que controla a exibição ÚNICA da tela de Boas-Vindas para novos usuários.
 * Se o usuário for novo (nunca viu a tela de boas-vindas), redireciona automaticamente para /welcome.
 * Após a primeira visualização, o estado é gravado no banco de dados e no localStorage para que ele
 * nunca mais seja redirecionado involuntariamente.
 */
export function WelcomeRedirector() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profileLoading } = useAuth();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (profileLoading || !user?.id || checkedRef.current) return;

    // Se já estiver na tela de boas-vindas, não precisa redirecionar
    if (pathname.startsWith("/welcome")) return;

    let cancel = false;
    const localStorageKey = `flow_welcome_seen_${user.id}`;

    // 1. Verificação ultra-rápida no localStorage para evitar piscadas
    try {
      const localSeen = localStorage.getItem(localStorageKey);
      if (localSeen === "true") {
        checkedRef.current = true;
        return;
      }
    } catch (_e) {}

    // 2. Verificação assíncrona no banco de dados Supabase (user_onboarding_tours)
    const supabase = createClient();
    void fetchCompletedTours(supabase, user.id).then((completedTours) => {
      if (cancel) return;
      checkedRef.current = true;

      const isSeenInDb = completedTours.has("welcome_screen");
      if (isSeenInDb) {
        try {
          localStorage.setItem(localStorageKey, "true");
        } catch (_e) {}
        return;
      }

      // Se for o primeiro acesso de um novo usuário, direciona para a tela de Boas-Vindas
      router.push("/welcome");
    });

    return () => {
      cancel = true;
    };
  }, [user?.id, profileLoading, pathname, router]);

  return null;
}
