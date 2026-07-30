import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const { event, payment } = payload || {};

    if (!event || !payment) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const supabase = supabaseAdmin();
    const asaasSubscriptionId = payment.subscription;
    const accountId = payment.externalReference;

    console.log(`[Asaas Webhook] Event: ${event}, SubId: ${asaasSubscriptionId}, AccountId: ${accountId}`);

    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      // Find subscription by asaas_subscription_id or account_id
      let query = supabase.from("subscriptions").select("id, account_id, plan_id");
      if (asaasSubscriptionId) {
        query = query.eq("asaas_subscription_id", asaasSubscriptionId);
      } else if (accountId) {
        query = query.eq("account_id", accountId);
      } else {
        return NextResponse.json({ received: true, warning: "Missing reference" });
      }

      const { data: sub } = await query.maybeSingle();

      if (sub) {
        // Calculate new period end (default +30 days)
        const nextPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_end: nextPeriodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.id);

        // Also update account subscription_status & active plan_id
        await supabase
          .from("accounts")
          .update({ plan_id: sub.plan_id, subscription_status: "active" })
          .eq("id", sub.account_id);

        // Insert or update Invoice & NF record
        await supabase.from("invoices").insert({
          account_id: sub.account_id,
          subscription_id: sub.id,
          asaas_payment_id: payment.id,
          asaas_invoice_id: payment.invoiceId || null,
          amount: Number(payment.value || payment.netValue || 0),
          status: "paid",
          billing_type: payment.billingType,
          invoice_number: payment.invoiceNumber || null,
          pdf_url: payment.invoiceUrl || payment.bankSlipUrl || null,
          bank_slip_url: payment.bankSlipUrl || null,
          paid_at: new Date().toISOString(),
        });
      }
    } else if (event === "PAYMENT_OVERDUE") {
      let query = supabase.from("subscriptions").select("id, account_id");
      if (asaasSubscriptionId) {
        query = query.eq("asaas_subscription_id", asaasSubscriptionId);
      } else if (accountId) {
        query = query.eq("account_id", accountId);
      }

      const { data: sub } = await query.maybeSingle();

      if (sub) {
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.id);

        await supabase
          .from("accounts")
          .update({ subscription_status: "past_due" })
          .eq("id", sub.account_id);
      }
    } else if (event === "SUBSCRIPTION_DELETED") {
      if (asaasSubscriptionId) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("id, account_id")
          .eq("asaas_subscription_id", asaasSubscriptionId)
          .maybeSingle();

        if (sub) {
          await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", sub.id);

          await supabase
            .from("accounts")
            .update({ subscription_status: "canceled" })
            .eq("id", sub.account_id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[Asaas Webhook Error]", err);
    return NextResponse.json({ error: "Internal webhook processing error" }, { status: 500 });
  }
}
