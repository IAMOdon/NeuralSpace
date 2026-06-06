import { adminClient } from "@/lib/supabase/admin";

async function check() {
  const { data, error } = await adminClient
    .from("articles")
    .select("id, slug, title, has_dual_content, content_simplified, content_scientific")
    .eq("slug", "mayo-ai-pancreatic-cancer-early-ct-detection")
    .single();

  if (error) {
    console.error("Error:", error);
    return;
  }

  if (!data) {
    console.log("Article not found");
    return;
  }

  console.log("Article found:");
  console.log("  slug:", data.slug);
  console.log("  title:", data.title);
  console.log("  has_dual_content:", data.has_dual_content);
  console.log("  content_simplified:", data.content_simplified ? "YES (" + JSON.stringify(data.content_simplified).length + " bytes)" : "NO");
  console.log("  content_scientific:", data.content_scientific ? "YES (" + JSON.stringify(data.content_scientific).length + " bytes)" : "NO");
}

check().catch(console.error);
