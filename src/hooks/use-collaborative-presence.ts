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
  onTimelineEventInserted?: (event: ConversationTimelineEvent) => void;
  onParticipantsChanged?: () => void;
}

export function useCollaborativePresence({
  conversationId,
  enabled = true,
  onNoteInserted,
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

  const onNoteRef = useRef(onNoteInserted);
  const onTimelineRef = useRef(onTimelineEventInserted);
  const onPartRef = useRef(onParticipantsChanged);

  useEffect(() => {
    onNoteRef.current = onNoteInserted;
    onTimelineRef.current = onTimelineEventInserted;
    onPartRef.current = onParticipantsChanged;
  });

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
    if (!enabled || !conversationId || !user || !profile) return;

    const supabase = createClient();
    const channelName = `conversation:${conversationId}`;

    const channel = supabase.channel(channelName, {
      config: { presence: { key: user.id } },
    });

    // 1. Presence synchronization
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<ParticipantPresenceState>();
        const presenceList: ParticipantPresenceState[] = [];

        Object.values(state).forEach((presences) => {
          presences.forEach((p) => {
            presenceList.push(p);
          });
        });

        setActiveParticipants(presenceList);

        // Check if someone else is preparing a response
        const preparing = presenceList.find(
          (p) => p.user_id !== user.id && p.activity === "preparing_response"
        );

        if (preparing) {
          setReservationState({
            is_reserved: true,
            reserved_by_user_id: preparing.user_id,
            reserved_by_name: preparing.full_name,
          });
        } else {
          setReservationState({ is_reserved: false });
        }
      })
      .on("presence", { event: "join" }, () => {
        onPartRef.current?.();
      })
      .on("presence", { event: "leave" }, () => {
        onPartRef.current?.();
      });

    // 2. Broadcast listeners
    channel.on("broadcast", { event: "response_reservation_created" }, (payload) => {
      if (payload.payload?.actor_id !== user.id) {
        setReservationState({
          is_reserved: true,
          reserved_by_user_id: payload.payload?.actor_id,
          reserved_by_name: payload.payload?.actor_name,
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
          onNoteRef.current?.(payload.new as InternalNote);
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
