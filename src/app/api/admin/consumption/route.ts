import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSuperAdminConsumptionIntelligence } from "@/lib/consumption/engine";
import { getUpstashRedisMetrics } from "@/lib/rate-limit";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário é super admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      return NextResponse.json({ error: "Acesso restrito a Super Admins" }, { status: 403 });
    }

    const intelligence = await getSuperAdminConsumptionIntelligence(supabase);
    const redisMetrics = await getUpstashRedisMetrics();

    return NextResponse.json({ success: true, intelligence, redisMetrics });
  } catch (error) {
    console.error("[API Admin Consumption] Erro ao buscar inteligência:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
