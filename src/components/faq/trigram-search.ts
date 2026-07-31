/**
 * Helper de Busca Trigram (pg_trgm) e Sugestões "Você quis dizer?"
 * Inspirado na extensão pg_trgm do PostgreSQL com índice de termos.
 */

import { FaqCategory } from "./faq-data";

// Remove acentos e caracteres especiais para normalização
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

// Gera o conjunto de trigramas de uma palavra (ex: "flow" -> ["  f", " fl", "flo", "low", "ow "])
export function getTrigrams(word: string): Set<string> {
  const padded = `  ${word.trim()} `;
  const trigrams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.add(padded.substring(i, i + 3));
  }
  return trigrams;
}

// Calcula a similaridade pg_trgm entre duas palavras (coeficiente entre 0.0 e 1.0)
export function calcTrigramSimilarity(a: string, b: string): number {
  const normA = normalizeText(a);
  const normB = normalizeText(b);

  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;
  if (normA.includes(normB) || normB.includes(normA)) return 0.85;

  const triA = getTrigrams(normA);
  const triB = getTrigrams(normB);

  let intersection = 0;
  triA.forEach((tri) => {
    if (triB.has(tri)) {
      intersection++;
    }
  });

  const union = triA.size + triB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Palavras genéricas/stop words em português a ignorar no índice de sugestões
const STOP_WORDS = new Set([
  "o", "a", "os", "as", "um", "uma", "uns", "umas",
  "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
  "por", "para", "com", "como", "que", "se", "ou", "e", "ao", "aos",
  "qual", "quais", "quem", "meu", "sua", "seu", "seus", "suas",
  "este", "esta", "estes", "estas", "isso", "isto", "aquilo",
  "mais", "menos", "muito", "muitos", "onde", "quando", "porque", "porquê",
  "pela", "pelo", "pelas", "pelos"
]);

export interface IndexedTerm {
  original: string; // Ex: "WhatsApp"
  normalized: string; // Ex: "whatsapp"
}

// Constrói o índice remissivo de termos únicos a partir de todas as perguntas, respostas e tags do FAQ
export function buildFaqTermsIndex(categories: FaqCategory[]): IndexedTerm[] {
  const termMap = new Map<string, string>(); // normalized -> original display term

  function addWord(word: string) {
    const cleanWord = word.trim().replace(/^[^a-zA-Z0-9áàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]+|[^a-zA-Z0-9áàâãéèêíïóôõöúçÑñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]+$/g, "");
    const norm = normalizeText(cleanWord);
    if (norm.length >= 3 && !STOP_WORDS.has(norm)) {
      if (!termMap.has(norm)) {
        termMap.set(norm, cleanWord);
      }
    }
  }

  for (const cat of categories) {
    // Adiciona título da categoria
    cat.title.split(/\s+/).forEach(addWord);

    for (const item of cat.items) {
      // Palavras da pergunta
      item.question.split(/\s+/).forEach(addWord);
      // Tags expressas
      item.tags?.forEach(addWord);
      // Palavras da resposta
      item.answer.split(/\s+/).forEach(addWord);
    }
  }

  return Array.from(termMap.entries()).map(([norm, orig]) => ({
    normalized: norm,
    original: orig,
  }));
}

// Retorna sugestões "Você quis dizer?" ordenadas pela similaridade pg_trgm
export function getDidYouMeanSuggestions(
  query: string,
  index: IndexedTerm[],
  threshold = 0.3,
  limit = 4
): string[] {
  const normQuery = normalizeText(query);
  if (!normQuery || normQuery.length < 2) return [];

  const queryWords = normQuery.split(/\s+/).filter((w) => w.length >= 2);

  const scoredMap = new Map<string, number>();

  for (const word of queryWords) {
    for (const term of index) {
      // Se a palavra procurada for muito próxima ou similar via trigramas
      const sim = calcTrigramSimilarity(word, term.normalized);

      // Não sugerir se for exatamente a mesma palavra digitada
      if (word === term.normalized) continue;

      if (sim >= threshold) {
        const currentScore = scoredMap.get(term.original) || 0;
        if (sim > currentScore) {
          scoredMap.set(term.original, sim);
        }
      }
    }
  }

  return Array.from(scoredMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}
