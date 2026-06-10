import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);
const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
// Override with a newer interpreter (e.g. the .venv-ytdlp venv) to get the
// latest yt-dlp; defaults to the bundled venv, then system python3.
const PYTHON_BIN = process.env.YTDLP_PYTHON ?? "python3";
// yt-dlp needs deno (JS challenge solver) and ffmpeg on PATH — make sure the
// common Homebrew bin dirs are present for the spawned process.
const SPAWN_ENV = {
  ...process.env,
  PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH ?? ""}`,
};

export interface ExtractedMedia {
  url: string;
  type: "video" | "image";
  preview?: string;
  filename: string;
  qualities?: Array<{ label: string; value: string; url: string }>;
  author?: string;
  duration?: string;
}

interface MediaInfoJson {
  title: string | null;
  thumbnail: string | null;
  uploader: string | null;
  duration: number | null;
  type: "video" | "image";
  ext: string;
  id: string | null;
  qualities: Array<{ label: string; value: string }>;
}

function formatDuration(seconds: number | null): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/**
 * Extract media metadata + download options from any supported platform.
 * Everything is routed through yt-dlp (scripts/media_info.py), which supports
 * YouTube, X/Twitter, Instagram, TikTok, Reddit, Facebook, Vimeo, Dailymotion,
 * Twitch, Pinterest, Threads and ~1800 other sites.
 *
 * `platform` is kept for the filename prefix only — yt-dlp auto-detects the site.
 */
export async function extractMediaUrl(pageUrl: string, platform: string): Promise<ExtractedMedia> {
  let info: MediaInfoJson;
  try {
    const { stdout } = await execFileAsync(
      PYTHON_BIN,
      [path.join(SCRIPTS_DIR, "media_info.py"), pageUrl],
      { timeout: 60000, maxBuffer: 10 * 1024 * 1024, env: SPAWN_ENV }
    );
    info = JSON.parse(stdout) as MediaInfoJson;
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : String(err);
    throw new Error(cleanYtError(raw));
  }

  const prefix = platform && platform !== "unknown" ? platform : "media";
  const id = info.id ?? Date.now();
  const filename = `${prefix}_${id}.${info.ext}`;

  // Each quality carries the original page URL — the download route re-runs
  // yt-dlp with the quality's format selector, so it never relies on a single
  // (often short-lived) direct stream URL.
  const qualities = (info.qualities ?? []).map((q) => ({
    label: q.label,
    value: q.value,
    url: pageUrl,
  }));

  return {
    url: pageUrl,
    type: info.type,
    preview: info.thumbnail ?? undefined,
    filename,
    qualities,
    author: info.uploader ?? undefined,
    duration: formatDuration(info.duration),
  };
}

/** Pull a human-readable reason out of a noisy yt-dlp/python stderr dump. */
function cleanYtError(raw: string): string {
  if (/Unsupported URL|is not a valid URL/i.test(raw))
    return "Lien non supporté ou invalide.";
  if (/Private video|This video is private/i.test(raw))
    return "Ce contenu est privé.";
  if (/login required|logged-in|Sign in|authentication|credentials|cookies|rate-limit|429/i.test(raw))
    return "Cette plateforme exige une connexion pour ce contenu (ou yt-dlp doit être mis à jour).";
  if (/Video unavailable|not available|404/i.test(raw))
    return "Média introuvable ou supprimé.";
  if (/No video formats|Unable to extract|no media/i.test(raw))
    return "Aucun média téléchargeable trouvé sur cette page.";
  return "Impossible d'analyser ce média. Vérifiez le lien et réessayez.";
}
