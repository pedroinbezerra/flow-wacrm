import { describe, it, expect } from "vitest";
import {
  validatePassword,
  parseSupabasePasswordError,
  PASSWORD_POLICY_MIN_LENGTH,
} from "./password-policy";

describe("validatePassword", () => {
  it("rejects short passwords (< 8 chars)", () => {
    const result = validatePassword("Ab1!");
    expect(result.isValid).toBe(false);
    expect(result.checks.minLength).toBe(false);
  });

  it("rejects passwords missing uppercase letters", () => {
    const result = validatePassword("password123!");
    expect(result.isValid).toBe(false);
    expect(result.checks.hasUppercase).toBe(false);
  });

  it("rejects passwords missing lowercase letters", () => {
    const result = validatePassword("PASSWORD123!");
    expect(result.isValid).toBe(false);
    expect(result.checks.hasLowercase).toBe(false);
  });

  it("rejects passwords missing digits", () => {
    const result = validatePassword("Password!");
    expect(result.isValid).toBe(false);
    expect(result.checks.hasDigit).toBe(false);
  });

  it("rejects passwords missing symbols", () => {
    const result = validatePassword("Password123");
    expect(result.isValid).toBe(false);
    expect(result.checks.hasSymbol).toBe(false);
  });

  it("accepts valid passwords meeting all criteria", () => {
    const result = validatePassword("F1owHub#2026");
    expect(result.isValid).toBe(true);
    expect(result.checks.minLength).toBe(true);
    expect(result.checks.hasLowercase).toBe(true);
    expect(result.checks.hasUppercase).toBe(true);
    expect(result.checks.hasDigit).toBe(true);
    expect(result.checks.hasSymbol).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe("parseSupabasePasswordError", () => {
  it("parses HIBP / leaked password errors correctly", () => {
    const error = { message: "Password is known to be weak or has appeared in a data breach", code: "weak_password" };
    const msg = parseSupabasePasswordError(error);
    expect(msg).toContain("vazamentos de dados");
  });

  it("parses weak password errors correctly", () => {
    const error = { message: "Password should contain lowercase, uppercase, digits and symbols", code: "weak_password" };
    const msg = parseSupabasePasswordError(error);
    expect(msg).toContain("A senha é considerada fraca");
  });

  it("returns fallback message for empty errors", () => {
    const msg = parseSupabasePasswordError(null);
    expect(msg).toBe("Não foi possível validar a senha. Verifique os requisitos de segurança.");
  });
});
