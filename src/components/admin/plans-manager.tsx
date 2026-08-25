"use client";

import { useEffect, useState, useMemo } from "react";
import type { CommercialPlan, Account, BillingPeriod, PlanStatus, SubscriptionStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Edit3,
  Trash2,
  Building2,
  Layers,
  Users,
  Bot,
  Zap,
  Calendar,
  BarChart3,
  Webhook,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  CreditCard,
  PhoneCall,
  MessageSquare,
  GitBranch,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const formatBillingPeriod = (period?: BillingPeriod) => {
  switch (period) {
    case "monthly":
      return "Mensal";
    case "yearly":
      return "Anual";
    case "one_time":
      return "Pagamento único";
    case "none":
      return "Gratuito";
    default:
      return period || "Mensal";
  }
};

const formatSubscriptionStatus = (status?: SubscriptionStatus) => {
  switch (status) {
    case "active":
      return { label: "Ativo", variant: "default" as const };
    case "trialing":
      return { label: "Em teste", variant: "secondary" as const };
    case "past_due":
      return { label: "Inadimplente", variant: "destructive" as const };
    case "canceled":
      return { label: "Cancelado", variant: "outline" as const };
    case "suspended":
      return { label: "Suspenso", variant: "destructive" as const };
    case "read_only":
      return { label: "Somente leitura", variant: "secondary" as const };
    default:
      return { label: status || "Ativo", variant: "default" as const };
  }
};

export function PlansManager() {
  const [plans, setPlans] = useState<CommercialPlan[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Plan Modal state (Create / Edit)
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CommercialPlan | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);

  // Delete Plan Modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<CommercialPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState(false);

  // Form Fields
  const [planName, setPlanName] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [planPriceMonthly, setPlanPriceMonthly] = useState<number | string>(0);
  const [planPriceYearly, setPlanPriceYearly] = useState<number | string>(0);
  const [planPeriod, setPlanPeriod] = useState<BillingPeriod>("monthly");
  const [planTrialDays, setPlanTrialDays] = useState<number | string>(14);
  const [planStatus, setPlanStatus] = useState<PlanStatus>("active");

  // Limits & Feature Flags
  const [maxUsers, setMaxUsers] = useState<number | string>(10);
  const [maxContacts, setMaxContacts] = useState<number | string>(5000);
  const [maxWhatsappConnections, setMaxWhatsappConnections] = useState<number | string>(1);
  const [maxFlows, setMaxFlows] = useState<number | string>(10);
  const [maxNodesPerFlow, setMaxNodesPerFlow] = useState<number | string>(50);
  const [maxKanbanFunnels, setMaxKanbanFunnels] = useState<number | string>(5);
  const [maxBoards, setMaxBoards] = useState<number | string>(5);
  const [maxBroadcasts, setMaxBroadcasts] = useState<number | string>(1000);
  const [allowAiAgent, setAllowAiAgent] = useState(true);
  const [allowCanvasAutomations, setAllowCanvasAutomations] = useState(true);
  const [allowScheduling, setAllowScheduling] = useState(true);
  const [allowReports, setAllowReports] = useState(true);
  const [allowWebhooks, setAllowWebhooks] = useState(true);

  // Account Assignment Modal State
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignStatus, setAssignStatus] = useState<SubscriptionStatus>("active");
  const [assigning, setAssigning] = useState(false);

  // Search and Filter State (Accounts Tab)
  const [accountSearchQuery, setAccountSearchQuery] = useState("");
  const [accountPlanFilter, setAccountPlanFilter] = useState("all");
  const [accountStatusFilter, setAccountStatusFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const [plansRes, accountsRes] = await Promise.all([
        fetch("/api/admin/plans"),
        fetch("/api/admin/accounts"),
      ]);

      if (!plansRes.ok || !accountsRes.ok) {
        throw new Error("Falha ao comunicar com o servidor");
      }

      const plansData = await plansRes.json();
      const accountsData = await accountsRes.json();

      setPlans(plansData.plans || []);
      setAccounts(accountsData.accounts || []);
    } catch (err) {
      console.error("[PlansManager] Failed to load admin plans data:", err);
      setHasError(true);
      toast.error("Não foi possível carregar os dados de planos comerciais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const q = accountSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (acc.name && acc.name.toLowerCase().includes(q)) ||
        (acc.id && acc.id.toLowerCase().includes(q));

      const planObj = Array.isArray(acc.plan) ? acc.plan[0] : acc.plan;
      const planId = acc.plan_id || (planObj ? planObj.id : "none");

      const matchesPlan =
        accountPlanFilter === "all" ||
        (accountPlanFilter === "none" && !acc.plan_id) ||
        planId === accountPlanFilter;

      const matchesStatus =
        accountStatusFilter === "all" || acc.subscription_status === accountStatusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [accounts, accountSearchQuery, accountPlanFilter, accountStatusFilter]);

  // High-level Metrics (State Layer)
  const stats = useMemo(() => {
    const totalPlans = plans.length;
    const activePlans = plans.filter((p) => p.status === "active").length;
    const totalAccounts = accounts.length;
    const assignedAccounts = accounts.filter((a) => Boolean(a.plan_id || a.plan)).length;
    return { totalPlans, activePlans, totalAccounts, assignedAccounts };
  }, [plans, accounts]);

  const openNewPlanModal = () => {
    setEditingPlan(null);
    setPlanName("");
    setPlanDesc("");
    setPlanPriceMonthly(0);
    setPlanPriceYearly(0);
    setPlanPeriod("monthly");
    setPlanTrialDays(14);
    setPlanStatus("active");

    setMaxUsers(10);
    setMaxContacts(5000);
    setMaxWhatsappConnections(1);
    setMaxFlows(10);
    setMaxNodesPerFlow(50);
    setMaxKanbanFunnels(5);
    setMaxBoards(5);
    setMaxBroadcasts(1000);
    setAllowAiAgent(true);
    setAllowCanvasAutomations(true);
    setAllowScheduling(true);
    setAllowReports(true);
    setAllowWebhooks(true);

    setPlanDialogOpen(true);
  };

  const openEditPlanModal = (plan: CommercialPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDesc(plan.description || "");
    setPlanPriceMonthly(plan.price_monthly ?? plan.price ?? 0);
    setPlanPriceYearly(plan.price_yearly ?? 0);
    setPlanPeriod(plan.billing_period || "monthly");
    setPlanTrialDays(plan.trial_days || 0);
    setPlanStatus(plan.status || "active");

    const f = plan.features || {};
    setMaxUsers(Number(f.max_users ?? 10));
    setMaxContacts(Number(f.max_contacts ?? 5000));
    setMaxWhatsappConnections(Number(f.max_whatsapp_connections ?? 1));
    setMaxFlows(Number(f.max_flows ?? 10));
    setMaxNodesPerFlow(Number(f.max_nodes_per_flow ?? 50));
    setMaxKanbanFunnels(Number(f.max_kanban_funnels ?? 5));
    setMaxBoards(Number(f.max_boards ?? 5));
    setMaxBroadcasts(Number(f.max_broadcasts_per_campaign ?? 1000));
    setAllowAiAgent(Boolean(f.allow_ai_agent ?? true));
    setAllowCanvasAutomations(Boolean(f.allow_canvas_automations ?? true));
    setAllowScheduling(Boolean(f.allow_scheduling ?? true));
    setAllowReports(Boolean(f.allow_reports ?? true));
    setAllowWebhooks(Boolean(f.allow_webhooks ?? true));

    setPlanDialogOpen(true);
  };

  const openDeleteModal = (plan: CommercialPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      toast.error("O nome comercial do plano é obrigatório");
      return;
    }

    const priceMonthly = Number(planPriceMonthly);
    const priceYearly = Number(planPriceYearly);
    const trialDays = Number(planTrialDays);

    if (isNaN(priceMonthly) || priceMonthly < 0) {
      toast.error("O preço mensal deve ser um valor numérico válido e maior ou igual a zero");
      return;
    }

    if (isNaN(priceYearly) || priceYearly < 0) {
      toast.error("O preço anual deve ser um valor numérico válido e maior ou igual a zero");
      return;
    }

    if (isNaN(trialDays) || trialDays < 0) {
      toast.error("Os dias de período de teste devem ser maior ou igual a zero");
      return;
    }

    setSavingPlan(true);
    try {
      const payload = {
        name: planName.trim(),
        description: planDesc.trim() || null,
        price_monthly: priceMonthly,
        price_yearly: priceYearly,
        price: priceMonthly,
        billing_period: planPeriod,
        trial_days: trialDays,
        status: planStatus,
        features: {
          max_users: Number(maxUsers) || 1,
          max_contacts: Number(maxContacts) || 100,
          max_whatsapp_connections: Math.max(1, Number(maxWhatsappConnections) || 1),
          max_flows: Number(maxFlows) || 1,
          max_nodes_per_flow: Number(maxNodesPerFlow) || 5,
          max_kanban_funnels: Number(maxKanbanFunnels) || 1,
          max_boards: Number(maxBoards) || 1,
          max_broadcasts_per_campaign: Number(maxBroadcasts) || 10,
          allow_ai_agent: allowAiAgent,
          allow_canvas_automations: allowCanvasAutomations,
          allow_scheduling: allowScheduling,
          allow_reports: allowReports,
          allow_webhooks: allowWebhooks,
        },
      };

      const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : "/api/admin/plans";
      const method = editingPlan ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao salvar plano comercial");
      }

      toast.success(editingPlan ? "Plano comercial atualizado com sucesso" : "Novo plano comercial criado com sucesso");
      setPlanDialogOpen(false);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar plano comercial");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    setDeletingPlan(true);
    try {
      const res = await fetch(`/api/admin/plans/${planToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao remover ou inativar plano comercial");
      }

      if (data.message) {
        toast.info("O plano foi inativado pois possui empresas associadas");
      } else {
        toast.success("Plano comercial removido com sucesso");
      }

      setDeleteDialogOpen(false);
      setPlanToDelete(null);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao processar exclusão do plano");
    } finally {
      setDeletingPlan(false);
    }
  };

  const openAssignModal = (account: Account) => {
    setSelectedAccount(account);
    const planObj = Array.isArray(account.plan) ? account.plan[0] : account.plan;
    setAssignPlanId(account.plan_id || planObj?.id || (plans[0]?.id ?? ""));
    setAssignStatus(account.subscription_status || "active");
    setAccountDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedAccount) return;

    setAssigning(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: selectedAccount.id,
          plan_id: assignPlanId,
          subscription_status: assignStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao atribuir plano à empresa");
      }

      toast.success("Plano da empresa atualizado com sucesso");
      setAccountDialogOpen(false);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao atribuir plano");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Camada 1: Identidade & Ação Primária */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Planos Comerciais
            </h1>
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">
              Administração
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie planos comerciais, limites operacionais e atribuição de acesso às empresas clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-1.5"
            aria-label="Atualizar dados de planos e empresas"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button onClick={openNewPlanModal} size="sm" className="gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Camada 2: Estado (Métricas de Alto Nível) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Planos Cadastrados</p>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{stats.totalPlans}</span>
            )}
            <span className="text-xs text-muted-foreground">cadastrados</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Planos Ativos</p>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <span className="text-2xl font-bold tracking-tight text-primary tabular-nums">{stats.activePlans}</span>
            )}
            <span className="text-xs text-muted-foreground">disponíveis</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Empresas Cadastradas</p>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{stats.totalAccounts}</span>
            )}
            <span className="text-xs text-muted-foreground">empresas</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Planos Atribuídos</p>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{stats.assignedAccounts}</span>
            )}
            <span className="text-xs text-muted-foreground">com plano ativo</span>
          </div>
        </Card>
      </div>

      {/* Estado de Erro */}
      {hasError && !loading && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 text-sm text-destructive">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Ocorreu um erro ao carregar os dados. Verifique a sua conexão com a plataforma.</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} className="shrink-0 border-destructive/30">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Camada 3: Conteúdo (Abas com Navegação) */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="bg-muted p-1 border border-border w-full sm:w-auto">
          <TabsTrigger value="plans" className="gap-2 flex-1 sm:flex-initial">
            <Layers className="h-4 w-4" />
            <span>Planos Comerciais ({plans.length})</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2 flex-1 sm:flex-initial">
            <Building2 className="h-4 w-4" />
            <span>Atribuição a Empresas ({accounts.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* ABA 1: Planos Comerciais                                      */}
        {/* ============================================================ */}
        <TabsContent value="plans" className="space-y-4 outline-none">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-8 w-28" />
                  <div className="space-y-2 pt-4 border-t border-border">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-9 w-full mt-4" />
                </Card>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="rounded-full bg-muted p-3">
                  <Layers className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Nenhum plano cadastrado</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Crie o primeiro plano comercial para definir limites de franquia, recursos e preços da plataforma.
                  </p>
                </div>
                <Button onClick={openNewPlanModal} size="sm" className="mt-2 gap-1.5">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Plano
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const f = plan.features || {};
                const monthlyPrice = Number(plan.price_monthly ?? plan.price ?? 0);
                const yearlyPrice = Number(plan.price_yearly ?? 0);
                const isActive = plan.status === "active";

                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col justify-between overflow-hidden border-border bg-card transition-all ${
                      !isActive ? "opacity-75 bg-muted/20" : ""
                    }`}
                  >
                    <div>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg font-bold text-foreground">{plan.name}</CardTitle>
                            {plan.description && (
                              <CardDescription className="mt-1 text-xs line-clamp-2">
                                {plan.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant={isActive ? "default" : "secondary"} className="shrink-0 text-xs">
                            {isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>

                        {/* Bloco de Preços */}
                        <div className="pt-3 flex flex-col gap-0.5">
                          <div className="flex items-baseline gap-1 text-2xl font-bold tracking-tight text-foreground">
                            <span className="text-sm font-semibold text-muted-foreground">R$</span>
                            <span className="tabular-nums">
                              {monthlyPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">/ mês</span>
                          </div>

                          {yearlyPrice > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              ou R$ {yearlyPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por ano
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Cobrança {formatBillingPeriod(plan.billing_period).toLowerCase()}
                            </p>
                          )}

                          {plan.trial_days > 0 && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                              <Clock className="h-3 w-3" />
                              <span>{plan.trial_days} dias de teste gratuito</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-0">
                        <div className="border-t border-border" />

                        {/* Limites de Capacidade */}
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Franquias & Limites
                          </p>
                          <ul className="space-y-1.5 text-xs">
                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <PhoneCall className="h-3.5 w-3.5 text-muted-foreground" />
                                Números WhatsApp
                              </span>
                              <span className="font-medium text-foreground tabular-nums">
                                {f.max_whatsapp_connections ?? 1} conexão(ões)
                              </span>
                            </li>

                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                Usuários
                              </span>
                              <span className="font-medium text-foreground tabular-nums">
                                {f.max_users ?? "Ilimitado"}
                              </span>
                            </li>

                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                Contatos CRM
                              </span>
                              <span className="font-medium text-foreground tabular-nums">
                                {typeof f.max_contacts === "number"
                                  ? f.max_contacts.toLocaleString("pt-BR")
                                  : "Ilimitado"}
                              </span>
                            </li>

                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                                Fluxos de Automação
                              </span>
                              <span className="font-medium text-foreground tabular-nums">
                                {f.max_flows ?? "Ilimitado"}
                              </span>
                            </li>

                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                                Passos por Fluxo
                              </span>
                              <span className="font-medium text-foreground tabular-nums">
                                {f.max_nodes_per_flow ?? "Ilimitado"}
                              </span>
                            </li>

                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                Disparos por Campanha
                              </span>
                              <span className="font-medium text-foreground tabular-nums">
                                {typeof f.max_broadcasts_per_campaign === "number"
                                  ? f.max_broadcasts_per_campaign.toLocaleString("pt-BR")
                                  : "Ilimitado"}
                              </span>
                            </li>
                          </ul>
                        </div>

                        {/* Recursos Avançados */}
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Recursos Liberados
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {f.allow_ai_agent !== false && (
                              <Badge variant="outline" className="text-[11px] gap-1 py-0.5 border-primary/30 bg-primary/5 text-primary">
                                <Bot className="h-3 w-3" />
                                IA
                              </Badge>
                            )}
                            {f.allow_canvas_automations !== false && (
                              <Badge variant="outline" className="text-[11px] gap-1 py-0.5 border-border">
                                <Zap className="h-3 w-3 text-muted-foreground" />
                                Canvas Flow
                              </Badge>
                            )}
                            {f.allow_scheduling && (
                              <Badge variant="outline" className="text-[11px] gap-1 py-0.5 border-border">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                Agendamento
                              </Badge>
                            )}
                            {f.allow_reports && (
                              <Badge variant="outline" className="text-[11px] gap-1 py-0.5 border-border">
                                <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                Relatórios
                              </Badge>
                            )}
                            {f.allow_webhooks && (
                              <Badge variant="outline" className="text-[11px] gap-1 py-0.5 border-border">
                                <Webhook className="h-3 w-3 text-muted-foreground" />
                                Webhooks
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Rodapé de Ações */}
                    <div className="p-4 pt-0 border-t border-border/50 mt-4 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditPlanModal(plan)}
                        className="flex-1 gap-1.5 text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar Plano
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteModal(plan)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Remover ou inativar plano"
                        aria-label={`Remover plano ${plan.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* ABA 2: Atribuição a Empresas                                  */}
        {/* ============================================================ */}
        <TabsContent value="accounts" className="space-y-4 outline-none">
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Empresas Cadastradas</CardTitle>
                  <CardDescription className="text-xs">
                    Consulte e atribua planos comerciais ou altere o status de assinatura das empresas clientes.
                  </CardDescription>
                </div>

                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou ID..."
                      value={accountSearchQuery}
                      onChange={(e) => setAccountSearchQuery(e.target.value)}
                      className="pl-8 text-xs h-9 w-full sm:w-[220px]"
                    />
                  </div>

                  <Select value={accountPlanFilter} onValueChange={(val) => { if (val) setAccountPlanFilter(val); }}>
                    <SelectTrigger className="text-xs h-9 w-full sm:w-[150px]">
                      <SelectValue placeholder="Todos os planos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os planos</SelectItem>
                      <SelectItem value="none">Sem plano</SelectItem>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={accountStatusFilter} onValueChange={(val) => { if (val) setAccountStatusFilter(val); }}>
                    <SelectTrigger className="text-xs h-9 w-full sm:w-[140px]">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="trialing">Em teste</SelectItem>
                      <SelectItem value="past_due">Inadimplente</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
                  <Building2 className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="font-medium text-foreground">Nenhuma empresa encontrada</p>
                  <p className="text-xs text-muted-foreground">
                    {accountSearchQuery || accountPlanFilter !== "all" || accountStatusFilter !== "all"
                      ? "Tente ajustar os filtros de busca para encontrar a empresa."
                      : "Ainda não existem empresas registradas na plataforma."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Visão Tabela (Desktop) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Empresa</th>
                          <th className="px-4 py-3">ID da Conta</th>
                          <th className="px-4 py-3">Plano Atribuído</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredAccounts.map((acc) => {
                          const plan = Array.isArray(acc.plan) ? acc.plan[0] : acc.plan;
                          const statusInfo = formatSubscriptionStatus(acc.subscription_status);

                          return (
                            <tr key={acc.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-foreground">{acc.name}</td>
                              <td className="px-4 py-3 text-xs font-mono text-muted-foreground select-all">
                                {acc.id}
                              </td>
                              <td className="px-4 py-3">
                                {plan ? (
                                  <Badge variant="outline" className="font-semibold text-xs">
                                    {plan.name}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Sem plano</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={statusInfo.variant} className="text-xs">
                                  {statusInfo.label}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAssignModal(acc)}
                                  className="h-8 text-xs font-medium"
                                >
                                  Alterar Plano
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Visão Cards (Mobile) */}
                  <div className="md:hidden space-y-3">
                    {filteredAccounts.map((acc) => {
                      const plan = Array.isArray(acc.plan) ? acc.plan[0] : acc.plan;
                      const statusInfo = formatSubscriptionStatus(acc.subscription_status);

                      return (
                        <div
                          key={acc.id}
                          className="p-3 border border-border rounded-lg bg-card space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm text-foreground">{acc.name}</p>
                              <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px]">
                                {acc.id}
                              </p>
                            </div>
                            <Badge variant={statusInfo.variant} className="text-[11px]">
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">
                              {plan ? plan.name : "Sem plano"}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAssignModal(acc)}
                              className="h-8 text-xs"
                            >
                              Alterar Plano
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================================ */}
      {/* MODAL: Criar / Editar Plano Comercial                        */}
      {/* ============================================================ */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-4xl w-full max-h-[88vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingPlan ? "Editar Plano Comercial" : "Novo Plano Comercial"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure os valores de contratação nas duas modalidades (Mensal e Anual) e especifique as franquias de uso.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-3">
            {/* Bloco 1: Dados Gerais */}
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Identificação do Plano
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="planName" className="text-xs font-semibold">
                    Nome Comercial *
                  </Label>
                  <Input
                    id="planName"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Ex: Start, Pro, Scale, Enterprise"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="planStatus" className="text-xs font-semibold">
                    Status do Plano
                  </Label>
                  <Select
                    value={planStatus}
                    onValueChange={(val) => {
                      if (val) setPlanStatus(val as PlanStatus);
                    }}
                  >
                    <SelectTrigger id="planStatus" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo (Disponível para contratação)</SelectItem>
                      <SelectItem value="inactive">Inativo (Oculto no checkout)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="planDesc" className="text-xs font-semibold">
                  Descrição Comercial
                </Label>
                <Textarea
                  id="planDesc"
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  placeholder="Resumo dos benefícios e público-alvo deste plano..."
                  className="resize-none text-xs"
                  rows={2}
                />
              </div>
            </div>

            {/* Bloco 2: Precificação Dual */}
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Precificação Dual & Recorrência
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  O cliente escolhe entre cobrança Mensal ou Anual
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="planPriceMonthly" className="text-xs font-semibold">
                    Preço Mensal (R$) *
                  </Label>
                  <Input
                    id="planPriceMonthly"
                    type="number"
                    min={0}
                    step="0.01"
                    value={planPriceMonthly}
                    onChange={(e) => setPlanPriceMonthly(e.target.value)}
                    placeholder="49.00"
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Valor cobrado a cada mês.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="planPriceYearly" className="text-xs font-semibold">
                    Preço Anual (R$ Total)
                  </Label>
                  <Input
                    id="planPriceYearly"
                    type="number"
                    min={0}
                    step="0.01"
                    value={planPriceYearly}
                    onChange={(e) => setPlanPriceYearly(e.target.value)}
                    placeholder="470.00"
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Valor cobrado anualmente com desconto.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="planTrialDays" className="text-xs font-semibold">
                    Dias de Teste (Trial)
                  </Label>
                  <Input
                    id="planTrialDays"
                    type="number"
                    min={0}
                    value={planTrialDays}
                    onChange={(e) => setPlanTrialDays(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Acesso gratuito antes da cobrança.</p>
                </div>
              </div>
            </div>

            {/* Bloco 3: Franquias e Limites de Volume */}
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Franquias e Limites Operacionais
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Defina a quantidade permitida para cada recurso. Para volume ilimitado, informe um valor elevado (ex: 999999).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="maxWhatsappConnections" className="text-xs font-semibold text-foreground">
                    Conexões WhatsApp *
                  </Label>
                  <Input
                    id="maxWhatsappConnections"
                    type="number"
                    min={1}
                    value={maxWhatsappConnections}
                    onChange={(e) => setMaxWhatsappConnections(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Números conectados.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxUsers" className="text-xs font-semibold">
                    Máx. Usuários
                  </Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    min={1}
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Atendentes/membros.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxContacts" className="text-xs font-semibold">
                    Máx. Contatos CRM
                  </Label>
                  <Input
                    id="maxContacts"
                    type="number"
                    min={100}
                    value={maxContacts}
                    onChange={(e) => setMaxContacts(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Contatos na base.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxFlows" className="text-xs font-semibold">
                    Máx. Fluxos
                  </Label>
                  <Input
                    id="maxFlows"
                    type="number"
                    min={1}
                    value={maxFlows}
                    onChange={(e) => setMaxFlows(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Automações criadas.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxNodesPerFlow" className="text-xs font-semibold">
                    Passos por Fluxo
                  </Label>
                  <Input
                    id="maxNodesPerFlow"
                    type="number"
                    min={5}
                    value={maxNodesPerFlow}
                    onChange={(e) => setMaxNodesPerFlow(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Nós por automação.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxKanban" className="text-xs font-semibold">
                    Funis Kanban
                  </Label>
                  <Input
                    id="maxKanban"
                    type="number"
                    min={1}
                    value={maxKanbanFunnels}
                    onChange={(e) => setMaxKanbanFunnels(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Pipelines de vendas.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxBoards" className="text-xs font-semibold">
                    Boards de Equipe
                  </Label>
                  <Input
                    id="maxBoards"
                    type="number"
                    min={1}
                    value={maxBoards}
                    onChange={(e) => setMaxBoards(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Quadros de setores.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxBroadcasts" className="text-xs font-semibold">
                    Envios por Campanha
                  </Label>
                  <Input
                    id="maxBroadcasts"
                    type="number"
                    min={10}
                    value={maxBroadcasts}
                    onChange={(e) => setMaxBroadcasts(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">Destinatários por envio.</p>
                </div>
              </div>
            </div>

            {/* Bloco 4: Recursos & Permissões */}
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Recursos Avançados e Permissões
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Marque para liberar ou desmarque para bloquear a funcionalidade nas contas deste plano.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded-md border border-border p-3 bg-card space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowAiAgent"
                      checked={allowAiAgent}
                      onCheckedChange={(c) => setAllowAiAgent(Boolean(c))}
                    />
                    <Label htmlFor="allowAiAgent" className="text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                      Atendimento por Inteligência Artificial
                    </Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-6">
                    Libera o assistente inteligente para respostas automáticas no WhatsApp com base de conhecimento.
                  </p>
                </div>

                <div className="rounded-md border border-border p-3 bg-card space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowCanvasAutomations"
                      checked={allowCanvasAutomations}
                      onCheckedChange={(c) => setAllowCanvasAutomations(Boolean(c))}
                    />
                    <Label htmlFor="allowCanvasAutomations" className="text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      Flow Builder Visual (Canvas)
                    </Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-6">
                    Libera a criação e edição gráfica de fluxos de automação na tela de desenho.
                  </p>
                </div>

                <div className="rounded-md border border-border p-3 bg-card space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowScheduling"
                      checked={allowScheduling}
                      onCheckedChange={(c) => setAllowScheduling(Boolean(c))}
                    />
                    <Label htmlFor="allowScheduling" className="text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Agendamento de Disparos
                    </Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-6">
                    Permite programar campanhas de transmissão e mensagens para datas e horários futuros.
                  </p>
                </div>

                <div className="rounded-md border border-border p-3 bg-card space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowReports"
                      checked={allowReports}
                      onCheckedChange={(c) => setAllowReports(Boolean(c))}
                    />
                    <Label htmlFor="allowReports" className="text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      Relatórios e Métricas
                    </Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-6">
                    Permite o acesso a painéis analíticos de tempo de resposta, volume de atendimentos e desempenho.
                  </p>
                </div>

                <div className="rounded-md border border-border p-3 bg-card space-y-1 sm:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowWebhooks"
                      checked={allowWebhooks}
                      onCheckedChange={(c) => setAllowWebhooks(Boolean(c))}
                    />
                    <Label htmlFor="allowWebhooks" className="text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                      <Webhook className="h-3.5 w-3.5 text-primary" />
                      Webhooks e Integrações HTTP
                    </Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-6">
                    Libera a execução de nós de requisição externa em fluxos para integrações com sistemas legados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setPlanDialogOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSavePlan} disabled={savingPlan}>
              {savingPlan ? "Salvando..." : editingPlan ? "Salvar Alterações" : "Criar Plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* MODAL: Exclusão / Inativação de Plano                        */}
      {/* ============================================================ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Remover Plano Comercial</DialogTitle>
            <DialogDescription className="text-xs">
              Você tem certeza de que deseja remover o plano <strong>{planToDelete?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs text-muted-foreground space-y-2">
            <p>
              Caso existam empresas atualmente vinculadas a este plano, o sistema irá <strong>inativar o plano</strong> automaticamente, preservando o acesso das contas existentes sem impactar novos cadastros.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeletePlan}
              disabled={deletingPlan}
            >
              {deletingPlan ? "Processando..." : "Confirmar Remoção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* MODAL: Atribuir Plano à Empresa                              */}
      {/* ============================================================ */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Atribuir Plano à Empresa</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedAccount ? `Empresa selecionada: ${selectedAccount.name}` : "Selecione o plano desejado."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="assignPlan" className="text-xs font-semibold">
                Plano Comercial
              </Label>
              <Select value={assignPlanId} onValueChange={(val) => { if (val) setAssignPlanId(val); }}>
                <SelectTrigger id="assignPlan" className="text-xs">
                  <SelectValue placeholder="Selecione o plano comercial" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => {
                    const price = Number(p.price_monthly ?? p.price ?? 0);
                    return (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — R$ {price.toFixed(2)} / mês ({p.status === "active" ? "Ativo" : "Inativo"})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assignStatus" className="text-xs font-semibold">
                Status da Assinatura
              </Label>
              <Select value={assignStatus} onValueChange={(val) => { if (val) setAssignStatus(val as SubscriptionStatus); }}>
                <SelectTrigger id="assignStatus" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="trialing">Em período de teste (Trial)</SelectItem>
                  <SelectItem value="past_due">Inadimplente (Pendente)</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="read_only">Somente leitura</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setAccountDialogOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveAssignment} disabled={assigning}>
              {assigning ? "Salvando..." : "Confirmar Atribuição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
