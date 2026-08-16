'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Contact, Tag, ContactTag } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContactAvatar } from '@/components/ui/contact-avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  Plus,
  Upload,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Filter,
  X,
  Tag as TagIcon,
  Download,
  MessageSquare,
  Mail,
  Ban,
} from 'lucide-react';
import { ContactForm } from '@/components/contacts/contact-form';
import { ContactDetailView } from '@/components/contacts/contact-detail-view';
import { ImportModal } from '@/components/contacts/import-modal';
import { CustomFieldsManager } from '@/components/contacts/custom-fields-manager';
import { BulkTagModal } from '@/components/contacts/bulk-tag-modal';
import { useCan } from '@/hooks/use-can';
import { useTranslation } from '@/hooks/use-translation';
import { GatedButton } from '@/components/ui/gated-button';
import { Checkbox } from '@/components/ui/checkbox';

const PAGE_SIZE = 25;

interface ContactWithTags extends Contact {
  tags?: Tag[];
}

export default function ContactsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useTranslation();
  const canEdit = useCan('send-messages');
  const canEditSettings = useCan('edit-settings');

  const [contacts, setContacts] = useState<ContactWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState<'all' | 'email' | 'document' | 'opt_out'>('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    withEmail: 0,
    optOut: 0,
    tagsCount: 0,
  });

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editContactTags, setEditContactTags] = useState<ContactTag[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailContactId, setDetailContactId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [customFieldsOpen, setCustomFieldsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk selection & modals
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkTagOpen, setBulkTagOpen] = useState(false);

  // All tags for display
  const [tagsMap, setTagsMap] = useState<Record<string, Tag>>({});

  const fetchSeq = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchStats = useCallback(async () => {
    try {
      const [totalRes, emailRes, optOutRes] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('contacts').select('*', { count: 'exact', head: true }).not('email', 'is', null),
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('opt_out', true),
      ]);

      setStats((prev) => ({
        ...prev,
        total: totalRes.count ?? 0,
        withEmail: emailRes.count ?? 0,
        optOut: optOutRes.count ?? 0,
      }));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [supabase]);

  const fetchTags = useCallback(async () => {
    const { data } = await supabase.from('tags').select('*');
    if (data) {
      const map: Record<string, Tag> = {};
      data.forEach((tag) => (map[tag.id] = tag));
      setTagsMap(map);
      setStats((prev) => ({ ...prev, tagsCount: Object.keys(map).length }));
      setSelectedTagIds((prev) => {
        const pruned = prev.filter((id) => map[id]);
        return pruned.length === prev.length ? prev : pruned;
      });
    }
  }, [supabase]);

  const fetchContacts = useCallback(async () => {
    const seq = ++fetchSeq.current;
    setLoading(true);
    setSelected(new Set());

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const term = search.trim();

    let contactRows: Contact[];
    let count: number;

    if (selectedTagIds.length > 0) {
      const { data, error } = await supabase.rpc('filter_contacts_by_tags', {
        p_tag_ids: selectedTagIds,
        p_search: term || null,
        p_limit: PAGE_SIZE,
        p_offset: from,
      });
      if (seq !== fetchSeq.current) return;
      if (error) {
        toast.error(t('contacts.failedLoad'));
        setLoading(false);
        return;
      }
      const rows = (data ?? []) as { contact: Contact; total_count: number }[];
      contactRows = rows.map((r) => r.contact);
      count = rows.length > 0 ? Number(rows[0].total_count) : 0;
    } else {
      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (quickFilter === 'email') {
        query = query.not('email', 'is', null);
      } else if (quickFilter === 'document') {
        query = query.not('cpf_cnpj', 'is', null);
      } else if (quickFilter === 'opt_out') {
        query = query.eq('opt_out', true);
      }

      if (term) {
        const like = `%${term}%`;
        query = query.or(`name.ilike.${like},phone.ilike.${like},email.ilike.${like},cpf_cnpj.ilike.${like}`);
      }

      query = query.range(from, to);

      const { data, count: exactCount, error } = await query;
      if (seq !== fetchSeq.current) return;
      if (error) {
        toast.error(t('contacts.failedLoad'));
        setLoading(false);
        return;
      }
      contactRows = data ?? [];
      count = exactCount ?? 0;
    }

    setTotalCount(count);

    if (contactRows.length === 0) {
      setContacts([]);
      setLoading(false);
      return;
    }

    const contactIds = contactRows.map((c) => c.id);
    const { data: contactTags } = await supabase
      .from('contact_tags')
      .select('contact_id, tag_id')
      .in('contact_id', contactIds);
    if (seq !== fetchSeq.current) return;

    const tagsByContact: Record<string, string[]> = {};
    contactTags?.forEach((ct) => {
      if (!tagsByContact[ct.contact_id]) tagsByContact[ct.contact_id] = [];
      tagsByContact[ct.contact_id].push(ct.tag_id);
    });

    const enriched: ContactWithTags[] = contactRows.map((c) => ({
      ...c,
      tags: (tagsByContact[c.id] ?? [])
        .map((tid) => tagsMap[tid])
        .filter(Boolean),
    }));

    setContacts(enriched);
    setLoading(false);
  }, [supabase, page, search, selectedTagIds, quickFilter, tagsMap, t]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchTags();
    fetchStats();
  }, [fetchTags, fetchStats]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Keyboard Shortcuts (FH-48)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        if (!isEditing) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        if (!isEditing && canEdit) {
          e.preventDefault();
          openAddForm();
        }
      } else if (e.key === 'Escape') {
        if (search || selectedTagIds.length > 0 || quickFilter !== 'all') {
          setSearch('');
          setSelectedTagIds([]);
          setQuickFilter('all');
          setPage(0);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canEdit, search, selectedTagIds, quickFilter]);

  function openAddForm() {
    setEditContact(null);
    setEditContactTags([]);
    setFormOpen(true);
  }

  async function openEditForm(contact: Contact) {
    const { data } = await supabase
      .from('contact_tags')
      .select('*')
      .eq('contact_id', contact.id);
    setEditContact(contact);
    setEditContactTags(data ?? []);
    setFormOpen(true);
  }

  function openDetail(contactId: string) {
    setDetailContactId(contactId);
    setDetailOpen(true);
  }

  function confirmDelete(contact: Contact) {
    setDeleteTarget(contact);
    setDeleteConfirmOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      toast.error(t('contacts.failedDelete'));
    } else {
      toast.success(t('contacts.successDelete'));
      fetchContacts();
      fetchStats();
    }

    setDeleting(false);
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  }

  const allOnPageSelected =
    contacts.length > 0 && contacts.every((c) => selected.has(c.id));
  const someOnPageSelected = contacts.some((c) => selected.has(c.id));

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        contacts.forEach((c) => next.delete(c.id));
      } else {
        contacts.forEach((c) => next.add(c.id));
      }
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    const ids = [...selected];
    if (ids.length === 0) return;
    setDeleting(true);

    const { error } = await supabase.from('contacts').delete().in('id', ids);

    if (error) {
      toast.error('Falha ao excluir contatos');
    } else {
      toast.success(`${ids.length} ${ids.length === 1 ? 'contato excluído' : 'contatos excluídos'}`);
      setSelected(new Set());
      fetchContacts();
      fetchStats();
    }

    setDeleting(false);
    setBulkDeleteOpen(false);
  }

  function handleExportCSV() {
    const selectedContacts = contacts.filter((c) => selected.has(c.id));
    const listToExport = selectedContacts.length > 0 ? selectedContacts : contacts;

    if (listToExport.length === 0) {
      toast.error('Nenhum contato para exportar');
      return;
    }

    const headers = ['Nome', 'Telefone', 'E-mail', 'CPF/CNPJ', 'Empresa', 'Opt-Out', 'Criado Em'];
    const rows = listToExport.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.cpf_cnpj || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      c.opt_out ? 'Sim' : 'Não',
      `"${new Date(c.created_at).toLocaleDateString('pt-BR')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos_flowhub_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`${listToExport.length} contatos exportados com sucesso!`);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasNext = page < totalPages - 1;
  const hasPrev = page > 0;

  const allTags = Object.values(tagsMap).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const hasActiveFilters = search.trim().length > 0 || selectedTagIds.length > 0 || quickFilter !== 'all';

  function toggleTagFilter(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
    setPage(0);
  }

  function clearTagFilters() {
    setSelectedTagIds([]);
    setPage(0);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div id="tour-contacts-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {t('contacts.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('contacts.pageDescription')} {totalCount > 0 && `${totalCount} ${t('contacts.contacts')}.`}
          </p>
        </div>
        <div id="tour-contacts-actions" className="flex flex-wrap items-center gap-2">
          {canEditSettings && (
            <Button
              variant="outline"
              onClick={() => setCustomFieldsOpen(true)}
              className="border-border text-muted-foreground hover:bg-muted"
            >
              <SlidersHorizontal className="size-4" />
              {t('contacts.customFields.label')}
            </Button>
          )}
          <GatedButton
            variant="outline"
            canAct={canEdit}
            gateReason="add or import contacts"
            onClick={() => setImportOpen(true)}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            <Upload className="size-4" />
            {t('contacts.import')}
          </GatedButton>
          <GatedButton
            canAct={canEdit}
            gateReason="add or import contacts"
            onClick={openAddForm}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
          >
            <Plus className="size-4" />
            {t('contacts.add')}
          </GatedButton>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card/60 p-3.5 flex items-center gap-3 shadow-xs">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Base de Contatos</p>
            <p className="text-lg font-bold text-foreground truncate">{stats.total}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-3.5 flex items-center gap-3 shadow-xs">
          <div className="size-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Mail className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Com E-mail</p>
            <p className="text-lg font-bold text-foreground truncate">{stats.withEmail}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-3.5 flex items-center gap-3 shadow-xs">
          <div className="size-9 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <TagIcon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Tags Criadas</p>
            <p className="text-lg font-bold text-foreground truncate">{stats.tagsCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-3.5 flex items-center gap-3 shadow-xs">
          <div className="size-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Ban className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Opt-Out LGPD</p>
            <p className="text-lg font-bold text-foreground truncate">{stats.optOut}</p>
          </div>
        </div>
      </div>

      {/* Search + Tag filter + Quick Presets */}
      <div id="tour-contacts-filters" className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder={t('contacts.searchPlaceholder')}
                className="pl-8 pr-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
                /
              </kbd>
            </div>

            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-muted shrink-0 gap-1.5"
                  />
                }
              >
                <Filter className="size-4" />
                {t('contacts.filterByTags')}
                {selectedTagIds.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                    {selectedTagIds.length}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-0 bg-popover border-border">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-sm font-medium text-popover-foreground">
                    {t('contacts.filterByTags')}
                  </span>
                  {selectedTagIds.length > 0 && (
                    <button
                      onClick={clearTagFilters}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {t('contacts.clearAll')}
                    </button>
                  )}
                </div>
                {allTags.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                    {t('contacts.noTagsYet')}
                  </p>
                ) : (
                  <div className="max-h-64 overflow-y-auto py-1">
                    {allTags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedTagIds.includes(tag.id)}
                          onCheckedChange={() => toggleTagFilter(tag.id)}
                          aria-label={`Filter by ${tag.name}`}
                        />
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm text-popover-foreground truncate">
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Filter Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                setQuickFilter('all');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                quickFilter === 'all'
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => {
                setQuickFilter('email');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                quickFilter === 'email'
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Com E-mail
            </button>
            <button
              onClick={() => {
                setQuickFilter('document');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                quickFilter === 'document'
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Com CPF/CNPJ
            </button>
            <button
              onClick={() => {
                setQuickFilter('opt_out');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                quickFilter === 'opt_out'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Opt-Out
            </button>
          </div>
        </div>

        {/* Active Tag Filter Chips */}
        {selectedTagIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {selectedTagIds.map((id) => {
              const tag = tagsMap[id];
              if (!tag) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border"
                  style={{
                    backgroundColor: tag.color + '15',
                    borderColor: tag.color + '40',
                    color: tag.color,
                  }}
                >
                  {tag.name}
                  <button
                    onClick={() => toggleTagFilter(id)}
                    aria-label={`Remove ${tag.name} filter`}
                    className="hover:opacity-70"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearTagFilters}
              className="text-xs text-muted-foreground hover:text-foreground px-1.5 underline"
            >
              {t('contacts.clearAll')}
            </button>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="sticky top-4 z-20 flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-card/95 backdrop-blur-md px-4 py-2.5 shadow-lg animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-bold">
              {selected.size}
            </span>
            {selected.size === 1 ? t('contacts.contact') : t('contacts.contacts')} {t('dashboard.showing').toLowerCase()}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkTagOpen(true)}
              className="border-border text-foreground hover:bg-muted gap-1.5"
            >
              <TagIcon className="size-3.5 text-primary" />
              Etiquetar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-border text-foreground hover:bg-muted gap-1.5"
            >
              <Download className="size-3.5" />
              Exportar CSV
            </Button>
            <GatedButton
              variant="destructive"
              size="sm"
              canAct={canEdit}
              gateReason="delete contacts"
              onClick={() => setBulkDeleteOpen(true)}
              className="gap-1.5"
            >
              <Trash2 className="size-3.5" />
              {t('contacts.deleteSelected')}
            </GatedButton>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
              className="text-muted-foreground hover:text-foreground"
            >
              {t('contacts.clear')}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div id="tour-contacts-table" className="rounded-xl border border-border overflow-hidden bg-card/50 shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPageSelected}
                  indeterminate={!allOnPageSelected && someOnPageSelected}
                  onCheckedChange={toggleSelectAll}
                  disabled={contacts.length === 0}
                  aria-label="Selecionar todos os contatos desta página"
                />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">{t('contacts.table.name')}</TableHead>
              <TableHead className="text-muted-foreground font-medium">{t('contacts.table.phone')}</TableHead>
              <TableHead className="text-muted-foreground font-medium hidden md:table-cell">CPF / CNPJ</TableHead>
              <TableHead className="text-muted-foreground font-medium hidden md:table-cell">{t('contacts.table.email')}</TableHead>
              <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">{t('contacts.table.company')}</TableHead>
              <TableHead className="text-muted-foreground font-medium hidden md:table-cell">{t('contacts.table.tags')}</TableHead>
              <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">{t('contacts.table.created')}</TableHead>
              <TableHead className="text-muted-foreground font-medium w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton Loader Rows (FH-46)
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="w-10">
                    <div className="size-4 rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
                  <TableCell className="hidden md:table-cell"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
                  <TableCell className="hidden md:table-cell"><div className="h-4 w-36 rounded bg-muted animate-pulse" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
                  <TableCell className="hidden md:table-cell"><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-8 rounded bg-muted animate-pulse ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : contacts.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={9} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-center">
                    <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-1">
                      <Users className="size-6" />
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      {hasActiveFilters
                        ? t('contacts.noContactsFiltered')
                        : t('contacts.noContacts')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasActiveFilters
                        ? 'Tente remover alguns filtros para visualizar mais resultados.'
                        : 'Comece adicionando seu primeiro contato ou importando uma planilha CSV.'}
                    </p>
                    {!hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openAddForm}
                        className="mt-3 border-border text-foreground hover:bg-muted gap-1.5"
                      >
                        <Plus className="size-4 text-primary" />
                        {t('contacts.addFirstContact')}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="border-border hover:bg-muted/40 transition-colors cursor-pointer group"
                  onClick={() => openDetail(contact.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(contact.id)}
                      onCheckedChange={() => toggleSelect(contact.id)}
                      aria-label={`Select ${contact.name || contact.phone}`}
                    />
                  </TableCell>

                  <TableCell className="text-foreground font-medium">
                    <div className="flex items-center gap-3">
                      <ContactAvatar
                        name={contact.name}
                        phone={contact.phone}
                        avatarUrl={contact.avatar_url}
                        size="sm"
                      />
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="truncate">
                            {contact.name || <span className="text-muted-foreground italic font-normal">{t('contacts.unnamed')}</span>}
                          </span>
                          {contact.opt_out && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/10 px-1.5 py-0.2 text-[10px] font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              Opt-Out
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {contact.phone}
                  </TableCell>

                  <TableCell className="text-muted-foreground hidden md:table-cell text-xs font-mono">
                    {contact.cpf_cnpj || <span className="text-muted-foreground/40">-</span>}
                  </TableCell>

                  <TableCell className="text-muted-foreground hidden md:table-cell text-xs truncate max-w-[180px]">
                    {contact.email || <span className="text-muted-foreground/40">-</span>}
                  </TableCell>

                  <TableCell className="text-muted-foreground hidden lg:table-cell text-xs truncate max-w-[140px]">
                    {contact.company || <span className="text-muted-foreground/40">-</span>}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags && contact.tags.length > 0 ? (
                        contact.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border"
                            style={{
                              backgroundColor: tag.color + '15',
                              borderColor: tag.color + '30',
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">-</span>
                      )}
                      {contact.tags && contact.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground font-medium px-1">
                          +{contact.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-xs hidden lg:table-cell whitespace-nowrap">
                    {new Date(contact.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Conversar no Inbox"
                        onClick={() => router.push(`/inbox?contactId=${contact.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <MessageSquare className="size-3.5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-foreground"
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem
                            onClick={() => router.push(`/inbox?contactId=${contact.id}`)}
                            className="text-popover-foreground focus:bg-muted focus:text-foreground gap-2"
                          >
                            <MessageSquare className="size-4 text-primary" />
                            Conversar no Inbox
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditForm(contact)}
                            className="text-popover-foreground focus:bg-muted focus:text-foreground gap-2"
                          >
                            <Pencil className="size-4" />
                            {t('contacts.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => confirmDelete(contact)}
                            className="gap-2"
                          >
                            <Trash2 className="size-4" />
                            {t('contacts.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Exibindo {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalCount)} de{' '}
            {totalCount} contatos
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!hasPrev}
              onClick={() => setPage((p) => p - 1)}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {page + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Contact Form Dialog */}
      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editContact}
        contactTags={editContactTags}
        onSaved={() => {
          fetchContacts();
          fetchTags();
          fetchStats();
        }}
        onViewExisting={(id) => {
          setFormOpen(false);
          openDetail(id);
        }}
      />

      {/* Contact Detail Sheet */}
      <ContactDetailView
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contactId={detailContactId}
        onUpdated={() => {
          fetchContacts();
          fetchStats();
        }}
      />

      {/* Import Modal */}
      <ImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => {
          fetchContacts();
          fetchStats();
        }}
      />

      {/* Custom Fields Manager */}
      {canEditSettings && (
        <CustomFieldsManager
          open={customFieldsOpen}
          onOpenChange={setCustomFieldsOpen}
        />
      )}

      {/* Bulk Tag Modal */}
      <BulkTagModal
        open={bulkTagOpen}
        onOpenChange={setBulkTagOpen}
        selectedContactIds={[...selected]}
        allTags={allTags}
        onComplete={() => {
          fetchContacts();
          setSelected(new Set());
        }}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">{t('contacts.deleteConfirm.title')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('contacts.deleteConfirm.description')}{' '}
              <span className="text-popover-foreground font-medium">
                {deleteTarget?.name || deleteTarget?.phone}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-popover border-border">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-border text-muted-foreground hover:bg-muted"
            >
              {t('contacts.deleteConfirm.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              {t('contacts.deleteConfirm.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">
              {selected.size === 1 
                ? t('contacts.deleteConfirm.bulkTitle') 
                : t('contacts.deleteConfirm.bulkTitlePlural', { count: selected.size })}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selected.size === 1 
                ? t('contacts.deleteConfirm.bulkDescription') 
                : t('contacts.deleteConfirm.bulkDescriptionPlural', { count: selected.size })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-popover border-border">
            <Button
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              className="border-border text-muted-foreground hover:bg-muted"
            >
              {t('contacts.deleteConfirm.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              {t('contacts.deleteConfirm.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
