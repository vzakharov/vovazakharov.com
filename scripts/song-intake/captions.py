#!/usr/bin/env python3
"""Time a song's printed words to its video, one WebVTT track per lyrics column.

Usage: captions.py <song.md> <deepgram.json.gz> <out-prefix> [--at LINE=SECONDS]...

The timings come from `scripts/transcribe.py` run on the video itself, never on
the master: a video is cut on its own, so its words sit seconds away from the
mp3's. The text comes from the song's markdown, never from the recogniser,
which mishears sung words; Deepgram only says when each printed line starts.
Writes `<out-prefix>.<lang>.vtt` for every `<!-- lyrics:<lang> -->` column, the
crib timed line for line off the sung one, and prints each cue with how many of
its words were heard, since an unheard line is placed by interpolation and is
where to look first: the vocals stem's transcript, shifted by the video's offset
from the master, or the voice's harmonics in a spectrogram of that stretch give
the start that `--at` pins.
"""

import argparse
import difflib
import gzip
import json
import re
import sys

MARKER = re.compile(r"^<!-- (lang|lyrics):([\w-]+) -->$")
COMMENT = re.compile(r"^<!--.*-->$")
REPEAT = re.compile(r"^x(\d+)$")
# Lingering past the last heard word, so a held note keeps its line on screen.
HOLD = 1.5


def columns(markdown: str) -> dict[str, list[str]]:
    """Every lyrics column as the lines sung, stanza repeats spelled out."""
    cols: dict[str, list[list[str]]] = {}
    current = None
    for raw in markdown.split("\n"):
        line = raw.strip()
        if m := MARKER.match(line):
            current = m[2] if m[1] == "lyrics" else None
            if current is not None:
                cols[current] = [[]]
            continue
        if current is None or line.startswith("[^") or COMMENT.match(line):
            continue
        stanzas = cols[current]
        if not line:
            if stanzas[-1]:
                stanzas.append([])
        elif m := REPEAT.match(line):
            stanzas[-1] *= int(m[1])
        else:
            stanzas[-1].append(clean(line))
    return {lang: [l for s in st for l in s] for lang, st in cols.items()}


def clean(line: str) -> str:
    line = re.sub(r"\[\^[\w-]+\]", "", line)
    line = re.sub(r"\[([^\]]+)\]", r"\1", line)
    return re.sub(r"_([^_]+)_", r"\1", line)


def norm(word: str) -> str:
    return re.sub(r"[^\w]", "", word.lower().replace("ё", "е"))


def align(lines: list[str], heard: list[dict]) -> list[tuple[float, float, int, int] | None]:
    """Each line's (start, end, words heard, words) from a global word alignment."""
    tokens = [(i, norm(w)) for i, l in enumerate(lines) for w in l.split() if norm(w)]
    words = [norm(w["word"]) for w in heard]
    n, m = len(tokens), len(words)
    gap = -0.4
    score = [[0.0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        score[i][0] = i * gap
    for j in range(1, m + 1):
        score[0][j] = j * gap
    sim = lambda a, b: difflib.SequenceMatcher(None, a, b).ratio()
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s = sim(tokens[i - 1][1], words[j - 1])
            score[i][j] = max(
                score[i - 1][j - 1] + (s * 2 - 1 if s >= 0.5 else -1),
                score[i - 1][j] + gap,
                score[i][j - 1] + gap,
            )
    matched: dict[int, list[dict]] = {}
    i, j = n, m
    while i and j:
        s = sim(tokens[i - 1][1], words[j - 1])
        if s >= 0.5 and score[i][j] == score[i - 1][j - 1] + s * 2 - 1:
            matched.setdefault(tokens[i - 1][0], []).append(heard[j - 1])
            i, j = i - 1, j - 1
        elif score[i][j] == score[i - 1][j] + gap:
            i -= 1
        else:
            j -= 1
    counts = [sum(1 for t in tokens if t[0] == k) for k in range(len(lines))]
    # A word's end is capped a few seconds past its start: the recogniser stretches
    # the last word of a phrase across the instrumental that follows it.
    return [
        (min(w["start"] for w in ws), max(min(w["end"], w["start"] + 3) for w in ws), len(ws), counts[k])
        if (ws := matched.get(k))
        else None
        for k in range(len(lines))
    ]


def times(placed: list[tuple[float, float, int, int] | None]) -> list[tuple[float, float]]:
    """Cue spans: heard lines as heard, unheard ones spread over the gap they fall in."""
    starts = [p[0] if p else None for p in placed]
    known = [k for k, s in enumerate(starts) if s is not None]
    if not known:
        sys.exit("no line was heard; check the transcript belongs to this song")
    for k, s in enumerate(starts):
        if s is None:
            before = max((x for x in known if x < k), default=None)
            after = min((x for x in known if x > k), default=None)
            if before is None:
                starts[k] = starts[after] - (after - k) * 2.0
            elif after is None:
                starts[k] = placed[before][1] + (k - before - 1) * 2.0
            else:
                starts[k] = starts[before] + (starts[after] - starts[before]) * (k - before) / (after - before)
    spans = []
    for k, s in enumerate(starts):
        end = (placed[k][1] if placed[k] else s + 2.0) + HOLD
        if k + 1 < len(starts):
            end = min(end, starts[k + 1])
        spans.append((s, end))
    return spans


def stamp(t: float) -> str:
    ms = round(max(t, 0) * 1000)
    return f"{ms // 3_600_000:02d}:{ms // 60_000 % 60:02d}:{ms // 1000 % 60:02d}.{ms % 1000:03d}"


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("song")
    p.add_argument("deepgram")
    p.add_argument("out_prefix")
    p.add_argument("--at", action="append", default=[], metavar="LINE=SECONDS",
                   help="start the sung column's LINE (1-based) at SECONDS, placed by ear or spectrogram")
    args = p.parse_args()

    with open(args.song, encoding="utf-8") as f:
        front = f.read()
    sung = re.search(r"^language: (\S+)$", front, re.M)
    cols = columns(front)
    if not sung or sung[1] not in cols:
        sys.exit("the song states no `language` with a lyrics column of its own")
    heard = json.load(gzip.open(args.deepgram))["results"]["channels"][0]["alternatives"][0]["words"]
    placed = align(cols[sung[1]], heard)
    for at in args.at:
        line, seconds = at.split("=")
        k = int(line) - 1
        start = float(seconds)
        # Unheard words have no end of their own, so the line holds until the next.
        placed[k] = (start, start + 30.0, 0, 0)
    spans = times(placed)

    for lang, lines in cols.items():
        if len(lines) != len(spans):
            sys.exit(f"lyrics:{lang} has {len(lines)} lines where lyrics:{sung[1]} has {len(spans)}")
        with open(f"{args.out_prefix}.{lang}.vtt", "w", encoding="utf-8") as out:
            out.write("WEBVTT\n")
            for (s, e), line in zip(spans, lines):
                out.write(f"\n{stamp(s)} --> {stamp(e)}\n{line}\n")
    for (s, e), line, p in zip(spans, cols[sung[1]], placed):
        heard_of = "unheard" if not p else "placed" if not p[3] else f"{p[2]}/{p[3]}"
        print(f"{stamp(s)}–{stamp(e)}  {heard_of}  {line}")


if __name__ == "__main__":
    main()
