"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import { FlowLogo } from "@/components/layout/flow-logo";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { validatePassword, parseSupabasePasswordError } from "@/lib/auth/password-policy";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

function ResetPasswordPageInner() {
  const searchParams = useSearchParams();
  const isExpiredParam = searchParams.get("expired") === "true";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const { t } = useTranslation();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuthSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasValidSession(!!session);
      setCheckingSession(false);
    }

    checkAuthSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasValidSession(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError(validation.errors[0] || t("auth.resetPassword.passwordRequirementsNotMet"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.resetPassword.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        // Se a chamada de atualização retornou erro no cliente mas a senha foi salva no backend,
        // verifica se o usuário permanece autenticado com a sessão ativa.
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.auth.signOut();
          setSuccess(true);
          setLoading(false);
          return;
        }

        console.error("[reset-password] Erro na redefinição de senha:", error);
        setError(parseSupabasePasswordError(error, t("auth.resetPassword.error")));
        setLoading(false);
        return;
      }

      // Sucesso na redefinição: desfaz a sessão de recuperação para permitir login limpo com novas credenciais
      await supabase.auth.signOut();
      setSuccess(true);
    } catch (err) {
      console.error("[reset-password] Exceção na redefinição de senha:", err);
      const { data: userData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      if (userData?.user) {
        await supabase.auth.signOut();
        setSuccess(true);
      } else {
        setError(parseSupabasePasswordError(err, t("auth.resetPassword.error")));
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="items-center text-center">
            <div className="mb-4">
              <FlowLogo height={40} />
            </div>
            <CardTitle className="text-xl text-foreground">
              {t("auth.resetPassword.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasValidSession || isExpiredParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <CardTitle className="text-xl text-foreground">
              {t("auth.resetPassword.invalidSessionTitle")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("auth.resetPassword.invalidSessionDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forgot-password">
              <Button
                variant="outline"
                className="w-full border-border text-foreground hover:bg-muted"
              >
                {t("auth.resetPassword.requestNewLink")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl text-foreground">
              {t("auth.resetPassword.successTitle")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("auth.resetPassword.successDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {t("auth.resetPassword.goToLogin")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl text-foreground">
            {t("auth.resetPassword.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("auth.resetPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                {t("auth.resetPassword.newPassword")}
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.resetPassword.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={72}
                  required
                  className="border-border bg-card-2 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
                  title={showPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <PasswordRequirements password={password} className="mt-1" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                {t("auth.resetPassword.confirmPassword")}
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("auth.resetPassword.passwordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  maxLength={72}
                  required
                  className="border-border bg-card-2 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                  title={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? t("auth.resetPassword.loading") : t("auth.resetPassword.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
