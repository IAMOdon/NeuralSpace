"""
Universal media downloader using yt-dlp + ffmpeg.
Downloads to a temp file (so the container/moov atom is correct), streams the
bytes to stdout, then cleans up.

Usage: python3 scripts/media_download.py <url> <format>
  <format> is one of:
    - a yt-dlp format selector, e.g. "bv*[height<=1080]+ba/b[height<=1080]"
    - "best"  -> best video+audio muxed to mp4
    - "audio" -> bestaudio extracted to mp3
    - "image" -> download the still image as-is
"""
import sys
import os
import glob
import shutil
import tempfile

# Browser to pull cookies from (unlocks >360p on YouTube and login-gated sites).
# Set YTDLP_COOKIES_BROWSER="" to disable. Default: chrome.
COOKIES_BROWSER = os.environ.get("YTDLP_COOKIES_BROWSER", "chrome").strip()


def find_ffmpeg():
    found = shutil.which("ffmpeg")
    if found:
        return os.path.dirname(found)
    for cand in ("/usr/local/bin", "/opt/homebrew/bin", "/usr/bin"):
        if os.path.exists(os.path.join(cand, "ffmpeg")):
            return cand
    return None


def main():
    if len(sys.argv) < 2:
        print("missing url", file=sys.stderr)
        sys.exit(1)
    url = sys.argv[1]
    fmt = sys.argv[2] if len(sys.argv) > 2 else "best"

    tmpdir = tempfile.mkdtemp(prefix="ns_dl_")
    outtmpl = os.path.join(tmpdir, "out.%(ext)s")

    opts = {
        "outtmpl": outtmpl,
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "noplaylist": True,
        "socket_timeout": 30,
        "restrictfilenames": True,
        # YouTube now gates formats behind a JS signature challenge — yt-dlp
        # solves it with a JS runtime (deno) + these remote solver scripts.
        "remote_components": ["ejs:github"],
    }
    ffmpeg_dir = find_ffmpeg()
    if ffmpeg_dir:
        opts["ffmpeg_location"] = ffmpeg_dir

    if fmt == "audio":
        opts["format"] = "bestaudio/best"
        opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ]
    elif fmt == "image":
        opts["format"] = "best"
    elif fmt and fmt != "best":
        opts["format"] = fmt
        opts["merge_output_format"] = "mp4"
    else:
        opts["format"] = "bv*+ba/b"
        opts["merge_output_format"] = "mp4"

    try:
        _run(opts, url, use_cookies=True)

        files = sorted(glob.glob(os.path.join(tmpdir, "out.*")))
        if not files:
            print("no output produced", file=sys.stderr)
            sys.exit(1)

        with open(files[0], "rb") as f:
            shutil.copyfileobj(f, sys.stdout.buffer, length=1024 * 1024)
        sys.stdout.buffer.flush()
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def _run(opts, url, use_cookies):
    from yt_dlp import YoutubeDL

    if use_cookies and COOKIES_BROWSER:
        opts = {**opts, "cookiesfrombrowser": (COOKIES_BROWSER,)}
    try:
        with YoutubeDL(opts) as ydl:
            ydl.download([url])
    except Exception:
        # Cookies missing/locked — retry anonymously so public content works.
        if use_cookies and COOKIES_BROWSER:
            base = {k: v for k, v in opts.items() if k != "cookiesfrombrowser"}
            with YoutubeDL(base) as ydl:
                ydl.download([url])
        else:
            raise


if __name__ == "__main__":
    main()
