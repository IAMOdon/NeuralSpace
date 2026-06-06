import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { data } = await adminClient
    .from("articles")
    .select("slug, title, has_dual_content, content_simplified, content_scientific")
    .eq("slug", "mayo-ai-pancreatic-cancer-early-ct-detection")
    .single();

  if (!data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({
    slug: data.slug,
    title: data.title,
    has_dual_content: data.has_dual_content,
    has_content_simplified: !!data.content_simplified,
    has_content_scientific: !!data.content_scientific,
    content_simplified_size: data.content_simplified ? JSON.stringify(data.content_simplified).length : 0,
    content_scientific_size: data.content_scientific ? JSON.stringify(data.content_scientific).length : 0,
  });
}
