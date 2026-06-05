import type { Metadata } from "next";
import { getCategories } from "@/lib/articles";
import { ArticleEditor } from "@/components/admin/editor/ArticleEditor";

export const metadata: Metadata = { title: "Nouvel article — Admin" };

export default async function NewArticlePage() {
  const categories = await getCategories();

  return (
    <ArticleEditor
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        colorHex: c.colorHex ?? null,
      }))}
      article={{
        title:          "",
        summary:        "",
        content:        [],
        type:           "short",
        status:         "draft",
        slug:           "",
        categoryId:     null,
        coverImageUrl:  null,
        coverImageAlt:  null,
        seoTitle:       null,
        seoDescription: null,
        sources:        [],
      }}
    />
  );
}
