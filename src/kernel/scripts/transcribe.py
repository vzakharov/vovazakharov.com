#!/usr/bin/env python3
"""Turn one recording into a local model's hearing and a timecoded transcript.

Usage:
<<<<<<< HEAD:scripts/transcribe.py
  tmp/hearing-venv/bin/python scripts/transcribe.py <media> [--slug SLUG]
      [--out-dir DIR] [--json-dir DIR] [--audio-out PATH] [--video-out PATH]
      [--model MODEL] [--language LANG] [--vad THRESHOLD]
      [--second-opinion | --second-opinion-from JSON]
      [--keyterm TERM]... [--floor FLOOR] [--force]
=======
  python3 src/kernel/scripts/transcribe.py <media> [--slug SLUG] [--out-dir DIR]
                                       [--json-dir DIR]
                                       [--audio-out PATH] [--video-out PATH]
                                       [--model MODEL] [--language LANG]
                                       [--second-opinion | --second-opinion-from JSON]
                                       [--keyterm TERM]...
                                       [--floor FLOOR] [--force]
>>>>>>> origin/main:src/kernel/scripts/transcribe.py

Runs under the hearing venv —
`python3 -m venv tmp/hearing-venv && tmp/hearing-venv/bin/pip install -r scripts/requirements-hearing.txt`
— on the CPU, offline past each model's first download.
`<media>` is audio or video in anything ffmpeg reads. `--audio-out` keeps the
video's sound as mono 64 kbit/s AAC, `--video-out` a re-encoded copy of the
video itself, for a recording being archived.

Two files come back (three with `--second-opinion`), named for the slug — the
input's stem unless `--slug` says otherwise — all under
`docs/remove-before-merging/transcripts/` and all committed — that directory is
swept before the merge, so none reaches main:

  <slug>.transcript.md    under `--out-dir` — one line per sentence with its
                          timecode, every word scored under `--floor` marked
                          `[word?]` where it was said. This is the file a
                          person or an agent reads.
  <slug>.<model>.json.gz  under `--json-dir` — the whole hearing, shaped as a
                          Deepgram response (`lib/hearing.py` says why), with
                          the per-word timings a subtitle track needs. Kept
                          because a re-run is a different transcription, which
                          corrections made against this one no longer fit.

**Which model hears first** (`--model`, measured 23.10.2026 on a sung vocal
scored against its published captions and a voice note against its corrected
transcript):

- `gigaam-v3` — GigaAM-v3 RNNT, the default for `--language ru`. On speech it
  made half the errors of anything else (word error rate 0.10 against
  Whisper's 0.23), punctuated, eight times faster than Whisper. Russian only,
  and no keyterms.
- `whisper-large-v3` — the default otherwise, and the only one that detects a
  language. On a sung vocal it heard 90% of the words where GigaAM heard 65%.
  Never `large-v3-turbo`: on a mumbled voice note it dropped sixteen seconds
  and closed on an invented «Спасибо. Спасибо.»

**On Russian, Whisper's words are re-timed** by GigaAM-v3's CTC head
(`lib/ears.place`): Whisper's own word timings land a second or more off, the
forced alignment within 0.06 s median — closer than Deepgram's nova-3 put them.

**`--vad` is the voice filter's threshold, and on a song it is 0.1.** At the
default 0.5 Whisper dropped half of a sung vocal; with no filter (`--vad 0`) it
heard every line and invented `Субтитры сделал DimaTorzok` over the
instrumental. GigaAM cannot run without the filter.

**A mark is where to listen again, never a verdict.** A rare word heard right
scores low, and a word that was never said leaves no mark at all, only confident
neighbours. Confidence is on each model's own scale, so the floor is per model
(`FLOORS` says where each came from). A word is as sure as its least sure
piece: one garbled syllable is what makes it doubtful.

**`--second-opinion` hears the recording again with the other model** and adds a
third file, `<slug>.<other>.json.gz`, and a section merging the two word by
word: what both heard is written once, what only the first heard as `[-…-]`,
what only the second heard as `{+…+}`. Where they agree the word is settled;
where they part, the recognizer is the suspect. It catches what a mark cannot —
a stretch the first model dropped whole comes back as the other's words on a
line of their own. The two complement each other on a mumbled note: GigaAM got
«разбаливаться», «троечку»; Whisper got «выпил 3 пива», «5-30». Russian only,
since GigaAM hears nothing else.

<<<<<<< HEAD:scripts/transcribe.py
**`--second-opinion-from <json.gz>` merges a hearing already on disk instead**
— a committed `.deepgram.json.gz` among them.
=======
**`--second-opinion-from <whisper.json.gz>` merges a hearing already on disk
instead** — the one `src/music/scripts/song-intake/lyrics.py --json-dir` writes. Sung
vocals are the other way round from speech: the local large-v3 hears them better
than either hosted model, so a song's transcript merges nova-3 with that.
>>>>>>> origin/main:src/kernel/scripts/transcribe.py

`--keyterm` (repeatable, Whisper only) names a word the recording uses that the
model would mishear unprompted — a name, a drug, a coinage.

This script makes no decision a re-run could make differently; the judgement is
`@.claude/skills/dictation/SKILL.md`'s. `ffmpeg` and `ffprobe` are installed if
they are missing, through whichever package manager is on the box.

Exit codes:
  0  - every file written.
  1  - bad arguments or a missing tool.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any, Optional

<<<<<<< HEAD:scripts/transcribe.py
from lib.cli import die
from lib.ears import GIGAAM, MODELS, WHISPER, decode, hear
=======
>>>>>>> origin/main:src/kernel/scripts/transcribe.py
from lib.hearing import alternative, doubts, marked, merged, paragraphs, read_response, write_response

DEFAULT_OUT_DIR = Path("docs") / "remove-before-merging" / "transcripts"
DEFAULT_JSON_DIR = DEFAULT_OUT_DIR
DEFAULT_VAD = 0.5

# From a 3:23 spoken album story heard by both: under GigaAM's 0.6 sat every
# word it plainly misheard but one («сингвельная», 0.88), marking 17% of the
# words the two agreed on; 0.7 marks Whisper's words at about half that share.
FLOORS = {GIGAAM: 0.6, WHISPER: 0.7}

# Below 64k mono, quiet consonants start to drop; above it, only the file
# grows.
AUDIO_ARGS = ["-vn", "-ac", "1", "-c:a", "aac", "-b:a", "64k"]

# What a phone sends through a messenger is already a re-encode, and a generous
# one — the first recording was 1.6 Mbit/s at 464x848 — so CRF 28 took it from
# 83.9 MB to 30.4 MB with nothing visible on paired frames. The audio is copied:
# already at 64 kbit/s, a second pass would only cost a generation.
VIDEO_ARGS = ["-c:v", "libx264", "-crf", "28", "-preset", "veryfast", "-c:a", "copy"]

# Both binaries ship in one package everywhere, so one install covers a missing
# either. Homebrew leads so a Mac is never asked for a password it doesn't need.
FFMPEG_INSTALLERS = (
    ("brew", (["brew", "install", "ffmpeg"],)),
    ("apt-get", (["apt-get", "update"], ["apt-get", "install", "-y", "ffmpeg"])),
    ("dnf", (["dnf", "install", "-y", "ffmpeg"],)),
    ("apk", (["apk", "add", "ffmpeg"],)),
)


def timecode(seconds: float) -> str:
    total = int(seconds)
    return f"{total // 60:02d}:{total % 60:02d}"


def install_commands() -> Optional[list[list[str]]]:
    for manager, commands in FFMPEG_INSTALLERS:
        if shutil.which(manager) is None:
            continue
        root = manager == "brew" or os.geteuid() == 0
        prefix = [] if root or shutil.which("sudo") is None else ["sudo"]
        return [prefix + list(command) for command in commands]
    return None


def missing_ffmpeg() -> list[str]:
    return [tool for tool in ("ffmpeg", "ffprobe") if shutil.which(tool) is None]


def ensure_ffmpeg() -> None:
    missing = missing_ffmpeg()
    if not missing:
        return

    commands = install_commands()
    if commands is None:
        sys.exit(
            f"{' and '.join(missing)} not on PATH, and neither is any package "
            "manager this script knows how to drive. Install ffmpeg and re-run."
        )

    print(f"{' and '.join(missing)} missing — installing ffmpeg.", file=sys.stderr)
    for command in commands:
        print(f"$ {' '.join(command)}", file=sys.stderr)
        if subprocess.run(command).returncode != 0:
            sys.exit("That failed. Run it by hand and re-run this script.")

    still_missing = missing_ffmpeg()
    if still_missing:
        sys.exit(f"ffmpeg installed, but {' and '.join(still_missing)} still not on PATH.")


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
        sys.exit(f"ffprobe could not read {media}:\n{out.stderr.strip()}")
    return json.loads(out.stdout)


def convert(media: Path, dest: Path, args: list[str], label: str) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    out = subprocess.run(
        ["ffmpeg", "-y", "-i", str(media), *args, str(dest)],
        capture_output=True,
        text=True,
    )
    if out.returncode != 0:
        sys.exit(f"ffmpeg failed making {label.lower()} from {media}:\n{out.stderr.strip()}")
    print(
        f"{label}: {dest} ({dest.stat().st_size / 1e6:.1f} MB "
        f"from {media.stat().st_size / 1e6:.1f} MB)"
    )


<<<<<<< HEAD:scripts/transcribe.py
=======
def transcribe(
    audio: Path, model: str, language: Optional[str], keyterms: list[str]
) -> dict[str, Any]:
    params = [*DEEPGRAM_PARAMS.items(), ("model", model)]
    # Asking for a language and asking Deepgram to find one are the same slot;
    # sending both makes the detection a no-op that the header would still
    # report as having run.
    if language:
        params.append(("language", language))
    else:
        params.append(("detect_language", "true"))
    params += [("keyterm", term) for term in keyterms]

    key = os.environ.get("DEEPGRAM_API_KEY", "").strip()
    if not key:
        sys.exit("DEEPGRAM_API_KEY is not set.")

    print(f"Transcribing with {model}…", file=sys.stderr)
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
        sys.exit(f"Deepgram refused the request: {exc.code} {exc.reason}\n{body}")
    except urllib.error.URLError as exc:
        sys.exit(f"Could not reach Deepgram: {exc}")


>>>>>>> origin/main:src/kernel/scripts/transcribe.py
def render_transcript(
    response: dict[str, Any],
    source: Path,
    audio_kept: Optional[Path],
    model: str,
    floor: float,
    keyterms: list[str],
    second: Optional[tuple[str, dict[str, Any]]],
) -> str:
    channel = response["results"]["channels"][0]
    alt = alternative(response)
    metadata = response["metadata"]
    scored, low = doubts(response, floor)
    share = f" ({100 * low / scored:.0f}%)" if scored else ""

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
    ]
    if keyterms:
        lines.append(f"| Keyterms | {', '.join(f'`{t}`' for t in keyterms)} |")
    if second:
        lines.append(f"| Second opinion | `{second[0]}` |")
    lines += [
        f"| Words | {len(alt.get('words') or [])} |",
        f"| Under {floor:g} | {low} of {scored}{share} |",
        "",
        "One line per sentence, timecoded at its start, every word scored under",
        f"{floor:g} marked `[word?]` where it was said — a place to listen again,",
<<<<<<< HEAD:scripts/transcribe.py
        "not a verdict. Generated by `scripts/transcribe.py`; the whole hearing,",
=======
        "not a verdict. Generated by `src/kernel/scripts/transcribe.py`; the whole response,",
>>>>>>> origin/main:src/kernel/scripts/transcribe.py
        "per-word timings included, sits beside this file as",
        f"`<slug>.{model}.json.gz`.",
        "",
        "## Sentences",
        "",
    ]

    found = paragraphs(response)
    if not found:
        lines += ["No speech recognised — check `--language` and `--vad` before anything else.", ""]
    for paragraph in found:
        for sentence in paragraph:
            lines.append(f"- `{timecode(sentence['start'])}` {marked(sentence, floor)}")
        lines.append("")

    if second:
        other, other_response = second
        lines += [
            "## Second opinion",
            "",
            f"`{other}` heard the same recording, merged here word by word: what",
            f"only `{model}` heard is `[-…-]`, what only `{other}` heard is",
            "`{+…+}`. Where they agree the word is settled; where they part, the",
            "recognizer is the suspect, and the place is one to listen to.",
            "",
        ]
        for start, text in merged(response, other_response):
            lines.append(f"- `{timecode(start)}` {text}")
        lines.append("")

    return "\n".join(lines)


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe one recording with a local model.",
    )
    parser.add_argument("media", type=Path, help="audio or video file")
    parser.add_argument("--slug", help="output basename (default: the input's stem)")
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument("--json-dir", type=Path, default=DEFAULT_JSON_DIR)
    parser.add_argument(
        "--audio-out",
        type=Path,
        help="keep the video's sound here as mono AAC",
    )
    parser.add_argument(
        "--video-out",
        type=Path,
        help="also write a re-encoded copy of the video, about a third the size",
    )
    parser.add_argument(
        "--model",
        choices=MODELS,
        help=f"default: {GIGAAM} for --language ru, {WHISPER} otherwise",
    )
    parser.add_argument(
        "--language",
        help=f"force a language code; omitted, {WHISPER} detects one",
    )
    parser.add_argument(
        "--vad",
        type=float,
        default=DEFAULT_VAD,
        metavar="THRESHOLD",
        help=f"voice filter threshold; 0.1 for a song, 0 for none ({WHISPER} only); default {DEFAULT_VAD}",
    )
    opinion = parser.add_mutually_exclusive_group()
    opinion.add_argument(
        "--second-opinion",
        action="store_true",
        help="also hear it with the other model and merge the two word by word; --language ru only",
    )
    opinion.add_argument(
        "--second-opinion-from",
        type=Path,
        metavar="JSON",
        help="merge with this kept hearing instead",
    )
    parser.add_argument(
        "--keyterm",
        action="append",
        default=[],
        metavar="TERM",
        help=f"a word the model would mishear unprompted; repeatable; {WHISPER} only",
    )
    parser.add_argument(
        "--floor",
        type=float,
        help="mark words scored under this as [word?] (default: "
        + ", ".join(f"{m} {f:g}" for m, f in FLOORS.items())
        + ")",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="overwrite outputs that already exist",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)
    model = args.model or (GIGAAM if args.language == "ru" else WHISPER)
    other = WHISPER if model == GIGAAM else GIGAAM
    floor = FLOORS[model] if args.floor is None else args.floor

    if not args.media.is_file():
<<<<<<< HEAD:scripts/transcribe.py
        die(f"No such file: {args.media}")
    if model == GIGAAM and args.language != "ru":
        die(f"{GIGAAM} hears Russian alone; pass --language ru, or --model {WHISPER}.")
    if args.second_opinion and args.language != "ru":
        die(f"--second-opinion needs --language ru: {GIGAAM}, one side of it, hears nothing else.")
    if args.keyterm and model != WHISPER:
        die(f"--keyterm is {WHISPER}'s alone; {model} has no way to take it.")
    if args.vad <= 0 and GIGAAM in (model, other if args.second_opinion else None):
        die(f"{GIGAAM} cannot run without its voice filter; --vad must be above 0.")
=======
        sys.exit(f"No such file: {args.media}")
>>>>>>> origin/main:src/kernel/scripts/transcribe.py
    second = None
    if args.second_opinion_from:
        if not args.second_opinion_from.is_file():
            sys.exit(f"No such file: {args.second_opinion_from}")
        heard = read_response(args.second_opinion_from)
        second = (heard["metadata"].get("model", args.second_opinion_from.name), heard)
<<<<<<< HEAD:scripts/transcribe.py
=======
    if args.keyterm and not args.model.startswith("nova-3"):
        sys.exit(f"--keyterm is nova-3's alone; {args.model} would ignore it.")
>>>>>>> origin/main:src/kernel/scripts/transcribe.py
    ensure_ffmpeg()

    slug = args.slug or args.media.stem
    json_path = args.json_dir / f"{slug}.{model}.json.gz"
    second_path = args.json_dir / f"{slug}.{other}.json.gz" if args.second_opinion else None
    transcript_path = args.out_dir / f"{slug}.transcript.md"
    # Checked before hearing, not after: a hearing takes minutes, and the file
    # it would clobber is usually one someone has since corrected by hand.
    outputs = (json_path, second_path, transcript_path, args.audio_out, args.video_out)
    existing = [p for p in outputs if p is not None and p.exists()]
    if existing and not args.force:
        sys.exit(
            "Refusing to overwrite:\n"
            + "\n".join(f"  {p}" for p in existing)
            + "\nPass --force, or name a different output."
        )

    probed = probe(args.media)
    has_video = any(s["codec_type"] == "video" for s in probed.get("streams", []))
<<<<<<< HEAD:scripts/transcribe.py
    if (args.video_out or args.audio_out) and not has_video:
        die(f"--audio-out and --video-out are for a video; {args.media} carries no video stream.")
    if args.audio_out:
        convert(args.media, args.audio_out, AUDIO_ARGS, "Audio")
    if args.video_out:
        convert(args.media, args.video_out, VIDEO_ARGS, "Video")
=======
    if args.video_out and not has_video:
        sys.exit(f"--video-out was given, but {args.media} carries no video stream.")
>>>>>>> origin/main:src/kernel/scripts/transcribe.py

    pcm = decode(args.media)
    print(f"Hearing with {model}…", file=sys.stderr)
    response = hear(pcm, model, args.language, args.keyterm, args.vad)
    if args.second_opinion:
        print(f"Hearing with {other}…", file=sys.stderr)
        second = (other, hear(pcm, other, args.language, [], args.vad))
    transcript = render_transcript(
        response, args.media, args.audio_out, model, floor, args.keyterm, second
    )

    args.out_dir.mkdir(parents=True, exist_ok=True)
    args.json_dir.mkdir(parents=True, exist_ok=True)
    write_response(json_path, response)
    print(f"Wrote {json_path}")
    if second_path and second:
        write_response(second_path, second[1])
        print(f"Wrote {second_path}")
    transcript_path.write_text(transcript, encoding="utf-8")

    print(f"Wrote {transcript_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
