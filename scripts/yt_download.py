"""
YouTube download script using pytubefix + ffmpeg.
Streams muxed MP4 to stdout.
Usage: python3 scripts/yt_download.py <url> <itag_video|"progressive_<itag">
"""
import sys, subprocess

IOS_UA = "com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)"

def main():
    url = sys.argv[1]
    quality = sys.argv[2] if len(sys.argv) > 2 else "best"

    from pytubefix import YouTube
    yt = YouTube(url)

    if quality.startswith("progressive_"):
        itag = int(quality.split("_")[1])
        stream = yt.streams.get_by_itag(itag)
        if not stream:
            print(f"Stream {itag} not found", file=sys.stderr)
            sys.exit(1)
        # Single combined stream — pipe directly via ffmpeg (remux to fragmented MP4)
        cmd = [
            "ffmpeg", "-loglevel", "error",
            "-user_agent", IOS_UA,
            "-i", stream.url,
            "-c", "copy",
            "-movflags", "frag_keyframe+empty_moov+default_base_moof",
            "-f", "mp4", "pipe:1",
        ]
        subprocess.run(cmd, stdout=sys.stdout.buffer, stderr=sys.stderr)
        return

    # Adaptive: find video stream by itag, pair with best audio
    video_itag = int(quality) if quality != "best" else None

    if video_itag:
        video = yt.streams.get_by_itag(video_itag)
    else:
        video = yt.streams.filter(adaptive=True, file_extension="mp4", only_video=True).order_by("resolution").desc().first()

    if not video:
        print(f"Video stream not found for itag={video_itag}", file=sys.stderr)
        sys.exit(1)

    audio = yt.streams.filter(adaptive=True, file_extension="mp4", only_audio=True).order_by("abr").desc().first()
    if not audio:
        print("No audio stream found", file=sys.stderr)
        sys.exit(1)

    cmd = [
        "ffmpeg", "-loglevel", "error",
        "-user_agent", IOS_UA, "-i", video.url,
        "-user_agent", IOS_UA, "-i", audio.url,
        "-c", "copy",
        "-movflags", "frag_keyframe+empty_moov+default_base_moof",
        "-f", "mp4", "pipe:1",
    ]
    subprocess.run(cmd, stdout=sys.stdout.buffer, stderr=sys.stderr)

if __name__ == "__main__":
    main()
