"use client";

/**
 * Editor header — flow name / description, status badge, dirty
 * indicator, and the action buttons (Save, Activate/Pause, Delete,
 * View runs, Back).
 *
 * Lifted out of flow-builder.tsx so the same header renders above
 * both views in FlowEditorShell. Without this, canvas users had no
 * way to save without toggling to list view.
 *
 * Reads everything from the editor context (`useFlowEditor`) so it
 * stays in sync with whichever view is mutating state, and routes
 * router navigation locally (back to /flows, View runs to
 * /flows/[id]/runs) — those don't belong in the hook.
 */

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  History,
  Loader2,
  Play,
  PauseCircle,
  PlayCircle,
  Save,
  Trash2,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useFlowEditor,
  type BuilderState,
} from "./flow-editor-state";

interface ManualContactOption {
  id: string;
  name: string | null;
  phone: string;
}

export function EditorHeader() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    flow,
    state,
    setState,
    dirty,
    saving,
    activating,
    canActivate,
    save,
    setStatus,
    deleteFlow,
  } = useFlowEditor();

  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [contactOptions, setContactOptions] = useState<ManualContactOption[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const selectedContact = useMemo(
    () => contactOptions.find((c) => c.id === selectedContactId) ?? null,
    [contactOptions, selectedContactId],
  );

  useEffect(() => {
    if (!dispatchOpen) return;
    let cancelled = false;

    const run = async () => {
      setLoadingContacts(true);
      const supabase = createClient();

      let query = supabase
        .from("contacts")
        .select("id, name, phone")
        .order("updated_at", { ascending: false })
        .limit(30);

      const q = contactQuery.trim();
      if (q) {
        // Partial match on both name and phone to speed up picking a target.
        query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
      }

      const { data } = await query;
      if (!cancelled) {
        const rows = (data ?? []) as ManualContactOption[];
        setContactOptions(rows);
        if (rows.length > 0 && !selectedContactId) {
          setSelectedContactId(rows[0].id);
        }
        setLoadingContacts(false);
      }
    };

    const handle = window.setTimeout(run, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [dispatchOpen, contactQuery, selectedContactId]);

  const handleManualDispatch = async () => {
    if (!selectedContactId) return;
    setDispatching(true);
    try {
      const res = await fetch(`/api/flows/${flow.id}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: selectedContactId }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        flow_run_id?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? t("flows.manualDispatchFailed"));
      }
      toast.success(
        t("flows.manualDispatchSuccess", {
          contact: selectedContact?.name || selectedContact?.phone || "",
        }),
      );
      setDispatchOpen(false);
      setContactQuery("");
      router.push(`/flows/${flow.id}/runs`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("flows.manualDispatchFailed");
      toast.error(msg);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => router.push("/flows")}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {t("flows.flowsNav")}
        </button>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Workflow className="h-5 w-5 shrink-0 text-primary" />
          <Input
            value={state.name}
            onChange={(e) =>
              setState((s) => ({ ...s, name: e.target.value }))
            }
            placeholder={t("flows.flowNamePlaceholder")}
            className="max-w-md bg-card text-lg font-semibold"
          />
          <StatusBadge status={state.status} />
          {dirty && (
            <span
              className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-primary"
              title={t("flows.unsavedChanges")}
              aria-live="polite"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("flows.edited")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {state.trigger_type === "manual" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDispatchOpen(true)}
              disabled={state.status !== "active" || dirty || saving}
              title={
                state.status !== "active"
                  ? t("flows.manualDispatchRequiresActive")
                  : dirty
                    ? t("flows.manualDispatchRequiresSaved")
                    : undefined
              }
            >
              <Play className="h-3.5 w-3.5" />
              {t("flows.manualDispatch")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/flows/${flow.id}/runs`)}
          >
            <History className="h-3.5 w-3.5" />
            {t("flows.runs")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void deleteFlow()}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("common.delete")}
          </Button>
          {state.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void setStatus("draft")}
              disabled={activating}
            >
              {activating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PauseCircle className="h-3.5 w-3.5" />
              )}
              {t("flows.pause")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void setStatus("active")}
              disabled={activating || !canActivate}
              title={
                !canActivate
                  ? t("flows.fixIssuesBeforeActivating")
                  : undefined
              }
            >
              {activating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PlayCircle className="h-3.5 w-3.5" />
              )}
              {t("flows.activate")}
            </Button>
          )}
          <Button onClick={() => void save()} disabled={saving} size="sm">
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {t("common.save")}
          </Button>
        </div>
      </div>
      <Input
        value={state.description}
        onChange={(e) =>
          setState((s) => ({ ...s, description: e.target.value }))
        }
        placeholder={t("flows.descriptionPlaceholder")}
        className="bg-card text-sm"
      />

      <Dialog open={dispatchOpen} onOpenChange={setDispatchOpen}>
        <DialogContent className="border-border bg-popover sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">
              {t("flows.manualDispatch")}
            </DialogTitle>
            <DialogDescription>
              {t("flows.manualDispatchDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              placeholder={t("flows.searchContactPlaceholder")}
              className="bg-muted"
            />

            <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-border p-2">
              {loadingContacts ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  {t("common.loading")}
                </div>
              ) : contactOptions.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  {t("flows.noContactsFound")}
                </div>
              ) : (
                contactOptions.map((contact) => {
                  const selected = selectedContactId === contact.id;
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setSelectedContactId(contact.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left",
                        selected
                          ? "border-primary/60 bg-primary/10"
                          : "border-border bg-card hover:bg-muted",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {contact.name || t("inbox.unknownContact")}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {contact.phone}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDispatchOpen(false)}
              disabled={dispatching}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => void handleManualDispatch()}
              disabled={!selectedContactId || dispatching}
            >
              {dispatching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {t("flows.startManualRun")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: BuilderState["status"] }) {
  const { t } = useTranslation();
  const cls = {
    draft: "border-border bg-muted text-muted-foreground",
    active: "border-primary/40 bg-primary-soft text-primary",
    archived: "border-border bg-muted/50 text-muted-foreground",
  }[status];

  const label = {
    draft: t("flows.statusDraft"),
    active: t("flows.statusActive"),
    archived: t("flows.statusArchived"),
  }[status];

  return (
    <Badge variant="outline" className={cn("shrink-0", cls)}>
      {label}
    </Badge>
  );
}
