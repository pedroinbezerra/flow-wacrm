// ============================================================
// /api/account
//
//   GET   — current caller's account + role. Any member.
//   PATCH — rename the account.                  Admin+.
//
// Why both verbs share a route file
//   They speak about the same singular resource (the caller's
//   account) and reuse the same `requireRole` plumbing. Splitting
//   them across files would duplicate the `account_id` lookup
//   without buying anything.
// ============================================================

import { NextResponse } from "next/server";

import {
  requireRole,
  getCurrentAccount,
  toErrorResponse,
} from "@/lib/auth/account";
import { isValidCpfOrCnpj, sanitizeCpfCnpj } from "@/lib/validation/fiscal";
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();
    return NextResponse.json({
      account: ctx.account,
      role: ctx.role,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

const MAX_NAME_LEN = 80;

export async function PATCH(request: Request) {
  try {
    const ctx = await requireRole("admin", { isWriteOperation: true });

    const limit = await checkRateLimit(
      `admin:account_update:${ctx.userId}`,
      RATE_LIMITS.adminAction,
    );
    if (!limit.success) return rateLimitResponse(limit);

    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length === 0) {
        return NextResponse.json({ error: "Account name cannot be empty" }, { status: 400 });
      }
      if (name.length > MAX_NAME_LEN) {
        return NextResponse.json({ error: `Account name must be ${MAX_NAME_LEN} characters or fewer` }, { status: 400 });
      }
      updates.name = name;
    }

    if (body.cpf_cnpj !== undefined && body.cpf_cnpj !== null && String(body.cpf_cnpj).trim() !== "") {
      const rawCpfCnpj = String(body.cpf_cnpj).trim();
      if (!isValidCpfOrCnpj(rawCpfCnpj)) {
        return NextResponse.json(
          { error: "O CPF ou CNPJ informado é inválido. Por favor, verifique os dígitos." },
          { status: 400 }
        );
      }
      updates.cpf_cnpj = sanitizeCpfCnpj(rawCpfCnpj);
    } else if (body.cpf_cnpj === null || body.cpf_cnpj === "") {
      updates.cpf_cnpj = null;
    }
    if (body.company_name !== undefined) updates.company_name = body.company_name ? String(body.company_name).trim() : null;
    if (body.phone !== undefined) updates.phone = body.phone ? String(body.phone).trim() : null;
    if (body.postal_code !== undefined) updates.postal_code = body.postal_code ? String(body.postal_code).trim() : null;
    if (body.address_street !== undefined) updates.address_street = body.address_street ? String(body.address_street).trim() : null;
    if (body.address_number !== undefined) updates.address_number = body.address_number ? String(body.address_number).trim() : null;
    if (body.address_complement !== undefined) updates.address_complement = body.address_complement ? String(body.address_complement).trim() : null;
    if (body.address_neighborhood !== undefined) updates.address_neighborhood = body.address_neighborhood ? String(body.address_neighborhood).trim() : null;
    if (body.address_city !== undefined) updates.address_city = body.address_city ? String(body.address_city).trim() : null;
    if (body.address_state !== undefined) updates.address_state = body.address_state ? String(body.address_state).trim() : null;

    const { data, error } = await ctx.supabase
      .from("accounts")
      .update(updates)
      .eq("id", ctx.accountId)
      .select("*")
      .single();

    if (error) {
      console.error("[PATCH /api/account] update error:", error);
      return NextResponse.json(
        { error: "Failed to update account" },
        { status: 500 },
      );
    }

    return NextResponse.json({ account: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
