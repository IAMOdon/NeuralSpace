import type { Metadata } from "next";
import { Radio, Calendar, Clock, Users } from "lucide-react";
import { LivePlayer } from "@/components/live/LivePlayer";
import { SITE_URL, SITE_NAME, SITE_LOCALE } from "@/lib/config";

const description = "Sessions en direct, Q&A et conférences scientifiques avec Neural Space.";

export const metadata: Metadata = {
  title: "Live — Neural Space",
  description,
  robots: { index: false },
  alternates: { canonical: `${SITE_URL}/live` },
  openGraph: {
    title: "Live — Neural Space",
    description,
    url: `${SITE_URL}/live`,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-live.png`,
        width: 1200,
        height: 630,
        alt: "Neural Space — Sessions en direct",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live — Neural Space",
    description,
  },
};

// Backdrop flouté = squelettes neutres, pas de fausses sessions — aucun contenu
// inventé (titres, dates, compteurs) ne doit être lisible avant le vrai lancement.
function UpcomingSkeleton() {
  return (
    <div className="rounded-2xl border border-ns-blue/20 bg-ns-blue/5 p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <span className="h-5 w-16 rounded-full bg-ns-blue/10" />
        <span className="flex items-center gap-1 text-xs text-neutral-400 font-sans shrink-0">
          <Users className="w-3 h-3" />
          <span className="h-3 w-14 rounded-full bg-neutral-100 inline-block" />
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded-full bg-neutral-200" />
        <div className="h-4 w-full rounded-full bg-neutral-100" />
        <div className="h-4 w-2/3 rounded-full bg-neutral-100" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3 text-xs text-neutral-400 font-sans">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className="h-3 w-12 rounded-full bg-neutral-100 inline-block" />
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="h-3 w-10 rounded-full bg-neutral-100 inline-block" />
          </span>
        </div>
        <span className="px-4 py-2 rounded-full bg-ns-blue text-white text-xs font-sans font-semibold">
          Me rappeler
        </span>
      </div>
    </div>
  );
}

function PastSkeleton() {
  return (
    <div className="flex items-start gap-6 py-5">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-1/2 rounded-full bg-neutral-200" />
        <div className="h-3 w-3/4 rounded-full bg-neutral-100" />
      </div>
      <div className="text-right shrink-0 space-y-2 hidden md:block">
        <div className="h-3 w-16 rounded-full bg-neutral-100" />
        <div className="h-3 w-12 rounded-full bg-neutral-100 ml-auto" />
      </div>
    </div>
  );
}

export default function LivePage() {
  return (
    <div className="relative min-h-screen">

      {/* ── Page content (blurred teaser) ── */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">

        {/* Hero */}
        <div className="bg-ns-blue w-full py-5">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
            <Radio className="w-5 h-5 text-white/70" strokeWidth={1.5} />
            <h1 className="font-heading font-black text-lg md:text-xl text-ns-white tracking-tight">
              Neural Space Live
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-14">

          {/* Live player */}
          <section className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-neutral-400">
              En ce moment
            </p>
            {/* replay = pas de simulation de chat live derrière le flou */}
            <LivePlayer mode="replay" title="" viewers={0} />
          </section>

          {/* Upcoming — skeletons */}
          <section className="space-y-5">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-neutral-400">
              À venir
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UpcomingSkeleton />
              <UpcomingSkeleton />
            </div>
          </section>

          {/* Past sessions — skeletons */}
          <section className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-neutral-400">
              Sessions passées
            </p>
            <div className="divide-y divide-neutral-100">
              <PastSkeleton />
              <PastSkeleton />
              <PastSkeleton />
            </div>
          </section>

        </div>
      </div>

      {/* ── Coming soon overlay ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-3 px-6">
          <p className="font-heading font-black text-3xl md:text-4xl text-ns-blue">
            Bientôt disponible
          </p>
          <p className="text-ns-blue/60 font-sans text-sm">
            Neural Space Live arrive prochainement.
          </p>
        </div>
      </div>

    </div>
  );
}
