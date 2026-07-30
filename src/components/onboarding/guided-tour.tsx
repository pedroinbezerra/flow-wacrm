"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useGuidedTour } from "@/hooks/use-guided-tour";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { fetchCompletedTours } from "@/lib/onboarding/user-tours";

export function GuidedTour() {
  const pathname = usePathname();
  const { startTour } = useGuidedTour();
  const { t } = useTranslation();
  const { user, profileLoading } = useAuth();

  const [completedTours, setCompletedTours] = useState<Set<string> | null>(null);

  // Busca do Supabase os tours concluídos pelo usuário e sincroniza com o localStorage
  useEffect(() => {
    if (!user?.id) return;
    let cancel = false;
    const supabase = createClient();

    void fetchCompletedTours(supabase, user.id).then((set) => {
      if (!cancel) {
        setCompletedTours(set);
        for (const key of set) {
          try {
            localStorage.setItem(`flow_tour_${key}_completed`, "true");
          } catch (_e) {}
        }
      }
    });

    return () => {
      cancel = true;
    };
  }, [user?.id]);

  useEffect(() => {
    // Aguarda o carregamento do perfil/sessão antes de decidir exibir o tour
    if (profileLoading || completedTours === null) return;

    let tourKey = "dashboard_overview";
    let steps: any[] = [];

    if (pathname.startsWith("/inbox")) {
      tourKey = "inbox";
      steps = [
        {
          element: "#tour-inbox-list",
          popover: {
            title: t("onboarding.tour.inbox.listTitle"),
            description: t("onboarding.tour.inbox.listDesc"),
            side: "right",
          },
        },
        {
          element: "#tour-inbox-search",
          popover: {
            title: t("onboarding.tour.inbox.searchTitle"),
            description: t("onboarding.tour.inbox.searchDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-inbox-chat",
          popover: {
            title: t("onboarding.tour.inbox.chatTitle"),
            description: t("onboarding.tour.inbox.chatDesc"),
            side: "left",
          },
        },
        {
          element: "#tour-inbox-sidebar",
          popover: {
            title: t("onboarding.tour.inbox.sidebarTitle"),
            description: t("onboarding.tour.inbox.sidebarDesc"),
            side: "left",
          },
        },
      ];
    } else if (pathname.startsWith("/contacts")) {
      tourKey = "contacts";
      steps = [
        {
          element: "#tour-contacts-header",
          popover: {
            title: t("onboarding.tour.contacts.headerTitle"),
            description: t("onboarding.tour.contacts.headerDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-contacts-actions",
          popover: {
            title: t("onboarding.tour.contacts.actionsTitle"),
            description: t("onboarding.tour.contacts.actionsDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-contacts-filters",
          popover: {
            title: t("onboarding.tour.contacts.filtersTitle"),
            description: t("onboarding.tour.contacts.filtersDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-contacts-table",
          popover: {
            title: t("onboarding.tour.contacts.tableTitle"),
            description: t("onboarding.tour.contacts.tableDesc"),
            side: "top",
          },
        },
      ];
    } else if (pathname.startsWith("/flows")) {
      tourKey = "flows";
      steps = [
        {
          element: "#tour-flows-header",
          popover: {
            title: t("onboarding.tour.flows.headerTitle"),
            description: t("onboarding.tour.flows.headerDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-flows-new",
          popover: {
            title: t("onboarding.tour.flows.newTitle"),
            description: t("onboarding.tour.flows.newDesc"),
            side: "left",
          },
        },
        {
          element: "#tour-flows-list",
          popover: {
            title: t("onboarding.tour.flows.listTitle"),
            description: t("onboarding.tour.flows.listDesc"),
            side: "top",
          },
        },
      ];
    } else if (pathname.startsWith("/broadcasts")) {
      tourKey = "broadcasts";
      steps = [
        {
          element: "#tour-broadcasts-header",
          popover: {
            title: t("onboarding.tour.broadcasts.headerTitle"),
            description: t("onboarding.tour.broadcasts.headerDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-broadcasts-new",
          popover: {
            title: t("onboarding.tour.broadcasts.newTitle"),
            description: t("onboarding.tour.broadcasts.newDesc"),
            side: "left",
          },
        },
        {
          element: "#tour-broadcasts-stats",
          popover: {
            title: t("onboarding.tour.broadcasts.statsTitle"),
            description: t("onboarding.tour.broadcasts.statsDesc"),
            side: "top",
          },
        },
      ];
    } else if (pathname.startsWith("/pipelines")) {
      tourKey = "pipelines";
      steps = [
        {
          element: "#tour-pipelines-header",
          popover: {
            title: t("onboarding.tour.pipelines.headerTitle"),
            description: t("onboarding.tour.pipelines.headerDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-pipelines-stages",
          popover: {
            title: t("onboarding.tour.pipelines.stagesTitle"),
            description: t("onboarding.tour.pipelines.stagesDesc"),
            side: "bottom",
          },
        },
      ];
    } else if (pathname.startsWith("/boards")) {
      tourKey = "boards";
      steps = [
        {
          element: "#tour-boards-header",
          popover: {
            title: t("onboarding.tour.boards.headerTitle"),
            description: t("onboarding.tour.boards.headerDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-boards-actions",
          popover: {
            title: t("onboarding.tour.boards.actionsTitle"),
            description: t("onboarding.tour.boards.actionsDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-boards-selector",
          popover: {
            title: t("onboarding.tour.boards.selectorTitle"),
            description: t("onboarding.tour.boards.selectorDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-boards-lanes",
          popover: {
            title: t("onboarding.tour.boards.lanesTitle"),
            description: t("onboarding.tour.boards.lanesDesc"),
            side: "top",
          },
        },
      ];
    } else if (pathname.startsWith("/automations")) {
      tourKey = "automations";
      steps = [
        {
          element: "#tour-automations-actions",
          popover: {
            title: t("onboarding.tour.automations.actionsTitle"),
            description: t("onboarding.tour.automations.actionsDesc"),
            side: "left",
          },
        },
      ];
    } else if (pathname.startsWith("/ai-assistant")) {
      tourKey = "ai_assistant";
      steps = [
        {
          element: "#tour-ai-header",
          popover: {
            title: t("onboarding.tour.ai_assistant.headerTitle"),
            description: t("onboarding.tour.ai_assistant.headerDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-ai-tabs",
          popover: {
            title: t("onboarding.tour.ai_assistant.tabsTitle"),
            description: t("onboarding.tour.ai_assistant.tabsDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-ai-config-persona",
          popover: {
            title: t("onboarding.tour.ai_assistant.personaTitle"),
            description: t("onboarding.tour.ai_assistant.personaDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-ai-config-byok",
          popover: {
            title: t("onboarding.tour.ai_assistant.byokTitle"),
            description: t("onboarding.tour.ai_assistant.byokDesc"),
            side: "top",
          },
        },
      ];
    } else if (pathname.startsWith("/settings")) {
      tourKey = "settings";
      steps = [
        {
          element: "#tour-settings-rail",
          popover: {
            title: t("onboarding.tour.settings.railTitle"),
            description: t("onboarding.tour.settings.railDesc"),
            side: "right",
          },
        },
        {
          element: "#tour-whatsapp-status",
          popover: {
            title: t("onboarding.tour.settings.statusTitle"),
            description: t("onboarding.tour.settings.statusDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-whatsapp-credentials",
          popover: {
            title: t("onboarding.tour.settings.credentialsTitle"),
            description: t("onboarding.tour.settings.credentialsDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-whatsapp-webhook",
          popover: {
            title: t("onboarding.tour.settings.webhookTitle"),
            description: t("onboarding.tour.settings.webhookDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-whatsapp-actions",
          popover: {
            title: t("onboarding.tour.settings.actionsTitle"),
            description: t("onboarding.tour.settings.actionsDesc"),
            side: "top",
          },
        },
      ];
    } else if (pathname === "/dashboard") {
      tourKey = "dashboard_overview";
      steps = [
        {
          element: "#tour-welcome",
          popover: {
            title: t("onboarding.tour.welcomeTitle"),
            description: t("onboarding.tour.welcomeDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-nav-inbox",
          popover: {
            title: t("onboarding.tour.inboxTitle"),
            description: t("onboarding.tour.inboxDesc"),
            side: "right",
          },
        },
        {
          element: "#tour-nav-contacts",
          popover: {
            title: t("onboarding.tour.contactsTitle"),
            description: t("onboarding.tour.contactsDesc"),
            side: "right",
          },
        },
        {
          element: "#tour-nav-flows",
          popover: {
            title: t("onboarding.tour.flowsTitle"),
            description: t("onboarding.tour.flowsDesc"),
            side: "right",
          },
        },
        {
          element: "#tour-nav-broadcasts",
          popover: {
            title: t("onboarding.tour.broadcastsTitle"),
            description: t("onboarding.tour.broadcastsDesc"),
            side: "right",
          },
        },
        {
          element: "#tour-checklist",
          popover: {
            title: t("onboarding.tour.checklistTitle"),
            description: t("onboarding.tour.checklistDesc"),
            side: "bottom",
          },
        },
      ];
    } else {
      return;
    }

    // Verifica se já foi concluído no Supabase ou no localStorage
    let isCompletedLocally = false;
    try {
      isCompletedLocally = localStorage.getItem(`flow_tour_${tourKey}_completed`) === "true";
    } catch (_e) {}

    const isCompletedInDb = completedTours.has(tourKey);

    if (!isCompletedLocally && !isCompletedInDb && steps.length > 0) {
      const timer = setTimeout(() => {
        startTour(steps, tourKey);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pathname, startTour, t, profileLoading, completedTours]);

  return null;
}

