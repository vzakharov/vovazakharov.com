#!/usr/bin/env python3
"""Where a song's master starts on its video's timeline: the frontmatter's `video.offsetSeconds`.

Usage: video-offset.py <master> <video>

Cross-correlates the two soundtracks and prints the offset in seconds, video
time minus song time, so a negative one means the video starts after the
master does. Then it places ten-second stretches of the master in the video one
by one: a video that is one cut of the song shows the same offset in every
stretch it shares with it, and a stretch that disagrees with a high score is an
edit, where a single offset is not enough. A low score is a stretch too quiet or
too repetitive to place.
"""

import subprocess
import sys

import numpy as np

# Plenty to place a song to a millisecond, and cheap enough to correlate whole.
RATE = 4000
STRETCH = 10
STEP = 15


def soundtrack(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(RATE), "-f", "s16le", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32)


def place(haystack, needle):
    """The lag of `needle` in `haystack` in seconds, and its normalised score."""
    n = 1 << int(np.ceil(np.log2(len(haystack) + len(needle))))
    corr = np.fft.irfft(np.fft.rfft(haystack, n) * np.conj(np.fft.rfft(needle, n)), n)
    lag = int(np.argmax(corr))
    if lag > n // 2:
        lag -= n
    score = corr.max() / (np.linalg.norm(haystack) * np.linalg.norm(needle) + 1e-9)
    return lag / RATE, score


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    song, video = soundtrack(sys.argv[1]), soundtrack(sys.argv[2])
    offset, score = place(video, song)
    print(f"offset {offset:.2f} s (score {score:.2f})")
    for start in range(5, len(song) // RATE - STRETCH, STEP):
        lag, score = place(video, song[start * RATE : (start + STRETCH) * RATE])
        print(f"  song {start:4d} s: offset {lag - start:7.2f} s (score {score:.2f})")


if __name__ == "__main__":
    main()
