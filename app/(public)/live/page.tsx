import type { Metadata } from "next";
import { Radio, Calendar, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Live — Neural Space",
  description: "Sessions en direct, Q&A et conférences scientifiques avec Neural Space.",
  robots: { index: false },
};

const upcoming = [
  {
    id: "1",
    title: "Q&A — La physique derrière les trous de ver",
    description: "Session de questions-réponses en direct sur la relativité générale, les solutions de Lorentz et ce que la physique dit vraiment des voyages dans le temps.",
    date: "20 juin 2026",
    time: "20h00",
    duration: "1h",
    platform: "YouTube",
    attendees: 340,
  },
  {
    id: "2",
    title: "Conférence — L'IA en biologie computationnelle",
    description: "Comment les modèles de langage et les réseaux de neurones transforment la découverte de médicaments et la compréhension des protéines.",
    date: "27 juin 2026",
    time: "19h30",
    duration: "1h30",
    platform: "Twitch",
    attendees: 210,
  },
];

const past = [
  {
    id: "3",
    title: "Q&A — CRISPR et éthique",
    description: "Discussion sur les limites éthiques de l'édition génomique et les régulations en cours à travers le monde.",
    date: "6 juin 2026",
    views: "2,4k",
  },
  {
    id: "4",
    title: "Atelier — Comprendre les réseaux de neurones",
    description: "Session interactive pour visualiser et comprendre les mécanismes fondamentaux des transformers.",
    date: "30 mai 2026",
    views: "3,1k",
  },
  {
    id: "5",
    title: "Conférence — Cosmologie observationnelle",
    description: "Les résultats du James Webb Space Telescope et ce qu'ils remettent en question dans notre modèle du cosmos.",
    date: "23 mai 2026",
    views: "4,7k",
  },
];

export default function LivePage() {
  return (
    <div className="relative min-h-screen">

      {/* ── Page content (blurred) ── */}
      <div className="blur-sm pointer-events-none select-none">

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

          {/* Upcoming */}
          <section className="space-y-5">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-neutral-400">
              À venir
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((event) => (
                <div key={event.id} className="rounded-2xl border border-ns-blue/20 bg-ns-blue/5 p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-ns-blue/10 text-ns-blue">
                      {event.platform}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-neutral-400 font-sans shrink-0">
                      <Users className="w-3 h-3" /> {event.attendees} inscrits
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-heading font-bold text-[17px] text-ns-black leading-snug">
                      {event.title}
                    </h2>
                    <p className="text-sm text-neutral-600 font-sans leading-6">
                      {event.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-xs text-neutral-500 font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.time} · {event.duration}
                      </span>
                    </div>
                    <button className="px-4 py-2 rounded-full bg-ns-blue text-white text-xs font-sans font-semibold hover:opacity-80 transition-opacity">
                      Me rappeler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Past sessions */}
          <section className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-neutral-400">
              Sessions passées
            </p>
            <div className="divide-y divide-neutral-100">
              {past.map((session) => (
                <div key={session.id} className="flex items-start gap-6 py-5">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-heading font-semibold text-[16px] text-ns-black leading-snug">
                      {session.title}
                    </p>
                    <p className="text-sm text-neutral-500 font-sans line-clamp-1">
                      {session.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1 hidden md:block">
                    <p className="text-xs text-neutral-400 font-sans">{session.date}</p>
                    <p className="text-xs text-neutral-400 font-sans">{session.views} vues</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* ── Coming soon overlay ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-3 px-6">
          <p className="font-heading font-black text-3xl md:text-4xl text-ns-black">
            Bientôt disponible
          </p>
          <p className="text-neutral-500 font-sans text-sm">
            Neural Space Live arrive prochainement.
          </p>
        </div>
      </div>

    </div>
  );
}
