"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Radio, RotateCcw,
} from "lucide-react";

type Mode = "live" | "replay";

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  color: string;
};

const CHAT_POOL: Omit<ChatMessage, "id">[] = [
  { user: "pauline_astro",   text: "C'est passionnant ! 🚀",                               color: "#60a5fa" },
  { user: "thomas_physics",  text: "Différence entre trou noir de Schwarzschild et Kerr ?", color: "#a78bfa" },
  { user: "marie_bio",       text: "Super qualité de son aujourd'hui 👌",                  color: "#34d399" },
  { user: "lucas_math",      text: "Un lien vers les sources stp ?",                        color: "#fbbf24" },
  { user: "sara_chem",       text: "J'adore les lives Neural Space 🧬",                    color: "#f87171" },
  { user: "kevin_info",      text: "S'applique aussi aux étoiles à neutrons ?",             color: "#60a5fa" },
  { user: "anais_geo",       text: "Merci pour la vulgarisation !",                         color: "#a78bfa" },
  { user: "remi_phys",       text: "La 3D c'est sim ou observation directe ?",              color: "#34d399" },
  { user: "claire_b",        text: "👏👏👏",                                               color: "#fbbf24" },
  { user: "hugo_astro",      text: "On parle de Hawking radiation après ?",                 color: "#f87171" },
  { user: "lea_cosmo",       text: "Quelle fréquence pour les prochains lives ?",           color: "#60a5fa" },
  { user: "maxime_q",        text: "L'intrication quantique est liée à ça ?",               color: "#a78bfa" },
  { user: "sophie_f",        text: "Incroyable comme toujours ✨",                          color: "#34d399" },
  { user: "alexis_r",        text: "Le podcast sur ce sujet c'est l'épisode 8 ?",           color: "#fbbf24" },
];

const INITIAL_MESSAGES: ChatMessage[] = CHAT_POOL.slice(0, 5).map((m, i) => ({
  ...m,
  id: `init-${i}`,
}));

// TODO: cookies integration — track watch duration, play/pause events, and chat activity when consent accepted

type Props = {
  mode?: Mode;
  title?: string;
  viewers?: number;
  duration?: string;
};

export function LivePlayer({
  mode = "live",
  title = "Les trous noirs, portes vers l'infini",
  viewers = 847,
  duration = "38:24",
}: Props) {
  const [playing, setPlaying]     = useState(false);
  const [muted, setMuted]         = useState(false);
  const [volume, setVolume]       = useState(80);
  const [showVol, setShowVol]     = useState(false);
  const [progress, setProgress]   = useState(0); // 0–100, replay only
  const [messages, setMessages]   = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef(5); // next index in CHAT_POOL

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulated incoming chat messages
  useEffect(() => {
    if (mode !== "live") return;
    const interval = setInterval(() => {
      const idx = poolRef.current % CHAT_POOL.length;
      poolRef.current += 1;
      setMessages((prev) => [
        ...prev.slice(-40), // keep last 40
        { ...CHAT_POOL[idx]!, id: `auto-${Date.now()}` },
      ]);
    }, 2800);
    return () => clearInterval(interval);
  }, [mode]);

  // Simulated progress for replay
  useEffect(() => {
    if (mode !== "replay" || !playing) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [mode, playing]);

  const sendMessage = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev.slice(-40),
      { id: `user-${Date.now()}`, user: "vous", text, color: "#ffffff" },
    ]);
    setChatInput("");
  }, [chatInput]);

  const effectiveVolume = muted ? 0 : volume;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-neutral-100 bg-ns-black flex flex-col lg:flex-row">

      {/* ── Video panel ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Video area */}
        <div className="relative aspect-video bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center">

          {/* Thumbnail placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-ns-blue/20 via-transparent to-neutral-900/80" />

          {/* Play overlay when paused */}
          {!playing && (
            <button
              onClick={() => setPlaying(true)}
              aria-label="Lancer la lecture"
              className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
            >
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </button>
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {mode === "live" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ns-black/70 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-sans font-bold text-white uppercase tracking-widest">
                  Live
                </span>
                <span className="text-[11px] font-sans text-white/60">
                  {viewers.toLocaleString("fr-FR")} spectateurs
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ns-black/70 backdrop-blur-sm">
                <RotateCcw className="w-3 h-3 text-white/70" />
                <span className="text-[11px] font-sans font-bold text-white uppercase tracking-widest">
                  Rediffusion
                </span>
              </div>
            )}

            {/* Radio icon top-right */}
            <div className="px-2 py-1.5 rounded-full bg-ns-black/50 backdrop-blur-sm">
              <Radio className="w-4 h-4 text-white/50" />
            </div>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-14 left-3 right-3 z-10">
            <p className="font-heading font-bold text-white text-sm md:text-base line-clamp-1 drop-shadow-lg">
              {title}
            </p>
          </div>
        </div>

        {/* Controls bar */}
        <div className="bg-neutral-900 px-4 py-3 flex items-center gap-3">

          {/* Play / Pause */}
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Lecture"}
            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors duration-200"
          >
            {playing
              ? <Pause className="w-5 h-5" />
              : <Play className="w-5 h-5" fill="currentColor" />}
          </button>

          {/* Progress bar — replay only */}
          {mode === "replay" && (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                aria-label="Progression"
                className="flex-1 h-1 accent-ns-blue cursor-pointer"
              />
              <span className="text-[11px] font-mono text-white/40 shrink-0">{duration}</span>
            </div>
          )}

          {/* Live spacer */}
          {mode === "live" && <div className="flex-1" />}

          {/* Volume */}
          <div
            className="relative flex items-center gap-2"
            onMouseEnter={() => setShowVol(true)}
            onMouseLeave={() => setShowVol(false)}
          >
            {showVol && (
              <input
                type="range"
                min={0}
                max={100}
                value={effectiveVolume}
                onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
                aria-label="Volume"
                className="w-20 h-1 accent-ns-blue cursor-pointer"
              />
            )}
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors duration-200"
            >
              {muted || volume === 0
                ? <VolumeX className="w-5 h-5" />
                : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Fullscreen */}
          <button
            aria-label="Plein écran"
            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors duration-200"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Chat panel ── */}
      <div className="w-full lg:w-72 xl:w-80 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 min-h-0">

        {/* Chat header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <p className="text-[11px] font-sans font-bold text-white/50 uppercase tracking-widest">
            Chat en direct
          </p>
          <span className="text-[11px] font-sans text-white/30">
            {messages.length} messages
          </span>
        </div>

        {/* Messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 max-h-64 lg:max-h-none lg:h-64 xl:h-80 scrollbar-none"
        >
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-2 text-xs font-sans leading-4">
              <span className="font-semibold shrink-0" style={{ color: msg.color }}>
                {msg.user}
              </span>
              <span className="text-white/70 break-words min-w-0">{msg.text}</span>
            </div>
          ))}
        </div>

        {/* Chat input */}
        <div className="px-3 py-3 border-t border-white/10 flex gap-2 shrink-0">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Envoyer un message…"
            maxLength={200}
            className="flex-1 min-w-0 px-3 py-2 rounded-full bg-white/10 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-sans"
          />
          <button
            onClick={sendMessage}
            aria-label="Envoyer"
            className="w-8 h-8 rounded-full bg-ns-blue flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
