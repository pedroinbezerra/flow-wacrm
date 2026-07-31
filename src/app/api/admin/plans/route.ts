import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { toErrorResponse } from "@/lib/auth/account";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET() {
  try {
    const admin = await requireSuperAdmin();

    const limit = await checkRateLimit(
      `admin:plans:get:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const supabase = await createClient();
    const { data: plans, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[GET /api/admin/plans] DB error:", error);
      return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
    }

    return NextResponse.json({ plans });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireSuperAdmin();

    const limit = await checkRateLimit(
      `admin:plans:post:${admin.userId}`,
      RATE_LIMITS.adminAction
    );
    if (!limit.success) return rateLimitResponse(limit);

    const body = await req.json();
    const { name, description, price, billing_period, trial_days, status, features } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: plan, error } = await supabase
      .from("plans")
      .insert({
        name: name.trim(),
        description: description ? String(description).trim() : null,
        price: typeof price === "number" ? price : 0,
        billing_period: billing_period || "monthly",
        trial_days: typeof trial_days === "number" ? trial_days : 0,
        status: status || "active",
        features: typeof features === "object" && features !== null ? features : {},
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/admin/plans] DB error:", error);
      return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
    }

    return NextResponse.json({ plan }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
