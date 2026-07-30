"use client";

import { useEffect, useState } from "react";
import type { CommercialPlan, Subscription, AccountAddon, PlanFeatures, Invoice } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, ShieldCheck, Zap, Calendar, CheckCircle2, AlertTriangle, Download, ExternalLink, FileText, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export function BillingPanel() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<CommercialPlan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [addons, setAddons] = useState<AccountAddon[]>([]);
  const [effectiveFeatures, setEffectiveFeatures] = useState<PlanFeatures>({});
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Upgrade Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [allPlans, setAllPlans] = useState<CommercialPlan[]>([]);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [subRes, invRes] = await Promise.all([
        fetch("/api/account/subscription"),
        fetch("/api/account/invoices"),
      ]);

      const subData = await subRes.json();
      const invData = await invRes.json();

      if (subRes.ok) {
        setPlan(subData.plan);
        setSubscription(subData.subscription);
        setAddons(subData.addons || []);
        setEffectiveFeatures(subData.effectiveFeatures || {});
      }

      if (invRes.ok) {
        setInvoices(invData.invoices || []);
      }
    } catch (err) {
      console.error("Failed to load subscription info:", err);
      toast.error("Falha ao se conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const openUpgradeModal = async () => {
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (res.ok) {
        setAllPlans((data.plans || []).filter((p: CommercialPlan) => p.status === "active"));
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

      toast.success("Redirecionando para a página de pagamento seguro do Asaas...");

      if (data.paymentUrl) {
        window.open(data.paymentUrl, "_blank");
      }

      setCheckoutModalOpen(false);
      fetchSubscriptionData();
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
              <p className="text-xs text-muted-foreground font-medium">Id do Cliente Asaas</p>
              <p className="text-xs font-mono text-muted-foreground">
                {subscription?.asaas_customer_id || "Integrado"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Effective Configuration & Consolidated Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Configuração Efetiva & Limites da Conta
          </CardTitle>
          <CardDescription>
            Soma do plano original com todos os recursos adicionais contratados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">Usuários / Membros</p>
              <p className="text-lg font-bold text-foreground">{effectiveFeatures.max_users ?? "Ilimitado"}</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">Contatos</p>
              <p className="text-lg font-bold text-foreground">{effectiveFeatures.max_contacts ?? "Ilimitado"}</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">Fluxos de Automação</p>
              <p className="text-lg font-bold text-foreground">{effectiveFeatures.max_flows ?? "Ilimitado"}</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">Funis Kanban</p>
              <p className="text-lg font-bold text-foreground">{effectiveFeatures.max_kanban_funnels ?? "Ilimitado"}</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">Boards de Atendimento</p>
              <p className="text-lg font-bold text-foreground">{effectiveFeatures.max_boards ?? "Ilimitado"}</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">Disparos / Campanha</p>
              <p className="text-lg font-bold text-foreground">{effectiveFeatures.max_broadcasts_per_campaign ?? "Ilimitado"}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
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
              Nenhuma fatura registrada até o momento. As faturas pagas via Asaas aparecerão aqui automaticamente.
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
                      {isCurrent ? "Plano Selecionado" : processingCheckout ? "Gerando Cobrança..." : "Assinar com Asaas"}
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
    </div>
  );
}
