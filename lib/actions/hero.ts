"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth/admin";
import type { Json } from "@/types/supabase";

type SaveHeroInput = {
  type: string;
  config: Record<string, unknown>;
};

/**
 * The hero block is rendered to every visitor, so only the four shapes the
 * admin form offers are storable (components/admin/HeroConfigForm.tsx:7).
 */
const HERO_TYPES = new Set(["none", "live", "news", "player"]);

export async function saveHeroConfig(
  input: SaveHeroInput
): Promise<{ ok: boolean; error?: string }> {
  // Writes go through the service-role client, which bypasses RLS — this check
  // is the only thing standing between a self-registered account and the
  // public homepage.
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Accès refusé." };

  if (!HERO_TYPES.has(input.type)) {
    return { ok: false, error: "Type de hero invalide." };
  }

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
