# Toolbox media scripts

The admin Toolbox (`/dashboard/toolbox`) downloads social media via these two
scripts, both powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp):

| Script | Used by | Purpose |
|---|---|---|
| `media_info.py <url>` | `app/api/toolbox/analyze-media` | Returns JSON metadata + quality options for any URL |
| `media_download.py <url> <format>` | `app/api/toolbox/download-media` | Downloads, muxes to MP4 (or MP3), streams bytes to stdout |

`<format>` is a yt-dlp format selector, or one of `best`, `audio`, `image`.

## Runtime setup (already configured on this machine)

YouTube (2026) gates everything above 360p behind a JS signature challenge and a
signed-in session. Getting full quality therefore needs four things:

1. **Latest yt-dlp** — pinned in a dedicated Python 3.12 venv (`.venv-ytdlp/`,
   gitignored). The system `python3` is 3.9, which the latest yt-dlp no longer
   supports, hence the venv.
2. **Deno** — yt-dlp's JS challenge solver (`brew install deno`). Must be on PATH.
3. **EJS remote components** — the scripts pass `remote_components=["ejs:github"]`,
   which fetches the solver scripts (cached after first use).
4. **Browser cookies** — `cookiesfrombrowser=("chrome",)` reuses your signed-in
   YouTube session to unlock >360p. Chrome must be installed and logged in.

These are wired up via two vars in `.env.local`:

```
YTDLP_PYTHON=/abs/path/NeuralSpace/.venv-ytdlp/bin/python
YTDLP_COOKIES_BROWSER=chrome      # set to "" to disable cookies
```

Both API routes read `YTDLP_PYTHON` (default `python3`) and prepend
`/usr/local/bin:/opt/homebrew/bin` to PATH so `deno`/`ffmpeg` are found.

## Recreating the venv (new machine / after wipe)

```bash
python3.12 -m venv .venv-ytdlp
.venv-ytdlp/bin/pip install -U yt-dlp
brew install deno ffmpeg          # ffmpeg merges video+audio / extracts MP3
```

## Keeping it working

Social platforms change constantly; **keep yt-dlp current** or extractors break:

```bash
.venv-ytdlp/bin/pip install -U yt-dlp
```

## Notes & limits

- Without Chrome cookies, YouTube falls back to **360p only** (and the scripts
  retry anonymously if cookies are missing/locked).
- First Chrome cookie read on macOS may trigger a Keychain prompt — allow it.
- Some content needs login regardless (private/age-gated posts); those surface a
  clear French error in the UI.
- This pipeline shells out to Python + Deno + ffmpeg and buffers to a temp file.
  It runs on a machine you control — it will **not** work as-is on Vercel
  serverless (no Python/Deno/ffmpeg, no persistent temp). Deploy the toolbox on a
  container host (Railway/Fly/VPS) if you need it in production.
