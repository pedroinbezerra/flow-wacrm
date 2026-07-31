"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  fetchAllTicketsForSuperAdmin,
  fetchTicketMessages,
  sendSupportMessage,
  updateSupportTicketStatus,
  markMessagesAsReadBySupport,
  SupportTicket,
  SupportTicketMessage,
} from "@/lib/support/support-service";
import {
  Headphones,
  Search,
  Send,
  MessageSquare,
  Ticket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  ShieldCheck,
  Filter,
  RefreshCw,
} from "lucide-react";

export function SupportAdminPanel() {
  const { user, isSuperAdmin, profileLoading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [replyInput, setReplyInput] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Carrega tickets de clientes
  const loadTickets = useCallback(async () => {
    if (!isSuperAdmin) return;
    const supabase = createClient();
    const data = await fetchAllTicketsForSuperAdmin(supabase);
    setTickets(data);
    setLoading(false);
  }, [isSuperAdmin]);

  // Carrega mensagens do ticket selecionado
  const loadMessages = useCallback(async (ticketId: string) => {
    const supabase = createClient();
    const msgs = await fetchTicketMessages(supabase, ticketId);
    setMessages(msgs);
    await markMessagesAsReadBySupport(supabase, ticketId);
  }, []);

  // Sync / Polling
  useEffect(() => {
    if (profileLoading || !isSuperAdmin) return;
    void loadTickets();

    const interval = setInterval(() => {
      void loadTickets();
      if (selectedTicket) {
        void loadMessages(selectedTicket.id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [profileLoading, isSuperAdmin, loadTickets, loadMessages, selectedTicket]);

  useEffect(() => {
    if (selectedTicket) {
      void loadMessages(selectedTicket.id);
    }
  }, [selectedTicket, loadMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enviar resposta como Super Admin
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedTicket || !user?.id || sendingReply) return;

    setSendingReply(true);
    const content = replyInput.trim();
    setReplyInput("");

    const supabase = createClient();
    const sent = await sendSupportMessage(supabase, {
      ticketId: selectedTicket.id,
      senderType: "super_admin",
      senderUserId: user.id,
      senderName: "Suporte Flow Systems",
      content,
    });

    setSendingReply(false);

    if (sent) {
      setMessages((prev) => [...prev, sent]);
      toast.success("Resposta enviada ao cliente!");
      void loadTickets();
    } else {
      toast.error("Erro ao enviar resposta.");
    }
  };

  // Alterar status do chamado
  const handleStatusChange = async (newStatus: SupportTicket["status"]) => {
    if (!selectedTicket) return;
    const supabase = createClient();
    const ok = await updateSupportTicketStatus(supabase, selectedTicket.id, newStatus);
    if (ok) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success(`Status atualizado para "${newStatus}"`);
      void loadTickets();
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="size-12 text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-foreground">Acesso Restrito a Super Admins</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apenas mantenedores com perfil Super Admin têm permissão para acessar a Central de Atendimento aos Clientes.
        </p>
      </div>
    );
  }

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Headphones className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Central de Atendimento ao Cliente</h1>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receba chamados e responda as mensagens dos clientes do Flow Hub em tempo real.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadTickets()}
          className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition-all"
        >
          <RefreshCw className="size-3.5" />
          Atualizar Lista
        </button>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[680px]">
        {/* Left Column: Ticket List */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          {/* Filters */}
          <div className="p-3 border-b border-border space-y-2 bg-muted/20">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, e-mail ou assunto..."
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
              {["all", "open", "in_progress", "waiting_user", "resolved"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                  }`}
                >
                  {st === "all" ? "Todos" : st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Carregando chamados...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Nenhum chamado encontrado com os filtros selecionados.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                const hasUnread = (ticket.unread_count || 0) > 0;

                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className={`flex w-full flex-col p-3.5 text-left transition-all hover:bg-muted/40 ${
                      isSelected ? "bg-primary/10 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground truncate max-w-[220px]">
                        {ticket.subject}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          ticket.status === "open"
                            ? "bg-rose-500/10 text-rose-600"
                            : ticket.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                      <span className="font-medium text-foreground/80 flex items-center gap-1">
                        <User className="size-3" />
                        {ticket.user_name}
                      </span>
                      <span>
                        {new Date(ticket.last_message_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {ticket.last_message && (
                      <p className="text-[11px] text-muted-foreground/80 truncate mt-1">
                        {ticket.last_message}
                      </p>
                    )}

                    {hasUnread && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full self-start">
                        {ticket.unread_count} nova(s) mensagem(ns) do cliente
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat & Ticket Details */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          {selectedTicket ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Header do Chat Selecionado */}
              <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/20 p-4 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{selectedTicket.subject}</h3>
                  <p className="text-xs text-muted-foreground">
                    Cliente: {selectedTicket.user_name} ({selectedTicket.user_email})
                  </p>
                </div>

                {/* Seletor de Status do Ticket */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => void handleStatusChange(e.target.value as any)}
                    className="rounded-lg border border-border bg-background p-1.5 text-xs text-foreground font-semibold focus:border-primary focus:outline-none"
                  >
                    <option value="open">Aberto</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="waiting_user">Aguardando Cliente</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>
              </div>

              {/* Lista de Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
                {messages.map((msg) => {
                  const isStaff = msg.sender_type === "super_admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                          isStaff
                            ? "bg-primary text-primary-foreground rounded-tr-xs"
                            : "bg-card border border-border text-foreground rounded-tl-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/10 pb-1">
                          <span className="font-bold text-[11px]">
                            {isStaff ? "Equipe Flow Systems (Você)" : msg.sender_name}
                          </span>
                          <span className="text-[10px] opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Input de Resposta Super Admin */}
              <form onSubmit={handleSendReply} className="border-t border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Digite a resposta do suporte para o cliente..."
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!replyInput.trim() || sendingReply}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="size-4" />
                    Responder
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MessageSquare className="size-12 mb-3 opacity-40 text-primary" />
              <h3 className="text-base font-bold text-foreground">Selecione um chamado ao lado</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Escolha um chamado da lista para visualizar a conversa completa e responder o cliente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
