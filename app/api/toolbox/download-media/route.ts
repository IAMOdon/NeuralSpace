import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { spawn } from "child_process";
import { Readable } from "stream";
import path from "path";
import http from "http";
import https from "https";
import type dns from "dns";
import {
  BlockedUrlError,
  RemoteFetchError,
  assertFetchableScheme,
  hostnameOf,
  pinnedLookup,
  resolvePublicAddresses,
} from "@/lib/net/publicUrl";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

// matches the fetch spec limit the previous transport used, so no redirect chain
// that worked before is refused now — every hop is revalidated regardless
const MAX_REDIRECTS = 20;
const HEADERS_TIMEOUT_MS = 30_000;
const BODY_IDLE_TIMEOUT_MS = 300_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

interface DownloadRequest {
  url: string;
  platform: string;
  quality: string;
}

function requestOnce(
  target: URL,
  headers: http.OutgoingHttpHeaders,
  addresses: dns.LookupAddress[]
): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const secure = target.protocol === "https:";
    const hostname = hostnameOf(target);
    const lookup = pinnedLookup(hostname, addresses);
    const options: https.RequestOptions = {
      protocol: target.protocol,
      hostname,
      port: target.port || (secure ? 443 : 80),
      path: `${target.pathname}${target.search}`,
      method: "GET",
      headers,
      lookup,
      // dedicated, non-pooled agent so the pinned lookup can never be bypassed
      // by a socket some other request left in a shared pool
      agent: secure ? new https.Agent({ keepAlive: false, lookup }) : new http.Agent({ keepAlive: false, lookup }),
    };
    const onResponse = (response: http.IncomingMessage) => {
      clearTimeout(headersDeadline);
      resolve(response);
    };
    const request = secure ? https.request(options, onResponse) : http.request(options, onResponse);
    // hard deadline on connect + TLS + headers: a socket idle timer alone never fires
    // while a SYN to a black-holed address is still pending
    const headersDeadline = setTimeout(
      () => request.destroy(new RemoteFetchError("Le serveur distant ne répond pas")),
      HEADERS_TIMEOUT_MS
    );
    // inactivity cap for the rest of the exchange: a large download that keeps
    // progressing is never cut short, a stalled one is
    request.setTimeout(BODY_IDLE_TIMEOUT_MS);
    request.on("timeout", () => request.destroy(new RemoteFetchError("Le serveur distant ne répond pas")));
    request.on("close", () => clearTimeout(headersDeadline));
    request.on("error", (err) =>
      reject(err instanceof RemoteFetchError ? err : new RemoteFetchError("Échec de la connexion au serveur distant"))
    );
    request.end();
  });
}

/** Throws away a response we are not forwarding, without letting a late socket error escape. */
function discardResponse(response: http.IncomingMessage): void {
  response.on("error", () => {});
  response.resume();
}

/**
 * GET a remote media file, revalidating the destination at every hop: redirects
 * are followed manually so that a redirect towards an internal address is caught
 * instead of being chased by the HTTP client.
 */
async function fetchPublicMedia(startUrl: URL, headers: http.OutgoingHttpHeaders): Promise<http.IncomingMessage> {
  let target = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    assertFetchableScheme(target);
    const addresses = await resolvePublicAddresses(hostnameOf(target));
    const response = await requestOnce(target, headers, addresses);
    const location = response.headers.location;
    if (REDIRECT_STATUSES.has(response.statusCode ?? 0) && location !== undefined) {
      discardResponse(response); // drain the redirect body, release the socket
      let next: URL;
      try {
        next = new URL(location, target);
      } catch {
        throw new BlockedUrlError("Redirection invalide du serveur distant");
      }
      target = next;
      continue;
    }
    return response;
  }
  throw new RemoteFetchError("Trop de redirections");
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

function downloadYouTube(url: string, quality: string): ReadableStream<Uint8Array> {
  // quality is either an adaptive itag (e.g. "398" for 720p) or "progressive_18"
  const resolvedQuality = quality && quality !== "best" ? quality : "best";
  const child = spawn(
    "python3",
    [path.join(SCRIPTS_DIR, "yt_download.py"), url, resolvedQuality],
    { stdio: ["ignore", "pipe", "pipe"] }
  );
  child.stderr.on("data", (chunk: Buffer) => console.error("[yt_download]", chunk.toString()));
  return Readable.toWeb(child.stdout) as ReadableStream<Uint8Array>;
}

export async function POST(request: NextRequest) {
  try {
    // Admin-only: this route fetches caller-supplied URLs and spawns a
    // python/ffmpeg pair per request. The proxy matcher guards it too; this
    // check is here because middleware must never be the sole boundary.
    if (!(await getAdminUser())) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
    }

    const { url, platform, quality } = (await request.json()) as DownloadRequest;

    if (!url || !platform) {
      return NextResponse.json({ error: "URL ou plateforme manquante" }, { status: 400 });
    }

    // YouTube: mux via pytubefix + ffmpeg (supports 144p–4K)
    if (platform === "youtube") {
      const videoId = url.match(/[?&]v=([^&\n?#]+)/)?.[1] ?? url.match(/\/shorts\/([^?&\n#]+)/)?.[1] ?? "video";
      const stream = downloadYouTube(url, quality);
      return new NextResponse(stream, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="youtube_${videoId}.mp4"`,
          "Cache-Control": "no-cache",
        },
      });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Format d'URL invalide" }, { status: 400 });
    }

    const response = await fetchPublicMedia(parsed, {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Referer": refererFor(platform),
      "Origin": refererFor(platform).replace(/\/$/, ""),
    });

    const status = response.statusCode ?? 0;
    if (status < 200 || status >= 300) {
      discardResponse(response);
      return NextResponse.json(
        { error: `Le serveur distant a refusé la requête (${status} ${response.statusMessage ?? ""})` },
        { status: 502 }
      );
    }

    // Prefer content-type from response, fall back to URL/platform detection
    const remoteType = response.headers["content-type"] ?? "";
    let contentType = (remoteType.split(";")[0] ?? "").trim() || "application/octet-stream";
    let extension = (parsed.pathname.split(".").pop() ?? "bin").split("?")[0];

    if (!remoteType) {
      if (url.includes(".mp4") || platform === "tiktok") {
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

    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache",
    };
    // the body is forwarded byte for byte, so a remote that compressed it anyway
    // must keep its Content-Encoding for the browser to decode it
    const remoteEncoding = response.headers["content-encoding"];
    if (remoteEncoding) responseHeaders["Content-Encoding"] = remoteEncoding;

    return new NextResponse(Readable.toWeb(response) as ReadableStream<Uint8Array>, {
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Download error:", err);
    if (err instanceof BlockedUrlError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Erreur lors du téléchargement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
