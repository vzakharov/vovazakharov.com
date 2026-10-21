#!/usr/bin/env python3
"""Master one song against a reference, at a fraction of the reference's EQ.

Usage:
  master.py <song> <reference> <out.mp3> [--strength 0.5] [--lufs N]
            [--title T] [--album A] [--artist R] [--track N/M]

The chain, each step there for a reason scripts/song-intake/CLAUDE.md gives:

  1. Matchering matches the song to the reference — loudness, spectrum, peaks.
  2. The smoothed spectrum difference between that match and the song, scaled
     by --strength in dB, goes onto the original song as a linear-phase FIR.
     Above AIR_HZ the boost is capped, since a lossy source has no music there.
  3. The result is levelled to --lufs (default: the full match's loudness,
     less the limiter's typical cost), through a 4x-oversampled limiter whose
     ceiling keeps the decoded V0 mp3 under -1 dBTP.

Prints the output's integrated loudness and true peak, and fails if the peak
is above -1 dBTP.
"""

import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import matchering as mg
import numpy as np
import soundfile as sf
from scipy.signal import fftconvolve, firwin2

from spectrum import SR, balance

AIR_HZ = 12000
AIR_CAP_DB = 3.0
NUMTAPS = 8191
LIMIT = 0.75  # -2.5 dBFS at 4x: LAME V0 adds up to ~1.5 dB of intersample peak
MAX_TRUE_PEAK = -1.0
TAGS = ("title", "album", "artist", "track")


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def loudness(path):
    """Integrated loudness (LUFS) and true peak (dBTP), from ffmpeg's ebur128."""
    err = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    ).stderr
    summary = err[err.rindex("Summary:"):]
    i = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summary).group(1))
    tp = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary).group(1))
    return i, tp


def partial_eq(song, matched, out, strength):
    f, a = balance(song)
    _, b = balance(matched)
    curve = (b - a) * strength
    air = f >= AIR_HZ
    curve[air] = np.minimum(curve[air], AIR_CAP_DB)
    taps = firwin2(NUMTAPS, f / (SR / 2), 10 ** (curve / 20))
    x, _ = sf.read(song, always_2d=True)
    y = np.stack([fftconvolve(x[:, c], taps, mode="same") for c in range(x.shape[1])], axis=1)
    y /= max(1.0, np.abs(y).max() / 0.99)  # float headroom only; level is set downstream
    sf.write(out, y, SR, subtype="FLOAT")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("song")
    p.add_argument("reference")
    p.add_argument("out")
    p.add_argument("--strength", type=float, default=0.5)
    p.add_argument("--lufs", type=float)
    for tag in TAGS:
        p.add_argument(f"--{tag}")
    args = p.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        t = Path(tmp)
        song, ref, matched, eq = t / "song.wav", t / "ref.wav", t / "matched.wav", t / "eq.wav"
        ffmpeg("-i", args.song, "-ar", str(SR), str(song))
        ffmpeg("-i", args.reference, "-ar", str(SR), str(ref))
        mg.process(target=str(song), reference=str(ref), results=[mg.pcm24(str(matched))],
                   config=mg.Config(max_length=60 * 60))
        partial_eq(song, matched, eq, args.strength)

        target = args.lufs if args.lufs is not None else loudness(matched)[0] - 0.5
        gain = target - loudness(eq)[0] + 0.5
        meta = [x for tag in TAGS
                if getattr(args, tag) for x in ("-metadata", f"{tag}={getattr(args, tag)}")]
        ffmpeg("-i", str(eq), "-af",
               f"volume={gain:.2f}dB,aresample={SR * 4},"
               f"alimiter=limit={LIMIT}:attack=1:release=50:level=false,aresample={SR}",
               "-c:a", "libmp3lame", "-q:a", "0", *meta, args.out)

    i, tp = loudness(args.out)
    print(f"{args.out}: {i:.1f} LUFS, {tp:.1f} dBTP (target {target:.1f})")
    if tp > MAX_TRUE_PEAK:
        sys.exit(f"true peak {tp:.1f} dBTP is above {MAX_TRUE_PEAK}; lower LIMIT")


if __name__ == "__main__":
    main()
