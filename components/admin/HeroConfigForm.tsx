"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { EyeOff, Radio, Newspaper, Tv, Search, X } from "lucide-react";
import { saveHeroConfig } from "@/lib/actions/hero";

type HeroType = "none" | "live" | "news" | "player";

type ArticleResult = { id: string; title: string; slug: string; summary?: string };

const TYPES: { value: HeroType; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; description: string }[] = [
  { value: "none",   label: "Désactivé",  icon: EyeOff,    description: "Aucun hero — le feed commence directement avec les articles." },
  { value: "live",   label: "Live",       icon: Radio,     description: "Card live avec badge animé, description et CTA vers /live." },
  { value: "news",   label: "Actualité",  icon: Newspaper, description: "Bande breaking news avec titre fort et lien vers un article." },
  { value: "player", label: "Lecteur",    icon: Tv,        description: "Lecteur vidéo live embarqué directement dans le feed." },
];

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-sans font-semibold text-neutral-500 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ id, value, onChange, placeholder, type = "text" }: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <input
      id={id} type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors duration-200"
    />
  );
}

function Textarea({ id, value, onChange, placeholder, rows = 3 }: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      id={id} value={value} rows={rows} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors duration-200 resize-none"
    />
  );
}

function ArticlePicker({ selectedSlug, selectedTitle, onSelect }: {
  selectedSlug: string;
  selectedTitle: string;
  onSelect: (slug: string, title: string) => void;
}) {
  const [query, setQuery]       = useState(selectedTitle);
  const [results, setResults]   = useState<ArticleResult[]>([]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(selectedTitle); }, [selectedTitle]);

  useEffect(() => {
    if (query.length < 2 || query === selectedTitle) { setResults([]); setOpen(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json() as ArticleResult[];
      setResults(data.slice(0, 6));
      setOpen(data.length > 0);
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, [query, selectedTitle]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pick(article: ArticleResult) {
    onSelect(article.slug, article.title);
    setQuery(article.title);
    setResults([]);
    setOpen(false);
  }

  function clear() {
    onSelect("", "");
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Rechercher un article…"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors duration-200"
        />
        {(query || selectedSlug) && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {selectedSlug && (
        <p className="mt-1.5 text-[11px] font-sans text-ns-blue truncate">
          /{selectedSlug}
        </p>
      )}

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <p className="px-4 py-3 text-xs text-neutral-400 font-sans">Recherche…</p>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pick(r)}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 transition-colors duration-150 border-b border-neutral-50 last:border-0"
              >
                <p className="text-sm font-sans font-medium text-ns-black truncate">{r.title}</p>
                {r.summary && (
                  <p className="text-[11px] text-neutral-400 font-sans truncate mt-0.5">{r.summary}</p>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function HeroConfigForm({
  currentType,
  currentConfig,
}: {
  currentType: string;
  currentConfig: Record<string, unknown>;
}) {
  const [type, setType]              = useState<HeroType>(currentType as HeroType ?? "none");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved]            = useState(false);
  const [error, setError]            = useState<string | null>(null);

  // Live fields
  const [liveTitle, setLiveTitle]           = useState(String(currentConfig.title ?? ""));
  const [liveDesc, setLiveDesc]             = useState(String(currentConfig.description ?? ""));
  const [liveViewers, setLiveViewers]       = useState(String(currentConfig.viewers ?? ""));
  const [liveHref, setLiveHref]             = useState(String(currentConfig.href ?? "/live"));
  const [liveScheduled, setLiveScheduled]   = useState(String(currentConfig.scheduledAt ?? ""));

  // News fields
  const [newsLabel, setNewsLabel]           = useState(String(currentConfig.label ?? ""));
  const [newsHeadline, setNewsHeadline]     = useState(String(currentConfig.headline ?? ""));
  const [newsBody, setNewsBody]             = useState(String(currentConfig.body ?? ""));
  const [newsPublished, setNewsPublished]   = useState(String(currentConfig.publishedAt ?? ""));
  const [newsArticleSlug, setNewsArticleSlug] = useState(String(currentConfig.articleSlug ?? ""));
  const [newsArticleTitle, setNewsArticleTitle] = useState(String((currentConfig.cta as { label?: string })?.label ?? ""));
  const [newsCtaLabel, setNewsCtaLabel]     = useState(String((currentConfig.cta as { label?: string })?.label ?? ""));

  // Player fields
  const [playerTitle, setPlayerTitle]       = useState(String(currentConfig.title ?? ""));
  const [playerViewers, setPlayerViewers]   = useState(String(currentConfig.viewers ?? ""));
  const [playerMode, setPlayerMode]         = useState<"live" | "replay">(
    (currentConfig.mode as "live" | "replay") ?? "live"
  );
  const [playerDuration, setPlayerDuration] = useState(String(currentConfig.duration ?? ""));

  function buildConfig(): Record<string, unknown> {
    if (type === "none") return {};
    if (type === "live") return {
      title: liveTitle, description: liveDesc,
      ...(liveViewers && { viewers: Number(liveViewers) }),
      href: liveHref || "/live",
      ...(liveScheduled && { scheduledAt: liveScheduled }),
    };
    if (type === "news") return {
      headline: newsHeadline, body: newsBody,
      ...(newsLabel && { label: newsLabel }),
      ...(newsPublished && { publishedAt: newsPublished }),
      ...(newsArticleSlug && { articleSlug: newsArticleSlug }),
      ...(newsCtaLabel && { cta: { label: newsCtaLabel, href: `/${newsArticleSlug}` } }),
    };
    if (type === "player") return {
      mode: playerMode,
      ...(playerTitle && { title: playerTitle }),
      ...(playerViewers && { viewers: Number(playerViewers) }),
      ...(playerDuration && { duration: playerDuration }),
    };
    return {};
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveHeroConfig({ type, config: buildConfig() });
      if (result.ok) setSaved(true);
      else setError(result.error ?? "Erreur inconnue");
    });
  }

  return (
    <div className="space-y-6">

      {/* Type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const active = type === t.value;
          return (
            <button
              key={t.value}
              onClick={() => { setType(t.value); setSaved(false); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-colors duration-200 ${
                active
                  ? "border-ns-blue bg-ns-blue/5 text-ns-blue"
                  : "border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs font-sans font-semibold">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-500 font-sans">
        {TYPES.find(t => t.value === type)?.description}
      </p>

      {/* Fields */}
      {type === "live" && (
        <div className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-5">
          <Field label="Titre *" id="live-title">
            <Input id="live-title" value={liveTitle} onChange={setLiveTitle} placeholder="Q&A — La physique derrière les trous de ver" />
          </Field>
          <Field label="Description *" id="live-desc">
            <Textarea id="live-desc" value={liveDesc} onChange={setLiveDesc} placeholder="Session en direct sur…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Spectateurs" id="live-viewers">
              <Input id="live-viewers" value={liveViewers} onChange={setLiveViewers} placeholder="847" type="number" />
            </Field>
            <Field label="Lien" id="live-href">
              <Input id="live-href" value={liveHref} onChange={setLiveHref} placeholder="/live" />
            </Field>
          </div>
          <Field label="Programmé le (optionnel)" id="live-scheduled">
            <Input id="live-scheduled" value={liveScheduled} onChange={setLiveScheduled} type="datetime-local" />
          </Field>
        </div>
      )}

      {type === "news" && (
        <div className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Label" id="news-label">
              <Input id="news-label" value={newsLabel} onChange={setNewsLabel} placeholder="Dernière heure" />
            </Field>
            <Field label="Date de publication" id="news-published">
              <Input id="news-published" value={newsPublished} onChange={setNewsPublished} type="datetime-local" />
            </Field>
          </div>
          <Field label="Titre *" id="news-headline">
            <Input id="news-headline" value={newsHeadline} onChange={setNewsHeadline} placeholder="James Webb confirme la présence d'eau…" />
          </Field>
          <Field label="Corps *" id="news-body">
            <Textarea id="news-body" value={newsBody} onChange={setNewsBody} rows={4} placeholder="Les premières données spectrographiques publiées…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Article lié" id="news-article">
              <ArticlePicker
                selectedSlug={newsArticleSlug}
                selectedTitle={newsArticleTitle}
                onSelect={(slug, title) => {
                  setNewsArticleSlug(slug);
                  setNewsArticleTitle(title);
                  if (!newsCtaLabel) setNewsCtaLabel("Lire l'article");
                }}
              />
            </Field>
            <Field label="CTA — Texte" id="news-cta-label">
              <Input id="news-cta-label" value={newsCtaLabel} onChange={setNewsCtaLabel} placeholder="Lire l'article" />
            </Field>
          </div>
        </div>
      )}

      {type === "player" && (
        <div className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-5">
          <Field label="Titre (optionnel)" id="player-title">
            <Input id="player-title" value={playerTitle} onChange={setPlayerTitle} placeholder="Q&A Live" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Spectateurs" id="player-viewers">
              <Input id="player-viewers" value={playerViewers} onChange={setPlayerViewers} placeholder="847" type="number" />
            </Field>
            <Field label="Durée (rediffusion)" id="player-duration">
              <Input id="player-duration" value={playerDuration} onChange={setPlayerDuration} placeholder="38:24" />
            </Field>
          </div>
          <Field label="Mode" id="player-mode">
            <div className="flex gap-3">
              {(["live", "replay"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPlayerMode(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-sans font-semibold border transition-colors duration-200 ${
                    playerMode === m
                      ? "border-ns-blue bg-ns-blue/5 text-ns-blue"
                      : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
                  }`}
                >
                  {m === "live" ? "En direct" : "Rediffusion"}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Publication…" : "Publier"}
        </button>
        {saved && (
          <p className="text-sm text-green-600 font-sans">Publié — le feed est mis à jour.</p>
        )}
        {error && (
          <p className="text-sm text-red-500 font-sans">{error}</p>
        )}
      </div>
    </div>
  );
}
