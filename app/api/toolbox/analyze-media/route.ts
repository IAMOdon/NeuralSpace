import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

// Extract media info from various platforms using oembed/metadata
async function fetchMediaInfo(url: string, platform: string): Promise<MediaInfo> {
  try {
    // Try extracting metadata from the URL
    // This is a placeholder - real implementation would use platform-specific APIs
    
    // For now, we'll use a fallback approach with basic detection
    const mediaInfo: MediaInfo = {
      platform: platform as any,
      type: "unknown",
      preview: undefined,
      filename: `media_${Date.now()}`,
    };

    // Try to fetch page metadata
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    }).catch(() => null);

    if (pageRes && pageRes.ok) {
      const html = await pageRes.text();

      // Extract OG tags for preview
      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      const ogVideoMatch = html.match(/<meta\s+property=["']og:video:url["']\s+content=["']([^"']+)["']/i);
      const ogVideoSecureMatch = html.match(/<meta\s+property=["']og:video:secure_url["']\s+content=["']([^"']+)["']/i);
      const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);

      if (ogVideoMatch || ogVideoSecureMatch) {
        mediaInfo.type = "video";
        mediaInfo.preview = ogVideoSecureMatch ? ogVideoSecureMatch[1] : ogVideoMatch?.[1];
      } else if (ogImageMatch) {
        mediaInfo.type = "image";
        mediaInfo.preview = ogImageMatch[1];
      }

      if (titleMatch) {
        mediaInfo.author = titleMatch[1];
      }

      // Platform-specific quality options
      mediaInfo.qualities = getQualityOptions(platform, mediaInfo.type);
    }

    return mediaInfo;
  } catch (err) {
    return {
      platform: platform as any,
      type: "unknown",
      preview: undefined,
      filename: `media_${Date.now()}`,
      qualities: getQualityOptions(platform, "unknown"),
    };
  }
}

function getQualityOptions(platform: string, mediaType: string) {
  const commonVideoQualities = [
    { label: "4K", value: "4k" },
    { label: "1080p", value: "1080p" },
    { label: "720p", value: "720p" },
    { label: "480p", value: "480p" },
  ];

  const commonImageQualities = [
    { label: "Original", value: "original" },
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
  ];

  if (mediaType === "video") return commonVideoQualities;
  if (mediaType === "image") return commonImageQualities;
  return commonVideoQualities;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const platform = detectPlatform(url);
    const media = await fetchMediaInfo(url, platform);

    return NextResponse.json({ media });
  } catch (err) {
    console.error("Media analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze media. Please check the URL and try again." },
      { status: 500 }
    );
  }
}
