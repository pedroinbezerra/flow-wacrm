'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, LogOut } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function SessionsCard() {
  const supabase = createClient();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const onConfirm = async () => {
    setSigningOut(true);
    try {
      // scope: 'global' revokes every refresh token for this user
      // across all devices; the next auth-state change on this tab
      // triggers the usual redirect.
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        toast.error(`Sign-out failed: ${error.message}`);
        return;
      }
      window.location.href = '/login';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(msg);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <Card className="border border-destructive/20 bg-destructive/5 shadow-2xs">
        <CardHeader className="p-5 sm:p-6 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-destructive">
            <LogOut className="size-4" />
            {t('settings.sessions.title')}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t('settings.sessions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 pt-0">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-semibold"
          >
            <LogOut className="size-4 mr-2" />
            {t('settings.sessions.signOutAll')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {t('settings.sessions.confirmSignOut')}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
              Todos os dispositivos conectados nesta conta serão desconectados imediatamente e você precisará realizar login novamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={signingOut}
              className="w-full sm:w-auto h-10 text-xs sm:text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={signingOut}
              className="w-full sm:w-auto h-10 text-xs sm:text-sm font-semibold"
            >
              {signingOut ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Desconectando...
                </>
              ) : (
                'Desconectar de Tudo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
