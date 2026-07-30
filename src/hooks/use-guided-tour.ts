"use client";

import { useCallback, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { trackEvent } from "@/lib/analytics/events";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { saveTourCompletion } from "@/lib/onboarding/user-tours";

interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  };
}

export function useGuidedTour() {
  const driverObj = useRef<Driver | null>(null);
  const { user, accountId } = useAuth();

  const startTour = useCallback(
    (steps: TourStep[], tourKey = "dashboard_overview") => {
      if (typeof window === "undefined") return;

      trackEvent("tour_started", { tour_key: tourKey });

      // Filtra dinamicamente apenas elementos presentes e visíveis no DOM
      const activeSteps = steps.filter((step) => {
        const el = document.querySelector(step.element);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (activeSteps.length === 0) return;

      driverObj.current = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: "rgba(0, 0, 0, 0.75)",
        nextBtnText: "Próximo →",
        prevBtnText: "← Anterior",
        doneBtnText: "Concluir 🎉",
        steps: activeSteps.map((step) => ({
          element: step.element,
          popover: {
            title: step.popover.title,
            description: step.popover.description,
            side: step.popover.side || "bottom",
            align: step.popover.align || "start",
          },
        })),
        onDestroyed: () => {
          trackEvent("tour_completed", { tour_key: tourKey });
          // Salva no localStorage para checagem rápida local
          try {
            localStorage.setItem(`flow_tour_${tourKey}_completed`, "true");
          } catch (_e) {}

          // Persiste no banco de dados Supabase para o usuário
          if (user?.id && accountId) {
            const supabase = createClient();
            void saveTourCompletion(supabase, accountId, user.id, tourKey);
          }
        },
      });

      driverObj.current.drive();
    },
    [user?.id, accountId]
  );

  return { startTour };
}

