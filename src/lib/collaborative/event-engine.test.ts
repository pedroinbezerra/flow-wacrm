import { describe, it, expect, vi } from "vitest";
import { processCollaborativeEvent } from "./event-engine";
import type { CollaborativeEvent } from "@/types";

describe("Collaborative Event Engine (event-engine.ts)", () => {
  it("rejects event missing context fields", async () => {
    const mockSupabase = {} as any;
    const invalidEvent = {
      type: "internal_note_created",
      context: { account_id: "", conversation_id: "conv-1", actor_id: "user-1" },
      payload: { content: "teste" },
    } as CollaborativeEvent;

    const result = await processCollaborativeEvent(mockSupabase, invalidEvent);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Missing account_id");
  });

  it("orchestrates valid event and calls handlers", async () => {
    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "conversations") {
          return {
            select: () => ({
              eq: () => ({
                single: async () => ({
                  data: { id: "conv-123", account_id: "acc-123" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "internal_notes") {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({
                  data: { id: "note-999" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "conversation_timeline_events") {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({
                  data: { id: "timeline-111" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "notifications") {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({
                  data: { id: "notif-222" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "profiles") {
          return {
            select: () => ({
              eq: async () => ({
                data: [{ user_id: "user-dani", full_name: "Dani Silva" }],
              }),
            }),
          };
        }
        return {
          insert: () => ({ select: () => ({ single: async () => ({ data: { id: "1" }, error: null }) }) }),
        };
      }),
    } as any;

    const noteEvent: CollaborativeEvent = {
      type: "internal_note_created",
      context: {
        account_id: "acc-123",
        conversation_id: "conv-123",
        actor_id: "user-pedro",
        actor_name: "Pedro",
      },
      payload: {
        note_id: "temp-1",
        content: "Olá @Dani favor verificar o pagamento.",
        mentions: ["Dani"],
      },
    };

    const result = await processCollaborativeEvent(mockSupabase, noteEvent);
    expect(result.success).toBe(true);
    expect(result.persisted_ids?.note_id).toBe("note-999");
    expect(result.persisted_ids?.timeline_event_id).toBe("timeline-111");
  });

  it("orchestrates help_requested event with sector targeting", async () => {
    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "conversations") {
          return {
            select: () => ({
              eq: () => ({
                single: async () => ({
                  data: { id: "conv-123", account_id: "acc-123" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "conversation_timeline_events") {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({
                  data: { id: "timeline-help-1" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "notifications") {
          return {
            insert: () => ({
              select: () => ({
                single: async () => ({
                  data: { id: "notif-help-sector" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "profiles") {
          return {
            select: () => ({
              eq: () => ({
                eq: async () => ({
                  data: [{ user_id: "user-finance-1" }],
                }),
              }),
            }),
          };
        }
        return {
          insert: () => ({ select: () => ({ single: async () => ({ data: { id: "1" }, error: null }) }) }),
        };
      }),
    } as any;

    const helpEvent: CollaborativeEvent = {
      type: "help_requested",
      context: {
        account_id: "acc-123",
        conversation_id: "conv-123",
        actor_id: "user-pedro",
        actor_name: "Pedro",
      },
      payload: {
        target_sector: "finance",
        note: "Verificar fatura aberta.",
      },
    };

    const result = await processCollaborativeEvent(mockSupabase, helpEvent);
    expect(result.success).toBe(true);
    expect(result.persisted_ids?.timeline_event_id).toBe("timeline-help-1");
    expect(result.persisted_ids?.notification_ids?.length).toBeGreaterThan(0);
  });
});
