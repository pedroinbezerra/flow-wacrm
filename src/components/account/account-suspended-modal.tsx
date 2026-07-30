"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, CreditCard, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AccountSuspendedModal() {
  const {
    isSuspended,
    isPendingDeletion,
    scheduledDeletionAt,
    isOwner,
    signOut,
    refreshProfile,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If account is active and not suspended/pending deletion, don't show modal
  if (!isSuspended && !isPendingDeletion) {
    return null;
  }

  const handleReactivate = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/account/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : null;
      if (!res.ok) {
        throw new Error(data?.error || `Falha ao reativar conta (${res.status}).`);
      }
      setSuccessMessage(data?.message || "Conta reativada com sucesso!");
      setTimeout(async () => {
        await refreshProfile();
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = scheduledDeletionAt
    ? new Date(scheduledDeletionAt).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-6 text-card-foreground">
        <div className="flex items-center gap-3 text-destructive">
          <div className="rounded-full bg-destructive/10 p-3">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isPendingDeletion ? "Conta em Processo de Cancelamento" : "Conta Suspensa"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPendingDeletion
                ? "Carência de 90 dias com dados preservados."
                : "Acesso temporariamente bloqueado."}
            </p>
          </div>
        </div>

        {isPendingDeletion && formattedDate ? (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-900 dark:text-amber-200">
            <p className="font-semibold">O que acontece agora?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Sua solicitação de cancelamento foi recebida. Todos os seus dados, histórico de conversas, automações e contatos estão <strong>100% seguros e preservados</strong> até <strong>{formattedDate}</strong>.
            </p>
            <p className="mt-2 text-xs font-medium">
              Você pode reativar seu acesso instantaneamente durante este período sem qualquer perda de histórico.
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive-foreground">
            <p className="font-semibold">Estágio 4: Suspensão por Inadimplência</p>
            <p className="mt-1 text-xs leading-relaxed opacity-90">
              Identificamos faturas pendentes de pagamento não regularizadas há mais de 30 dias. Seus dados continuam seguros, mas o uso da plataforma foi suspenso até a quitação.
            </p>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          {isPendingDeletion && isOwner && (
            <button
              onClick={handleReactivate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Reativando..." : "Reativar Minha Conta Agora"}
            </button>
          )}

          {isSuspended && (
            <Link
              href="/settings?tab=plans"
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Regularizar Pagamento / Ver Faturas
            </Link>
          )}

          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 border border-input bg-background font-medium text-sm py-2 px-4 rounded-lg hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}
