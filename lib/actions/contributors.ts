"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");
  return user;
}

async function uniqueContributorSlug(base: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (true) {
    const { count } = await adminClient
      .from("authors")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);
    if ((count ?? 0) === 0) return slug;
    slug = `${base}-${++i}`;
  }
}

export type ContributorInput = {
  name: string;
  role?: string | null;
  institution?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
};

export type ContributorRef = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role?: string | null;
  institution?: string | null;
};

export async function createContributor(
  input: ContributorInput
): Promise<{ ok: boolean; contributor?: ContributorRef; error?: string }> {
  await ensureAdmin();

  const slug = await uniqueContributorSlug(slugify(input.name));

  const { data, error } = await adminClient
    .from("authors")
    .insert({
      name: input.name,
      slug,
      role: input.role ?? null,
      institution: input.institution ?? null,
      avatar_url: input.avatarUrl ?? null,
      bio: input.bio ?? null,
    })
    .select("id, name, slug, avatar_url, role, institution")
    .single();

  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    contributor: {
      id: data.id,
      name: data.name,
      avatarUrl: data.avatar_url,
      role: data.role,
      institution: data.institution,
    },
  };
}

export async function updateArticleContributors(
  articleId: string,
  contributors: ContributorRef[]
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();

  // Replace all — delete then insert
  const { error: delError } = await adminClient
    .from("article_authors")
    .delete()
    .eq("article_id", articleId);

  if (delError) return { ok: false, error: delError.message };

  if (contributors.length === 0) {
    revalidatePath(`/dashboard/articles/${articleId}/edit`);
    return { ok: true };
  }

  const rows = contributors.map((c, i) => ({
    article_id: articleId,
    author_id: c.id,
    order: i,
  }));

  const { error: insError } = await adminClient
    .from("article_authors")
    .insert(rows);

  if (insError) return { ok: false, error: insError.message };

  revalidatePath(`/dashboard/articles/${articleId}/edit`);
  return { ok: true };
}
