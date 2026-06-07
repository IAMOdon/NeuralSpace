import { NextRequest, NextResponse } from "next/server";

interface DownloadRequest {
  url: string;
  platform: string;
  quality: string;
}

async function downloadMedia(mediaUrl: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(mediaUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://neural-space.ai",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Erreur de téléchargement: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (err) {
    throw new Error("Échec du téléchargement du média");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, platform, quality } = (await request.json()) as DownloadRequest;

    if (!url || !platform) {
      return NextResponse.json(
        { error: "URL ou plateforme manquante" },
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

    // Download the media
    const buffer = await downloadMedia(url);

    // Determine content type and extension
    let contentType = "application/octet-stream";
    let extension = "bin";

    if (url.includes(".mp4") || platform === "youtube" || platform === "tiktok") {
      contentType = "video/mp4";
      extension = "mp4";
    } else if (url.includes(".webm")) {
      contentType = "video/webm";
      extension = "webm";
    } else if (url.includes(".jpg") || url.includes(".jpeg")) {
      contentType = "image/jpeg";
      extension = "jpg";
    } else if (url.includes(".png")) {
      contentType = "image/png";
      extension = "png";
    } else if (url.includes(".gif")) {
      contentType = "image/gif";
      extension = "gif";
    }

    const filename = `media_${Date.now()}.${extension}`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    const message = err instanceof Error ? err.message : "Erreur lors du téléchargement";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
