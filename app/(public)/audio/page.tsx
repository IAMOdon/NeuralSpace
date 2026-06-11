import type { Metadata } from "next";
import { PlayCircle, Clock, Headphones } from "lucide-react";
import { SITE_URL, SITE_NAME, SITE_LOCALE } from "@/lib/config";

const description = "Podcasts et épisodes audio pour explorer la science autrement.";

export const metadata: Metadata = {
  title: "Audio — Neural Space",
  description,
  robots: { index: false },
  alternates: { canonical: `${SITE_URL}/audio` },
  openGraph: {
    title: "Audio — Neural Space",
    description,
    url: `${SITE_URL}/audio`,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-audio.png`,
        width: 1200,
        height: 630,
        alt: "Neural Space — Podcasts scientifiques",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Audio — Neural Space",
    description,
  },
};

// Backdrop flouté = squelettes neutres, pas de faux épisodes — aucun contenu
// inventé ne doit être lisible (ni servi dans le HTML) avant le vrai lancement.
function EpisodeSkeleton() {
  return (
    <div className="flex items-start gap-4 py-5">
      <PlayCircle className="mt-0.5 w-7 h-7 shrink-0 text-neutral-200" strokeWidth={1.5} />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-4 w-20 rounded-full bg-neutral-100" />
          <span className="h-3 w-12 rounded-full bg-neutral-100" />
        </div>
        <div className="h-4 w-2/3 rounded-full bg-neutral-200" />
        <div className="h-3 w-1/2 rounded-full bg-neutral-100" />
      </div>
    </div>
  );
}

export default function AudioPage() {
  return (
    <div className="relative min-h-screen">

      {/* ── Page content (blurred teaser) ── */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">

        {/* Hero */}
        <div className="bg-ns-blue w-full py-5">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
            <Headphones className="w-5 h-5 text-white/70" strokeWidth={1.5} />
            <h1 className="font-heading font-black text-lg md:text-xl text-ns-white tracking-tight">
              Neural Space Audio
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-14">

          {/* Featured episode — skeleton */}
          <section className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-neutral-400">
              Dernier épisode
            </p>
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-24 rounded-full bg-ns-blue/10" />
                  <span className="text-xs text-neutral-400 font-sans flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="h-3 w-10 rounded-full bg-neutral-100 inline-block" />
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-3/4 rounded-full bg-neutral-200" />
                  <div className="h-4 w-full rounded-full bg-neutral-100" />
                  <div className="h-4 w-5/6 rounded-full bg-neutral-100" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-ns-blue text-white text-sm font-sans font-semibold">
                    <PlayCircle className="w-4 h-4" />
                    Écouter
                  </span>
                </div>
              </div>
              {/* Waveform placeholder */}
              <div className="md:w-48 h-32 rounded-xl bg-gradient-to-br from-ns-blue/10 to-ns-blue/5 flex items-center justify-center shrink-0">
                <PlayCircle className="w-10 h-10 text-ns-blue/40" strokeWidth={1} />
              </div>
            </div>
          </section>

          {/* Episode list — skeletons */}
          <section className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-neutral-400">
              Épisodes précédents
            </p>
            <div className="divide-y divide-neutral-100">
              <EpisodeSkeleton />
              <EpisodeSkeleton />
              <EpisodeSkeleton />
              <EpisodeSkeleton />
              <EpisodeSkeleton />
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
            Neural Space Audio arrive prochainement.
          </p>
        </div>
      </div>

    </div>
  );
}
