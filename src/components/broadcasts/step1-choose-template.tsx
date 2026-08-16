'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageTemplate } from '@/types';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ArrowRight, Search } from 'lucide-react';

const categoryColors: Record<string, string> = {
  Marketing: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  Utility: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  Authentication: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
};

const categoryLabels: Record<string, string> = {
  Marketing: 'broadcasts.categoryMarketing',
  Utility: 'broadcasts.categoryUtility',
  Authentication: 'broadcasts.categoryAuthentication',
};

interface Step1Props {
  selectedTemplate: MessageTemplate | null;
  onSelect: (template: MessageTemplate) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step1ChooseTemplate({ selectedTemplate, onSelect, onNext, onBack }: Step1Props) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('message_templates')
          .select('*')
          .eq('status', 'APPROVED')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setTemplates(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('broadcasts.failedLoadTemplates'));
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [t]);

  const filteredTemplates = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (tmpl) =>
        tmpl.name.toLowerCase().includes(q) ||
        (tmpl.body_text && tmpl.body_text.toLowerCase().includes(q)),
    );
  }, [templates, search]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('broadcasts.chooseTemplate')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('broadcasts.chooseTemplateDescription')}
        </p>
      </div>

      {/* Search Input */}
      {templates.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('broadcasts.searchTemplatesPlaceholder')}
            className="pl-9 border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
        </div>
      )}

      {filteredTemplates.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-border bg-card/50">
          <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {search.trim() ? t('common.noResults') : t('broadcasts.noTemplates')}
          </p>
          {!search.trim() && (
            <p className="mt-1 text-xs text-muted-foreground">{t('broadcasts.createTemplateFirst')}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;
            const catColor = categoryColors[template.category] ?? categoryColors.Utility;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template)}
                className={`flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border bg-card/50 hover:border-border hover:bg-card'
                }`}
              >
                <div className="flex min-w-0 flex-wrap items-start gap-2">
                  <h3 className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground wrap-break-word">
                    {template.name}
                  </h3>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${catColor}`}
                  >
                    {t(categoryLabels[template.category] ?? 'broadcasts.categoryUtility')}
                  </span>
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">{template.body_text}</p>
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="max-w-full truncate whitespace-nowrap rounded-full border border-border/70 px-2 py-0.5">
                    {template.language ?? 'en_US'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" onClick={onBack} className="border-border text-muted-foreground">
          {t('common.back')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedTemplate}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {t('common.next')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

