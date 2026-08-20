/**
 * Disponibilidade real de um modelo antes do envio.
 *
 * Um modelo do WhatsApp existe dentro de uma WABA. Trocar o numero
 * conectado por outro de WABA diferente nao migra modelo nenhum: o
 * catalogo antigo simplesmente deixa de existir para a conexao nova.
 * Enquanto isso nao era representado localmente, a linha continuava
 * APPROVED e o usuario so descobria no envio, com o texto cru da Meta
 * `(#132001) Template name does not exist in the translation`.
 *
 * Este modulo concentra as tres decisoes envolvidas:
 *   - `evaluateTemplateAvailability` — o modelo pode ser enviado por
 *     esta conexao? (checagem antes de gastar a chamada na Meta)
 *   - `isTemplateMissingAtMetaError` — a Meta acabou de dizer que o
 *     modelo nao existe? (para corrigir o estado local em vez de
 *     repetir o mesmo erro na proxima tentativa)
 *   - `TEMPLATE_MISSING_STATUS` — o estado local unico que representa
 *     "tinha contrapartida na Meta e nao tem mais".
 *
 * Funcoes puras, sem acesso a banco, para serem testaveis e usadas
 * igualmente pelo envio avulso, pela transmissao e pelas automacoes.
 */

import type { MessageTemplateStatus } from '@/types'

/**
 * Estado local, nunca recebido da Meta. Escrito pela reconciliacao da
 * sincronizacao, pela desconexao de um numero e pela auto-correcao no
 * envio. Fica fora de `template-status-normalize` de proposito: nada
 * que chega da Meta deve virar MISSING por engano.
 */
export const TEMPLATE_MISSING_STATUS = 'MISSING' as const

/**
 * Codigos da Meta que significam "esse modelo nao existe nesta WABA".
 *
 * 132001 — Template name does not exist in the translation (o caso
 *          classico: modelo apagado, ou catalogo de outra WABA).
 * 132000 e 132005 sao problemas de parametro/conteudo e NAO entram
 * aqui: marcar o modelo como inexistente por causa deles esconderia um
 * erro de preenchimento atras de um estado errado.
 */
const MISSING_TEMPLATE_META_CODES = [132001] as const

/**
 * Reconhece a falha da Meta que indica modelo inexistente.
 *
 * Aceita a mensagem crua porque e o que sobe pela pilha de envio
 * (`Meta API error: (#132001) ...`). O codigo entre parenteses e o
 * sinal confiavel; o casamento por texto so cobre respostas em que a
 * Meta omitiu o codigo.
 */
export function isTemplateMissingAtMetaError(message: string): boolean {
  if (!message) return false

  for (const code of MISSING_TEMPLATE_META_CODES) {
    if (message.includes(`#${code}`) || message.includes(`(${code})`)) {
      return true
    }
  }

  return /template name does not exist/i.test(message)
}

export type TemplateUnavailableReason =
  /** A reconciliacao ja constatou que a Meta nao lista mais o modelo. */
  | 'missing'
  /** O modelo pertence a outra WABA — nao existe para a conexao em uso. */
  | 'foreign_waba'

export type TemplateAvailability =
  | { sendable: true }
  | { sendable: false; reason: TemplateUnavailableReason }

interface EvaluateInput {
  /**
   * Linha local do modelo. `null` mantem o caminho legado de envio por
   * nome — nesse caso nao ha o que verificar e a Meta decide.
   */
  template: {
    status?: string | null
    waba_id?: string | null
    meta_template_id?: string | null
  } | null
  /** WABA da conexao que fara o envio. */
  activeWabaId?: string | null
}

/**
 * Decide se vale a pena chamar a Meta.
 *
 * Bloqueia apenas o que e fato estabelecido — modelo ja reconciliado
 * como ausente, ou modelo comprovadamente de outra WABA. Status como
 * PENDING ou REJECTED nao bloqueiam aqui de proposito: eles podem estar
 * defasados em relacao a Meta, e recusar um envio valido por causa de
 * uma copia velha seria trocar um erro por outro.
 */
export function evaluateTemplateAvailability({
  template,
  activeWabaId,
}: EvaluateInput): TemplateAvailability {
  if (!template) return { sendable: true }

  if (template.status === TEMPLATE_MISSING_STATUS) {
    return { sendable: false, reason: 'missing' }
  }

  // waba_id nulo = origem nao verificada (linha anterior a migracao 068
  // ou modelo local que nunca foi a Meta). Nao da para afirmar que
  // pertence a outra WABA, entao o envio segue e a Meta decide.
  if (
    template.waba_id &&
    activeWabaId &&
    template.waba_id !== activeWabaId
  ) {
    return { sendable: false, reason: 'foreign_waba' }
  }

  return { sendable: true }
}

/**
 * Status que representam "esta linha afirma ter contrapartida viva na
 * Meta". Sao os que a reconciliacao precisa rebaixar quando a Meta nao
 * devolve mais o modelo. DRAFT fica de fora: nunca foi enviado, entao
 * ausencia na Meta e o esperado, nao uma divergencia.
 */
export const STATUSES_CLAIMING_META_COUNTERPART: readonly MessageTemplateStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'PAUSED',
  'DISABLED',
  'IN_APPEAL',
  'PENDING_DELETION',
]
