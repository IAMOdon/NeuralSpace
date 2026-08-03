"""
YouTube info extractor using pytubefix.
Outputs JSON with all available qualities + thumbnail.
Usage: python3 scripts/yt_info.py <url>
"""
import sys, json

def main():
    url = sys.argv[1]
    from pytubefix import YouTube
    yt = YouTube(url)

    # Progressive (video+audio combined) — typically only 360p
    progressive = []
    for s in yt.streams.filter(progressive=True, file_extension="mp4").order_by("resolution").desc():
        progressive.append({
            "itag": s.itag,
            "resolution": s.resolution,
            "type": "progressive",
            "filesize": s.filesize,
        })

    # Adaptive video-only streams
    seen_res = set()
    adaptive_video = []
    for s in yt.streams.filter(adaptive=True, file_extension="mp4", only_video=True).order_by("resolution").desc():
        if s.resolution not in seen_res:
            seen_res.add(s.resolution)
            adaptive_video.append({
                "itag": s.itag,
                "resolution": s.resolution,
                "type": "video",
                "filesize": s.filesize,
            })

    # Best audio stream
    audio_stream = yt.streams.filter(adaptive=True, file_extension="mp4", only_audio=True).order_by("abr").desc().first()
    best_audio_itag = audio_stream.itag if audio_stream else None

    print(json.dumps({
        "title": yt.title,
        "thumbnail": yt.thumbnail_url,
        "progressive": progressive,
        "adaptive_video": adaptive_video,
        "best_audio_itag": best_audio_itag,
    }))

if __name__ == "__main__":
    main()
