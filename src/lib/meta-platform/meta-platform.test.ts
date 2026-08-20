import { describe, expect, it } from 'vitest';
import { assessGraphVersion, GRAPH_VERSIONS } from './graph-versions';
import { normalizeStatus, parseOrgs, worstOf } from './platform-status';
import { decodeEntities, parseRss } from './feeds';
import { parseHealthStatus } from './health-status';
import { parseAppUsage, parseBusinessUsage } from './app-usage';

describe('assessGraphVersion', () => {
  it('mede o prazo restante a partir da tabela', () => {
    const a = assessGraphVersion('v25.0', '2026-08-20');
    expect(a.expiresOn).toBe('2028-07-29');
    expect(a.daysLeft).toBeGreaterThan(700);
    expect(a.urgency).toBe('ok');
  });

  it('marca como crítico o que expira em até 90 dias', () => {
    // v21.0 expira em 21/01/2027.
    expect(assessGraphVersion('v21.0', '2026-11-01').urgency).toBe('critico');
  });

  it('marca como atenção a faixa intermediária', () => {
    expect(assessGraphVersion('v21.0', '2026-08-20').urgency).toBe('atencao');
  });

  it('reconhece versão já expirada', () => {
    const a = assessGraphVersion('v21.0', '2027-03-01');
    expect(a.urgency).toBe('expirado');
    expect(a.daysLeft).toBeLessThan(0);
  });

  it('trata versão fora da tabela como desconhecida, nunca como saudável', () => {
    // Silenciar aqui inventaria tranquilidade que ninguém verificou.
    const a = assessGraphVersion('v99.0', '2026-08-20');
    expect(a.urgency).toBe('desconhecido');
    expect(a.versionsBehind).toBe(-1);
  });

  it('avisa quando a própria tabela ficou velha', () => {
    expect(assessGraphVersion('v25.0', '2026-08-20').calendarStale).toBe(false);
    expect(assessGraphVersion('v25.0', '2027-06-01').calendarStale).toBe(true);
  });

  it('a versão sem prazo anunciado não vira urgência falsa', () => {
    const a = assessGraphVersion('v26.0', '2026-08-20');
    expect(a.expiresOn).toBeNull();
    expect(a.urgency).toBe('desconhecido');
  });

  it('a tabela está ordenada da mais nova para a mais antiga', () => {
    const dates = GRAPH_VERSIONS.map((v) => v.releasedOn);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

describe('normalizeStatus', () => {
  it('entende as frases que a Meta publica hoje', () => {
    expect(normalizeStatus('No known issues')).toBe('operacional');
    expect(normalizeStatus('Resolved')).toBe('operacional');
    expect(normalizeStatus('Some disruption')).toBe('degradado');
    expect(normalizeStatus('Major outage')).toBe('fora');
  });

  it('frase desconhecida vira desconhecido, não operacional', () => {
    // O ponto do painel é não transformar ignorância em tranquilidade.
    expect(normalizeStatus('Alguma frase nova da Meta')).toBe('desconhecido');
    expect(normalizeStatus('')).toBe('desconhecido');
  });
});

describe('worstOf', () => {
  it('o produto vale pelo seu elo mais fraco', () => {
    expect(worstOf(['operacional', 'degradado', 'operacional'])).toBe('degradado');
    expect(worstOf(['degradado', 'fora'])).toBe('fora');
    expect(worstOf(['operacional', 'operacional'])).toBe('operacional');
  });

  it('desconhecido pesa mais que operacional e menos que degradado', () => {
    expect(worstOf(['operacional', 'desconhecido'])).toBe('desconhecido');
    expect(worstOf(['desconhecido', 'degradado'])).toBe('degradado');
  });
});

describe('parseOrgs', () => {
  const raw = [
    { id: 'ads-manager', name: 'Ads', services: [{ name: 'X', status: 'No known issues' }] },
    {
      id: 'graph-api',
      name: 'Graph API',
      rss_file_paths: ['outage-events-feed-graph-api.rss'],
      services: [{ name: 'Platform Status', status: 'Major outage' }],
    },
    {
      id: 'whatsapp-business-api',
      name: 'WhatsApp Business Platform',
      services: [
        { name: 'Cloud API', status: 'No known issues' },
        { name: 'Embedded Signup', status: 'Some disruption' },
      ],
    },
  ];

  it('mantém só os produtos que importam, na ordem definida por nós', () => {
    const out = parseOrgs(raw);
    expect(out.map((p) => p.id)).toEqual(['whatsapp-business-api', 'graph-api']);
  });

  it('resume o produto pelo pior serviço', () => {
    const wa = parseOrgs(raw).find((p) => p.id === 'whatsapp-business-api')!;
    expect(wa.worst).toBe('degradado');
    expect(wa.services).toHaveLength(2);
  });

  it('monta a URL do feed de incidentes quando existe', () => {
    const graph = parseOrgs(raw).find((p) => p.id === 'graph-api')!;
    expect(graph.incidentFeedUrl).toBe(
      'https://metastatus.com/outage-events-feed-graph-api.rss',
    );
  });

  it('não quebra com payload inesperado', () => {
    expect(parseOrgs(null)).toEqual([]);
    expect(parseOrgs({})).toEqual([]);
    expect(parseOrgs([{}])).toEqual([]);
  });
});

describe('parseRss', () => {
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel>
    <item>
      <title>August 19, 2026</title>
      <description>Added &lt;b&gt;WhatsApp Business app login&lt;/b&gt;.</description>
      <link>https://example.com/a</link>
      <pubDate>Wed, 19 Aug 2026 07:00:00 +0000</pubDate>
    </item>
    <item><title><![CDATA[Com CDATA]]></title><description>x</description></item>
  </channel></rss>`;

  it('extrai título, descrição, link e data', () => {
    const items = parseRss(xml);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('August 19, 2026');
    expect(items[0].link).toBe('https://example.com/a');
    expect(items[0].publishedAt).toBe('2026-08-19T07:00:00.000Z');
  });

  it('decodifica entidades e remove marcação da descrição', () => {
    expect(parseRss(xml)[0].description).toBe('Added WhatsApp Business app login.');
  });

  it('lê CDATA e aceita item sem data', () => {
    const second = parseRss(xml)[1];
    expect(second.title).toBe('Com CDATA');
    expect(second.publishedAt).toBeNull();
  });

  it('respeita o limite pedido', () => {
    expect(parseRss(xml, 1)).toHaveLength(1);
  });

  it('decodeEntities cobre os casos comuns', () => {
    expect(decodeEntities('a &amp; b &lt;c&gt; &quot;d&quot;')).toBe('a & b <c> "d"');
  });

  it('decodifica entidade hexadecimal — a Meta usa &#x2014; no changelog', () => {
    expect(decodeEntities('antes &#x2014; depois')).toBe('antes — depois');
    expect(decodeEntities('&#8212;')).toBe('—');
  });
});

describe('parseHealthStatus', () => {
  it('lê o estado geral e as entidades com erro', () => {
    const out = parseHealthStatus('105154286024403', {
      health_status: {
        can_send_message: 'BLOCKED',
        entities: [
          {
            entity_type: 'PHONE_NUMBER',
            id: '597727103418254',
            can_send_message: 'AVAILABLE',
            errors: [
              {
                error_code: 138024,
                error_description: 'SIP não habilitado',
                possible_solution: 'Configure via settings API',
              },
            ],
          },
          { entity_type: 'WABA', id: '102290129340398', can_send_message: 'AVAILABLE' },
        ],
      },
    });
    expect(out.canSendMessage).toBe('BLOCKED');
    expect(out.entities).toHaveLength(2);
    expect(out.entities[0].errors[0].code).toBe(138024);
    expect(out.entities[0].errors[0].possibleSolution).toBe('Configure via settings API');
    expect(out.entities[1].errors).toEqual([]);
    expect(out.error).toBeNull();
  });

  it('resposta sem health_status é erro declarado, não saúde', () => {
    const out = parseHealthStatus('X', { id: 'X' });
    expect(out.canSendMessage).toBe('UNKNOWN');
    expect(out.error).toMatch(/health_status/);
  });

  it('valor desconhecido da Meta não vira AVAILABLE', () => {
    const out = parseHealthStatus('X', {
      health_status: { can_send_message: 'SOMETHING_NEW', entities: [] },
    });
    expect(out.canSendMessage).toBe('UNKNOWN');
  });
});

describe('cabeçalhos de quota', () => {
  it('lê X-App-Usage', () => {
    const r = parseAppUsage('{"call_count":28,"total_cputime":15,"total_time":20}', 'teste')!;
    expect(r.callCountPct).toBe(28);
    expect(r.totalCputimePct).toBe(15);
    expect(r.totalTimePct).toBe(20);
    expect(r.source).toBe('teste');
  });

  it('cabeçalho ausente ou inválido não inventa leitura', () => {
    expect(parseAppUsage(null, 't')).toBeNull();
    expect(parseAppUsage('não é json', 't')).toBeNull();
  });

  it('campo faltando vira null, não zero', () => {
    // Zero significaria "não consumimos nada", que é afirmação diferente
    // de "a Meta não informou".
    const r = parseAppUsage('{"call_count":10}', 't')!;
    expect(r.callCountPct).toBe(10);
    expect(r.totalCputimePct).toBeNull();
  });

  it('lê X-Business-Use-Case-Usage por WABA', () => {
    const out = parseBusinessUsage(
      '{"1757472798770767":[{"type":"messaging","call_count":42,"total_time":7}]}',
      't',
    );
    expect(out['1757472798770767'].callCountPct).toBe(42);
    expect(out['1757472798770767'].totalTimePct).toBe(7);
  });

  it('business usage inválido devolve objeto vazio', () => {
    expect(parseBusinessUsage(null, 't')).toEqual({});
    expect(parseBusinessUsage('{{{', 't')).toEqual({});
  });
});
