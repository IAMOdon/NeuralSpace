import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await adminClient
    .from("articles")
    .select("id, slug, title, has_dual_content, status")
    .eq("status", "published")
    .limit(10);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const articlesWithContent = await Promise.all(
    (data || []).map(async (art) => {
      const { data: full } = await adminClient
        .from("articles")
        .select("content_simplified, content_scientific")
        .eq("id", art.id)
        .single();

      return {
        slug: art.slug,
        title: art.title,
        hasDualContent: art.has_dual_content,
        hasSimplified: !!full?.content_simplified,
        hasScientific: !!full?.content_scientific,
      };
    })
  );

  return Response.json(articlesWithContent);
}
