import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { extractMediaUrl } from "@/lib/media-extractor";
import type { MediaInfo, MediaPlatform } from "@/types/media";

// Platform detection patterns
function detectPlatform(url: string): MediaPlatform {
  const urlLower = url.toLowerCase();
  if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) return "x";
  if (urlLower.includes("instagram.com")) return "instagram";
  if (urlLower.includes("tiktok.com")) return "tiktok";
  if (urlLower.includes("threads.net")) return "threads";
  if (urlLower.includes("reddit.com")) return "reddit";
  if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) return "youtube";
  if (urlLower.includes("facebook.com") || urlLower.includes("fb.com")) return "facebook";
  if (urlLower.includes("pinterest.com")) return "pinterest";
  if (urlLower.includes("snapchat.com")) return "snapchat";
  if (urlLower.includes("vimeo.com")) return "vimeo";
  if (urlLower.includes("dailymotion.com")) return "dailymotion";
  if (urlLower.includes("twitch.tv")) return "twitch";
  return "unknown";
}

export async function POST(request: NextRequest) {
  // Outil interne — spawn yt-dlp côté serveur, jamais exposé publiquement.
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL invalide fournie" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Format d'URL invalide" },
        { status: 400 }
      );
    }

    const platform = detectPlatform(url);

    // Extract real media URL
    const extracted = await extractMediaUrl(url, platform);

    const media: MediaInfo = {
      platform,
      type: extracted.type,
      preview: extracted.preview,
      filename: extracted.filename,
      qualities: extracted.qualities,
      directUrl: extracted.url,
      author: extracted.author,
      duration: extracted.duration,
    };

    return NextResponse.json({ media });
  } catch (err) {
    console.error("Media analysis error:", err);
    const message = err instanceof Error ? err.message : "Erreur lors de l'analyse du média";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
