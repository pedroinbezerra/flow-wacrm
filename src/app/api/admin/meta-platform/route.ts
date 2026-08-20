import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { requireSuperAdmin } from '@/lib/auth/super-admin'
import { ForbiddenError, UnauthorizedError } from '@/lib/auth/account'
import { decrypt } from '@/lib/whatsapp/encryption'
import { META_API_VERSION } from '@/lib/whatsapp/api-version'
import { assessGraphVersion } from '@/lib/meta-platform/graph-versions'
import { fetchPlatformStatus } from '@/lib/meta-platform/platform-status'
import { CHANGELOG_FEED_URL, fetchFeed } from '@/lib/meta-platform/feeds'
import { fetchHealthStatus } from '@/lib/meta-platform/health-status'
import { readMetaUsage } from '@/lib/meta-platform/app-usage'

/**
 * Painel de saúde da plataforma Meta — leitura, para o mantenedor.
 *
 * Nada aqui altera estado, na Meta ou no banco. É deliberado: o painel
 * responde "o chão está se mexendo?", e uma tela de diagnóstico que muda
 * o que observa é uma tela em que não se confia.
 *
 * Cada bloco falha por conta própria. Uma WABA que não respondeu não pode
 * derrubar o quadro de incidentes — e a ausência de resposta aparece como
 * ausência de resposta, nunca como saúde (`FH-10.04`, `FH-41.05`).
 */

export const dynamic = 'force-dynamic'

interface AccountHealth {
  accountId: string
  accountName: string | null
  label: string | null
  wabaId: string | null
  phoneNumberId: string | null
  /** Registro local, para cruzar com o que a Meta responde. */
  registeredAt: string | null
  lastRegistrationError: string | null
  localStatus: string | null
  canSendMessage: string
  entities: unknown[]
  error: string | null
}

export async function GET() {
  try {
    await requireSuperAdmin()

    // Service role de propósito: o painel é do mantenedor e a visão é
    // da plataforma inteira. Com o client de RLS do usuário, a leitura
    // volta vazia para toda conta que não é a dele — e vazio aqui
    // seria lido como 'ninguém com problema', que é o oposto da
    // verdade. O acesso já foi barrado por requireSuperAdmin acima.
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: configs, error: configError } = await supabase
      .from('whatsapp_config')
      .select(
        'account_id, label, waba_id, phone_number_id, access_token, is_default, status, registered_at, last_registration_error, accounts(name)'
      )
      .order('created_at', { ascending: true })

    // As três consultas externas não dependem umas das outras.
    const [status, changelog, usage] = await Promise.all([
      fetchPlatformStatus(),
      fetchFeed(CHANGELOG_FEED_URL, 12),
      readMetaUsage(),
    ])

    const accounts: AccountHealth[] = []
    if (!configError && configs) {
      const results = await Promise.all(
        configs.map(async (c): Promise<AccountHealth> => {
          const base = {
            accountId: c.account_id as string,
            accountName:
              (c as { accounts?: { name?: string } | null }).accounts?.name ?? null,
            label: (c.label as string | null) ?? null,
            wabaId: (c.waba_id as string | null) ?? null,
            phoneNumberId: (c.phone_number_id as string | null) ?? null,
            registeredAt: (c.registered_at as string | null) ?? null,
            lastRegistrationError: (c.last_registration_error as string | null) ?? null,
            localStatus: (c.status as string | null) ?? null,
          }

          const nodeId = (c.phone_number_id as string | null) ?? (c.waba_id as string | null)
          if (!nodeId || !c.access_token) {
            return {
              ...base,
              canSendMessage: 'UNKNOWN',
              entities: [],
              error: 'Conta sem número ou sem credencial guardada',
            }
          }

          let token: string
          try {
            token = decrypt(c.access_token as string)
          } catch {
            return {
              ...base,
              canSendMessage: 'UNKNOWN',
              entities: [],
              error: 'Não foi possível ler a credencial guardada',
            }
          }

          const health = await fetchHealthStatus({ nodeId, accessToken: token })
          return {
            ...base,
            canSendMessage: health.canSendMessage,
            entities: health.entities,
            error: health.error,
          }
        })
      )
      accounts.push(...results)
    }

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      version: assessGraphVersion(META_API_VERSION),
      status,
      changelog,
      usage,
      accounts,
      // A mensagem carrega o motivo: um painel de diagnóstico que
      // esconde o próprio erro obriga quem opera a adivinhar.
      accountsError: configError
        ? `Não foi possível listar as conexões: ${configError.message}`
        : null,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error('[API Admin Meta Platform] Falha ao montar o painel:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
