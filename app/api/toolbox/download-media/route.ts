import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface DownloadRequest {
  url: string;
  platform: string;
  quality: string;
}

async function downloadFromPlatform(url: string, platform: string, quality: string): Promise<ArrayBuffer> {
  // This is a placeholder implementation
  // In production, you would use platform-specific APIs or libraries
  // such as yt-dlp for YouTube, instagrapi for Instagram, etc.
  
  // For now, we'll fetch the direct media URL
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (err) {
    throw new Error("Failed to download media from URL");
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { url, platform, quality } = (await request.json()) as DownloadRequest;

    if (!url || !platform) {
      return NextResponse.json(
        { error: "Missing URL or platform" },
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

    // Download the media
    const buffer = await downloadFromPlatform(url, platform, quality || "best");

    // Determine content type
    const contentType = platform === "youtube" || url.includes(".mp4") ? "video/mp4" : "image/jpeg";
    const filename = `media_${Date.now()}.${platform === "youtube" || contentType.includes("video") ? "mp4" : "jpg"}`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Download failed" },
      { status: 500 }
    );
  }
}
