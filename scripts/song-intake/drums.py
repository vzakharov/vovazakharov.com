"""A song's drums as four lanes — kick, toms, snare, cymbals — each as bright as its hits.

A hit is a sudden rise: per 23 ms frame, how far each of nine bands climbs over
its quietest in the frames before. A kit piece rises in its own bands and not
in others, so each frame's rises are unmixed onto one fixed band signature per
lane by non-negative least squares, and a lane is as bright as its share.

The signatures are heuristics, read off hits measured in the catalogue's mixes
rather than learned: a kick rises most under 250 Hz and clicks at 2.5–8 kHz; a
tom rises at 60–500 Hz with nothing under 60; a snare or clap is noise from
1 kHz up over a 120–500 Hz body; a cymbal is noise above 2.5 kHz alone, which
is what tells it from a snare. A kick's click, body and pitch sweep land a
frame or two apart, so each band's rise is the most it reaches across a few
frames around the hit, and the hit unmixes whole instead of lighting toms and
cymbals with its parts.

There is no harmonic/percussive separation first: at the 21.5 Hz bins a 23 ms
frame allows, a kick's few low bins look harmonic and the separation erases it.
"""

import numpy as np

from audio import SR, stft_magnitude

DRUM_NFFT = 1024
LANES = ("kick", "toms", "snare", "cymbals")
BAND_EDGES_HZ = (30, 60, 120, 250, 500, 1000, 2500, 5000, 8000, SR / 2)
# Per kit piece, its lane and how far each band rises on its hits, relative to
# its loudest band. A lane may hold several: a kick with a click and without,
# an acoustic snare and a clap.
PIECES = (
    ("kick", (0.85, 0.85, 1.0, 0.3, 0.15, 0.2, 0.3, 0.6, 0.35)),
    ("kick", (0.9, 1.0, 0.6, 0.3, 0.2, 0.25, 0.2, 0.25, 0.25)),
    ("toms", (0.0, 0.3, 1.0, 0.5, 0.25, 0.1, 0.05, 0.0, 0.0)),
    ("snare", (0.05, 0.1, 0.6, 1.0, 0.7, 0.35, 0.4, 0.45, 0.3)),
    ("snare", (0.0, 0.05, 0.15, 0.2, 0.2, 0.35, 0.65, 1.0, 0.5)),
    ("cymbals", (0.0, 0.0, 0.0, 0.0, 0.0, 0.03, 0.3, 1.0, 0.85)),
)
# A band rises over its minimum in this many frames before.
RISE_FRAMES = 4
# A hit's rises are pooled over this many frames before it and after it.
HIT_BEFORE, HIT_AFTER = 1, 4
BAND_FLOOR_DB = -80
# Music without drums rises a few dB in every band from frame to frame; a lane
# is black up to NOISE_RISE_DB and full at FULL_RISE_DB.
NOISE_RISE_DB, FULL_RISE_DB = 4, 14
UNMIX_ITERATIONS = 100
# A hit is a lane's peak over this many frames either side, at a frame whose
# total rise is at least CENTRAL_SHARE of the most over as many.
PEAK_FRAMES = 3
CENTRAL_SHARE = 0.7


def band_rises(x):
    """Per frame and band, the rise in dB pooled over the hit: (rises, step in s)."""
    magnitude, freqs, step = stft_magnitude(x, DRUM_NFFT, DRUM_NFFT // 2)
    power = magnitude.astype(np.float64) ** 2
    band = np.digitize(freqs, BAND_EDGES_HZ) - 1
    energy = np.stack([power[:, band == b].sum(axis=1) for b in range(len(BAND_EDGES_HZ) - 1)], axis=1)
    level = 10 * np.log10(np.maximum(energy, 10 ** (BAND_FLOOR_DB / 10)))
    padded = np.pad(level, ((RISE_FRAMES, 0), (0, 0)), mode="edge")
    before = np.min([padded[RISE_FRAMES - k:len(padded) - k] for k in range(1, RISE_FRAMES + 1)], axis=0)
    rise = np.maximum(level - before, 0)
    padded = np.pad(rise, ((HIT_BEFORE, HIT_AFTER), (0, 0)))
    return np.max([padded[k:k + len(rise)] for k in range(HIT_BEFORE + HIT_AFTER + 1)], axis=0), step


def unmix(rise):
    """Each lane's share of each frame's rises, in dB: the non-negative least
    squares of the rises onto PIECES, summed per lane, as (frames, len(LANES))."""
    w = np.array([signature for _, signature in PIECES])
    a = np.full((len(rise), len(w)), 1.0) * rise.mean(axis=1, keepdims=True)
    top = rise @ w.T
    gram = w @ w.T
    for _ in range(UNMIX_ITERATIONS):
        a *= top / np.maximum(a @ gram, 1e-12)
    lane = np.array([LANES.index(name) for name, _ in PIECES])
    return np.stack([a[:, lane == k].sum(axis=1) for k in range(len(LANES))], axis=1)


def around(v):
    """v's maximum over PEAK_FRAMES either side of each frame."""
    padded = np.pad(v, ((PEAK_FRAMES, PEAK_FRAMES),) + ((0, 0),) * (v.ndim - 1))
    return np.max([padded[k:k + len(v)] for k in range(2 * PEAK_FRAMES + 1)], axis=0)


def hits(rise):
    """Each lane's rise in dB at the frames where it peaks, 0 between, as (frames, len(LANES)).

    A peak counts only where the frame's total rise is near the most around it:
    the frames whose pooling reaches only the edge of a hit, such as a kick's
    sweep before it gets to the lowest band, unmix as some other piece."""
    lanes = unmix(rise)
    total = rise.sum(axis=1)
    central = total >= CENTRAL_SHARE * around(total)
    return np.where((lanes >= around(lanes)) & central[:, None], lanes, 0)


def drum_lanes(x, duration, columns):
    """Per column of the plot, each lane's brightness 0–1, as (len(LANES), columns)."""
    rise, step = band_rises(x)
    lit = np.clip((hits(rise) - NOISE_RISE_DB) / (FULL_RISE_DB - NOISE_RISE_DB), 0, 1)
    start = np.minimum((np.arange(columns) * duration / columns / step).astype(int), len(lit) - 1)
    return np.maximum.reduceat(lit, start, axis=0).T
