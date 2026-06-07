import { NextRequest, NextResponse } from "next/server";

interface DownloadRequest {
  url: string;
  platform: string;
  quality: string;
}

function refererFor(platform: string): string {
  switch (platform.toLowerCase()) {
    case "x":
    case "twitter": return "https://twitter.com/";
    case "instagram": return "https://www.instagram.com/";
    case "tiktok": return "https://www.tiktok.com/";
    case "reddit": return "https://www.reddit.com/";
    case "youtube": return "https://www.youtube.com/";
    default: return "https://neural-space.ai/";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, platform, quality } = (await request.json()) as DownloadRequest;

    if (!url || !platform) {
      return NextResponse.json({ error: "URL ou plateforme manquante" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Format d'URL invalide" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": refererFor(platform),
        "Origin": refererFor(platform).replace(/\/$/, ""),
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Le serveur distant a refusé la requête (${response.status} ${response.statusText})` },
        { status: 502 }
      );
    }

    // Prefer content-type from response, fall back to URL/platform detection
    const remoteType = response.headers.get("content-type") ?? "";
    let contentType = (remoteType.split(";")[0] ?? "").trim() || "application/octet-stream";
    let extension = (parsed.pathname.split(".").pop() ?? "bin").split("?")[0];

    if (!remoteType) {
      if (url.includes(".mp4") || platform === "youtube" || platform === "tiktok") {
        contentType = "video/mp4"; extension = "mp4";
      } else if (url.includes(".webm")) {
        contentType = "video/webm"; extension = "webm";
      } else if (url.includes(".jpg") || url.includes(".jpeg")) {
        contentType = "image/jpeg"; extension = "jpg";
      } else if (url.includes(".png")) {
        contentType = "image/png"; extension = "png";
      }
    }

    const filename = `media_${Date.now()}.${extension}`;

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    const message = err instanceof Error ? err.message : "Erreur lors du téléchargement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
