import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getEffectiveAccountConfig } from "@/lib/plans/limits";

export async function GET() {
  try {
    const { supabase, account } = await getCurrentAccount();
    if (!account) {
      return NextResponse.json({ error: "Não autenticado ou sem conta ativa." }, { status: 401 });
    }

    // Fetch subscription details
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .eq("account_id", account.id)
      .maybeSingle();

    // Fetch active add-ons
    const { data: addons } = await supabase
      .from("account_addons")
      .select("*")
      .eq("account_id", account.id)
      .eq("status", "active");

    // Compute effective consolidated configuration
    const { features: effectiveFeatures, plan: activePlan } = await getEffectiveAccountConfig(
      supabase,
      account.id
    );

    return NextResponse.json({
      account,
      subscription: subscription || null,
      plan: subscription?.plan || activePlan || null,
      addons: addons || [],
      effectiveFeatures,
    });
  } catch (err: unknown) {
    console.error("[GET /api/account/subscription]", err);
    return NextResponse.json({ error: "Erro ao buscar dados da assinatura." }, { status: 500 });
  }
}
