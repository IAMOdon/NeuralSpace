import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { Readable } from "stream";
import path from "path";
import { getAdminUser } from "@/lib/auth";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
// Override with a newer interpreter (e.g. the .venv-ytdlp venv) to get the
// latest yt-dlp; defaults to system python3.
const PYTHON_BIN = process.env.YTDLP_PYTHON ?? "python3";
// yt-dlp needs deno (JS challenge solver) and ffmpeg on PATH.
const SPAWN_ENV = {
  ...process.env,
  PATH: `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH ?? ""}`,
};

interface DownloadRequest {
  url: string;
  quality: string;
  type?: "video" | "image";
  filename?: string;
}

function contentTypeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "mp4": return "video/mp4";
    case "webm": return "video/webm";
    case "mp3": return "audio/mpeg";
    case "m4a": return "audio/mp4";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    case "webp": return "image/webp";
    case "gif": return "image/gif";
    default: return "application/octet-stream";
  }
}

function replaceExt(filename: string, ext: string): string {
  return filename.replace(/\.[^.]+$/, "") + "." + ext;
}

// Client-supplied filename ends up in a quoted Content-Disposition header —
// strip quotes, control chars and path separators to prevent header injection.
function sanitizeFilename(name: string): string {
  const clean = name.replace(/["\\/\u0000-\u001f]/g, "").trim();
  return clean || `media_${Date.now()}.mp4`;
}

export async function POST(request: NextRequest) {
  // Outil interne — spawn yt-dlp côté serveur, jamais exposé publiquement.
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { url, quality, type, filename } = (await request.json()) as DownloadRequest;

    if (!url) {
      return NextResponse.json({ error: "URL manquante" }, { status: 400 });
    }
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Format d'URL invalide" }, { status: 400 });
    }

    const format = quality || "best";

    // Resolve the output extension / content-type before streaming.
    let outName = sanitizeFilename(filename || `media_${Date.now()}.mp4`);
    let contentType: string;
    if (format === "audio") {
      outName = replaceExt(outName, "mp3");
      contentType = "audio/mpeg";
    } else if (type === "image" || format === "image") {
      const ext = (outName.split(".").pop() || "jpg").toLowerCase();
      contentType = contentTypeForExt(ext);
    } else {
      outName = replaceExt(outName, "mp4");
      contentType = "video/mp4";
    }

    // Spawn yt-dlp (via media_download.py) and stream its stdout straight to the client.
    const child = spawn(
      /*turbopackIgnore: true*/
      PYTHON_BIN,
      [path.join(SCRIPTS_DIR, "media_download.py"), url, format],
      { stdio: ["ignore", "pipe", "pipe"], env: SPAWN_ENV }
    );

    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > 4000) stderr = stderr.slice(-4000);
    });
    child.on("error", (e) => console.error("[media_download spawn]", e));
    child.on("close", (code) => {
      if (code !== 0) console.error(`[media_download] exit ${code}:`, stderr.slice(-600));
    });

    const stream = Readable.toWeb(child.stdout) as ReadableStream<Uint8Array>;

    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${outName}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    const message = err instanceof Error ? err.message : "Erreur lors du téléchargement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
