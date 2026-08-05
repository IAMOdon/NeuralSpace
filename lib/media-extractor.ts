import axios from "axios";
import * as cheerio from "cheerio";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import {
  BlockedUrlError,
  assertFetchableScheme,
  hostnameOf,
  resolvePublicAddresses,
} from "@/lib/net/publicUrl";

const execFileAsync = promisify(execFile);
const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

export interface ExtractedMedia {
  url: string;
  type: "video" | "image";
  preview?: string;
  filename: string;
  qualities?: Array<{ label: string; value: string; url: string }>;
}

/**
 * Every extractor below issues a server-side request to `pageUrl`, so the
 * address it resolves to is checked once here, at the single entry point,
 * rather than in each branch. Without this, `extractGenericMedia` turned an
 * arbitrary caller URL into an internal port scanner, and `detectPlatform`'s
 * substring matching let `http://10.0.0.5/?x=reddit.com` reach the Reddit
 * branch, which appends `.json` and fetches it.
 *
 * Note this validates the URL the caller supplied. A redirect chain is followed
 * by axios itself and its hops are not revalidated here, so this is a
 * defence-in-depth layer on top of the route's admin-only gate, not a
 * standalone boundary the way the download route's per-hop check is.
 */
export async function extractMediaUrl(pageUrl: string, platform: string): Promise<ExtractedMedia> {
  let parsed: URL;
  try {
    parsed = new URL(pageUrl);
  } catch {
    throw new BlockedUrlError("Format d'URL invalide");
  }
  assertFetchableScheme(parsed);
  await resolvePublicAddresses(hostnameOf(parsed));

  switch (platform.toLowerCase()) {
    case "x":
    case "twitter":
      return await extractTwitterMedia(pageUrl);
    case "instagram":
      return await extractInstagramMedia(pageUrl);
    case "tiktok":
      return await extractTikTokMedia(pageUrl);
    case "reddit":
      return await extractRedditMedia(pageUrl);
    case "youtube":
      return await extractYouTubeMedia(pageUrl);
    default:
      return await extractGenericMedia(pageUrl);
  }
}

async function extractTwitterMedia(url: string): Promise<ExtractedMedia> {
  const tweetIdMatch = url.match(/\/status\/(\d+)/);
  if (!tweetIdMatch) throw new Error("URL X invalide — lien de tweet attendu");
  const tweetId = tweetIdMatch[1];

  // Twitter syndication API — no key, no cost, works without login
  const res = await axios.get(
    `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0&lang=fr`,
    { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 }
  );

  const tweet = res.data;
  const media = tweet.mediaDetails?.[0];
  if (!media) throw new Error("Aucun média trouvé dans ce tweet");

  if (media.type === "video" || media.type === "animated_gif") {
    const variants: { content_type: string; bitrate?: number; url: string }[] =
      media.video_info?.variants ?? [];
    const mp4s = variants
      .filter((v) => v.content_type === "video/mp4")
      .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
    const best = mp4s[0];
    if (!best) throw new Error("Aucune variante MP4 trouvée");
    return {
      url: best.url,
      type: "video",
      preview: media.media_url_https,
      filename: `tweet_${tweetId}.mp4`,
      qualities: mp4s.map((v) => ({
        label: v.bitrate && v.bitrate >= 2_000_000 ? "HD" : v.bitrate && v.bitrate >= 800_000 ? "SD" : "Low",
        value: String(v.bitrate ?? 0),
        url: v.url,
      })),
    };
  }

  if (media.type === "photo") {
    const orig = `${media.media_url_https}?name=orig`;
    return {
      url: orig,
      type: "image",
      preview: media.media_url_https,
      filename: `tweet_${tweetId}.jpg`,
      qualities: [
        { label: "Original", value: "orig", url: orig },
        { label: "Large", value: "large", url: `${media.media_url_https}?name=large` },
      ],
    };
  }

  throw new Error("Type de média non supporté");
}


async function extractInstagramMedia(url: string): Promise<ExtractedMedia> {
  // Instagram posts can be extracted via oEmbed or direct scraping
  // Using instagram's oEmbed endpoint
  const oembedUrl = `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}`;

  const res = await axios.get(oembedUrl, { timeout: 10000 });
  const oembed = res.data;

  if (oembed.thumbnail_url) {
    return {
      url: oembed.thumbnail_url,
      type: "image",
      preview: oembed.thumbnail_url,
      filename: `instagram_${oembed.media_id || "post"}.jpg`,
      qualities: [
        { label: "Original", value: "best", url: oembed.thumbnail_url },
      ],
    };
  }

  throw new Error("No media found in this Instagram post");
}

async function extractTikTokMedia(url: string): Promise<ExtractedMedia> {
  // TikTok is complex - use tikwm.com API
  const videoId = url.match(/(?:vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/@[\w\.]+\/video\/)(\d+)/)?.[1];
  if (!videoId) throw new Error("Invalid TikTok URL");

  const apiUrl = `https://www.tiktok.com/api/post/detail/?aweme_id=${videoId}`;

  const res = await axios.get(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    timeout: 10000,
  }).catch(async () => {
    // Fallback to tikwm API
    return axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`, {
      timeout: 10000,
    });
  });

  const data = res.data;

  // Try to extract video URL from response
  let videoUrl: string | null = null;
  let previewUrl: string | null = null;

  if (data.data?.video?.downloadAddr) {
    videoUrl = data.data.video.downloadAddr;
  } else if (data.video?.playAddr) {
    videoUrl = data.video.playAddr;
  }

  if (data.data?.video?.thumbnail || data.cover) {
    previewUrl = data.data?.video?.thumbnail || data.cover;
  }

  if (!videoUrl) throw new Error("Could not extract TikTok video");

  return {
    url: videoUrl,
    type: "video",
    preview: previewUrl ?? undefined,
    filename: `tiktok_${videoId}.mp4`,
    qualities: [
      { label: "Original", value: "best", url: videoUrl },
    ],
  };
}

async function extractRedditMedia(url: string): Promise<ExtractedMedia> {
  // Reddit - try .json API first
  const jsonUrl = url.endsWith("/") ? `${url}.json` : `${url}.json`;

  const res = await axios.get(jsonUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    timeout: 10000,
  });

  const data = res.data[0]?.data?.children[0]?.data;
  if (!data) throw new Error("Could not parse Reddit post");

  // Check for video
  if (data.media?.reddit_video?.fallback_url) {
    const videoUrl = data.media.reddit_video.fallback_url;
    return {
      url: videoUrl,
      type: "video",
      preview: data.thumbnail,
      filename: `reddit_${data.id}.mp4`,
      qualities: [
        { label: "Original", value: "best", url: videoUrl },
      ],
    };
  }

  // Check for image
  if (data.url_overridden_by_dest && !data.url_overridden_by_dest.includes("reddit.com")) {
    return {
      url: data.url_overridden_by_dest,
      type: "image",
      preview: data.thumbnail,
      filename: `reddit_${data.id}.jpg`,
      qualities: [
        { label: "Original", value: "best", url: data.url_overridden_by_dest },
      ],
    };
  }

  throw new Error("No media found in this Reddit post");
}

interface YtInfo {
  title: string;
  thumbnail: string;
  progressive: Array<{ itag: number; resolution: string; filesize: number | null }>;
  adaptive_video: Array<{ itag: number; resolution: string; filesize: number | null }>;
  best_audio_itag: number | null;
}

async function extractYouTubeMedia(url: string): Promise<ExtractedMedia> {
  const videoId =
    url.match(/[?&]v=([^&\n?#]+)/)?.[1] ??
    url.match(/youtu\.be\/([^?&\n#]+)/)?.[1] ??
    url.match(/\/shorts\/([^?&\n#]+)/)?.[1];

  if (!videoId) throw new Error("URL YouTube invalide");

  let info: YtInfo;
  try {
    const { stdout } = await execFileAsync(
      "python3",
      [path.join(SCRIPTS_DIR, "yt_info.py"), url],
      { timeout: 30000, maxBuffer: 5 * 1024 * 1024 }
    );
    info = JSON.parse(stdout) as YtInfo;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message.slice(0, 120) : "erreur inconnue";
    throw new Error(`Impossible d'analyser cette vidéo YouTube (${msg})`);
  }

  // Build quality list: progressive first (360p combined), then adaptive by resolution
  const qualities: Array<{ label: string; value: string; url: string }> = [];

  // Adaptive qualities (144p → 4K) — value = itag, download route handles muxing
  for (const v of info.adaptive_video) {
    qualities.push({
      label: v.resolution,
      value: String(v.itag),
      url, // original YouTube URL; download route resolves fresh stream at download time
    });
  }

  // Progressive 360p — appended last to avoid hiding it
  for (const p of info.progressive) {
    const exists = qualities.some((q) => q.label === p.resolution);
    if (!exists) {
      qualities.push({
        label: `${p.resolution} (rapide)`,
        value: `progressive_${p.itag}`,
        url,
      });
    }
  }

  return {
    url,
    type: "video",
    preview: info.thumbnail,
    filename: `youtube_${videoId}.mp4`,
    qualities,
  };
}

async function extractGenericMedia(url: string): Promise<ExtractedMedia> {
  // Generic fallback - try to fetch OG tags
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    timeout: 10000,
    maxRedirects: 5,
  });

  const $ = cheerio.load(res.data);

  // Look for OG:video or OG:image
  const ogVideo = $("meta[property='og:video:url'], meta[property='og:video']").attr("content");
  const ogImage = $("meta[property='og:image']").attr("content");
  const ogTitle = $("meta[property='og:title']").attr("content");

  if (ogVideo) {
    return {
      url: ogVideo,
      type: "video",
      preview: ogImage,
      filename: `media_${Date.now()}.mp4`,
      qualities: [
        { label: "Original", value: "best", url: ogVideo },
      ],
    };
  }

  if (ogImage) {
    return {
      url: ogImage,
      type: "image",
      preview: ogImage,
      filename: `media_${Date.now()}.jpg`,
      qualities: [
        { label: "Original", value: "best", url: ogImage },
      ],
    };
  }

  throw new Error("Could not find downloadable media on this page");
}
