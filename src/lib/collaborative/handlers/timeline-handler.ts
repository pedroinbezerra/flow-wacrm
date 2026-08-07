import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollaborativeEvent } from "@/types";

export interface TimelineResult {
  timeline_event_id?: string;
}

export async function handleTimeline(
  supabase: SupabaseClient,
  event: CollaborativeEvent
): Promise<TimelineResult> {
  const { type, context, payload } = event;
  const actorName = context.actor_name || "Colaborador";

  let eventType = type;
  let metadata: Record<string, unknown> = { actor_name: actorName, ...payload };

  // Skip timeline logging for purely transient activities if needed, but per spec:
  // "participante entrou, participante saiu, responsável alterado, nota criada, ajuda solicitada, menção realizada, resposta enviada"
  const loggableEvents = [
    "message_sent",
    "internal_note_created",
    "collaborator_mentioned",
    "participant_added",
    "participant_removed",
    "owner_changed",
    "help_requested",
    "reaction_added",
    "message_tagged",
  ];

  if (!loggableEvents.includes(type)) {
    return {};
  }

  const { data, error } = await supabase
    .from("conversation_timeline_events")
    .insert({
      account_id: context.account_id,
      conversation_id: context.conversation_id,
      author_id: context.actor_id,
      event_type: eventType,
      metadata: metadata,
    })
    .select("id")
    .single();

  if (error) {
    console.error(`TimelineHandler error for ${type}:`, error);
    return {};
  }

  return { timeline_event_id: data.id };
}
