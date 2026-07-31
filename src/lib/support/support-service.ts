import type { SupabaseClient } from "@supabase/supabase-js";

export interface SupportTicket {
  id: string;
  account_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  category: "duvida" | "problema_tecnico" | "financeiro" | "sugestao" | "outro" | "chat_direto";
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  last_message_at: string;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  last_message?: string;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_type: "user" | "super_admin";
  sender_user_id: string;
  sender_name: string;
  content: string;
  attachments?: { url: string; name: string }[];
  is_read_by_user: boolean;
  is_read_by_support: boolean;
  created_at: string;
}

/**
 * Busca todos os tickets do usuário/conta com contadores de não lidas.
 */
export async function fetchUserTickets(
  supabase: SupabaseClient,
  userId: string
): Promise<SupportTicket[]> {
  try {
    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false });

    if (error || !tickets) {
      console.error("[support-service] Erro ao buscar tickets do usuário:", error);
      return [];
    }

    // Calcula mensagens não lidas para o usuário em cada ticket
    const ticketsWithUnread = await Promise.all(
      tickets.map(async (t) => {
        const { count } = await supabase
          .from("support_ticket_messages")
          .select("*", { count: "exact", head: true })
          .eq("ticket_id", t.id)
          .eq("sender_type", "super_admin")
          .eq("is_read_by_user", false);

        return {
          ...t,
          unread_count: count || 0,
        };
      })
    );

    return ticketsWithUnread;
  } catch (err) {
    console.error("[support-service] Exceção ao buscar tickets do usuário:", err);
    return [];
  }
}

/**
 * Obtém ou cria o chamado de Chat Direto em Tempo Real para o cliente.
 */
export async function getOrCreateLiveChatTicket(
  supabase: SupabaseClient,
  accountId: string,
  userId: string,
  userName: string,
  userEmail: string
): Promise<SupportTicket | null> {
  try {
    // Procura por um chat direto aberto ou recente
    const { data: existing } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .eq("category", "chat_direto")
      .in("status", ["open", "in_progress", "waiting_user"])
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    // Cria um novo chamado de Chat Direto
    const { data: created, error } = await supabase
      .from("support_tickets")
      .insert({
        account_id: accountId,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        subject: "Chat Direto com Suporte Flow Systems",
        category: "chat_direto",
        status: "open",
        priority: "medium",
      })
      .select()
      .single();

    if (error) {
      console.error("[support-service] Erro ao criar chat direto:", error);
      return null;
    }

    return created;
  } catch (err) {
    console.error("[support-service] Exceção ao criar chat direto:", err);
    return null;
  }
}

/**
 * Busca todas as mensagens de um ticket específico.
 */
export async function fetchTicketMessages(
  supabase: SupabaseClient,
  ticketId: string
): Promise<SupportTicketMessage[]> {
  try {
    const { data, error } = await supabase
      .from("support_ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error || !data) {
      console.error("[support-service] Erro ao buscar mensagens do ticket:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("[support-service] Exceção ao buscar mensagens do ticket:", err);
    return [];
  }
}

/**
 * Envia uma mensagem em um ticket ou chat de suporte.
 */
export async function sendSupportMessage(
  supabase: SupabaseClient,
  params: {
    ticketId: string;
    senderType: "user" | "super_admin";
    senderUserId: string;
    senderName: string;
    content: string;
    attachments?: { url: string; name: string }[];
  }
): Promise<SupportTicketMessage | null> {
  try {
    const { data: message, error } = await supabase
      .from("support_ticket_messages")
      .insert({
        ticket_id: params.ticketId,
        sender_type: params.senderType,
        sender_user_id: params.senderUserId,
        sender_name: params.senderName,
        content: params.content,
        attachments: params.attachments || [],
        is_read_by_user: params.senderType === "user",
        is_read_by_support: params.senderType === "super_admin",
      })
      .select()
      .single();

    if (error || !message) {
      console.error("[support-service] Erro ao enviar mensagem:", error);
      return null;
    }

    // Atualiza last_message_at e status no ticket pai
    const newStatus = params.senderType === "user" ? "open" : "waiting_user";
    await supabase
      .from("support_tickets")
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: newStatus,
      })
      .eq("id", params.ticketId);

    return message;
  } catch (err) {
    console.error("[support-service] Exceção ao enviar mensagem:", err);
    return null;
  }
}

/**
 * Cria um novo ticket estruturado.
 */
export async function createSupportTicket(
  supabase: SupabaseClient,
  params: {
    accountId: string;
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    category: SupportTicket["category"];
    priority: SupportTicket["priority"];
    initialMessage: string;
  }
): Promise<SupportTicket | null> {
  try {
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        account_id: params.accountId,
        user_id: params.userId,
        user_name: params.userName,
        user_email: params.userEmail,
        subject: params.subject,
        category: params.category,
        priority: params.priority,
        status: "open",
      })
      .select()
      .single();

    if (error || !ticket) {
      console.error("[support-service] Erro ao criar ticket:", error);
      return null;
    }

    // Insere a mensagem inicial
    await sendSupportMessage(supabase, {
      ticketId: ticket.id,
      senderType: "user",
      senderUserId: params.userId,
      senderName: params.userName,
      content: params.initialMessage,
    });

    return ticket;
  } catch (err) {
    console.error("[support-service] Exceção ao criar ticket:", err);
    return null;
  }
}

/**
 * Marca mensagens do ticket como lidas pelo usuário cliente.
 */
export async function markMessagesAsReadByUser(
  supabase: SupabaseClient,
  ticketId: string
): Promise<void> {
  try {
    await supabase
      .from("support_ticket_messages")
      .update({ is_read_by_user: true })
      .eq("ticket_id", ticketId)
      .eq("sender_type", "super_admin")
      .eq("is_read_by_user", false);
  } catch (err) {
    console.error("[support-service] Erro ao marcar mensagens como lidas pelo usuário:", err);
  }
}

/**
 * Marca mensagens do ticket como lidas pela equipe de suporte (Super Admin).
 */
export async function markMessagesAsReadBySupport(
  supabase: SupabaseClient,
  ticketId: string
): Promise<void> {
  try {
    await supabase
      .from("support_ticket_messages")
      .update({ is_read_by_support: true })
      .eq("ticket_id", ticketId)
      .eq("sender_type", "user")
      .eq("is_read_by_support", false);
  } catch (err) {
    console.error("[support-service] Erro ao marcar mensagens como lidas pelo suporte:", err);
  }
}

/**
 * (Super Admin) Busca todos os tickets de suporte recebidos de todas as contas da plataforma.
 */
export async function fetchAllTicketsForSuperAdmin(
  supabase: SupabaseClient
): Promise<SupportTicket[]> {
  try {
    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (error || !tickets) {
      console.error("[support-service] Erro ao buscar tickets para Super Admin:", error);
      return [];
    }

    const ticketsWithUnread = await Promise.all(
      tickets.map(async (t) => {
        const { count } = await supabase
          .from("support_ticket_messages")
          .select("*", { count: "exact", head: true })
          .eq("ticket_id", t.id)
          .eq("sender_type", "user")
          .eq("is_read_by_support", false);

        // Busca última mensagem
        const { data: lastMsg } = await supabase
          .from("support_ticket_messages")
          .select("content")
          .eq("ticket_id", t.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...t,
          unread_count: count || 0,
          last_message: lastMsg?.content || "",
        };
      })
    );

    return ticketsWithUnread;
  } catch (err) {
    console.error("[support-service] Exceção ao buscar tickets para Super Admin:", err);
    return [];
  }
}

/**
 * (Super Admin) Atualiza o status de um ticket.
 */
export async function updateSupportTicketStatus(
  supabase: SupabaseClient,
  ticketId: string,
  status: SupportTicket["status"]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (error) {
      console.error("[support-service] Erro ao atualizar status do ticket:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[support-service] Exceção ao atualizar status do ticket:", err);
    return false;
  }
}
