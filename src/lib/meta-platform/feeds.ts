/**
 * Leitura dos feeds RSS da Meta: histórico de incidentes e changelog.
 *
 * O parser é deliberadamente pequeno. Não entra dependência de XML no
 * bundle por dois feeds de formato fixo e origem única; em compensação ele
 * não tenta ser um parser de RSS genérico — se a Meta mudar o formato, a
 * leitura devolve lista vazia com erro declarado, e não silêncio.
 */

export const CHANGELOG_FEED_URL =
  'https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog/rss/'

export interface FeedItem {
  title: string
  description: string
  link: string | null
  publishedAt: string | null
}

export interface FeedResult {
  items: FeedItem[]
  error: string | null
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
}

export function decodeEntities(s: string): string {
  return s
    // Hexadecimal antes de decimal: a Meta usa `&#x2014;` (travessão)
    // no changelog, e só a forma decimal deixaria isso na tela.
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;|&#39;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
}

function tag(block: string, name: string): string | null {
  const cdata = new RegExp(`<${name}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${name}>`, 'i')
  const plain = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i')
  const m = block.match(cdata) ?? block.match(plain)
  if (!m) return null
  // Decodificar ANTES de tirar marcação. Na ordem inversa, um `&lt;b&gt;`
  // atravessa a limpeza como entidade e reaparece como `<b>` no texto
  // final — foi o que o teste pegou.
  return decodeEntities(m[1]).replace(/<[^>]+>/g, '').trim()
}

export function parseRss(xml: string, limit = 15): FeedItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []
  return blocks.slice(0, limit).map((b) => {
    const raw = tag(b, 'pubDate')
    const parsed = raw ? Date.parse(raw) : NaN
    return {
      title: tag(b, 'title') ?? '(sem título)',
      description: tag(b, 'description') ?? '',
      link: tag(b, 'link'),
      publishedAt: Number.isNaN(parsed) ? null : new Date(parsed).toISOString(),
    }
  })
}

export async function fetchFeed(url: string, limit = 15): Promise<FeedResult> {
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/rss+xml, application/xml, text/xml' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { items: [], error: `Feed respondeu ${res.status}` }
    const body = await res.text()
    // A Meta serve HTML no lugar do feed quando a URL não existe mais.
    // Devolver [] silenciosamente aqui esconderia um feed morto.
    if (!/<rss[\s>]|<feed[\s>]/i.test(body)) {
      return { items: [], error: 'Resposta não é RSS — o endereço do feed pode ter mudado' }
    }
    return { items: parseRss(body, limit), error: null }
  } catch (err) {
    return {
      items: [],
      error: err instanceof Error ? err.message : 'Falha ao consultar o feed',
    }
  }
}
