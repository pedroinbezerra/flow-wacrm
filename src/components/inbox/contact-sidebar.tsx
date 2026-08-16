"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { ContactAvatar } from "@/components/ui/contact-avatar";
import type { Contact, Deal, ContactNote, Tag } from "@/types";
import Link from "next/link";
import { toast } from "sonner";
import { DirectDealModal } from "@/components/inbox/direct-deal-modal";
import { formatCurrency } from "@/lib/currency";
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
  Pencil,
  Trash2,
  X,
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
import { EmojiPickerPopover } from "@/components/ui/emoji-picker-popover";

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
  const [directDealModalOpen, setDirectDealModalOpen] = useState(false);

  const handleUnlinkDeal = async (dealId: string) => {
    if (!accountId) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("deals")
        .update({ contact_id: null })
        .eq("id", dealId)
        .eq("account_id", accountId);

      if (error) throw error;

      toast.success(t("inbox.deals.messages.unlinkedSuccess"));
      fetchContactData();
      if (conversationId && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("flowhub:refresh_timeline", {
            detail: { conversationId },
          })
        );
      }
    } catch {
      toast.error(t("inbox.deals.messages.unlinkError"));
    }
  };


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
    const channelName = `timeline:conversation:${conversationId}:${Math.random().toString(36).slice(2, 7)}`;
    const channel = supabase
      .channel(channelName)
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
  const [fullNotesOpen, setFullNotesOpen] = useState(false);

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
    const contactNotesList = (notesRes.data || [])
      .map((n: any) => ({
        id: n.id,
        note_text: (n.note_text || n.content || "").trim(),
        created_at: n.created_at,
        updated_at: n.updated_at,
        source: "contact" as const,
      }))
      .filter((n: any) => n.note_text.length > 0);

    const internalNotesList = (internalNotesRes?.data || [])
      .filter((n: any) => !n.deleted_at)
      .map((n: any) => ({
        id: n.id,
        note_text: (n.content || n.note_text || "").trim(),
        created_at: n.created_at,
        updated_at: n.updated_at,
        source: "internal" as const,
      }))
      .filter((n: any) => n.note_text.length > 0);

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

  const handleEditNote = useCallback(
    async (noteId: string, source: "internal" | "contact", newText: string) => {
      if (source === "internal" && conversationId) {
        try {
          const res = await fetch(`/api/conversations/${conversationId}/notes/${noteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newText }),
          });
          if (res.ok) {
            setNotes((prev) =>
              prev.map((n) =>
                n.id === noteId ? { ...n, note_text: newText, updated_at: new Date().toISOString() } : n
              )
            );
            window.dispatchEvent(
              new CustomEvent("flowhub:refresh_notes", { detail: { conversationId } })
            );
          }
        } catch {}
      } else {
        const supabase = createClient();
        const { error } = await supabase
          .from("contact_notes")
          .update({ note_text: newText })
          .eq("id", noteId);
        if (!error) {
          setNotes((prev) =>
            prev.map((n) =>
              n.id === noteId ? { ...n, note_text: newText, updated_at: new Date().toISOString() } : n
            )
          );
          window.dispatchEvent(
            new CustomEvent("flowhub:refresh_notes", { detail: { conversationId } })
          );
        }
      }
    },
    [conversationId]
  );

  const handleDeleteNote = useCallback(
    async (noteId: string, source: "internal" | "contact") => {
      if (source === "internal" && conversationId) {
        try {
          const res = await fetch(`/api/conversations/${conversationId}/notes/${noteId}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
            window.dispatchEvent(
              new CustomEvent("flowhub:refresh_notes", { detail: { conversationId } })
            );
          }
        } catch {}
      } else {
        const supabase = createClient();
        const { error } = await supabase
          .from("contact_notes")
          .delete()
          .eq("id", noteId);
        if (!error) {
          setNotes((prev) => prev.filter((n) => n.id !== noteId));
          window.dispatchEvent(
            new CustomEvent("flowhub:refresh_notes", { detail: { conversationId } })
          );
        }
      }
    },
    [conversationId]
  );

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
        {/* Contact Avatar Header Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
          <ContactAvatar
            name={contact.name}
            phone={contact.phone}
            avatarUrl={contact.avatar_url}
            size="default"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs text-foreground truncate">{displayName}</h4>
            <p className="text-[11px] text-muted-foreground font-mono truncate">{contact.phone}</p>
          </div>
        </div>

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
            <div className="flex items-center justify-between px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                <span>{t("inbox.sidebar.activeDeals")}</span>
              </div>
              {deals.length > 0 && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {deals.length} {deals.length === 1 ? "negócio" : "negócios"}
                </span>
              )}
            </div>

            <div className="mt-2 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 justify-center gap-1.5 border-dashed border-border/80 bg-muted/20 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-primary/50 transition-all rounded-lg"
                onClick={() => setDirectDealModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>{t("inbox.sidebar.directToDeal")}</span>
              </Button>

              {deals.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground italic">Nenhum negócio ativo ainda</p>
              ) : (
                deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="group relative rounded-lg bg-muted/60 border border-border/40 p-2.5 text-xs space-y-1.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/pipelines?dealId=${deal.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors truncate text-xs"
                      >
                        {deal.title}
                      </Link>
                      <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleUnlinkDeal(deal.id)}
                          className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                          title={t("inbox.sidebar.unlinkDeal")}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="font-bold text-primary font-mono">
                        {formatCurrency(deal.value, deal.currency)}
                      </span>
                      {deal.stage && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
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

          {/* Notes (Compact Top 3) */}
          <div>
            <div className="flex items-center justify-between px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <StickyNote className="h-3.5 w-3.5 text-amber-500" />
                <span>{t("inbox.sidebar.notes")}</span>
              </div>
              {notes.length > 0 && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {notes.length} {notes.length === 1 ? "nota" : "notas"}
                </span>
              )}
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t("common.placeholders.addNote")}
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-amber-500/50"
                />
                <Button
                  size="sm"
                  className="h-auto bg-amber-500 text-amber-950 hover:bg-amber-400 font-medium px-2.5"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-2 space-y-2">
                {notes.length === 0 ? (
                  <p className="px-1 text-xs text-muted-foreground italic">Nenhuma nota registrada ainda</p>
                ) : (
                  notes.slice(0, 3).map((note) => (
                    <NoteItemCard
                      key={note.id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                    />
                  ))
                )}

                {notes.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setFullNotesOpen(true)}
                    className="w-full mt-2 py-2 px-3 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 rounded-lg border border-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                    <span>Ver todas as notas ({notes.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

      {/* Full Notes Modal */}
      <Dialog open={fullNotesOpen} onOpenChange={setFullNotesOpen}>
        <DialogContent className="sm:max-w-xl bg-card border-border max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <StickyNote className="h-5 w-5 text-amber-500" />
              Notas Unificadas do Atendimento e do Cliente
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Histórico completo de anotações internas da conversa e do perfil do contato.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escreva uma nova nota..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-amber-500/50"
              />
              <Button
                size="sm"
                className="h-auto bg-amber-500 text-amber-950 hover:bg-amber-400 font-medium px-3"
                onClick={handleAddNote}
                disabled={!newNote.trim() || addingNote}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2 scrollbar-thin">
            {notes.map((note) => (
              <NoteItemCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Direct Contact to Deal Modal */}
      {contact && (
        <DirectDealModal
          open={directDealModalOpen}
          onOpenChange={setDirectDealModalOpen}
          contact={contact}
          conversationId={conversationId}
          onDealAssociated={fetchContactData}
        />
      )}
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

function NoteItemCard({
  note,
  onEdit,
  onDelete,
}: {
  note: any;
  onEdit: (noteId: string, source: "internal" | "contact", newText: string) => Promise<void>;
  onDelete: (noteId: string, source: "internal" | "contact") => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.note_text);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reactions, setReactions] = useState<string[]>([]);

  const handleSave = async () => {
    if (!editText.trim() || editText === note.note_text) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    await onEdit(note.id, note.source, editText.trim());
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await onDelete(note.id, note.source);
    setIsDeleting(false);
    setShowConfirmDelete(false);
  };

  const isEdited = Boolean(
    note.updated_at &&
    new Date(note.updated_at).getTime() - new Date(note.created_at).getTime() > 2000
  );

  const toggleReaction = (emoji: string) => {
    setReactions((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
  };

  return (
    <div className="group relative rounded-lg bg-muted/60 border border-border/40 p-2.5 text-xs space-y-1.5 hover:border-amber-500/40 transition-colors">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">
            {note.source === "internal" ? "Nota da Conversa" : "Nota do Cliente"}
          </span>
          {isEdited && (
            <span className="text-[9px] text-muted-foreground/80 italic shrink-0">
              (editada)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {!isEditing && (
            <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditText(note.note_text);
                  setIsEditing(true);
                }}
                className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Editar nota"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Excluir nota"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
          <span className="font-mono text-right shrink-0">
            {format(new Date(note.created_at), "dd/MM HH:mm")}
          </span>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2 pt-1">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            className="w-full resize-none rounded border border-amber-500/40 bg-muted px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-amber-500"
          />
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="h-6 px-2 text-[11px]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !editText.trim()}
              className="h-6 px-2 text-[11px] bg-amber-500 text-amber-950 hover:bg-amber-400 font-medium"
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed">
            {note.note_text}
          </p>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 flex-wrap">
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => toggleReaction(emoji)}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>{emoji}</span>
                </button>
              ))}

              <EmojiPickerPopover
                onSelectEmoji={toggleReaction}
                triggerClassName="h-6 w-6 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors"
              />
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-xs bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Excluir Nota</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-8 text-xs"
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}






