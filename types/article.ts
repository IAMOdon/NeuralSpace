import type { ContentBlock } from "./content";
import type { AuthorSummary } from "./author";

export type ArticleStatus = "draft" | "published" | "archived";
export type ArticleType = "short" | "long";

export type ArticleSource = {
  label: string;
  url: string;
  doi?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  colorHex?: string;
};

export type Tag = {
  id: string;
  slug: string;
  name: string;
};

export type Series = {
  id: string;
  slug: string;
  title: string;
  description?: string;
};

export type ArticleInSeries = {
  series: Series;
  order: number;
};

// Raw article row — no joined relations
export type Article = {
  id: string;
  slug: string;
  type: ArticleType;
  status: ArticleStatus;
  categoryId: string;
  title: string;
  summary: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  content: ContentBlock[];
  sources: ArticleSource[];
  layoutPreset?: string;
  wordCount: number;
  readingTimeMin: number;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  lastUpdatedNote?: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

// Full article with all relations — used on the article page
export type ArticleWithRelations = Article & {
  category: Category;
  authors: AuthorSummary[];
  tags: Tag[];
  series?: ArticleInSeries;
};

// Lightweight version for feed cards — no content blocks, no sources
export type ArticleCard = Pick<
  Article,
  | "id"
  | "slug"
  | "type"
  | "title"
  | "summary"
  | "coverImageUrl"
  | "coverImageAlt"
  | "readingTimeMin"
  | "viewCount"
  | "publishedAt"
> & {
  category: Category;
  tags: Tag[];
};
