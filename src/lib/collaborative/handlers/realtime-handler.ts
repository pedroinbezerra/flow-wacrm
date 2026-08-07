import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollaborativeEvent } from "@/types";

export interface RealtimeBroadcastInstruction {
  channelName: string;
  eventName: string;
  payload: Record<string, unknown>;
}

export async function handleRealtime(
  _supabase: SupabaseClient,
  event: CollaborativeEvent
): Promise<{ broadcast?: RealtimeBroadcastInstruction }> {
  const { type, context, payload } = event;
  const channelName = `conversation:${context.conversation_id}`;

  return {
    broadcast: {
      channelName,
      eventName: type,
      payload: {
        type,
        actor_id: context.actor_id,
        actor_name: context.actor_name,
        conversation_id: context.conversation_id,
        payload,
        timestamp: new Date().toISOString(),
      },
    },
  };
}
