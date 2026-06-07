import axios from "axios";
import * as cheerio from "cheerio";

export interface ExtractedMedia {
  url: string;
  type: "video" | "image";
  preview?: string;
  filename: string;
  qualities?: Array<{ label: string; value: string; url: string }>;
}

/**
 * Extract direct download URLs from various social media platforms
 */
export async function extractMediaUrl(pageUrl: string, platform: string): Promise<ExtractedMedia> {
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

async function extractYouTubeMedia(url: string): Promise<ExtractedMedia> {
  // Handle watch, youtu.be, and Shorts URLs
  const videoId =
    url.match(/[?&]v=([^&\n?#]+)/)?.[1] ??
    url.match(/youtu\.be\/([^?&\n#]+)/)?.[1] ??
    url.match(/\/shorts\/([^?&\n#]+)/)?.[1];

  if (!videoId) throw new Error("URL YouTube invalide");

  // Piped API — open-source YouTube proxy, no key, no cost
  const pipedInstances = [
    "https://pipedapi.kavin.rocks",
    "https://piped-api.garudalinux.org",
    "https://api.piped.projectsegfau.lt",
  ];

  let data: any = null;
  for (const instance of pipedInstances) {
    try {
      const res = await axios.get(`${instance}/streams/${videoId}`, { timeout: 8000 });
      data = res.data;
      break;
    } catch {
      continue;
    }
  }

  if (!data) throw new Error("Impossible d'accéder aux métadonnées YouTube (Piped API indisponible)");

  // Filter MP4 video+audio streams (not DASH-only)
  const streams: { url: string; quality: string; format: string; videoOnly?: boolean }[] =
    data.videoStreams ?? [];

  const mp4Streams = streams
    .filter((s) => s.format === "MPEG_4" && !s.videoOnly)
    .sort((a, b) => {
      const q = (s: string) => parseInt(s) || 0;
      return q(b.quality) - q(a.quality);
    });

  if (!mp4Streams.length) throw new Error("Aucun flux MP4 disponible pour cette vidéo");

  const best = mp4Streams[0]!;
  return {
    url: best.url,
    type: "video",
    preview: data.thumbnailUrl,
    filename: `youtube_${videoId}.mp4`,
    qualities: mp4Streams.map((s) => ({
      label: s.quality,
      value: s.quality,
      url: s.url,
    })),
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
