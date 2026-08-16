"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pipeline, PipelineStage, Deal, Profile } from "@/types";
import { PipelineBoard } from "@/components/pipelines/pipeline-board";
import { PipelineSettings } from "@/components/pipelines/pipeline-settings";
import { DealForm } from "@/components/pipelines/deal-form";
import { PipelineAnalytics } from "@/components/pipelines/pipeline-analytics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitBranch, Plus, ChevronDown, Settings, Search, BarChart2, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { useCan } from "@/hooks/use-can";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { GatedButton } from "@/components/ui/gated-button";

// Pipeline creation is admin-class (settings-tier write under
// the new RLS); deal creation is operational and only requires
// agent+. The two CTAs gate on different `useCan` capabilities,
// not on different copy.

// Spec-defined seed — name and color per the product spec.
const SPEC_DEFAULT_STAGES = [
  { name: "New Lead", color: "#3b82f6", position: 0 }, // blue
  { name: "Qualified", color: "#eab308", position: 1 }, // yellow
  { name: "Proposal Sent", color: "#f97316", position: 2 }, // orange
  { name: "Negotiation", color: "#8b5cf6", position: 3 }, // purple
  { name: "Won", color: "#22c55e", position: 4 }, // green
];

export default function PipelinesPage() {
  const supabase = createClient();
  const canEditSettings = useCan("edit-settings");
  const canCreateDeals = useCan("send-messages");
  const { accountId, user } = useAuth();
  const { t } = useTranslation();

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dialog / sheet state
  const [newPipelineOpen, setNewPipelineOpen] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState("");
  const [creating, setCreating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Deal form state is lifted here so both the top-bar "Add Deal" and
  // the per-column "+" trigger the same Sheet.
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [defaultStageId, setDefaultStageId] = useState<string>("");

  // Guard against double-seeding (React StrictMode double-effect in dev).
  const seedAttempted = useRef(false);

  const loadPipelines = useCallback(async () => {
    const { data, error } = await supabase
      .from("pipelines")
      .select("*")
      .order("created_at");
    if (error) {
      console.error("Failed to load pipelines:", error.message);
      return [];
    }
    return data ?? [];
  }, [supabase]);

  const loadStages = useCallback(
    async (pipelineId: string) => {
      const { data } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("pipeline_id", pipelineId)
        .order("position");
      return data ?? [];
    },
    [supabase],
  );

  const loadDeals = useCallback(
    async (pipelineId: string) => {
      const { data } = await supabase
        .from("deals")
        .select("*, contact:contacts(*), assignee:profiles!deals_assigned_to_fkey(*)")
        .eq("pipeline_id", pipelineId)
        .order("created_at", { ascending: false });
      return (data ?? []) as Deal[];
    },
    [supabase],
  );

  const seedDefaultPipeline = useCallback(async (): Promise<Pipeline | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;
    // pipelines.account_id is NOT NULL post-017 with no DB default.
    if (!accountId) return null;

    const { data: pipeline, error } = await supabase
      .from("pipelines")
      .insert({ user_id: user.id, account_id: accountId, name: "Sales Pipeline" })
      .select()
      .single();

    if (error || !pipeline) {
      console.error("Failed to seed pipeline:", error?.message);
      return null;
    }

    const stagesPayload = SPEC_DEFAULT_STAGES.map((s) => ({
      pipeline_id: pipeline.id,
      name: s.name,
      color: s.color,
      position: s.position,
    }));
    await supabase.from("pipeline_stages").insert(stagesPayload);

    return pipeline as Pipeline;
  }, [supabase, accountId]);

  // Initial load + seed-if-empty
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let list = await loadPipelines();

      if (list.length === 0 && !seedAttempted.current) {
        seedAttempted.current = true;
        const seeded = await seedDefaultPipeline();
        if (seeded) list = await loadPipelines();
      }

      if (cancelled) return;
      setPipelines(list);
      if (list.length > 0) {
        setSelectedPipelineId((prev) =>
          prev && list.some((p) => p.id === prev) ? prev : list[0].id,
        );
      } else {
        setSelectedPipelineId("");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPipelines, seedDefaultPipeline]);

  // Load stages + deals whenever selected pipeline changes.
  // Clearing on no-selection is a legitimate sync with URL/prop
  // state; the load completion uses async setters inside promise
  // callbacks (not synchronous in the effect body).
  useEffect(() => {
    if (!selectedPipelineId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStages([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeals([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const [s, d] = await Promise.all([
        loadStages(selectedPipelineId),
        loadDeals(selectedPipelineId),
      ]);
      if (cancelled) return;
      setStages(s);
      setDeals(d);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPipelineId, loadStages, loadDeals]);

  const refreshPipelines = useCallback(async () => {
    const list = await loadPipelines();
    setPipelines(list);
    if (list.length === 0) setSelectedPipelineId("");
    else if (!list.some((p) => p.id === selectedPipelineId))
      setSelectedPipelineId(list[0].id);
  }, [loadPipelines, selectedPipelineId]);

  const refreshStages = useCallback(async () => {
    if (!selectedPipelineId) return;
    setStages(await loadStages(selectedPipelineId));
  }, [loadStages, selectedPipelineId]);

  const refreshDeals = useCallback(async () => {
    if (!selectedPipelineId) return;
    setDeals(await loadDeals(selectedPipelineId));
  }, [loadDeals, selectedPipelineId]);

  const handleDealMoved = useCallback(
    async (dealId: string, newStageId: string) => {
      // Optimistic update — board already animated; just persist.
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage_id: newStageId } : d)),
      );
      const { error } = await supabase
        .from("deals")
        .update({ stage_id: newStageId })
        .eq("id", dealId);
      if (error) {
        toast.error(t("pipelines.failedMove"));
        refreshDeals();
      }
    },
    [supabase, refreshDeals, t],
  );

  // Load team profiles for assignee filtering
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      if (cancelled) return;
      setProfiles((data ?? []) as Profile[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleAddDeal = useCallback(
    (stageId?: string) => {
      setEditingDeal(null);
      setDefaultStageId(stageId ?? stages[0]?.id ?? "");
      setDealFormOpen(true);
    },
    [stages],
  );

  // Global Keyboard Shortcuts (/ for search, N for new deal)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if ((e.key === "n" || e.key === "N") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (canCreateDeals && selectedPipelineId && stages.length > 0) {
          handleAddDeal();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canCreateDeals, selectedPipelineId, stages.length, handleAddDeal]);

  // Compute filtered deals based on search term, assignee, and status
  const filteredDeals = useMemo(() => {
    let list = deals;

    if (statusFilter !== "all") {
      list = list.filter((d) => (d.status || "open") === statusFilter);
    }

    if (assigneeFilter === "me") {
      if (user?.id) list = list.filter((d) => d.assigned_to === user.id);
    } else if (assigneeFilter !== "all") {
      list = list.filter((d) => d.assigned_to === assigneeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((d) => {
        const titleMatch = d.title.toLowerCase().includes(q);
        const contactNameMatch = d.contact?.name?.toLowerCase().includes(q);
        const contactPhoneMatch = d.contact?.phone?.includes(q);
        return titleMatch || contactNameMatch || contactPhoneMatch;
      });
    }

    return list;
  }, [deals, statusFilter, assigneeFilter, searchQuery, user?.id]);

  const handleStatusChanged = useCallback(
    async (dealId: string, newStatus: "won" | "lost" | "open") => {
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: newStatus } : d)),
      );
      const { error } = await supabase
        .from("deals")
        .update({ status: newStatus })
        .eq("id", dealId);
      if (error) {
        toast.error(t("pipelines.failedUpdateStatus"));
        refreshDeals();
      } else {
        const msg =
          newStatus === "won"
            ? t("pipelines.markedWon")
            : newStatus === "lost"
            ? t("pipelines.markedLost")
            : t("pipelines.reopened");
        toast.success(msg);
      }
    },
    [supabase, refreshDeals, t],
  );

  const handleEditDeal = useCallback((deal: Deal) => {
    setEditingDeal(deal);
    setDefaultStageId(deal.stage_id);
    setDealFormOpen(true);
  }, []);

  async function handleCreatePipeline() {
    const name = newPipelineName.trim();
    if (!name) return;
    setCreating(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setCreating(false);
      return;
    }
    // pipelines.account_id is NOT NULL post-017 with no DB default.
    if (!accountId) {
      toast.error(t("pipelines.noAccountLinked"));
      setCreating(false);
      return;
    }

    const { data: pipeline, error } = await supabase
      .from("pipelines")
      .insert({ user_id: user.id, account_id: accountId, name })
      .select()
      .single();

    if (error || !pipeline) {
      toast.error(t("pipelines.failedCreate"));
      setCreating(false);
      return;
    }

    const stagesPayload = SPEC_DEFAULT_STAGES.map((s) => ({
      pipeline_id: pipeline.id,
      name: s.name,
      color: s.color,
      position: s.position,
    }));
    await supabase.from("pipeline_stages").insert(stagesPayload);

    setNewPipelineName("");
    setNewPipelineOpen(false);
    setSelectedPipelineId(pipeline.id);
    await refreshPipelines();
    setCreating(false);
    toast.success(t("pipelines.successCreate"));
  }

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-96 w-72 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (assigneeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div id="tour-pipelines-header" className="flex items-center justify-between gap-3">
        {/* Desktop Header Toolbar (>= md) */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex flex-wrap items-center gap-2">
            {/* Pipeline selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors data-[popup-open]:bg-muted"
              >
                <GitBranch className="h-4 w-4 text-primary" />
                <span className="font-semibold">
                  {selectedPipeline?.name ?? t("pipelines.selectPipeline")}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-64 border-border bg-popover text-popover-foreground"
              >
                {pipelines.length === 0 && (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    {t("pipelines.noPipelines")}
                  </DropdownMenuItem>
                )}
                {pipelines.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setSelectedPipelineId(p.id)}
                    className={
                      p.id === selectedPipelineId
                        ? "text-primary"
                        : "text-popover-foreground"
                    }
                  >
                    <GitBranch className="mr-2 h-3.5 w-3.5" />
                    {p.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-border" />
                {selectedPipeline && (
                  <DropdownMenuItem
                    onClick={() => setSettingsOpen(true)}
                    className="text-popover-foreground"
                  >
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    {t("pipelines.managePipelines")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search input */}
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("pipelines.searchPlaceholder")}
                className="h-9 border-border bg-card pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
                  /
                </kbd>
              )}
            </div>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="all">{t("pipelines.allAssignees")}</option>
              <option value="me">{t("pipelines.myDeals")}</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="open">{t("pipelines.statusOpen")}</option>
              <option value="all">{t("pipelines.allStatuses")}</option>
              <option value="won">{t("pipelines.statusWon")}</option>
              <option value="lost">{t("pipelines.statusLost")}</option>
            </select>

            {/* Toggle Analytics */}
            <Button
              variant={showAnalytics ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowAnalytics((v) => !v)}
              className="h-9 border-border text-xs gap-1.5"
              title={t("pipelines.toggleAnalytics")}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>{t("pipelines.toggleAnalytics")}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <GatedButton
              variant="outline"
              canAct={canEditSettings}
              gateReason="create pipelines"
              onClick={() => setNewPipelineOpen(true)}
              className="border-border bg-card text-foreground hover:bg-muted"
            >
              <Plus className="mr-1 h-4 w-4" />
              {t("pipelines.addPipeline")}
            </GatedButton>
            <GatedButton
              canAct={canCreateDeals}
              gateReason="create deals"
              disabled={!selectedPipelineId || stages.length === 0}
              onClick={() => handleAddDeal()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-1 h-4 w-4" />
              {t("pipelines.addDeal")}
            </GatedButton>
          </div>
        </div>

        {/* Mobile Header Toolbar (< md) */}
        <div className="flex md:hidden items-center justify-between gap-2 w-full">
          {/* Pipeline selector dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground hover:bg-muted transition-colors truncate max-w-[150px]"
            >
              <GitBranch className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-semibold truncate">
                {selectedPipeline?.name ?? t("pipelines.selectPipeline")}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 border-border bg-popover text-popover-foreground"
            >
              {pipelines.length === 0 && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  {t("pipelines.noPipelines")}
                </DropdownMenuItem>
              )}
              {pipelines.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => setSelectedPipelineId(p.id)}
                  className={
                    p.id === selectedPipelineId
                      ? "text-primary"
                      : "text-popover-foreground"
                  }
                >
                  <GitBranch className="mr-2 h-3.5 w-3.5" />
                  {p.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-border" />
              {selectedPipeline && (
                <DropdownMenuItem
                  onClick={() => setSettingsOpen(true)}
                  className="text-popover-foreground"
                >
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  {t("pipelines.managePipelines")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1.5">
            {/* Filter Trigger Button */}
            <Button
              variant={activeFilterCount > 0 ? "secondary" : "outline"}
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="h-8 px-2.5 text-xs gap-1 border-border relative"
              aria-label={t("pipelines.mobileFiltersTitle")}
            >
              <Filter className="h-3.5 w-3.5" />
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Toggle Analytics */}
            <Button
              variant={showAnalytics ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowAnalytics((v) => !v)}
              className="h-8 px-2.5 border-border"
              title={t("pipelines.toggleAnalytics")}
            >
              <BarChart2 className="h-3.5 w-3.5" />
            </Button>

            {/* Quick Add Deal Button */}
            <GatedButton
              canAct={canCreateDeals}
              gateReason="create deals"
              disabled={!selectedPipelineId || stages.length === 0}
              onClick={() => handleAddDeal()}
              size="sm"
              className="h-8 px-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("pipelines.addDeal")}</span>
            </GatedButton>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <DialogContent className="sm:max-w-md bg-popover border-border">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">
              {t("pipelines.mobileFiltersTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">{t("common.search")}</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("pipelines.searchPlaceholder")}
                  className="border-border bg-muted pl-8 text-foreground"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">{t("pipelines.filterAssignee")}</Label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="all">{t("pipelines.allAssignees")}</option>
                <option value="me">{t("pipelines.myDeals")}</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">{t("pipelines.filterStatus")}</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="open">{t("pipelines.statusOpen")}</option>
                <option value="all">{t("pipelines.allStatuses")}</option>
                <option value="won">{t("pipelines.statusWon")}</option>
                <option value="lost">{t("pipelines.statusLost")}</option>
              </select>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between border-border bg-popover/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setAssigneeFilter("all");
                setStatusFilter("all");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t("pipelines.clearFilters")}
            </Button>
            <Button
              size="sm"
              onClick={() => setMobileFilterOpen(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Board */}
      {pipelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <GitBranch className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {t("pipelines.noPipelines")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("pipelines.noPipelinesHint")}
          </p>
          <GatedButton
            canAct={canEditSettings}
            gateReason="create pipelines"
            onClick={() => setNewPipelineOpen(true)}
            className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-1 h-4 w-4" />
            {t("pipelines.createPipeline")}
          </GatedButton>
        </div>
      ) : (
        <>
          {showAnalytics && <PipelineAnalytics stages={stages} deals={deals} />}
          <div id="tour-pipelines-stages">
            <PipelineBoard
              stages={stages}
              deals={filteredDeals}
              onDealMoved={handleDealMoved}
              onStatusChanged={handleStatusChanged}
              onAddDeal={handleAddDeal}
              onEditDeal={handleEditDeal}
            />
          </div>
        </>
      )}

      {/* New Pipeline Dialog */}
      <Dialog open={newPipelineOpen} onOpenChange={setNewPipelineOpen}>
        <DialogContent className="sm:max-w-sm bg-popover border-border">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">{t("pipelines.new")}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-muted-foreground">{t("pipelines.nameLabel")}</Label>
            <Input
              value={newPipelineName}
              onChange={(e) => setNewPipelineName(e.target.value)}
              placeholder={t("pipelines.namePlaceholder")}
              className="mt-2 bg-muted border-border text-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreatePipeline();
              }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("pipelines.defaultStagesHint")}
            </p>
          </div>
          <DialogFooter className="bg-popover/50 border-border">
            <Button
              variant="outline"
              onClick={() => setNewPipelineOpen(false)}
              className="border-border text-muted-foreground hover:bg-muted"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreatePipeline}
              disabled={creating || !newPipelineName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {creating ? t("pipelines.creating") : t("pipelines.createPipeline")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pipeline Settings */}
      {selectedPipeline && (
        <PipelineSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          pipeline={selectedPipeline}
          stages={stages}
          onPipelinesChanged={refreshPipelines}
          onStagesChanged={refreshStages}
          onCreateNewPipeline={() => {
            setSettingsOpen(false);
            setNewPipelineOpen(true);
          }}
        />
      )}

      {/* Deal Form (Sheet) */}
      <DealForm
        open={dealFormOpen}
        onOpenChange={setDealFormOpen}
        deal={editingDeal}
        pipelineId={selectedPipelineId}
        stages={stages}
        defaultStageId={defaultStageId}
        onSaved={refreshDeals}
      />
    </div>
  );
}
