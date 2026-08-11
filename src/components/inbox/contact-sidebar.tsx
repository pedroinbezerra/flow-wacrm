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


  const fetchContactData = useCallback(async () => {
    if (!contact) return;

    const supabase = createClient();

    // Fetch deals, notes, and tags in parallel
    const [dealsRes, notesRes, tagsRes] = await Promise.all([
      supabase
        .from("deals")
        .select("*, stage:pipeline_stages(*)")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contact_notes")
        .select("*")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contact_tags")
        .select("id, tag_id, tags(*)")
        .eq("contact_id", contact.id),
    ]);

    if (dealsRes.data) setDeals(dealsRes.data);
    if (notesRes.data) setNotes(notesRes.data);
    if (tagsRes.data) {
      const mapped = tagsRes.data
        .filter((ct: Record<string, unknown>) => ct.tags)
        .map((ct: Record<string, unknown>) => ({
          ...(ct.tags as Tag),
          contact_tag_id: ct.id as string,
        }));
      setTags(mapped);
    }
  }, [contact]);

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
      setNotes((prev) => [data, ...prev]);
      setNewNote("");
    }
    setAddingNote(false);
  }, [contact, newNote, accountId]);

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
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {/* Contact Info */}
        <div className="flex flex-col items-center text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
              {contact.avatar_url ? (
                <img
                  src={contact.avatar_url}
                  alt={displayName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              {displayName}
            </h3>
            {contact.company && (
              <p className="text-xs text-muted-foreground">{contact.company}</p>
            )}
          </div>

          {/* Phone */}
          <div className="mt-4 space-y-2">
            <button
              onClick={handleCopyPhone}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">{contact.phone}</span>
              {copied ? (
                <Check className="h-3 w-3 text-primary" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>

            {contact.email && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

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

          {/* Timeline Events */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <History className="h-3.5 w-3.5 text-primary" />
              <span>Linha do Tempo</span>
            </div>
            <div className="mt-2 space-y-2">
              {timelineEvents.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground italic">Nenhum evento registrado ainda</p>
              ) : (
                timelineEvents.map((evt) => {
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
            </div>
          </div>
        </div>
      </div>

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
                    <span className="font-normal text-foreground bg-primary-soft text-primary p-2.5 rounded border border-primary/30">
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






