/**
 * Módulo de validação e formatação fiscal brasileira (CPF e CNPJ).
 * Implementa validação dos dígitos verificadores (DV) oficiais da Receita Federal.
 */

export function sanitizeCpfCnpj(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/**
 * Valida os dígitos verificadores de um CPF (11 dígitos).
 */
export function isValidCpf(cpf: string): boolean {
  const clean = sanitizeCpfCnpj(cpf);

  if (clean.length !== 11) return false;
  // Rejeita sequências repetidas (ex: 000.000.000-00, 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

/**
 * Valida os dígitos verificadores de um CNPJ (14 dígitos).
 */
export function isValidCnpj(cnpj: string): boolean {
  const clean = sanitizeCpfCnpj(cnpj);

  if (clean.length !== 14) return false;
  // Rejeita sequências repetidas (ex: 00.000.000/0000-00, 11.111.111/1111-11)
  if (/^(\d)\1{13}$/.test(clean)) return false;

  const weightsFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weightsSecond = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean.charAt(i), 10) * weightsFirst[i];
  }
  let mod = sum % 11;
  let firstDv = mod < 2 ? 0 : 11 - mod;
  if (firstDv !== parseInt(clean.charAt(12), 10)) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean.charAt(i), 10) * weightsSecond[i];
  }
  mod = sum % 11;
  let secondDv = mod < 2 ? 0 : 11 - mod;
  if (secondDv !== parseInt(clean.charAt(13), 10)) return false;

  return true;
}

/**
 * Valida se a string é um CPF ou CNPJ válido de acordo com os dígitos verificadores.
 */
export function isValidCpfOrCnpj(value: string | null | undefined): boolean {
  if (!value) return false;
  const clean = sanitizeCpfCnpj(value);
  if (clean.length === 11) return isValidCpf(clean);
  if (clean.length === 14) return isValidCnpj(clean);
  return false;
}

/**
 * Formata uma string de CPF ou CNPJ com máscara visual.
 */
export function formatCpfCnpj(value: string | null | undefined): string {
  const clean = sanitizeCpfCnpj(value);
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value || "";
}
