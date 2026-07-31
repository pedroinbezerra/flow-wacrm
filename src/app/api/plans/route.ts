import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const limit = await checkRateLimit(`plans:get:${user.id}`, RATE_LIMITS.adminAction);
    if (!limit.success) return rateLimitResponse(limit);

    const { data: plans, error } = await supabase
      .from("plans")
      .select("*")
      .eq("status", "active")
      .order("price", { ascending: true });

    if (error) {
      console.error("[GET /api/plans] Error fetching active commercial plans:", error);
      return NextResponse.json({ error: "Erro ao carregar os planos disponíveis" }, { status: 500 });
    }

    return NextResponse.json({ plans: plans || [] });
  } catch (err: unknown) {
    console.error("[GET /api/plans] Exception:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
