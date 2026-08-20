'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ChevronDown, LayoutGrid, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import {
  RAIL_GROUPS,
  SECTION_META,
  SETTINGS_SECTIONS,
  type SettingsSection,
} from './settings-sections';

const RAIL_DESKTOP_MIN_PX = 1024;

export function SettingsRail({
  active,
  onSelect,
  hints,
}: {
  active: SettingsSection;
  onSelect: (section: SettingsSection) => void;
  hints?: Partial<Record<SettingsSection, ReactNode>>;
}) {
  const { t } = useTranslation();
  const activeRef = useRef<HTMLButtonElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeMeta = SECTION_META[active];
  const ActiveIcon = activeMeta.icon;

  // Auto-scroll active chip into view on mobile strip
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia(`(min-width: ${RAIL_DESKTOP_MIN_PX}px)`).matches) return;
    activeRef.current?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [active]);

  const handleSelect = (section: SettingsSection) => {
    onSelect(section);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* MOBILE CONTROL BAR (< 1024px) */}
      <div className="block lg:hidden mb-6">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-2 shadow-xs">
          {active !== 'overview' ? (
            <button
              type="button"
              onClick={() => handleSelect('overview')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="size-4" />
              <span>{t('settings.mobileNav.backToOverview')}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-foreground">
              <LayoutGrid className="size-4 text-primary" />
              <span>{t('settings.title')}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2 truncate">
              <ActiveIcon className="size-4 shrink-0 text-primary" />
              <span className="truncate">{t(activeMeta.labelKey)}</span>
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                mobileMenuOpen && 'rotate-180',
              )}
            />
          </button>
        </div>

        {/* Mobile Dropdown Modal Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-xs p-4 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="size-5 text-primary" />
                <span className="text-base font-bold text-foreground">
                  {t('settings.mobileNav.allSections')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {RAIL_GROUPS.map(({ labelKey, group }) => {
                const items = SETTINGS_SECTIONS.filter(
                  (s) => SECTION_META[s].group === group,
                );
                return (
                  <div key={group} className="space-y-1">
                    {labelKey ? (
                      <div className="px-2 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        {t(labelKey)}
                      </div>
                    ) : null}
                    <div className="grid grid-cols-1 gap-1">
                      {items.map((s) => {
                        const meta = SECTION_META[s];
                        const Icon = meta.icon;
                        const isActive = s === active;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSelect(s)}
                            className={cn(
                              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors border',
                              isActive
                                ? 'border-primary/40 bg-primary-soft text-primary font-semibold'
                                : 'border-transparent bg-card hover:bg-muted text-foreground',
                            )}
                          >
                            <span
                              className={cn(
                                'flex size-8 shrink-0 items-center justify-center rounded-lg',
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground',
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <span className="flex-1">{t(meta.labelKey)}</span>
                            {hints?.[s] != null ? (
                              <span className="text-xs text-muted-foreground">
                                {hints[s]}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP RAIL (≥ 1024px) */}
      <nav
        id="tour-settings-rail"
        aria-label="Settings sections"
        className="hidden lg:sticky lg:top-0 lg:flex lg:flex-col lg:gap-1 lg:w-58 lg:shrink-0"
      >
        {RAIL_GROUPS.map(({ labelKey, group }) => {
          const items = SETTINGS_SECTIONS.filter(
            (s) => SECTION_META[s].group === group,
          );
          return (
            <div key={group} className="flex flex-col gap-0.5">
              {labelKey ? (
                <div className="px-3 pt-3.5 pb-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  {t(labelKey)}
                </div>
              ) : null}
              {items.map((s) => {
                const meta = SECTION_META[s];
                const Icon = meta.icon;
                const isActive = s === active;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSelect(s)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary-soft text-primary font-semibold shadow-2xs'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{t(meta.labelKey)}</span>
                    {hints?.[s] != null ? (
                      <span
                        className={cn(
                          'inline-flex items-center text-xs',
                          isActive ? 'text-primary font-semibold' : 'text-muted-foreground',
                        )}
                      >
                        {hints[s]}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </>
  );
}

