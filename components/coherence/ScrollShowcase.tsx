"use client";

import { useEffect, useRef, useState } from "react";
import { Orb } from "./Orb";
import { CursorGlow } from "./CursorGlow";

// ── How the scroll story works ────────────────────────────────────────────────
// The wrapper reserves one tall "segment" per scene and the stage is `sticky`,
// so the viewport pins while you scroll through the reserved height. We turn
// raw scroll into two numbers:
//   active = which scene (integer)        → crossfades the mock, moves the orb,
//                                            restarts the typewriter, re-intros text
//   local  = progress 0→1 within a scene  → drives continuous parallax so the
//                                            stage keeps answering the scroll
//                                            between the snap points
// Everything is scrubbed to the finger; nothing waits for a scroll to "end".

type Scene = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  bubble: string;
  orb: { top: string; left: string };
  bubbleSide: "left" | "right";
};

const SCENES: Scene[] = [
  {
    id: "intro",
    kicker: "La démonstration",
    title: "Regardez-le travailler.",
    body: "Votre écran, un mardi matin. Rien d'inhabituel — sauf qu'un orbe regarde avec vous. Faites défiler : il va se mettre au travail.",
    bubble: "Installez-vous. Je regarde avec vous.",
    orb: { top: "32%", left: "44%" },
    bubbleSide: "left",
  },
  {
    id: "mistake",
    kicker: "Pendant que vous rédigez",
    title: "Il repère l'erreur que vous n'avez pas vue.",
    body: "Vous travaillez sur votre papier, vous tapez un chiffre de mémoire. Coherence lit la même page que vous — et la source ouverte à côté.",
    bubble: "Votre brouillon dit 37 % — votre source (Gut, 2026) indique 73 %. Je corrige ?",
    orb: { top: "2%", left: "82%" },
    bubbleSide: "left",
  },
  {
    id: "factcheck",
    kicker: "Pendant que vous lisez",
    title: "Il vérifie les faits, en direct.",
    body: "Sur un article Neural Space comme partout ailleurs : chaque affirmation peut être recoupée à la source, sans quitter la page.",
    bubble: "Affirmation recoupée : 3 sources concordantes, DOI vérifié. Consensus établi.",
    orb: { top: "42%", left: "-6%" },
    bubbleSide: "right",
  },
  {
    id: "notes",
    kicker: "Pendant que vous écoutez",
    title: "Il prend les notes à votre place.",
    body: "En cours, en réunion, en visio : Coherence suit, structure, et extrait les décisions pendant que vous restez dans la conversation.",
    bubble: "Décision : rendu repoussé au 22 mai. Action : envoyer le dataset à Léa. C'est noté.",
    orb: { top: "70%", left: "80%" },
    bubbleSide: "left",
  },
  {
    id: "guide",
    kicker: "Pendant que vous cherchez",
    title: "Il se déplace sur votre écran.",
    body: "« Où sont mes statistiques ? » — l'orbe traverse l'écran et surligne le vrai bouton, dans la vraie interface. Il ne décrit pas votre ordinateur : il y vit.",
    bubble: "C'est ici, sous « Plus ». Cliquez — je vous suis.",
    orb: { top: "26%", left: "56%" },
    bubbleSide: "left",
  },
];

// ── Scene mocks ───────────────────────────────────────────────────────────────

function WindowChrome({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
      <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
      <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
      <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
      {label && (
        <span className="ml-3 text-[10px] font-sans font-semibold uppercase tracking-widest text-white/30">
          {label}
        </span>
      )}
    </div>
  );
}

function Line({ w, tone = "dim" }: { w: string; tone?: "dim" | "mid" | "blue" | "red" }) {
  const bg =
    tone === "blue" ? "bg-ns-blue/50"
    : tone === "red" ? "bg-red-400/60"
    : tone === "mid" ? "bg-white/15"
    : "bg-white/8";
  return <div className={`h-2.5 rounded-full ${bg}`} style={{ width: w }} />;
}

function MockIntro() {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden shadow-2xl">
      <WindowChrome label="Bureau — 9:04" />
      <div className="p-6 grid grid-cols-3 gap-3">
        <div className="space-y-2.5">
          <Line w="90%" tone="mid" /><Line w="70%" /><Line w="80%" />
        </div>
        <div className="space-y-2.5">
          <Line w="80%" /><Line w="95%" tone="mid" /><Line w="60%" />
        </div>
        <div className="space-y-2.5">
          <Line w="70%" /><Line w="85%" /><Line w="50%" tone="mid" />
        </div>
        <div className="col-span-3 h-24 rounded-xl bg-white/5 border border-white/8 mt-1" />
      </div>
    </div>
  );
}

function MockMistake() {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden shadow-2xl">
      <WindowChrome label="manuscrit.tex" />
      <div className="p-6 space-y-3">
        <Line w="38%" tone="mid" />
        <Line w="100%" />
        <Line w="92%" />
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-400/30">
          <span className="text-[11px] font-mono text-red-300/90 whitespace-nowrap">… une sensibilité de 37 % à 16 mois …</span>
        </div>
        <Line w="84%" />
        <Line w="60%" />
      </div>
    </div>
  );
}

function MockFactcheck() {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden shadow-2xl">
      <WindowChrome />
      <div className="px-6 pt-5 pb-3 border-b border-white/5">
        <span className="font-heading font-black text-[11px] tracking-widest text-ns-blue uppercase">
          Neural Space
        </span>
        <div className="mt-3 space-y-2">
          <Line w="80%" tone="mid" />
          <Line w="55%" tone="mid" />
        </div>
      </div>
      <div className="p-6 space-y-3">
        <Line w="100%" />
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-ns-blue/10 border border-ns-blue/30">
          <Line w="70%" tone="blue" />
          <span className="ml-auto text-[9px] font-sans font-bold uppercase tracking-widest text-ns-blue whitespace-nowrap">
            Vérifié ✓
          </span>
        </div>
        <Line w="90%" />
        <Line w="72%" />
      </div>
    </div>
  );
}

function MockNotes() {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden shadow-2xl">
      <WindowChrome label="Réunion — 24 min" />
      <div className="p-6 space-y-4">
        <div className="flex items-end gap-1 h-8">
          {[3, 6, 4, 8, 5, 7, 3, 6, 8, 4, 6, 3, 7, 5, 8, 4, 5, 7, 3, 5].map((h, i) => (
            <span key={i} className="w-1 rounded-full bg-ns-blue/50" style={{ height: `${h * 4}px` }} />
          ))}
        </div>
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-ns-blue bg-ns-blue/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">Décision</span>
            <Line w="55%" tone="mid" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-white/50 bg-white/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">Action</span>
            <Line w="45%" tone="mid" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-white/50 bg-white/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">Action</span>
            <Line w="60%" tone="mid" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockGuide() {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden shadow-2xl">
      <WindowChrome />
      <div className="flex">
        <div className="w-1/4 border-r border-white/5 p-4 space-y-3">
          <Line w="80%" tone="mid" />
          <Line w="65%" />
          <Line w="70%" />
          <Line w="55%" />
        </div>
        <div className="flex-1 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Line w="40%" tone="mid" />
            <span
              className="px-3 py-1.5 rounded-lg bg-white/10 border border-ns-blue text-[10px] font-sans font-bold text-white/80 motion-reduce:shadow-none"
              style={{ animation: "halo-pulse 1.8s ease-in-out infinite" }}
            >
              Plus ···
            </span>
          </div>
          <Line w="100%" />
          <Line w="85%" />
          <div className="h-20 rounded-xl bg-white/5 border border-white/8" />
        </div>
      </div>
    </div>
  );
}

const MOCKS: Record<string, React.ComponentType> = {
  intro: MockIntro,
  mistake: MockMistake,
  factcheck: MockFactcheck,
  notes: MockNotes,
  guide: MockGuide,
};

// ── Speech bubble with typewriter ─────────────────────────────────────────────

function SpeechBubble({ text, done }: { text: string; done: boolean }) {
  return (
    <div className="w-64 rounded-2xl rounded-tl-sm bg-white shadow-2xl px-4 py-3">
      <p className="text-[13px] font-sans text-neutral-800 leading-relaxed">
        {text}
        {!done && (
          <span
            className="inline-block w-[2px] h-[1em] bg-ns-blue ml-0.5 align-middle"
            style={{ animation: "caret-blink 0.8s step-end infinite" }}
          />
        )}
      </p>
    </div>
  );
}

// ── The showcase ──────────────────────────────────────────────────────────────

export function ScrollShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [local, setLocal] = useState(0); // 0→1 within the active scene
  const [typed, setTyped] = useState("");

  // Scroll → (active scene, local progress). rAF-throttled, passive.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = wrapRef.current;
        if (!el) return;
        const total = el.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const p = Math.min(0.9999, Math.max(0, -el.getBoundingClientRect().top / total));
        const segFloat = p * SCENES.length;
        setActive(Math.floor(segFloat));
        setLocal(segFloat - Math.floor(segFloat));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Typewriter — the orb "speaks" each time a scene becomes active.
  useEffect(() => {
    const text = SCENES[active]?.bubble ?? "";
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [active]);

  const scene: Scene = SCENES[active] ?? (SCENES[0] as Scene);
  const doneTyping = typed.length >= scene.bubble.length;

  // Parallax curves from `local`: mock drifts up & settles; narrative gently
  // fades as a scene hands off to the next so the swap reads as a transition.
  const mockDrift = (0.5 - local) * 22;          // px
  const narrativeFade = local > 0.82 ? 1 - (local - 0.82) / 0.18 : 1;
  const narrativeShift = local > 0.82 ? (local - 0.82) / 0.18 * -16 : 0; // px

  return (
    <>
      {/* ── Desktop: pinned cinematic scroll ── */}
      <div
        ref={wrapRef}
        className="relative hidden md:block bg-ns-black"
        style={{ height: `${SCENES.length * 115}vh` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-ns-blue/10 blur-[140px] pointer-events-none" />
          <CursorGlow />

          <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-[1fr_1.35fr] gap-16 items-center">
            {/* Left — narrative (re-introduces itself each scene via keyed animation) */}
            <div
              className="space-y-5"
              style={{ opacity: narrativeFade, transform: `translateY(${narrativeShift}px)` }}
            >
              <p
                key={`k-${scene.id}`}
                className="text-[11px] font-sans font-bold text-ns-blue uppercase tracking-widest opacity-0"
                style={{ animation: "word-rise 0.5s ease-out forwards" }}
              >
                {scene.kicker}
              </p>
              <h3
                key={`t-${scene.id}`}
                className="font-heading font-black text-3xl lg:text-[2.6rem] lg:leading-[1.08] text-white tracking-tight opacity-0"
                style={{ animation: "word-rise 0.6s ease-out 0.06s forwards" }}
              >
                {scene.title}
              </h3>
              <p
                key={`b-${scene.id}`}
                className="text-base lg:text-lg text-white/50 font-sans leading-relaxed max-w-md opacity-0"
                style={{ animation: "word-rise 0.6s ease-out 0.14s forwards" }}
              >
                {scene.body}
              </p>

              {/* Progress rail */}
              <div className="flex items-center gap-2 pt-4">
                {SCENES.map((s, i) => (
                  <span
                    key={s.id}
                    className="h-1 rounded-full bg-white/15 overflow-hidden transition-all duration-500"
                    style={{ width: i === active ? 32 : 12 }}
                  >
                    {i === active && (
                      <span
                        className="block h-full bg-ns-blue"
                        style={{ width: `${Math.round(local * 100)}%` }}
                      />
                    )}
                    {i < active && <span className="block h-full bg-ns-blue/60 w-full" />}
                  </span>
                ))}
                <span className="ml-3 text-[11px] font-sans font-semibold text-white/30 tabular-nums">
                  {active + 1} / {SCENES.length}
                </span>
              </div>
            </div>

            {/* Right — the stage */}
            <div className="relative" style={{ transform: `translateY(${mockDrift}px)` }}>
              {/* Crossfading mocks */}
              <div className="relative">
                {SCENES.map((s, i) => {
                  const Mock = MOCKS[s.id];
                  if (!Mock) return null;
                  return (
                    <div
                      key={s.id}
                      className={`transition-all duration-700 ease-out ${
                        i === active
                          ? "opacity-100 scale-100 relative"
                          : "opacity-0 scale-[0.97] absolute inset-0 pointer-events-none"
                      }`}
                    >
                      <Mock />
                    </div>
                  );
                })}
              </div>

              {/* The orb — travels across the stage between scenes */}
              <div
                className="absolute z-10 transition-all duration-1000 ease-in-out motion-reduce:transition-none"
                style={{ top: scene.orb.top, left: scene.orb.left }}
              >
                <div className="relative" style={{ animation: "float-y 6s ease-in-out infinite" }}>
                  <Orb size={64} state={doneTyping ? "speaking" : "reading"} />
                  <div className={`absolute top-full mt-3 ${scene.bubbleSide === "left" ? "right-0" : "left-0"}`}>
                    <SpeechBubble text={typed} done={doneTyping} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: stacked scenes ── */}
      <div className="md:hidden bg-ns-black px-4 py-16 space-y-16">
        {SCENES.map((s) => {
          const Mock = MOCKS[s.id];
          if (!Mock) return null;
          return (
            <div key={s.id} className="space-y-5">
              <p className="text-[11px] font-sans font-bold text-ns-blue uppercase tracking-widest">{s.kicker}</p>
              <h3 className="font-heading font-black text-2xl text-white tracking-tight leading-tight">{s.title}</h3>
              <p className="text-sm text-white/50 font-sans leading-relaxed">{s.body}</p>
              <div className="relative pt-2 pb-20">
                <Mock />
                <div className="absolute bottom-0 right-2 flex items-start gap-2">
                  <Orb size={44} state="speaking" />
                  <div className="w-56 rounded-2xl rounded-tl-sm bg-white shadow-2xl px-3.5 py-2.5">
                    <p className="text-xs font-sans text-neutral-800 leading-relaxed">{s.bubble}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
