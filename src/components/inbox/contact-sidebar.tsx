"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import type { Contact, Deal, ContactNote, Tag } from "@/types";
import {
  Phone,
  Mail,
  Copy,
  Check,
  User,
  Tag as TagIcon,
  DollarSign,
  StickyNote,
  Plus,
  History,
  Eye,
  Info,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface ContactSidebarProps {
  contact: Contact | null;
  conversationId?: string;
}

export function ContactSidebar({ contact, conversationId }: ContactSidebarProps) {
  const { accountId } = useAuth();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [tags, setTags] = useState<(Tag & { contact_tag_id: string })[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);


  const fetchTimeline = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/conversations/${conversationId}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setTimelineEvents(Array.isArray(data) ? data : []);
      }
    } catch {}
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setTimelineEvents([]);
      return;
    }

    fetchTimeline();

    const supabase = createClient();
    const channel = supabase
      .channel(`timeline:conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_timeline_events",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchTimeline();
        }
      )
      .subscribe();

    const handleRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<{ conversationId?: string }>;
      if (!customEvent.detail?.conversationId || customEvent.detail.conversationId === conversationId) {
        fetchTimeline();
      }
    };

    window.addEventListener("flowhub:refresh_notes", handleRefresh);
    window.addEventListener("flowhub:refresh_timeline", handleRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("flowhub:refresh_notes", handleRefresh);
      window.removeEventListener("flowhub:refresh_timeline", handleRefresh);
    };
  }, [conversationId, fetchTimeline]);


  const [fullTimelineOpen, setFullTimelineOpen] = useState(false);

  const fetchContactData = useCallback(async () => {
    if (!contact) return;

    const supabase = createClient();

    const dealsPromise = supabase
      .from("deals")
      .select("*, stage:pipeline_stages(*)")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false });

    const notesPromise = supabase
      .from("contact_notes")
      .select("*")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false });

    const tagsPromise = supabase
      .from("contact_tags")
      .select("id, tag_id, tags(*)")
      .eq("contact_id", contact.id);

    const internalNotesPromise = conversationId
      ? supabase
          .from("internal_notes")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null, error: null });

    const [dealsRes, notesRes, tagsRes, internalNotesRes] = await Promise.all([
      dealsPromise,
      notesPromise,
      tagsPromise,
      internalNotesPromise,
    ]);

    if (dealsRes.data) setDeals(dealsRes.data);

    // Unify contact_notes and internal_notes into a single sorted feed
    const contactNotesList = (notesRes.data || []).map((n: any) => ({
      id: n.id,
      note_text: n.note_text,
      created_at: n.created_at,
      source: "contact" as const,
    }));

    const internalNotesList = (internalNotesRes?.data || []).map((n: any) => ({
      id: n.id,
      note_text: n.note_text,
      created_at: n.created_at,
      source: "internal" as const,
    }));

    const combinedNotes = [...contactNotesList, ...internalNotesList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setNotes(combinedNotes as any);

    if (tagsRes.data) {
      const mapped = tagsRes.data
        .filter((ct: Record<string, unknown>) => ct.tags)
        .map((ct: Record<string, unknown>) => ({
          ...(ct.tags as Tag),
          contact_tag_id: ct.id as string,
        }));
      setTags(mapped);
    }
  }, [contact, conversationId]);

  // Load on contact change. setContactData/setTags run inside async
  // Supabase callbacks, not synchronously in the effect body.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContactData();
  }, [fetchContactData]);

  const handleCopyPhone = useCallback(async () => {
    if (!contact?.phone) return;
    await navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Dep is the whole `contact` object (not `contact?.phone`) so the
    // React Compiler's inference agrees with the manual dep list —
    // fixes the `preserve-manual-memoization` lint error.
  }, [contact]);

  const handleAddNote = useCallback(async () => {
    if (!contact || !newNote.trim()) return;
    if (!accountId) return;
    setAddingNote(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    const { data, error } = await supabase
      .from("contact_notes")
      .insert({
        contact_id: contact.id,
        account_id: accountId,
        user_id: user?.id,
        note_text: newNote.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setNotes((prev) => [{ ...data, source: "contact" }, ...prev]);
      setNewNote("");
      window.dispatchEvent(
        new CustomEvent("flowhub:refresh_notes", { detail: { conversationId } })
      );
    }
    setAddingNote(false);
  }, [contact, newNote, accountId, conversationId]);

  if (!contact) {
    return (
      <div className="flex h-full w-70 items-center justify-center border-l border-border bg-card">
        <p className="text-sm text-muted-foreground">{t("inbox.selectConversation")}</p>
      </div>
    );
  }

  const displayName = contact.name || contact.phone;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-full w-full flex-col bg-card overflow-hidden">
      {/* Header do Hub Contextual */}
      <div className="flex h-13 min-h-[52px] items-center justify-between border-b border-border px-4 py-2 bg-card/50">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contexto do Cliente
        </h3>
        {contact.company && (
          <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
            {contact.company}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin space-y-4">
        {/* Quick Actions (Copy Phone / Email) */}
        {(contact.phone || contact.email) && (
          <div className="flex items-center gap-2 rounded-md bg-muted/30 p-2 text-xs">
            <button
              onClick={handleCopyPhone}
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              title="Copiar telefone"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="font-mono text-[11px]">{contact.phone}</span>
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 opacity-60" />}
            </button>
            {contact.email && (
              <span className="text-muted-foreground truncate border-l border-border/60 pl-2">
                {contact.email}
              </span>
            )}
          </div>
        )}

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TagIcon className="h-3 w-3" />
              {t("inbox.sidebar.tags")}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">{t("inbox.sidebar.noTags")}</p>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag.contact_tag_id}
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Active Deals */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              {t("inbox.sidebar.activeDeals")}
            </div>
            <div className="mt-2 space-y-2">
              {deals.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">{t("inbox.sidebar.noDeals")}</p>
              ) : (
                deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-lg bg-muted px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {deal.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {deal.currency ?? "$"}
                        {deal.value.toLocaleString()}
                      </span>
                      {deal.stage && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px]"
                          style={{
                            backgroundColor: `${deal.stage.color}20`,
                            color: deal.stage.color,
                          }}
                        >
                          {deal.stage.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <StickyNote className="h-3 w-3" />
              {t("inbox.sidebar.notes")}
            </div>
            <div className="mt-2">
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t("common.placeholders.addNote")}
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                />
                <Button
                  size="sm"
                  className="h-auto bg-primary px-2 hover:bg-primary/90"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="mt-2 space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-muted px-3 py-2"
                  >
                    <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                      {note.note_text}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {format(new Date(note.created_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          {/* Divider */}

          <div className="my-4 border-t border-border" />

          {/* Timeline Events (Compact Top 4) */}
          <div>
            <div className="flex items-center justify-between px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-primary" />
                <span>Linha do Tempo</span>
              </div>
              {timelineEvents.length > 0 && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {timelineEvents.length} {timelineEvents.length === 1 ? "evento" : "eventos"}
                </span>
              )}
            </div>
            <div className="mt-2 space-y-2">
              {timelineEvents.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground italic">Nenhum evento registrado ainda</p>
              ) : (
                timelineEvents.slice(0, 4).map((evt) => {
                  const { actionText, naturalSentence } = formatTimelineNaturalAction(evt);

                  return (
                    <div
                      key={evt.id}
                      className="group relative flex items-center justify-between rounded-lg bg-muted/60 p-2.5 text-xs border border-border/40 hover:border-primary/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span className="font-semibold text-foreground truncate">{evt.actor_name || "Sistema"}</span>
                          <span className="shrink-0">{format(new Date(evt.created_at), "HH:mm")}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight">{actionText}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedEvent({ ...evt, actionText, naturalSentence })}
                        title="Visualizar detalhes do evento"
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}

              {timelineEvents.length > 4 && (
                <button
                  type="button"
                  onClick={() => setFullTimelineOpen(true)}
                  className="w-full mt-2 py-2 px-3 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 rounded-lg border border-primary/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Ver linha do tempo completa ({timelineEvents.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Timeline Modal */}
      <Dialog open={fullTimelineOpen} onOpenChange={setFullTimelineOpen}>
        <DialogContent className="sm:max-w-xl bg-card border-border max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <History className="h-5 w-5 text-primary" />
              Linha do Tempo Completa do Atendimento
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Histórico cronológico completo de todas as ações e eventos desta conversa.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2 scrollbar-thin">
            {timelineEvents.map((evt) => {
              const { actionText, naturalSentence } = formatTimelineNaturalAction(evt);
              return (
                <div
                  key={evt.id}
                  className="flex items-start justify-between rounded-lg bg-muted/40 p-3 text-xs border border-border/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-semibold text-foreground">{evt.actor_name || "Sistema"}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground font-mono">
                        {format(new Date(evt.created_at), "dd/MM/yyyy 'às' HH:mm:ss")}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90 font-medium">{naturalSentence}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFullTimelineOpen(false);
                      setSelectedEvent({ ...evt, actionText, naturalSentence });
                    }}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    title="Detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              Detalhes do Evento
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Histórico detalhado da ação registrada na conversa.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-3.5 pt-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-2.5">
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground font-medium">Evento:</span>
                  <span className="font-semibold text-foreground leading-relaxed">
                    {selectedEvent.naturalSentence}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
                  <span className="text-muted-foreground font-medium">Executado por:</span>
                  <span className="font-medium text-foreground">{selectedEvent.actor_name || "Sistema"}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Data e Hora:</span>
                  <span className="text-muted-foreground font-mono">
                    {format(new Date(selectedEvent.created_at), "dd/MM/yyyy 'às' HH:mm:ss")}
                  </span>
                </div>

                {(selectedEvent.metadata?.note_text || selectedEvent.metadata?.text || selectedEvent.metadata?.content || selectedEvent.metadata?.new_content || selectedEvent.metadata?.deleted_content) && (
                  <div className="flex flex-col gap-1 text-xs pt-2 border-t border-border/40">
                    <span className="text-muted-foreground font-medium">Conteúdo da Nota:</span>
                    <span className="font-normal text-foreground bg-muted/60 p-2.5 rounded border border-border/40 italic">
                      "{selectedEvent.metadata?.new_content || selectedEvent.metadata?.deleted_content || selectedEvent.metadata?.note_text || selectedEvent.metadata?.text || selectedEvent.metadata?.content}"
                    </span>
                  </div>
                )}

                {selectedEvent.metadata?.previous_content && (
                  <div className="flex flex-col gap-1 text-xs pt-2 border-t border-border/40">
                    <span className="text-muted-foreground font-medium">Conteúdo Anterior:</span>
                    <span className="font-normal text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/30 line-through">
                      "{selectedEvent.metadata.previous_content}"
                    </span>
                  </div>
                )}

                {selectedEvent.metadata?.reason && (
                  <div className="flex flex-col gap-1 text-xs pt-2 border-t border-border/40">
                    <span className="text-muted-foreground font-medium">Motivo do Pedido de Ajuda:</span>
                    <span className="font-normal text-foreground bg-amber-500/10 text-amber-700 dark:text-amber-300 p-2.5 rounded border border-amber-500/30">
                      "{selectedEvent.metadata?.reason}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatTimelineNaturalAction(evt: any): { actionText: string; naturalSentence: string } {
  const actor = evt.actor_name || "Sistema";
  const targetName = evt.target_user_name || evt.metadata?.target_user_name;
  const newOwnerName = evt.new_owner_name || evt.metadata?.new_owner_name;

  switch (evt.event_type) {
    case "participant_added": {
      const actionText = targetName ? `Adicionou ${targetName} como participante` : "Adicionou um participante";
      const naturalSentence = `${actor} adicionou ${targetName || "um participante"} como participante da conversa`;
      return { actionText, naturalSentence };
    }
    case "participant_removed": {
      const actionText = targetName ? `Removeu ${targetName} da conversa` : "Removeu um participante";
      const naturalSentence = `${actor} removeu ${targetName || "um participante"} da conversa`;
      return { actionText, naturalSentence };
    }
    case "owner_changed": {
      const actionText = newOwnerName ? `Transferiu atendimento para ${newOwnerName}` : "Alterou o responsável pelo atendimento";
      const naturalSentence = `${actor} transferiu a responsabilidade do atendimento para ${newOwnerName || "outro colaborador"}`;
      return { actionText, naturalSentence };
    }
    case "internal_note_created": {
      return {
        actionText: "Criou uma nota interna",
        naturalSentence: `${actor} adicionou uma nota interna nesta conversa`,
      };
    }
    case "internal_note_updated": {
      return {
        actionText: "Editou uma nota interna",
        naturalSentence: `${actor} alterou o conteúdo de uma nota interna nesta conversa`,
      };
    }
    case "internal_note_deleted": {
      return {
        actionText: "Excluiu uma nota interna",
        naturalSentence: `${actor} excluiu uma nota interna desta conversa`,
      };
    }
    case "collaborator_mentioned": {
      const actionText = targetName ? `Mencionou ${targetName} na nota` : "Mencionou um colaborador";
      return {
        actionText,
        naturalSentence: `${actor} mencionou ${targetName || "um colaborador"} em uma nota interna`,
      };
    }
    case "help_requested": {
      return {
        actionText: "Solicitou ajuda da equipe",
        naturalSentence: `${actor} solicitou apoio da equipe para este atendimento`,
      };
    }
    case "reaction_added": {
      const emoji = evt.metadata?.emoji ? ` ${evt.metadata.emoji}` : "";
      return {
        actionText: `Adicionou a reação${emoji}`,
        naturalSentence: `${actor} reagiu a uma mensagem na conversa${emoji}`,
      };
    }
    case "message_sent": {
      return {
        actionText: "Enviou uma mensagem",
        naturalSentence: `${actor} enviou uma nova mensagem ao cliente`,
      };
    }
    default: {
      return {
        actionText: "Ação registrada no sistema",
        naturalSentence: `${actor} realizou uma alteração nesta conversa`,
      };
    }
  }
}






