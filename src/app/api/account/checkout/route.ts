import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { isValidCpfOrCnpj, sanitizeCpfCnpj } from "@/lib/validation/fiscal";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import {
  getOrCreateAsaasCustomer,
  createAsaasSubscription,
  getAsaasSubscriptionFirstPayment,
  getAsaasPaymentPixQrCode,
} from "@/lib/asaas/client";

export async function POST(req: Request) {
  try {
    const { supabase, account } = await getCurrentAccount();
    const { data: { user } } = await supabase.auth.getUser();

    if (!account || !user) {
      return NextResponse.json({ error: "Não autenticado ou sem conta ativa." }, { status: 401 });
    }

    const body = await req.json();
    const { plan_id, billing_type = "UNDEFINED", billing_cycle = "monthly" } = body || {};

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

    const isYearly = billing_cycle === "yearly";
    const selectedPrice = isYearly
      ? (Number(plan.price_yearly) > 0 ? Number(plan.price_yearly) : Number(plan.price) * 12)
      : (Number(plan.price_monthly) > 0 ? Number(plan.price_monthly) : Number(plan.price));

    const adminClient = supabaseAdmin();

    // If the plan is free (R$ 0,00), activate directly without financial charge
    if (selectedPrice === 0) {
      const { data: sub } = await adminClient
        .from("subscriptions")
        .upsert(
          {
            account_id: account.id,
            plan_id: plan.id,
            status: "active",
            billing_cycle: isYearly ? "yearly" : "monthly",
            current_period_start: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "account_id" }
        )
        .select()
        .single();

      await adminClient
        .from("accounts")
        .update({ plan_id: plan.id, subscription_status: "active" })
        .eq("id", account.id);

      return NextResponse.json({
        success: true,
        isFreePlan: true,
        subscription: sub || null,
        paymentUrl: null,
      });
    }

    if (selectedPrice < 5) {
      return NextResponse.json(
        { error: "O Asaas exige um valor mínimo de R$ 5,00 para gerar cobranças recorrentes no sistema." },
        { status: 400 }
      );
    }

    // Exigência estrita de CPF/CNPJ válido para cobranças pagas
    if (!account.cpf_cnpj || !isValidCpfOrCnpj(account.cpf_cnpj)) {
      return NextResponse.json(
        { error: "É necessário cadastrar um CPF ou CNPJ válido em Configurações → Dados Fiscais antes de prosseguir com a assinatura." },
        { status: 400 }
      );
    }

    // 1. Get or Create Asaas Customer with complete fiscal & contact info
    const customer = await getOrCreateAsaasCustomer({
      name: account.company_name || account.name || user.user_metadata?.full_name || "Cliente Flow Hub",
      email: user.email || `${account.id}@flowhub.app`,
      cpfCnpj: account.cpf_cnpj ? sanitizeCpfCnpj(account.cpf_cnpj) : undefined,
      phone: account.phone ? account.phone.replace(/\D/g, "") : undefined,
      mobilePhone: account.phone ? account.phone.replace(/\D/g, "") : undefined,
      postalCode: account.postal_code ? account.postal_code.replace(/\D/g, "") : undefined,
      address: account.address_street || undefined,
      addressNumber: account.address_number || undefined,
      complement: account.address_complement || undefined,
      province: account.address_neighborhood || undefined,
      externalReference: account.id,
    });

    // Save asaas_customer_id back to account row for fast lookups
    await adminClient
      .from("accounts")
      .update({ asaas_customer_id: customer.id })
      .eq("id", account.id);

    // Calculate next due date (tomorrow for immediate payment or trial)
    const nextDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // 2. Create Asaas Subscription
    const asaasSub = await createAsaasSubscription({
      customer: customer.id,
      billingType: billing_type, // 'PIX', 'CREDIT_CARD', 'BOLETO' or 'UNDEFINED' for Asaas Payment Page
      value: selectedPrice,
      nextDueDate,
      cycle: isYearly ? "YEARLY" : "MONTHLY",
      description: `Assinatura Flow Hub - Plano ${plan.name} (${isYearly ? "Anual" : "Mensal"})`,
      externalReference: account.id,
    });

    // Fetch first payment and PIX QR Code if available
    const firstPayment = await getAsaasSubscriptionFirstPayment(asaasSub.id);
    const pixQrCode = firstPayment?.id ? await getAsaasPaymentPixQrCode(firstPayment.id) : null;
    const paymentUrl = asaasSub.paymentLink || firstPayment?.invoiceUrl || firstPayment?.bankSlipUrl || null;

    // 3. Upsert Subscription locally via service role (status past_due until Asaas webhook confirms payment)
    const { data: sub, error: subErr } = await adminClient
      .from("subscriptions")
      .upsert(
        {
          account_id: account.id,
          plan_id: plan.id,
          status: "past_due",
          billing_cycle: isYearly ? "yearly" : "monthly",
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
      throw new Error("Erro ao registrar a assinatura no sistema.");
    }

    return NextResponse.json({
      success: true,
      subscription: sub || null,
      paymentUrl,
      bankSlipUrl: firstPayment?.bankSlipUrl || null,
      pix: pixQrCode || null,
      asaasSubscriptionId: asaasSub.id,
      asaasPaymentId: firstPayment?.id || null,
    });
  } catch (err: unknown) {
    console.error("[POST /api/account/checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar checkout do plano." },
      { status: 500 }
    );
  }
}
