"use client";

import { useEffect, useState } from "react";
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
import { Plus, Edit, Shield, Check, X, Building2, Layers, Users, Zap, Radio, Calendar } from "lucide-react";
import { toast } from "sonner";

const formatBillingPeriod = (period?: BillingPeriod) => {
  switch (period) {
    case "monthly":
      return "Mensal";
    case "yearly":
      return "Anual";
    case "one_time":
      return "Único";
    case "none":
      return "Grátis";
    default:
      return period || "";
  }
};

const formatSubscriptionStatus = (status?: SubscriptionStatus) => {
  switch (status) {
    case "active":
      return "Ativo";
    case "trialing":
      return "Em Trial";
    case "past_due":
      return "Pendente / Inadimplente";
    case "canceled":
      return "Cancelado";
    default:
      return status || "Ativo";
  }
};

export function PlansManager() {
  const [plans, setPlans] = useState<CommercialPlan[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan Modal state
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CommercialPlan | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);

  // Form Fields
  const [planName, setPlanName] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [planPriceMonthly, setPlanPriceMonthly] = useState(0);
  const [planPriceYearly, setPlanPriceYearly] = useState(0);
  const [planPeriod, setPlanPeriod] = useState<BillingPeriod>("monthly");
  const [planTrialDays, setPlanTrialDays] = useState(14);
  const [planStatus, setPlanStatus] = useState<PlanStatus>("active");

  // Limits & Feature Flags
  const [maxUsers, setMaxUsers] = useState(10);
  const [maxContacts, setMaxContacts] = useState(5000);
  const [maxWhatsappConnections, setMaxWhatsappConnections] = useState(1);
  const [maxFlows, setMaxFlows] = useState(10);
  const [maxNodesPerFlow, setMaxNodesPerFlow] = useState(50);
  const [maxKanbanFunnels, setMaxKanbanFunnels] = useState(5);
  const [maxBoards, setMaxBoards] = useState(5);
  const [maxBroadcasts, setMaxBroadcasts] = useState(1000);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, accountsRes] = await Promise.all([
        fetch("/api/admin/plans"),
        fetch("/api/admin/accounts"),
      ]);

      const plansData = await plansRes.json();
      const accountsData = await accountsRes.json();

      if (plansRes.ok) setPlans(plansData.plans || []);
      if (accountsRes.ok) setAccounts(accountsData.accounts || []);
    } catch (err) {
      console.error("Failed to load admin plans data:", err);
      toast.error("Erro ao carregar dados dos planos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      toast.error("O nome do plano é obrigatório.");
      return;
    }

    setSavingPlan(true);
    try {
      const payload = {
        name: planName.trim(),
        description: planDesc.trim(),
        price_monthly: Number(planPriceMonthly),
        price_yearly: Number(planPriceYearly),
        price: Number(planPriceMonthly),
        billing_period: planPeriod,
        trial_days: Number(planTrialDays),
        status: planStatus,
        features: {
          max_users: Number(maxUsers),
          max_contacts: Number(maxContacts),
          max_whatsapp_connections: Number(maxWhatsappConnections),
          max_flows: Number(maxFlows),
          max_nodes_per_flow: Number(maxNodesPerFlow),
          max_kanban_funnels: Number(maxKanbanFunnels),
          max_boards: Number(maxBoards),
          max_broadcasts_per_campaign: Number(maxBroadcasts),
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
        throw new Error(data.error || "Falha ao salvar plano");
      }

      toast.success(editingPlan ? "Plano atualizado com sucesso!" : "Novo plano criado com sucesso!");
      setPlanDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar plano");
    } finally {
      setSavingPlan(false);
    }
  };

  const openAssignModal = (account: Account) => {
    setSelectedAccount(account);
    setAssignPlanId(account.plan_id || (plans[0]?.id ?? ""));
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
        throw new Error(data.error || "Falha ao atribuir plano");
      }

      toast.success("Plano da empresa atualizado com sucesso!");
      setAccountDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao atribuir plano");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Módulo Administrativo · Planos Comerciais
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie planos comerciais, limites dinâmicos e atribuição às empresas clientes sem alterar o código.
          </p>
        </div>
        <Button onClick={openNewPlanModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Plano Comercial
        </Button>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="bg-muted p-1 border border-border">
          <TabsTrigger value="plans" className="gap-2">
            <Layers className="h-4 w-4" />
            Planos Cadastrados ({plans.length})
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Building2 className="h-4 w-4" />
            Atribuição a Empresas ({accounts.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Commercial Plans */}
        <TabsContent value="plans" className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Carregando planos...</div>
          ) : plans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum plano cadastrado. Clique no botão acima para criar o primeiro plano comercial.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const f = plan.features || {};
                return (
                  <Card key={plan.id} className="relative flex flex-col justify-between overflow-hidden border-border bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-foreground">{plan.name}</CardTitle>
                        <Badge variant={plan.status === "active" ? "default" : "secondary"}>
                          {plan.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {plan.description && (
                        <CardDescription className="text-xs">{plan.description}</CardDescription>
                      )}
                      <div className="pt-2 flex flex-col gap-1">
                        <div className="text-xl font-extrabold text-primary flex items-baseline gap-1">
                          R$ {Number(plan.price_monthly ?? plan.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          <span className="text-xs font-normal text-muted-foreground"> / mês</span>
                        </div>
                        {Number(plan.price_yearly) > 0 && (
                          <div className="text-xs font-medium text-muted-foreground">
                            R$ {Number(plan.price_yearly).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / ano
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="my-2 border-t border-border" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recursos & Limites</p>
                      <ul className="space-y-1.5 text-xs text-foreground">
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Conexões WhatsApp:</span>
                          <span className="font-semibold text-primary">{f.max_whatsapp_connections ?? 1} número(s)</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Usuários (Membros):</span>
                          <span className="font-medium">{f.max_users ?? "Ilimitado"}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Contatos CRM:</span>
                          <span className="font-medium">{f.max_contacts ?? "Ilimitado"}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Fluxos de Automação:</span>
                          <span className="font-medium">{f.max_flows ?? "Ilimitado"}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Passos por Fluxo:</span>
                          <span className="font-medium">{f.max_nodes_per_flow ?? "Ilimitado"}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Funis Kanban:</span>
                          <span className="font-medium">{f.max_kanban_funnels ?? "Ilimitado"}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Boards de Equipe:</span>
                          <span className="font-medium">{f.max_boards ?? "Ilimitado"}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-muted-foreground">Disparos por Campanha:</span>
                          <span className="font-medium">{f.max_broadcasts_per_campaign ?? "Ilimitado"}</span>
                        </li>
                      </ul>
                      <div className="pt-2 flex flex-wrap gap-1">
                        {f.allow_ai_agent !== false ? (
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 font-semibold">🤖 Atendimento IA</Badge>
                        ) : null}
                        {f.allow_canvas_automations !== false ? (
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">⚡ Canvas Flow</Badge>
                        ) : null}
                        {f.allow_scheduling ? (
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">📅 Agendamento</Badge>
                        ) : null}
                        {f.allow_reports ? (
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">📊 Relatórios</Badge>
                        ) : null}
                        {f.allow_webhooks ? (
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">🔗 Webhooks</Badge>
                        ) : null}
                      </div>

                      <div className="pt-4">
                        <Button variant="outline" size="sm" onClick={() => openEditPlanModal(plan)} className="w-full gap-2">
                          <Edit className="h-3.5 w-3.5" />
                          Editar Plano
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Account Assignments */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Cadastradas</CardTitle>
              <CardDescription>
                Selecione uma empresa para alterar a referência do plano ativo a qualquer momento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Carregando empresas...</div>
              ) : accounts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Nenhuma empresa encontrada.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Empresa</th>
                        <th className="px-4 py-3">ID da Conta</th>
                        <th className="px-4 py-3">Plano Atribuído</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {accounts.map((acc) => {
                        const plan = Array.isArray(acc.plan) ? acc.plan[0] : acc.plan;
                        return (
                          <tr key={acc.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{acc.name}</td>
                            <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{acc.id}</td>
                            <td className="px-4 py-3">
                              {plan ? (
                                <Badge variant="outline" className="font-semibold">
                                  {plan.name}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sem plano</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={acc.subscription_status === "active" ? "default" : "secondary"}>
                                {formatSubscriptionStatus(acc.subscription_status)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="sm" onClick={() => openAssignModal(acc)}>
                                Alterar Plano
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Create/Edit Commercial Plan */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar Plano Comercial" : "Novo Plano Comercial"}</DialogTitle>
            <DialogDescription>
              Configure o valor comercial nas duas modalidades (Mensal e Anual) e especifique os recursos liberados.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Bloco 1: Dados Gerais */}
            <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>📌</span> Informações do Plano
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Nome Comercial *</Label>
                  <Input id="planName" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Ex: Flow Start, Flow Pro, Flow Scale" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planStatus">Status do Plano</Label>
                  <Select value={planStatus} onValueChange={(val) => { if (val) setPlanStatus(val as PlanStatus); }}>
                    <SelectTrigger id="planStatus">
                      <SelectValue>
                        {planStatus === "active" ? "Ativo (Disponível para contratação)" : "Inativo (Oculto no checkout)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo (Disponível para contratação)</SelectItem>
                      <SelectItem value="inactive">Inativo (Oculto no checkout)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="planDesc">Descrição Comercial</Label>
                <Textarea id="planDesc" value={planDesc} onChange={(e) => setPlanDesc(e.target.value)} placeholder="Resumo dos benefícios visível no card de contratação do cliente" className="resize-none" />
              </div>
            </div>

            {/* Bloco 2: Precificação Dual */}
            <div className="space-y-4 rounded-lg border border-primary/20 p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <span>💳</span> Precificação Dual & Recorrência
                </h3>
                <span className="text-[11px] text-muted-foreground">O cliente poderá escolher assinar Mensal ou Anual</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planPriceMonthly">Preço Mensal (R$) *</Label>
                  <Input id="planPriceMonthly" type="number" min={0} step="0.01" value={planPriceMonthly} onChange={(e) => setPlanPriceMonthly(Number(e.target.value))} placeholder="49.00" />
                  <p className="text-[11px] text-muted-foreground">Valor cobrado mensalmente (Recorrência Mensal no Asaas).</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planPriceYearly">Preço Anual (R$ Total)</Label>
                  <Input id="planPriceYearly" type="number" min={0} step="0.01" value={planPriceYearly} onChange={(e) => setPlanPriceYearly(Number(e.target.value))} placeholder="470.00" />
                  <p className="text-[11px] text-muted-foreground">Valor total cobrado por ano (Recorrência Anual no Asaas com desconto).</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planTrialDays">Período de Teste (Dias de Trial)</Label>
                  <Input id="planTrialDays" type="number" min={0} value={planTrialDays} onChange={(e) => setPlanTrialDays(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground">Dias de acesso completo grátis antes da primeira cobrança.</p>
                </div>
              </div>
            </div>

            {/* Bloco 3: Limites de Capacidade & Volume */}
            <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>🔢</span> Limites de Capacidade & Volume da Conta
              </h3>
              <p className="text-xs text-muted-foreground">
                Informe a quantidade permitida. Valores numéricos limitam a criação; coloque um valor alto (ex: 999999) para representar acesso ilimitado.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="maxWhatsappConnections" className="font-semibold text-foreground">Conexões WhatsApp API Oficial *</Label>
                  <Input id="maxWhatsappConnections" type="number" min={1} value={maxWhatsappConnections} onChange={(e) => setMaxWhatsappConnections(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground">Números WhatsApp WABA que a conta pode conectar simultaneamente.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxUsers">Máx. Usuários (Membros)</Label>
                  <Input id="maxUsers" type="number" min={1} value={maxUsers} onChange={(e) => setMaxUsers(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground">Total de atendentes/membros cadastrados na empresa.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxContacts">Máx. Contatos no CRM</Label>
                  <Input id="maxContacts" type="number" min={100} value={maxContacts} onChange={(e) => setMaxContacts(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground">Limite total de contatos que a empresa pode armazenar.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxFlows">Máx. Fluxos de Automação</Label>
                  <Input id="maxFlows" type="number" min={1} value={maxFlows} onChange={(e) => setMaxFlows(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground">Quantidade de chatbots/automações criados no Flow Builder.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxNodesPerFlow">Passos por Fluxo (Nós)</Label>
                  <Input id="maxNodesPerFlow" type="number" min={5} value={maxNodesPerFlow} onChange={(e) => setMaxNodesPerFlow(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground">Complexidade de cada fluxo (número de mensagens/ações em 1 fluxo).</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxKanban">Máx. Funis Kanban</Label>
                  <Input id="maxKanban" type="number" min={1} value={maxKanbanFunnels} onChange={(e) => setMaxKanbanFunnels(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground">Pipelines de vendas/oportunidades no CRM.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxBoards">Máx. Boards de Equipe</Label>
                  <Input id="maxBoards" type="number" min={1} value={maxBoards} onChange={(e) => setMaxBoards(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground">Quadros de organização de atendimentos por setor.</p>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="maxBroadcasts">Máx. Envios por Campanha de Transmissão</Label>
                  <Input id="maxBroadcasts" type="number" min={10} value={maxBroadcasts} onChange={(e) => setMaxBroadcasts(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground">Limite de destinatários atingidos em 1 único disparo em massa.</p>
                </div>
              </div>
            </div>

            {/* Bloco 4: Permissões de Recursos com Detalhamento de Impacto */}
            <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>⚙️</span> Permissões de Recursos & Impacto no Sistema
              </h3>
              <p className="text-xs text-muted-foreground">
                Marque para liberar ou desmarque para bloquear o recurso. A desativação oculta ou impede a execução da funcionalidade para contas neste plano.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* IA Agent */}
                <div className="rounded-md border border-border p-3 bg-card space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allowAiAgent" checked={allowAiAgent} onCheckedChange={(c) => setAllowAiAgent(Boolean(c))} />
                    <Label htmlFor="allowAiAgent" className="text-sm font-semibold cursor-pointer flex items-center gap-1.5">
                      🤖 Atendimento por IA (Smart AI Service)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    <strong className="text-foreground">Impacto:</strong> Permite configurar e ativar o Chatbot com Inteligência Artificial para responder clientes automaticamente no WhatsApp via Base de Conhecimento.
                  </p>
                </div>

                {/* Canvas Automations */}
                <div className="rounded-md border border-border p-3 bg-card space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allowCanvasAutomations" checked={allowCanvasAutomations} onCheckedChange={(c) => setAllowCanvasAutomations(Boolean(c))} />
                    <Label htmlFor="allowCanvasAutomations" className="text-sm font-semibold cursor-pointer flex items-center gap-1.5">
                      ⚡ Automações com Canvas (Flow Builder Viso-Gráfico)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    <strong className="text-foreground">Impacto:</strong> Libera a criação e edição de fluxos visuais em tela de desenho no menu Automações.
                  </p>
                </div>

                {/* Scheduling */}
                <div className="rounded-md border border-border p-3 bg-card space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allowScheduling" checked={allowScheduling} onCheckedChange={(c) => setAllowScheduling(Boolean(c))} />
                    <Label htmlFor="allowScheduling" className="text-sm font-semibold cursor-pointer flex items-center gap-1.5">
                      📅 Agendamento de Disparos e Transmissões
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    <strong className="text-foreground">Impacto:</strong> Permite agendar campanhas de transmissão e disparos de mensagens para datas e horas futuras.
                  </p>
                </div>

                {/* Reports */}
                <div className="rounded-md border border-border p-3 bg-card space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allowReports" checked={allowReports} onCheckedChange={(c) => setAllowReports(Boolean(c))} />
                    <Label htmlFor="allowReports" className="text-sm font-semibold cursor-pointer flex items-center gap-1.5">
                      📊 Relatórios Executivos & Métricas de Atendimento
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    <strong className="text-foreground">Impacto:</strong> Libera o acesso às telas analíticas de tempo de resposta, volume de chat e métricas de desempenho.
                  </p>
                </div>

                {/* Webhooks */}
                <div className="rounded-md border border-border p-3 bg-card space-y-2 col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allowWebhooks" checked={allowWebhooks} onCheckedChange={(c) => setAllowWebhooks(Boolean(c))} />
                    <Label htmlFor="allowWebhooks" className="text-sm font-semibold cursor-pointer flex items-center gap-1.5">
                      🔗 Webhooks & Integrações de API Externa
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    <strong className="text-foreground">Impacto:</strong> Permite adicionar nós de requisição HTTP/Webhook nos fluxos de automação para integrar com sistemas externos como n8n, Make e Webhooks customizados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePlan} disabled={savingPlan}>
              {savingPlan ? "Salvando..." : "Salvar Plano Comercial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Account Plan Assignment */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Plano à Empresa</DialogTitle>
            <DialogDescription>
              {selectedAccount ? `Empresa: ${selectedAccount.name}` : "Selecione o plano desejado."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignPlan">Selecione o Plano Comercial</Label>
              <Select value={assignPlanId} onValueChange={(val) => { if (val) setAssignPlanId(val); }}>
                <SelectTrigger id="assignPlan">
                  <SelectValue>
                    {plans.find((p) => p.id === assignPlanId)
                      ? `${plans.find((p) => p.id === assignPlanId)?.name} - R$ ${Number(plans.find((p) => p.id === assignPlanId)?.price).toFixed(2)} (${formatBillingPeriod(plans.find((p) => p.id === assignPlanId)?.billing_period)})`
                      : "Selecione o plano desejado"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - R$ {Number(p.price).toFixed(2)} ({formatBillingPeriod(p.billing_period)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignStatus">Status da Assinatura</Label>
              <Select value={assignStatus} onValueChange={(val) => { if (val) setAssignStatus(val as SubscriptionStatus); }}>
                <SelectTrigger id="assignStatus">
                  <SelectValue>
                    {assignStatus === "active" ? "Ativo" :
                     assignStatus === "trialing" ? "Em Trial" :
                     assignStatus === "past_due" ? "Pendente / Inadimplente" :
                     assignStatus === "canceled" ? "Cancelado" : assignStatus}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="trialing">Em Trial</SelectItem>
                  <SelectItem value="past_due">Pendente / Inadimplente</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveAssignment} disabled={assigning}>
              {assigning ? "Salvando..." : "Confirmar Alteração"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
