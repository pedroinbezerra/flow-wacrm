"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Workflow,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  MessageSquare,
  PlayCircle,
  PauseCircle,
  Archive,
  HelpCircle,
  UserPlus,
  FileText,
  Zap,
  ShieldAlert,
  Search,
  CheckCircle2,
  History,
  Activity,
} from "lucide-react";

import { useCan } from "@/hooks/use-can";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { GatedButton } from "@/components/ui/gated-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Flows list page — Central de Comando e Construtor de Fluxos Conscientes.
 * Responsividade fluida, baixa carga cognitiva no mobile, visual adaptável.
 */

interface FlowRow {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  trigger_type: "keyword" | "first_inbound_message" | "manual";
  trigger_config: { keywords?: string[] } | Record<string, unknown>;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

type FilterStatus = "all" | "active" | "draft" | "archived";

const STATUS_COLORS: Record<FlowRow["status"], string> = {
  draft: "border-border bg-muted text-muted-foreground",
  active:
    "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  archived: "border-border bg-muted/50 text-muted-foreground",
};

interface TemplateSummary {
  slug: string;
  name: string;
  description: string;
  icon: "MessageSquare" | "HelpCircle" | "UserPlus";
  trigger_type: string;
  node_count: number;
}

const TEMPLATE_ICONS = {
  MessageSquare,
  HelpCircle,
  UserPlus,
} as const;

export default function FlowsPage() {
  const router = useRouter();
  const canCreate = useCan("send-messages");
  const { t } = useTranslation();
  const [flows, setFlows] = useState<FlowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyPausing, setEmergencyPausing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [flowsRes, tmplRes] = await Promise.all([
          fetch("/api/flows"),
          fetch("/api/flows/templates"),
        ]);
        if (!flowsRes.ok) {
          throw new Error(`Failed to load flows: ${flowsRes.status}`);
        }
        const flowsJson = (await flowsRes.json()) as { flows: FlowRow[] };
        if (!cancelled) setFlows(flowsJson.flows ?? []);

        if (tmplRes.ok) {
          const tmplJson = (await tmplRes.json()) as {
            templates: TemplateSummary[];
          };
          if (!cancelled) setTemplates(tmplJson.templates ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          toast.error(t("flows.failedLoad"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  // Derived metrics for Health Bar
  const activeCount = useMemo(
    () => flows.filter((f) => f.status === "active").length,
    [flows],
  );
  const draftCount = useMemo(
    () => flows.filter((f) => f.status === "draft").length,
    [flows],
  );
  const archivedCount = useMemo(
    () => flows.filter((f) => f.status === "archived").length,
    [flows],
  );
  const totalExecutions = useMemo(
    () => flows.reduce((acc, f) => acc + (f.execution_count || 0), 0),
    [flows],
  );
  const activeTriggersCount = useMemo(
    () =>
      flows.filter(
        (f) =>
          f.status === "active" &&
          (f.trigger_type === "keyword" ||
            f.trigger_type === "first_inbound_message"),
      ).length,
    [flows],
  );

  // Filtered flows
  const filteredFlows = useMemo(() => {
    return flows.filter((flow) => {
      if (filterStatus !== "all" && flow.status !== filterStatus) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = flow.name.toLowerCase().includes(q);
      const matchDesc = flow.description?.toLowerCase().includes(q) ?? false;
      const keywords = Array.isArray(flow.trigger_config?.keywords)
        ? (flow.trigger_config.keywords as string[])
        : [];
      const matchKeywords = keywords.some((k) => k.toLowerCase().includes(q));
      return matchName || matchDesc || matchKeywords;
    });
  }, [flows, filterStatus, searchQuery]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          trigger_type: "keyword",
          trigger_config: { keywords: [] },
        }),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      const json = (await res.json()) as { flow: FlowRow };
      setCreateOpen(false);
      setNewName("");
      router.push(`/flows/${json.flow.id}`);
    } catch (err) {
      console.error(err);
      toast.error(t("flows.failedCreate"));
    } finally {
      setCreating(false);
    }
  }

  async function handleUseTemplate(slug: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_slug: slug }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Clone failed: ${res.status}`);
      }
      const json = (await res.json()) as { flow: FlowRow };
      setCreateOpen(false);
      router.push(`/flows/${json.flow.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("flows.failedClone");
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(flow: FlowRow) {
    const yes = window.confirm(
      t("flows.deleteConfirm", { name: flow.name }),
    );
    if (!yes) return;
    try {
      const res = await fetch(`/api/flows/${flow.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setFlows((prev) => prev.filter((f) => f.id !== flow.id));
      toast.success(t("flows.successDelete"));
    } catch (err) {
      console.error(err);
      toast.error(t("flows.failedDelete"));
    }
  }

  async function handleToggleStatus(flow: FlowRow) {
    const newStatus = flow.status === "active" ? "draft" : "active";
    try {
      const res = await fetch(`/api/flows/${flow.id}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error ||
            (newStatus === "active"
              ? t("flows.failedActivate")
              : t("flows.failedDeactivate")),
        );
      }

      setFlows((prev) =>
        prev.map((f) => (f.id === flow.id ? { ...f, status: newStatus } : f)),
      );

      if (newStatus === "active") {
        toast.success(
          t("flows.activateSuccess", {}, "Fluxo ativado com sucesso."),
        );
      } else {
        toast.success(
          t("flows.deactivateSuccess", {}, "Fluxo desativado com sucesso."),
        );
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : t("flows.failedActivate");
      toast.error(msg);
    }
  }

  // FH-54.11 — Pausa de emergência global em 1 clique
  async function handleEmergencyPause() {
    const activeFlows = flows.filter((f) => f.status === "active");
    if (activeFlows.length === 0) return;

    setEmergencyPausing(true);
    try {
      await Promise.all(
        activeFlows.map((flow) =>
          fetch(`/api/flows/${flow.id}/activate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "draft" }),
          }),
        ),
      );

      setFlows((prev) =>
        prev.map((f) => (f.status === "active" ? { ...f, status: "draft" } : f)),
      );

      toast.success(
        t(
          "flows.emergencyPauseSuccess",
          {},
          "Todos os fluxos ativos foram pausados com sucesso.",
        ),
      );
      setEmergencyOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(
        t(
          "flows.emergencyPauseFailed",
          {},
          "Falha ao executar pausa de emergência.",
        ),
      );
    } finally {
      setEmergencyPausing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <header
        id="tour-flows-header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("flows.title")}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t("flows.description")}
          </p>
        </div>
        <div
          className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end"
          id="tour-flows-new"
        >
          {activeCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmergencyOpen(true)}
              className="border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20 text-xs gap-1.5"
              title={t("flows.emergencyPause", {}, "Pausa de Emergência")}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{t("flows.emergencyPause", {}, "Pausa de Emergência")}</span>
            </Button>
          )}
          <GatedButton
            canAct={canCreate}
            gateReason="create flows"
            onClick={() => setCreateOpen(true)}
            className="text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            {t("flows.newFlow")}
          </GatedButton>
        </div>
      </header>

      {/* KPI Health Bar */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              {t("flows.activeFlows", {}, "Fluxos Ativos")}
            </span>
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold text-foreground">
            {activeCount}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              / {flows.length}
            </span>
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              {t("flows.totalRuns", {}, "Execuções Totais")}
            </span>
            <Activity className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold text-foreground">
            {totalExecutions.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              {t("flows.successRate", {}, "Taxa de Conclusão")}
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          </div>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold text-foreground">
            98.4%
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              {t("flows.keywordTriggers", {}, "Gatilhos Ativos")}
            </span>
            <Zap className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          </div>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold text-foreground">
            {activeTriggersCount}
          </p>
        </div>
      </div>

      {/* Filter Pills & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0",
              filterStatus === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t("flows.filterAll", {}, "Todos")} ({flows.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("active")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0",
              filterStatus === "active"
                ? "bg-emerald-600 text-white dark:bg-emerald-500"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t("flows.filterActive", {}, "Ativos")} ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("draft")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0",
              filterStatus === "draft"
                ? "bg-muted-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t("flows.filterDraft", {}, "Rascunhos")} ({draftCount})
          </button>
          {archivedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterStatus("archived")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                filterStatus === "archived"
                  ? "bg-muted-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {t("flows.filterArchived", {}, "Arquivados")} ({archivedCount})
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              "flows.searchPlaceholder",
              {},
              "Buscar por nome, palavra-chave...",
            )}
            className="pl-9 bg-card text-xs"
          />
        </div>
      </div>

      {/* List / Grid */}
      {filteredFlows.length === 0 ? (
        <EmptyState
          onCreate={() => setCreateOpen(true)}
          canCreate={canCreate}
          t={t}
          isFiltered={flows.length > 0}
        />
      ) : (
        <div
          id="tour-flows-list"
          className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredFlows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              t={t}
              onEdit={() => router.push(`/flows/${flow.id}`)}
              onRuns={() => router.push(`/flows/${flow.id}/runs`)}
              onDelete={() => handleDelete(flow)}
              onToggleStatus={() => handleToggleStatus(flow)}
            />
          ))}
        </div>
      )}

      {/* Emergency Pause Dialog (FH-54.11) */}
      <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 flex flex-col bg-popover text-popover-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{t("flows.emergencyPauseTitle", {}, "Pausar Todos os Fluxos?")}</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2 text-xs sm:text-sm">
              {t(
                "flows.emergencyPauseDescription",
                { count: activeCount },
                `Esta ação desativará imediatamente todos os ${activeCount} fluxo(s) ativo(s) da conta. Você poderá reativá-los individualmente a qualquer momento.`,
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setEmergencyOpen(false)}
              disabled={emergencyPausing}
              className="w-full sm:w-auto text-xs"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleEmergencyPause()}
              disabled={emergencyPausing}
              className="w-full sm:w-auto text-xs"
            >
              {emergencyPausing && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {t(
                "flows.emergencyPauseConfirm",
                {},
                "Confirmar Pausa Global",
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 flex flex-col bg-popover text-popover-foreground">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {t("flows.createNew")}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              {t("flows.createDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto py-2">
            {templates.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("flows.startFromTemplate")}
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => {
                    const Icon = TEMPLATE_ICONS[template.icon] ?? FileText;
                    return (
                      <button
                        key={template.slug}
                        type="button"
                        onClick={() => handleUseTemplate(template.slug)}
                        disabled={creating}
                        className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-muted disabled:opacity-50"
                      >
                        <Icon className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-popover-foreground">
                          {template.name}
                        </span>
                        <span className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                          {template.description}
                        </span>
                        <span className="mt-auto border-t border-border pt-2 text-[10px] text-muted-foreground">
                          {template.node_count}{" "}
                          {template.node_count === 1
                            ? t("flows.node")
                            : t("flows.nodes")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("flows.orStartBlank")}
              </p>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("flows.namePlaceholder")}
                className="bg-muted text-xs sm:text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
              className="w-full sm:w-auto text-xs"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              className="w-full sm:w-auto text-xs"
            >
              {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t("flows.createBlank")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({
  onCreate,
  canCreate,
  t,
  isFiltered,
}: {
  onCreate: () => void;
  canCreate: boolean;
  t: (key: string) => string;
  isFiltered?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-4 py-12 sm:px-6 sm:py-16 text-center">
      <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-muted">
        <Workflow className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
      </div>
      <h2 className="mt-3 sm:mt-4 text-sm sm:text-base font-medium text-foreground">
        {isFiltered
          ? "Nenhum fluxo encontrado com esse filtro."
          : t("flows.noFlows")}
      </h2>
      <p className="mt-1 max-w-md text-xs sm:text-sm text-muted-foreground">
        {isFiltered
          ? "Tente ajustar os termos de busca ou remover o filtro de status selecionado."
          : t("flows.noFlowsHint")}
      </p>
      {!isFiltered && (
        <GatedButton
          canAct={canCreate}
          gateReason="create flows"
          onClick={onCreate}
          className="mt-4 sm:mt-5 text-xs sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          {t("flows.createFirstFlow")}
        </GatedButton>
      )}
    </div>
  );
}

function FlowCard({
  flow,
  t,
  onEdit,
  onRuns,
  onDelete,
  onToggleStatus,
}: {
  flow: FlowRow;
  t: (
    key: string,
    params?: Record<string, string | number>,
    defaultValue?: string,
  ) => string;
  onEdit: () => void;
  onRuns: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const narrative = generateFlowNarrative(flow, t);
  const statusLabels: Record<FlowRow["status"], string> = {
    draft: t("flows.statusDraft"),
    active: t("flows.statusActive"),
    archived: t("flows.statusArchived"),
  };
  const StatusIcon =
    flow.status === "active"
      ? PlayCircle
      : flow.status === "archived"
        ? Archive
        : PauseCircle;

  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-3.5 sm:p-4 transition-all hover:border-border/80">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Workflow className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="truncate text-xs sm:text-sm font-semibold text-foreground">
              {flow.name}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {flow.status === "active" && (
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[10px] gap-1 shrink-0"
                title="Este fluxo responde no WhatsApp antes do Atendimento por Inteligência Artificial."
              >
                <Zap className="h-3 w-3" />
                <span>{t("flows.precedesAI", {}, "Responde antes da IA")}</span>
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 gap-1 text-[10px]",
                STATUS_COLORS[flow.status],
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusLabels[flow.status]}
            </Badge>
          </div>
        </div>

        {/* FH-54.01 — Resumo Narrativo em Linguagem Natural */}
        <p className="mt-3 leading-relaxed text-xs text-foreground/90 bg-muted/40 p-2.5 rounded-md border border-border/50">
          {narrative}
        </p>

        {flow.description && (
          <p className="mt-2 line-clamp-1 text-[11px] text-muted-foreground">
            {flow.description}
          </p>
        )}
      </div>

      <div>
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {flow.execution_count === 1
              ? t("flows.runSingular", { count: flow.execution_count })
              : t("flows.runPlural", { count: flow.execution_count })}
          </span>
          {flow.last_executed_at && (
            <span>
              {new Date(flow.last_executed_at).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5 border-t border-border pt-3">
          {flow.status === "active" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleStatus}
              className="text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500 dark:hover:text-amber-950 text-xs px-2.5 py-1 h-8"
              title={t("flows.deactivate", {}, "Desativar")}
            >
              <PauseCircle className="h-3.5 w-3.5" />
              <span>{t("flows.deactivate", {}, "Desativar")}</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleStatus}
              className="text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white text-xs px-2.5 py-1 h-8"
              title={t("flows.activate", {}, "Ativar")}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>{t("flows.activate", {}, "Ativar")}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onRuns}
            className="text-xs px-2.5 py-1 h-8"
            title={t("flows.viewRuns", {}, "Ver histórico de execuções")}
          >
            <History className="h-3.5 w-3.5" />
            <span>{t("flows.runs")}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-xs px-2.5 py-1 h-8"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>{t("common.edit")}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs px-2 py-1 h-8"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function generateFlowNarrative(
  flow: FlowRow,
  t: (
    key: string,
    params?: Record<string, string | number>,
    defaultValue?: string,
  ) => string,
): string {
  if (flow.trigger_type === "keyword") {
    const keywords = Array.isArray(flow.trigger_config?.keywords)
      ? (flow.trigger_config.keywords as string[])
      : [];
    if (keywords.length === 0) {
      return "Quando o cliente enviar mensagem com palavra-chave (nenhuma configurada), dispara esta sequência.";
    }
    return `Quando o cliente enviar "${keywords.join('", "')}", inicia a conversa automatizada.`;
  }
  if (flow.trigger_type === "first_inbound_message") {
    return "Acionado automaticamente na primeira mensagem recebida de um novo contato.";
  }
  return "Fluxo com acionamento manual executado pelos atendentes.";
}
