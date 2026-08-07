import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processCollaborativeEvent } from "@/lib/collaborative/event-engine";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: notes, error } = await supabase
      .from("internal_notes")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!notes || notes.length === 0) return NextResponse.json([]);

    const authorIds = [...new Set(notes.map((n) => n.author_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", authorIds);

    const profilesMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const noteIds = notes.map((n) => n.id);
    const { data: reactions } = await supabase
      .from("internal_reactions")
      .select("*")
      .eq("target_type", "note")
      .in("target_id", noteIds);

    const reactionsMap = new Map<string, any[]>();
    (reactions || []).forEach((r) => {
      const list = reactionsMap.get(r.target_id) || [];
      list.push(r);
      reactionsMap.set(r.target_id, list);
    });

    const enrichedNotes = notes.map((note) => ({
      ...note,
      author_profile: profilesMap.get(note.author_id) || null,
      reactions: reactionsMap.get(note.id) || [],
    }));

    return NextResponse.json(enrichedNotes);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}


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
    const content = body.content;
    const mentions = body.mentions || [];

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Conteúdo da nota é obrigatório" }, { status: 400 });
    }

    const result = await processCollaborativeEvent(supabase, {
      type: "internal_note_created",
      context: {
        account_id: profile.account_id,
        conversation_id: conversationId,
        actor_id: user.id,
        actor_name: profile.full_name,
      },
      payload: { content, mentions },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
