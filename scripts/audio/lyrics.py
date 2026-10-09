#!/usr/bin/env python3
"""Hear the words of sung vocals with Whisper large-v3, one timecoded line per phrase.

Usage: lyrics.py <vocals>... [--language ru] [--no-vad] > out.md

Feed it an isolated vocal (Demucs's vocals stem), not the mix. `--no-vad` is for
a stem the voice-activity filter mistakes for silence — Птицы came back as one
line with it on. Audio is decoded by ffmpeg rather than faster-whisper's own
PyAV path, whose keyword arguments drift between releases.
"""

import argparse
import subprocess

import numpy as np
from faster_whisper import WhisperModel

p = argparse.ArgumentParser()
p.add_argument("vocals", nargs="+")
p.add_argument("--language", default="ru")
p.add_argument("--no-vad", dest="vad", action="store_false")
args = p.parse_args()

model = WhisperModel("large-v3", device="cpu", compute_type="int8")
for path in args.vocals:
    pcm = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    segments, _ = model.transcribe(
        np.frombuffer(pcm, np.float32), language=args.language, vad_filter=args.vad, beam_size=5,
        condition_on_previous_text=False,
    )
    print(f"## {path}\n")
    for s in segments:
        print(f"- `{int(s.start) // 60:02d}:{int(s.start) % 60:02d}` {s.text.strip()}")
    print(flush=True)
