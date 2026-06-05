import Image from "next/image";
import Link from "next/link";
import { Radio, Users, Clock, Zap } from "lucide-react";
import { LivePlayer } from "@/components/live/LivePlayer";

// TODO: cookies integration — track hero clicks and player engagement when consent accepted

export type HeroConfig =
  | { type: "none" }
  | {
      type: "live";
      title: string;
      description: string;
      viewers?: number;
      scheduledAt?: string;
      href?: string;
      imageUrl?: string;
    }
  | {
      type: "news";
      label?: string;
      headline: string;
      body: string;
      publishedAt?: string;
      articleSlug?: string;
      cta?: { label: string; href: string };
    }
  | {
      type: "player";
      title?: string;
      viewers?: number;
      mode?: "live" | "replay";
      duration?: string;
    };

// ── Live ─────────────────────────────────────────────────────────────────────

function LiveVariant({ config }: { config: Extract<HeroConfig, { type: "live" }> }) {
  const isLive = !config.scheduledAt;
  const href   = config.href ?? "/live";

  return (
    <section aria-label="Session en direct" className="w-full bg-ns-black">
      <Link
        href={href}
        className="group block focus-visible:outline-2 focus-visible:outline-ns-blue focus-visible:outline-offset-2"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col md:flex-row gap-10 md:gap-16 items-center">

          {/* Left — content */}
          <div className="flex-1 space-y-6 relative">
            <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-ns-blue/15 blur-3xl pointer-events-none" />

            <div className="relative space-y-5">
              {/* Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                {isLive ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-sans font-bold text-white uppercase tracking-widest">En direct</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                    <Clock className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-xs font-sans font-bold text-white uppercase tracking-widest">À venir</span>
                  </div>
                )}
                {config.viewers !== undefined && isLive && (
                  <span className="flex items-center gap-1.5 text-sm text-white/40 font-sans">
                    <Users className="w-4 h-4" />
                    {config.viewers.toLocaleString("fr-FR")} spectateurs
                  </span>
                )}
                {config.scheduledAt && (
                  <span className="text-sm text-white/40 font-sans">
                    {new Date(config.scheduledAt).toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-heading font-black text-3xl md:text-5xl text-white leading-tight group-hover:text-white/90 transition-colors duration-200">
                {config.title}
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-white/50 font-sans leading-7 max-w-xl whitespace-pre-line">
                {config.description}
              </p>

              {/* CTA */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-ns-black text-sm font-sans font-bold group-hover:opacity-90 transition-opacity duration-200">
                  {isLive ? "Rejoindre le live" : "Me rappeler"}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Right — image or gradient preview */}
          <div className="w-full md:w-[420px] lg:w-[500px] shrink-0 aspect-video relative rounded-2xl overflow-hidden bg-gradient-to-br from-ns-blue/20 to-ns-black/80">
            {config.imageUrl ? (
              <Image
                src={config.imageUrl}
                alt={config.title}
                fill
                unoptimized
                className="object-cover opacity-80"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-ns-blue/20 via-neutral-900/50 to-ns-black" />
            )}
            {/* Play overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
            </div>
            {/* Label */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-ns-blue" />
              <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-white/50">
                Neural Space Live
              </span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

// ── News ─────────────────────────────────────────────────────────────────────

function NewsVariant({ config }: { config: Extract<HeroConfig, { type: "news" }> }) {
  const label = config.label ?? "Dernière heure";
  const href  = config.articleSlug ? `/${config.articleSlug}` : config.cta?.href;

  const content = (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="border-l-[3px] border-ns-blue pl-5 md:pl-8 max-w-3xl space-y-3">

        {/* Label + time */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-ns-blue" fill="#2233f0" />
            <span className="text-[10px] font-sans font-bold text-ns-blue uppercase tracking-widest">{label}</span>
          </div>
          {config.publishedAt && (
            <span className="text-xs text-neutral-400 font-sans">
              {new Date(config.publishedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {/* Headline */}
        <h2 className="font-heading font-black text-2xl md:text-4xl text-ns-black leading-tight break-words">
          {config.headline}
        </h2>

        {/* Body */}
        <p className="text-sm md:text-base text-neutral-500 font-sans leading-relaxed break-words whitespace-pre-line">
          {config.body}
        </p>

        {/* CTA */}
        {(config.cta || config.articleSlug) && (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-ns-blue group-hover:opacity-70 transition-opacity duration-200">
              {config.cta?.label ?? "Lire l'article"}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section aria-label="Actualité" className="w-full overflow-hidden bg-white border-b border-neutral-100">
      {href ? (
        <Link href={href} className="group block focus-visible:outline-2 focus-visible:outline-ns-blue focus-visible:outline-offset-2">
          {content}
        </Link>
      ) : content}
    </section>
  );
}

// ── Player ────────────────────────────────────────────────────────────────────

function PlayerVariant({ config }: { config: Extract<HeroConfig, { type: "player" }> }) {
  return (
    <section aria-label="Lecteur live" className="w-full bg-ns-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <LivePlayer
          mode={config.mode ?? "live"}
          title={config.title}
          viewers={config.viewers}
          duration={config.duration}
        />
      </div>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function HeroBlock({ config }: { config: HeroConfig }) {
  if (config.type === "none")   return null;
  if (config.type === "live")   return <LiveVariant config={config} />;
  if (config.type === "news")   return <NewsVariant config={config} />;
  if (config.type === "player") return <PlayerVariant config={config} />;
}
