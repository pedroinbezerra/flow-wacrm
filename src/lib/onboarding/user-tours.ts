import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Busca a lista de tour_keys marcados como concluídos no Supabase para o usuário.
 */
export async function fetchCompletedTours(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from("user_onboarding_tours")
      .select("tour_key")
      .eq("user_id", userId)
      .eq("completed", true);

    if (error) {
      console.error("[user-tours] Failed to fetch completed tours:", error);
      return new Set();
    }

    return new Set((data || []).map((item) => item.tour_key));
  } catch (err) {
    console.error("[user-tours] Error fetching completed tours:", err);
    return new Set();
  }
}

/**
 * Salva ou atualiza a conclusão de um tour no banco de dados (user_onboarding_tours).
 */
export async function saveTourCompletion(
  supabase: SupabaseClient,
  accountId: string,
  userId: string,
  tourKey: string
): Promise<void> {
  try {
    const { error } = await supabase.from("user_onboarding_tours").upsert(
      {
        account_id: accountId,
        user_id: userId,
        tour_key: tourKey,
        completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id,user_id,tour_key" }
    );

    if (error) {
      console.error("[user-tours] Failed to save tour completion:", error);
    }
  } catch (err) {
    console.error("[user-tours] Error saving tour completion:", err);
  }
}
