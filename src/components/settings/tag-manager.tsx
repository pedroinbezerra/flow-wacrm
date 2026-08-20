'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Tag as TagIcon, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types';

const PRESET_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
];

/**
 * Tags card — colour-coded contact labels. Creation is an inline row
 * (name + colour swatch + Add); deletion goes through a confirmation
 * dialog since it detaches the tag from every contact.
 */
export function TagManager() {
  const supabase = createClient();
  const { user, accountId, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[3].value);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchTags(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  async function fetchTags(userId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
      toast.error('Falha ao carregar tags');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newTagName.trim()) {
      toast.error('O nome da tag é obrigatório');
      return;
    }

    try {
      setSaving(true);
      if (!user || !accountId) {
        toast.error('Sessão não autenticada');
        return;
      }

      // account_id is mandatory on every account-scoped insert (NOT
      // NULL + RLS, no DB default).
      const { error } = await supabase.from('tags').insert({
        user_id: user.id,
        account_id: accountId,
        name: newTagName.trim(),
        color: selectedColor,
      });

      if (error) throw error;

      toast.success('Tag criada com sucesso');
      setNewTagName('');
      setSelectedColor(PRESET_COLORS[3].value);
      await fetchTags(user.id);
    } catch (err) {
      console.error('Create error:', err);
      toast.error('Falha ao criar tag');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(tag: Tag) {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!tagToDelete) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagToDelete.id);

      if (error) throw error;

      toast.success(t('settings.tags.deleted'));
      setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(t('settings.tags.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <TagIcon className="size-4 text-primary" />
          {t('settings.tags.title')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('settings.tags.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      border: `1px solid ${tag.color}40`,
                    }}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => confirmDelete(tag)}
                      aria-label={`Delete ${tag.name}`}
                      className="ml-0.5 rounded-full p-0.5 opacity-60 transition-opacity hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('settings.tags.noTagsYet')}
              </p>
            )}

            {/* Tag Creation Block */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Nome da tag (ex: Novidades, VIP, Suporte)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                  disabled={saving}
                  maxLength={40}
                  className="flex-1 h-9 text-sm"
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCreate}
                  disabled={saving || !newTagName.trim()}
                  className="w-full sm:w-auto h-9 px-4 text-xs font-semibold gap-1.5 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                  <span>{t('settings.fieldsAndTags.addTag')}</span>
                </Button>
              </div>

              {/* Color selection row + Live Preview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">
                    Cor:
                  </span>
                  <div className="flex items-center gap-3 sm:gap-3.5 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        aria-label={`Usar cor ${color.name}`}
                        aria-pressed={selectedColor === color.value}
                        className={cn(
                          'size-6 rounded-full transition-transform hover:scale-115 focus:outline-none shadow-xs',
                          selectedColor === color.value
                            ? 'ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110'
                            : 'opacity-80 hover:opacity-100',
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Live tag preview chip */}
                {newTagName.trim() ? (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto">
                    <span>Prévia:</span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${selectedColor}20`,
                        color: selectedColor,
                        border: `1px solid ${selectedColor}40`,
                      }}
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: selectedColor }}
                      />
                      {newTagName.trim()}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deletar tag</DialogTitle>
            <DialogDescription>
              Deletar a tag &quot;{tagToDelete?.name}&quot;? Isso remove a tag de todos os contatos associados e não pode ser desfeito.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete tag'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
