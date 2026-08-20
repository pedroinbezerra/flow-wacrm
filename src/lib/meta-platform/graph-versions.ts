/**
 * Calendário de versões da Graph API.
 *
 * **Esta tabela é mantida à mão, e isso é uma decisão, não um atalho.** Não
 * existe endpoint na Meta que devolva a data de expiração de uma versão —
 * o número da versão mais recente é consultável, o prazo de morte das
 * antigas só está publicado em documentação. Fingir que este dado é vivo
 * seria o defeito exato que o painel existe para matar: um prazo que
 * envelhece calado.
 *
 * Por isso `CALENDAR_CHECKED_AT` existe e é exibido na tela. Quando a
 * conferência ficar velha, a tela diz que ficou.
 *
 * Regra da Meta: cada versão vive ao menos dois anos, e deixa de funcionar
 * dois anos após o lançamento da versão seguinte.
 * https://developers.facebook.com/docs/graph-api/changelog
 */

/** Data da última conferência humana desta tabela contra o changelog. */
export const CALENDAR_CHECKED_AT = '2026-08-20'

/** A tabela é considerada velha depois disso, e a tela avisa. */
export const CALENDAR_STALE_AFTER_DAYS = 120

export interface GraphVersion {
  version: string
  releasedOn: string
  /** `null` = a Meta ainda não anunciou prazo para esta versão. */
  expiresOn: string | null
}

export const GRAPH_VERSIONS: readonly GraphVersion[] = [
  { version: 'v26.0', releasedOn: '2026-07-29', expiresOn: null },
  { version: 'v25.0', releasedOn: '2026-02-18', expiresOn: '2028-07-29' },
  { version: 'v24.0', releasedOn: '2025-10-08', expiresOn: '2028-02-18' },
  { version: 'v23.0', releasedOn: '2025-05-29', expiresOn: '2027-10-08' },
  { version: 'v22.0', releasedOn: '2025-01-21', expiresOn: '2027-05-20' },
  { version: 'v21.0', releasedOn: '2024-10-02', expiresOn: '2027-01-21' },
  { version: 'v20.0', releasedOn: '2024-05-21', expiresOn: '2026-09-24' },
] as const

export type VersionUrgency = 'ok' | 'atencao' | 'critico' | 'expirado' | 'desconhecido'

export interface VersionAssessment {
  /** Versão que o produto usa hoje. */
  current: string
  releasedOn: string | null
  expiresOn: string | null
  daysLeft: number | null
  urgency: VersionUrgency
  /** Quantas versões existem depois da nossa nesta tabela. */
  versionsBehind: number
  /** Mais recente conhecida pela tabela local. */
  latestKnown: string
  /** A tabela local já passou do prazo de reconferência? */
  calendarStale: boolean
  calendarCheckedAt: string
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso + 'T00:00:00Z')
  const to = Date.parse(toIso + 'T00:00:00Z')
  return Math.round((to - from) / 86_400_000)
}

function urgencyFor(daysLeft: number | null): VersionUrgency {
  if (daysLeft === null) return 'desconhecido'
  if (daysLeft < 0) return 'expirado'
  if (daysLeft <= 90) return 'critico'
  if (daysLeft <= 240) return 'atencao'
  return 'ok'
}

/**
 * Avalia a versão em uso contra o calendário.
 *
 * `today` é injetável para o teste não depender do relógio.
 */
export function assessGraphVersion(
  currentVersion: string,
  today: string = new Date().toISOString().slice(0, 10)
): VersionAssessment {
  const index = GRAPH_VERSIONS.findIndex((v) => v.version === currentVersion)
  const entry = index >= 0 ? GRAPH_VERSIONS[index] : null
  const daysLeft = entry?.expiresOn ? daysBetween(today, entry.expiresOn) : null

  return {
    current: currentVersion,
    releasedOn: entry?.releasedOn ?? null,
    expiresOn: entry?.expiresOn ?? null,
    daysLeft,
    // Versão fora da tabela é desconhecida, não "ok" — silenciar aqui
    // seria inventar tranquilidade que não foi verificada.
    urgency: entry ? urgencyFor(daysLeft) : 'desconhecido',
    versionsBehind: index >= 0 ? index : -1,
    latestKnown: GRAPH_VERSIONS[0].version,
    calendarStale: daysBetween(CALENDAR_CHECKED_AT, today) > CALENDAR_STALE_AFTER_DAYS,
    calendarCheckedAt: CALENDAR_CHECKED_AT,
  }
}
