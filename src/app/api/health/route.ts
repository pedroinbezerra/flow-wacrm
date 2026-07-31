import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from("accounts")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      console.error("[HealthCheck] Database ping error:", error);
      return NextResponse.json(
        { status: "error", db: "error" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      db: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[HealthCheck] Exception during health check:", err);
    return NextResponse.json(
      { status: "error", db: "error" },
      { status: 503 }
    );
  }
}
