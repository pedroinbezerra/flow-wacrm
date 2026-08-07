import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processCollaborativeEvent } from "@/lib/collaborative/event-engine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id, full_name")
      .eq("user_id", user.id)
      .single();

    if (!profile?.account_id) return NextResponse.json({ error: "Perfil sem conta" }, { status: 403 });

    const body = await request.json();

    const result = await processCollaborativeEvent(supabase, {
      type: "help_requested",
      context: {
        account_id: profile.account_id,
        conversation_id: conversationId,
        actor_id: user.id,
        actor_name: profile.full_name,
      },
      payload: {
        target_sector: body.target_sector,
        target_user_id: body.target_user_id,
        note: body.note,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
