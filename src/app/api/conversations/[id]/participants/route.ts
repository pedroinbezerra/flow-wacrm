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

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: participants, error } = await supabase
      .from("conversation_participants")
      .select("*")
      .eq("conversation_id", conversationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json([]);
    }

    const userIds = participants.map((p) => p.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, account_role")
      .in("user_id", userIds);

    const profilesMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const enriched = participants.map((p) => ({
      ...p,
      profile: profilesMap.get(p.user_id) || null,
    }));

    return NextResponse.json(enriched);
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
    const targetUserId = body.target_user_id;
    const role = body.role || "participant";

    if (!targetUserId) {
      return NextResponse.json({ error: "target_user_id obrigatório" }, { status: 400 });
    }

    // Fetch target user profile for display name in timeline
    const { data: targetProf } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", targetUserId)
      .maybeSingle();

    const targetUserName = targetProf?.full_name ?? targetProf?.email ?? targetUserId;

    const result = await processCollaborativeEvent(supabase, {
      type: "participant_added",
      context: {
        account_id: profile.account_id,
        conversation_id: conversationId,
        actor_id: user.id,
        actor_name: profile.full_name,
      },
      payload: { target_user_id: targetUserId, target_user_name: targetUserName, role },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("target_user_id");

    if (!targetUserId) {
      return NextResponse.json({ error: "target_user_id obrigatório" }, { status: 400 });
    }

    const { data: targetProf } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", targetUserId)
      .maybeSingle();

    const targetUserName = targetProf?.full_name ?? targetProf?.email ?? targetUserId;

    const result = await processCollaborativeEvent(supabase, {
      type: "participant_removed",
      context: {
        account_id: profile.account_id,
        conversation_id: conversationId,
        actor_id: user.id,
        actor_name: profile.full_name,
      },
      payload: { target_user_id: targetUserId, target_user_name: targetUserName },
    });


    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
