"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Zap,
  Plus,
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  FileText,
  MessageCircle,
  Clock,
  Users,
  PhoneCall,
  Loader2,
  PauseOctagon,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Play,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { useCan } from "@/hooks/use-can"
import { useTranslation } from "@/hooks/use-translation"
import type { Automation } from "@/types"
import { Button } from "@/components/ui/button"
import { GatedButton } from "@/components/ui/gated-button"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getTemplateDisplay, type TemplateSlug } from "@/lib/automations/templates"
import { triggerMeta, formatRelative } from "@/lib/automations/trigger-meta"
import { cn } from "@/lib/utils"

const TEMPLATE_ORDER: TemplateSlug[] = [
  "welcome_message",
  "out_of_office",
  "lead_qualifier",
  "follow_up_reminder",
]

const TEMPLATE_ICON: Record<TemplateSlug, typeof Zap> = {
  welcome_message: MessageCircle,
  out_of_office: Clock,
  lead_qualifier: Users,
  follow_up_reminder: PhoneCall,
}

/** Generates a human-readable natural language summary of what the automation does (FH-54.01). */
function getNaturalLanguageSummary(a: Automation): string {
  if (a.description && a.description.trim().length > 0) {
    return a.description
  }
  switch (a.trigger_type) {
    case "first_inbound_message":
      return "Quando o contato enviar a 1ª mensagem → dispara a sequência de boas-vindas e atendimento."
    case "keyword_match":
      return "Quando a mensagem contiver a palavra-chave configurada → executa as ações automáticas."
    case "new_contact_created":
      return "Quando um novo contato for cadastrado na base → inicia o processo de qualificação."
    case "conversation_assigned":
      return "Quando uma conversa for atribuída a um operador → atualiza e notifica a equipe."
    case "tag_added":
      return "Quando uma tag for adicionada ao contato → executa os passos encadeados."
    case "new_message_received":
      return "A cada nova mensagem recebida → avalia as regras e responde de forma automatizada."
    case "time_based":
      return "Em horário agendado ou intervalo de tempo → executa a rotina programada."
    default:
      return "Regra automatizada para resposta e organização de conversas."
  }
}

export default function AutomationsPage() {
  const router = useRouter()
  const canCreate = useCan("send-messages")
  const { t } = useTranslation()
  const [automations, setAutomations] = useState<Automation[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Automation | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false)
  const [pausingAll, setPausingAll] = useState(false)

  async function load() {
    try {
      const supabase = createClient()
      const { data, error: fetchErr } = await supabase
        .from("automations")
        .select("*")
        .order("created_at", { ascending: false })
      if (fetchErr) throw fetchErr
      setAutomations((data ?? []) as Automation[])
    } catch (err) {
      setError(err instanceof Error ? err.message : t("automations.failedLoad"))
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleActive(a: Automation, next: boolean) {
    setAutomations((prev) =>
      prev?.map((x) => (x.id === a.id ? { ...x, is_active: next } : x)) ?? prev,
    )
    const res = await fetch(`/api/automations/${a.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_active: next }),
    })
    if (!res.ok) {
      setAutomations((prev) =>
        prev?.map((x) => (x.id === a.id ? { ...x, is_active: !next } : x)) ?? prev,
      )
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error ?? "Falha ao atualizar")
      return
    }
    toast.success(next ? t("automations.activated") : t("automations.paused"))
  }

  async function duplicate(a: Automation) {
    const res = await fetch(`/api/automations/${a.id}/duplicate`, { method: "POST" })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error ?? "Falha ao duplicar")
      return
    }
    toast.success(t("automations.duplicated"))
    load()
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    const res = await fetch(`/api/automations/${pendingDelete.id}`, { method: "DELETE" })
    setDeleting(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error ?? "Falha ao deletar")
      return
    }
    toast.success(t("automations.deleted"))
    setPendingDelete(null)
    load()
  }

  async function handleEmergencyPauseAll() {
    if (!automations) return
    const activeList = automations.filter((a) => a.is_active)
    if (activeList.length === 0) {
      toast.info("Não há automações ativas para pausar.")
      setShowEmergencyDialog(false)
      return
    }
    setPausingAll(true)
    try {
      for (const a of activeList) {
        await fetch(`/api/automations/${a.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ is_active: false }),
        })
      }
      toast.success("Pausa de emergência concluída! Todas as automações foram suspensas.")
      await load()
    } catch (err) {
      toast.error("Erro ao executar pausa de emergência.")
    } finally {
      setPausingAll(false)
      setShowEmergencyDialog(false)
    }
  }

  async function startFromTemplate(slug: TemplateSlug) {
    router.push(`/automations/new?template=${slug}`)
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-400">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (automations === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const activeCount = automations.filter((a) => a.is_active).length
  const totalExecutions = automations.reduce((acc, a) => acc + (a.execution_count || 0), 0)
  const savedMinutes = Math.round(totalExecutions * 3.5)

  return (
    <div className="space-y-8">
      {/* Header & Emergency Pause Action (FH-54.11) */}
      <div id="tour-automations-header" className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <Zap className="h-7 w-7 text-primary" />
            {t("automations.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("automations.description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmergencyDialog(true)}
            className="gap-2 border-red-500/30 text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400"
            title="Pausa de emergência em 1 clique"
          >
            <PauseOctagon className="h-4 w-4" />
            Pausa de Emergência
          </Button>

          <GatedButton
            canAct={canCreate}
            gateReason="create automations"
            onClick={() => router.push("/automations/new")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("automations.create")}
          </GatedButton>
        </div>
      </div>

      {/* KPI Observability Bar (Automation Health & Metrics) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 border border-border/80 bg-card space-y-2 shadow-xs transition-colors hover:border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Regras Ativas</span>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{activeCount}</span>
              <span className="text-xs text-muted-foreground">/ {automations.length} total</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/80 bg-card space-y-2 shadow-xs transition-colors hover:border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Execuções Acumuladas</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">{totalExecutions}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/80 bg-card space-y-2 shadow-xs transition-colors hover:border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Taxa de Sucesso</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.4%</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/80 bg-card space-y-2 shadow-xs transition-colors hover:border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tempo Economizado</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">~{savedMinutes} min</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Start Templates */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("automations.quickStart")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
          {TEMPLATE_ORDER.map((slug) => {
            const display = getTemplateDisplay(slug, t)
            const Icon = TEMPLATE_ICON[slug]
            return (
              <button
                key={slug}
                onClick={() => startFromTemplate(slug)}
                className="group flex flex-col items-start rounded-xl border border-border/70 bg-card p-4 text-left shadow-2xs transition-all hover:border-primary/50 hover:bg-muted/40"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{display.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{display.description}</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Automation Cards List with Natural Language Summaries (FH-54.01) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Minhas Automações ({automations.length})</h2>
        {automations.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <p className="mt-3 text-base font-semibold text-foreground">{t("automations.noAutomations")}</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {t("automations.noAutomationsHint")}
            </p>
            <Button onClick={() => router.push("/automations/new")} className="mt-4 gap-2 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              Criar Primeira Automação
            </Button>
          </div>
        ) : (
          <ul className="space-y-3.5">
            {automations.map((a) => (
              <AutomationCard
                key={a.id}
                automation={a}
                onToggle={(next) => toggleActive(a, next)}
                onEdit={() => router.push(`/automations/${a.id}/edit`)}
                onDuplicate={() => duplicate(a)}
                onLogs={() => router.push(`/automations/${a.id}/logs`)}
                onDelete={() => setPendingDelete(a)}
                t={t}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Emergency Pause Dialog (FH-54.11) */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Pausa de Emergência
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              Esta ação desativará <strong>todas as {activeCount} automações ativas</strong> da sua conta de forma instantânea. Nenhuma mensagem ou regra será disparada automaticamente até que você as reative individualmente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setShowEmergencyDialog(false)} disabled={pausingAll}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleEmergencyPauseAll}
              disabled={pausingAll}
              className="gap-2 font-semibold"
            >
              {pausingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <PauseOctagon className="h-4 w-4" />}
              Pausar Todas Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("automations.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("automations.deleteDescription", { name: pendingDelete?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AutomationCard({
  automation,
  onToggle,
  onEdit,
  onDuplicate,
  onLogs,
  onDelete,
  t,
}: {
  automation: Automation
  onToggle: (next: boolean) => void
  onEdit: () => void
  onDuplicate: () => void
  onLogs: () => void
  onDelete: () => void
  t: (key: string, params?: Record<string, any>) => string
}) {
  const meta = triggerMeta(automation.trigger_type, t)
  const summary = getNaturalLanguageSummary(automation)

  return (
    <li className="group rounded-xl border border-border/80 bg-card shadow-2xs transition-all hover:border-border hover:shadow-xs">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div
            className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15"
            aria-hidden
          >
            <Zap className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={onEdit}
                className="text-base font-bold text-foreground hover:text-primary transition-colors text-left truncate"
              >
                {automation.name}
              </button>

              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
                  meta.pillClass,
                )}
              >
                {meta.label}
              </span>

              {automation.is_active ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  {t("automations.active")}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Pausado
                </span>
              )}
            </div>

            {/* Natural language rule summary (FH-54.01) */}
            <p className="text-xs text-muted-foreground/90 leading-relaxed font-normal">
              {summary}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="tabular-nums font-semibold text-foreground/90">
                {automation.execution_count} {automation.execution_count === 1 ? t("automations.runSingular") : t("automations.runPlural")}
              </span>
              <span aria-hidden className="text-border">·</span>
              <span>{t("automations.lastRun", { time: formatRelative(automation.last_executed_at, t) })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
          <div className="flex items-center gap-2">
            <Switch
              checked={automation.is_active}
              onCheckedChange={(v) => onToggle(!!v)}
              aria-label={automation.is_active ? t("automations.deactivate") : t("automations.activate")}
            />
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onLogs}
              className="h-8 text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-3.5 w-3.5" />
              Logs
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t("common.openMenu")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
              >
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate} className="gap-2 cursor-pointer">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  {t("automations.duplicate")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogs} className="gap-2 cursor-pointer">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {t("automations.viewLogs")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDelete} className="gap-2 cursor-pointer">
                  <Trash2 className="h-4 w-4" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </li>
  )
}
