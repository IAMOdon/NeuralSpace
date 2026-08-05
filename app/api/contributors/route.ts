import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth/admin";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  // Contributor lookup feeds the editor's author picker — admin-only, and a
  // session alone is not admin rights since signup is self-service.
  if (!(await getAdminUser())) return Response.json([], { status: 401 });

  const supabase = await createClient();

  if (!q.trim()) return Response.json([]);

  const { data } = await supabase
    .from("authors")
    .select("id, name, slug, avatar_url, role, institution")
    .ilike("name", `%${q}%`)
    .limit(8);

  return Response.json(
    (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      avatarUrl: r.avatar_url,
      role: r.role,
      institution: r.institution,
    }))
  );
}
