"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CircleCheck,
  CircleAlert,
  Clock,
  UserPlus,
  PlayCircle,
  PauseCircle,
  ChevronDown,
  ChevronRight,
  Workflow,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

/**
 * Run history viewer — Log de Execuções e Auditoria.
 * Totalmente responsivo para dispositivos móveis com baixa carga cognitiva.
 */

interface RunRow {
  id: string;
  status:
    | "active"
    | "completed"
    | "handed_off"
    | "timed_out"
    | "paused_by_agent"
    | "failed";
  current_node_key: string | null;
  started_at: string;
  last_advanced_at: string;
  ended_at: string | null;
  end_reason: string | null;
  vars: Record<string, unknown>;
  reprompt_count: number;
  contact: { id: string; name: string | null; phone: string } | null;
}

interface EventRow {
  flow_run_id: string;
  event_type: string;
  node_key: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

function getStatusMeta(
  t: (key: string) => string,
  status: RunRow["status"],
): { label: string; classes: string; icon: typeof Clock } {
  const map: Record<
    RunRow["status"],
    { label: string; classes: string; icon: typeof Clock }
  > = {
    active: {
      label: t("flows.statusActive"),
      classes:
        "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      icon: PlayCircle,
    },
    completed: {
      label: t("flows.statusCompleted"),
      classes: "border-border bg-muted text-muted-foreground",
      icon: CircleCheck,
    },
    handed_off: {
      label: t("flows.statusHandedOff"),
      classes:
        "border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
      icon: UserPlus,
    },
    timed_out: {
      label: t("flows.statusTimedOut"),
      classes: "border-border bg-muted/60 text-muted-foreground",
      icon: Clock,
    },
    paused_by_agent: {
      label: t("flows.statusPausedByAgent"),
      classes: "border-border bg-muted text-muted-foreground",
      icon: PauseCircle,
    },
    failed: {
      label: t("flows.statusFailed"),
      classes: "border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-300",
      icon: CircleAlert,
    },
  };
  return map[status];
}

export default function FlowRunsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [flow, setFlow] = useState<{ id: string; name: string } | null>(null);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/flows/${params.id}/runs`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = (await res.json()) as {
          flow: { id: string; name: string };
          runs: RunRow[];
          events: EventRow[];
        };
        if (!cancelled) {
          setFlow(json.flow);
          setRuns(json.runs ?? []);
          setEvents(json.events ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          toast.error(t("flows.couldntLoadRuns"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, t]);

  function toggle(runId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) next.delete(runId);
      else next.add(runId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !flow) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 py-24 p-4 text-center">
        <p className="text-sm text-muted-foreground">{t("flows.flowNotFound")}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/flows")}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("flows.backToFlows")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Navigation Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/flows")}
            className="gap-2 text-xs font-medium w-full sm:w-auto justify-center"
            title={t("flows.backToFlows", {}, "Voltar para lista de fluxos")}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("flows.backToFlows", {}, "Voltar para Fluxos")}
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Workflow className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
                {flow.name}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {t("flows.runs", {}, "Execuções")}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/flows/${flow.id}`)}
            className="gap-1.5 text-xs w-full sm:w-auto justify-center"
            title="Abrir construtor visual deste fluxo"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Editar no Canvas</span>
          </Button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground">
        {t("flows.runsDescription")}
      </p>

      {/* Content / Logs List */}
      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-4 py-12 sm:px-6 sm:py-16 text-center">
          <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/60 mb-2" />
          <p className="text-xs sm:text-sm font-medium text-foreground">
            {t("flows.noRunsYet")}
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Acione este fluxo enviando a palavra-chave configurada ou iniciando uma execução manual.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              events={events.filter((e) => e.flow_run_id === run.id)}
              expanded={expanded.has(run.id)}
              onToggle={() => toggle(run.id)}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RunCard({
  run,
  events,
  expanded,
  onToggle,
  t,
}: {
  run: RunRow;
  events: EventRow[];
  expanded: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}) {
  const meta = getStatusMeta(t, run.status);
  const StatusIcon = meta.icon;
  const contactLabel =
    run.contact?.name?.trim() || run.contact?.phone || t("flows.unknownContact");
  const duration = run.ended_at
    ? formatDistanceToNow(new Date(run.ended_at), {
        addSuffix: false,
      })
    : null;

  return (
    <div className="rounded-lg border border-border bg-card transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-left hover:bg-muted/40 rounded-lg transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="truncate text-xs sm:text-sm font-medium text-foreground">
              {contactLabel}
            </span>
            <Badge
              variant="outline"
              className={cn("gap-1 text-[10px] shrink-0", meta.classes)}
            >
              <StatusIcon className="h-3 w-3" />
              {meta.label}
            </Badge>
            {run.status === "active" && run.current_node_key && (
              <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground shrink-0">
                at {run.current_node_key}
              </code>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-muted-foreground">
            <span>
              {t("flows.started")} {format(new Date(run.started_at), "PP p")}
            </span>
            {run.reprompt_count > 0 && (
              <span>· {run.reprompt_count} {t("flows.reprompts")}</span>
            )}
            {duration && <span>· {t("flows.ranFor")} {duration}</span>}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-3 py-2.5 sm:px-4 sm:py-3 bg-muted/20">
          {Object.keys(run.vars).length > 0 && (
            <details className="mb-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                {t("flows.capturedVars")} ({Object.keys(run.vars).length})
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-md bg-background p-2.5 text-[10px] sm:text-[11px] text-muted-foreground border border-border">
                {JSON.stringify(run.vars, null, 2)}
              </pre>
            </details>
          )}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {events.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("flows.noEventsRecorded")}
              </p>
            ) : (
              events.map((ev, ix) => <EventLine key={ix} ev={ev} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const EVENT_COLOR: Record<string, string> = {
  started: "text-emerald-500 dark:text-emerald-400 font-semibold",
  node_entered: "text-muted-foreground",
  message_sent: "text-sky-600 dark:text-sky-300 font-medium",
  reply_received: "text-primary font-medium",
  fallback_fired: "text-amber-600 dark:text-amber-300 font-medium",
  handoff: "text-amber-600 dark:text-amber-300 font-semibold",
  timeout: "text-muted-foreground",
  error: "text-red-600 dark:text-red-400 font-semibold",
  completed: "text-emerald-500 dark:text-emerald-400 font-semibold",
};

function EventLine({ ev }: { ev: EventRow }) {
  const cls = EVENT_COLOR[ev.event_type] ?? "text-muted-foreground";
  return (
    <div className="flex flex-wrap sm:flex-nowrap items-start gap-1 sm:gap-2.5 rounded-md px-2 py-1 text-xs hover:bg-muted/50">
      <span className="w-16 sm:w-20 shrink-0 text-[10px] text-muted-foreground font-mono">
        {format(new Date(ev.created_at), "HH:mm:ss")}
      </span>
      <span className={cn("w-28 sm:w-32 shrink-0 font-mono text-[10px]", cls)}>
        {ev.event_type}
      </span>
      {ev.node_key && (
        <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
          {ev.node_key}
        </code>
      )}
      {Object.keys(ev.payload).length > 0 && (
        <span className="w-full sm:w-auto min-w-0 truncate text-[10px] text-muted-foreground">
          {summarizePayload(ev.payload)}
        </span>
      )}
    </div>
  );
}

function summarizePayload(payload: Record<string, unknown>): string {
  const keys = ["reply_id", "captured_key", "reason", "advancing_to"];
  for (const k of keys) {
    if (k in payload && payload[k] !== null && payload[k] !== undefined) {
      return `${k}=${String(payload[k]).slice(0, 80)}`;
    }
  }
  return "";
}
