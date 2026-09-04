'use client';

// ============================================================
// MembersTab — Settings → Members
//
// Two stacked sections:
//   1. Roster   — every member of the account. Admin+ can change a
//                 teammate's role inline and remove them. Owner row
//                 is non-editable everywhere (transfer is its own
//                 separate flow, deferred to a later PR).
//   2. Pending  — outstanding invite links. Admin+ can revoke. The
//                 plaintext URL is gone after the create dialog
//                 closes, so we surface a "revoke + new link" hint
//                 rather than pretending we can resurface it.
//
// Role-gating
//   The tab itself is reachable by any member, but mutation buttons
//   are wrapped in `<RequireRole min="admin">` / `useCan` so an
//   agent or viewer sees the roster read-only. The server-side
//   RPCs (set_member_role, remove_account_member) double-check
//   the role anyway.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Loader2,
  LogOut,
  Mail,
  MailX,
  Plus,
  Trash2,
  UsersRound,
} from 'lucide-react';

import { ContactAvatar } from '@/components/ui/contact-avatar';
import {
  AvatarBadge,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequireRole } from '@/components/auth/require-role';
import { useAuth } from '@/hooks/use-auth';
import { usePresence } from '@/hooks/use-presence';
import type { AccountRole } from '@/lib/auth/roles';
import { presenceLabel, summarize } from '@/lib/presence';
import {
  PRESENCE_DOT_CLASS,
  PresenceDot,
} from '@/components/presence/presence-dot';
import { InviteMemberDialog } from './invite-member-dialog';
import { SettingsPanelHead } from './settings-panel-head';
import { ROLE_META } from './role-meta';

const SECTOR_OPTIONS = [
  { value: "finance", label: "Financeiro" },
  { value: "support", label: "Suporte técnico" },
  { value: "sales", label: "Vendas e comercial" },
  { value: "operations", label: "Operações" },
  { value: "leadership", label: "Diretoria" },
];

interface Member {
  user_id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  role: AccountRole;
  sector?: string | null;
  joined_at: string;
}

interface Invitation {
  id: string;
  role: 'admin' | 'agent' | 'viewer';
  label: string | null;
  created_at: string;
  expires_at: string;
}

// Per-role chip metadata (icon / label / colour) lives in the shared
// ROLE_META module so this roster and the Overview identity chip can't
// drift. The colour scale runs amber (owner — scarce, immutable) →
// primary (admin) → muted (agent / viewer).

function fmtDate(iso: string): string {
  // Match the rest of the dashboard's locale-light formatting.
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function fmtExpiresIn(iso: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return t('settings.members.expired');
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days >= 1) return t('settings.members.expiresInDays', { count: days });
  const hours = Math.max(1, Math.floor(ms / (60 * 60 * 1000)));
  return t('settings.members.expiresInHours', { count: hours });
}

export function MembersTab() {
  const { user, canManageMembers, accountId, accountRole, account } = useAuth();
  const { getPresence, getRow, now } = usePresence();
  const { t } = useTranslation();
  const editableRoles: { value: AccountRole; label: string; hint: string }[] = [
    { value: 'admin', label: t('settings.members.roleAdmin'), hint: t('settings.members.roleAdminHint') },
    { value: 'agent', label: t('settings.members.roleAgent'), hint: t('settings.members.roleAgentHint') },
    { value: 'viewer', label: t('settings.members.roleViewer'), hint: t('settings.members.roleViewerHint') },
  ];

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [removingMember, setRemovingMember] = useState<Member | null>(null);
  const [pendingMemberAction, setPendingMemberAction] = useState<string | null>(
    null,
  );

  const loadEverything = useCallback(async () => {
    try {
      const [mres, ires] = await Promise.all([
        fetch('/api/account/members', { cache: 'no-store' }),
        canManageMembers
          ? fetch('/api/account/invitations', { cache: 'no-store' })
          : Promise.resolve(null),
      ]);

      if (!mres.ok) {
        const payload = await mres.json().catch(() => ({}));
        toast.error(payload.error || t('settings.members.failedLoadMembers'));
        return;
      }
      const mdata = (await mres.json()) as { members: Member[] };
      setMembers(mdata.members);

      if (ires) {
        if (!ires.ok) {
          const payload = await ires.json().catch(() => ({}));
          toast.error(payload.error || t('settings.members.failedLoadInvitations'));
          return;
        }
        const idata = (await ires.json()) as { invitations: Invitation[] };
        setInvitations(idata.invitations);
      } else {
        setInvitations([]);
      }
    } catch (err) {
      console.error('[MembersTab] load error:', err);
      toast.error(t('settings.members.couldNotReachServer'));
    } finally {
      setLoading(false);
    }
  }, [canManageMembers]);

  useEffect(() => {
    void loadEverything();
  }, [loadEverything]);

  async function handleRoleChange(member: Member, nextRole: AccountRole) {
    if (member.role === nextRole) return;
    // Optimistic update — flip the dropdown immediately so the UI
    // feels snappy. If the server PATCH fails we revert below so
    // the dropdown doesn't lie about the persisted state.
    const previousRole = member.role;
    setPendingMemberAction(member.user_id);
    setMembers((prev) =>
      prev.map((m) =>
        m.user_id === member.user_id ? { ...m, role: nextRole } : m,
      ),
    );
    try {
      const res = await fetch(`/api/account/members/${member.user_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!res.ok) {
        // Revert the optimistic flip. The toast on its own wasn't
        // enough — the dropdown was left showing the new role
        // forever, so the next interaction operated on a wrong
        // baseline (re-trying the same change would no-op via the
        // `member.role === nextRole` guard at the top).
        setMembers((prev) =>
          prev.map((m) =>
            m.user_id === member.user_id ? { ...m, role: previousRole } : m,
          ),
        );
        const payload = await res.json().catch(() => ({}));
        toast.error(payload.error || t('settings.members.failedUpdateRole'));
        return;
      }
      toast.success(t('settings.members.updatedRole', { name: member.full_name || t('settings.members.member'), role: nextRole }));
    } catch (err) {
      // Same revert on network failure.
      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === member.user_id ? { ...m, role: previousRole } : m,
        ),
      );
      console.error('[MembersTab] role change error:', err);
      toast.error(t('settings.members.couldNotReachServer'));
    } finally {
      setPendingMemberAction(null);
    }
  }

  async function handleRemove() {
    if (!removingMember) return;
    setPendingMemberAction(removingMember.user_id);
    try {
      const res = await fetch(
        `/api/account/members/${removingMember.user_id}`,
        { method: 'DELETE' },
      );
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        toast.error(payload.error || t('settings.members.failedRemoveMember'));
        return;
      }
      toast.success(t('settings.members.removedMember', { name: removingMember.full_name || t('settings.members.member') }));
      setMembers((prev) =>
        prev.filter((m) => m.user_id !== removingMember.user_id),
      );
      setRemovingMember(null);
    } catch (err) {
      console.error('[MembersTab] remove error:', err);
      toast.error(t('settings.members.couldNotReachServer'));
    } finally {
      setPendingMemberAction(null);
    }
  }

  /**
   * Saída voluntária. Encerra apenas a participação de quem clica: este
   * ambiente segue existindo para o resto da equipe, e os outros ambientes
   * desta identidade não são tocados. Ao final o servidor já repontou o
   * contexto, então recarregamos em `/dashboard` — a página atual pertence ao
   * ambiente do qual acabamos de sair.
   */
  async function handleLeave() {
    if (!accountId) return;
    setLeaving(true);
    try {
      const res = await fetch('/api/account/workspaces/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        toast.error(payload.error || t('settings.members.failedLeave'));
        setLeaving(false);
        return;
      }
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[MembersTab] leave error:', err);
      toast.error(t('settings.members.couldNotReachServer'));
      setLeaving(false);
    }
  }

  async function handleSectorChange(member: Member, nextSector: string) {
    if (member.sector === nextSector) return;
    const previousSector = member.sector;
    setPendingMemberAction(member.user_id);
    setMembers((prev) =>
      prev.map((m) =>
        m.user_id === member.user_id ? { ...m, sector: nextSector } : m,
      ),
    );
    try {
      const res = await fetch(`/api/account/members/${member.user_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: nextSector }),
      });
      if (!res.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m.user_id === member.user_id ? { ...m, sector: previousSector } : m,
          ),
        );
        const payload = await res.json().catch(() => ({}));
        toast.error(payload.error || "Erro ao atualizar setor");
        return;
      }
      toast.success("Setor atualizado com sucesso");
    } catch (err) {
      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === member.user_id ? { ...m, sector: previousSector } : m,
        ),
      );
      toast.error(t('settings.members.couldNotReachServer'));
    } finally {
      setPendingMemberAction(null);
    }
  }

  async function handleRevoke(invite: Invitation) {
    try {
      const res = await fetch(`/api/account/invitations/${invite.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        toast.error(payload.error || t('settings.members.failedRevokeInvitation'));
        return;
      }
      toast.success(t('settings.members.invitationRevoked'));
      setInvitations((prev) => prev.filter((i) => i.id !== invite.id));
    } catch (err) {
      console.error('[MembersTab] revoke error:', err);
      toast.error(t('settings.members.couldNotReachServer'));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="animate-in fade-in-50 space-y-6 duration-200">
      <SettingsPanelHead
        title={t('settings.members.title')}
        description={t('settings.members.description')}
        scope="account"
        action={
          <RequireRole min="admin">
            <Button onClick={() => setInviteOpen(true)}>
              <Plus className="size-4" />
              {t('settings.members.inviteMember')}
            </Button>
          </RequireRole>
        }
      />

      {/* Live presence summary across the roster. Updates without a
          full refresh as heartbeats and the local re-derive tick land. */}
      {members.length > 0 &&
        (() => {
          const counts = summarize(members.map((m) => getPresence(m.user_id)));
          return (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <PresenceDot status="online" />
                {counts.online} {t('settings.members.online')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PresenceDot status="away" />
                {counts.away} {t('settings.members.away')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PresenceDot status="offline" />
                {counts.offline} {t('settings.members.offline')}
              </span>
              <span className="text-muted-foreground/70">
                · {members.length} {members.length === 1 ? t('settings.members.member') : t('settings.members.members')}
              </span>
            </div>
          );
        })()}

      {/* Roster */}
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {members.map((member) => {
              const roleMeta = ROLE_META[member.role];
              const RoleIcon = roleMeta.icon;
              const isSelf = member.user_id === user?.id;
              const isOwnerRow = member.role === 'owner';
              const isBusy = pendingMemberAction === member.user_id;
              const presence = getPresence(member.user_id);
              const presenceRow = getRow(member.user_id);
              const presenceText = presenceLabel(
                presence,
                presenceRow?.last_seen_at ?? null,
                now,
              );

              return (
                <li
                  key={member.user_id}
                  // Mobile: stack identity (avatar+name+email) above the
                  // role/remove actions so the role dropdown's fixed
                  // 128px width doesn't force the name into a 50-pixel
                  // truncation. Desktop (sm+): everything inline as
                  // before.
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <div className="relative shrink-0">
                            <ContactAvatar
                              name={member.full_name || member.email}
                              avatarUrl={member.avatar_url}
                              size="lg"
                            />
                            <span
                              role="img"
                              aria-label={presenceText}
                              className={cn(
                                'absolute right-0 bottom-0 z-10 inline-flex size-2.5 rounded-full ring-2 ring-background',
                                PRESENCE_DOT_CLASS[presence]
                              )}
                            />
                          </div>
                        }
                      />
                      <TooltipContent>{presenceText}</TooltipContent>
                    </Tooltip>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {member.full_name || t('settings.members.unnamed')}
                        </span>
                        {isSelf && (
                          <Badge className="bg-muted text-muted-foreground border-border text-[10px] uppercase tracking-wide">
                            {t('settings.members.you')}
                          </Badge>
                        )}
                      </div>
                      {member.email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions cluster. On mobile this is its own row
                      below the identity block; on desktop it sits
                      inline. Items align to the start on mobile so the
                      role dropdown lines up under the avatar. */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Sector display / editor */}
                    {canManageMembers ? (
                      <Select
                        value={member.sector || ""}
                        onValueChange={(v) => v && handleSectorChange(member, v)}
                      >
                        <SelectTrigger
                          className="w-36 bg-muted border-border text-foreground text-xs"
                          disabled={isBusy}
                        >
                          <SelectValue placeholder="Setor">
                            {SECTOR_OPTIONS.find((s) => s.value === member.sector)?.label || "Sem setor"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {SECTOR_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value} className="text-xs">
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {SECTOR_OPTIONS.find((s) => s.value === member.sector)?.label || "Sem setor"}
                      </span>
                    )}

                    {/* Role display / editor. Inline Select is admin+
                        only AND not allowed on the owner row (owner
                        changes go through transfer, which lands later). */}
                    {canManageMembers && !isOwnerRow && !isSelf ? (
                      <Select
                        value={member.role}
                        onValueChange={(v) =>
                          // Base UI Select can emit null on clear. We
                          // don't expose a clear affordance, so the
                          // guard is defensive — but the typed
                          // signature requires it.
                          v && handleRoleChange(member, v as AccountRole)
                        }
                      >
                        <SelectTrigger
                          className="w-32 bg-muted border-border text-foreground"
                          disabled={isBusy}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {editableRoles.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${roleMeta.className}`}
                      >
                        <RoleIcon className="size-3.5" />
                        {roleMeta.label}
                      </span>
                    )}

                    {/* Remove. Admin+ only; never on the owner row;
                        never on yourself. Pre-polish styling was
                        neutral-default + red-on-hover — the
                        destructive intent was invisible until the
                        user moused over. Now red is the default
                        state with a darker shade on hover so the
                        affordance reads at-a-glance. */}
                    {canManageMembers && !isOwnerRow && !isSelf && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRemovingMember(member)}
                        disabled={isBusy}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Pending invitations — admin+ only */}
      <RequireRole min="admin">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <UsersRound className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              {t('settings.members.pendingInvitations')}
            </h3>
            <Badge className="bg-muted text-muted-foreground border-border">
              {invitations.length}
            </Badge>
          </div>
          {/* P10 — make the no-resend design explicit. Admins were
              confused why the pending list shows roles + expiry but
              no "copy link again" button. Stating the constraint up
              front (rather than letting the user discover it by
              looking for a button) keeps it from feeling like a bug. */}
          {invitations.length > 0 ? (
            <p className="mb-3 text-xs text-muted-foreground">
              {t('settings.members.plaintextInviteNote')}
            </p>
          ) : null}

          {invitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Mail className="size-6 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('settings.members.noPendingInvitations')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('settings.members.clickInviteAbove')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {invitations.map((inv) => {
                    const inviteRoleMeta = ROLE_META[inv.role];
                    const InviteRoleIcon = inviteRoleMeta.icon;
                    return (
                    <li
                      key={inv.id}
                      className="flex items-center gap-4 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {inv.label || t('settings.members.untitledInvite')}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${inviteRoleMeta.className}`}
                          >
                            <InviteRoleIcon className="size-3" />
                            {inviteRoleMeta.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {t('settings.members.created')} {fmtDate(inv.created_at)} · {fmtExpiresIn(inv.expires_at, t)}
                        </p>
                      </div>

                      {/* Revoke: red default state, mirrors the
                          members-tab Remove button. Pre-polish version
                          read as a neutral secondary button until
                          hover. */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(inv)}
                      >
                        <MailX className="size-4" />
                        {t('settings.members.revoke')}
                      </Button>
                    </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </RequireRole>

      {/* Saída voluntária. Fica no fim da seção e longe de qualquer ação
          frequente do roster (FH-19.03), e só aparece para quem não é dono —
          sair deixaria o ambiente sem titular, então a transferência vem
          antes. Sair ≠ excluir: o ambiente continua existindo. */}
      {accountRole && accountRole !== 'owner' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {t('settings.members.leaveTeamHint')}
          </p>
          <Button
            variant="outline"
            onClick={() => setLeaveOpen(true)}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            <LogOut className="size-4" />
            {t('settings.members.leaveTeam')}
          </Button>
        </div>
      ) : null}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onCreated={loadEverything}
      />

      <Dialog
        open={leaveOpen}
        onOpenChange={(open) => {
          if (!open && !leaving) setLeaveOpen(false);
        }}
      >
        <DialogContent className="bg-popover border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-popover-foreground">
              <AlertTriangle className="size-4 text-amber-400" />
              {t('settings.members.leaveTeam')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('settings.members.leaveTeamPrompt', {
                name: account?.name ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-popover border-border">
            <Button
              variant="outline"
              onClick={() => setLeaveOpen(false)}
              disabled={leaving}
              className="border-border text-muted-foreground hover:bg-muted"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleLeave}
              disabled={leaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {leaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('settings.members.leaving')}
                </>
              ) : (
                t('settings.members.leaveTeam')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={removingMember !== null}
        onOpenChange={(open) => {
          if (!open) setRemovingMember(null);
        }}
      >
        <DialogContent className="bg-popover border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-popover-foreground">
              <AlertTriangle className="size-4 text-amber-400" />
              {t('settings.members.removeMember')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('settings.members.removeMemberPromptPrefix')}{' '}
              <span className="font-medium text-muted-foreground">
                {removingMember?.full_name || t('settings.members.thisTeammate')}
              </span>{' '}
              {t('settings.members.removeMemberPromptSuffix')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-popover border-border">
            <Button
              variant="outline"
              onClick={() => setRemovingMember(null)}
              className="border-border text-muted-foreground hover:bg-muted"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleRemove}
              disabled={!!pendingMemberAction}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {pendingMemberAction ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('settings.members.removing')}
                </>
              ) : (
                t('settings.members.removeMember')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
