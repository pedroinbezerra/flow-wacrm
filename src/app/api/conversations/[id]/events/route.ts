import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processCollaborativeEvent } from "@/lib/collaborative/event-engine";
import type { CollaborativeEvent } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id, full_name")
      .eq("user_id", user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.json({ error: "Perfil sem conta vinculada" }, { status: 403 });
    }

    const body = await request.json();
    const eventType = body.type;
    const payload = body.payload || {};

    const event: CollaborativeEvent = {
      type: eventType,
      context: {
        account_id: profile.account_id,
        conversation_id: conversationId,
        actor_id: user.id,
        actor_name: profile.full_name || "Colaborador",
      },
      payload: payload,
    };

    const result = await processCollaborativeEvent(supabase, event);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Falha ao processar evento" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/conversations/[id]/events error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
