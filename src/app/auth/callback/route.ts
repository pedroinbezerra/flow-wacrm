import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Validate that `next` is a relative path to prevent open redirect vulnerabilities
      const isRelative = next.startsWith("/") && !next.startsWith("//");
      const redirectUrl = isRelative ? `${origin}${next}` : `${origin}/dashboard`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Se a requisição era para redefinição de senha ou o código falhou por expiração/invalidade,
  // preserva o contexto na tela de redefinição com o parâmetro de expiração.
  if (next === "/reset-password" || next.startsWith("/reset-password")) {
    return NextResponse.redirect(`${origin}/reset-password?expired=true`);
  }

  return NextResponse.redirect(`${origin}/login?error=link-expired`);
}
