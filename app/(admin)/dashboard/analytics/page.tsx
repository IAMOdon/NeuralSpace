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

function trendIcon(current: number, previous: number) {
  if (current === previous) return null;
  const up = current > previous;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const color = up ? "text-green-600" : "text-red-600";
  const bgColor = up ? "bg-green-50" : "bg-red-50";
  const pctChange = previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
  return { Icon, color, bgColor, pctChange, up };
}

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
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Real-time + time-windowed queries
  const [
    views1h,
    views24h,
    views7d,
    sessions24h,
    sessions7d,
    completedReads7d,
    allReads7d,
    avgDuration7d,
    wordLookups7d,
    sourceClicks7d,
    topArticles7d,
    hourlyViews,
    dailyViews,
    deviceBreakdown,
    referrerBreakdown,
  ] = await Promise.all([
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", oneHourAgo),
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo),
    adminClient.from("article_views").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    adminClient.from("session_profiles").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo),
    adminClient.from("session_profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    adminClient.from("watch_events").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo).eq("read_completed", true),
    adminClient.from("watch_events").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    adminClient.from("watch_events").select("duration_sec").gte("created_at", sevenDaysAgo),
    adminClient.from("watch_events").select("word_lookups").gte("created_at", sevenDaysAgo),
    adminClient.from("watch_events").select("source_clicks").gte("created_at", sevenDaysAgo),
    adminClient.from("article_views").select("article_id").gte("created_at", sevenDaysAgo),
    adminClient.from("article_views").select("hour_of_day, created_at").gte("created_at", oneDayAgo),
    adminClient.from("article_views").select("created_at, day_of_week").gte("created_at", sevenDaysAgo),
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

  // Avg duration
  const durationData = avgDuration7d.data ?? [];
  const avgDur = durationData.length > 0
    ? durationData.reduce((s, w) => s + (w.duration_sec ?? 0), 0) / durationData.length
    : 0;

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

  // Hourly breakdown (last 24h)
  const hourlyData = (hourlyViews.data ?? []);
  const hourlyGrouped: Record<number, number> = {};
  hourlyData.forEach(h => {
    const hod = h.hour_of_day ?? 0;
    hourlyGrouped[hod] = (hourlyGrouped[hod] ?? 0) + 1;
  });
  const hourlyChart = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}h`,
    views: hourlyGrouped[h] ?? 0,
  }));

  // Daily breakdown (last 7d)
  const dailyData = (dailyViews.data ?? []);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyGrouped: Record<number, number> = {};
  dailyData.forEach(d => {
    const dow = d.day_of_week ?? 0;
    dailyGrouped[dow] = (dailyGrouped[dow] ?? 0) + 1;
  });
  const dailyChart = Array.from({ length: 7 }, (_, i) => ({
    day: dayNames[i],
    views: dailyGrouped[i] ?? 0,
  }));

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
          <p className="text-sm text-neutral-400 font-sans mt-1">Real-time + 7-day insights</p>
        </div>
      </div>

      {/* ── Real-time KPIs ── */}
      <section>
        <SectionHeader title="Real-time" sub="Last hour vs 24h vs 7d" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Views (1h)"
            value={v1h.toLocaleString("fr-FR")}
            sub={`${v24h.toLocaleString("fr-FR")} in 24h`}
            icon={Eye}
            accent
          />
          <MetricCard
            label="Views (7d)"
            value={v7d.toLocaleString("fr-FR")}
            sub="Last 7 days"
            icon={BarChart3}
          />
          <MetricCard
            label="Sessions (24h)"
            value={s24h.toLocaleString("fr-FR")}
            sub={`${s7d.toLocaleString("fr-FR")} in 7d`}
            icon={Users}
          />
          <MetricCard
            label="Avg. read time"
            value={avgDur > 0 ? fmtDuration(avgDur) : "—"}
            sub="7-day average"
            icon={Clock}
          />
        </div>
      </section>

      {/* ── Engagement ── */}
      <section>
        <SectionHeader title="Engagement (7d)" sub="Reader interactions & depth" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Completion rate"
            value={`${completionRate}%`}
            sub={`${completed} of ${total} reads`}
            icon={Zap}
            accent={completionRate >= 60}
          />
          <MetricCard
            label="Word lookups"
            value={lookups.toLocaleString("fr-FR")}
            sub="Dictionary usage"
            icon={FileText}
          />
          <MetricCard
            label="Source clicks"
            value={clicks.toLocaleString("fr-FR")}
            sub="Reference clicks"
            icon={TrendingUp}
          />
          <MetricCard
            label="Avg. per read"
            value={total > 0 ? `${(lookups / total).toFixed(1)}` : "0"}
            sub="Lookups per session"
            icon={Activity}
          />
        </div>
      </section>

      {/* ── Charts ── */}
      <section>
        <SectionHeader title="Trends" sub="Time-series breakdowns" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MiniChart title="Hourly (last 24h)" data={hourlyChart} valueKey="views" xKey="hour" />
          <MiniChart title="Daily (last 7d)" data={dailyChart} valueKey="views" xKey="day" />
        </div>
      </section>

      {/* ── Top Articles ── */}
      <section>
        <SectionHeader title="Top articles (7d)" sub="Most viewed by readers" />
        <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">#</th>
                <th className="text-left px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">Title</th>
                <th className="text-right px-5 py-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">7d views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {topArticlesWithCounts.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-xs text-neutral-300 font-sans">No data</td></tr>
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

      {/* ── Device & Referrer ── */}
      <section>
        <SectionHeader title="Sources & Devices" sub="Traffic breakdown" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Device breakdown */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-4">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Device breakdown</p>
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
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-neutral-400">Top referrers</p>
            <div className="space-y-3">
              {topReferrers.length === 0 ? (
                <p className="text-xs text-neutral-300 font-sans">No referrer data</p>
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
