import { describe, it, expect, vi } from "vitest";
import {
  fetchUserTickets,
  getOrCreateLiveChatTicket,
  sendSupportMessage,
} from "./support-service";

describe("support-service", () => {
  it("fetches user tickets and calculates unread count", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "support_tickets") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "t1",
                  subject: "Dúvida teste",
                  category: "duvida",
                  status: "open",
                  last_message_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
          };
        }
        if (table === "support_ticket_messages") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: (cb: any) => cb({ count: 2, error: null }),
          };
        }
        return {};
      }),
    } as any;

    const tickets = await fetchUserTickets(mockSupabase, "u1");
    expect(tickets).toHaveLength(1);
    expect(tickets[0].subject).toBe("Dúvida teste");
    expect(tickets[0].unread_count).toBe(2);
  });

  it("handles empty results gracefully", async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    } as any;

    const tickets = await fetchUserTickets(mockSupabase, "u2");
    expect(tickets).toEqual([]);
  });
});
