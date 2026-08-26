/**
 * Contrato entre o palco imersivo e a barra de navegação.
 *
 * A experiência deixou de ser conduzida pela posição da rolagem e passou a ser
 * conduzida por passos: um gesto avança exatamente um estado, independente de
 * quantas linhas a roda girou. Isso rompe a única linguagem que os dois
 * componentes tinham em comum — a porcentagem rolada. Este módulo é a
 * substituição: o palco publica em que passo está, a barra assina e pede saltos.
 *
 * É um registrador simples, e não um contexto React, porque os dois componentes
 * são irmãos montados por `page.tsx`; um provider só para isto adicionaria uma
 * camada de árvore sem entregar nada além do que estas quatro funções entregam.
 */

/** Rótulos da timeline, na ordem em que se atravessa a experiência. */
export const STAGE_STEPS = [
  "opening",
  "intent-atender",
  "intent-vender",
  "intent-acompanhar",
  "intent-automatizar",
  "flow-step-0",
  "flow-step-1",
  "flow-step-2",
  "flow-step-3",
  "flow-step-4",
  "editorial-contexto",
  "editorial-colaboracao",
  "editorial-processo",
  "editorial-controle",
  "hub-orbit",
  "hub-converged",
  "hub-simplification",
  "access-portal",
] as const;

export type StageStep = (typeof STAGE_STEPS)[number];

/**
 * Momentos da narrativa. `entry` é o passo em que a âncora pousa; `from`/`to`
 * delimitam quais passos acendem aquela âncora como ativa.
 */
export const STAGE_MOMENTS = [
  { id: "opening", title: "Intenção", entry: 1, from: 0, to: 4 },
  { id: "flow", title: "Fluxo", entry: 5, from: 5, to: 9 },
  { id: "editorial", title: "Visão", entry: 10, from: 10, to: 13 },
  { id: "hub", title: "Hub", entry: 14, from: 14, to: 16 },
  { id: "access", title: "Acesso", entry: 17, from: 17, to: 17 },
] as const;

export function momentIdForStep(index: number): string {
  const found = STAGE_MOMENTS.find((m) => index >= m.from && index <= m.to);
  return found ? found.id : STAGE_MOMENTS[0].id;
}

type IndexListener = (index: number) => void;

let currentIndex = 0;
let navigate: ((index: number) => void) | null = null;
const listeners = new Set<IndexListener>();

/** O palco registra como executar um salto. Devolve a função de baixa. */
export function registerStageNavigator(fn: (index: number) => void): () => void {
  navigate = fn;
  return () => {
    if (navigate === fn) navigate = null;
  };
}

/** O palco anuncia o passo em que acabou de chegar. */
export function publishStageIndex(index: number): void {
  currentIndex = index;
  listeners.forEach((listener) => listener(index));
}

/** A barra assina o passo corrente e já recebe o valor atual na inscrição. */
export function subscribeStageIndex(listener: IndexListener): () => void {
  listeners.add(listener);
  listener(currentIndex);
  return () => {
    listeners.delete(listener);
  };
}

/** Salto pedido de fora do palco. Silencioso se o palco não estiver montado. */
export function goToStageStep(index: number): void {
  navigate?.(index);
}
