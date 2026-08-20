"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  RefreshCw,
  ArrowLeft,
  Filter,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  SupportTicket["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; bgClass: string }
> = {
  open: {
    label: "Aberto",
    variant: "destructive",
    bgClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  in_progress: {
    label: "Em Andamento",
    variant: "secondary",
    bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  waiting_user: {
    label: "Aguardando Cliente",
    variant: "outline",
    bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  resolved: {
    label: "Resolvido",
    variant: "default",
    bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  closed: {
    label: "Fechado",
    variant: "outline",
    bgClass: "bg-muted text-muted-foreground border-border",
  },
};

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

  // Sync / Polling em tempo real
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
      toast.success(`Status atualizado para "${STATUS_CONFIG[newStatus]?.label ?? newStatus}"`);
      void loadTickets();
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        t.subject.toLowerCase().includes(query) ||
        t.user_name.toLowerCase().includes(query) ||
        t.user_email.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress" || t.status === "waiting_user").length,
      resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    };
  }, [tickets]);

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
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Apenas mantenedores com papel de Super Admin possuem permissão para acessar a Central de Atendimento e Suporte aos Clientes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Headphones className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Central de Suporte a Clientes
              </h1>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Atendimento em tempo real e gestão dos chamados abertos pelos assinantes Flow Hub.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadTickets()}
          className="w-full sm:w-auto h-9 gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          <span>Atualizar</span>
        </Button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total de Chamados
          </span>
          <p className="text-lg font-bold text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Abertos
          </span>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.open}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Em Atendimento
          </span>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.inProgress}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Resolvidos
          </span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolved}</p>
        </div>
      </div>

      {/* Main Workspace: Mobile Master-Detail or Desktop 2-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Ticket List (Visible on desktop OR on mobile when no ticket is selected) */}
        <div
          className={cn(
            "lg:col-span-5 flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-2xs",
            selectedTicket ? "hidden lg:flex" : "flex",
          )}
        >
          {/* Search & Status Filters */}
          <div className="p-3 border-b border-border space-y-2.5 bg-muted/20">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, e-mail ou assunto..."
                className="h-9 pl-9 text-xs bg-card"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5 [scrollbar-width:none]">
              {[
                { id: "all", label: "Todos" },
                { id: "open", label: "Abertos" },
                { id: "in_progress", label: "Em Andamento" },
                { id: "waiting_user", label: "Aguardando" },
                { id: "resolved", label: "Resolvidos" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap border",
                    statusFilter === st.id
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border-border",
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <RefreshCw className="size-4 animate-spin mx-auto mb-2 text-primary" />
                Carregando chamados...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Inbox className="size-8 mx-auto mb-2 opacity-40" />
                Nenhum chamado encontrado com os filtros selecionados.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                const hasUnread = (ticket.unread_count || 0) > 0;
                const statusMeta = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      "flex w-full flex-col p-3.5 text-left transition-all hover:bg-muted/40",
                      isSelected && "bg-primary/10 border-l-4 border-l-primary",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-[240px]">
                        {ticket.subject}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                          statusMeta.bgClass,
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                      <span className="font-medium text-foreground/80 flex items-center gap-1 truncate max-w-[180px]">
                        <User className="size-3 shrink-0" />
                        {ticket.user_name}
                      </span>
                      <span className="text-[10px] shrink-0">
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
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full self-start">
                        {ticket.unread_count} nova(s) mensagem(ns)
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat & Conversation (Visible on desktop OR on mobile when a ticket is selected) */}
        <div
          className={cn(
            "lg:col-span-7 flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-2xs",
            selectedTicket ? "flex" : "hidden lg:flex",
          )}
        >
          {selectedTicket ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Header do Chamado */}
              <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/20 p-3.5 sm:p-4 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="flex lg:hidden items-center justify-center size-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
                    aria-label="Voltar para lista de chamados"
                  >
                    <ArrowLeft className="size-4" />
                  </button>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedTicket.user_name} ({selectedTicket.user_email})
                    </p>
                  </div>
                </div>

                {/* Status Selector Dropdown */}
                <div className="flex items-center gap-2 self-start sm:self-auto ml-auto">
                  <span className="text-xs text-muted-foreground hidden sm:inline">Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => void handleStatusChange(e.target.value as SupportTicket["status"])}
                    className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground font-semibold focus:border-primary focus:outline-none shadow-2xs"
                  >
                    <option value="open">Aberto</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="waiting_user">Aguardando Cliente</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>
              </div>

              {/* Mensagens do Atendimento */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5 min-h-[350px]">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Nenhuma mensagem registrada neste chamado.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isStaff = msg.sender_type === "super_admin";
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex flex-col", isStaff ? "items-end" : "items-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs",
                            isStaff
                              ? "bg-primary text-primary-foreground rounded-tr-xs"
                              : "bg-card border border-border text-foreground rounded-tl-xs",
                          )}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1 border-b border-border/40 pb-1">
                            <span className="font-bold text-[11px]">
                              {isStaff ? "Suporte Flow Systems (Você)" : msg.sender_name}
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
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Form de Resposta */}
              <form onSubmit={handleSendReply} className="border-t border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Digite a resposta do suporte para o cliente..."
                    className="h-10 flex-1 text-xs bg-background"
                  />
                  <Button
                    type="submit"
                    disabled={!replyInput.trim() || sendingReply}
                    className="h-10 px-4 text-xs font-bold gap-1.5 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="size-3.5" />
                    <span>Responder</span>
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[350px]">
              <MessageSquare className="size-10 mb-3 opacity-30 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Nenhum chamado selecionado</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Escolha um chamado na lista à esquerda para visualizar a conversa completa e atender o assinante.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
