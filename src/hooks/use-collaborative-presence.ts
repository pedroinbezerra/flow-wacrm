"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type {
  ParticipantPresenceState,
  ParticipantActivityState,
  ResponseReservationState,
  InternalNote,
  ConversationTimelineEvent,
  ConversationParticipant,
} from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseCollaborativePresenceOptions {
  conversationId: string | null;
  enabled?: boolean;
  onNoteInserted?: (note: InternalNote) => void;
  onNoteUpdated?: (note: InternalNote) => void;
  onNoteDeleted?: (noteId: string) => void;
  onTimelineEventInserted?: (event: ConversationTimelineEvent) => void;
  onParticipantsChanged?: () => void;
}

export function useCollaborativePresence({
  conversationId,
  enabled = true,
  onNoteInserted,
  onNoteUpdated,
  onNoteDeleted,
  onTimelineEventInserted,
  onParticipantsChanged,
}: UseCollaborativePresenceOptions) {
  const { user, profile } = useAuth();
  const [activeParticipants, setActiveParticipants] = useState<ParticipantPresenceState[]>([]);
  const [reservationState, setReservationState] = useState<ResponseReservationState>({
    is_reserved: false,
  });
  const [currentActivity, setCurrentActivity] = useState<ParticipantActivityState>("viewing");

  const channelRef = useRef<RealtimeChannel | null>(null);

  const onNoteInsertedRef = useRef(onNoteInserted);
  const onNoteUpdatedRef = useRef(onNoteUpdated);
  const onNoteDeletedRef = useRef(onNoteDeleted);
  const onTimelineRef = useRef(onTimelineEventInserted);
  const onPartRef = useRef(onParticipantsChanged);

  useEffect(() => {
    onNoteInsertedRef.current = onNoteInserted;
    onNoteUpdatedRef.current = onNoteUpdated;
    onNoteDeletedRef.current = onNoteDeleted;
    onTimelineRef.current = onTimelineEventInserted;
    onPartRef.current = onParticipantsChanged;
  }, [onNoteInserted, onNoteUpdated, onNoteDeleted, onTimelineEventInserted, onParticipantsChanged]);

  // Track activity updates to broadcast via Presence
  const updateActivity = useCallback(
    (activity: ParticipantActivityState) => {
      setCurrentActivity(activity);
      if (channelRef.current && user && profile) {
        channelRef.current.track({
          user_id: user.id,
          full_name: profile.full_name || "Colaborador",
          avatar_url: profile.avatar_url,
          activity: activity,
          last_active_at: new Date().toISOString(),
        });
      }
    },
    [user, profile]
  );

  useEffect(() => {
    if (!enabled || !conversationId || !user?.id || !profile) return;

    const supabase = createClient();
    const channelName = `presence:conversation:${conversationId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // 1. Presence state tracking
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<ParticipantPresenceState>();
      const presences: ParticipantPresenceState[] = [];

      Object.values(state).forEach((userPresences) => {
        userPresences.forEach((p) => {
          presences.push(p);
        });
      });

      setActiveParticipants(presences);
    });

    // 2. Broadcast listeners for locks & reservation
    channel.on("broadcast", { event: "response_reservation_acquired" }, (payload) => {
      if (payload.payload) {
        setReservationState({
          is_reserved: true,
          reserved_by_user_id: payload.payload.user_id,
          reserved_by_name: payload.payload.user_name,
        });
      }
    });

    channel.on("broadcast", { event: "response_reservation_released" }, () => {
      setReservationState({ is_reserved: false });
    });

    // 3. Postgres changes subscription for notes & timeline
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "internal_notes", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          onNoteInsertedRef.current?.(payload.new as InternalNote);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "internal_notes", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const updated = payload.new as InternalNote;
          if (updated.deleted_at) {
            onNoteDeletedRef.current?.(updated.id);
          } else {
            onNoteUpdatedRef.current?.(updated);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversation_timeline_events", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          onTimelineRef.current?.(payload.new as ConversationTimelineEvent);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_participants", filter: `conversation_id=eq.${conversationId}` },
        () => {
          onPartRef.current?.();
        }
      );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({
          user_id: user.id,
          full_name: profile.full_name || "Colaborador",
          avatar_url: profile.avatar_url,
          activity: "viewing",
          last_active_at: new Date().toISOString(),
        });
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, enabled, user, profile]);

  return {
    activeParticipants,
    reservationState,
    currentActivity,
    updateActivity,
  };
}
