import { NextRequest, NextResponse } from "next/server";
import { extractMediaUrl } from "@/lib/media-extractor";
import { getAdminUser } from "@/lib/auth/admin";
import type { MediaInfo } from "@/types/media";

// Platform detection patterns
function detectPlatform(url: string): string {
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
  try {
    // This route makes the server fetch a caller-supplied URL, so it is
    // admin-only. The proxy matcher guards it too; this check is here because
    // middleware must never be the sole boundary.
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
    }

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
      platform: platform as any,
      type: extracted.type,
      preview: extracted.preview,
      filename: extracted.filename,
      qualities: extracted.qualities,
      directUrl: extracted.url,
    };

    return NextResponse.json({ media });
  } catch (err) {
    // The raw message leaked transport detail ("connect ECONNREFUSED
    // 127.0.0.1:8080", "getaddrinfo ENOTFOUND ..."), which turned this route
    // into a network-probing oracle. Details stay in the logs.
    console.error("Media analysis error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse du média" },
      { status: 500 }
    );
  }
}
