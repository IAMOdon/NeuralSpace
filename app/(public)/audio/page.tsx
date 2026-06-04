import type { Metadata } from "next";
import { PlayCircle, Clock, Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "Audio — Neural Space",
  description: "Podcasts et épisodes audio pour explorer la science autrement.",
  robots: { index: false },
  openGraph: {
    title: "Audio — Neural Space",
    description: "Podcasts et épisodes audio pour explorer la science autrement.",
    siteName: "Neural Space",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Audio — Neural Space",
    description: "Podcasts et épisodes audio pour explorer la science autrement.",
  },
};

const episodes = [
  {
    id: "1",
    title: "Les trous noirs, portes vers l'infini",
    summary: "On explore ce que les observations récentes de l'EHT nous apprennent sur la physique des trous noirs supermassifs.",
    category: "Physique",
    duration: "38 min",
    date: "12 juin 2026",
    number: 8,
  },
  {
    id: "2",
    title: "CRISPR, dix ans après : où en est-on ?",
    summary: "Bilan des applications thérapeutiques, des controverses éthiques et des promesses encore non tenues de l'édition génomique.",
    category: "Biologie",
    duration: "45 min",
    date: "5 juin 2026",
    number: 7,
  },
  {
    id: "3",
    title: "L'IA peut-elle vraiment raisonner ?",
    summary: "Analyse critique des benchmarks, des limites actuelles et de ce que \"raisonnement\" signifie réellement pour un modèle de langage.",
    category: "Intelligence Artificielle",
    duration: "52 min",
    date: "29 mai 2026",
    number: 6,
  },
  {
    id: "4",
    title: "Matière noire : le grand mystère cosmique",
    summary: "Tour d'horizon des candidats, des expériences en cours et des théories alternatives qui remettent en question le modèle standard.",
    category: "Cosmologie",
    duration: "41 min",
    date: "22 mai 2026",
    number: 5,
  },
  {
    id: "5",
    title: "Informatique quantique : hype ou révolution ?",
    summary: "On démêle ce que les annonces récentes signifient vraiment, et ce que la suprématie quantique permet — ou ne permet pas — de faire.",
    category: "Physique Quantique",
    duration: "49 min",
    date: "15 mai 2026",
    number: 4,
  },
  {
    id: "6",
    title: "Le microbiome intestinal, notre deuxième cerveau",
    summary: "Ce que la recherche des dix dernières années révèle sur l'axe intestin-cerveau et ses implications pour la santé mentale.",
    category: "Biologie",
    duration: "44 min",
    date: "8 mai 2026",
    number: 3,
  },
];

const featured = episodes[0]!;
const rest = episodes.slice(1);

export default function AudioPage() {
  return (
    <div className="relative min-h-screen">

      {/* ── Page content (blurred) ── */}
      <div className="blur-sm pointer-events-none select-none">

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

          {/* Featured episode */}
          <section className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-neutral-400">
              Dernier épisode
            </p>
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-ns-blue/10 text-ns-blue">
                    {featured.category}
                  </span>
                  <span className="text-neutral-300 text-xs">·</span>
                  <span className="text-xs text-neutral-400 font-sans flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {featured.duration}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-neutral-400 font-sans">Épisode #{featured.number}</p>
                  <h2 className="font-heading font-bold text-2xl text-ns-black leading-snug">
                    {featured.title}
                  </h2>
                  <p className="text-neutral-600 font-sans text-[15px] leading-6">
                    {featured.summary}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-80 transition-opacity">
                    <PlayCircle className="w-4 h-4" />
                    Écouter
                  </button>
                  <span className="text-xs text-neutral-400 font-sans">{featured.date}</span>
                </div>
              </div>
              {/* Waveform placeholder */}
              <div className="md:w-48 h-32 rounded-xl bg-gradient-to-br from-ns-blue/10 to-ns-blue/5 flex items-center justify-center shrink-0">
                <PlayCircle className="w-10 h-10 text-ns-blue/40" strokeWidth={1} />
              </div>
            </div>
          </section>

          {/* Episode list */}
          <section className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-neutral-400">
              Épisodes précédents
            </p>
            <div className="divide-y divide-neutral-100">
              {rest.map((ep) => (
                <div key={ep.id} className="flex items-start gap-4 py-5">
                  <button className="mt-0.5 shrink-0 text-neutral-300 hover:text-ns-blue transition-colors">
                    <PlayCircle className="w-7 h-7" strokeWidth={1.5} />
                  </button>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                        {ep.category}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-sans flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ep.duration}
                      </span>
                    </div>
                    <p className="font-heading font-semibold text-[16px] text-ns-black leading-snug">
                      #{ep.number} — {ep.title}
                    </p>
                    <p className="text-sm text-neutral-500 font-sans line-clamp-1">{ep.summary}</p>
                  </div>
                  <span className="text-xs text-neutral-400 font-sans shrink-0 pt-1 hidden md:block">
                    {ep.date}
                  </span>
                </div>
              ))}
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
