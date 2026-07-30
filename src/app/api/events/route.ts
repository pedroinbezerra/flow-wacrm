import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Tenta obter usuário/conta da sessão (se autenticado)
    const { data: { user } } = await supabase.auth.getUser();

    let accountId: string | null = null;
    let userId: string | null = null;

    if (user) {
      userId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();
      
      accountId = profile?.account_id ?? null;
    }

    const body = await req.json();
    const { event_name, event_data, page_url, session_id } = body;

    if (!event_name || typeof event_name !== "string") {
      return NextResponse.json({ error: "Campo event_name é obrigatório" }, { status: 400 });
    }

    // Inserir evento na camada própria (user_events)
    const { error } = await supabase.from("user_events").insert({
      account_id: accountId,
      user_id: userId,
      session_id: session_id || null,
      event_name,
      page_url: page_url || null,
      event_data: event_data || {},
    });

    if (error) {
      console.error("[API Events] Erro ao inserir evento:", error);
      return NextResponse.json({ error: "Falha ao registrar evento" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Events] Erro inesperado:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
