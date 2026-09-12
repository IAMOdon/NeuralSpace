import type { Metadata } from "next";
import { getAdminClient } from "@/lib/supabase/admin";
import { HeroConfigForm } from "@/components/admin/HeroConfigForm";

export const metadata: Metadata = { title: "Hero Config — Admin" };

export default async function HeroConfigPage() {
  const { data } = await getAdminClient()
    .from("hero_config")
    .select("type, config, updated_at, updated_by")
    .eq("id", "singleton")
    .single();

  return (
    <div className="p-6 md:p-8 space-y-8 w-full max-w-2xl">
      <div>
        <h1 className="font-heading font-black text-2xl text-ns-black">Hero Config</h1>
        <p className="text-sm text-neutral-400 font-sans mt-1">
          Contrôle le bloc hero du feed en temps réel — aucun redeploy nécessaire.
        </p>
        {data?.updated_at && (
          <p className="text-xs text-neutral-300 font-sans mt-1">
            Dernière modification : {new Date(data.updated_at).toLocaleString("fr-FR")}
            {data.updated_by ? ` par ${data.updated_by}` : ""}
          </p>
        )}
      </div>
      <HeroConfigForm
        currentType={(data?.type as string) ?? "none"}
        currentConfig={(data?.config as Record<string, unknown>) ?? {}}
      />
    </div>
  );
}
