import type { Metadata } from "next";
import { ScanEye, CalendarCheck, Users, Lock, Sparkles, Mic, AudioLines, Wand2, ChevronDown, Apple } from "lucide-react";
import { SITE_URL, SITE_NAME, SITE_LOCALE } from "@/lib/config";
import { WaitlistForm } from "@/components/coherence/WaitlistForm";
import { Orb } from "@/components/coherence/Orb";
import { LivingOrb } from "@/components/coherence/LivingOrb";
import { ScrollShowcase } from "@/components/coherence/ScrollShowcase";
import { Reveal } from "@/components/coherence/Reveal";
import { PageFx } from "@/components/coherence/PageFx";
import { CursorGlow } from "@/components/coherence/CursorGlow";
import {
  PersonasSection, WhatChangesSection, HowItWorksSection, PricingSection, TrustStrip,
} from "@/components/coherence/ProductSections";

// Staggered kinetic-typography reveal — pure CSS, runs on load.
function RisingWords({ words, baseDelay = 0 }: { words: { t: string; shimmer?: boolean }[]; baseDelay?: number }) {
  return (
    <>
      {words.map((w, i) => (
        <span
          key={i}
          className={`inline-block opacity-0 ${w.shimmer ? "coh-shimmer" : ""}`}
          style={{ animation: "word-rise 0.7s ease-out forwards", animationDelay: `${baseDelay + i * 90}ms` }}
        >
          {w.t}&nbsp;
        </span>
      ))}
    </>
  );
}

const TITLE = "Coherence — votre ordinateur a désormais une âme";
const DESCRIPTION =
  "Coherence est un orbe macOS qui partage votre écran : il voit ce que vous voyez, repère vos erreurs, vérifie les faits, prend vos notes et se déplace dans votre interface. Votre ordinateur prend vie.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/coherence` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/coherence`,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const PILLARS = [
  {
    icon: ScanEye,
    title: "Il voit ce que vous voyez",
    body: "Fenêtre active, application, page : Coherence connaît votre contexte sans que vous le décriviez. La réponse arrive là où vous regardez.",
  },
  {
    icon: CalendarCheck,
    title: "Il propose au bon moment",
    body: "Une deadline repérée devient une proposition de calendrier. Vous confirmez d'un clic — il l'écrit. Voir, juger, proposer, agir.",
  },
  {
    icon: Users,
    title: "Il s'adapte à qui vous êtes",
    body: "Étudiant, chercheur, développeur, professionnel : il détecte votre contexte et change de posture. Tuteur sur un cours, pair scientifique sur un papier.",
  },
  {
    icon: Sparkles,
    title: "Il sait se taire",
    body: "Proactivité budgétée : un nombre limité d'interventions par heure, coupables d'un clic, app par app. La discrétion est une fonctionnalité.",
  },
];

const ROADMAP = [
  { icon: AudioLines, label: "Une vraie voix", detail: "réponses parlées naturelles, interruptibles" },
  { icon: Mic, label: "Réunions", detail: "transcription continue, notes et décisions extraites automatiquement" },
  { icon: Wand2, label: "Agir pour vous", detail: "l'orbe exécute les étapes lui-même — toujours visible, toujours annulable" },
];

export default function CoherencePage() {
  return (
    <>
      <PageFx />

      {/* ── Hero — the orb, alive, center stage ── */}
      <section className="relative w-full bg-ns-black overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-ns-blue/15 blur-[140px] pointer-events-none" />
        <CursorGlow />

        <div className="relative max-w-4xl mx-auto px-4 md:px-6 min-h-[92vh] flex flex-col items-center justify-center text-center py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-ns-blue animate-pulse" />
            <span className="text-[11px] font-sans font-bold text-white/70 uppercase tracking-widest">
              Neural Space · Bientôt sur macOS
            </span>
          </div>

          {/* The orb — alive, watching your cursor (click it. five times.) */}
          <LivingOrb size={140} />

          <h1
            className="font-heading font-black text-5xl md:text-7xl text-white tracking-tight leading-[0.95] mt-12 opacity-0"
            style={{ animation: "word-rise 0.8s ease-out 0.1s forwards" }}
          >
            Coherence
          </h1>
          <p className="font-heading font-bold text-2xl md:text-4xl text-white/90 leading-tight mt-6 max-w-2xl">
            <RisingWords
              baseDelay={350}
              words={[
                { t: "Votre" }, { t: "ordinateur" }, { t: "a" }, { t: "désormais" },
                { t: "une", shimmer: true }, { t: "âme.", shimmer: true },
              ]}
            />
          </p>
          <p
            className="text-base md:text-lg text-white/50 font-sans leading-relaxed max-w-xl mt-6 opacity-0"
            style={{ animation: "word-rise 0.8s ease-out 1.1s forwards" }}
          >
            Un orbe qui partage votre écran : il voit ce que vous voyez, comprend
            ce sur quoi vous travaillez, et intervient au bon moment — pas quand
            on l'appelle, quand ça compte.
          </p>

          <div
            className="mt-10 w-full flex flex-col items-center gap-4 opacity-0"
            style={{ animation: "word-rise 0.8s ease-out 1.4s forwards" }}
          >
            <WaitlistForm variant="dark" />

            {/* Honest pre-launch download: disabled until the DMG ships */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <span
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/15 text-sm font-sans font-semibold text-white/40 cursor-not-allowed"
                title="Disponible au lancement"
                aria-disabled="true"
              >
                <Apple className="w-4 h-4" strokeWidth={1.75} />
                Télécharger pour macOS
                <span className="text-[10px] font-bold uppercase tracking-widest text-ns-blue bg-ns-blue/15 px-1.5 py-0.5 rounded-full">
                  Bientôt
                </span>
              </span>
              <span className="text-xs font-sans text-white/40">
                Essai gratuit de 14 jours · sans carte · sans compte
              </span>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-white/30">
              Voyez-le vivre
            </span>
            <ChevronDown
              className="w-4 h-4 text-white/40 motion-reduce:animate-none"
              style={{ animation: "scroll-cue 1.8s ease-in-out infinite" }}
            />
          </div>
        </div>
      </section>

      {/* ── The cinematic scroll showcase — the orb at work ── */}
      <ScrollShowcase />

      {/* ── Pillars ── */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <h2 className="font-heading font-black text-3xl md:text-4xl text-ns-black tracking-tight leading-tight">
                Un collègue ambiant, pas un onglet de plus.
              </h2>
              <p className="mt-4 text-base md:text-lg text-neutral-500 font-sans leading-relaxed">
                Les assistants d'aujourd'hui sont des destinations : vous arrêtez de
                travailler pour décrire votre écran à un modèle qui ne le voit pas.
                Coherence inverse tout. Conçu d'abord pour les étudiants et les
                chercheurs — celles et ceux qui vivent dans les portails de cours
                et les papiers denses.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-100 rounded-3xl overflow-hidden border border-neutral-100">
            {PILLARS.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 90} className="h-full">
                <div className="group bg-white h-full p-7 md:p-8 space-y-3 hover:bg-neutral-50 transition-colors duration-200">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-ns-blue/10 text-ns-blue transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transform-none">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-heading font-bold text-lg text-ns-black">{title}</h3>
                  <p className="text-sm text-neutral-500 font-sans leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Roadmap teaser */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            {ROADMAP.map(({ icon: Icon, label, detail }, i) => (
              <Reveal key={label} delay={i * 90} className="flex-1">
                <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 h-full">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-neutral-200 text-neutral-400 shrink-0">
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-sans font-bold text-ns-black">
                      {label}
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-ns-blue bg-ns-blue/10 px-1.5 py-0.5 rounded-full">
                        Ensuite
                      </span>
                    </p>
                    <p className="text-xs text-neutral-500 font-sans mt-0.5">{detail}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <PersonasSection />

      {/* ── What it changes ── */}
      <WhatChangesSection />

      {/* ── How it works ── */}
      <HowItWorksSection />

      {/* ── Honesty band ── */}
      <section className="w-full bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-20 text-center space-y-5">
          <Reveal>
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ns-blue/10 text-ns-blue">
              <Lock className="w-6 h-6" strokeWidth={1.75} />
            </span>
            <h2 className="font-heading font-black text-2xl md:text-3xl text-ns-black tracking-tight mt-5">
              Conscient, jamais caché.
            </h2>
            <p className="text-base text-neutral-500 font-sans leading-relaxed mt-4">
              L'honnêteté est le produit. L'orbe pulse visiblement chaque fois qu'il
              lit l'écran. Des puces de contexte montrent exactement ce qui a été
              envoyé — retirables d'un clic. La capture se limite à la fenêtre
              active, jamais à tout l'affichage, et votre historique d'écran reste
              en mémoire, sur votre machine. Rien ne part sans que vous le voyiez.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ── */}
      <PricingSection />

      {/* ── Trust ── */}
      <TrustStrip />

      {/* ── Final CTA ── */}
      <section id="acces" className="relative w-full bg-ns-black overflow-hidden scroll-mt-20">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-ns-blue/15 blur-[120px] pointer-events-none" />
        <CursorGlow />
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-24 md:py-32 text-center space-y-8">
          <Reveal>
            <div className="flex justify-center mb-8">
              <Orb size={72} state="speaking" />
            </div>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-white tracking-tight leading-tight">
              Donnez vie à votre Mac.
            </h2>
            <p className="text-base md:text-lg text-white/60 font-sans max-w-xl mx-auto mt-6">
              Coherence arrive bientôt sur macOS. Rejoignez la liste d'accès
              anticipé et soyez parmi les premiers à l'essayer.
            </p>
            <div className="flex justify-center mt-8">
              <WaitlistForm variant="dark" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
