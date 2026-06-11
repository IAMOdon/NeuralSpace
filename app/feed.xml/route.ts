import { adminClient } from "@/lib/supabase/admin";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";

// Flux RSS 2.0 — les chercheurs, agrégateurs et services de veille des
// institutions vivent sur RSS ; sans flux, le média est invisible pour eux.

export const revalidate = 1800; // 30 min

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { data } = await adminClient
    .from("articles")
    .select("slug, title, summary, published_at, updated_at, categories(name)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(30);

  const items = (data ?? [])
    .map((a) => {
      const url = `${SITE_URL}/${a.slug}`;
      const cat = a.categories as { name: string } | null;
      const pubDate = a.published_at ? new Date(a.published_at).toUTCString() : new Date().toUTCString();
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(a.summary)}</description>
      ${cat ? `<category>${escapeXml(cat.name)}</category>` : ""}
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const lastBuild = data?.[0]?.published_at
    ? new Date(data[0].published_at).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>fr</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300",
    },
  });
}
