"use client";

import { useState } from "react";
import { Download, Loader2, AlertCircle, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import type { MediaInfo } from "@/types/media";

export function MediaDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleAnalyze() {
    setError(null);
    setMediaInfo(null);
    
    if (!url.trim()) {
      setError("Veuillez entrer une URL valide");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/toolbox/analyze-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'analyse du média");

      setMediaInfo(data.media);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse de l'URL");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(quality?: string) {
    if (!mediaInfo) return;
    
    setDownloading(true);
    try {
      const res = await fetch("/api/toolbox/download-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: (quality
            ? mediaInfo.qualities?.find((q) => q.value === quality)?.url
            : undefined) ?? mediaInfo.directUrl ?? url.trim(),
          platform: mediaInfo.platform,
          quality: quality || "best",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors du téléchargement");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = mediaInfo.filename || `media.${mediaInfo.type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du téléchargement");
    } finally {
      setDownloading(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
      {/* Input section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-ns-black">
          URL du média
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Collez le lien depuis X, Instagram, TikTok, Threads, Reddit, YouTube, etc."
            className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm placeholder-neutral-400 focus:outline-none focus:border-ns-blue transition-colors"
          />
          <button
            onClick={copyUrl}
            className="px-3 py-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            title="Copier l'URL"
          >
            <Copy className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!url.trim() || loading}
        className="w-full px-4 py-3 rounded-xl bg-ns-blue text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyse en cours...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Analyser le média
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="flex gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* Media preview and info */}
      {mediaInfo && (
        <div className="space-y-4 pt-4 border-t border-neutral-200">
          {/* Preview */}
          {mediaInfo.preview && (
            <div className="relative bg-neutral-100 rounded-xl overflow-hidden">
              {mediaInfo.type === "video" && mediaInfo.directUrl ? (
                <video
                  src={mediaInfo.directUrl}
                  poster={mediaInfo.preview}
                  controls
                  className="w-full h-auto max-h-96"
                />
              ) : (
                <>
                  <img
                    src={mediaInfo.preview}
                    alt="Aperçu du média"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  {mediaInfo.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Media info */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-400 uppercase">Plateforme</p>
              <p className="text-sm font-semibold text-ns-black">{mediaInfo.platform}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-400 uppercase">Type</p>
              <p className="text-sm font-semibold text-ns-black capitalize">{mediaInfo.type === "video" ? "Vidéo" : mediaInfo.type === "image" ? "Image" : mediaInfo.type}</p>
            </div>
            {mediaInfo.duration && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-400 uppercase">Durée</p>
                <p className="text-sm font-semibold text-ns-black">{mediaInfo.duration}</p>
              </div>
            )}
            {mediaInfo.dimensions && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-400 uppercase">Dimensions</p>
                <p className="text-sm font-semibold text-ns-black">{mediaInfo.dimensions}</p>
              </div>
            )}
            {mediaInfo.author && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-400 uppercase">Auteur</p>
                <p className="text-sm font-semibold text-ns-black truncate">{mediaInfo.author}</p>
              </div>
            )}
            {mediaInfo.size && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-400 uppercase">Taille</p>
                <p className="text-sm font-semibold text-ns-black">{mediaInfo.size}</p>
              </div>
            )}
          </div>

          {/* Quality options */}
          {mediaInfo.qualities && mediaInfo.qualities.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-ns-black">Qualités disponibles</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {mediaInfo.qualities.map((q) => (
                  <button
                    key={q.value}
                    onClick={() => handleDownload(q.value)}
                    disabled={downloading}
                    className="px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-ns-blue hover:text-white hover:border-ns-blue transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Download button */}
          <button
            onClick={() => handleDownload()}
            disabled={downloading}
            className="w-full px-4 py-3 rounded-xl bg-ns-blue text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Téléchargement en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Télécharger en meilleure qualité
              </>
            )}
          </button>

          {/* Source link */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-ns-blue hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir l'original
          </a>
        </div>
      )}

      {/* Supported platforms info */}
      {!mediaInfo && (
        <div className="pt-4 border-t border-neutral-200 space-y-3">
          <p className="text-sm font-semibold text-neutral-600">Plateformes supportées</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              "X / Twitter",
              "Instagram",
              "TikTok",
              "Threads",
              "Reddit",
              "YouTube",
              "Facebook",
              "Pinterest",
              "Snapchat",
              "Vimeo",
              "Dailymotion",
              "Twitch"
            ].map((platform) => (
              <div
                key={platform}
                className="px-3 py-2 rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-600"
              >
                {platform}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
