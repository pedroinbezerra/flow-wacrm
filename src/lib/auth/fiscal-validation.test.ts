import { describe, it, expect } from "vitest";
import {
  isValidCpf,
  isValidCnpj,
  isValidCpfOrCnpj,
  sanitizeCpfCnpj,
  formatCpfCnpj,
} from "@/lib/validation/fiscal";

describe("Fiscal Data & CPF/CNPJ Validation Module", () => {
  it("valida CPFs reais e rejeita CPFs com dígito verificador incorreto", () => {
    // CPFs válidos conhecidos (algoritmo oficial DV)
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("529.982.247-25")).toBe(true);

    // CPFs inválidos
    expect(isValidCpf("52998224726")).toBe(false); // DV errado
    expect(isValidCpf("00000000000")).toBe(false); // Sequência repetida
    expect(isValidCpf("11111111111")).toBe(false); // Sequência repetida
    expect(isValidCpf("12345678901")).toBe(false); // DV inválido
    expect(isValidCpf("12345678")).toBe(false);    // Tamanho insuficiente
  });

  it("valida CNPJs reais e rejeita CNPJs com dígito verificador incorreto", () => {
    // CNPJ válido conhecido (ex: Petrobras 33.000.167/0001-01)
    expect(isValidCnpj("33000167000101")).toBe(true);
    expect(isValidCnpj("33.000.167/0001-01")).toBe(true);

    // CNPJs inválidos
    expect(isValidCnpj("33000167000102")).toBe(false); // DV errado
    expect(isValidCnpj("00000000000000")).toBe(false); // Sequência repetida
    expect(isValidCnpj("11111111111111")).toBe(false); // Sequência repetida
    expect(isValidCnpj("12345678000100")).toBe(false); // DV inválido
  });

  it("valida a função genérica isValidCpfOrCnpj", () => {
    expect(isValidCpfOrCnpj("52998224725")).toBe(true);
    expect(isValidCpfOrCnpj("33.000.167/0001-01")).toBe(true);
    expect(isValidCpfOrCnpj("00000000000")).toBe(false);
    expect(isValidCpfOrCnpj("invalid-string")).toBe(false);
    expect(isValidCpfOrCnpj("")).toBe(false);
    expect(isValidCpfOrCnpj(null)).toBe(false);
  });

  it("higieniza e aplica máscaras visuais aos documentos", () => {
    expect(sanitizeCpfCnpj("529.982.247-25")).toBe("52998224725");
    expect(formatCpfCnpj("52998224725")).toBe("529.982.247-25");
    expect(formatCpfCnpj("33000167000101")).toBe("33.000.167/0001-01");
  });
});
