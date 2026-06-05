import type { Metadata } from "next";
import Link from "next/link";
import { adminClient } from "@/lib/supabase/admin";
import { Plus, ExternalLink, Pencil } from "lucide-react";

export const metadata: Metadata = { title: "Articles — Admin" };

const STATUS: Record<string, { label: string; color: string }> = {
  published: { label: "Publié",    color: "bg-green-100 text-green-700" },
  draft:     { label: "Brouillon", color: "bg-neutral-100 text-neutral-500" },
  archived:  { label: "Archivé",   color: "bg-red-100 text-red-500" },
};

export default async function ArticlesPage() {
  const { data: articles } = await adminClient
    .from("articles")
    .select("id, title, slug, status, type, published_at, updated_at, view_count, reading_time_min, categories(name, color_hex)")
    .order("updated_at", { ascending: false })
    .limit(100);

  const rows = articles ?? [];

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl text-ns-black">Articles</h1>
          <p className="text-sm text-neutral-400 font-sans mt-1">
            {rows.length} article{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/articles/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-90 transition-opacity duration-200"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Nouvel article
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Titre</th>
              <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden md:table-cell">Catégorie</th>
              <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Statut</th>
              <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden lg:table-cell">Vues</th>
              <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden lg:table-cell">Mis à jour</th>
              <th className="px-5 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <p className="text-sm text-neutral-400 font-sans">Aucun article — crée le premier.</p>
                  <Link
                    href="/dashboard/articles/new"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-ns-blue hover:opacity-70 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nouvel article
                  </Link>
                </td>
              </tr>
            ) : rows.map((article) => {
              const st  = STATUS[article.status as string] ?? STATUS.draft!;
              const cat = article.categories as { name: string; color_hex: string | null } | null;
              const updatedAt = article.updated_at
                ? new Date(article.updated_at as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" })
                : "—";

              return (
                <tr key={article.id} className="hover:bg-neutral-50 transition-colors duration-150 group">
                  <td className="px-5 py-3.5">
                    <p className="font-sans font-medium text-ns-black line-clamp-1 max-w-sm">{article.title}</p>
                    <p className="text-[11px] text-neutral-400 font-sans mt-0.5">{article.reading_time_min} min</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    {cat ? (
                      <span
                        className="text-[10px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${cat.color_hex ?? "#2233f0"}18`, color: cat.color_hex ?? "#2233f0" }}
                      >
                        {cat.name}
                      </span>
                    ) : <span className="text-xs text-neutral-300 font-sans">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                    <span className="font-heading font-bold text-sm text-ns-black">
                      {(article.view_count ?? 0).toLocaleString("fr-FR")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                    <span className="text-xs text-neutral-400 font-sans">{updatedAt}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <Link
                        href={`/dashboard/articles/${article.id}/edit`}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-ns-blue hover:bg-ns-blue/5 transition-colors duration-150"
                        aria-label="Éditer"
                      >
                        <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </Link>
                      {article.status === "published" && (
                        <a
                          href={`/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-ns-blue hover:bg-ns-blue/5 transition-colors duration-150"
                          aria-label="Voir l'article"
                        >
                          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
