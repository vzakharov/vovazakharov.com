"""Hear a recording on this machine's CPU: GigaAM-v3 or Whisper large-v3, each
answering in `lib.hearing`'s response shape.

Imported as `from lib.ears import …` by scripts run under
`tmp/hearing-venv` (`src/kernel/scripts/requirements-hearing.txt`). Models download from
Hugging Face on first use; onnx-asr's go under `tmp/models/` as plain
directories, because onnxruntime refuses external weights behind the Hugging
Face cache's symlinks ("External data path escapes model directory").

What the models were picked for, measured on a sung vocal and a voice note, is
in `src/kernel/scripts/transcribe.py`'s docstring.
"""

from __future__ import annotations

import subprocess
from functools import cache
from pathlib import Path
from typing import Any, Optional

import numpy as np

from lib.ctc import spans
from lib.hearing import Response, from_segments, words_from_tokens

GIGAAM = "gigaam-v3"
WHISPER = "whisper-large-v3"
MODELS = (GIGAAM, WHISPER)

SAMPLE_RATE = 16000
MODEL_DIR = Path(__file__).resolve().parents[2] / "tmp" / "models"

# GigaAM's CTC head emits a frame every 40 ms. A whole song fits in one pass,
# but an hour-long dictation does not fit in memory, so the frames are computed
# in windows, each padded on both sides so no frame is read off a cut edge.
CTC_WINDOW_SECONDS = 30.0
CTC_PAD_SECONDS = 2.0

# The words are aligned in stretches rather than all at once: the Viterbi
# table is frames × letters, which past a few minutes outgrows memory. A
# stretch closes at the first pause this long once it has run this long — or
# at the max, pause or none — and reads the frames a margin either side of
# where Whisper put it, Whisper's own timings drifting a second or more.
ALIGN_STRETCH_SECONDS = 30.0
ALIGN_STRETCH_MAX_SECONDS = 90.0
ALIGN_PAUSE_SECONDS = 0.8
ALIGN_MARGIN_SECONDS = 3.0


def decode(media: Path) -> np.ndarray:
    """Any file ffmpeg reads, as mono 16 kHz float32 — the one input both
    model families take. onnx-asr refuses stereo, and faster-whisper's own
    PyAV path changes its keyword arguments between releases."""
    out = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(media), "-ac", "1", "-ar", str(SAMPLE_RATE), "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    )
    return np.frombuffer(out.stdout, np.float32)


@cache
def _onnx(name: str) -> Any:
    import onnx_asr

    return onnx_asr.load_model(name, path=MODEL_DIR / name)


@cache
def _vad() -> Any:
    import onnx_asr

    return onnx_asr.load_vad("silero", path=MODEL_DIR / "silero")


@cache
def _whisper() -> Any:
    from faster_whisper import WhisperModel

    return WhisperModel("large-v3", device="cpu", compute_type="int8")


def _gigaam(pcm: np.ndarray, vad: float) -> list[dict[str, Any]]:
    # The voice filter goes on before the timestamps: in the other order
    # onnx-asr returns the filtered segments as plain text.
    model = _onnx("gigaam-v3-e2e-rnnt").with_vad(_vad(), threshold=vad).with_timestamps()
    segments = []
    for heard in model.recognize(pcm, sample_rate=SAMPLE_RATE):
        if not heard.tokens:
            continue
        times = [heard.start + t for t in heard.timestamps]
        segments.append({"words": words_from_tokens(heard.tokens, times, heard.logprobs, heard.end)})
    return segments


def _whisper_segments(
    pcm: np.ndarray, language: Optional[str], keyterms: list[str], vad: float
) -> tuple[list[dict[str, Any]], str]:
    heard, info = _whisper().transcribe(
        pcm,
        language=language,
        beam_size=5,
        # Off, or one invented line seeds the next and a song's silence fills
        # with a chain of them.
        condition_on_previous_text=False,
        word_timestamps=True,
        vad_filter=vad > 0,
        vad_parameters={"threshold": vad} if vad > 0 else None,
        hotwords=" ".join(keyterms) or None,
    )
    segments = []
    for s in heard:
        words: list[dict[str, Any]] = []
        for w in s.words:
            # A word opens with a space; a piece without one is the rest of
            # the word before it — Whisper hears «какой-то» as «какой» and «-то».
            if words and not w.word.startswith(" "):
                words[-1]["word"] += w.word
                words[-1]["end"] = w.end
                words[-1]["probability"] = min(words[-1]["probability"], w.probability)
            else:
                words.append({"word": w.word, "start": w.start, "end": w.end, "probability": w.probability})
        segments.append({"words": words})
    return segments, info.language


def frames(pcm: np.ndarray) -> tuple[np.ndarray, float, dict[str, int]]:
    """GigaAM-v3 CTC's per-frame log-probabilities over the whole recording,
    the seconds a frame spans, and its vocabulary, token → id."""
    asr = _onnx("gigaam-v3-ctc").asr
    step = asr.window_step * asr._subsampling_factor
    window = int(CTC_WINDOW_SECONDS * SAMPLE_RATE)
    pad = int(CTC_PAD_SECONDS * SAMPLE_RATE)
    parts = []
    for start in range(0, len(pcm), window):
        lo, hi = max(start - pad, 0), min(start + window + pad, len(pcm))
        chunk = pcm[lo:hi]
        log_probs, lens = asr._encode(*asr._preprocessor(chunk[None], np.array([len(chunk)])))
        log_probs = log_probs[0, : lens[0]]
        first = round((start - lo) / SAMPLE_RATE / step)
        keep = round(min(window, len(pcm) - start) / SAMPLE_RATE / step)
        parts.append(log_probs[first : first + keep])
    vocab = {token: index for index, token in asr._vocab.items()}
    return np.concatenate(parts), step, vocab


def _spelled(word: str, vocab: dict[str, int]) -> list[int]:
    # GigaAM spells lowercase а–я without ё; digits and Latin it cannot spell
    # at all, so such a word keeps the time Whisper gave it.
    return [vocab[c] for c in word.lower().replace("ё", "е") if c in vocab and c != " "]


def _stretches(words: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    out: list[list[dict[str, Any]]] = []
    for word in words:
        if out:
            run = word["start"] - out[-1][0]["start"]
            pause = word["start"] - out[-1][-1]["end"]
            if run < ALIGN_STRETCH_SECONDS or (pause < ALIGN_PAUSE_SECONDS and run < ALIGN_STRETCH_MAX_SECONDS):
                out[-1].append(word)
                continue
        out.append([word])
    return out


def place(pcm: np.ndarray, segments: list[dict[str, Any]]) -> None:
    """Re-time Russian words, in place, to where GigaAM-v3 CTC hears their
    letters. A word with nothing GigaAM can spell keeps Whisper's timing."""
    log_probs, step, vocab = frames(pcm)
    blank, space = vocab["<blk>"], vocab[" "]
    words = [w for s in segments for w in s["words"]]
    for stretch in _stretches(words):
        lo = max(int((stretch[0]["start"] - ALIGN_MARGIN_SECONDS) / step), 0)
        hi = min(int((stretch[-1]["end"] + ALIGN_MARGIN_SECONDS) / step) + 1, len(log_probs))
        found = spans(log_probs[lo:hi], [_spelled(w["word"], vocab) for w in stretch], blank, space)
        for word, (first, last) in zip(stretch, found):
            if first >= 0:
                word["start"] = (lo + first) * step
                word["end"] = (lo + last + 1) * step


def hear(
    pcm: np.ndarray, model: str, language: Optional[str], keyterms: list[str], vad: float
) -> Response:
    """One hearing of the recording as a response, `detected_language` set on
    its channel as the API sets it. Whisper's words on Russian are re-timed by
    `place`. GigaAM hears Russian alone and takes no keyterms; its voice
    filter cannot be off, since unfiltered it hears a long file as one
    segment it has no memory for."""
    if model == GIGAAM:
        segments, language = _gigaam(pcm, vad), "ru"
    else:
        segments, language = _whisper_segments(pcm, language, keyterms, vad)
        if language == "ru":
            place(pcm, segments)
    response = from_segments(segments, len(pcm) / SAMPLE_RATE, model)
    response["results"]["channels"][0]["detected_language"] = language
    return response
