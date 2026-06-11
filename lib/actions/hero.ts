"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";
import type { Json } from "@/types/supabase";

type SaveHeroInput = {
  type: string;
  config: Record<string, unknown>;
};

export async function saveHeroConfig(
  input: SaveHeroInput
): Promise<{ ok: boolean; error?: string }> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Accès réservé à l'administrateur." };

  const { error } = await adminClient
    .from("hero_config")
    .update({
      type: input.type,
      config: input.config as Json,
      updated_at: new Date().toISOString(),
      updated_by: user.email ?? user.id,
    })
    .eq("id", "singleton");

  if (error) return { ok: false, error: error.message };

  // Revalide le feed et la page hero config
  revalidatePath("/");
  revalidatePath("/dashboard/hero");

  return { ok: true };
}
