import {
  Coins,
  FileText,
  LayoutGrid,
  Palette,
  PlugZap,
  Shield,
  Tags,
  User,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

/**
 * Settings information architecture for the redesigned page.
 *
 * The flat tab strip became a grouped left rail with a new Overview
 * landing. The URL query param stays `?tab=` (deep-linkable, and it
 * keeps the existing links in sidebar.tsx / header.tsx working) — we
 * just map the old values onto the new sections.
 *
 * IMPORTANT: Labels are now dynamic i18n keys. Use them with useTranslation
 * in the SettingsRail component to render localized labels.
 */
export const SETTINGS_SECTIONS = [
  'overview',
  'profile',
  'security',
  'appearance',
  'whatsapp',
  'templates',
  'fields',
  'deals',
  'members',
] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export const DEFAULT_SECTION: SettingsSection = 'overview';

/** Rail grouping. `adminOnly` items are hidden for non-admins. */
export interface SectionMeta {
  id: SettingsSection;
  labelKey: string; // i18n key instead of direct label
  icon: LucideIcon;
  group: 'top' | 'account' | 'workspace';
}

export const SECTION_META: Record<SettingsSection, SectionMeta> = {
  overview: { id: 'overview', labelKey: 'settings.sections.overview', icon: LayoutGrid, group: 'top' },
  profile: { id: 'profile', labelKey: 'settings.sections.yourProfile', icon: User, group: 'account' },
  security: { id: 'security', labelKey: 'settings.sections.loginSecurity', icon: Shield, group: 'account' },
  appearance: { id: 'appearance', labelKey: 'settings.sections.appearance', icon: Palette, group: 'account' },
  whatsapp: { id: 'whatsapp', labelKey: 'settings.sections.whatsapp', icon: PlugZap, group: 'workspace' },
  templates: { id: 'templates', labelKey: 'settings.sections.templates', icon: FileText, group: 'workspace' },
  fields: { id: 'fields', labelKey: 'settings.sections.fieldsAndTags', icon: Tags, group: 'workspace' },
  deals: { id: 'deals', labelKey: 'settings.sections.dealsAndCurrency', icon: Coins, group: 'workspace' },
  members: { id: 'members', labelKey: 'settings.sections.teamMembers', icon: UsersRound, group: 'workspace' },
};

export const RAIL_GROUPS: { labelKey: string | null; group: SectionMeta['group'] }[] = [
  { labelKey: null, group: 'top' },
  { labelKey: 'settings.groups.account', group: 'account' },
  { labelKey: 'settings.groups.workspace', group: 'workspace' },
];

function isSection(value: string | null): value is SettingsSection {
  return !!value && (SETTINGS_SECTIONS as readonly string[]).includes(value);
}

/**
 * Resolve a raw `?tab=` value to a section. Legacy tabs from the old
 * flat layout collapse onto their new home (Tags + Custom fields → the
 * merged "Fields & tags" section). Anything unknown falls back to the
 * Overview landing.
 */
export function resolveSection(raw: string | null): SettingsSection {
  if (raw === 'tags' || raw === 'custom-fields') return 'fields';
  if (isSection(raw)) return raw;
  return DEFAULT_SECTION;
}
