import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollaborativeEvent, CollaborativeEventResult } from "@/types";
import { handlePersistence } from "./handlers/persistence-handler";
import { handleTimeline } from "./handlers/timeline-handler";
import { handleNotifications } from "./handlers/notification-handler";
import { handleRealtime } from "./handlers/realtime-handler";
import { handleAudit } from "./handlers/audit-handler";

/**
 * Collaborative Event Engine (Motor de Eventos Colaborativos)
 *
 * Pure orchestrator of collaborative events across FlowHub support inbox.
 * Validates context, applies business rules, and coordinates independent
 * execution handlers (Persistence, Timeline, Notification, Realtime, Audit).
 */
export async function processCollaborativeEvent(
  supabase: SupabaseClient,
  event: CollaborativeEvent
): Promise<CollaborativeEventResult> {
  try {
    // 1. Validation & Context Verification
    if (!event.context?.account_id) {
      return { success: false, event_type: event.type, error: "Missing account_id in context" };
    }
    if (!event.context?.conversation_id) {
      return { success: false, event_type: event.type, error: "Missing conversation_id in context" };
    }
    if (!event.context?.actor_id) {
      return { success: false, event_type: event.type, error: "Missing actor_id in context" };
    }

    // 2. Business Rules Evaluation
    // Ensure conversation exists and caller has access
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .select("id, account_id")
      .eq("id", event.context.conversation_id)
      .single();

    if (convErr || !conv || conv.account_id !== event.context.account_id) {
      return {
        success: false,
        event_type: event.type,
        error: "Conversation not found or account mismatch",
      };
    }

    // 3. Handlers Execution Pipeline (strictly independent handlers)
    const persistedResult = await handlePersistence(supabase, event);
    const timelineResult = await handleTimeline(supabase, event);
    const notificationResult = await handleNotifications(supabase, event);
    await handleRealtime(supabase, event);
    await handleAudit(supabase, event);

    // 4. Consolidate Result
    return {
      success: true,
      event_type: event.type,
      persisted_ids: {
        note_id: persistedResult.note_id,
        participant_id: persistedResult.participant_id,
        reaction_id: persistedResult.reaction_id,
        tag_id: persistedResult.tag_id,
        reservation_id: persistedResult.reservation_id,
        timeline_event_id: timelineResult.timeline_event_id,
        notification_ids: notificationResult.notification_ids,
      },
    };
  } catch (err: any) {
    console.error(`[CollaborativeEventEngine Error - ${event.type}]:`, err);
    return {
      success: false,
      event_type: event.type,
      error: err.message || "Internal collaborative engine error",
    };
  }
}
