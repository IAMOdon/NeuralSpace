"""
Universal media metadata extractor using yt-dlp.
Works for every supported platform (YouTube, X/Twitter, Instagram, TikTok,
Reddit, Facebook, Vimeo, Dailymotion, Twitch, Pinterest, Threads, ...).

Outputs a single JSON object on stdout:
  { title, thumbnail, uploader, duration, type, ext, id, qualities[] }

Usage: python3 scripts/media_info.py <url>
"""
import sys
import os
import json

IMAGE_EXTS = {"jpg", "jpeg", "png", "webp", "gif", "bmp"}

# Browser to pull cookies from (unlocks >360p on YouTube and login-gated sites).
# Set YTDLP_COOKIES_BROWSER="" to disable. Default: chrome.
COOKIES_BROWSER = os.environ.get("YTDLP_COOKIES_BROWSER", "chrome").strip()


def extract(url, use_cookies):
    from yt_dlp import YoutubeDL

    opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
        "socket_timeout": 30,
        # YouTube now gates formats behind a JS signature challenge — yt-dlp
        # solves it with a JS runtime (deno) + these remote solver scripts.
        "remote_components": ["ejs:github"],
    }
    if use_cookies and COOKIES_BROWSER:
        # Cookies unlock the full quality ladder (>360p) on YouTube.
        opts["cookiesfrombrowser"] = (COOKIES_BROWSER,)
    with YoutubeDL(opts) as ydl:
        return ydl.extract_info(url, download=False)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "missing url"}))
        sys.exit(1)
    url = sys.argv[1]

    try:
        info = extract(url, use_cookies=True)
    except Exception:
        # Cookies missing/locked (browser not installed, no session) — fall back
        # to anonymous extraction so public content still works.
        info = extract(url, use_cookies=False)

    # A playlist/multi-item post -> take the first entry
    if info.get("_type") == "playlist" and info.get("entries"):
        entries = [e for e in info["entries"] if e]
        if entries:
            info = entries[0]

    formats = info.get("formats") or []
    heights = sorted(
        {
            f["height"]
            for f in formats
            if f.get("height") and f.get("vcodec") not in (None, "none")
        },
        reverse=True,
    )

    ext = (info.get("ext") or "").lower()
    has_video = bool(info.get("duration")) or any(
        f.get("vcodec") not in (None, "none") for f in formats
    )
    if not heights and (ext in IMAGE_EXTS or not has_video):
        media_type = "image"
    else:
        media_type = "video"

    qualities = []
    if media_type == "video":
        for h in heights:
            qualities.append(
                {"label": f"{h}p", "value": f"bv*[height<={h}]+ba/b[height<={h}]"}
            )
        if not qualities:
            qualities.append({"label": "Meilleure qualité", "value": "best"})
        qualities.append({"label": "Audio (MP3)", "value": "audio"})
    else:
        qualities.append({"label": "Original", "value": "image"})

    out_ext = "mp4" if media_type == "video" else (ext if ext in IMAGE_EXTS else "jpg")

    print(
        json.dumps(
            {
                "title": info.get("title"),
                "thumbnail": info.get("thumbnail"),
                "uploader": info.get("uploader") or info.get("channel"),
                "duration": info.get("duration"),
                "type": media_type,
                "ext": out_ext,
                "id": info.get("id"),
                "qualities": qualities,
            }
        )
    )


if __name__ == "__main__":
    main()
