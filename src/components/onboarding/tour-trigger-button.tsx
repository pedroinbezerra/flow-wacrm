"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { useGuidedTour } from "@/hooks/use-guided-tour";
import { useTranslation } from "@/hooks/use-translation";

export function TourTriggerButton() {
  const pathname = usePathname();
  const { startTour } = useGuidedTour();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  // Retrai suavemente após 2.5s no carregamento / troca de rota
  useEffect(() => {
    setExpanded(true);
    const timer = setTimeout(() => {
      setExpanded(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleStartTour = useCallback(() => {
    if (pathname.startsWith("/inbox")) {
      startTour([
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
      ], "inbox");
    } else if (pathname.startsWith("/contacts")) {
      startTour([
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
      ], "contacts");
    } else if (pathname.startsWith("/flows")) {
      startTour([
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
      ], "flows");
    } else if (pathname.startsWith("/broadcasts")) {
      startTour([
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
      ], "broadcasts");
    } else if (pathname.startsWith("/faq")) {
      startTour([
        {
          element: "#tour-faq-header",
          popover: {
            title: t("onboarding.tour.faq.headerTitle"),
            description: t("onboarding.tour.faq.headerDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-faq-search",
          popover: {
            title: t("onboarding.tour.faq.searchTitle"),
            description: t("onboarding.tour.faq.searchDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-faq-categories",
          popover: {
            title: t("onboarding.tour.faq.categoriesTitle"),
            description: t("onboarding.tour.faq.categoriesDesc"),
            side: "bottom",
          },
        },
        {
          element: "#tour-faq-accordion",
          popover: {
            title: t("onboarding.tour.faq.listTitle"),
            description: t("onboarding.tour.faq.listDesc"),
            side: "top",
          },
        },
      ], "faq");
    } else if (pathname.startsWith("/pipelines")) {
      startTour([
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
      ], "pipelines");
    } else if (pathname.startsWith("/boards")) {
      startTour([
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
      ], "boards");
    } else if (pathname.startsWith("/automations")) {
      startTour([
        {
          element: "#tour-automations-header",
          popover: {
            title: t("onboarding.tour.automations.headerTitle"),
            description: t("onboarding.tour.automations.headerDesc"),
            side: "bottom",
          },
        },
      ], "automations");
    } else if (pathname.startsWith("/settings")) {
      startTour([
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
      ], "settings");
    } else if (pathname.startsWith("/ai-assistant")) {
      startTour([
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
      ], "ai_assistant");
    } else {
      // Default: Dashboard Overview
      startTour([
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
      ], "dashboard_overview");
    }
  }, [pathname, startTour, t]);

  return (
    <button
      onClick={handleStartTour}
      className="group relative inline-flex h-8 items-center justify-center rounded-lg border border-border/80 bg-background px-2.5 text-xs font-semibold text-muted-foreground shadow-sm hover:border-primary/40 hover:bg-accent hover:text-foreground transition-all duration-500 ease-in-out"
      title={t("onboarding.tour.triggerTitle")}
    >
      <HelpCircle className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out ${
          expanded
            ? "max-w-xs opacity-100 ml-2"
            : "max-w-0 opacity-0 ml-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2"
        }`}
      >
        {t("onboarding.tour.triggerText")}
      </span>
    </button>
  );
}
