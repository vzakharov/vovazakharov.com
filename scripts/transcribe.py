#!/usr/bin/env python3
"""Turn one recording into a Deepgram response and a timecoded transcript.

Usage:
  python3 scripts/transcribe.py <media> [--slug SLUG] [--out-dir DIR]
                                       [--audio-out PATH] [--model MODEL]
                                       [--language LANG] [--force]

`<media>` is audio or video in anything ffmpeg reads. A file carrying a video
stream is first reduced to mono 64 kbit/s AAC — speech recognition hears no
difference and the upload shrinks by roughly 25x — and the extracted audio is
thrown away unless `--audio-out` names somewhere to keep it.

Two files come back, named for the slug (the input's stem unless `--slug` says
otherwise) under `--out-dir` (default `docs/remove-before-merging/deepgram/`):

  <slug>.deepgram.json    the whole response, kept because per-word timings and
                          confidences are what a subtitle track is built from
                          and the API will not hand them back a second time
  <slug>.transcript.md    one line per sentence with its timecode, plus the
                          words Deepgram was least sure of

The second file is the one a person or an agent reads.
`@.claude/skills/dictation/SKILL.md` owns what happens to it next, and is where
the judgement lives — this script makes no decision a re-run could make
differently.

Requires `ffmpeg`/`ffprobe` on PATH and `DEEPGRAM_API_KEY` in the environment.

Exit codes:
  0  - both files written.
  1  - bad arguments, a missing tool or key, or the API refused.

Stdlib only — no third-party deps. Python 3.9+.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, NoReturn, Optional

DEEPGRAM_URL = "https://api.deepgram.com/v1/listen"

# Fixed because the responses are kept and compared across recordings: a
# parameter that drifts between runs makes two transcripts incomparable without
# anyone noticing. `model` and `language` are the two a caller can move, and
# both are recorded in the transcript header.
DEEPGRAM_PARAMS = {
    "smart_format": "true",
    "punctuate": "true",
    "paragraphs": "true",
    "diarize": "true",
}

DEFAULT_OUT_DIR = Path("docs") / "remove-before-merging" / "deepgram"
DEFAULT_MODEL = "nova-3"

# Mono at 64 kbit/s. Below this, recognition starts to suffer on quiet
# consonants; above it, nothing changes but the upload.
AUDIO_ARGS = ["-vn", "-ac", "1", "-c:a", "aac", "-b:a", "64k"]

# A word Deepgram scores under this is worth a human's eye. The listing is a
# hint, not a verdict — a correctly heard rare word scores low too.
LOW_CONFIDENCE = 0.6
LOW_CONFIDENCE_LIMIT = 40


def die(msg: str, code: int = 1) -> NoReturn:
    print(msg, file=sys.stderr)
    sys.exit(code)


def timecode(seconds: float) -> str:
    total = int(seconds)
    return f"{total // 60:02d}:{total % 60:02d}"


def require_tool(name: str) -> None:
    if shutil.which(name) is None:
        die(f"{name} is not on PATH — install ffmpeg (it ships both ffmpeg and ffprobe).")


def probe(media: Path) -> dict[str, Any]:
    out = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-show_entries",
            "stream=codec_type",
            "-of",
            "json",
            str(media),
        ],
        capture_output=True,
        text=True,
    )
    if out.returncode != 0:
        die(f"ffprobe could not read {media}:\n{out.stderr.strip()}")
    return json.loads(out.stdout)


def extract_audio(media: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    out = subprocess.run(
        ["ffmpeg", "-y", "-i", str(media), *AUDIO_ARGS, str(dest)],
        capture_output=True,
        text=True,
    )
    if out.returncode != 0:
        die(f"ffmpeg failed extracting audio from {media}:\n{out.stderr.strip()}")


def transcribe(audio: Path, model: str, language: Optional[str]) -> dict[str, Any]:
    params = dict(DEEPGRAM_PARAMS, model=model)
    # Asking for a language and asking Deepgram to find one are the same slot;
    # sending both makes the detection a no-op that the header would still
    # report as having run.
    if language:
        params["language"] = language
    else:
        params["detect_language"] = "true"

    key = os.environ.get("DEEPGRAM_API_KEY", "").strip()
    if not key:
        die("DEEPGRAM_API_KEY is not set.")

    request = urllib.request.Request(
        f"{DEEPGRAM_URL}?{urllib.parse.urlencode(params)}",
        data=audio.read_bytes(),
        method="POST",
        headers={
            "Authorization": f"Token {key}",
            "Content-Type": "application/octet-stream",
        },
    )
    try:
        with urllib.request.urlopen(request) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="replace").strip()
        die(f"Deepgram refused the request: {exc.code} {exc.reason}\n{body}")
    except urllib.error.URLError as exc:
        die(f"Could not reach Deepgram: {exc}")


def render_transcript(
    response: dict[str, Any],
    source: Path,
    audio_kept: Optional[Path],
    model: str,
) -> str:
    channel = response["results"]["channels"][0]
    alt = channel["alternatives"][0]
    metadata = response["metadata"]
    words = alt.get("words", [])

    lines = [
        f"# Transcript: {source.name}",
        "",
        "| | |",
        "| --- | --- |",
        f"| Source | `{source}` |",
    ]
    if audio_kept:
        lines.append(f"| Audio | `{audio_kept}` |")
    lines += [
        f"| Duration | {timecode(metadata['duration'])} |",
        f"| Language | `{channel.get('detected_language') or 'set by caller'}` |",
        f"| Model | `{model}` |",
        f"| Words | {len(words)} |",
        f"| Mean confidence | {alt.get('confidence', 0):.3f} |",
        "",
        "One line per sentence, timecoded at its start. Generated by",
        "`scripts/transcribe.py`; the whole response is in the `.deepgram.json`",
        "beside this file.",
        "",
        "## Sentences",
        "",
    ]

    for paragraph in alt.get("paragraphs", {}).get("paragraphs", []):
        for sentence in paragraph["sentences"]:
            lines.append(f"- `{timecode(sentence['start'])}` {sentence['text']}")
        lines.append("")

    unsure = [w for w in words if w.get("confidence", 1.0) < LOW_CONFIDENCE]
    lines += [
        f"## Words scored under {LOW_CONFIDENCE}",
        "",
        "Where a mis-hearing is most likely — start here rather than reading for",
        "them. A rare word heard correctly scores low too, so this is a place to",
        "look, not a list of errors.",
        "",
    ]
    if not unsure:
        lines.append("None.")
    else:
        for word in unsure[:LOW_CONFIDENCE_LIMIT]:
            lines.append(
                f"- `{timecode(word['start'])}` "
                f"**{word.get('punctuated_word', word['word'])}** "
                f"({word['confidence']:.2f})"
            )
        if len(unsure) > LOW_CONFIDENCE_LIMIT:
            lines.append(f"- …and {len(unsure) - LOW_CONFIDENCE_LIMIT} more.")
    lines.append("")

    return "\n".join(lines)


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe one recording with Deepgram.",
    )
    parser.add_argument("media", type=Path, help="audio or video file")
    parser.add_argument("--slug", help="output basename (default: the input's stem)")
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument(
        "--audio-out",
        type=Path,
        help="keep the extracted audio here instead of discarding it",
    )
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument(
        "--language",
        help="force a language code; omitted, Deepgram detects one",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="overwrite outputs that already exist",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)

    if not args.media.is_file():
        die(f"No such file: {args.media}")
    require_tool("ffmpeg")
    require_tool("ffprobe")

    slug = args.slug or args.media.stem
    json_path = args.out_dir / f"{slug}.deepgram.json"
    transcript_path = args.out_dir / f"{slug}.transcript.md"
    # Checked before the upload, not after: the call costs money and the file it
    # would clobber is usually one someone has since corrected by hand.
    existing = [p for p in (json_path, transcript_path) if p.exists()]
    if existing and not args.force:
        die(
            "Refusing to overwrite:\n"
            + "\n".join(f"  {p}" for p in existing)
            + "\nPass --force, or --slug for a different name."
        )

    probed = probe(args.media)
    has_video = any(s["codec_type"] == "video" for s in probed.get("streams", []))

    with tempfile.TemporaryDirectory() as tmp:
        if has_video:
            audio = args.audio_out or Path(tmp) / f"{slug}.m4a"
            extract_audio(args.media, audio)
            print(
                f"Extracted audio: {audio} "
                f"({audio.stat().st_size / 1e6:.1f} MB "
                f"from {args.media.stat().st_size / 1e6:.1f} MB)"
            )
        else:
            audio = args.media

        response = transcribe(audio, args.model, args.language)
        transcript = render_transcript(
            response,
            args.media,
            args.audio_out if has_video else None,
            args.model,
        )

    args.out_dir.mkdir(parents=True, exist_ok=True)
    json_path.write_text(
        json.dumps(response, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    transcript_path.write_text(transcript, encoding="utf-8")

    print(f"Wrote {json_path}")
    print(f"Wrote {transcript_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
