#!/usr/bin/env python3
"""A blind three-way listening file: three masters of one song, taking turns.

Usage:
  blind-abc.py build <a> <b> <c> <out.mp3> <key.json> [--mix <mix>] [--window 5]
  blind-abc.py split <key.json> <out-dir> [--mix <mix>]
  blind-abc.py reveal <key.json> <sha256>

`build` loudness-matches the three (each brought down to the quietest, so none
clips), cuts them into consecutive --window-second stretches over the whole
song, and plays them in one random order, repeating: the listener hears
"first, second, third" without knowing which master each is. `--mix` puts the
unmastered mix ahead of the three in every round, matched like them, so each
master is heard against where it started rather than only against the others,
and loudness is no clue to which is the mix. It prints the
order's sha256, which is what gets committed; the key file holds the order and
its nonce and stays out of the commit until the verdict.

`split` writes the same loudness-matched set as whole files, in the order a
`build` key holds — `1.mp3`, `2.mp3`, `3.mp3`, and `mix.mp3` with --mix — for a
player that switches between them as they play, the names saying no more than
the positions do.

`reveal` checks a key file against the committed sha256 and prints which
master each position was.
"""

import argparse
import hashlib
import json
import secrets
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

from master import loudness
from spectrum import SR

FADE_S = 0.02  # a crossfade this short is inaudible as a fade and removes the click


def seal(order, nonce):
    return hashlib.sha256(json.dumps({"order": order, "nonce": nonce}).encode()).hexdigest()


def decode(path, tmp):
    wav = Path(tmp) / f"{len(list(Path(tmp).iterdir()))}.wav"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", path,
                    "-ar", str(SR), "-ac", "2", str(wav)], check=True)
    return wav


def matched(paths, tmp):
    """The files decoded, each brought down to the quietest one's loudness."""
    wavs = [decode(p, tmp) for p in paths]
    levels = [loudness(w)[0] for w in wavs]
    quietest = min(levels)
    return [sf.read(w, always_2d=True)[0] * 10 ** ((quietest - lv) / 20)
            for w, lv in zip(wavs, levels)]


def encode(audio, out, tmp):
    wav = Path(tmp) / "out.wav"
    sf.write(wav, audio, SR, subtype="FLOAT")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
                    "-c:a", "libmp3lame", "-q:a", "0", str(out)], check=True)


def played(args, order):
    """What a key's files hold: the mix, given --mix, ahead of the masters in `order`."""
    return ([args.mix] if args.mix else []) + order


def build(args):
    masters = [args.a, args.b, args.c]
    order = masters[:]
    secrets.SystemRandom().shuffle(order)
    nonce = secrets.token_hex(16)

    with tempfile.TemporaryDirectory() as tmp:
        audio = matched(played(args, order), tmp)
        n = min(len(x) for x in audio)
        window, fade = int(args.window * SR), int(FADE_S * SR)
        out = np.zeros((n, 2))
        ramp = np.linspace(0, 1, fade)[:, None]
        for i, start in enumerate(range(0, n, window)):
            # Each stretch reaches `fade` past its end, fading out under the next one's fade-in.
            end = min(start + window + fade, n)
            piece = audio[i % len(audio)][start:end].copy()
            if start > 0:
                piece[:fade] *= ramp
            if end < n:
                piece[-fade:] *= ramp[::-1]
            out[start:end] += piece
        encode(out, args.out, tmp)

    Path(args.key).write_text(json.dumps({"order": order, "nonce": nonce}, ensure_ascii=False, indent=2))
    print(seal(order, nonce))


def split(args):
    order = json.loads(Path(args.key).read_text())["order"]
    names = (["mix"] if args.mix else []) + [str(i) for i in range(1, len(order) + 1)]
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        audio = matched(played(args, order), tmp)
        n = min(len(x) for x in audio)
        for name, a in zip(names, audio):
            encode(a[:n], out_dir / f"{name}.mp3", tmp)


def reveal(args):
    key = json.loads(Path(args.key).read_text())
    if seal(key["order"], key["nonce"]) != args.sha256:
        sys.exit("the key does not match the committed sha256")
    for position, master in enumerate(key["order"], 1):
        print(f"{position}: {master}")


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    b = sub.add_parser("build")
    for name in ("a", "b", "c", "out", "key"):
        b.add_argument(name)
    b.add_argument("--mix")
    b.add_argument("--window", type=float, default=5.0)
    s = sub.add_parser("split")
    s.add_argument("key")
    s.add_argument("out_dir")
    s.add_argument("--mix")
    r = sub.add_parser("reveal")
    r.add_argument("key")
    r.add_argument("sha256")
    args = p.parse_args()
    {"build": build, "split": split, "reveal": reveal}[args.command](args)


if __name__ == "__main__":
    main()
