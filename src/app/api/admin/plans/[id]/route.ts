import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { toErrorResponse } from "@/lib/auth/account";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const admin = await requireSuperAdmin();

    const limit = checkRateLimit(
      `admin:plans:get-id:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const supabase = await createClient();
    const { data: plan, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const admin = await requireSuperAdmin();

    const limit = checkRateLimit(
      `admin:plans:patch:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const body = await req.json();
    const { name, description, price, billing_period, trial_days, status, features } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = String(name).trim();
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;
    if (price !== undefined) updateData.price = Number(price);
    if (billing_period !== undefined) updateData.billing_period = billing_period;
    if (trial_days !== undefined) updateData.trial_days = Number(trial_days);
    if (status !== undefined) updateData.status = status;
    if (features !== undefined) updateData.features = features;

    const supabase = await createClient();
    const { data: plan, error } = await supabase
      .from("plans")
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !plan) {
      console.error("[PATCH /api/admin/plans/[id]] DB error:", error);
      return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
    }

    return NextResponse.json({ plan });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const admin = await requireSuperAdmin();

    const limit = checkRateLimit(
      `admin:plans:delete:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const supabase = await createClient();

    // Check if any accounts are using this plan
    const { count } = await supabase
      .from("accounts")
      .select("id", { count: "exact", head: true })
      .eq("plan_id", id);

    if (count && count > 0) {
      // Deactivate instead of deleting to prevent breaking accounts
      const { data: plan, error } = await supabase
        .from("plans")
        .update({ status: "inactive" })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: "Failed to deactivate plan" }, { status: 500 });
      }

      return NextResponse.json({
        plan,
        message: "Plan deactivated because it is assigned to existing accounts.",
      });
    }

    const { error } = await supabase.from("plans").delete().eq("id", id);

    if (error) {
      console.error("[DELETE /api/admin/plans/[id]] DB error:", error);
      return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
