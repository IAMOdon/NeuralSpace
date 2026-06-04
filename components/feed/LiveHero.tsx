import Link from "next/link";
import { Radio, Users, Clock } from "lucide-react";

// TODO: cookies integration — track click-through to live session when consent accepted

type Props = {
  title: string;
  description: string;
  viewers?: number;
  scheduledAt?: string;  // ISO date — if in future, shows scheduled badge
  href?: string;
};

export function LiveHero({
  title,
  description,
  viewers,
  scheduledAt,
  href = "/live",
}: Props) {
  const isLive = !scheduledAt;

  return (
    <section aria-label="Session en direct">
      <Link
        href={href}
        className="group block rounded-2xl overflow-hidden border border-ns-blue/20 bg-ns-black focus-visible:outline-2 focus-visible:outline-ns-blue focus-visible:outline-offset-2"
      >
        <div className="flex flex-col md:flex-row">

          {/* Thumbnail area */}
          <div className="relative md:w-96 aspect-video md:aspect-auto bg-gradient-to-br from-ns-blue/30 via-neutral-900 to-ns-black flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ns-black/50 hidden md:block" />

            {/* Play button */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>

            {/* Live / Scheduled badge */}
            <div className="absolute top-3 left-3 z-10">
              {isLive ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest">
                    Live
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ns-blue/80 text-white backdrop-blur-sm">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest">
                    À venir
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 p-5 md:p-6 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-ns-blue" />
              <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-ns-blue">
                Neural Space Live
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-heading font-bold text-lg md:text-xl text-white leading-snug group-hover:text-white/90 transition-colors duration-200">
                {title}
              </h2>
              <p className="text-sm text-white/60 font-sans leading-6 line-clamp-2">
                {description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ns-blue text-white text-xs font-sans font-semibold group-hover:opacity-90 transition-opacity w-fit">
                {isLive ? "Rejoindre le live" : "Me rappeler"}
              </div>

              {viewers !== undefined && isLive && (
                <span className="flex items-center gap-1 text-xs text-white/40 font-sans">
                  <Users className="w-3.5 h-3.5" />
                  {viewers.toLocaleString("fr-FR")} spectateurs
                </span>
              )}

              {scheduledAt && (
                <span className="text-xs text-white/40 font-sans">
                  {new Date(scheduledAt).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
