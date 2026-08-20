import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/whatsapp/encryption'
import { normalizeStatus } from '@/lib/whatsapp/template-status-normalize'
import { tApiError } from '@/lib/i18n/api-errors'
import { META_API_BASE } from '@/lib/whatsapp/api-version'
import {
  STATUSES_CLAIMING_META_COUNTERPART,
  TEMPLATE_MISSING_STATUS,
} from '@/lib/whatsapp/template-availability'
import type { TemplateButton, TemplateSampleValues } from '@/types'

/**
 * Sync message templates from Meta → local message_templates table.
 *
 * The local catalog stores Meta's status enum verbatim (APPROVED /
 * PENDING / REJECTED / PAUSED / DISABLED / IN_APPEAL / PENDING_DELETION)
 * so the edit / resubmit / delete flows can distinguish recoverable
 * states (PAUSED) from terminal ones (DISABLED) and so webhook events
 * land 1:1 without a translation table.
 *
 * Locally-created templates (no Meta counterpart) are NOT deleted —
 * they remain visible so the user can notice drift and clean up.
 *
 * A rota lê TODAS as conexões da conta (uma WABA por vez) e reconcilia:
 * o que a Meta não lista mais deixa de ser exibido como aprovado e passa
 * a MISSING. Sem isso, trocar o número conectado mantinha o catálogo
 * antigo aparentemente válido e o erro só aparecia no envio, como
 * `(#132001) Template name does not exist in the translation`.
 */



interface MetaButton {
  type: string
  text: string
  url?: string
  phone_number?: string
  example?: string[] | string
}

interface MetaTemplateComponent {
  type: string
  text?: string
  format?: string
  buttons?: MetaButton[]
  example?: {
    header_text?: string[]
    header_handle?: string[]
    body_text?: string[][]
  }
}

interface MetaTemplate {
  id: string
  name: string
  language: string
  status: string
  category: string
  components?: MetaTemplateComponent[]
  quality_score?: { score?: string } | string
}

function normalizeCategory(
  meta: string,
): 'Marketing' | 'Utility' | 'Authentication' {
  const upper = meta.toUpperCase()
  if (upper === 'UTILITY') return 'Utility'
  if (upper === 'AUTHENTICATION') return 'Authentication'
  return 'Marketing'
}

function normalizeQualityScore(
  raw: MetaTemplate['quality_score'],
): 'GREEN' | 'YELLOW' | 'RED' | null {
  const score =
    typeof raw === 'string' ? raw : raw?.score ? String(raw.score) : null
  if (!score) return null
  const upper = score.toUpperCase()
  return upper === 'GREEN' || upper === 'YELLOW' || upper === 'RED'
    ? (upper as 'GREEN' | 'YELLOW' | 'RED')
    : null
}

function parseButtons(metaButtons: MetaButton[] | undefined): TemplateButton[] {
  if (!metaButtons?.length) return []
  const out: TemplateButton[] = []
  for (const b of metaButtons) {
    switch (b.type?.toUpperCase()) {
      case 'QUICK_REPLY':
        out.push({ type: 'QUICK_REPLY', text: b.text })
        break
      case 'URL':
        out.push({
          type: 'URL',
          text: b.text,
          url: b.url ?? '',
          example: Array.isArray(b.example) ? b.example[0] : b.example,
        })
        break
      case 'PHONE_NUMBER':
        out.push({
          type: 'PHONE_NUMBER',
          text: b.text,
          phone_number: b.phone_number ?? '',
        })
        break
      case 'COPY_CODE':
        out.push({
          type: 'COPY_CODE',
          text: b.text,
          example: Array.isArray(b.example) ? b.example[0] ?? '' : b.example ?? '',
        })
        break
      // OTP, FLOW, etc — out of scope for v1; drop silently.
    }
  }
  return out
}

function extractSampleValues(
  body: MetaTemplateComponent | undefined,
  header: MetaTemplateComponent | undefined,
): TemplateSampleValues | null {
  // Meta returns body_text as a 2D array — one row per example set.
  // We take the first row (most templates have exactly one).
  const bodySample = body?.example?.body_text?.[0]
  const headerSample = header?.example?.header_text
  if (!bodySample?.length && !headerSample?.length) return null
  const sv: TemplateSampleValues = {}
  if (bodySample?.length) sv.body = bodySample
  if (headerSample?.length) sv.header = headerSample
  return sv
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve the caller's account_id — both whatsapp_config and
    // the message_templates we sync into are account-scoped.
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle()
    const accountId = profile?.account_id as string | undefined
    if (!accountId) {
      return NextResponse.json(
        { error: 'Your profile is not linked to an account.' },
        { status: 403 },
      )
    }

    // Todas as conexões da conta, não apenas uma. Uma conta pode ter
    // mais de um número, e cada número pertence a uma WABA com seu
    // próprio catálogo. Sincronizar só uma delas e reconciliar o resto
    // marcaria como ausente modelo que existe — o erro oposto ao que
    // esta rota corrige.
    const { data: configs, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('account_id', accountId)
      .order('is_default', { ascending: false })

    if (configError || !configs?.length) {
      return NextResponse.json(
        {
          error:
            'WhatsApp not configured. Connect your WhatsApp Business account in Settings first.',
        },
        { status: 400 },
      )
    }

    if (configs.some((c) => c.waba_id && c.waba_id === c.phone_number_id)) {
      return NextResponse.json(
        {
          error: tApiError(request, 'whatsapp.invalidWabaConfig'),
        },
        { status: 400 },
      )
    }

    // Uma WABA pode hospedar vários números; o catálogo é o mesmo.
    // Busca uma vez por WABA, com o token da conexão que a declarou.
    const wabaTargets = new Map<string, string>()
    for (const cfg of configs) {
      if (!cfg.waba_id || wabaTargets.has(cfg.waba_id)) continue
      wabaTargets.set(cfg.waba_id, cfg.access_token as string)
    }

    if (wabaTargets.size === 0) {
      return NextResponse.json(
        {
          error:
            'WABA (WhatsApp Business Account) ID missing. Re-connect your account in Settings.',
        },
        { status: 400 },
      )
    }

    const PAGE_CAP = 20

    // Cada modelo carrega a WABA que o hospeda: é isso que permite,
    // depois, distinguir "sumiu da Meta" de "é de outra conexão".
    const metaTemplates: { wabaId: string; template: MetaTemplate }[] = []
    const fetchFailures: { waba_id: string; message: string }[] = []
    const syncedWabaIds: string[] = []
    let truncated = false

    for (const [wabaId, encryptedToken] of wabaTargets) {
      let accessToken: string
      try {
        accessToken = decrypt(encryptedToken)
      } catch {
        fetchFailures.push({
          waba_id: wabaId,
          message:
            'Failed to decrypt the stored access token. Re-connect this number in Settings.',
        })
        continue
      }

      let nextUrl:
        | string
        | null = `${META_API_BASE}/${wabaId}/message_templates?limit=100&fields=id,name,language,status,category,components,quality_score`
      let pageCount = 0
      let failed = false
      const collected: MetaTemplate[] = []

      while (nextUrl && pageCount < PAGE_CAP) {
        pageCount++
        const metaRes: Response = await fetch(nextUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!metaRes.ok) {
          let metaErr = `Meta API error: ${metaRes.status}`
          let metaCode: number | undefined
          try {
            const body = await metaRes.json()
            metaCode = body?.error?.code
            if (body?.error?.message) metaErr = body.error.message
          } catch {
            // response wasn't JSON — keep the fallback
          }

          if (
            metaCode === 100 &&
            /nonexisting field \(message_templates\)/i.test(metaErr)
          ) {
            metaErr = tApiError(request, 'whatsapp.metaNonexistingMessageTemplates')
          }

          fetchFailures.push({ waba_id: wabaId, message: metaErr })
          failed = true
          break
        }

        const metaBody: {
          data?: MetaTemplate[]
          paging?: { next?: string }
        } = await metaRes.json()
        if (metaBody.data) collected.push(...metaBody.data)
        nextUrl = metaBody.paging?.next ?? null
      }

      if (failed) continue

      // Catálogo truncado é leitura parcial: reconciliar por cima dele
      // marcaria como ausente o que ficou depois do corte.
      if (pageCount >= PAGE_CAP && nextUrl !== null) {
        truncated = true
        fetchFailures.push({
          waba_id: wabaId,
          message:
            'Template catalog exceeded the page cap — this connection was read only partially.',
        })
        continue
      }

      syncedWabaIds.push(wabaId)
      for (const template of collected) {
        metaTemplates.push({ wabaId, template })
      }
    }

    // Nenhuma conexão pôde ser lida: nada foi observado, nada pode ser
    // afirmado sobre o catálogo local.
    if (syncedWabaIds.length === 0) {
      return NextResponse.json(
        {
          error:
            fetchFailures[0]?.message ?? 'Failed to read templates from Meta',
        },
        { status: 502 },
      )
    }

    let inserted = 0
    let updated = 0
    const errors: { name: string; language: string; message: string }[] = []

    // Chaves de presença consultadas pela reconciliação adiante.
    const seenKeys = new Set<string>()
    const seenNameLanguage = new Set<string>()

    for (const { wabaId, template: t } of metaTemplates) {
      const body = (t.components ?? []).find((c) => c.type === 'BODY')
      const header = (t.components ?? []).find((c) => c.type === 'HEADER')
      const footer = (t.components ?? []).find((c) => c.type === 'FOOTER')
      const buttons = (t.components ?? []).find((c) => c.type === 'BUTTONS')

      const parsedButtons = parseButtons(buttons?.buttons)
      const sampleValues = extractSampleValues(body, header)

      const headerFormat = header?.format?.toUpperCase()
      const headerType =
        headerFormat === 'TEXT' ||
        headerFormat === 'IMAGE' ||
        headerFormat === 'VIDEO' ||
        headerFormat === 'DOCUMENT'
          ? headerFormat.toLowerCase()
          : null

      seenKeys.add(`${wabaId}::${t.name}::${t.language}`)
      seenNameLanguage.add(`${t.name}::${t.language}`)

      const row = {
        // Account tenancy + user audit, same split as the submit
        // route. account_id is NOT NULL on message_templates
        // post-017, so an INSERT without it errors.
        account_id: accountId,
        user_id: user.id,
        name: t.name,
        category: normalizeCategory(t.category),
        language: t.language,
        header_type: headerType,
        header_content: header?.text ?? null,
        header_handle: header?.example?.header_handle?.[0] ?? null,
        body_text: body?.text ?? '',
        footer_text: footer?.text ?? null,
        buttons: parsedButtons.length ? parsedButtons : null,
        sample_values: sampleValues,
        status: normalizeStatus(t.status),
        meta_template_id: t.id,
        // Carimbo de origem (migração 068). Sem ele, trocar o número
        // conectado deixava o catálogo antigo indistinguível do novo.
        waba_id: wabaId,
        // A Meta acabou de listar o modelo: se a linha estava marcada
        // como ausente, ela voltou.
        missing_since: null,
        quality_score: normalizeQualityScore(t.quality_score),
        updated_at: new Date().toISOString(),
      }

      const { data: existing, error: lookupErr } = await supabase
        .from('message_templates')
        .select('id')
        .eq('account_id', accountId)
        .eq('name', t.name)
        .eq('language', t.language)
        .maybeSingle()

      if (lookupErr) {
        errors.push({
          name: t.name,
          language: t.language,
          message: lookupErr.message,
        })
        continue
      }

      if (existing?.id) {
        const { error: updErr } = await supabase
          .from('message_templates')
          .update(row)
          .eq('id', existing.id)
        if (updErr) {
          errors.push({
            name: t.name,
            language: t.language,
            message: updErr.message,
          })
        } else {
          updated++
        }
      } else {
        const { error: insErr } = await supabase
          .from('message_templates')
          .insert(row)
        if (insErr) {
          errors.push({
            name: t.name,
            language: t.language,
            message: insErr.message,
          })
        } else {
          inserted++
        }
      }
    }

    // ── Reconciliação ────────────────────────────────────────────
    // Sincronizar responde "o que a Meta tem", não "o que a Meta tem a
    // mais". Toda linha local que afirma ter contrapartida remota e não
    // apareceu na leitura da própria WABA passa a MISSING — é o caso do
    // modelo que continuava "Aprovado" depois da troca de número e só
    // falhava no envio, com (#132001).
    //
    // Linhas sem waba_id (anteriores à migração 068) só entram na conta
    // quando TODAS as conexões foram lidas: numa leitura parcial elas
    // poderiam pertencer justamente à WABA que não foi consultada.
    const reconcileUnstamped =
      fetchFailures.length === 0 && syncedWabaIds.length === wabaTargets.size

    let missing = 0
    const { data: localRows, error: localErr } = await supabase
      .from('message_templates')
      .select('id, name, language, waba_id, status')
      .eq('account_id', accountId)
      .not('meta_template_id', 'is', null)
      .in('status', STATUSES_CLAIMING_META_COUNTERPART as unknown as string[])

    if (localErr) {
      errors.push({
        name: '*',
        language: '*',
        message: `Reconciliation skipped: ${localErr.message}`,
      })
    } else {
      const orphanIds: string[] = []
      for (const local of localRows ?? []) {
        const language = (local.language as string | null) ?? ''
        const wabaId = local.waba_id as string | null

        if (wabaId) {
          // Fora das WABAs lidas agora: nada foi observado a respeito.
          if (!syncedWabaIds.includes(wabaId)) continue
          if (seenKeys.has(`${wabaId}::${local.name}::${language}`)) continue
        } else {
          if (!reconcileUnstamped) continue
          if (seenNameLanguage.has(`${local.name}::${language}`)) continue
        }

        orphanIds.push(local.id as string)
      }

      if (orphanIds.length > 0) {
        const { error: markErr } = await supabase
          .from('message_templates')
          .update({
            status: TEMPLATE_MISSING_STATUS,
            missing_since: new Date().toISOString(),
            // A nota de qualidade descrevia um modelo que não existe
            // mais; mantê-la seria mais uma afirmação sem lastro.
            quality_score: null,
            updated_at: new Date().toISOString(),
          })
          .in('id', orphanIds)

        if (markErr) {
          errors.push({
            name: '*',
            language: '*',
            message: `Failed to flag templates missing at Meta: ${markErr.message}`,
          })
        } else {
          missing = orphanIds.length
        }
      }
    }

    return NextResponse.json({
      // Sucesso parcial não é sucesso: uma WABA que não pôde ser lida
      // mantém o resultado honesto sobre o que ficou de fora.
      success: errors.length === 0 && fetchFailures.length === 0,
      total: metaTemplates.length,
      inserted,
      updated,
      missing,
      synced_connections: syncedWabaIds.length,
      total_connections: wabaTargets.size,
      errors,
      fetch_failures: fetchFailures,
      reconciled: !localErr,
      truncated,
    })
  } catch (error) {
    console.error('Error syncing WhatsApp templates:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to sync templates',
      },
      { status: 500 },
    )
  }
}
