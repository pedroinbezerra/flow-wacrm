import { createClient } from "@/lib/supabase/server";
import { ForbiddenError, UnauthorizedError } from "./account";

export interface SuperAdminContext {
  userId: string;
  email: string;
}

/**
 * Ensures the caller is an authenticated user with `is_super_admin === true`.
 * Throws `UnauthorizedError` if unauthenticated.
 * Throws `ForbiddenError` if not a super admin.
 */
export async function requireSuperAdmin(): Promise<SuperAdminContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    throw new UnauthorizedError();
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_super_admin, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    throw new ForbiddenError("Could not load user profile");
  }

  if (!profile.is_super_admin) {
    throw new ForbiddenError("Acesso restrito ao Administrador Geral (Super Admin)");
  }

  return {
    userId: user.id,
    email: profile.email || user.email || "",
  };
}
