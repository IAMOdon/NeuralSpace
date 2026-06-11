import type { Metadata } from "next";
import { adminClient } from "@/lib/supabase/admin";
import {
  TrendingUp, Activity, BarChart3, PieChart, LineChart, Calendar,
  ArrowUpRight, ArrowDownRight, Zap, Users, Eye, Clock, FileText,
} from "lucide-react";

export const metadata: Metadata = { title: "Analytics — Dashboard" };

// ── Helpers ──────────────────────────────────────────────────────────────────

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// Badge de tendance vs période précédente. previous=0 → pas de badge
// (un "+0%" ou "+∞%" serait trompeur sans historique de comparaison).
function trendIcon(current: number, previous: number) {
  if (current === previous || previous === 0) return null;
  const up = current > previous;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const color = up ? "text-green-600" : "text-red-600";
  const bgColor = up ? "bg-green-50" : "bg-red-50";
  const pctChange = Math.round(((current - previous) / previous) * 100);
  return { Icon, color, bgColor, pctChange, up } as const;
}

// Les buckets hour_of_day/day_of_week en base sont en UTC — pour des
// tendances lisibles on regroupe depuis created_at en heure de Paris.
const parisHourFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit", hourCycle: "h23", timeZone: "Europe/Paris",
});
function hourInParis(date: Date): number {
  return Number(parisHourFmt.format(date));
}
const parisDayLabel = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short", day: "numeric", timeZone: "Europe/Paris",
});
// fr-CA → format YYYY-MM-DD, pratique comme clé de regroupement
const parisDayKey = new Intl.DateTimeFormat("fr-CA", {
  year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Paris",
});

function MetricCard({
  label, value, sub, icon: Icon, trend, accent = false,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  trend?: { Icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; pctChange: number; up: boolean };
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
      <div className="flex items-end justify-between">
        <p className={`font-heading font-black text-3xl ${accent ? "text-white" : "text-ns-black"}`}>
          {value}
        </p>
        {trend && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${trend.bgColor}`}>
            <trend.Icon className={`w-3.5 h-3.5 ${trend.color}`} />
            <span className={`text-xs font-semibold ${trend.color}`}>
              {trend.up ? "+" : ""}{trend.pctChange}%
            </span>
          </div>
        )}
      </div>
      {sub && <p className={`text-xs font-sans ${accent ? "text-white/50" : "text-neutral-400"}`}>{sub}</p>}
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

function MiniChart({
  title, data, valueKey, xKey,
}: {
  title: string;
  data: Array<Record<string, unknown>>;
  valueKey: string;
  xKey: string;
}) {
  const max = Math.max(...data.map(d => typeof d[valueKey] === "number" ? d[valueKey] : 0), 1) as number;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
      <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">{title}</p>
      <div className="flex items-end gap-1 h-24">
        {data.map((item, i) => {
          const v = (typeof item[valueKey] === "number" ? item[valueKey] : 0) as number;
          const height = Math.max(4, (v / max) * 100);
          const label = String(item[xKey] ?? "");
          return (
            <div key={i} className="flex-1 flex flex-col items-center" title={`${label}: ${v}`}>
              <div
                className="w-full rounded-sm bg-ns-blue/20 hover:bg-ns-blue/40 transition-colors"
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-neutral-300 font-sans">
        <span>{String(data[0]?.[xKey] ?? "")}</span>
        <span>{String(data[Math.floor(data.length / 2)]?.[xKey] ?? "")}</span>
        <span>{String(data[data.length - 1]?.[xKey] ?? "")}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const now = new Date();
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  const oneHourAgo = ago(HOUR);
  const twoHoursAgo = ago(2 * HOUR);
  const oneDayAgo = ago(DAY);
  const twoDaysAgo = ago(2 * DAY);
  const sevenDaysAgo = ago(7 * DAY);
  const fourteenDaysAgo = ago(14 * DAY);

  // Fenêtres courantes + fenêtres précédentes (pour les tendances réelles)
  const [
    views1h,
    views1hPrev,
    views24h,
    views24hPrev,
    views7d,
    views7dPrev,
    sessions24h,
    sessions24hPrev,
    sessions7d,
    completedReads7d,
    allReads7d,
    avgDuration7d,
    avgDuration7dPrev,
    wordLookups7d,
    sourceClicks7d,
    topArticles7d,
    hourlyViews,
    dailyViews,
    deviceBreakdown,
    referrerBreakdown,
  ] = await Promise.all([
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", oneHourAgo),
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", twoHoursAgo).lt("created_at", oneHourAgo),
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo),
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", twoDaysAgo).lt("created_at", oneDayAgo),
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", fourteenDaysAgo).lt("created_at", sevenDaysAgo),
    adminClient.from("session_profiles").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo),
    adminClient.from("session_profiles").select("id", { count: "exact", head: true }).gte("created_at", twoDaysAgo).lt("created_at", oneDayAgo),
    adminClient.from("session_profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    adminClient.from("watch_events").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo).eq("read_completed", true),
    adminClient.from("watch_events").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    adminClient.from("watch_events").select("duration_sec").gte("created_at", sevenDaysAgo),
    adminClient.from("watch_events").select("duration_sec").gte("created_at", fourteenDaysAgo).lt("created_at", sevenDaysAgo),
    adminClient.from("watch_events").select("word_lookups").gte("created_at", sevenDaysAgo),
    adminClient.from("watch_events").select("source_clicks").gte("created_at", sevenDaysAgo),
    adminClient.from("article_views").select("article_id").gte("created_at", sevenDaysAgo),
    adminClient.from("article_views").select("created_at").gte("created_at", oneDayAgo),
    adminClient.from("article_views").select("created_at").gte("created_at", sevenDaysAgo),
    adminClient.from("article_views").select("device").gte("created_at", sevenDaysAgo),
    adminClient.from("article_views").select("referrer_source").gte("created_at", sevenDaysAgo),
  ]);

  const v1h = views1h.count ?? 0;
  const v24h = views24h.count ?? 0;
  const v7d = views7d.count ?? 0;
  const s24h = sessions24h.count ?? 0;
  const s7d = sessions7d.count ?? 0;
  const completed = completedReads7d.count ?? 0;
  const total = allReads7d.count ?? 0;
  const completionRate = pct(completed, total);

  const trendV1h = trendIcon(v1h, views1hPrev.count ?? 0);
  const trendV24h = trendIcon(v24h, views24hPrev.count ?? 0);
  const trendV7d = trendIcon(v7d, views7dPrev.count ?? 0);
  const trendS24h = trendIcon(s24h, sessions24hPrev.count ?? 0);

  // Avg duration (+ période précédente pour la tendance)
  const durationData = avgDuration7d.data ?? [];
  const avgDur = durationData.length > 0
    ? durationData.reduce((s, w) => s + (w.duration_sec ?? 0), 0) / durationData.length
    : 0;
  const durationPrevData = avgDuration7dPrev.data ?? [];
  const avgDurPrev = durationPrevData.length > 0
    ? durationPrevData.reduce((s, w) => s + (w.duration_sec ?? 0), 0) / durationPrevData.length
    : 0;
  const trendDur = trendIcon(Math.round(avgDur), Math.round(avgDurPrev));

  // Word lookups & source clicks
  const lookups = (wordLookups7d.data ?? []).reduce((s, w) => s + (w.word_lookups ?? 0), 0);
  const clicks = (sourceClicks7d.data ?? []).reduce((s, w) => s + (w.source_clicks ?? 0), 0);

  // Top articles
  const articleIds = (topArticles7d.data ?? []).map(v => v.article_id);
  const articleCounts = articleIds.reduce<Record<string, number>>((acc, id) => {
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});
  const topArticleIds = Object.entries(articleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const topArticlesData = topArticleIds.length > 0
    ? await adminClient.from("articles").select("id, title, slug").in("id", topArticleIds)
    : { data: [] };

  const topArticlesWithCounts = (topArticlesData.data ?? []).map(a => ({
    ...a,
    views: articleCounts[a.id] ?? 0,
  }));

  // Répartition horaire (24 dernières heures, heure de Paris)
  const hourlyGrouped: Record<number, number> = {};
  (hourlyViews.data ?? []).forEach((row) => {
    if (!row.created_at) return;
    const h = hourInParis(new Date(row.created_at));
    hourlyGrouped[h] = (hourlyGrouped[h] ?? 0) + 1;
  });
  const hourlyChart = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}h`,
    views: hourlyGrouped[h] ?? 0,
  }));

  // Série quotidienne réelle (7 derniers jours, du plus ancien à aujourd'hui)
  const dailyGrouped: Record<string, number> = {};
  (dailyViews.data ?? []).forEach((row) => {
    if (!row.created_at) return;
    const key = parisDayKey.format(new Date(row.created_at)); // YYYY-MM-DD Paris
    dailyGrouped[key] = (dailyGrouped[key] ?? 0) + 1;
  });
  const dailyChart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * DAY);
    return {
      day: parisDayLabel.format(d), // ex. "mer. 10"
      views: dailyGrouped[parisDayKey.format(d)] ?? 0,
    };
  });

  // Device breakdown
  const deviceData = (deviceBreakdown.data ?? []);
  const deviceCounts = deviceData.reduce<Record<string, number>>((acc, d) => {
    const key = d.device ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  // Referrer breakdown
  const referrerData = (referrerBreakdown.data ?? []);
  const referrerCounts = referrerData.reduce<Record<string, number>>((acc, r) => {
    const key = r.referrer_source ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const topReferrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-10 w-full">

      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-ns-black">Analytics</h1>
          <p className="text-sm text-neutral-400 font-sans mt-1">
            Temps réel + 7 jours — tendances vs période précédente
          </p>
        </div>
      </div>

      {/* ── KPIs temps réel ── */}
      <section>
        <SectionHeader title="Temps réel" sub="Tendance vs heure / jour / semaine précédents" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Vues (1 h)"
            value={v1h.toLocaleString("fr-FR")}
            sub={`${v24h.toLocaleString("fr-FR")} sur 24 h`}
            icon={Eye}
            trend={trendV1h ?? trendV24h ?? undefined}
            accent
          />
          <MetricCard
            label="Vues (7 j)"
            value={v7d.toLocaleString("fr-FR")}
            sub="vs 7 jours précédents"
            icon={BarChart3}
            trend={trendV7d ?? undefined}
          />
          <MetricCard
            label="Sessions (24 h)"
            value={s24h.toLocaleString("fr-FR")}
            sub={`${s7d.toLocaleString("fr-FR")} sur 7 j`}
            icon={Users}
            trend={trendS24h ?? undefined}
          />
          <MetricCard
            label="Lecture moyenne"
            value={avgDur > 0 ? fmtDuration(avgDur) : "—"}
            sub="vs 7 jours précédents"
            icon={Clock}
            trend={trendDur ?? undefined}
          />
        </div>
      </section>

      {/* ── Engagement ── */}
      <section>
        <SectionHeader title="Engagement (7 j)" sub="Interactions et profondeur de lecture" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Taux de complétion"
            value={`${completionRate}%`}
            sub={`${completed} sur ${total} lectures`}
            icon={Zap}
            accent={completionRate >= 60}
          />
          <MetricCard
            label="Lookups dictionnaire"
            value={lookups.toLocaleString("fr-FR")}
            sub="Mots recherchés"
            icon={FileText}
          />
          <MetricCard
            label="Clics sources"
            value={clicks.toLocaleString("fr-FR")}
            sub="Références consultées"
            icon={TrendingUp}
          />
          <MetricCard
            label="Lookups / lecture"
            value={total > 0 ? `${(lookups / total).toFixed(1)}` : "0"}
            sub="Moyenne par session"
            icon={Activity}
          />
        </div>
      </section>

      {/* ── Tendances ── */}
      <section>
        <SectionHeader title="Tendances" sub="Heure de Paris" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MiniChart title="Par heure (24 dernières heures)" data={hourlyChart} valueKey="views" xKey="hour" />
          <MiniChart title="Par jour (7 derniers jours)" data={dailyChart} valueKey="views" xKey="day" />
        </div>
      </section>

      {/* ── Top Articles ── */}
      <section>
        <SectionHeader title="Top articles (7 j)" sub="Les plus vus par les lecteurs" />
        <div className="rounded-2xl border border-neutral-100 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">#</th>
                <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Titre</th>
                <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Vues 7 j</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {topArticlesWithCounts.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-xs text-neutral-300 font-sans">Aucune donnée</td></tr>
              ) : topArticlesWithCounts.map((article, i) => (
                <tr key={article.id} className="hover:bg-neutral-50 transition-colors duration-150">
                  <td className="px-5 py-3 font-mono text-xs text-neutral-300">{i + 1}</td>
                  <td className="px-5 py-3 font-sans text-neutral-700 max-w-xs truncate">{article.title}</td>
                  <td className="px-5 py-3 text-right font-heading font-bold text-ns-black text-sm">
                    {article.views.toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Appareils & Sources ── */}
      <section>
        <SectionHeader title="Sources & appareils" sub="Répartition du trafic (7 j)" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Device breakdown */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Appareils</p>
            <div className="space-y-3">
              {[
                { key: "desktop", label: "Desktop", color: "#2233f0" },
                { key: "mobile", label: "Mobile", color: "#8b5cf6" },
                { key: "tablet", label: "Tablet", color: "#ec4899" },
              ].map(({ key, label, color }) => {
                const count = deviceCounts[key] ?? 0;
                const total = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
                const p = pct(count, total);
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-neutral-600 font-medium">{label}</span>
                      <span className="text-neutral-400">{count.toLocaleString("fr-FR")} ({p}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${p}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Referrer breakdown */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Principales sources</p>
            <div className="space-y-3">
              {topReferrers.length === 0 ? (
                <p className="text-xs text-neutral-300 font-sans">Aucune donnée de provenance</p>
              ) : topReferrers.map(([ref, count]) => {
                const total = Object.values(referrerCounts).reduce((a, b) => a + b, 0);
                const p = pct(count, total);
                return (
                  <div key={ref} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-neutral-600 font-medium capitalize">{ref.replace(/_/g, " ")}</span>
                      <span className="text-neutral-400">{count.toLocaleString("fr-FR")} ({p}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${p}%`, backgroundColor: "#2233f0" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
