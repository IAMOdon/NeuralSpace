import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getArticleSlugs } from "@/lib/articles";
import { SITE_URL, SITE_NAME, SITE_LOCALE } from "@/lib/config";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ContentVersionTabs } from "@/components/article/ContentVersionTabs";
import { ContributorSidebar } from "@/components/article/ContributorSidebar";
import { ArticleTracker } from "@/components/article/ArticleTracker";

type Props = { params: Promise<{ slug: string }> };

// Remove a trailing brand suffix like "— NeuralSpace" / "— Neural Space" (any
// dash variant, spacing, or casing) so the layout's title template adds it once.
function stripBrandSuffix(title: string): string {
  return title.replace(/\s*[—–-]\s*neural\s*space\s*$/i, "").trim();
}

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  // The root layout title template appends " — {SITE_NAME}". Strip any brand
  // suffix the author/AI may have already baked into seoTitle so it isn't doubled
  // (e.g. "Sujet — NeuralSpace" would otherwise render "Sujet — NeuralSpace — Neural Space").
  const title = stripBrandSuffix(article.seoTitle ?? article.title);
  const description = article.seoDescription ?? article.summary;
  const canonical = `${SITE_URL}/${article.slug}`;
  const images = article.ogImageUrl
    ? [{ url: article.ogImageUrl, width: 1200, height: 630, alt: title }]
    : [];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: "article",
      images,
      ...(article.publishedAt && { publishedTime: article.publishedAt }),
      ...(article.updatedAt && { modifiedTime: article.updatedAt }),
      authors: article.authors.map((a) => a.name),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images[0] && { images: [images[0].url] }),
    },
  };
}

type ArticleType = NonNullable<Awaited<ReturnType<typeof getArticleBySlug>>>;

function ArticleJsonLd({ article }: { article: ArticleType }) {
  const url = `${SITE_URL}/${article.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: article.title,
    description: article.summary,
    url,
    inLanguage: "fr",
    wordCount: article.wordCount,
    timeRequired: `PT${article.readingTimeMin}M`,
    ...(article.ogImageUrl && { image: { "@type": "ImageObject", url: article.ogImageUrl, width: 1200, height: 630 } }),
    ...(article.publishedAt && { datePublished: article.publishedAt }),
    ...(article.updatedAt && { dateModified: article.updatedAt }),
    ...(article.lastUpdatedNote && { description: article.lastUpdatedNote }),
    author: article.authors.map((a) => ({
      "@type": "Person",
      name: a.name,
      ...(a.institution && { affiliation: { "@type": "Organization", name: a.institution } }),
    })),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    about: { "@type": "Thing", name: article.category.name },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: article.category.name, item: `${SITE_URL}/?category=${article.category.slug}` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <ArticleJsonLd article={article} />
      <ArticleTracker
        articleId={article.id}
        slug={article.slug}
        title={article.title}
        categoryId={article.categoryId}
        categorySlug={article.category.slug}
        tagIds={article.tags.map((t) => t.id)}
        wordCount={article.wordCount ?? 0}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
        <article className="flex-1 min-w-0">
          <ArticleHeader
            title={article.title}
            summary={article.summary}
            coverImageUrl={article.coverImageUrl ?? null}
            coverImageAlt={article.coverImageAlt ?? null}
            category={{ name: article.category.name, colorHex: article.category.colorHex }}
            readingTimeMin={article.readingTimeMin}
            publishedAt={article.publishedAt ?? null}
            authors={article.authors}
          />
          <ContentVersionTabs
            contentSimplified={article.contentSimplified || article.content}
            contentScientific={article.contentScientific}
          />
        </article>
        <aside className="w-full lg:w-64 shrink-0 border-t border-neutral-100 pt-6 lg:border-0 lg:pt-2">
          <ContributorSidebar
            contributors={article.authors}
            isSponsored={article.isSponsored}
            sources={article.sources}
          />
        </aside>
      </div>
    </>
  );
}
