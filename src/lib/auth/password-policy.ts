export const PASSWORD_POLICY_MIN_LENGTH = 8;
export const PASSWORD_POLICY_MAX_LENGTH = 72;
export const PASSWORD_POLICY_MAX_PASSWORD = PASSWORD_POLICY_MAX_LENGTH;

export interface PasswordChecks {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  checks: PasswordChecks;
  errors: string[];
}

/**
 * Validates a password against FlowHub's security policy:
 * - Minimum 8 characters
 * - Maximum 72 characters
 * - At least one lowercase letter (a-z)
 * - At least one uppercase letter (A-Z)
 * - At least one digit (0-9)
 * - At least one special symbol (!@#$%^&* etc.)
 */
export function validatePassword(password: string): PasswordValidationResult {
  const checks: PasswordChecks = {
    minLength: password.length >= PASSWORD_POLICY_MIN_LENGTH,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSymbol: /[^a-zA-Z0-9]/.test(password),
  };

  const errors: string[] = [];

  if (!checks.minLength) {
    errors.push(`A senha deve ter pelo menos ${PASSWORD_POLICY_MIN_LENGTH} caracteres.`);
  }
  if (password.length > PASSWORD_POLICY_MAX_LENGTH) {
    errors.push(`A senha deve ter no máximo ${PASSWORD_POLICY_MAX_LENGTH} caracteres.`);
  }
  if (!checks.hasLowercase) {
    errors.push("A senha deve conter pelo menos uma letra minúscula (a-z).");
  }
  if (!checks.hasUppercase) {
    errors.push("A senha deve conter pelo menos uma letra maiúscula (A-Z).");
  }
  if (!checks.hasDigit) {
    errors.push("A senha deve conter pelo menos um número (0-9).");
  }
  if (!checks.hasSymbol) {
    errors.push("A senha deve conter pelo menos um caractere especial ou símbolo (!@#$%...).");
  }

  const isValid =
    checks.minLength &&
    password.length <= PASSWORD_POLICY_MAX_LENGTH &&
    checks.hasLowercase &&
    checks.hasUppercase &&
    checks.hasDigit &&
    checks.hasSymbol;

  return {
    isValid,
    checks,
    errors,
  };
}

/**
 * Parses and formats Supabase Auth password errors into clear, friendly Portuguese.
 * Specially handles HIBP (leaked password) errors and complexity rejection.
 */
export function parseSupabasePasswordError(
  error: unknown,
  fallbackMessage = "Não foi possível validar a senha. Verifique os requisitos de segurança."
): string {
  if (!error) return fallbackMessage;

  const rawMessage =
    typeof error === "string"
      ? error
      : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error);

  const rawCode =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  const lowerMsg = rawMessage.toLowerCase();
  const lowerCode = rawCode.toLowerCase();

  // Detect captcha required / failed error from Supabase Auth
  if (
    lowerCode === "captcha_failed" ||
    lowerMsg.includes("captcha protection") ||
    lowerMsg.includes("no captcha_token found") ||
    lowerMsg.includes("captcha")
  ) {
    return "A verificação do Captcha é obrigatória pelo Supabase Auth. Complete o desafio visual ou verifique se a chave NEXT_PUBLIC_HCAPTCHA_SITE_KEY está configurada no seu .env.local.";
  }

  // Detect leaked/compromised/pwned password errors (Have I Been Pwned integration in Supabase Auth)
  if (
    lowerMsg.includes("pwned") ||
    lowerMsg.includes("leaked") ||
    lowerMsg.includes("data breach") ||
    lowerMsg.includes("compromised") ||
    lowerMsg.includes("known to be weak") ||
    lowerMsg.includes("should not be used")
  ) {
    return "Esta senha foi exposta em vazamentos de dados conhecidos e não é segura. Por razões de segurança, escolha uma senha diferente.";
  }

  // Detect weak password error code or text
  if (
    lowerCode === "weak_password" ||
    lowerMsg.includes("weak_password") ||
    lowerMsg.includes("password should be") ||
    lowerMsg.includes("password requirements") ||
    lowerMsg.includes("rejected as weak")
  ) {
    return "A senha é considerada fraca. Certifique-se de incluir letras maiúsculas, minúsculas, números e símbolos com no mínimo 8 caracteres.";
  }

  if (lowerMsg.includes("password too short") || lowerMsg.includes("at least 6") || lowerMsg.includes("at least 8")) {
    return `A senha deve ter pelo menos ${PASSWORD_POLICY_MIN_LENGTH} caracteres.`;
  }

  return rawMessage || fallbackMessage;
}
