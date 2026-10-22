"""A song's analysis as data: what its picture is drawn from, for a reader that draws its own.

`spectrogram.py` writes `song_data` as <slug>.json beside the PNG and the
sidecar. It holds the sidecar's facts at full precision and the time series
the picture shows only as colour, numpy only like `song_facts.py`, so it is
built and tested without matplotlib. The spectrogram's own dB map is the one
thing drawn and not kept: it is several times the rest, and a picture of the
spectrum is the one view that wants the audio anyway.

The object, times in seconds:

- `version` — VERSION, bumped when a field changes meaning.
- `song`, `duration`, `tuning` in cents off A440, `tempo` the BPM the beats
  keep (null with under two), `keys` the KEYS best as {tonic, mode, r},
  `noteNames` the pitch classes C to B as the best key spells them.
- `beats`, and `chords` parallel to them, each spelled ('Gm', 'N' where the
  accompaniment is too quiet to name one); `bars`, the downbeats the section
  zooms draw.
- `sections`, as the sidecar numbers them: {start, end, bpm, db, chords with
  runs merged, folded — the sidecar's text of them}.
- `drums`: {lanes, hits}, each hit [time, then each lane's brightness 0–1].
- `frames`, the series at a fixed RATE rather than the picture's columns,
  frame i spanning i·step to (i+1)·step: `level`, each frame's peak and RMS in
  dBFS, and per pitch strip {stem, octaves, shares, octave} — 12 rows, C
  first, of each pitch class's percent of the strip (0 where the stem is
  quiet) and the octave carrying it, as the picture colours them.
"""

import numpy as np

from audio import FLOOR_DB, QUIET
from drums import LANES
from harmony import chord_name, folded, note_names
from pitch import NOTE_BAND_HZ, chroma_shares
from rhythm import beats_bpm

VERSION = 1
# Frames a second. The strips are smoothed over NOTE_WINDOW_S, 0.6 s, so this
# keeps all they hold.
RATE = 5
KEYS = 3
# The pitch strips, top to bottom: each its label, the stem it reads, the
# band it reads and the octaves it can colour. The bass's band ends half a
# semitone under C4.
BASS_TOP_HZ = 254
STRIPS = (
    ("melody", "vocals", NOTE_BAND_HZ, (2, 6)),
    ("harmony", "other", NOTE_BAND_HZ, (2, 6)),
    ("bass", "bass", (NOTE_BAND_HZ[0], BASS_TOP_HZ), (2, 3)),
)


def envelope(x, columns):
    """Per column: the peak, and the RMS that sits inside it."""
    n = len(x) // columns
    blocks = x[: n * columns].reshape(columns, n)
    return np.abs(blocks).max(axis=1), np.sqrt((blocks.astype(np.float64) ** 2).mean(axis=1))


def strip_shares(samples, magnitude, freqs, step, duration, columns, band_hz, octaves, tuning):
    """`chroma_shares` of one strip's stem, dark wherever the stem's RMS is under QUIET."""
    shares, octave = chroma_shares(magnitude, freqs, step, duration, columns, band_hz, octaves, tuning)
    # Silence has spectral peaks too, of noise; it stays dark however clear they look.
    shares[:, envelope(samples, columns)[1] < QUIET] = 0
    return shares, octave


def seconds(times):
    return [round(float(t), 3) for t in times]


def bpm(value):
    """A tempo to a tenth of a BPM, None staying None: a stretch with no beat."""
    return None if value is None else round(value, 1)


def dbfs(levels):
    return [round(float(v), 1) for v in 20 * np.log10(np.maximum(levels, 10 ** (FLOOR_DB / 20)))]


def song_data(name, facts, drums, tracks):
    """The JSON-ready object the module docstring describes. tracks is
    `spectrogram.py`'s: per track, its samples and their drawing STFT."""
    _, tonic, mode = facts.keys[0]
    names = note_names(tonic, mode)
    x, (_, freqs, step, _) = tracks["mix"]
    columns = max(1, round(facts.duration * RATE))
    peak, rms = envelope(x, columns)
    frames = {"step": round(facts.duration / columns, 6), "level": {"peak": dbfs(peak), "rms": dbfs(rms)}}
    for label, track, band_hz, octaves in STRIPS:
        samples, (magnitude, *_) = tracks[track]
        shares, octave = strip_shares(samples, magnitude, freqs, step, facts.duration, columns, band_hz, octaves, facts.tuning)
        frames[label] = {
            "stem": track, "octaves": list(octaves),
            "shares": np.round(100 * shares).astype(int).tolist(), "octave": octave.tolist(),
        }
    times, lit = drums
    return {
        "version": VERSION,
        "song": name,
        "duration": round(facts.duration, 3),
        "tuning": round(facts.tuning, 1),
        "tempo": bpm(beats_bpm(facts.beats)),
        "keys": [{"tonic": note_names(t, m)[t], "mode": m, "r": round(r, 3)} for r, t, m in facts.keys[:KEYS]],
        "noteNames": list(names),
        "beats": seconds(facts.beats),
        "chords": [chord_name(c, names) for c in facts.chords],
        "bars": seconds(facts.bars),
        "sections": [
            {
                "start": round(s.start, 3), "end": round(s.end, 3),
                "bpm": bpm(s.bpm), "db": round(float(s.db), 1),
                "chords": [chord_name(c, names) for c in s.chords],
                "folded": folded([chord_name(c, names) for c in s.chords]),
            }
            for s in facts.sections
        ],
        "drums": {
            "lanes": list(LANES),
            "hits": [[round(float(t), 3), *(round(float(v), 2) for v in row)] for t, row in zip(times, lit)],
        },
        "frames": frames,
    }
