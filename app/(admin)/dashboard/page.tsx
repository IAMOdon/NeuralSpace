import type { Metadata } from "next";
import { adminClient } from "@/lib/supabase/admin";
import {
  Eye, Users, BookOpen, Clock, TrendingUp, Globe, Monitor,
  Smartphone, Tablet, FileText, Mail, Radio, Tv, ExternalLink,
} from "lucide-react";
import { SearchBar } from "@/components/admin/SearchBar";

export const metadata: Metadata = { title: "Dashboard — Admin" };

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupCount(items: Record<string, string | number | boolean | null>[], key: string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const k = String(item[key] ?? "—");
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

function top(obj: Record<string, number>, n = 5): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, accent = false }: {
  label: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 space-y-3 border ${accent ? "bg-ns-blue border-ns-blue text-white" : "bg-white border-neutral-100"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-sans font-semibold uppercase tracking-widest ${accent ? "text-white/60" : "text-neutral-400"}`}>
          {label}
        </p>
        <Icon className={`w-4 h-4 ${accent ? "text-white/50" : "text-neutral-300"}`} strokeWidth={1.5} />
      </div>
      <p className={`font-heading font-black text-3xl ${accent ? "text-white" : "text-ns-black"}`}>
        {value}
      </p>
      {sub && <p className={`text-xs font-sans ${accent ? "text-white/50" : "text-neutral-400"}`}>{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, total, color = "#2233f0" }: {
  label: string; value: number; total: number; color?: string;
}) {
  const p = pct(value, total);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-sans">
        <span className="text-neutral-600 font-medium truncate max-w-[140px]">{label}</span>
        <span className="text-neutral-400 shrink-0 ml-2">{value.toLocaleString("fr-FR")} <span className="text-neutral-300">({p}%)</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${p}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function HourChart({ hours }: { hours: Record<string, number> }) {
  const max = Math.max(...Object.values(hours), 1);
  return (
    <div className="flex items-end gap-0.5 h-16">
      {Array.from({ length: 24 }, (_, h) => {
        const v = hours[String(h)] ?? 0;
        const height = Math.max(2, (v / max) * 100);
        const isPeak = v === max;
        return (
          <div key={h} className="flex-1 flex flex-col items-center gap-0.5" title={`${h}h — ${v} vues`}>
            <div
              className="w-full rounded-sm"
              style={{
                height: `${height}%`,
                backgroundColor: isPeak ? "#2233f0" : "#2233f020",
                minHeight: "2px",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-heading font-bold text-lg text-ns-black">{title}</h2>
      {sub && <p className="text-xs text-neutral-400 font-sans mt-0.5">{sub}</p>}
    </div>
  );
}

function MockupCard({ icon: Icon, label, description }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string; description: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 flex items-start gap-4 opacity-60">
      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
      </div>
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-heading font-semibold text-sm text-ns-black">{label}</p>
          <span className="text-[9px] font-sans font-bold text-white bg-neutral-300 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
            Bientôt
          </span>
        </div>
        <p className="text-xs text-neutral-400 font-sans leading-5">{description}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    viewsTotal,
    views7d,
    deviceRows,
    countryRows,
    referrerRows,
    hourRows,
    sessionCount,
    watchRows,
    profileRows,
    interestRows,
    articleViewRows,
    articlesRows,
    recentArticles,
  ] = await Promise.all([
    adminClient.from("article_views").select("id", { count: "exact", head: true }),
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    adminClient.from("article_views").select("device"),
    adminClient.from("article_views").select("country_code"),
    adminClient.from("article_views").select("referrer_source"),
    adminClient.from("article_views").select("hour_of_day"),
    adminClient.from("session_profiles").select("id", { count: "exact", head: true }),
    adminClient.from("watch_events").select("duration_sec, read_completed, word_lookups, source_clicks"),
    adminClient.from("session_profiles").select("preferred_format, expertise_signal, quality_reads, articles_read, total_duration_sec"),
    adminClient.from("session_interests").select("entity_id, entity_type, score"),
    adminClient.from("article_views").select("article_id"),
    adminClient.from("articles").select("id, title, slug, view_count").eq("status", "published").order("view_count", { ascending: false }).limit(8),
    adminClient.from("articles").select("id, title, slug, status, published_at, view_count, categories(name)").order("published_at", { ascending: false }).limit(10),
  ]);

  // --- KPIs ---
  const totalViews = viewsTotal.count ?? 0;
  const views7dCount = views7d.count ?? 0;
  const sessions = sessionCount.count ?? 0;
  const watchData = watchRows.data ?? [];
  const completedReads = watchData.filter(w => w.read_completed).length;
  const completionRate = pct(completedReads, watchData.length);
  const avgDuration = watchData.length > 0
    ? watchData.reduce((s, w) => s + (w.duration_sec ?? 0), 0) / watchData.length
    : 0;

  // --- Demographics ---
  const devices = groupCount(deviceRows.data ?? [], "device");
  const deviceTotal = Object.values(devices).reduce((a, b) => a + b, 0);

  const countries = groupCount(countryRows.data ?? [], "country_code");
  const countryTotal = Object.values(countries).reduce((a, b) => a + b, 0);
  const topCountries = top(countries, 6).map(([code, n]) => [
    code === "null" || code === "—" ? "Inconnu" : code, n,
  ] as [string, number]);

  const referrers = groupCount(referrerRows.data ?? [], "referrer_source");
  const refTotal = Object.values(referrers).reduce((a, b) => a + b, 0);
  const topReferrers = top(referrers, 6).map(([k, n]) => [
    k === "null" || k === "—" ? "Inconnu" : k, n,
  ] as [string, number]);

  const hours = groupCount(hourRows.data ?? [], "hour_of_day");

  // --- Consent proxy ---
  // Sessions with consent = session_profiles count
  // Total views = article_views count
  // Proxy: sessions/views ratio gives a rough idea
  const consentProxy = pct(sessions, Math.max(views7dCount, 1));

  // --- Reader profiles ---
  const profiles = profileRows.data ?? [];
  const formatCounts = groupCount(profiles as { preferred_format: string }[], "preferred_format");
  const expertSignal = profiles.length > 0
    ? profiles.reduce((s, p) => s + (p.expertise_signal ?? 0.5), 0) / profiles.length
    : 0.5;
  const expertPct = Math.round((1 - expertSignal) * 100);

  // --- Top articles ---
  const topArticles = articlesRows.data ?? [];

  // --- Word lookups & source clicks ---
  const totalLookups = watchData.reduce((s, w) => s + (w.word_lookups ?? 0), 0);
  const totalSourceClicks = watchData.reduce((s, w) => s + (w.source_clicks ?? 0), 0);

  const recent = recentArticles.data ?? [];

  const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
    published: { label: "Publié",    color: "bg-green-100 text-green-700" },
    draft:     { label: "Brouillon", color: "bg-neutral-100 text-neutral-500" },
    archived:  { label: "Archivé",  color: "bg-red-100 text-red-500" },
  };

  return (
    <div className="p-6 md:p-8 space-y-10 w-full">

      {/* Header + Search */}
      <div className="space-y-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-ns-black">Dashboard</h1>
          <p className="text-sm text-neutral-400 font-sans mt-1">Vue d'ensemble Neural Space</p>
        </div>
        <SearchBar />
      </div>

      {/* ── KPIs ── */}
      <section>
        <SectionHeader title="Vue globale" sub="Données en temps réel" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Vues (7 jours)" value={views7dCount.toLocaleString("fr-FR")} sub={`${totalViews.toLocaleString("fr-FR")} au total`} icon={Eye} accent />
          <StatCard label="Sessions consenties" value={sessions.toLocaleString("fr-FR")} sub="Profils anonymes créés" icon={Users} />
          <StatCard label="Taux de complétion" value={`${completionRate}%`} sub={`sur ${watchData.length} lectures`} icon={BookOpen} />
          <StatCard label="Temps moyen" value={avgDuration > 0 ? fmtDuration(avgDuration) : "—"} sub="Par session de lecture" icon={Clock} />
        </div>
      </section>

      {/* ── Cookies & Consentement ── */}
      <section>
        <SectionHeader title="Cookies & Consentement" sub="Données RGPD — sessions avec consentement vs vues totales" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Consent rate */}
          <div className="md:col-span-1 rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Proxy consentement</p>
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <p className="font-heading font-black text-4xl text-ns-blue">{consentProxy}%</p>
                <p className="text-xs text-neutral-400 font-sans pb-1">sessions / vues 7j</p>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full rounded-full bg-ns-blue" style={{ width: `${consentProxy}%` }} />
              </div>
              <p className="text-[11px] text-neutral-400 font-sans leading-4">
                Ratio sessions consenties (profils créés) sur les vues totales des 7 derniers jours.
              </p>
            </div>
          </div>

          {/* Engagement metrics */}
          <div className="md:col-span-2 rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Engagement avec consentement</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-neutral-500">Lectures complètes</span>
                    <span className="font-semibold text-ns-black">{completionRate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-neutral-500">Signal expert</span>
                    <span className="font-semibold text-ns-black">{expertPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-ns-blue" style={{ width: `${expertPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-xs font-sans">
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400">Lookups dictionnaire</span>
                  <span className="font-semibold text-ns-black">{totalLookups.toLocaleString("fr-FR")}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400">Clics sources</span>
                  <span className="font-semibold text-ns-black">{totalSourceClicks.toLocaleString("fr-FR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Format préféré</span>
                  <span className="font-semibold text-ns-black capitalize">
                    {Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Démographie ── */}
      <section>
        <SectionHeader title="Démographie" sub="Données issues de article_views — sans consentement requis" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Devices */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-neutral-300" strokeWidth={1.5} />
              <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Appareils</p>
            </div>
            <div className="space-y-3">
              {[
                { key: "desktop", label: "Desktop", icon: Monitor },
                { key: "mobile",  label: "Mobile",  icon: Smartphone },
                { key: "tablet",  label: "Tablette", icon: Tablet },
              ].map(({ key, label }) => (
                <BarRow
                  key={key}
                  label={label}
                  value={devices[key] ?? 0}
                  total={deviceTotal}
                  color="#2233f0"
                />
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-neutral-300" strokeWidth={1.5} />
              <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Pays</p>
            </div>
            <div className="space-y-3">
              {topCountries.length > 0 ? topCountries.map(([code, n]) => (
                <BarRow key={code} label={code} value={n} total={countryTotal} color="#2233f0" />
              )) : <p className="text-xs text-neutral-300 font-sans">Aucune donnée</p>}
            </div>
          </div>

          {/* Referrers */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neutral-300" strokeWidth={1.5} />
              <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Sources</p>
            </div>
            <div className="space-y-3">
              {topReferrers.length > 0 ? topReferrers.map(([ref, n]) => (
                <BarRow key={ref} label={ref.replace("_", " ")} value={n} total={refTotal} color="#8b5cf6" />
              )) : <p className="text-xs text-neutral-300 font-sans">Aucune donnée</p>}
            </div>
          </div>

          {/* Hours */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Heures de pointe (UTC)</p>
            <HourChart hours={hours} />
            <div className="flex justify-between text-[10px] text-neutral-300 font-sans">
              <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top articles ── */}
      <section>
        <SectionHeader title="Performance des articles" sub="Classement par vues — données articles_views" />
        <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">#</th>
                <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Article</th>
                <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Vues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {topArticles.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-xs text-neutral-300 font-sans">Aucune donnée</td></tr>
              ) : topArticles.map((article, i) => (
                <tr key={article.id} className="hover:bg-neutral-50 transition-colors duration-150">
                  <td className="px-5 py-3 font-mono text-xs text-neutral-300">{i + 1}</td>
                  <td className="px-5 py-3 font-sans text-neutral-700 max-w-xs truncate">{article.title}</td>
                  <td className="px-5 py-3 text-right font-heading font-bold text-ns-black text-sm">
                    {(article.view_count ?? 0).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Récemment listé ── */}
      <section>
        <SectionHeader title="Récemment listé" sub="Les derniers articles créés ou mis à jour" />
        <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Titre</th>
                <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden md:table-cell">Catégorie</th>
                <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Statut</th>
                <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden lg:table-cell">Vues</th>
                <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 hidden lg:table-cell">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {recent.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-neutral-300 font-sans">Aucun article</td></tr>
              ) : recent.map((article) => {
                const st = STATUS_DISPLAY[article.status as string] ?? STATUS_DISPLAY.draft!;
                const cat = article.categories as { name: string } | null;
                return (
                  <tr key={article.id} className="hover:bg-neutral-50 transition-colors duration-150 group">
                    <td className="px-5 py-3">
                      <p className="font-sans font-medium text-ns-black truncate max-w-xs">{article.title}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <p className="text-xs text-neutral-400 font-sans">{cat?.name ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right hidden lg:table-cell">
                      <span className="font-heading font-bold text-sm text-ns-black">
                        {(article.view_count ?? 0).toLocaleString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right hidden lg:table-cell">
                      <span className="text-xs text-neutral-400 font-sans">
                        {article.published_at
                          ? new Date(article.published_at as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" })
                          : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <a
                        href={`/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-neutral-300 hover:text-ns-blue"
                        aria-label="Voir l'article"
                      >
                        <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Mockups ── */}
      <section>
        <SectionHeader title="Modules à venir" sub="Ces sections seront disponibles dans les prochaines versions" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MockupCard
            icon={FileText}
            label="Gestion articles"
            description="Créer, éditer et publier des articles depuis l'éditeur riche."
          />
          <MockupCard
            icon={Mail}
            label="Newsletter"
            description="Gérer les abonnés et envoyer des campagnes via Resend."
          />
          <MockupCard
            icon={Tv}
            label="Hero Config"
            description="Changer le bloc hero du feed en temps réel : live, news, player."
          />
          <MockupCard
            icon={Radio}
            label="Live & Audio"
            description="Programmer des sessions live et gérer les épisodes audio."
          />
        </div>
      </section>

    </div>
  );
}
