'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  ChevronRight,
  Loader2,
  User,
  Shield,
  Palette,
  Cookie,
  CreditCard,
  PlugZap,
  Bot,
  FileText,
  Tags,
  Coins,
  UsersRound,
  Sparkles,
  ArrowUpRight,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Building2,
  Key,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { useTheme } from '@/hooks/use-theme';
import { THEMES } from '@/lib/themes';
import { CURRENCIES } from '@/lib/currency';
import { ContactAvatar } from '@/components/ui/contact-avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { SECTION_META, type SettingsSection } from './settings-sections';
import { SettingsChip, StatusDot } from './settings-chip';
import { ROLE_META } from './role-meta';

interface OverviewCounts {
  members: number | null;
  pendingInvites: number | null;
  templates: number | null;
  templatesPending: number | null;
  tags: number | null;
  customFields: number | null;
}

interface WhatsAppStatus {
  configured: boolean;
  connected: boolean;
}

export function SettingsOverview({
  onSelect,
}: {
  onSelect: (section: SettingsSection) => void;
}) {
  const { user, profile, accountId, accountRole, defaultCurrency, canManageMembers } =
    useAuth();
  const { mode, theme, setMode } = useTheme();
  const { t } = useTranslation();

  const [counts, setCounts] = useState<OverviewCounts | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);
  const [whatsapp, setWhatsapp] = useState<WhatsAppStatus | null>(null);
  const [whatsappLoading, setWhatsappLoading] = useState(true);

  useEffect(() => {
    if (!user || !accountId) return;
    let cancelled = false;
    const supabase = createClient();
    const userId = user.id;
    const acctId = accountId;

    // Cheap counts — resolve fast, render immediately.
    (async () => {
      setCountsLoading(true);
      const [membersRes, invitesRes, templatesTotal, templatesPending, tagsRes, fieldsRes] =
        await Promise.allSettled([
          fetch('/api/account/members', { cache: 'no-store' }).then((r) => r.json()),
          canManageMembers
            ? fetch('/api/account/invitations', { cache: 'no-store' }).then((r) =>
                r.json(),
              )
            : Promise.resolve(null),
          supabase
            .from('message_templates')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
          supabase
            .from('message_templates')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'PENDING'),
          supabase
            .from('tags')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
          supabase.from('custom_fields').select('id', { count: 'exact', head: true }),
        ]);

      if (cancelled) return;

      const members =
        membersRes.status === 'fulfilled' && Array.isArray(membersRes.value?.members)
          ? membersRes.value.members.length
          : null;
      const pendingInvites =
        invitesRes.status === 'fulfilled' &&
        invitesRes.value &&
        Array.isArray(invitesRes.value.invitations)
          ? invitesRes.value.invitations.length
          : null;

      setCounts({
        members,
        pendingInvites,
        templates:
          templatesTotal.status === 'fulfilled'
            ? templatesTotal.value.count ?? null
            : null,
        templatesPending:
          templatesPending.status === 'fulfilled'
            ? templatesPending.value.count ?? null
            : null,
        tags: tagsRes.status === 'fulfilled' ? tagsRes.value.count ?? null : null,
        customFields:
          fieldsRes.status === 'fulfilled' ? fieldsRes.value.count ?? null : null,
      });
      setCountsLoading(false);
    })();

    // WhatsApp connection status — slower, independent.
    (async () => {
      setWhatsappLoading(true);
      const [row, health] = await Promise.allSettled([
        supabase
          .from('whatsapp_config')
          .select('phone_number_id')
          .eq('account_id', acctId)
          .maybeSingle(),
        fetch('/api/whatsapp/config', { cache: 'no-store' }).then((r) => r.json()),
      ]);
      if (cancelled) return;
      setWhatsapp({
        configured: row.status === 'fulfilled' && !!row.value.data?.phone_number_id,
        connected: health.status === 'fulfilled' && !!health.value?.connected,
      });
      setWhatsappLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, accountId, canManageMembers]);

  const displayName = profile?.full_name || profile?.email || 'Sua conta';
  const roleMeta = accountRole ? ROLE_META[accountRole] : null;
  const RoleIcon = roleMeta?.icon;

  const currencyLabel =
    CURRENCIES.find((c) => c.code === defaultCurrency)?.label ?? defaultCurrency;
  const themeObj = THEMES.find((t) => t.id === theme);
  const themeName = themeObj?.name ?? theme;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* HERO COMMAND BANNER */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <ContactAvatar
                name={displayName}
                avatarUrl={profile?.avatar_url}
                size="2xl"
                className="size-16 sm:size-18 shadow-2xs ring-1 ring-border"
              />
              <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-card bg-emerald-500" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                  {displayName}
                </h1>
                {roleMeta && RoleIcon ? (
                  <SettingsChip variant={roleMeta.variant}>
                    <RoleIcon />
                    {roleMeta.label}
                  </SettingsChip>
                ) : null}
              </div>

              {profile?.email ? (
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {profile.email}
                </p>
              ) : null}

              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Building2 className="size-3 text-primary shrink-0" />
                  ID da Conta: {accountId?.slice(0, 8) ?? '—'}...
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect('profile')}
              className="gap-1.5 text-xs font-semibold h-9"
            >
              <User className="size-3.5 text-primary" />
              Editar Perfil
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect('security')}
              className="gap-1.5 text-xs font-semibold h-9"
            >
              <Shield className="size-3.5 text-primary" />
              Segurança
            </Button>
          </div>
        </div>
      </div>

      {/* LIVE METRICS PULSE STRIP — 1 col on mobile, 2 cols on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* WhatsApp Health Metric */}
        <div
          onClick={() => onSelect('whatsapp')}
          className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              WhatsApp API
            </span>
            <PlugZap className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {whatsappLoading ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : whatsapp?.connected ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500" />
                Conectado
              </span>
            ) : whatsapp?.configured ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span className="size-2 rounded-full bg-amber-500" />
                Reconectar
              </span>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                Pendente
              </span>
            )}
          </div>
        </div>

        {/* Equipe Metric */}
        <div
          onClick={() => onSelect('members')}
          className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Membros Equipe
            </span>
            <UsersRound className="size-4 text-purple-500" />
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            {countsLoading ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              `${counts?.members ?? 0} ativo(s)`
            )}
          </div>
        </div>

        {/* Templates Metric */}
        <div
          onClick={() => onSelect('templates')}
          className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Modelos Meta
            </span>
            <FileText className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            {countsLoading ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              `${counts?.templates ?? 0} modelo(s)`
            )}
          </div>
        </div>

        {/* Billing & Currency Metric */}
        <div
          onClick={() => onSelect('deals')}
          className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Moeda Comercial
            </span>
            <Coins className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground font-mono">
            {defaultCurrency} — {currencyLabel}
          </div>
        </div>
      </div>

      {/* CATEGORIZED COMMAND HUBS */}
      <div className="space-y-6">
        {/* GROUP 1: SUA CONTA */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <User className="size-4 text-blue-500" />
            <span>Configurações Pessoais da Sua Conta</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Profile Tile */}
            <div
              onClick={() => onSelect('profile')}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <User className="size-4" />
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-foreground">Seu Perfil</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Foto, nome de exibição e dados fiscais CPF/CNPJ.
                </p>
              </div>
            </div>

            {/* Security Tile */}
            <div
              onClick={() => onSelect('security')}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Shield className="size-4" />
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-foreground">Login e Segurança</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Alterar senha e gerenciar sessões ativas.
                </p>
              </div>
            </div>

            {/* Quick Interactive Appearance Tile */}
            <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 shadow-2xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Palette className="size-4" />
                </div>
                <button
                  type="button"
                  onClick={() => onSelect('appearance')}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                >
                  Personalizar <ChevronRight className="size-3" />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Aparência & Tema</h3>
                  <p className="text-xs text-muted-foreground">
                    Modo {mode === 'light' ? 'Claro' : 'Escuro'} · Destaque {themeName}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-4 rounded-full border border-border/60 shadow-xs"
                      style={{ background: themeObj?.swatch ?? '#8b5cf6' }}
                    />
                    <span className="text-[11px] font-semibold text-foreground">
                      {themeName}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                    className="h-7 px-2 text-[11px] font-semibold"
                  >
                    {mode === 'light' ? (
                      <>
                        <Sun className="size-3 text-amber-500 mr-1" /> Claro
                      </>
                    ) : (
                      <>
                        <Moon className="size-3 text-purple-400 mr-1" /> Escuro
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 2: WORKSPACE & OPERAÇÃO */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Building2 className="size-4 text-purple-500" />
            <span>Configurações do Workspace & Operação</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* WhatsApp Integration */}
            <div
              onClick={() => onSelect('whatsapp')}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <PlugZap className="size-4" />
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-foreground">Conexão WhatsApp WABA</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Meta Cloud API, webhooks e diagnóstico em tempo real.
                </p>
              </div>
            </div>

            {/* AI Assistant */}
            <div
              onClick={() => onSelect('ai')}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                  <Bot className="size-4" />
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-foreground">Inteligência Artificial</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Provedores OpenAI/Groq/DeepSeek, modelos e chaves de API.
                </p>
              </div>
            </div>

            {/* Plano & Assinatura */}
            <div
              onClick={() => onSelect('billing')}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <CreditCard className="size-4" />
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-foreground">Plano & Faturamento</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Recursos ativos, add-ons e histórico de notas fiscais.
                </p>
              </div>
            </div>

            {/* Membros da Equipe */}
            <div
              onClick={() => onSelect('members')}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <UsersRound className="size-4" />
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-foreground">Membros da Equipe</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Gestão de acessos, convites e permissões de função.
                </p>
              </div>
            </div>

            {/* Modelos de Mensagem */}
            <div
              onClick={() => onSelect('templates')}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <FileText className="size-4" />
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-foreground">Modelos de Mensagem</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Modelos de transmissão HSM aprovados pela Meta.
                </p>
              </div>
            </div>

            {/* Campos e Tags */}
            <div
              onClick={() => onSelect('fields')}
              className="group cursor-pointer rounded-xl border border-border bg-card/90 p-4 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  <Tags className="size-4" />
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-foreground">Campos e Tags</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Tags coloridas e atributos customizados de contatos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
