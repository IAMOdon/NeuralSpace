import type { Metadata } from "next";
import Link from "next/link";
import { Download, Mail, Sparkles } from "lucide-react";
import { getAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Audience — Admin" };

const LISTS = {
  newsletter: { label: "Newsletter", table: "newsletter_subscribers" },
  waitlist: { label: "Waitlist Coherence", table: "coherence_waitlist" },
} as const;

type ListKey = keyof typeof LISTS;

type Props = { searchParams: Promise<{ list?: string }> };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AudiencePage({ searchParams }: Props) {
  const { list: listParam } = await searchParams;
  const list: ListKey = listParam === "waitlist" ? "waitlist" : "newsletter";

  const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const [newsletterCount, waitlistCount, recent7d, unsubCount, { data: rows }] =
    await Promise.all([
      getAdminClient().from("newsletter_subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null),
      getAdminClient().from("coherence_waitlist").select("id", { count: "exact", head: true }),
      getAdminClient().from(LISTS[list].table).select("id", { count: "exact", head: true }).gte("created_at", since7d),
      getAdminClient().from("newsletter_subscribers").select("id", { count: "exact", head: true }).not("unsubscribed_at", "is", null),
      list === "newsletter"
        ? getAdminClient()
            .from("newsletter_subscribers")
            .select("email, source, country, created_at, unsubscribed_at")
            .order("created_at", { ascending: false })
            .limit(200)
        : getAdminClient()
            .from("coherence_waitlist")
            .select("email, source, country, created_at")
            .order("created_at", { ascending: false })
            .limit(200),
    ]);

  const stats = [
    { label: "Abonnés newsletter", value: newsletterCount.count ?? 0, icon: Mail },
    { label: "Waitlist Coherence", value: waitlistCount.count ?? 0, icon: Sparkles },
    { label: `Nouveaux (7 j) — ${LISTS[list].label}`, value: recent7d.count ?? 0, icon: null },
    { label: "Désinscrits", value: unsubCount.count ?? 0, icon: null },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-heading font-black text-2xl text-ns-black">Audience</h1>
          <p className="text-sm text-neutral-400 font-sans mt-1">
            Abonnés newsletter et liste d&apos;attente Coherence
          </p>
        </div>
        <a
          href={`/api/audience/export?list=${list}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-sans font-semibold text-ns-black hover:border-ns-blue hover:text-ns-blue transition-colors duration-200"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          Export CSV
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-100 bg-white p-5">
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
              {s.label}
            </p>
            <p className="font-heading font-black text-3xl text-ns-black mt-2">
              {s.value.toLocaleString("fr-FR")}
            </p>
          </div>
        ))}
      </div>

      {/* List switcher */}
      <div className="flex items-center gap-2">
        {(Object.keys(LISTS) as ListKey[]).map((key) => (
          <Link
            key={key}
            href={`?list=${key}`}
            className={`px-4 py-2 rounded-full text-xs font-sans font-semibold transition-colors duration-200 ${
              list === key
                ? "bg-ns-blue text-white"
                : "bg-white border border-neutral-200 text-neutral-500 hover:border-ns-blue hover:text-ns-blue"
            }`}
          >
            {LISTS[key].label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-100 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">E-mail</th>
              <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden md:table-cell">Source</th>
              <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden md:table-cell">Pays</th>
              <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Inscription</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {!rows || rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <p className="text-sm text-neutral-400 font-sans">Aucune inscription pour le moment.</p>
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const unsubscribed = "unsubscribed_at" in r && r.unsubscribed_at;
                return (
                  <tr key={r.email} className={unsubscribed ? "opacity-40" : ""}>
                    <td className="px-5 py-3.5">
                      <span className="font-sans font-medium text-ns-black">{r.email}</span>
                      {unsubscribed && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400">
                          Désinscrit
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-neutral-400 font-sans">{r.source ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-neutral-400 font-sans">{r.country ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-neutral-400 font-sans">{formatDate(r.created_at)}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {rows && rows.length === 200 && (
          <p className="px-5 py-3 text-xs text-neutral-400 font-sans border-t border-neutral-50">
            200 dernières inscriptions affichées — l&apos;export CSV contient la liste complète.
          </p>
        )}
      </div>
    </div>
  );
}
