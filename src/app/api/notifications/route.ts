import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json([]);
    }

    // Attach actor profiles if present
    const actorUserIds = [
      ...new Set(notifications.map((n) => n.actor_id).filter(Boolean)),
    ];

    if (actorUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, avatar_url")
        .in("user_id", actorUserIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p]),
      );

      const enriched = notifications.map((n) => ({
        ...n,
        actor_profile: n.actor_id ? profileMap.get(n.actor_id) || null : null,
      }));

      return NextResponse.json(enriched);
    }

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
