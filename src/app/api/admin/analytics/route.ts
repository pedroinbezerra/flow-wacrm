import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

export async function GET() {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    // 1. Fetch Subscriptions & Plans for MRR/ARR
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*, plan:plans(*)");

    const subs = subscriptions || [];
    const activeSubs = subs.filter((s) => s.status === "active");
    const trialingSubs = subs.filter((s) => s.status === "trialing");
    const pastDueSubs = subs.filter((s) => s.status === "past_due");
    const canceledSubs = subs.filter((s) => s.status === "canceled");

    let mrr = 0;
    activeSubs.forEach((s) => {
      const plan = Array.isArray(s.plan) ? s.plan[0] : s.plan;
      if (plan) {
        const isYearly = s.billing_cycle === "yearly" || plan.billing_period === "yearly";
        if (isYearly) {
          const yearlyPrice = Number(plan.price_yearly) > 0 ? Number(plan.price_yearly) : Number(plan.price) * 12;
          mrr += yearlyPrice / 12;
        } else {
          const monthlyPrice = Number(plan.price_monthly) > 0 ? Number(plan.price_monthly) : Number(plan.price);
          mrr += monthlyPrice;
        }
      }
    });

    const arr = mrr * 12;

    // 2. WhatsApp WABA Instances Status (Meta Cloud API Health)
    const { count: wabaCount } = await supabase
      .from("whatsapp_configs")
      .select("id", { count: "exact", head: true });

    // 3. Accounts & Total Contacts Consumed
    const { count: totalAccounts } = await supabase
      .from("accounts")
      .select("id", { count: "exact", head: true });

    const { count: totalContacts } = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true });

    const { count: totalFlows } = await supabase
      .from("flows")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      metrics: {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        totalSubscriptions: subs.length,
        activeSubscriptionsCount: activeSubs.length,
        trialingSubscriptionsCount: trialingSubs.length,
        pastDueSubscriptionsCount: pastDueSubs.length,
        canceledSubscriptionsCount: canceledSubs.length,
        wabaConnectedCount: wabaCount || 0,
        totalAccountsCount: totalAccounts || 0,
        totalContactsCount: totalContacts || 0,
        totalFlowsCount: totalFlows || 0,
      },
      recentSubscriptions: subs.slice(0, 10),
    });
  } catch (err: unknown) {
    console.error("[GET /api/admin/analytics]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao carregar dados analíticos" },
      { status: err instanceof Error && err.message.includes("Acesso negado") ? 403 : 500 }
    );
  }
}
