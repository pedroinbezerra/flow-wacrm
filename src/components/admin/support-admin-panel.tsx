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
  Inbox,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  HelpCircle,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_CONFIG: Record<
  SupportTicket["status"],
  { label: string; bgClass: string }
> = {
  open: {
    label: "Aberto",
    bgClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  in_progress: {
    label: "Em Andamento",
    bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  waiting_user: {
    label: "Aguardando",
    bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  resolved: {
    label: "Resolvido",
    bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  closed: {
    label: "Fechado",
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

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Refs de controle de rolagem interna do chat (sem afetar a janela)
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef<number>(0);

  // Reset da página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

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

  // Sync / Polling em tempo real silencioso (sem mover scroll da página)
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
      // Ao mudar de ticket, reseta a contagem para rolar para o fim
      prevMessagesCountRef.current = 0;
    }
  }, [selectedTicket, loadMessages]);

  // Rolagem inteligente: apenas dentro do container de mensagens e somente se o número de mensagens mudou
  useEffect(() => {
    if (messages.length > prevMessagesCountRef.current) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
    prevMessagesCountRef.current = messages.length;
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
      toast.success("Resposta enviada com sucesso!");
      void loadTickets();
      // Scroll imediato no envio
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);
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

  // Cálculos de paginação
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTickets = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, validCurrentPage, pageSize]);

  const startRecord = filteredTickets.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(filteredTickets.length, validCurrentPage * pageSize);

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="size-12 text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-foreground">Acesso Restrito</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Apenas mantenedores autorizados possuem permissão para acessar a Central de Atendimento e Suporte aos Clientes.
        </p>
      </div>
    );
  }

  return (
    <div className="-m-4 sm:-m-6 flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-background">
      {/* Top Compact Operational Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Headphones className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-foreground">
                Central de Suporte a Clientes
              </h1>
              <span title="Área Administrativa">
                <ShieldCheck className="size-3.5 text-primary/70" />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Atendimento em tempo real dos chamados abertos pelos assinantes Flow Hub.
            </p>
          </div>
        </div>

        {/* Quick Compact Stats & Refresh */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-foreground/40" />
              Total: {stats.total}
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="size-2 rounded-full bg-rose-500" />
              Abertos: {stats.open}
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="size-2 rounded-full bg-amber-500" />
              Em Atendimento: {stats.inProgress}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500" />
              Resolvidos: {stats.resolved}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadTickets()}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Ticket List & Filters */}
        <div
          className={cn(
            "h-full shrink-0 border-r border-border bg-card flex flex-col overflow-hidden w-full lg:w-80 xl:w-96",
            selectedTicket ? "hidden lg:flex" : "flex",
          )}
        >
          {/* Search & Status Filters */}
          <div className="p-3 border-b border-border space-y-2 bg-muted/10 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente ou assunto..."
                className="h-8.5 pl-8.5 text-xs bg-background"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-0.5 [scrollbar-width:none]">
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
                    "rounded-md px-2 py-0.75 text-[11px] font-semibold transition-all whitespace-nowrap border",
                    statusFilter === st.id
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border-border",
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Items List with Internal Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <RefreshCw className="size-4 animate-spin mx-auto mb-2 text-primary" />
                Carregando chamados...
              </div>
            ) : paginatedTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Inbox className="size-8 mx-auto mb-2 opacity-40" />
                Nenhum chamado encontrado.
              </div>
            ) : (
              paginatedTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                const hasUnread = (ticket.unread_count || 0) > 0;
                const statusMeta = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      "flex w-full flex-col p-3 text-left transition-all hover:bg-muted/40",
                      isSelected && "bg-primary/10 border-l-4 border-l-primary",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-[230px]">
                        {ticket.subject}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.75 py-0.2 text-[10px] font-bold border shrink-0",
                          statusMeta.bgClass,
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                      <span className="font-medium text-foreground/80 flex items-center gap-1 truncate max-w-[170px]">
                        <User className="size-3 shrink-0" />
                        {ticket.user_name}
                      </span>
                      <span className="text-[10px] shrink-0 font-mono">
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
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 px-1.75 py-0.2 rounded-full self-start">
                        {ticket.unread_count} nova(s) mensagem(ns)
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Integrated Pagination Footer */}
          {filteredTickets.length > 0 && (
            <div className="flex items-center justify-between border-t border-border bg-card p-2 px-3 text-xs text-muted-foreground shrink-0">
              <span className="text-[11px] font-medium font-mono">
                {startRecord}-{endRecord} de {filteredTickets.length}
              </span>

              <div className="flex items-center gap-1">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-6.5 rounded-md border border-border bg-background px-1 text-[11px] font-medium text-foreground focus:border-primary focus:outline-none"
                  aria-label="Itens por página"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>

                <div className="flex items-center gap-0.5 border-l border-border pl-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6.5"
                    disabled={validCurrentPage <= 1}
                    onClick={() => setCurrentPage(1)}
                    title="Primeira página"
                  >
                    <ChevronsLeft className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6.5"
                    disabled={validCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    title="Página anterior"
                  >
                    <ChevronLeft className="size-3" />
                  </Button>

                  <span className="px-1 text-[10px] font-semibold text-foreground">
                    {validCurrentPage}/{totalPages}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6.5"
                    disabled={validCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    title="Próxima página"
                  >
                    <ChevronRight className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6.5"
                    disabled={validCurrentPage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Última página"
                  >
                    <ChevronsRight className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chat & Attention Workspace */}
        <div
          className={cn(
            "flex-1 flex flex-col h-full bg-card min-w-0 overflow-hidden",
            selectedTicket ? "flex" : "hidden lg:flex",
          )}
        >
          {selectedTicket ? (
            <div className="flex flex-1 flex-col h-full overflow-hidden">
              {/* Ticket Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/15 px-4 py-3 gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTicket(null)}
                    className="flex lg:hidden size-8 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Voltar para lista de chamados"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>

                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-foreground truncate">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedTicket.user_name} ({selectedTicket.user_email})
                    </p>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
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

              {/* Messages Container with Internal Scroll (DOES NOT MOVE WINDOW SCROLL) */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5 scrollbar-thin"
              >
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
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
                            "max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs",
                            isStaff
                              ? "bg-primary text-primary-foreground rounded-tr-xs"
                              : "bg-card border border-border text-foreground rounded-tl-xs",
                          )}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1 border-b border-border/40 pb-1">
                            <span className="font-bold text-[11px]">
                              {isStaff ? "Suporte Flow Systems (Você)" : msg.sender_name}
                            </span>
                            <span className="text-[10px] opacity-70 font-mono">
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
              </div>

              {/* Always Pinned Input Composer at the Bottom */}
              <form onSubmit={handleSendReply} className="border-t border-border bg-card p-3 shrink-0">
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
            /* Informative, Useful Empty State */
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground h-full">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/40 text-primary mb-3.5">
                <MessageSquare className="size-7 opacity-80" />
              </div>
              <h2 className="text-base font-bold text-foreground">Nenhum chamado selecionado</h2>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">
                Escolha um chamado na lista à esquerda para visualizar a conversa e responder o assinante em tempo real.
              </p>

              {/* Operational overview cards in empty state */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                <div className="rounded-xl border border-border bg-muted/10 p-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Abertos para Atendimento
                  </span>
                  <p className="text-xl font-bold text-foreground mt-0.5">{stats.open}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/10 p-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Aguardando Retorno
                  </span>
                  <p className="text-xl font-bold text-foreground mt-0.5">{stats.inProgress}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
