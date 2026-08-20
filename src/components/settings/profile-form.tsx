'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload, Trash2, Mail, CircleAlert } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactAvatar } from '@/components/ui/contact-avatar';
import { Card, CardContent } from '@/components/ui/card';
import { SettingsPanelHead } from './settings-panel-head';

import { isValidCpfOrCnpj, formatCpfCnpj } from '@/lib/validation/fiscal';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

// Rough email shape check — the real validator is Supabase Auth, which
// rejects anything malformed when we call updateUser({ email }). We
// just want to stop obvious typos before making a network call.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [initialCpfCnpj, setInitialCpfCnpj] = useState('');
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailChangePending, setEmailChangePending] = useState(false);

  // Seed form state once the profile loads + busca dados fiscais da conta (CPF/CNPJ).
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setEmail(profile.email ?? '');

    // Busca CPF/CNPJ da conta
    void fetch('/api/account')
      .then((res) => res.json())
      .then((data) => {
        if (data?.account?.cpf_cnpj) {
          const formatted = formatCpfCnpj(data.account.cpf_cnpj);
          setCpfCnpj(formatted);
          setInitialCpfCnpj(formatted);
        }
      })
      .catch((err) => console.error('[profile-form] Erro ao carregar dados da conta:', err));
  }, [profile]);

  // Cleanup object URLs to avoid leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const currentAvatar =
    previewUrl ?? (!removeAvatar ? profile?.avatar_url ?? null : null);


  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so the same file can be re-picked
    if (!file) return;

    if (!ALLOWED_MIME.has(file.type)) {
      toast.error(t('settings.profile.unsupportedImageType'), {
        description: t('settings.profile.useImageFormats'),
      });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(t('settings.profile.imageIsTooLarge'), {
        description: t('settings.profile.maximum2MB'),
      });
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingAvatar(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const onRemoveAvatar = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingAvatar(null);
    setPreviewUrl(null);
    setRemoveAvatar(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast.error(t('settings.profile.displayNameRequired'));
      return;
    }
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      toast.error(t('common.invalidEmail'));
      return;
    }
    const trimmedCpfCnpj = cpfCnpj.trim();
    if (trimmedCpfCnpj !== '' && !isValidCpfOrCnpj(trimmedCpfCnpj)) {
      toast.error(t('settings.fiscal.invalidCpfCnpj'), {
        description: t('settings.fiscal.invalidCpfCnpjDesc'),
      });
      return;
    }

    setSaving(true);
    try {
      let nextAvatarUrl: string | null = profile.avatar_url ?? null;

      // Update account CPF/CNPJ if changed
      if (trimmedCpfCnpj !== initialCpfCnpj) {
        const accRes = await fetch('/api/account', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf_cnpj: trimmedCpfCnpj }),
        });
        const accData = await accRes.json();
        if (!accRes.ok) {
          throw new Error(accData?.error || 'Falha ao salvar CPF/CNPJ da conta.');
        }
        setInitialCpfCnpj(formatCpfCnpj(trimmedCpfCnpj));
      }

      // Upload a newly-staged image, if any.
      if (pendingAvatar) {
        const ext =
          pendingAvatar.name.split('.').pop()?.toLowerCase() || 'png';
        const path = `${user.id}/avatar-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, pendingAvatar, {
            cacheControl: '3600',
            upsert: true,
            contentType: pendingAvatar.type,
          });
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(path);
        nextAvatarUrl = publicUrl;
      } else if (removeAvatar) {
        nextAvatarUrl = null;
      }

      // Persist name + avatar to profiles.
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName,
          avatar_url: nextAvatarUrl,
        })
        .eq('user_id', user.id);
      if (updateError) {
        throw new Error(`Save failed: ${updateError.message}`);
      }

      let emailSent = false;
      if (trimmedEmail.toLowerCase() !== profile.email.toLowerCase()) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: trimmedEmail,
        });
        if (emailError) {
          toast.success('Perfil atualizado com sucesso');
          toast.error(`Falha ao alterar e-mail: ${emailError.message}`);
          setSaving(false);
          await refreshProfile();
          return;
        }
        emailSent = true;
      }

      setEmailChangePending(emailSent);
      setPendingAvatar(null);
      setPreviewUrl(null);
      setRemoveAvatar(false);
      await refreshProfile();

      toast.success(
        emailSent
          ? t('settings.profile.savedCheckEmail')
          : t('settings.profile.profileSaved'),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const dirty =
    !!profile &&
    (fullName.trim() !== (profile.full_name ?? '') ||
      email.trim().toLowerCase() !== (profile.email ?? '').toLowerCase() ||
      cpfCnpj.trim() !== initialCpfCnpj ||
      pendingAvatar !== null ||
      removeAvatar);

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <section className="max-w-2xl space-y-6 animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title={t('settings.profile.title')}
        description={t('settings.profile.description')}
        scope="personal"
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="space-y-6 p-5 sm:p-6">
            {/* Avatar row — Stack on mobile, horizontal on desktop */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-border/60">
              <ContactAvatar
                name={fullName || profile?.email}
                avatarUrl={currentAvatar}
                size="2xl"
                className="size-16 sm:size-20 shadow-xs ring-2 ring-primary/10"
              />

              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={onPickFile}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                    className="w-full sm:w-auto h-10 text-xs sm:text-sm font-medium"
                  >
                    <Upload className="size-4 mr-1.5" />
                    {currentAvatar ? t('settings.profile.changePhoto') : t('settings.profile.uploadPhoto')}
                  </Button>
                  {currentAvatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onRemoveAvatar}
                      disabled={saving}
                      className="w-full sm:w-auto h-10 text-xs sm:text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4 mr-1.5" />
                      {t('common.delete')}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('settings.profile.imageFormatsHint')}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="profile-full-name" className="text-sm font-semibold text-foreground">
                {t('settings.profile.displayName')}
              </Label>
              <Input
                id="profile-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("common.placeholders.namePlaceholder")}
                maxLength={120}
                disabled={saving}
                className="h-10 text-sm"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="profile-email" className="text-sm font-semibold text-foreground">
                {t('common.email')}
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={saving}
                className="h-10 text-sm"
                required
              />
              {emailChangePending && (
                <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  <Mail className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {t('settings.profile.checkInboxBoth', { email1: profile?.email || '', email2: email })}
                  </span>
                </p>
              )}
            </div>

            {/* CPF / CNPJ (Dados Fiscais / Asaas) */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <Label htmlFor="profile-cpf-cnpj" className="text-sm font-semibold text-foreground">
                  {t('settings.fiscal.cpfCnpjTitle')}
                </Label>
                <span className="text-[11px] text-muted-foreground">{t('settings.fiscal.cpfCnpjRequiredHint')}</span>
              </div>
              <Input
                id="profile-cpf-cnpj"
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                placeholder={t('settings.fiscal.cpfCnpjPlaceholder')}
                maxLength={18}
                disabled={saving}
                className="h-10 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('settings.fiscal.cpfCnpjDescription')}
              </p>
            </div>

            {/* Read-only block */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('settings.profile.accountDetails')}
              </p>
              <dl className="grid grid-cols-1 gap-3 text-xs sm:text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground font-medium">{t('common.role')}</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-foreground capitalize">
                    {profile?.role ?? 'user'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">{t('settings.profile.joined')}</dt>
                  <dd className="mt-0.5 text-foreground">{joined}</dd>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-border/50">
                  <dt className="text-muted-foreground font-medium">{t('settings.profile.userId')}</dt>
                  <dd className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground select-all">
                    {user?.id ?? '—'}
                  </dd>
                </div>
              </dl>
            </div>

            {!profile && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CircleAlert className="size-4 animate-spin text-primary" />
                {t('settings.profile.loadingProfile')}
              </p>
            )}

          </CardContent>
        </Card>

        {/* Action bar — Full width submit on mobile */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving || !dirty || !profile}
            className="w-full sm:w-auto h-10 px-6 font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                {t('settings.profile.saving')}
              </>
            ) : (
              t('common.saveChanges')
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
