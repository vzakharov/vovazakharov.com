"""Where a transcript is unsure: doubtful words marked in place, and two
models' hearings of one recording merged word by word.

A response is shaped as Deepgram's `/v1/listen` answers, because the kept
hearings include that API's, read alongside the local ones:
`results.channels[0].alternatives[0]` holding `words` and `paragraphs`,
`metadata` holding `duration` and the `model` that heard it.

Imported as `from lib.hearing import …`; pure functions over parsed responses,
so `test_hearing.py` beside it runs them on fixtures with no model. The
exceptions are `write_response` and `read_response`, the format every kept
response shares.

Stdlib only — no third-party deps. Python 3.9+.
"""

from __future__ import annotations

import bisect
import gzip
import json
import math
from pathlib import Path
from typing import Any, Optional

Response = dict[str, Any]
Line = dict[str, Any]

# How far apart two models may place one word and still be said to agree on it.
# On a mumbled tape the aligner otherwise pairs a «был» at 0:21 with a «был» at
# 0:37 and calls the gap between them settled.
SAME_WORD_SECONDS = 3.0

# Punctuation a recognizer glues onto a word, kept outside a doubt's marker:
# `[Keko?],` reads, `[Keko,?]` reads as a doubt about the comma.
TRAILING = ".,;:!?…»)\"'"
LEADING = "«(\"'"

# A word ending in one of these ends its sentence, so a long stretch the voice
# filter kept whole still reads as one timecoded line per sentence.
SENTENCE_END = ".!?…"

# A word's start can sit a float's rounding before the sentence that holds it.
_EPSILON = 1e-6


def alternative(response: Response) -> dict[str, Any]:
    """The one hearing a request for a single channel and alternative gets."""
    return response["results"]["channels"][0]["alternatives"][0]


def _written(word: dict[str, Any]) -> str:
    """The word as the transcript prints it, punctuation included where formatted."""
    return word.get("punctuated_word", word["word"])


def _bare(text: str) -> str:
    return text.lower().strip(TRAILING + LEADING + "-")


def from_segments(segments: list[dict[str, Any]], duration: float, model: str) -> Response:
    """A local hearing in the response shape, so `merged` reads it as it reads
    a kept Deepgram one.

    `segments` are stretches of speech, each a dict whose `words` carry `word`,
    `start`, `end` and `probability` — faster-whisper's segments run with
    `word_timestamps`, or `words_from_tokens`' output for a token model. Each
    becomes one sentence per sentence-ending word in it, starting at its first
    word, since a segment's own start can sit across the instrumental before
    it. The probability fills `confidence`, on the model's own scale.
    `metadata.model` names the hearing — a key the API itself never sets.
    """
    words: list[dict[str, Any]] = []
    sentences = []
    for segment in segments:
        spoken = []
        for word in segment["words"]:
            written = word["word"].strip()
            bare = _bare(written)
            if not bare:
                continue
            spoken.append(
                {
                    "word": bare,
                    "punctuated_word": written,
                    "start": word["start"],
                    "end": word["end"],
                    "confidence": word["probability"],
                }
            )
        words += spoken
        while spoken:
            cut = next(
                (k + 1 for k, w in enumerate(spoken) if w["punctuated_word"][-1] in SENTENCE_END),
                len(spoken),
            )
            said, spoken = spoken[:cut], spoken[cut:]
            sentences.append(
                {
                    "text": " ".join(w["punctuated_word"] for w in said),
                    "start": said[0]["start"],
                    "end": said[-1]["end"],
                }
            )
    alt = {
        "transcript": " ".join(s["text"] for s in sentences),
        "words": words,
        "paragraphs": {"paragraphs": [{"sentences": sentences}] if sentences else []},
    }
    return {
        "metadata": {"duration": duration, "model": model},
        "results": {"channels": [{"alternatives": [alt]}]},
    }


def words_from_tokens(
    tokens: list[str],
    times: list[float],
    logprobs: Optional[list[float]],
    end: float,
) -> list[dict[str, Any]]:
    """A token model's output as words in `from_segments`' shape.

    `tokens` are as onnx-asr decodes them, a word's first one opening with a
    space (or SentencePiece's `▁`); `times` their absolute starts. A word ends
    where the next one starts, the last at `end`. Its probability is its least
    sure token's: one garbled syllable is what makes a word doubtful, and an
    average over the rest would hide it. No logprobs, no probability — and
    `marked` then leaves the line plain.
    """
    words: list[dict[str, Any]] = []
    for k, token in enumerate(tokens):
        piece = token.replace("▁", " ")
        sure = math.exp(logprobs[k]) if logprobs is not None else None
        if piece.startswith(" ") or not words:
            words.append({"word": piece.strip(), "start": times[k], "probability": sure})
        else:
            words[-1]["word"] += piece
            if sure is not None and words[-1]["probability"] is not None:
                words[-1]["probability"] = min(words[-1]["probability"], sure)
    for word, after in zip(words, words[1:]):
        word["end"] = after["start"]
    if words:
        words[-1]["end"] = max(end, words[-1]["start"])
    return [w for w in words if w["word"]]


def write_response(path: Path, response: Response) -> None:
    # mtime=0 so the same response gzips to the same bytes on every run.
    with gzip.GzipFile(path, "wb", compresslevel=9, mtime=0) as gz:
        gz.write((json.dumps(response, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))


def read_response(path: Path) -> Response:
    with gzip.open(path, "rt", encoding="utf-8") as f:
        return json.load(f)


def paragraphs(response: Response) -> list[list[Line]]:
    """The response's sentences, grouped in its paragraphs, each carrying the
    words said within it.

    A word belongs to the last sentence starting at or before it, which on
    every response kept so far rebuilds each sentence's text exactly. A
    response with no paragraphs is one sentence of its whole transcript, and
    one with no speech is an empty list.
    """
    alt = alternative(response)
    words = alt.get("words") or []
    found = [
        [dict(s, words=[]) for s in p["sentences"]]
        for p in (alt.get("paragraphs") or {}).get("paragraphs", [])
    ]
    if not found:
        text = (alt.get("transcript") or "").strip()
        if not text:
            return []
        start = words[0]["start"] if words else 0.0
        end = words[-1]["end"] if words else start
        found = [[{"start": start, "end": end, "text": text, "words": []}]]

    flat = [line for paragraph in found for line in paragraph]
    starts = [line["start"] for line in flat]
    for word in words:
        index = bisect.bisect_right(starts, word["start"] + _EPSILON) - 1
        flat[max(index, 0)]["words"].append(word)
    return found


def mark(text: str) -> str:
    core = text.rstrip(TRAILING)
    body = core.lstrip(LEADING)
    if not body:
        return text
    lead = core[: len(core) - len(body)]
    return f"{lead}[{body}?]{text[len(core):]}"


def marked(line: Line, floor: float) -> str:
    """The sentence with every word scored under `floor` wrapped as `[word?]`.

    The plain text where any word carries no confidence: a line of unmarked
    text is still readable, a line of guesses at which word was meant is not.
    """
    words = line["words"]
    if not words or any(w.get("confidence") is None for w in words):
        return line["text"]
    out = []
    for word in words:
        text = _written(word)
        out.append(mark(text) if word["confidence"] < floor else text)
    return " ".join(out)


def doubts(response: Response, floor: float) -> tuple[int, int]:
    """How many words carry a confidence, and how many of those fall under
    `floor` — printed whether or not any do, since the share is what makes two
    recordings comparable."""
    words = alternative(response).get("words") or []
    scored = [w for w in words if w.get("confidence") is not None]
    return len(scored), sum(1 for w in scored if w["confidence"] < floor)


def _heard(response: Response) -> list[dict[str, Any]]:
    """Every word, keyed for comparison and tagged with its sentence's span —
    the span being what a merged line is placed and timecoded by."""
    out = []
    for paragraph in paragraphs(response):
        for line in paragraph:
            for word in line["words"]:
                out.append(
                    {
                        "text": _written(word),
                        "key": _bare(word["word"]).replace("ё", "е"),
                        "start": word["start"],
                        "line": line["start"],
                        "end": line["end"],
                    }
                )
    return out


def _aligned(a: list[dict[str, Any]], b: list[dict[str, Any]]) -> list[tuple[int, int]]:
    """The longest run of `(i, j)` pairs, rising in both, where `a[i]` and
    `b[j]` are one word heard within `SAME_WORD_SECONDS` of each other.

    The window is part of the match rather than a check after it: a song sings
    its chorus four times, and an alignment blind to time pairs one model's
    first chorus with the other's second, leaving every verse between them a
    disagreement.
    """
    by_key: dict[str, list[int]] = {}
    for j, word in enumerate(b):
        by_key.setdefault(word["key"], []).append(j)
    # The longest chain is the longest strictly rising run of j over the pairs
    # in i order; j descending within one i keeps an i from pairing twice.
    pairs = [
        (i, j)
        for i, word in enumerate(a)
        for j in reversed(by_key.get(word["key"], []))
        if abs(word["start"] - b[j]["start"]) <= SAME_WORD_SECONDS
    ]
    tails: list[int] = []  # tails[n]: the pair ending the best chain of n + 1
    ends: list[int] = []  # that pair's j, for the search
    back: list[int] = []
    for index, (_, j) in enumerate(pairs):
        n = bisect.bisect_left(ends, j)
        back.append(tails[n - 1] if n else -1)
        if n == len(tails):
            tails.append(index)
            ends.append(j)
        else:
            tails[n] = index
            ends[n] = j
    chain = []
    index = tails[-1] if tails else -1
    while index >= 0:
        chain.append(pairs[index])
        index = back[index]
    return chain[::-1]


def merged(first: Response, second: Response) -> list[tuple[float, str]]:
    """Two hearings of one recording as `(sentence start, text)` lines.

    What both models heard alike is written once; where they part, the first
    model's words go in `[-…-]` and the second's in `{+…+}`. Words compare
    lowercased, `ё` as `е` and without punctuation, so a comma one model put and
    the other didn't is no disagreement. A word both heard counts as agreement
    only within `SAME_WORD_SECONDS` of each other. The second model's words join
    the first model's sentence whose span they fall within; a stretch only the
    second heard keeps its own timecode, on a line of its own — on a mumbled
    tape one model drops whole seconds that the other still turns into words.
    """
    a, b = _heard(first), _heard(second)
    runs: list[tuple[list, list, bool]] = []  # first's words, second's, agree
    i = j = 0
    for k, m in _aligned(a, b) + [(len(a), len(b))]:
        if i < k or j < m:
            runs.append((a[i:k], b[j:m], False))
        if k < len(a):
            runs.append(([a[k]], [b[m]], True))
        i, j = k + 1, m + 1

    pieces: list[tuple[float, float, str]] = []  # time, line start, text
    previous = None  # the first model's last word, which an insertion follows
    for ours, theirs, same in runs:
        if same:
            pieces.append((ours[0]["start"], ours[0]["line"], ours[0]["text"]))
            previous = ours[0]
            continue
        anchors = list({w["line"]: w for w in ours}.values())
        if not anchors and previous is not None:
            anchors = [previous]
        groups = {
            anchor["line"]: ([w for w in ours if w["line"] == anchor["line"]], [])
            for anchor in anchors
        }
        far = []
        for word in theirs:
            home = next(
                (x["line"] for x in anchors if x["line"] <= word["start"] <= x["end"]),
                None,
            )
            (groups[home][1] if home is not None else far).append(word)
        for start, (mine, near) in groups.items():
            text = ""
            if mine:
                text += "[-" + " ".join(w["text"] for w in mine) + "-]"
            if near:
                text += "{+" + " ".join(w["text"] for w in near) + "+}"
            if text:
                pieces.append(((mine or near)[0]["start"], start, text))
        for start in dict.fromkeys(w["line"] for w in far):
            group = [w for w in far if w["line"] == start]
            text = "{+" + " ".join(w["text"] for w in group) + "+}"
            pieces.append((group[0]["start"], start, text))
        if ours:
            previous = ours[-1]

    lines: list[tuple[float, list[str]]] = []
    # By sentence, then by time within it: on a mumbled tape nova-3 files a word
    # under a sentence that started seconds before it was said. Two sentences
    # starting in the same second share a timecode, so they share a line.
    for _, start, text in sorted(pieces, key=lambda piece: (piece[1], piece[0])):
        if lines and int(lines[-1][0]) == int(start):
            lines[-1][1].append(text)
        else:
            lines.append((start, [text]))
    return [
        (start, " ".join(texts).replace("+} {+", " ").replace("-] [-", " "))
        for start, texts in lines
    ]
