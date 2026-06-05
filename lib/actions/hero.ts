"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/supabase";

type SaveHeroInput = {
  type: string;
  config: Record<string, unknown>;
};

export async function saveHeroConfig(
  input: SaveHeroInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

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
