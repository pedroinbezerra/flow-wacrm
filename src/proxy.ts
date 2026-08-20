import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims() (not getUser()) so we can read the JWT's `amr` (auth
  // method reference) — see the recovery-session check below. It's the
  // same validated-session guarantee getUser() gives, plus the claim we
  // actually need.
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims ?? null

  // SECURITY: a session created by clicking a password-reset link (or
  // entering the emailed recovery code) is, to Supabase, a completely
  // normal, fully-privileged session — nothing about it is scoped to
  // "may only change the password." Our own /reset-password page signs
  // it out once the user finishes setting a new password, but if the
  // user abandons that page first (e.g. navigates to /login to try their
  // old password instead), the session is left sitting in the browser,
  // fully valid, forever — reachable by anyone who reloads or reopens
  // the tab, without ever having entered the account password. That's
  // exactly what was reported: reset attempt abandoned, login attempt
  // failed, then a plain page refresh landed inside the dashboard.
  //
  // This app only ever creates a session two ways: `signInWithPassword`
  // / `signUp` (amr includes "password"), or the recovery flow
  // (`exchangeCodeForSession` / `verifyOtp(type: 'recovery')`, which
  // never does). So "amr has no 'password' entry" reliably means
  // "recovery session" here — and such a session is only ever allowed to
  // reach /reset-password, to finish the one thing it's for. Everywhere
  // else it's treated as logged out, and the leftover session is
  // revoked so it can't be replayed by reloading again.
  //
  // NOTE for future maintainers: if a passwordless login method (magic
  // link, OAuth, SSO) is ever added, this check needs to change — it
  // would start rejecting those legitimate sessions too.
  //
  // Fail-safe direction: only treat a session as recovery-only when we
  // have positive evidence — a non-empty `amr` that doesn't contain
  // "password". If `amr` is missing or empty (unexpected shape, older
  // project config, whatever), fall back to the pre-existing behavior
  // (treat as a normal session) rather than locking everyone out. This
  // fix must never turn into a second, worse lockout.
  const amrMethods: string[] = Array.isArray(claims?.amr)
    ? claims!.amr.map((entry) => (typeof entry === 'string' ? entry : entry.method))
    : []
  const isRecoverySession = !!claims && amrMethods.length > 0 && !amrMethods.includes('password')

  if (isRecoverySession && request.nextUrl.pathname !== '/reset-password') {
    await supabase.auth.signOut()
    if (request.nextUrl.pathname !== '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  const user = claims && !isRecoverySession ? claims : null

  // Auth pages - redirect to dashboard if already logged in.
  // Exception: when an invite token is in the query string we
  // send the already-signed-in user to /join/<token> instead so
  // they can accept the invitation in one click. Without this,
  // a forwarded invite link to someone who's already signed in
  // would silently drop them on /dashboard.
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup' ||
    request.nextUrl.pathname === '/forgot-password'
  )) {
    const url = request.nextUrl.clone()
    const inviteToken = request.nextUrl.searchParams.get('invite')
    if (
      inviteToken &&
      (request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup')
    ) {
      url.pathname = `/join/${encodeURIComponent(inviteToken)}`
      url.search = ''
    } else {
      url.pathname = '/dashboard'
      url.search = ''
    }
    return NextResponse.redirect(url)
  }

  // Captura erros de link expirado ou negado via URL query params antes de autorizar rotas protegidas
  const errorCode = request.nextUrl.searchParams.get('error_code')
  const errorParam = request.nextUrl.searchParams.get('error')
  if (
    errorCode === 'otp_expired' ||
    errorCode === 'token_expired' ||
    errorParam === 'access_denied'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/reset-password'
    url.search = '?expired=true'
    url.hash = ''
    return NextResponse.redirect(url)
  }

  // Protected pages - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/inbox', '/contacts', '/pipelines', '/broadcasts', '/automations', '/settings', '/flows']
  if (!user && protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // API routes that need auth (not webhooks)
  if (!user && request.nextUrl.pathname.startsWith('/api/whatsapp/') &&
      !request.nextUrl.pathname.includes('/webhook')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
