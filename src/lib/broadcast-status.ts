/**
 * Shared status badge config for broadcasts + recipients.
 *
 * One source of truth for broadcast and recipient status badges.
 * Uses adaptive dual-theme classes (light: text-*-700, dark: text-*-300)
 * to guarantee WCAG AA contrast ratio compliance on all backgrounds.
 */

import type { BroadcastStatus, RecipientStatus } from "@/types";

export interface StatusDisplay {
  label: string;
  classes: string;
  /**
   * Set true for statuses that should pulse in the UI to convey
   * "live / in-flight" — currently only `sending`.
   */
  pulse?: boolean;
}

export const broadcastStatusConfig: Record<BroadcastStatus, StatusDisplay> = {
  draft: {
    label: "Rascunho",
    classes: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  },
  scheduled: {
    label: "Agendada",
    classes: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  sending: {
    label: "Enviando",
    classes: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    pulse: true,
  },
  sent: {
    label: "Enviada",
    classes: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  failed: {
    label: "Falha",
    classes: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  },
};

export const recipientStatusConfig: Record<RecipientStatus, StatusDisplay> = {
  pending: {
    label: "Pendente",
    classes: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  },
  sent: {
    label: "Enviada",
    classes: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  delivered: {
    label: "Entregue",
    classes: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  read: {
    label: "Lida",
    classes: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  replied: {
    label: "Respondida",
    classes: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  failed: {
    label: "Falha",
    classes: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  },
};

/**
 * Tolerant lookup — callers often have a generic string status
 * coming from Supabase. Falls back to the "draft" / "pending"
 * entry so the UI never crashes on an unknown value.
 */
export function getBroadcastStatus(status: string): StatusDisplay {
  return (
    broadcastStatusConfig[status as BroadcastStatus] ??
    broadcastStatusConfig.draft
  );
}

export function getRecipientStatus(status: string): StatusDisplay {
  return (
    recipientStatusConfig[status as RecipientStatus] ??
    recipientStatusConfig.pending
  );
}

