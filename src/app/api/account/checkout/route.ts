import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getOrCreateAsaasCustomer, createAsaasSubscription } from "@/lib/asaas/client";

export async function POST(req: Request) {
  try {
    const { supabase, account } = await getCurrentAccount();
    const { data: { user } } = await supabase.auth.getUser();

    if (!account || !user) {
      return NextResponse.json({ error: "Não autenticado ou sem conta ativa." }, { status: 401 });
    }

    const body = await req.json();
    const { plan_id, billing_type = "UNDEFINED" } = body || {};

    if (!plan_id) {
      return NextResponse.json({ error: "O ID do plano é obrigatório." }, { status: 400 });
    }

    // Fetch plan
    const { data: plan, error: planErr } = await supabase
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planErr || !plan) {
      return NextResponse.json({ error: "Plano comercial não encontrado." }, { status: 404 });
    }

    // 1. Get or Create Asaas Customer
    const customer = await getOrCreateAsaasCustomer({
      name: user.user_metadata?.full_name || account.name || "Cliente Flow Hub",
      email: user.email || `${account.id}@flowhub.app`,
      externalReference: account.id,
    });

    // Calculate next due date (tomorrow for immediate payment or trial)
    const nextDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // 2. Create Asaas Subscription
    const asaasSub = await createAsaasSubscription({
      customer: customer.id,
      billingType: billing_type, // 'PIX', 'CREDIT_CARD', 'BOLETO' or 'UNDEFINED' for Asaas Payment Page
      value: Number(plan.price),
      nextDueDate,
      cycle: plan.billing_period === "yearly" ? "YEARLY" : "MONTHLY",
      description: `Assinatura Flow Hub - Plano ${plan.name}`,
      externalReference: account.id,
    });

    // 3. Upsert Subscription locally
    const { data: sub, error: subErr } = await supabase
      .from("subscriptions")
      .upsert(
        {
          account_id: account.id,
          plan_id: plan.id,
          status: "active",
          current_period_start: new Date().toISOString(),
          asaas_subscription_id: asaasSub.id,
          asaas_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "account_id" }
      )
      .select()
      .single();

    if (subErr) {
      console.error("Failed to upsert local subscription:", subErr);
    }

    // Also update account table
    await supabase
      .from("accounts")
      .update({ plan_id: plan.id, subscription_status: "active" })
      .eq("id", account.id);

    return NextResponse.json({
      success: true,
      subscription: sub || null,
      paymentUrl: asaasSub.paymentLink || null,
      asaasSubscriptionId: asaasSub.id,
    });
  } catch (err: unknown) {
    console.error("[POST /api/account/checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar checkout do plano." },
      { status: 500 }
    );
  }
}
