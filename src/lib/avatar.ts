/**
 * Monograma de contato — semente, matiz e iniciais.
 *
 * A marca precisa ser idêntica para o mesmo contato em Caixa de
 * Entrada, Quadros, Contatos e Funis. Como nem toda tela carrega os
 * mesmos campos (o cartão de quadro só tem o rótulo exibido, a lista
 * de conversas tem nome e telefone), a semente é sempre o rótulo que
 * *toda* tela consegue produzir: nome quando existe, telefone quando
 * não. Mudar essa regra reintroduz o bug de o mesmo contato aparecer
 * com duas cores em duas telas.
 */

/** Quantidade de matizes de identidade declarados em globals.css. */
const IDENTITY_COUNT = 8;

/** Partículas que não carregam inicial em nome pt-BR. */
const NAME_PARTICLES = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'di',
  'del',
  'della',
  'du',
  'la',
  'le',
  'van',
  'von',
  'y',
]);

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Classe de matiz do monograma, derivada da semente. Retorna só o
 * nome da classe — a cor em si vive nos tokens `--identity-*`, para
 * que nenhuma cor literal exista em componente (`FH-29.01`).
 */
export function getIdentityClass(seed?: string | null): string {
  const normalized = (seed ?? '').trim().toLowerCase();
  if (!normalized) return 'avatar-identity-1';
  return `avatar-identity-${(hashCode(normalized) % IDENTITY_COUNT) + 1}`;
}

/**
 * Mantém apenas os caracteres que podem virar inicial. Nome vindo do
 * WhatsApp costuma trazer emoji e pontuação ("🔥 Pedro", "•Ana•"), e
 * fatiar isso por índice de UTF-16 produz meio par surrogate — um
 * quadrado vazio dentro do círculo.
 */
function lettersOnly(part: string): string {
  return Array.from(part)
    .filter((ch) => /\p{L}|\p{N}/u.test(ch))
    .join('');
}

/**
 * Duas letras a partir do nome; na falta dele, os dois últimos
 * dígitos do telefone.
 */
export function getInitials(name?: string | null, phone?: string | null): string {
  if (name && name.trim()) {
    const parts = name
      .trim()
      .split(/\s+/)
      .map(lettersOnly)
      .filter(Boolean);

    if (parts.length > 1) {
      // Sobrenome real: "Ana de Souza" → AS, nunca AD.
      const surname =
        [...parts]
          .slice(1)
          .reverse()
          .find((part) => !NAME_PARTICLES.has(part.toLowerCase())) ?? parts[parts.length - 1];
      return (firstChar(parts[0]) + firstChar(surname)).toLocaleUpperCase('pt-BR');
    }

    if (parts.length === 1) {
      return Array.from(parts[0]).slice(0, 2).join('').toLocaleUpperCase('pt-BR');
    }
  }

  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits) return digits.slice(-2);
  }

  return '?';
}

function firstChar(str: string): string {
  return Array.from(str)[0] ?? '';
}
