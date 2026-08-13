"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Eye, EyeOff, UsersRound } from "lucide-react";
import { FlowLogo } from "@/components/layout/flow-logo";
import { HCaptchaWidget, HCaptchaWidgetRef, isCaptchaConfigured } from "@/components/auth/hcaptcha";

// `useSearchParams` opts the component out of static prerendering
// unless wrapped in Suspense.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(() => {
    // Standard error parameter check
    if (searchParams.get("error") === "invalid_session") {
      return null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const supabase = createClient();
  const captchaRef = useRef<HCaptchaWidgetRef>(null);

  const getLoginErrorMessage = (message?: string) => {
    if (!message) return t("auth.login.error");
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("invalid login credentials") ||
      lowerMessage.includes("invalid_credentials") ||
      lowerMessage.includes("invalid credentials")
    ) {
      return t("auth.login.invalidCredentials");
    }

    return t("auth.login.error");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isCaptchaConfigured() && !captchaToken) {
      setError(t("auth.signup.captchaRequired"));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        ...(captchaToken ? { captchaToken } : {}),
      },
    });

    if (error) {
      setError(getLoginErrorMessage(error.message));
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
      setLoading(false);
      return;
    }

    if (inviteToken) {
      router.push(`/join/${encodeURIComponent(inviteToken)}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="items-center pb-4 pt-6 text-center">
          <div className="mb-2 flex justify-center">
            {inviteToken ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <UsersRound className="h-6 w-6 text-primary" />
              </div>
            ) : (
              <FlowLogo height={80} />
            )}
          </div>
          <CardTitle className="text-xl text-foreground">
            {inviteToken ? t("auth.login.inviteTitle") : t("auth.login.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {inviteToken
              ? t("auth.login.inviteDescription")
              : t("auth.login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                {t("common.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border bg-card-2 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-medium">
                  {t("common.password")}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-border bg-card-2 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <HCaptchaWidget
              ref={captchaRef}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium"
            >
              {loading ? t("auth.login.loading") : t("auth.login.submit")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.login.noAccount")}{" "}
            <Link
              href={
                inviteToken
                  ? `/signup?invite=${encodeURIComponent(inviteToken)}`
                  : "/signup"
              }
              className="text-primary hover:text-primary/80"
            >
              {t("auth.login.createAccount")}
            </Link>
          </p>

          <div className="mt-6 flex justify-center gap-3 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Política de Privacidade (LGPD)</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
