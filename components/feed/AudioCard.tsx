"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, Clock, Headphones } from "lucide-react";

type Props = {
  episodeNumber: number;
  title: string;
  summary: string;
  duration: string;
  categoryName: string;
  categoryColor?: string;
  publishedAt?: string;
  // TODO: cookies integration — track listen events when consent accepted
};

export function AudioCard({
  episodeNumber,
  title,
  summary,
  duration,
  categoryName,
  categoryColor = "#2233f0",
  publishedAt,
}: Props) {
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p) {
        timerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(timerRef.current!);
              return 100;
            }
            return prev + 0.2;
          });
        }, 100);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
      return !p;
    });
  }, []);

  return (
    <article className="group rounded-2xl border border-neutral-100 bg-white p-4 flex gap-4 hover:shadow-lg hover:shadow-black/5 transition-shadow duration-200">

      {/* Play button */}
      <button
        onClick={togglePlay}
        aria-label={playing ? `Pause — ${title}` : `Écouter — ${title}`}
        className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors duration-200 mt-0.5"
        style={{
          backgroundColor: `${categoryColor}18`,
          color: categoryColor,
        }}
      >
        {playing
          ? <Pause className="w-5 h-5" fill="currentColor" />
          : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${categoryColor}18`,
              color: categoryColor,
            }}
          >
            {categoryName}
          </span>
          <span className="text-neutral-300 text-xs">·</span>
          <span className="text-xs text-neutral-400 font-sans flex items-center gap-1">
            <Clock className="w-3 h-3" /> {duration}
          </span>
          {publishedAt && (
            <>
              <span className="text-neutral-300 text-xs hidden sm:inline">·</span>
              <span className="text-xs text-neutral-400 font-sans hidden sm:inline">
                {new Date(publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            </>
          )}
        </div>

        <div className="space-y-0.5">
          <p className="text-[10px] text-neutral-400 font-sans">Épisode #{episodeNumber}</p>
          <h3 className="font-heading font-bold text-[15px] leading-snug text-ns-black group-hover:text-ns-blue transition-colors duration-200 line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-neutral-500 font-sans line-clamp-2 leading-5">
            {summary}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="relative h-1 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%`, backgroundColor: categoryColor }}
            />
          </div>
          {playing && (
            <div className="flex items-center gap-1">
              <Headphones className="w-2.5 h-2.5" style={{ color: categoryColor }} />
              <span className="text-[10px] font-sans" style={{ color: categoryColor }}>
                En cours de lecture
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
