import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { toErrorResponse } from "@/lib/auth/account";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET() {
  try {
    const admin = await requireSuperAdmin();

    const limit = await checkRateLimit(
      `admin:super-admins:get:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const supabase = await createClient();
    const { data: superAdmins, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, email, avatar_url, is_super_admin, created_at, updated_at")
      .eq("is_super_admin", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[GET /api/admin/super-admins] DB Error:", error);
      return NextResponse.json({ error: "Erro ao listar Super Admins" }, { status: 500 });
    }

    // Busca histórico de auditoria de governança
    const { data: auditLogs } = await supabase
      .from("super_admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    return NextResponse.json({
      superAdmins: superAdmins || [],
      auditLogs: auditLogs || [],
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireSuperAdmin();

    const limit = await checkRateLimit(
      `admin:super-admins:post:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const body = await req.json().catch(() => ({}));
    const { email } = body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "O e-mail do usuário é obrigatório." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = await createClient();

    // 1. Buscar usuário pelo e-mail
    const { data: targetProfile, error: fetchErr } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, email, is_super_admin")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (fetchErr || !targetProfile) {
      return NextResponse.json(
        { error: "Nenhum usuário foi encontrado com este endereço de e-mail." },
        { status: 404 }
      );
    }

    if (targetProfile.is_super_admin) {
      return NextResponse.json(
        { error: "Este usuário já é um Super Admin do sistema." },
        { status: 400 }
      );
    }

    // 2. Promover usuário para is_super_admin = true
    const { data: updatedProfile, error: updateErr } = await supabase
      .from("profiles")
      .update({ is_super_admin: true, updated_at: new Date().toISOString() })
      .eq("id", targetProfile.id)
      .select("id, user_id, full_name, email, avatar_url, is_super_admin, created_at, updated_at")
      .single();

    if (updateErr || !updatedProfile) {
      console.error("[POST /api/admin/super-admins] Update Error:", updateErr);
      return NextResponse.json({ error: "Erro ao conceder privilégio de Super Admin." }, { status: 500 });
    }

    // 3. Registrar Log de Auditoria de Governança
    await supabase.from("super_admin_audit_logs").insert({
      action: "granted",
      performed_by_user_id: admin.userId,
      performed_by_email: admin.email,
      target_user_id: targetProfile.user_id,
      target_email: targetProfile.email || cleanEmail,
    });

    return NextResponse.json({
      success: true,
      message: `Privilégio de Super Admin concedido com sucesso para ${cleanEmail}.`,
      superAdmin: updatedProfile,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
