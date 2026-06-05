import Link from "next/link";
import { Radio, Users, Clock, Zap } from "lucide-react";
import { LivePlayer } from "@/components/live/LivePlayer";

// TODO: cookies integration — track hero clicks and player engagement when consent accepted

// ── Config type — driven from admin panel via hero_config Supabase table ──────
export type HeroConfig =
  | { type: "none" }
  | {
      type: "live";
      title: string;
      description: string;
      viewers?: number;
      scheduledAt?: string; // ISO — if set, shows "À venir" instead of LIVE
      href?: string;
    }
  | {
      type: "news";
      label?: string;       // defaults to "Dernière heure"
      headline: string;
      body: string;
      publishedAt?: string; // ISO
      cta?: { label: string; href: string };
    }
  | {
      type: "player";
      title?: string;
      viewers?: number;
      mode?: "live" | "replay";
      duration?: string;
    };

// ── Variants ──────────────────────────────────────────────────────────────────

function LiveVariant({ config }: { config: Extract<HeroConfig, { type: "live" }> }) {
  const isLive = !config.scheduledAt;
  const href = config.href ?? "/live";

  return (
    <section aria-label="Session en direct">
      <Link
        href={href}
        className="group block rounded-2xl overflow-hidden bg-ns-black focus-visible:outline-2 focus-visible:outline-ns-blue focus-visible:outline-offset-2"
      >
        <div className="flex flex-col md:flex-row min-h-[220px] md:min-h-[260px]">

          {/* Left — info */}
          <div className="flex-1 p-6 md:p-10 flex flex-col justify-between gap-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-ns-blue/20 blur-3xl pointer-events-none" />
            <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full bg-ns-blue/10 blur-2xl pointer-events-none" />

            <div className="relative space-y-4">
              {/* Badge */}
              <div className="flex items-center gap-3 flex-wrap">
                {isLive ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-sans font-bold text-white uppercase tracking-widest">
                      Live
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ns-blue/30 border border-ns-blue/40">
                    <Clock className="w-3 h-3 text-white/80" />
                    <span className="text-[10px] font-sans font-bold text-white uppercase tracking-widest">
                      À venir
                    </span>
                  </div>
                )}
                {config.viewers !== undefined && isLive && (
                  <span className="flex items-center gap-1.5 text-xs text-white/50 font-sans">
                    <Users className="w-3.5 h-3.5" />
                    {config.viewers.toLocaleString("fr-FR")} spectateurs
                  </span>
                )}
                {config.scheduledAt && (
                  <span className="text-xs text-white/40 font-sans">
                    {new Date(config.scheduledAt).toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {/* Title + description */}
              <div className="space-y-2">
                <h2 className="font-heading font-black text-2xl md:text-3xl text-white leading-tight group-hover:text-white/90 transition-colors duration-200">
                  {config.title}
                </h2>
                <p className="text-sm md:text-base text-white/60 font-sans leading-6 max-w-lg">
                  {config.description}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-ns-black text-sm font-sans font-semibold group-hover:opacity-90 transition-opacity duration-200">
                {isLive ? "Rejoindre le live" : "Me rappeler"}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right — video preview */}
          <div className="relative md:w-80 lg:w-96 aspect-video md:aspect-auto bg-gradient-to-br from-ns-blue/20 to-ns-black flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-ns-black/60 hidden md:block" />
            <div className="relative z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            {/* Neural Space Live label */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 z-10">
              <Radio className="w-3 h-3 text-ns-blue" />
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

function NewsVariant({ config }: { config: Extract<HeroConfig, { type: "news" }> }) {
  const label   = config.label ?? "Dernière heure";
  const inner = (
    <div className="rounded-2xl overflow-hidden border border-neutral-100 bg-white">
      <div className="flex">
        {/* Left accent bar */}
        <div className="w-1 bg-ns-blue shrink-0" />

        <div className="flex-1 p-6 md:p-8 space-y-4">
          {/* Label + time */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-ns-blue" fill="#2233f0" />
              <span className="text-[10px] font-sans font-bold text-ns-blue uppercase tracking-widest">
                {label}
              </span>
            </div>
            {config.publishedAt && (
              <span className="text-xs text-neutral-400 font-sans">
                {new Date(config.publishedAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            )}
          </div>

          {/* Headline */}
          <h2 className="font-heading font-black text-2xl md:text-3xl text-ns-black leading-tight">
            {config.headline}
          </h2>

          {/* Body */}
          <p className="text-sm md:text-base text-neutral-600 font-sans leading-7 max-w-2xl">
            {config.body}
          </p>

          {/* CTA */}
          {config.cta && (
            <div>
              <Link
                href={config.cta.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-80 transition-opacity duration-200"
              >
                {config.cta.label}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return <section aria-label="Actualité">{inner}</section>;
}

function PlayerVariant({ config }: { config: Extract<HeroConfig, { type: "player" }> }) {
  return (
    <section aria-label="Lecteur live">
      <LivePlayer
        mode={config.mode ?? "live"}
        title={config.title}
        viewers={config.viewers}
        duration={config.duration}
      />
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function HeroBlock({ config }: { config: HeroConfig }) {
  if (config.type === "none") return null;
  if (config.type === "live")   return <LiveVariant config={config} />;
  if (config.type === "news")   return <NewsVariant config={config} />;
  if (config.type === "player") return <PlayerVariant config={config} />;
}
