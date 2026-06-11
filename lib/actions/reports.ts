"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { ensureAdmin } from "@/lib/auth";

export type ReportStatus = "new" | "accepted" | "rejected";

export type ArticleReport = {
  id: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  quote: string | null;
  message: string;
  sourceUrl: string | null;
  reporterEmail: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export async function listReports(status?: ReportStatus): Promise<ArticleReport[]> {
  await ensureAdmin();

  let query = adminClient
    .from("article_reports")
    .select("id, article_id, quote, message, source_url, reporter_email, status, created_at, resolved_at, articles(title, slug)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);

  const { data } = await query;
  return (data ?? []).map((r) => {
    const article = r.articles as { title: string; slug: string } | null;
    return {
      id: r.id,
      articleId: r.article_id,
      articleTitle: article?.title ?? "Article supprimé",
      articleSlug: article?.slug ?? "",
      quote: r.quote,
      message: r.message,
      sourceUrl: r.source_url,
      reporterEmail: r.reporter_email,
      status: r.status as ReportStatus,
      createdAt: r.created_at,
      resolvedAt: r.resolved_at,
    };
  });
}

export async function setReportStatus(
  id: string,
  status: "accepted" | "rejected"
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();

  const { error } = await adminClient
    .from("article_reports")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/reports");
  return { ok: true };
}

export async function countNewReports(): Promise<number> {
  await ensureAdmin();
  const { count } = await adminClient
    .from("article_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  return count ?? 0;
}
