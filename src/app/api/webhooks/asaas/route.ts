import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { getAsaasSubscription } from "@/lib/asaas/client";

function isValidAccessToken(suppliedToken: string | null, expectedToken: string | undefined): boolean {
  if (!expectedToken || !suppliedToken) return false;
  const suppliedBuf = Buffer.from(suppliedToken);
  const expectedBuf = Buffer.from(expectedToken);
  if (suppliedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(suppliedBuf, expectedBuf);
}

export async function POST(req: Request) {
  try {
    const expectedToken = process.env.ASAAS_WEBHOOK_ACCESS_TOKEN;
    const suppliedToken = req.headers.get("asaas-access-token");

    // Validação de segurança: se ASAAS_WEBHOOK_ACCESS_TOKEN estiver configurado no servidor,
    // o header asaas-access-token é estritamente obrigatório e deve bater.
    if (expectedToken) {
      if (!isValidAccessToken(suppliedToken, expectedToken)) {
        console.warn("[Asaas Webhook] Tentativa de chamada não autorizada ou token inválido.");
        return NextResponse.json({ error: "Unauthorized webhook request" }, { status: 401 });
      }
    } else {
      console.warn("[Asaas Webhook] ASAAS_WEBHOOK_ACCESS_TOKEN não está definido nas variáveis de ambiente!");
    }

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
      let query = supabase.from("subscriptions").select("id, account_id, plan_id, asaas_subscription_id, billing_cycle");
      if (asaasSubscriptionId) {
        query = query.eq("asaas_subscription_id", asaasSubscriptionId);
      } else if (accountId) {
        query = query.eq("account_id", accountId);
      } else {
        return NextResponse.json({ received: true, warning: "Missing reference" });
      }

      const { data: sub } = await query.maybeSingle();

      if (sub) {
        let nextPeriodEnd: string | null = null;
        const subAsaasId = asaasSubscriptionId || sub.asaas_subscription_id;

        // Opção 1 (Preferencial): Buscar dados da assinatura diretamente no Asaas (nextDueDate)
        if (subAsaasId) {
          try {
            const asaasSub = await getAsaasSubscription(subAsaasId);
            if (asaasSub?.nextDueDate) {
              const dueDateStr = asaasSub.nextDueDate.includes("T")
                ? asaasSub.nextDueDate
                : `${asaasSub.nextDueDate}T23:59:59.000Z`;
              const dueDateObj = new Date(dueDateStr);
              if (!isNaN(dueDateObj.getTime())) {
                nextPeriodEnd = dueDateObj.toISOString();
              }
            }
          } catch (err) {
            console.warn("[Asaas Webhook] Erro ao buscar assinatura no Asaas, usando fallback por plano:", err);
          }
        }

        // Opção 2 (Fallback): Calcular a partir do billing_cycle da assinatura ou billing_period do plano
        if (!nextPeriodEnd) {
          const { data: plan } = await supabase
            .from("plans")
            .select("billing_period")
            .eq("id", sub.plan_id)
            .maybeSingle();

          const now = new Date();
          const isYearly = sub.billing_cycle === "yearly" || plan?.billing_period === "yearly";
          if (isYearly) {
            now.setFullYear(now.getFullYear() + 1);
          } else {
            now.setMonth(now.getMonth() + 1);
          }
          nextPeriodEnd = now.toISOString();
        }

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_end: nextPeriodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.id);

        // Also update account subscription_status, active plan_id & clear deletion schedule
        await supabase
          .from("accounts")
          .update({
            plan_id: sub.plan_id,
            subscription_status: "active",
            scheduled_deletion_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.account_id);

        // Insert or update Invoice & NF record idempotently
        if (payment.id) {
          const { data: existingInv } = await supabase
            .from("invoices")
            .select("id")
            .eq("asaas_payment_id", payment.id)
            .maybeSingle();

          if (existingInv) {
            await supabase
              .from("invoices")
              .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                pdf_url: payment.invoiceUrl || payment.bankSlipUrl || null,
              })
              .eq("id", existingInv.id);
          } else {
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
        }
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
    } else if (event === "PAYMENT_REFUNDED" || event === "PAYMENT_CHARGEBACK_DISPUTE") {
      // 1. Atualiza status da fatura para 'refunded'
      if (payment.id) {
        const { data: existingInv } = await supabase
          .from("invoices")
          .select("id, account_id, subscription_id")
          .eq("asaas_payment_id", payment.id)
          .maybeSingle();

        if (existingInv) {
          await supabase
            .from("invoices")
            .update({ status: "refunded" })
            .eq("id", existingInv.id);
        }
      }

      // 2. Rebaixa conta e assinatura diretamente para 'suspended'
      let query = supabase.from("subscriptions").select("id, account_id");
      if (asaasSubscriptionId) {
        query = query.eq("asaas_subscription_id", asaasSubscriptionId);
      } else if (accountId) {
        query = query.eq("account_id", accountId);
      }

      const { data: sub } = await query.maybeSingle();
      const targetSubId = sub?.id;
      const targetAccountId = sub?.account_id || accountId;

      if (targetSubId) {
        await supabase
          .from("subscriptions")
          .update({
            status: "suspended",
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetSubId);
      }

      if (targetAccountId) {
        await supabase
          .from("accounts")
          .update({
            subscription_status: "suspended",
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetAccountId);
      }
    } else if (event === "PAYMENT_CHARGEBACK_REQUESTED") {
      // Mantém fatura como 'paid', mantém acesso da conta e apenas registra log de auditoria
      const targetAccountId = accountId || (
        asaasSubscriptionId
          ? (await supabase.from("subscriptions").select("account_id").eq("asaas_subscription_id", asaasSubscriptionId).maybeSingle()).data?.account_id
          : null
      );

      let accountName = "Conta Hub";
      if (targetAccountId) {
        const { data: acc } = await supabase
          .from("accounts")
          .select("name, company_name")
          .eq("id", targetAccountId)
          .maybeSingle();

        if (acc) {
          accountName = acc.company_name || acc.name || accountName;
        }
      }

      await supabase.from("account_deletion_audit_logs").insert({
        account_id: targetAccountId || null,
        account_name: accountName,
        owner_email: null,
        purged_at: new Date().toISOString(),
        details: {
          event: "PAYMENT_CHARGEBACK_REQUESTED",
          payment_id: payment.id,
          amount: payment.value,
          message: "Contestação de pagamento (chargeback) solicitada e em análise no Asaas.",
        },
      });
    } else if (event === "PAYMENT_DELETED") {
      // 1. Marca fatura como 'canceled'
      if (payment.id) {
        const { data: existingInv } = await supabase
          .from("invoices")
          .select("id, account_id, subscription_id")
          .eq("asaas_payment_id", payment.id)
          .maybeSingle();

        if (existingInv) {
          await supabase
            .from("invoices")
            .update({ status: "canceled" })
            .eq("id", existingInv.id);
        }
      }

      // 2. Se a assinatura estava ativa por essa cobrança, trata como PAYMENT_OVERDUE
      let query = supabase.from("subscriptions").select("id, account_id, status");
      if (asaasSubscriptionId) {
        query = query.eq("asaas_subscription_id", asaasSubscriptionId);
      } else if (accountId) {
        query = query.eq("account_id", accountId);
      }

      const { data: sub } = await query.maybeSingle();

      if (sub && sub.status === "active") {
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.id);

        await supabase
          .from("accounts")
          .update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.account_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[Asaas Webhook Error]", err);
    return NextResponse.json({ error: "Internal webhook processing error" }, { status: 500 });
  }
}
