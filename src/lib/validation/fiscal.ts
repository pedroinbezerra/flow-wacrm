/**
 * Módulo de validação e formatação fiscal brasileira (CPF e CNPJ).
 * Implementa validação dos dígitos verificadores (DV) oficiais da Receita Federal
 * incluindo suporte a CNPJs alfanuméricos (IN RFB nº 2.229/2024).
 */

export function sanitizeCpfCnpj(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}

/**
 * Valida os dígitos verificadores de um CPF (11 dígitos numéricos).
 */
export function isValidCpf(cpf: string): boolean {
  const clean = sanitizeCpfCnpj(cpf);

  if (clean.length !== 11 || /\D/.test(clean)) return false;
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
 * Valida os dígitos verificadores de um CNPJ (14 caracteres numéricos ou alfanuméricos).
 * Suporta o padrão numérico clássico e o novo padrão alfanumérico (IN RFB nº 2.229/2024).
 */
export function isValidCnpj(cnpj: string): boolean {
  const clean = sanitizeCpfCnpj(cnpj);

  if (clean.length !== 14) return false;
  // Rejeita sequências repetidas
  if (/^([0-9A-Z])\1{13}$/.test(clean)) return false;
  // As duas últimas posições (DGs verificadores) devem ser numéricas
  if (!/^\d{2}$/.test(clean.slice(12))) return false;

  const weightsFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weightsSecond = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const getCharValue = (char: string): number => {
    const code = char.charCodeAt(0);
    // Dígitos '0'-'9': ASCII 48-57 -> 0-9
    // Letras 'A'-'Z': ASCII 65-90 -> 17-42 (code - 48)
    return code - 48;
  };

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += getCharValue(clean.charAt(i)) * weightsFirst[i];
  }
  let mod = sum % 11;
  let firstDv = mod < 2 ? 0 : 11 - mod;
  if (firstDv !== parseInt(clean.charAt(12), 10)) return false;

  sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += getCharValue(clean.charAt(i)) * weightsSecond[i];
  }
  sum += firstDv * weightsSecond[12];
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
  if (clean.length === 11 && /^\d{11}$/.test(clean)) return isValidCpf(clean);
  if (clean.length === 14) return isValidCnpj(clean);
  return false;
}

/**
 * Formata uma string de CPF ou CNPJ com máscara visual.
 * Suporta o formato CPF (000.000.000-00) e CNPJ (00.000.000/0000-00 ou 00.000.000/E08G-12).
 */
export function formatCpfCnpj(value: string | null | undefined): string {
  const clean = sanitizeCpfCnpj(value);
  if (!clean) return "";

  // Se tem até 11 dígitos e é estritamente numérico -> formata/mascara como CPF
  if (clean.length <= 11 && /^\d+$/.test(clean)) {
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return clean
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }

  // CNPJ (14 caracteres alfanuméricos ou em progresso)
  if (clean.length === 14) {
    return clean.replace(/^([0-9A-Z]{2})([0-9A-Z]{3})([0-9A-Z]{3})([0-9A-Z]{4})([0-9A-Z]{2})$/, "$1.$2.$3/$4-$5");
  }

  return clean
    .replace(/^([0-9A-Z]{2})([0-9A-Z])/, "$1.$2")
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})([0-9A-Z])/, "$1.$2.$3")
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})\.([0-9A-Z]{3})([0-9A-Z])/, "$1.$2.$3/$4")
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})\.([0-9A-Z]{3})\/([0-9A-Z]{4})([0-9A-Z])/, "$1.$2.$3/$4-$5");
}
