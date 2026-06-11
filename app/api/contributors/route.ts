import { type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  if (!(await getAdminUser())) return Response.json([], { status: 401 });

  if (!q.trim()) return Response.json([]);

  const supabase = await createClient();
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
