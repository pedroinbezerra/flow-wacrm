import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccountConsumptionSummary } from "@/lib/consumption/engine";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("start_date");
    const endDateParam = searchParams.get("end_date");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const summary = await getAccountConsumptionSummary(
      supabase,
      profile.account_id,
      startDate,
      endDate
    );

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("[API Consumption Summary] Erro ao buscar resumo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
