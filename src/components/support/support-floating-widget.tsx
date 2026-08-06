"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  fetchUserTickets,
  getOrCreateLiveChatTicket,
  fetchTicketMessages,
  sendSupportMessage,
  createSupportTicket,
  markMessagesAsReadByUser,
  SupportTicket,
  SupportTicketMessage,
} from "@/lib/support/support-service";
import {
  Headphones,
  X,
  Send,
  MessageSquare,
  Ticket,
  PlusCircle,
  ChevronLeft,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

export function SupportFloatingWidget() {
  const { user, account, profile, profileLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "tickets">("chat");

  // Chat Direto State
  const [liveChatTicket, setLiveChatTicket] = useState<SupportTicket | null>(null);
  const [liveChatMessages, setLiveChatMessages] = useState<SupportTicketMessage[]>([]);
  const [liveChatMessageInput, setLiveChatMessageInput] = useState("");
  const [sendingLiveChat, setSendingLiveChat] = useState(false);

  // Tickets State
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedTicketMessages, setSelectedTicketMessages] = useState<SupportTicketMessage[]>([]);
  const [ticketMessageInput, setTicketMessageInput] = useState("");
  const [sendingTicketMsg, setSendingTicketMsg] = useState(false);

  // Modal de Novo Ticket
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState<SupportTicket["category"]>("duvida");
  const [newPriority, setNewPriority] = useState<SupportTicket["priority"]>("medium");
  const [newInitialMsg, setNewInitialMsg] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Ref para auto-scroll no chat
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const previousUnreadRef = useRef<number>(0);

  const userName = profile?.full_name || user?.email || "Cliente";
  const userEmail = user?.email || "";

  // Carrega e atualiza dados do suporte
  const refreshSupportData = useCallback(async () => {
    if (!user?.id || !account?.id) return;
    const supabase = createClient();

    // 1. Atualiza lista de tickets
    const tickets = await fetchUserTickets(supabase, user.id);
    setTicketsList(tickets);

    // Calcula total de mensagens não lidas recebidas do suporte
    const totalUnread = tickets.reduce((acc, t) => acc + (t.unread_count || 0), 0);

    // Dispara notificação toast se chegarem novas mensagens do suporte enquanto navega
    if (totalUnread > previousUnreadRef.current && previousUnreadRef.current !== 0) {
      toast.info("Nova mensagem da equipe Flow Systems!", {
        description: "Abra o widget de suporte para ler a resposta.",
      });
    }
    previousUnreadRef.current = totalUnread;

    // 2. Garante/Atualiza Chat Direto
    const chatTicket = await getOrCreateLiveChatTicket(
      supabase,
      account.id,
      user.id,
      userName,
      userEmail
    );
    if (chatTicket) {
      setLiveChatTicket(chatTicket);
      const msgs = await fetchTicketMessages(supabase, chatTicket.id);
      setLiveChatMessages(msgs);

      // Marca lidas se a aba de chat direto estiver aberta e ativa
      if (isOpen && activeTab === "chat") {
        await markMessagesAsReadByUser(supabase, chatTicket.id);
      }
    }

    // 3. Atualiza mensagens do ticket selecionado se houver um aberto
    if (selectedTicket) {
      const msgs = await fetchTicketMessages(supabase, selectedTicket.id);
      setSelectedTicketMessages(msgs);
      if (isOpen && activeTab === "tickets") {
        await markMessagesAsReadByUser(supabase, selectedTicket.id);
      }
    }
  }, [user?.id, account?.id, userName, userEmail, isOpen, activeTab, selectedTicket]);

  // Polling a cada 5 segundos para atualizações em tempo real
  useEffect(() => {
    if (profileLoading || !user?.id) return;
    void refreshSupportData();

    const interval = setInterval(() => {
      void refreshSupportData();
    }, 5000);

    return () => clearInterval(interval);
  }, [profileLoading, user?.id, refreshSupportData]);

  // Scroll para o fim do chat
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, liveChatMessages, selectedTicketMessages, activeTab]);

  // Enviar mensagem no Chat Direto
  const handleSendLiveChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveChatMessageInput.trim() || !liveChatTicket || !user?.id || sendingLiveChat) return;

    setSendingLiveChat(true);
    const content = liveChatMessageInput.trim();
    setLiveChatMessageInput("");

    const supabase = createClient();
    const sent = await sendSupportMessage(supabase, {
      ticketId: liveChatTicket.id,
      senderType: "user",
      senderUserId: user.id,
      senderName: userName,
      content,
    });

    setSendingLiveChat(false);
    if (sent) {
      setLiveChatMessages((prev) => [...prev, sent]);
      void refreshSupportData();
    } else {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  // Enviar mensagem dentro de um Ticket específico
  const handleSendTicketMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessageInput.trim() || !selectedTicket || !user?.id || sendingTicketMsg) return;

    setSendingTicketMsg(true);
    const content = ticketMessageInput.trim();
    setTicketMessageInput("");

    const supabase = createClient();
    const sent = await sendSupportMessage(supabase, {
      ticketId: selectedTicket.id,
      senderType: "user",
      senderUserId: user.id,
      senderName: userName,
      content,
    });

    setSendingTicketMsg(false);
    if (sent) {
      setSelectedTicketMessages((prev) => [...prev, sent]);
      void refreshSupportData();
    } else {
      toast.error("Erro ao enviar mensagem no ticket.");
    }
  };

  // Criar Novo Ticket
  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim() || !user?.id || !account?.id || submittingTicket) return;

    setSubmittingTicket(true);
    const supabase = createClient();

    const created = await createSupportTicket(supabase, {
      accountId: account.id,
      userId: user.id,
      userName,
      userEmail,
      subject: newSubject.trim(),
      category: newCategory,
      priority: newPriority,
      initialMessage: newInitialMsg.trim(),
    });

    setSubmittingTicket(false);

    if (created) {
      toast.success("Ticket criado com sucesso! Nossa equipe responderá em breve.");
      setNewSubject("");
      setNewInitialMsg("");
      setIsCreatingTicket(false);
      setSelectedTicket(created);
      void refreshSupportData();
    } else {
      toast.error("Erro ao criar ticket de suporte.");
    }
  };

  if (profileLoading || !user) return null;

  const totalUnreadCount = ticketsList.reduce((acc, t) => acc + (t.unread_count || 0), 0);

  return (
    <>
      {/* Botão Flutuante (FAB) fixo no canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30"
          aria-label="Abrir Suporte Flow Systems"
        >
          {isOpen ? <X className="size-6" /> : <Headphones className="size-6" />}

          {/* Badge de Mensagens Não Lidas */}
          {!isOpen && totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-md animate-pulse">
              {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Panel / Drawer Flutuante de Suporte */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 flex h-[470px] max-h-[calc(100vh-6.5rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 via-background to-accent/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Suporte Flow Systems</h2>
                <p className="text-[11px] text-muted-foreground">Estamos online para ajudar você</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border bg-muted/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("chat");
                setSelectedTicket(null);
                setIsCreatingTicket(false);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-medium transition-all ${
                activeTab === "chat"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="size-3.5" />
              Chat Direto
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("tickets");
                setIsCreatingTicket(false);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-medium transition-all ${
                activeTab === "tickets"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Ticket className="size-3.5" />
              Meus Tickets
              {totalUnreadCount > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {totalUnreadCount}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: CHAT DIRETO */}
          {activeTab === "chat" && (
            <div className="flex flex-1 flex-col overflow-hidden bg-muted/10">
              {/* ÁREA DE MENSAGENS */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground/90 space-y-1">
                  <p className="font-semibold text-primary">Atendimento ao Vivo</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Converse diretamente com a equipe técnica da Flow Systems. Estamos ao seu dispor para dúvidas e suporte operacional!
                  </p>
                </div>

                {liveChatMessages.map((msg) => {
                  const isMe = msg.sender_type === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-xs"
                            : "bg-card border border-border text-foreground rounded-tl-xs"
                        }`}
                      >
                        {!isMe && (
                          <span className="block text-[10px] font-bold text-primary mb-1">
                            {msg.sender_name} (Flow Systems)
                          </span>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* INPUT DE MENSAGEM DO CHAT */}
              <form onSubmit={handleSendLiveChatMessage} className="border-t border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={liveChatMessageInput}
                    onChange={(e) => setLiveChatMessageInput(e.target.value)}
                    placeholder="Digite sua mensagem de suporte..."
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!liveChatMessageInput.trim() || sendingLiveChat}
                    className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: TICKETS */}
          {activeTab === "tickets" && (
            <div className="flex flex-1 flex-col overflow-hidden bg-muted/10">
              {/* TICKET SELECIONADO OU FORMULÁRIO DE NOVO TICKET */}
              {isCreatingTicket ? (
                /* FORMULÁRIO DE CRIAÇÃO */
                <form onSubmit={handleCreateTicketSubmit} className="flex flex-1 flex-col p-4 space-y-3 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTicket(false)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <ChevronLeft className="size-4" />
                      Voltar aos tickets
                    </button>
                    <span className="text-xs font-bold text-foreground">Abrir Chamado</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Assunto</label>
                    <input
                      type="text"
                      required
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Ex: Erro ao enviar modelo de mensagem"
                      className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">Categoria</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="duvida">Dúvida</option>
                        <option value="problema_tecnico">Problema Técnico</option>
                        <option value="financeiro">Financeiro</option>
                        <option value="sugestao">Sugestão</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">Prioridade</label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as any)}
                        className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 flex-1 flex flex-col">
                    <label className="text-[11px] font-semibold text-foreground">Descrição detalhada</label>
                    <textarea
                      required
                      rows={4}
                      value={newInitialMsg}
                      onChange={(e) => setNewInitialMsg(e.target.value)}
                      placeholder="Descreva o que está acontecendo e como podemos ajudar..."
                      className="w-full flex-1 rounded-xl border border-border bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="w-full rounded-xl bg-primary p-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {submittingTicket ? "Enviando Chamado..." : "Confirmar e Abrir Ticket"}
                  </button>
                </form>
              ) : selectedTicket ? (
                /* CHAT INTERNO DO TICKET SELECIONADO */
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border bg-card p-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <ChevronLeft className="size-4" />
                      Voltar
                    </button>
                    <span className="text-xs font-bold truncate max-w-[180px]">{selectedTicket.subject}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedTicketMessages.map((msg) => {
                      const isMe = msg.sender_type === "user";
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div
                            className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-tr-xs"
                                : "bg-card border border-border text-foreground rounded-tl-xs"
                            }`}
                          >
                            {!isMe && (
                              <span className="block text-[10px] font-bold text-primary mb-1">
                                {msg.sender_name} (Flow Systems)
                              </span>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className="block text-[9px] mt-1 text-right opacity-70">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>

                  <form onSubmit={handleSendTicketMessage} className="border-t border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ticketMessageInput}
                        onChange={(e) => setTicketMessageInput(e.target.value)}
                        placeholder="Responder no ticket..."
                        className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!ticketMessageInput.trim() || sendingTicketMsg}
                        className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        <Send className="size-4" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* LISTA DE TICKETS */
                <div className="flex flex-1 flex-col overflow-hidden p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTicket(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
                  >
                    <PlusCircle className="size-4" />
                    Abrir Novo Ticket
                  </button>

                  <div className="flex-1 overflow-y-auto space-y-2">
                    {ticketsList.filter((t) => t.category !== "chat_direto").length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <Ticket className="size-8 mb-2 opacity-50" />
                        <p className="text-xs font-medium">Nenhum ticket aberto até o momento.</p>
                      </div>
                    ) : (
                      ticketsList
                        .filter((t) => t.category !== "chat_direto")
                        .map((ticket) => (
                          <button
                            key={ticket.id}
                            type="button"
                            onClick={() => setSelectedTicket(ticket)}
                            className="flex w-full items-start justify-between rounded-2xl border border-border/80 bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-foreground truncate max-w-[190px]">
                                  {ticket.subject}
                                </span>
                                {ticket.unread_count ? (
                                  <span className="size-2 rounded-full bg-rose-500" />
                                ) : null}
                              </div>
                              <p className="text-[11px] text-muted-foreground capitalize">
                                Categoria: {ticket.category.replace("_", " ")}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                ticket.status === "open"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : ticket.status === "resolved"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
