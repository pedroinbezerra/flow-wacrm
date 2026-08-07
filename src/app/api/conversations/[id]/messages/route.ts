import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.account_id) {
      return NextResponse.json({ error: "Perfil sem conta" }, { status: 403 });
    }

    // Verify conversation belongs to caller's account
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("id, account_id, last_message_text")
      .eq("id", conversationId)
      .maybeSingle();

    if (convError || !conv || conv.account_id !== profile.account_id) {
      return NextResponse.json(
        { error: "Conversa não encontrada ou acesso negado" },
        { status: 404 }
      );
    }

    // Fetch messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("[API Messages GET] Error fetching messages:", messagesError);
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    const messageList = messages || [];

    // If messages table is empty for this conversation but last_message_text was populated (orphan preview),
    // clear the orphan preview on conversations table so list & board previews align.
    let clearedOrphanPreview = false;
    if (messageList.length === 0 && conv.last_message_text) {
      await supabase
        .from("conversations")
        .update({
          last_message_text: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      clearedOrphanPreview = true;
    }

    return NextResponse.json({
      messages: messageList,
      clearedOrphanPreview,
    });
  } catch (error: any) {
    console.error("[API Messages GET] Exception:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar mensagens" },
      { status: 500 }
    );
  }
}
