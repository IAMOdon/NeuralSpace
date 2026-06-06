import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { data } = await adminClient
    .from("articles")
    .select("slug, title, has_dual_content, status")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  return Response.json(data);
}
