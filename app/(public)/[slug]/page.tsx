import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getArticleSlugs } from "@/lib/articles";
import { SITE_URL, SITE_NAME } from "@/lib/config";
import { ArticleRenderer } from "@/components/article/ArticleRenderer";
import { WordLookup } from "@/components/article/WordLookup";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return {};

  const title = article.seoTitle ?? article.title;
  const description = article.seoDescription ?? article.summary;
  const canonical = `${SITE_URL}/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      ...(article.publishedAt && { publishedTime: article.publishedAt }),
      ...(article.updatedAt && { modifiedTime: article.updatedAt }),
      authors: article.authors.map((a) => a.name),
      ...(article.ogImageUrl && {
        images: [{ url: article.ogImageUrl, width: 1200, height: 630 }],
      }),
    },
    twitter: { card: "summary_large_image" },
  };
}

function ArticleJsonLd({
  article,
}: {
  article: NonNullable<Awaited<ReturnType<typeof getArticleBySlug>>>;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    url: `${SITE_URL}/${article.slug}`,
    ...(article.ogImageUrl && { image: article.ogImageUrl }),
    ...(article.publishedAt && { datePublished: article.publishedAt }),
    ...(article.updatedAt && { dateModified: article.updatedAt }),
    author: article.authors.map((a) => ({
      "@type": "Person",
      name: a.name,
      ...(a.institution && { affiliation: a.institution }),
    })),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <>
      <ArticleJsonLd article={article} />
      <div className="max-w-7xl mx-auto px-4 py-12 flex gap-12">
        {/* Content — 2/3 */}
        <article className="flex-1 min-w-0">
          <WordLookup>
            <ArticleRenderer blocks={article.content} />
          </WordLookup>
        </article>

        {/* Sidebar — 1/3 */}
        <aside className="w-80 shrink-0">
          {/* Author sidebar — placeholder */}
        </aside>
      </div>
    </>
  );
}
