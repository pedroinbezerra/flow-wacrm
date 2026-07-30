"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, CreditCard, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function DunningBanner() {
  const { subscriptionStatus, scheduledDeletionAt, isPendingDeletion } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Render for pending deletion (if somehow accessed)
  if (isPendingDeletion && scheduledDeletionAt) {
    const formattedDate = new Date(scheduledDeletionAt).toLocaleDateString("pt-BR");
    return (
      <div className="bg-destructive/15 border-b border-destructive/30 px-4 py-2.5 text-destructive-foreground text-sm font-medium flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span>
            <strong>Conta em cancelamento:</strong> A exclusão definitiva dos dados está agendada para <strong>{formattedDate}</strong> (carência de 90 dias).
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/settings?tab=general"
            className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded-md font-semibold hover:bg-destructive/90 transition-colors"
          >
            Reativar Conta
          </Link>
        </div>
      </div>
    );
  }

  // Render for Stage 3: Read-Only mode
  if (subscriptionStatus === "read_only") {
    return (
      <div className="bg-amber-500/15 border-b border-amber-500/30 dark:bg-amber-950/40 dark:border-amber-700/50 px-4 py-2.5 text-amber-900 dark:text-amber-200 text-sm font-medium flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Modo Somente Leitura:</strong> Sua conta possui pendência financeira há mais de 14 dias. Envios de mensagens e automações estão temporariamente pausados.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/settings?tab=plans"
            className="text-xs bg-amber-600 dark:bg-amber-500 text-white dark:text-amber-950 px-3 py-1 rounded-md font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Regularizar Fatura
          </Link>
        </div>
      </div>
    );
  }

  // Render for Stage 1 & 2: Past Due warning
  if (subscriptionStatus === "past_due") {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            Identificamos uma pendência no seu último pagamento. Regularize sua fatura para evitar restrições de envio.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/settings?tab=plans"
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline hover:no-underline"
          >
            Pagar Fatura
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-amber-500/20 rounded-md transition-colors"
            title="Fechar aviso"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
