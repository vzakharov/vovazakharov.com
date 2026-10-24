"""What the sidecar states about a song, measured off its audio.

The measurements live in `audio.py`, `pitch.py`, `rhythm.py` and `harmony.py`,
numpy only, so the analysis runs and is tested without matplotlib; the drawing
is `spectrogram.py`'s.
"""

from typing import NamedTuple

import numpy as np

from audio import SR, mmss
from drums import LANES
from harmony import beat_chords, folded, note_names, runs, song_key
from pitch import NOTE_BAND_HZ, peak_chroma, section_times, tuning_cents
from rhythm import TEMPO_SPREAD, beat_times, beats_bpm, downbeats, onset_envelope, tempo_bpm


class Section(NamedTuple):
    start: float
    end: float
    bpm: float | None
    db: float
    chords: list


class Facts(NamedTuple):
    duration: float
    tuning: float
    keys: list
    beats: np.ndarray
    bars: np.ndarray
    sections: list


def measure(x, magnitude, freqs, step, db, harmony, drums):
    """Everything the sidecar states, from the samples and the drawing's STFT.

    harmony is the same STFT of the song less its voice — demucs's other and
    bass stems summed — which the chords are read off, so the melody's
    passing notes do not vote in them. The key is the whole mix's, the
    melody being what dwells on the tonic. drums is `drum_hits` of the drums
    stem, whose snares place the bars."""
    duration = len(x) / SR
    tuning = tuning_cents(magnitude, freqs)
    envelope, onset_step = onset_envelope(x)
    beats = beat_times(envelope, onset_step, tempo_bpm(envelope, onset_step))
    chroma, loudest = peak_chroma(harmony, freqs, NOTE_BAND_HZ, (2, 6), tuning, fundamentals=True)
    chords = beat_chords(chroma, loudest, step, beats, duration)
    whole, _ = peak_chroma(magnitude, freqs, NOTE_BAND_HZ, (2, 6), tuning, fundamentals=True)
    pitch_classes = whole.reshape(len(whole), -1, 12).sum(axis=(0, 1))
    edges = [0, *section_times(db, magnitude, freqs, step, duration, tuning), duration]
    sections = []
    for start, end in zip(edges[:-1], edges[1:]):
        inside = (beats >= start) & (beats < end)
        samples = x[int(start * SR):int(end * SR)].astype(np.float64)
        rms = np.sqrt((samples ** 2).mean()) if len(samples) else 0
        sections.append(Section(
            start, end, beats_bpm(beats[inside]), 20 * np.log10(max(rms, 1e-10)),
            runs([chords[i] for i in np.flatnonzero(inside)]),
        ))
    times, lit = drums
    snare = lit[:, LANES.index("snare")]
    bars = downbeats(beats, chords, (times[snare > 0], snare[snare > 0]), edges)
    return Facts(duration, tuning, song_key(pitch_classes), beats, bars, sections)


def tempo_spread(facts):
    """The slowest and fastest section's tempo, or None where they are within TEMPO_SPREAD."""
    tempos = [s.bpm for s in facts.sections if s.bpm]
    if tempos and max(tempos) / min(tempos) > 1 + TEMPO_SPREAD:
        return min(tempos), max(tempos)
    return None


def tempo_label(facts):
    """'76 BPM', or '74–79 BPM' where the sections' tempos spread."""
    spread = tempo_spread(facts)
    if spread:
        return f"{spread[0]:.0f}–{spread[1]:.0f} BPM"
    return f"{beats_bpm(facts.beats):.0f} BPM" if len(facts.beats) > 1 else "no beat"


def tuning_label(cents):
    return f"A = 440 Hz {cents:+.0f} ¢".replace("-", "−")


def sidecar(name, facts):
    """The sidecar's text: the numbers the picture can only approximate."""
    (r, tonic, mode), (r2, tonic2, mode2) = facts.keys[:2]
    names = note_names(tonic, mode)

    def spell(chord):
        return "N" if chord is None else names[chord[0]] + chord[1]

    tempo = tempo_label(facts)
    if tempo_spread(facts):
        tempo += f", median {beats_bpm(facts.beats):.0f}"
    barred = [str(n) for n, s in enumerate(facts.sections, 1) if ((facts.bars >= s.start) & (facts.bars < s.end)).any()]
    zooms = f"the section zooms numbered {', '.join(barred)}" if barred else "no zoom"
    lines = [
        f"{name} — {mmss(facts.duration)}",
        f"tempo {tempo}",
        f"key {names[tonic]} {mode} (r {r:.2f}; next {names[tonic2]} {mode2}, {r2:.2f})",
        f"tuning {tuning_label(facts.tuning)}",
        f"bars drawn on {zooms} — only where the snare or the chord changes settle where one starts,"
        " so a section without them still has bars; the whole song's picture draws none",
        "sections — number, start–end, tempo, loudness, chords with runs merged and a repeating loop folded"
        " (N: no chord, the accompaniment too quiet to name one):",
    ]
    for n, s in enumerate(facts.sections, 1):
        bpm = f"{s.bpm:.0f} BPM" if s.bpm else "– BPM"
        chords = folded([spell(c) for c in s.chords])
        lines.append(f"{n}  {mmss(s.start)}–{mmss(s.end)}  {bpm}  {s.db:.0f} dB  {chords}".replace("-", "−"))
    return "\n".join(lines) + "\n"
