import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MediaDownloader } from "@/components/toolbox/MediaDownloader";

export const metadata = {
  title: "Boîte à outils - Neural Space",
  description: "Télécharger des médias depuis les réseaux sociaux",
};

export default async function ToolboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ns-black mb-2">Boîte à outils</h1>
          <p className="text-neutral-600">Télécharger des médias depuis les réseaux sociaux avec la meilleure qualité</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <MediaDownloader />
        </div>
      </div>
    </div>
  );
}
