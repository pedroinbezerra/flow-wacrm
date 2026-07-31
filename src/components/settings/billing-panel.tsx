"use client";

import { useEffect, useState } from "react";
import type { CommercialPlan, Subscription, AccountAddon, PlanFeatures, Invoice } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, ShieldCheck, Zap, Calendar, CheckCircle2, AlertTriangle, Download, ExternalLink, FileText, ArrowUpRight, Copy, Activity, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConsumptionDashboardCard } from "@/components/consumption/consumption-dashboard-card";
import { useAuth } from "@/hooks/use-auth";
import { isValidCpfOrCnpj } from "@/lib/validation/fiscal";

interface NativeCheckoutData {
  paymentUrl: string | null;
  bankSlipUrl: string | null;
  pix: {
    encodedImage: string;
    payload: string;
    expirationDate?: string;
  } | null;
  asaasSubscriptionId?: string;
}

export function BillingPanel() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<CommercialPlan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [addons, setAddons] = useState<AccountAddon[]>([]);
  const [effectiveFeatures, setEffectiveFeatures] = useState<PlanFeatures>({});
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Native In-App Checkout State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<NativeCheckoutData | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [allPlans, setAllPlans] = useState<CommercialPlan[]>([]);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // Cancellation / Reactivation State
  const { isOwner, isPendingDeletion, scheduledDeletionAt, refreshProfile } = useAuth();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  const handleCancelAccount = async () => {
    setCanceling(true);
    try {
      const res = await fetch("/api/account/cancel", { method: "POST" });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : null;
      if (!res.ok) throw new Error(data?.error || `Erro (${res.status}) ao agendar cancelamento.`);
      toast.success(data?.message || "Conta agendada para exclusão em 90 dias.");
      setCancelModalOpen(false);
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivateAccount = async () => {
    setReactivating(true);
    try {
      const res = await fetch("/api/account/reactivate", { method: "POST" });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : null;
      if (!res.ok) throw new Error(data?.error || `Erro (${res.status}) ao reativar conta.`);
      toast.success(data?.message || "Conta reativada com sucesso!");
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReactivating(false);
    }
  };

  // Fiscal & Billing Data State
  const [fiscalCpfCnpj, setFiscalCpfCnpj] = useState("");
  const [fiscalCompanyName, setFiscalCompanyName] = useState("");
  const [fiscalPhone, setFiscalPhone] = useState("");
  const [fiscalPostalCode, setFiscalPostalCode] = useState("");
  const [fiscalStreet, setFiscalStreet] = useState("");
  const [fiscalNumber, setFiscalNumber] = useState("");
  const [fiscalCity, setFiscalCity] = useState("");
  const [fiscalState, setFiscalState] = useState("");
  const [savingFiscal, setSavingFiscal] = useState(false);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [subRes, invRes, accRes] = await Promise.all([
        fetch("/api/account/subscription"),
        fetch("/api/account/invoices"),
        fetch("/api/account"),
      ]);

      if (subRes.ok && subRes.headers.get("content-type")?.includes("application/json")) {
        const subData = await subRes.json();
        setPlan(subData.plan);
        setSubscription(subData.subscription);
        setAddons(subData.addons || []);
        setEffectiveFeatures(subData.effectiveFeatures || {});
        setUsage(subData.usage || {});
      }

      if (invRes.ok && invRes.headers.get("content-type")?.includes("application/json")) {
        const invData = await invRes.json();
        setInvoices(invData.invoices || []);
      }

      if (accRes.ok && accRes.headers.get("content-type")?.includes("application/json")) {
        const accData = await accRes.json();
        const acc = accData.account;
        if (acc) {
          setFiscalCpfCnpj(acc.cpf_cnpj || "");
          setFiscalCompanyName(acc.company_name || acc.name || "");
          setFiscalPhone(acc.phone || "");
          setFiscalPostalCode(acc.postal_code || "");
          setFiscalStreet(acc.address_street || "");
          setFiscalNumber(acc.address_number || "");
          setFiscalCity(acc.address_city || "");
          setFiscalState(acc.address_state || "");
        }
      }
    } catch (err) {
      console.error("Failed to load subscription info:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFiscal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fiscalCpfCnpj.trim() !== "" && !isValidCpfOrCnpj(fiscalCpfCnpj)) {
      toast.error("O CPF ou CNPJ digitado é inválido. Por favor, verifique os números e dígitos.");
      return;
    }
    setSavingFiscal(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf_cnpj: fiscalCpfCnpj,
          company_name: fiscalCompanyName,
          phone: fiscalPhone,
          postal_code: fiscalPostalCode,
          address_street: fiscalStreet,
          address_number: fiscalNumber,
          address_city: fiscalCity,
          address_state: fiscalState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao salvar dados fiscais.");
      toast.success("Dados de faturamento (CPF/CNPJ) atualizados com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar dados fiscais.");
    } finally {
      setSavingFiscal(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const openUpgradeModal = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (res.ok) {
        setAllPlans(data.plans || []);
        setCheckoutModalOpen(true);
      } else {
        toast.error("Não foi possível carregar os planos disponíveis.");
      }
    } catch (err) {
      toast.error("Erro ao consultar planos.");
    }
  };

  const handleSelectPlanForCheckout = async (selectedPlanId: string) => {
    setProcessingCheckout(true);
    try {
      const res = await fetch("/api/account/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: selectedPlanId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro no checkout");
      }

      if (data.isFreePlan) {
        toast.success("Plano gratuito ativado com sucesso para sua empresa!");
        setCheckoutModalOpen(false);
        fetchSubscriptionData();
      } else {
        setCheckoutData({
          paymentUrl: data.paymentUrl || null,
          bankSlipUrl: data.bankSlipUrl || null,
          pix: data.pix || null,
          asaasSubscriptionId: data.asaasSubscriptionId,
        });
        setCheckoutModalOpen(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao selecionar plano");
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Carregando dados financeiros e de assinatura...</div>;
  }

  const subStatus = subscription?.status || "active";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1"><CheckCircle2 className="h-3 w-3" /> Assinatura Ativa</Badge>;
      case "trialing":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1"><Calendar className="h-3 w-3" /> Período de Teste (Trial)</Badge>;
      case "past_due":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Cobrança Pendente / Inadimplente</Badge>;
      case "canceled":
        return <Badge variant="secondary" className="gap-1">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderUsageCard = (
    label: string,
    featureKey: keyof PlanFeatures,
    usageKey: string
  ) => {
    const maxVal = effectiveFeatures[featureKey];
    if (maxVal === undefined || maxVal === null || typeof maxVal === "boolean") {
      return null;
    }

    const used = usage[usageKey] || 0;
    const isUnlimited = Number(maxVal) <= 0 || Number(maxVal) >= 999999;
    const pct = isUnlimited ? 0 : Math.round((used / Number(maxVal)) * 100);

    return (
      <div className="p-3.5 rounded-lg border border-border bg-card/60 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          <span className="text-xs font-bold font-mono text-foreground">
            {used} <span className="text-muted-foreground font-normal">/ {isUnlimited ? "∞" : String(maxVal)}</span>
          </span>
        </div>

        {!isUnlimited ? (
          <div className="space-y-1">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all rounded-full",
                  pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] pt-0.5">
              <span
                className={cn(
                  "font-medium",
                  pct >= 100 ? "text-red-500 font-bold" : pct >= 80 ? "text-amber-500 font-bold" : "text-muted-foreground"
                )}
              >
                {pct >= 100 ? "Limite Atingido" : pct >= 80 ? "Próximo do Limite" : `${pct}% consumido`}
              </span>
              {pct >= 80 && (
                <button
                  type="button"
                  onClick={openUpgradeModal}
                  className="text-primary hover:underline font-semibold flex items-center gap-0.5"
                >
                  Expandir +
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium pt-1">
            <CheckCircle2 className="h-3 w-3" />
            Uso Ilimitado
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Plano & Área Financeira
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie o plano contratado, recursos adicionais e notas fiscais da sua empresa.
          </p>
        </div>
        <Button onClick={openUpgradeModal} className="gap-2">
          <ArrowUpRight className="h-4 w-4" />
          Alterar / Upgrade de Plano
        </Button>
      </div>

      {/* Main Subscription Card */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              {plan ? plan.name : "Plano Personalizado"}
            </CardTitle>
            <CardDescription>
              {plan?.description || "Plano ativo no Flow Hub"}
            </CardDescription>
          </div>
          <div>{getStatusBadge(subStatus)}</div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary">
              R$ {Number(plan?.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-muted-foreground">
              / {plan?.billing_period === "yearly" ? "Anual" : "Mensal"}
            </span>
          </div>

          <div className="border-t border-border pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Início do Período</p>
              <p className="text-sm font-semibold text-foreground">
                {subscription?.current_period_start
                  ? new Date(subscription.current_period_start).toLocaleDateString("pt-BR")
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Próxima Renovação</p>
              <p className="text-sm font-semibold text-foreground">
                {subscription?.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR")
                  : "Renovação automática ativada"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Forma de Pagamento</p>
              <p className="text-sm font-semibold text-foreground">
                Pagamento Seguro (PIX / Cartão / Boleto)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Consumption & Computational Franchise */}
      <ConsumptionDashboardCard />

      {/* Real-Time Consumption & Consolidated Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Consumo em Tempo Real & Limites da Conta
          </CardTitle>
          <CardDescription>
            Acompanhe o uso atual da sua empresa em comparação com o limite da sua Configuração Efetiva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {renderUsageCard("Usuários / Membros", "max_users", "max_users")}
            {renderUsageCard("Contatos Cadastrados", "max_contacts", "max_contacts")}
            {renderUsageCard("Fluxos de Automação", "max_flows", "max_flows")}
            {renderUsageCard("Funis Kanban", "max_kanban_funnels", "max_kanban_funnels")}
            {renderUsageCard("Boards de Atendimento", "max_boards", "max_boards")}

            <div className="p-3.5 rounded-lg border border-border bg-card/60 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Disparos / Campanha</span>
                <span className="text-xs font-bold font-mono text-foreground">
                  {effectiveFeatures.max_broadcasts_per_campaign ?? "Ilimitado"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                Limite máximo de contatos por disparo de transmissão.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-border">
            <Badge variant={effectiveFeatures.allow_scheduling ? "default" : "outline"}>
              {effectiveFeatures.allow_scheduling ? "✓ Agendamento Habilitado" : "✕ Sem Agendamento"}
            </Badge>
            <Badge variant={effectiveFeatures.allow_reports ? "default" : "outline"}>
              {effectiveFeatures.allow_reports ? "✓ Relatórios Avançados" : "✕ Sem Relatórios"}
            </Badge>
            <Badge variant={effectiveFeatures.allow_webhooks ? "default" : "outline"}>
              {effectiveFeatures.allow_webhooks ? "✓ Webhooks Habilitados" : "✕ Sem Webhooks"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons (Recursos Adicionais) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Recursos Adicionais Contratados (Add-ons)
          </CardTitle>
          <CardDescription>
            Expansões personalizadas adicionadas à sua assinatura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {addons.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Sua conta ainda não possui recursos adicionais contratados.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {addons.map((addon) => (
                <div key={addon.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{addon.name}</p>
                    <p className="text-xs text-muted-foreground">Feature: {addon.feature_key} (+{addon.quantity})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">R$ {Number(addon.unit_price).toFixed(2)}/mês</p>
                    <Badge variant="outline" className="text-[10px]">Ativo</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices & Fiscal Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Histórico de Cobranças & Notas Fiscais
          </CardTitle>
          <CardDescription>
            Acesse seus comprovantes de pagamento e faça o download das notas fiscais emitidas automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma fatura registrada até o momento. As faturas pagas aparecerão aqui automaticamente.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Método</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Documentos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString("pt-BR") : new Date(inv.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">
                        R$ {Number(inv.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {inv.billing_type || "Asaas"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={inv.status === "paid" ? "default" : "secondary"}>
                          {inv.status === "paid" ? "Pago" : inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.pdf_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => window.open(inv.pdf_url!, "_blank")}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Nota Fiscal / Recibo
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Processando NF...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dados Fiscais e de Faturamento (CPF/CNPJ) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Dados Fiscais & Faturamento (CPF/CNPJ)
          </CardTitle>
          <CardDescription>
            Mantenha seu CPF/CNPJ, telefone e endereço atualizados para emissão de faturas, registro de pagamentos no Asaas e Notas Fiscais (NFS-e).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveFiscal} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">CPF ou CNPJ *</label>
                <input
                  type="text"
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  value={fiscalCpfCnpj}
                  onChange={(e) => setFiscalCpfCnpj(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Razão Social / Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Nome Fantasia ou Nome da Empresa"
                  value={fiscalCompanyName}
                  onChange={(e) => setFiscalCompanyName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Telefone Celular (com DDD) *</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={fiscalPhone}
                  onChange={(e) => setFiscalPhone(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">CEP</label>
                <input
                  type="text"
                  placeholder="00000-000"
                  value={fiscalPostalCode}
                  onChange={(e) => setFiscalPostalCode(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Número</label>
                <input
                  type="text"
                  placeholder="123"
                  value={fiscalNumber}
                  onChange={(e) => setFiscalNumber(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Endereço (Rua/Avenida)</label>
                <input
                  type="text"
                  placeholder="Av. Paulista"
                  value={fiscalStreet}
                  onChange={(e) => setFiscalStreet(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Cidade / UF</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={fiscalCity}
                    onChange={(e) => setFiscalCity(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="UF"
                    maxLength={2}
                    value={fiscalState}
                    onChange={(e) => setFiscalState(e.target.value.toUpperCase())}
                    className="w-16 rounded-md border border-input bg-background px-2 py-2 text-center text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={savingFiscal}>
                {savingFiscal ? "Salvando..." : "Salvar Dados Fiscais"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal: Upgrade / Trocar de Plano */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Escolha o seu Plano Comercial</DialogTitle>
            <DialogDescription>
              Selecione o plano ideal para a sua empresa. O pagamento recorrente será processado com segurança pelo Asaas.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 md:grid-cols-2">
            {allPlans.map((p) => {
              const isCurrent = plan?.id === p.id;
              return (
                <Card key={p.id} className={`flex flex-col justify-between border ${isCurrent ? "border-primary bg-primary/5" : "border-border"}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">{p.name}</CardTitle>
                      {isCurrent && <Badge variant="default">Plano Atual</Badge>}
                    </div>
                    <CardDescription className="text-xs">{p.description}</CardDescription>
                    <div className="pt-2 text-2xl font-extrabold text-primary">
                      R$ {Number(p.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      <span className="text-xs font-normal text-muted-foreground"> / {p.billing_period === "yearly" ? "Anual" : "Mensal"}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      disabled={isCurrent || processingCheckout}
                      onClick={() => handleSelectPlanForCheckout(p.id)}
                      className="w-full gap-2"
                      variant={isCurrent ? "outline" : "default"}
                    >
                      {isCurrent ? "Plano Selecionado" : processingCheckout ? "Gerando Cobrança..." : "Assinar"}
                      {!isCurrent && <ExternalLink className="h-3.5 w-3.5" />}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutModalOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Native In-App Payment Checkout (PIX QR Code, Copia e Cola, Boleto & Cartao) */}
      <Dialog open={Boolean(checkoutData)} onOpenChange={(open) => { if (!open) setCheckoutData(null); }}>
        <DialogContent className="sm:max-w-xl w-full flex flex-col p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <CreditCard className="h-5 w-5 text-primary" />
              Pagamento da Assinatura
            </DialogTitle>
            <DialogDescription>
              Conclua o pagamento do seu plano sem sair do Flow Hub.
            </DialogDescription>
          </DialogHeader>

          {checkoutData?.pix ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-5 border border-border rounded-xl bg-card">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" />
                PIX Gerado Instantaneamente
              </div>

              {/* QR Code Image */}
              {checkoutData.pix.encodedImage && (
                <div className="p-3 bg-white rounded-xl shadow-inner border border-zinc-200">
                  <img
                    src={`data:image/png;base64,${checkoutData.pix.encodedImage}`}
                    alt="PIX QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              )}

              {/* Copia e Cola Code */}
              <div className="w-full space-y-2 text-center">
                <p className="text-xs text-muted-foreground font-medium">Escaneie o QR Code acima ou use o PIX Copia e Cola abaixo:</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={checkoutData.pix.payload}
                    className="flex-1 text-xs font-mono bg-muted border border-border rounded-md px-3 py-2 text-foreground truncate select-all"
                  />
                  <Button
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(checkoutData.pix!.payload);
                      setCopiedPix(true);
                      toast.success("Código PIX copiado para a área de transferência!");
                      setTimeout(() => setCopiedPix(false), 3000);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedPix ? "Copiado!" : "Copiar PIX"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-border rounded-xl bg-muted/40 text-center space-y-3">
              <p className="text-sm font-medium text-foreground">Sua cobrança foi gerada no Asaas com sucesso!</p>
              <p className="text-xs text-muted-foreground">Escolha abaixo a opção desejada para concluir o pagamento.</p>
            </div>
          )}

          {/* Alternative options (Boleto or Full Invoice Page) */}
          <div className="flex flex-wrap gap-2 pt-1 justify-center">
            {checkoutData?.bankSlipUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => window.open(checkoutData.bankSlipUrl!, "_blank")}
              >
                <Download className="h-3.5 w-3.5" />
                Baixar Boleto
              </Button>
            )}
            {checkoutData?.paymentUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => window.open(checkoutData.paymentUrl!, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Cartão de Crédito
              </Button>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setCheckoutData(null);
                fetchSubscriptionData();
              }}
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                setCheckoutData(null);
                fetchSubscriptionData();
                toast.success("Status da assinatura atualizado!");
              }}
            >
              Já Realizei o Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zona de Cancelamento / Carência de 90 Dias (Dono da Conta) */}
      {isOwner && (
        <Card className="border-destructive/30 bg-destructive/5 mt-8">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-base font-bold">Gerenciamento de Cancelamento e Exclusão</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Conforme as regras do Flow Hub, dados pessoais e operacionais são preservados por 90 dias após o cancelamento. Passado esse prazo, os dados são permanentemente expurgados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPendingDeletion ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-card border border-border">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Exclusão agendada para:{" "}
                    <span className="text-destructive font-mono">
                      {scheduledDeletionAt ? new Date(scheduledDeletionAt).toLocaleDateString("pt-BR") : "em 90 dias"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Seus dados continuam 100% salvos e seguros. Você pode reativar a qualquer momento antes da data acima.
                  </p>
                </div>
                <Button
                  onClick={handleReactivateAccount}
                  disabled={reactivating}
                  className="gap-2 shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${reactivating ? "animate-spin" : ""}`} />
                  {reactivating ? "Reativando..." : "Reativar Conta Agora"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-card border border-border">
                <div>
                  <p className="text-sm font-semibold text-foreground">Cancelar e Excluir Esta Conta</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inicia a contagem regressiva de 90 dias. Faturas tributárias passadas serão preservadas por 5 anos conforme exigido por lei.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setCancelModalOpen(true)}
                  className="gap-2 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  Solicitar Cancelamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Confirmação de Cancelamento */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Solicitação de Cancelamento
            </DialogTitle>
            <DialogDescription className="text-xs space-y-2 pt-2">
              <p>Ao solicitar o cancelamento:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Sua conta entrará em <strong>carência de 90 dias</strong>.</li>
                <li>Todos os seus contatos, mensagens e histórico ficarão <strong>100% preservados</strong> durante esse prazo.</li>
                <li>Caso mude de ideia, você pode reativar sua conta no painel a qualquer momento.</li>
                <li>Ao término dos 90 dias, os dados serão <strong>excluídos permanentemente</strong> (exceto faturas fiscais mantidas por lei).</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Voltar / Manter Conta
            </Button>
            <Button
              variant="destructive"
              disabled={canceling}
              onClick={handleCancelAccount}
            >
              {canceling ? "Processando..." : "Confirmar Cancelamento (90 Dias)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
