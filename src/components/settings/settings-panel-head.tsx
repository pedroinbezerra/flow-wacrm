import type { ReactNode } from 'react';
import { User, Building2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

export type SettingsScope = 'personal' | 'account';

/**
 * Section header shown at the top of every settings panel — a title,
 * a one-line description, optional scope badge, and an optional action.
 */
export function SettingsPanelHead({
  title,
  description,
  action,
  scope,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  scope?: SettingsScope;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/50 pb-4',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {scope === 'personal' ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <User className="size-3" />
              {t('settings.scopes.personal')}
            </span>
          ) : scope === 'account' ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              <Building2 className="size-3" />
              {t('settings.scopes.account')}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="max-w-[65ch] text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
    </div>
  );
}

