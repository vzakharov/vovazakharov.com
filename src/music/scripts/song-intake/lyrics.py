#!/usr/bin/env python3
"""Hear the words of sung vocals with Whisper large-v3, one timecoded line per phrase.

Usage: lyrics.py <vocals>... [--language ru] [--no-vad] [--json-dir DIR] > out.md

Feed it an isolated vocal (Demucs's vocals stem), not the mix. `--no-vad` is for
a stem the voice-activity filter mistakes for silence — Птицы came back as one
line with it on. Audio is decoded by ffmpeg rather than faster-whisper's own
PyAV path, whose keyword arguments drift between releases.

`--json-dir` also keeps each hearing word by word as `<stem>.whisper.json.gz`,
shaped as a Deepgram response, for `src/kernel/scripts/transcribe.py --second-opinion-from`
to merge with nova-3's.
"""

import argparse
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "kernel" / "scripts"))

from lib.hearing import from_segments, write_response

MODEL = "large-v3"

p = argparse.ArgumentParser()
p.add_argument("vocals", nargs="+")
p.add_argument("--language", default="ru")
p.add_argument("--no-vad", dest="vad", action="store_false")
p.add_argument("--json-dir", type=Path)
args = p.parse_args()

model = WhisperModel(MODEL, device="cpu", compute_type="int8")
for path in args.vocals:
    pcm = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    segments, info = model.transcribe(
        np.frombuffer(pcm, np.float32), language=args.language, vad_filter=args.vad, beam_size=5,
        condition_on_previous_text=False, word_timestamps=bool(args.json_dir),
    )
    print(f"## {path}\n")
    heard = []
    for s in segments:
        print(f"- `{int(s.start) // 60:02d}:{int(s.start) % 60:02d}` {s.text.strip()}")
        if args.json_dir:
            heard.append({
                "start": s.start, "end": s.end, "text": s.text,
                "words": [
                    {"word": w.word, "start": w.start, "end": w.end, "probability": w.probability}
                    for w in s.words
                ],
            })
    print(flush=True)
    if args.json_dir:
        args.json_dir.mkdir(parents=True, exist_ok=True)
        kept = args.json_dir / f"{Path(path).stem}.whisper.json.gz"
        write_response(kept, from_segments(heard, info.duration, f"faster-whisper {MODEL}"))
        print(f"Wrote {kept}", file=sys.stderr)
