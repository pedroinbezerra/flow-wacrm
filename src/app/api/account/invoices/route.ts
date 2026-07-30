import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";

export async function GET() {
  try {
    const { supabase, account } = await getCurrentAccount();
    if (!account) {
      return NextResponse.json({ error: "Não autenticado ou sem conta ativa." }, { status: 401 });
    }

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("account_id", account.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ invoices: invoices || [] });
  } catch (err: unknown) {
    console.error("[GET /api/account/invoices]", err);
    return NextResponse.json({ error: "Erro ao buscar histórico de faturas." }, { status: 500 });
  }
}
