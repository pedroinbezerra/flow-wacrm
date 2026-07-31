import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { toErrorResponse } from "@/lib/auth/account";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireSuperAdmin();

    const limit = await checkRateLimit(
      `admin:super-admins:delete:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const { userId: targetUserId } = await params;

    if (!targetUserId) {
      return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Buscar o perfil do usuário-alvo
    const { data: targetProfile, error: fetchErr } = await supabase
      .from("profiles")
      .select("id, user_id, email, is_super_admin")
      .or(`user_id.eq.${targetUserId},id.eq.${targetUserId}`)
      .maybeSingle();

    if (fetchErr || !targetProfile) {
      return NextResponse.json({ error: "Perfil do usuário não encontrado." }, { status: 404 });
    }

    if (!targetProfile.is_super_admin) {
      return NextResponse.json({ error: "Este usuário não é um Super Admin." }, { status: 400 });
    }

    // Trava de Segurança 1: Proibir auto-revogação (front e back)
    if (targetProfile.user_id === admin.userId || targetProfile.id === admin.userId) {
      return NextResponse.json(
        { error: "Por motivos de segurança, você não pode revogar seu próprio acesso de Super Admin." },
        { status: 400 }
      );
    }

    // Trava de Segurança 2: Impedir ficar sem nenhum Super Admin no sistema
    const { count: totalSuperAdmins, error: countErr } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_super_admin", true);

    if (countErr) {
      console.error("[DELETE /api/admin/super-admins] Count Error:", countErr);
      return NextResponse.json({ error: "Erro ao verificar total de Super Admins" }, { status: 500 });
    }

    if ((totalSuperAdmins ?? 0) <= 1) {
      return NextResponse.json(
        { error: "Operação recusada: Não é possível revogar o único Super Admin do sistema." },
        { status: 400 }
      );
    }

    // 2. Revogar privilégio: is_super_admin = false
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ is_super_admin: false, updated_at: new Date().toISOString() })
      .eq("id", targetProfile.id);

    if (updateErr) {
      console.error("[DELETE /api/admin/super-admins] Revoke Error:", updateErr);
      return NextResponse.json({ error: "Erro ao revogar permissão de Super Admin." }, { status: 500 });
    }

    // 3. Registrar Log de Auditoria de Governança
    await supabase.from("super_admin_audit_logs").insert({
      action: "revoked",
      performed_by_user_id: admin.userId,
      performed_by_email: admin.email,
      target_user_id: targetProfile.user_id,
      target_email: targetProfile.email || "desconhecido",
    });

    return NextResponse.json({
      success: true,
      message: `Acesso de Super Admin revogado com sucesso para ${targetProfile.email || "o usuário"}.`,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
