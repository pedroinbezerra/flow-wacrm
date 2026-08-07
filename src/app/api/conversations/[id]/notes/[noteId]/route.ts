import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processCollaborativeEvent } from "@/lib/collaborative/event-engine";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: conversationId, noteId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: note, error: noteError } = await supabase
      .from("internal_notes")
      .select("*")
      .eq("id", noteId)
      .eq("conversation_id", conversationId)
      .maybeSingle();

    if (noteError || !note || note.deleted_at) {
      return NextResponse.json({ error: "Nota interna não encontrada" }, { status: 404 });
    }

    if (note.author_id !== user.id) {
      return NextResponse.json(
        { error: "Apenas o autor pode editar esta nota" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const content = body.content;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "O conteúdo da nota não pode ser vazio" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { data: updatedNote, error: updateError } = await supabase
      .from("internal_notes")
      .update({
        content: content.trim(),
        updated_at: now,
      })
      .eq("id", noteId)
      .select("*")
      .single();

    if (updateError || !updatedNote) {
      return NextResponse.json({ error: updateError?.message || "Falha ao atualizar nota" }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id, user_id, full_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.account_id) {
      await processCollaborativeEvent(supabase, {
        type: "internal_note_updated",
        context: {
          account_id: profile.account_id,
          conversation_id: conversationId,
          actor_id: user.id,
          actor_name: profile.full_name,
        },
        payload: {
          note_id: noteId,
          previous_content: note.content,
          new_content: content.trim(),
        },
      });
    }

    return NextResponse.json({
      ...updatedNote,
      author_profile: profile || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: conversationId, noteId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: note, error: noteError } = await supabase
      .from("internal_notes")
      .select("*")
      .eq("id", noteId)
      .eq("conversation_id", conversationId)
      .maybeSingle();

    if (noteError || !note || note.deleted_at) {
      return NextResponse.json({ error: "Nota interna não encontrada" }, { status: 404 });
    }

    if (note.author_id !== user.id) {
      return NextResponse.json(
        { error: "Apenas o autor pode excluir esta nota" },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    const { error: deleteError } = await supabase
      .from("internal_notes")
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq("id", noteId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id, full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.account_id) {
      await processCollaborativeEvent(supabase, {
        type: "internal_note_deleted",
        context: {
          account_id: profile.account_id,
          conversation_id: conversationId,
          actor_id: user.id,
          actor_name: profile.full_name,
        },
        payload: {
          note_id: noteId,
          deleted_content: note.content,
        },
      });
    }

    return NextResponse.json({ success: true, id: noteId });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
