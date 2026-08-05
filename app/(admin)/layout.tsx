import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/admin";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // A session is not admin rights: signup is self-service, so membership in
  // public.admins is what gates every page below this layout.
  const user = await getAdminUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
