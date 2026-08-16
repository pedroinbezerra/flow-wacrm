"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { CURRENCIES, formatCurrency } from "@/lib/currency";
import type { Contact, Deal, Pipeline, PipelineStage, Profile } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, DollarSign, Plus, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface DirectDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  conversationId?: string;
  onDealAssociated: () => void;
}

type PipelineWithStages = Pipeline & { stages: PipelineStage[] };

export function DirectDealModal({
  open,
  onOpenChange,
  contact,
  conversationId,
  onDealAssociated,
}: DirectDealModalProps) {
  const supabase = createClient();
  const { accountId, user, defaultCurrency } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"link" | "create">("link");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states - Create
  const [pipelines, setPipelines] = useState<PipelineWithStages[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState("");
  const [selectedStageId, setSelectedStageId] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency || "BRL");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [members, setMembers] = useState<Profile[]>([]);

  // Link state
  const [openDeals, setOpenDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState("");

  useEffect(() => {
    if (!open || !accountId) return;

    async function loadInitialData() {
      setLoading(true);
      try {
        // Load Pipelines & Stages
        const { data: pipelinesData, error: pipelinesErr } = await supabase
          .from("pipelines")
          .select("*, stages:pipeline_stages(*)")
          .eq("account_id", accountId)
          .order("name");

        if (!pipelinesErr && pipelinesData) {
          const typedPipelines = pipelinesData as PipelineWithStages[];
          setPipelines(typedPipelines);

          if (typedPipelines.length > 0) {
            const firstPipeline = typedPipelines[0];
            setSelectedPipelineId(firstPipeline.id);
            const sortedStages = [...(firstPipeline.stages || [])].sort(
              (a, b) => a.position - b.position
            );
            if (sortedStages.length > 0) {
              setSelectedStageId(sortedStages[0].id);
            }
          }
        }

        // Load open deals unassigned to this contact
        const { data: dealsData, error: dealsErr } = await supabase
          .from("deals")
          .select("*, stage:pipeline_stages(*)")
          .eq("account_id", accountId)
          .or(`contact_id.is.null,contact_id.neq.${contact.id}`)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!dealsErr && dealsData) {
          setOpenDeals(dealsData as Deal[]);
        }

        // Load account members
        const membersRes = await fetch("/api/account/members");
        if (membersRes.ok) {
          const resJson = await membersRes.json();
          const list = Array.isArray(resJson?.members)
            ? resJson.members
            : Array.isArray(resJson)
              ? resJson
              : [];
          setMembers(list);
        }
      } catch {
        toast.error(t("inbox.deals.messages.loadError"));
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [open, accountId, contact.id, supabase, t, defaultCurrency]);

  // Handle pipeline selection change
  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    const targetPipeline = pipelines.find((p) => p.id === pipelineId);
    if (targetPipeline && targetPipeline.stages.length > 0) {
      const sorted = [...targetPipeline.stages].sort(
        (a, b) => a.position - b.position
      );
      setSelectedStageId(sorted[0].id);
    } else {
      setSelectedStageId("");
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !user?.id || !selectedPipelineId || !selectedStageId) {
      return;
    }

    const cleanTitle = title.trim() || `${contact.name || contact.phone} - Negócio`;

    setSubmitting(true);
    try {
      const numValue = value ? parseFloat(value.replace(",", ".")) : 0;

      const { error } = await supabase
        .from("deals")
        .insert({
          account_id: accountId,
          user_id: user.id,
          pipeline_id: selectedPipelineId,
          stage_id: selectedStageId,
          contact_id: contact.id,
          conversation_id: conversationId || null,
          title: cleanTitle,
          value: isNaN(numValue) ? 0 : numValue,
          currency: currency || defaultCurrency || "BRL",
          assigned_to: assignedTo || null,
          notes: notes.trim() || null,
          status: "open",
        });

      if (error) throw error;

      toast.success(t("inbox.deals.messages.createdSuccess"));
      if (conversationId && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("flowhub:refresh_timeline", {
            detail: { conversationId },
          })
        );
      }

      onDealAssociated();
      onOpenChange(false);
      resetForm();
    } catch {
      toast.error(t("inbox.deals.messages.createError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !selectedDealId) return;

    setSubmitting(true);
    try {
      const updateData: { contact_id: string; conversation_id?: string } = {
        contact_id: contact.id,
      };

      if (conversationId) {
        updateData.conversation_id = conversationId;
      }

      const { error } = await supabase
        .from("deals")
        .update(updateData)
        .eq("id", selectedDealId)
        .eq("account_id", accountId);

      if (error) throw error;

      toast.success(t("inbox.deals.messages.linkedSuccess"));
      if (conversationId && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("flowhub:refresh_timeline", {
            detail: { conversationId },
          })
        );
      }

      onDealAssociated();
      onOpenChange(false);
      resetForm();
    } catch {
      toast.error(t("inbox.deals.messages.linkError"));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setValue("");
    setNotes("");
    setAssignedTo("");
    setSelectedDealId("");
  };

  const currentPipelineStages =
    pipelines.find((p) => p.id === selectedPipelineId)?.stages || [];
  const sortedStages = [...currentPipelineStages].sort(
    (a, b) => a.position - b.position
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            {t("inbox.deals.title")}
          </DialogTitle>
          <DialogDescription>
            {t("inbox.deals.description")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "create" | "link")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" className="gap-1.5 text-xs">
                <LinkIcon className="h-3.5 w-3.5" />
                {t("inbox.deals.tabs.link")}
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                {t("inbox.deals.tabs.create")}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: VINCULAR NEGÓCIO EXISTENTE */}
            <TabsContent value="link" className="mt-4 space-y-4">
              <form onSubmit={handleLinkDeal} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {t("inbox.deals.fields.selectDeal")}{" "}
                    <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  {openDeals.length === 0 ? (
                    <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {t("inbox.deals.fields.noOpenDeals")}
                    </p>
                  ) : (
                    <Select value={selectedDealId} onValueChange={(val) => setSelectedDealId(val ?? "")}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder={t("inbox.deals.fields.selectDeal")}>
                          {openDeals.find((d) => d.id === selectedDealId)?.title || t("inbox.deals.fields.selectDeal")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {openDeals.map((d) => (
                          <SelectItem key={d.id} value={d.id} className="text-xs">
                            <span className="font-medium text-foreground">{d.title}</span>
                            {d.stage && (
                              <span
                                className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                  backgroundColor: `${d.stage.color}20`,
                                  color: d.stage.color,
                                }}
                              >
                                {d.stage.name}
                              </span>
                            )}
                            <span className="ml-2 font-mono font-bold text-primary text-xs">
                              {formatCurrency(d.value, d.currency)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                  >
                    {t("inbox.deals.actions.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submitting || !selectedDealId}
                  >
                    {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    {t("inbox.deals.actions.link")}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TAB 2: CRIAR NOVO NEGÓCIO */}
            <TabsContent value="create" className="mt-4 space-y-4">
              <form onSubmit={handleCreateDeal} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      {t("inbox.deals.fields.pipeline")}{" "}
                      <span className="text-destructive font-bold ml-0.5">*</span>
                    </Label>
                    <Select
                      value={selectedPipelineId}
                      onValueChange={(val) => handlePipelineChange(val ?? "")}
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder={t("inbox.deals.fields.selectPipeline")}>
                          {pipelines.find((p) => p.id === selectedPipelineId)?.name || t("inbox.deals.fields.selectPipeline")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {pipelines.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      {t("inbox.deals.fields.stage")}{" "}
                      <span className="text-destructive font-bold ml-0.5">*</span>
                    </Label>
                    <Select
                      value={selectedStageId}
                      onValueChange={(val) => setSelectedStageId(val ?? "")}
                      disabled={sortedStages.length === 0}
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder={t("inbox.deals.fields.selectStage")}>
                          {sortedStages.find((s) => s.id === selectedStageId)?.name || t("inbox.deals.fields.selectStage")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {sortedStages.map((s) => (
                          <SelectItem key={s.id} value={s.id} className="text-xs">
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {t("inbox.deals.fields.title")}{" "}
                    <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("inbox.deals.fields.titlePlaceholder")}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium">
                      {t("inbox.deals.fields.value")}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal ml-1">(opcional)</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="0.00"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">{t("inbox.deals.fields.currency")}</Label>
                    <Select value={currency} onValueChange={(val) => setCurrency(val ?? (defaultCurrency || "BRL"))}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue>
                          {CURRENCIES.find((c) => c.code === currency)?.code || currency}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code} className="text-xs">
                            {c.symbol} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {t("inbox.deals.fields.assignee")}{" "}
                    <span className="text-[10px] text-muted-foreground font-normal ml-1">(opcional)</span>
                  </Label>
                  <Select value={assignedTo} onValueChange={(val) => setAssignedTo(val ?? "")}>
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder={t("inbox.deals.fields.selectAssignee")}>
                        {members.find((m) => m.id === assignedTo)?.full_name || members.find((m) => m.id === assignedTo)?.email || t("inbox.deals.fields.selectAssignee")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-xs">
                          {m.full_name || m.email || m.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {t("inbox.deals.fields.notes")}{" "}
                    <span className="text-[10px] text-muted-foreground font-normal ml-1">(opcional)</span>
                  </Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("inbox.deals.fields.notesPlaceholder")}
                    className="min-h-[60px] text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                  >
                    {t("inbox.deals.actions.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submitting || !selectedStageId}
                  >
                    {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    {t("inbox.deals.actions.create")}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
