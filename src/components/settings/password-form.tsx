'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { PasswordRequirements } from '@/components/auth/password-requirements';
import { validatePassword, parseSupabasePasswordError, PASSWORD_POLICY_MIN_LENGTH, PASSWORD_POLICY_MAX_PASSWORD } from '@/lib/auth/password-policy';

export function PasswordForm() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const supabase = createClient();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.email) {
      toast.error(t('settings.password.cannotChangeWithoutEmail'));
      return;
    }

    const validation = validatePassword(next);
    if (!validation.isValid) {
      setConfirmError(validation.errors[0] || t('auth.signup.passwordRequirementsNotMet'));
      return;
    }

    if (next !== confirm) {
      setConfirmError(t('settings.password.passwordsDoNotMatch'));
      return;
    }
    setConfirmError(null);
    setSaving(true);

    try {
      // Supabase doesn't expose a "verify password without issuing a
      // session" API, so we re-authenticate with the provided current
      // password. If it matches, the session refreshes silently; if it
      // doesn't, we abort before calling updateUser.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: current,
      });
      if (signInError) {
        toast.error(t('settings.password.currentPasswordIncorrect'));
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: next,
      });
      if (updateError) {
        const errorMsg = parseSupabasePasswordError(updateError);
        toast.error(`Falha ao atualizar senha: ${errorMsg}`);
        return;
      }

      setCurrent('');
      setNext('');
      setConfirm('');
      toast.success(t('settings.password.passwordUpdated'));
    } catch (err) {
      const msg = parseSupabasePasswordError(err);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <KeyRound className="size-4 text-primary" />
          {t('settings.password.title')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('settings.password.description', { min: PASSWORD_POLICY_MIN_LENGTH })}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-foreground">
              {t('settings.password.currentPassword')}
            </Label>
            <Input
              id="current-password"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              disabled={saving}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-foreground">
                {t('settings.password.newPassword')}
              </Label>
              <Input
                id="new-password"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                minLength={PASSWORD_POLICY_MIN_LENGTH}
                maxLength={72}
                disabled={saving}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground">
                {t('settings.password.confirmNewPassword')}
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={PASSWORD_POLICY_MIN_LENGTH}
                maxLength={72}
                disabled={saving}
                required
              />
            </div>
          </div>

          <PasswordRequirements password={next} className="mt-2" />

          {confirmError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {confirmError}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving || !current || !next || !confirm}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('settings.password.updatingPassword')}
                </>
              ) : (
                t('settings.password.updatePassword')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

