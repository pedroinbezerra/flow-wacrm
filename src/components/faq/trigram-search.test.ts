import { describe, it, expect } from "vitest";
import {
  normalizeText,
  calcTrigramSimilarity,
  buildFaqTermsIndex,
  getDidYouMeanSuggestions,
} from "./trigram-search";
import { FAQ_CATEGORIES } from "./faq-data";

describe("FAQ Trigram Search Utility", () => {
  it("deve normalizar textos removendo acentos e caracteres especiais", () => {
    expect(normalizeText("Automação & Transmissão!")).toBe("automacao   transmissao");
    expect(normalizeText("WhatsApp Business API")).toBe("whatsapp business api");
  });

  it("deve calcular a similaridade de trigramas corretamente", () => {
    expect(calcTrigramSimilarity("whatsapp", "whatsapp")).toBe(1.0);
    expect(calcTrigramSimilarity("whatsap", "whatsapp")).toBeGreaterThan(0.2);
    expect(calcTrigramSimilarity("xyz", "whatsapp")).toBe(0);
  });

  it("deve construir o índice de termos a partir das categorias do FAQ", () => {
    const index = buildFaqTermsIndex(FAQ_CATEGORIES);
    expect(index.length).toBeGreaterThan(10);
    const hasWhatsApp = index.some((item) => item.normalized === "whatsapp");
    expect(hasWhatsApp).toBe(true);
  });

  it("deve fornecer sugestões de 'Você quis dizer?' para termos com erro de digitação", () => {
    const index = buildFaqTermsIndex(FAQ_CATEGORIES);
    const suggestions = getDidYouMeanSuggestions("whatsap", index, 0.20, 4);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((s) => s.toLowerCase() === "whatsapp")).toBe(true);
  });
});
