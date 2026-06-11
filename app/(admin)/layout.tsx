import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/login");

  return (
    // Colonne sur mobile (barre en flux au-dessus du contenu — aucun calcul de
    // padding), rangée sur desktop (sidebar latérale).
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
