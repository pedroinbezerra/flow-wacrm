/**
 * Rascunho do compositor, isolado por conversa.
 *
 * Existe para cumprir duas obrigações constitucionais que o estado em memória
 * não cumpria (dívida DIV-0005 do Anexo F):
 *
 *   - `FH-10.01` / `FH-14.01` / `FH-14.09` — nada que o usuário digitou se
 *     perde por recarregamento, troca de tela ou expiração de sessão.
 *   - `FH-14.03` — trabalhar em várias conversas ao mesmo tempo não mistura
 *     contexto. Sem isso, o texto escrito para um contato reaparecia no
 *     compositor do contato seguinte, com risco de envio ao destinatário
 *     errado (`FH-45.07`).
 *
 * O armazenamento é local ao dispositivo e some assim que a mensagem é
 * enviada — o rascunho é trabalho em andamento, não histórico (`FH-11.04`,
 * minimização).
 */

const PREFIX = "flow-hub.composer-draft.";

/** Teto de caracteres persistidos. Rascunhos maiores que isto indicam colagem
 *  de conteúdo extenso, que não vale o custo de armazenamento local. */
const MAX_DRAFT_LENGTH = 8000;

function keyFor(conversationId: string): string {
  return `${PREFIX}${conversationId}`;
}

/** Acesso defensivo: armazenamento local pode estar indisponível (modo
 *  privado, cota cheia, política do navegador). Nenhuma dessas situações pode
 *  quebrar o compositor — a preservação é melhor-esforço. */
function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readDraft(conversationId: string): string {
  if (!conversationId) return "";
  try {
    return storage()?.getItem(keyFor(conversationId)) ?? "";
  } catch {
    return "";
  }
}

export function writeDraft(conversationId: string, text: string): void {
  if (!conversationId) return;
  const store = storage();
  if (!store) return;
  try {
    // Rascunho vazio não é rascunho: remove em vez de guardar string vazia,
    // para não acumular chaves órfãs de conversas já respondidas.
    if (!text.trim()) {
      store.removeItem(keyFor(conversationId));
      return;
    }
    store.setItem(keyFor(conversationId), text.slice(0, MAX_DRAFT_LENGTH));
  } catch {
    // Cota estourada ou armazenamento bloqueado: segue sem persistir.
  }
}

export function clearDraft(conversationId: string): void {
  if (!conversationId) return;
  try {
    storage()?.removeItem(keyFor(conversationId));
  } catch {
    // Sem armazenamento não há o que limpar.
  }
}
