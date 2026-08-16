'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';
import type { Tag } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tag as TagIcon, Loader2, Plus, Minus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BulkTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContactIds: string[];
  allTags: Tag[];
  onComplete: () => void;
}

export function BulkTagModal({
  open,
  onOpenChange,
  selectedContactIds,
  allTags,
  onComplete,
}: BulkTagModalProps) {
  const supabase = createClient();
  const { t } = useTranslation();

  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTagIds([]);
      setSearch('');
      setMode('add');
    }
  }, [open]);

  const filteredTags = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleApply() {
    if (selectedTagIds.length === 0 || selectedContactIds.length === 0) return;
    setSaving(true);

    try {
      if (mode === 'add') {
        // Fetch existing tags for these contacts to prevent duplicates
        const { data: existing } = await supabase
          .from('contact_tags')
          .select('contact_id, tag_id')
          .in('contact_id', selectedContactIds)
          .in('tag_id', selectedTagIds);

        const existingMap = new Set(
          (existing ?? []).map((row) => `${row.contact_id}:${row.tag_id}`)
        );

        const newRows: { contact_id: string; tag_id: string }[] = [];
        for (const contactId of selectedContactIds) {
          for (const tagId of selectedTagIds) {
            if (!existingMap.has(`${contactId}:${tagId}`)) {
              newRows.push({ contact_id: contactId, tag_id: tagId });
            }
          }
        }

        if (newRows.length > 0) {
          const { error } = await supabase.from('contact_tags').insert(newRows);
          if (error) throw error;
        }

        toast.success(
          `Tags adicionadas a ${selectedContactIds.length} ${
            selectedContactIds.length === 1 ? 'contato' : 'contatos'
          }`
        );
      } else {
        // Remove tags
        const { error } = await supabase
          .from('contact_tags')
          .delete()
          .in('contact_id', selectedContactIds)
          .in('tag_id', selectedTagIds);

        if (error) throw error;

        toast.success(
          `Tags removidas de ${selectedContactIds.length} ${
            selectedContactIds.length === 1 ? 'contato' : 'contatos'
          }`
        );
      }

      onComplete();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar tags em lote');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TagIcon className="size-5 text-primary" />
            <DialogTitle className="text-popover-foreground">
              Etiquetar em Lote ({selectedContactIds.length})
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Escolha as tags que deseja adicionar ou remover dos {selectedContactIds.length} contatos selecionados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mode Switcher */}
          <div className="flex rounded-lg border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'add'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus className="size-3.5" />
              Adicionar Tags
            </button>
            <button
              type="button"
              onClick={() => setMode('remove')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'remove'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Minus className="size-3.5" />
              Remover Tags
            </button>
          </div>

          {/* Search Tags */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tag..."
              className="pl-8 h-8 text-xs bg-card border-border"
            />
          </div>

          {/* Tags List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredTags.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhuma tag encontrada.
              </p>
            ) : (
              filteredTags.map((tag) => {
                const checked = selectedTagIds.includes(tag.id);
                return (
                  <label
                    key={tag.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      checked ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleTag(tag.id)}
                        aria-label={`Tag ${tag.name}`}
                      />
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {tag.name}
                      </span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="bg-popover border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            {t('contacts.deleteConfirm.cancel')}
          </Button>
          <Button
            onClick={handleApply}
            disabled={saving || selectedTagIds.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving && <Loader2 className="size-4 animate-spin mr-1.5" />}
            {mode === 'add' ? 'Aplicar Tags' : 'Remover Tags'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
