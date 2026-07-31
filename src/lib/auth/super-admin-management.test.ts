import { describe, it, expect } from "vitest";

function validateSelfRevocation(callerUserId: string, targetUserId: string): { allowed: boolean; reason?: string } {
  if (callerUserId === targetUserId) {
    return {
      allowed: false,
      reason: "Por motivos de segurança, você não pode revogar seu próprio acesso de Super Admin.",
    };
  }
  return { allowed: true };
}

function validateMinimumSuperAdminCount(totalCount: number): { allowed: boolean; reason?: string } {
  if (totalCount <= 1) {
    return {
      allowed: false,
      reason: "Operação recusada: Não é possível revogar o único Super Admin do sistema.",
    };
  }
  return { allowed: true };
}

describe("Super Admin Management Safeguards", () => {
  it("impede que o próprio Super Admin revogue o seu acesso", () => {
    const callerId = "user-super-1";
    const targetId = "user-super-1";

    const res = validateSelfRevocation(callerId, targetId);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("você não pode revogar seu próprio acesso");
  });

  it("permite a revogação se for direcionada a outro Super Admin", () => {
    const callerId = "user-super-1";
    const targetId = "user-super-2";

    const res = validateSelfRevocation(callerId, targetId);
    expect(res.allowed).toBe(true);
  });

  it("impede a revogação caso haja apenas 1 Super Admin no sistema", () => {
    const res = validateMinimumSuperAdminCount(1);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("único Super Admin do sistema");
  });

  it("permite a revogação se houver 2 ou mais Super Admins no sistema", () => {
    const res = validateMinimumSuperAdminCount(2);
    expect(res.allowed).toBe(true);
  });
});
