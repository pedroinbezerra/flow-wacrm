import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: rawEvents, error } = await supabase
      .from("conversation_timeline_events")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!rawEvents || rawEvents.length === 0) {
      return NextResponse.json([]);
    }

    // Collect all user IDs referenced across all timeline events
    const userIds = new Set<string>();
    for (const evt of rawEvents) {
      if (evt.author_id) userIds.add(evt.author_id);
      const meta = evt.metadata || {};
      if (meta.target_user_id) userIds.add(meta.target_user_id);
      if (meta.previous_owner_id) userIds.add(meta.previous_owner_id);
      if (meta.new_owner_id) userIds.add(meta.new_owner_id);
      if (meta.assigned_agent_id) userIds.add(meta.assigned_agent_id);
    }

    let profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};
    if (userIds.size > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", Array.from(userIds));

      if (profs) {
        for (const p of profs) {
          profilesMap[p.user_id] = { full_name: p.full_name, email: p.email };
        }
      }
    }

    // Enrich events with human-readable participant/user names
    const enriched = rawEvents.map((evt) => {
      const meta = evt.metadata || {};
      const authorProf = evt.author_id ? profilesMap[evt.author_id] : null;
      const targetProf = meta.target_user_id ? profilesMap[meta.target_user_id] : null;
      const prevOwnerProf = meta.previous_owner_id ? profilesMap[meta.previous_owner_id] : null;
      const newOwnerProf = meta.new_owner_id ? profilesMap[meta.new_owner_id] : null;

      const actorName = authorProf?.full_name || authorProf?.email || meta.actor_name || "Sistema";
      const targetUserName = targetProf?.full_name || targetProf?.email || meta.target_user_name || meta.target_user_id || null;
      const previousOwnerName = prevOwnerProf?.full_name || prevOwnerProf?.email || meta.previous_owner_name || null;
      const newOwnerName = newOwnerProf?.full_name || newOwnerProf?.email || meta.new_owner_name || null;

      return {
        ...evt,
        actor_name: actorName,
        target_user_name: targetUserName,
        previous_owner_name: previousOwnerName,
        new_owner_name: newOwnerName,
        metadata: meta,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

