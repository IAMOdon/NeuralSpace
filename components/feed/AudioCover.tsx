"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause } from "lucide-react";

// TODO: cookies integration — track listen events when consent accepted

type Props = {
  episodeNumber: number;
  title: string;
  duration: string;
  categoryName: string;
  categoryColor?: string;
  publishedAt?: string;
};

export function AudioCover({
  episodeNumber,
  title,
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

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPlaying((p) => {
      if (!p) {
        timerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) { clearInterval(timerRef.current!); return 100; }
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
    <article
      className="group flex flex-col rounded-2xl overflow-hidden border border-neutral-100 bg-white hover:shadow-lg hover:shadow-black/5 transition-shadow duration-200 aspect-[2/3]"
    >
      {/* Cover area — top 2/3 */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${categoryColor}22 0%, ${categoryColor}08 100%)` }}
      >
        {/* Decorative waveform bars */}
        <div className="absolute bottom-6 left-0 right-0 flex items-end justify-center gap-[3px] px-6 opacity-20">
          {[4, 8, 14, 10, 18, 12, 22, 16, 10, 20, 14, 8, 18, 12, 6, 16, 10, 20, 8, 14].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full shrink-0"
              style={{
                height: `${h * (progress > 0 ? 1 : 0.6)}px`,
                backgroundColor: categoryColor,
                opacity: i / 20 <= progress / 100 ? 1 : 0.4,
              }}
            />
          ))}
        </div>

        {/* Episode badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-1 rounded-full"
            style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
          >
            #{episodeNumber}
          </span>
        </div>

        {/* Duration badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-sans text-neutral-400 font-medium">
            {duration}
          </span>
        </div>

        {/* Play button */}
        <button
          onClick={togglePlay}
          aria-label={playing ? `Pause l'épisode: ${title}` : `Écouter l'épisode: ${title}`}
          className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
          style={{ backgroundColor: categoryColor }}
        >
          {playing
            ? <Pause className="w-5 h-5 text-white" fill="white" />
            : <Play  className="w-5 h-5 text-white ml-0.5" fill="white" />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-neutral-100 relative">
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-100"
          style={{ width: `${progress}%`, backgroundColor: categoryColor }}
        />
      </div>

      {/* Info — bottom */}
      <div className="p-3 space-y-1 shrink-0">
        <span
          className="text-[9px] font-sans font-semibold uppercase tracking-widest"
          style={{ color: categoryColor }}
        >
          {categoryName}
        </span>
        <p className="font-heading font-bold text-[13px] leading-snug text-ns-black line-clamp-2 group-hover:text-ns-blue transition-colors duration-200">
          {title}
        </p>
        {publishedAt && (
          <p className="text-[10px] text-neutral-400 font-sans">
            {new Date(publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </p>
        )}
      </div>
    </article>
  );
}
