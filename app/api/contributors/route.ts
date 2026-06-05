import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json([], { status: 401 });

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
