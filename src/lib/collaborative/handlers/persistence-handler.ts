import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollaborativeEvent, CollaborativeEventResult } from "@/types";

export interface PersistenceResult {
  note_id?: string;
  participant_id?: string;
  reaction_id?: string;
  tag_id?: string;
  reservation_id?: string;
}

export async function handlePersistence(
  supabase: SupabaseClient,
  event: CollaborativeEvent
): Promise<PersistenceResult> {
  const { type, context, payload } = event;
  const result: PersistenceResult = {};

  switch (type) {
    case "internal_note_created": {
      const p = payload as { note_id?: string; content: string };
      const { data, error } = await supabase
        .from("internal_notes")
        .insert({
          account_id: context.account_id,
          conversation_id: context.conversation_id,
          author_id: context.actor_id,
          content: p.content,
        })
        .select("id")
        .single();

      if (error) throw new Error(`Persistence error (internal_note_created): ${error.message}`);
      result.note_id = data.id;
      break;
    }

    case "participant_added": {
      const p = payload as { target_user_id: string; role?: string };
      const { data, error } = await supabase
        .from("conversation_participants")
        .upsert(
          {
            account_id: context.account_id,
            conversation_id: context.conversation_id,
            user_id: p.target_user_id,
            role: p.role || "participant",
          },
          { onConflict: "conversation_id,user_id" }
        )
        .select("id")
        .single();

      if (error) throw new Error(`Persistence error (participant_added): ${error.message}`);
      result.participant_id = data.id;
      break;
    }

    case "participant_removed": {
      const p = payload as { target_user_id: string };
      const { error } = await supabase
        .from("conversation_participants")
        .delete()
        .eq("conversation_id", context.conversation_id)
        .eq("user_id", p.target_user_id);

      if (error) throw new Error(`Persistence error (participant_removed): ${error.message}`);
      break;
    }

    case "owner_changed": {
      const p = payload as { new_owner_id: string };
      const { error } = await supabase
        .from("conversations")
        .update({ assigned_agent_id: p.new_owner_id, updated_at: new Date().toISOString() })
        .eq("id", context.conversation_id);

      if (error) throw new Error(`Persistence error (owner_changed): ${error.message}`);

      // Ensure new owner is in conversation_participants as 'owner'
      await supabase
        .from("conversation_participants")
        .upsert(
          {
            account_id: context.account_id,
            conversation_id: context.conversation_id,
            user_id: p.new_owner_id,
            role: "owner",
          },
          { onConflict: "conversation_id,user_id" }
        );
      break;
    }

    case "reaction_added": {
      const p = payload as { target_type: "message" | "note"; target_id: string; emoji: string };
      const { data, error } = await supabase
        .from("internal_reactions")
        .upsert(
          {
            account_id: context.account_id,
            conversation_id: context.conversation_id,
            target_type: p.target_type,
            target_id: p.target_id,
            user_id: context.actor_id,
            emoji: p.emoji,
          },
          { onConflict: "target_type,target_id,user_id,emoji" }
        )
        .select("id")
        .single();

      if (error) throw new Error(`Persistence error (reaction_added): ${error.message}`);
      result.reaction_id = data.id;
      break;
    }

    case "reaction_removed": {
      const p = payload as { target_type: "message" | "note"; target_id: string; emoji: string };
      const { error } = await supabase
        .from("internal_reactions")
        .delete()
        .eq("target_type", p.target_type)
        .eq("target_id", p.target_id)
        .eq("user_id", context.actor_id)
        .eq("emoji", p.emoji);

      if (error) throw new Error(`Persistence error (reaction_removed): ${error.message}`);
      break;
    }

    case "message_tagged": {
      const p = payload as { message_id: string; tag: string };
      const { data, error } = await supabase
        .from("message_tags")
        .upsert(
          {
            account_id: context.account_id,
            conversation_id: context.conversation_id,
            message_id: p.message_id,
            user_id: context.actor_id,
            tag: p.tag,
          },
          { onConflict: "message_id,tag" }
        )
        .select("id")
        .single();

      if (error) throw new Error(`Persistence error (message_tagged): ${error.message}`);
      result.tag_id = data.id;
      break;
    }

    case "message_untagged": {
      const p = payload as { message_id: string; tag: string };
      const { error } = await supabase
        .from("message_tags")
        .delete()
        .eq("message_id", p.message_id)
        .eq("tag", p.tag);

      if (error) throw new Error(`Persistence error (message_untagged): ${error.message}`);
      break;
    }

    case "response_reservation_created": {
      const p = payload as { duration_seconds?: number };
      const duration = p.duration_seconds || 60;
      const expiresAt = new Date(Date.now() + duration * 1000).toISOString();

      const { data, error } = await supabase
        .from("response_reservations")
        .upsert(
          {
            account_id: context.account_id,
            conversation_id: context.conversation_id,
            user_id: context.actor_id,
            expires_at: expiresAt,
          },
          { onConflict: "conversation_id,user_id" }
        )
        .select("id")
        .single();

      if (error) throw new Error(`Persistence error (response_reservation_created): ${error.message}`);
      result.reservation_id = data.id;
      break;
    }

    case "response_reservation_released": {
      const { error } = await supabase
        .from("response_reservations")
        .delete()
        .eq("conversation_id", context.conversation_id)
        .eq("user_id", context.actor_id);

      if (error) throw new Error(`Persistence error (response_reservation_released): ${error.message}`);
      break;
    }

    default:
      // Other events like message_sent, collaborator_mentioned, help_requested rely on their own entities or handlers
      break;
  }

  return result;
}
