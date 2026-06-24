'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { AlertTriangle, CheckCircle, Loader2, MailX, ShieldCheck, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

interface PeekOk {
  ok: true;
  account_name: string;
  role: 'admin' | 'agent' | 'viewer';
  expires_at: string;
}
interface PeekFail {
  ok: false;
  reason: 'not_found' | 'used' | 'expired' | 'server_error';
}
type PeekResult = PeekOk | PeekFail;

export default function JoinPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const { t } = useTranslation();

  const [peek, setPeek] = useState<PeekResult | null>(null);
  const [authedUserId, setAuthedUserId] = useState<string | null | undefined>(undefined);
  const [accepting, setAccepting] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const getRoleLabel = (role: PeekOk['role']): string => {
    const map: Record<PeekOk['role'], string> = {
      admin: t('auth.join.roles.admin'),
      agent: t('auth.join.roles.agent'),
      viewer: t('auth.join.roles.viewer'),
    };
    return map[role];
  };

  const getFailCopy = (reason: PeekFail['reason']) => {
    const map: Record<PeekFail['reason'], { title: string; body: string }> = {
      not_found: { title: t('auth.join.errors.notFound.title'), body: t('auth.join.errors.notFound.body') },
      used: { title: t('auth.join.errors.used.title'), body: t('auth.join.errors.used.body') },
      expired: { title: t('auth.join.errors.expired.title'), body: t('auth.join.errors.expired.body') },
      server_error: { title: t('auth.join.errors.serverError.title'), body: t('auth.join.errors.serverError.body') },
    };
    return map[reason];
  };

  const loadPeekAndAuth = useCallback(async () => {
    if (!token) return;
    setPeek(null);
    setAuthedUserId(undefined);
    try {
      const [peekRes, authRes] = await Promise.all([
        fetch(`/api/invitations/${encodeURIComponent(token)}/peek`, { cache: 'no-store' }),
        createClient().auth.getUser(),
      ]);
      const peekBody = (await peekRes.json()) as PeekResult;
      setPeek(peekBody);
      setAuthedUserId(authRes.data.user?.id ?? null);
    } catch (err) {
      setPeek({ ok: false, reason: 'server_error' });
      setAuthedUserId(null);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    loadPeekAndAuth();
    return () => { cancelled = true; };
  }, [token, loadPeekAndAuth]);

  const handleAccept = useCallback(async () => {
    if (!token) return;
    setAccepting(true);
    try {
      const res = await fetch(`/api/invitations/${encodeURIComponent(token)}/redeem`, { method: 'POST' });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.status === 409) setConflictMessage(payload.error || t('auth.join.conflict.message'));
        else toast.error(payload.error || t('auth.join.errors.failedToAccept'));
        setAccepting(false);
        return;
      }
      toast.success(t('auth.join.success'));
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(t('auth.join.errors.couldNotReachServer'));
      setAccepting(false);
    }
  }, [token, t]);

  const handleSignOutAndRetry = useCallback(async () => {
    setSigningOut(true);
    try {
      await createClient().auth.signOut();
      window.location.reload();
    } catch (err) {
      toast.error(t('auth.join.errors.couldNotSignOut'));
      setSigningOut(false);
    }
  }, [t]);

  if (peek === null || authedUserId === undefined) {
    return (
      <Card className="w-full max-w-md border-border bg-card">
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('auth.join.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!peek.ok) {
    const copy = getFailCopy(peek.reason);
    return (
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
            <MailX className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-xl text-foreground">{copy.title}</CardTitle>
          <CardDescription className="text-muted-foreground">{copy.body}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {peek.reason === 'server_error' ? (
            <>
              <Button onClick={loadPeekAndAuth} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {t('auth.join.tryAgain')}
              </Button>
              <Link href="/signup">
                <Button variant="outline" className="w-full border-border text-muted-foreground hover:bg-muted hover:text-foreground">
                  {t('auth.join.createAccountInstead')}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {t('auth.join.createAccountInstead')}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full border-border text-muted-foreground hover:bg-muted hover:text-foreground">
                  {t('auth.join.signIn')}
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  const inviteHeader = (
    <CardHeader className="items-center text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <UsersRound className="h-6 w-6 text-primary" />
      </div>
      <CardTitle className="text-xl text-foreground">
        {t('auth.join.invitedTo')} <span className="text-primary">{peek.account_name}</span>
      </CardTitle>
      <CardDescription className="text-muted-foreground">
        {t('auth.join.joinAs')} <span className="inline-flex items-center gap-1 text-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          {getRoleLabel(peek.role)}
        </span>
        . {t('auth.join.validUntil')} {new Date(peek.expires_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })}.
      </CardDescription>
    </CardHeader>
  );

  if (authedUserId) {
    return (
      <>
        <Card className="w-full max-w-md border-border bg-card">
          {inviteHeader}
          <CardContent className="flex flex-col gap-3">
            <Button onClick={handleAccept} disabled={accepting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {accepting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('auth.join.accepting')}
                </>
              ) : (
                <>
                  <CheckCircle className="size-4" />
                  {t('auth.join.acceptInvitation')}
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {t('auth.join.acceptingNote')} <span className="text-muted-foreground">{peek.account_name}</span>. {t('auth.join.acceptingNoteCleanup')}
            </p>
          </CardContent>
        </Card>

        <Dialog open={conflictMessage !== null} onOpenChange={(open) => { if (!open) setConflictMessage(null); }}>
          <DialogContent className="bg-popover border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-popover-foreground">
                <AlertTriangle className="size-4 text-amber-400" />
                {t('auth.join.conflict.title')} {peek.account_name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">{conflictMessage}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2 text-xs text-muted-foreground">
              <p>
                {t('auth.join.conflict.instructions')} <span className="text-popover-foreground">{peek.account_name}</span>, {t('auth.join.conflict.note')}
              </p>
            </div>
            <DialogFooter className="bg-popover border-border">
              <Button variant="outline" onClick={() => setConflictMessage(null)} className="border-border text-popover-foreground hover:bg-muted">
                {t('auth.join.conflict.staySignedIn')}
              </Button>
              <Button onClick={handleSignOutAndRetry} disabled={signingOut} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {signingOut ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t('auth.join.conflict.signingOut')}
                  </>
                ) : (
                  t('auth.join.conflict.signOutAndUse')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card className="w-full max-w-md border-border bg-card">
      {inviteHeader}
      <CardContent className="flex flex-col gap-2">
        <Link href={`/signup?invite=${encodeURIComponent(token!)}`}>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {t('auth.join.createAccountAndJoin')}
          </Button>
        </Link>
        <Link href={`/login?invite=${encodeURIComponent(token!)}`}>
          <Button variant="outline" className="w-full border-border text-muted-foreground hover:bg-muted hover:text-foreground">
            {t('auth.join.alreadyHaveAccount')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
