"""A song's notes: its tuning, its chroma, and the sections they change at."""

import numpy as np

from audio import QUIET, ROWS_PER_OCTAVE, band_peaks, frame_columns, local_peaks

# C2 to C7: below it a bin is wider than a semitone; above it, mostly harmonics.
# A bass note under C2 still votes through its octave harmonic, the same class.
NOTE_BAND_HZ = (65, 2100)
# Under 200 Hz a bin is over 20 cents wide, too coarse to place a note in its semitone.
TUNING_LOW_HZ = 200
# A note shorter than this blurs into its neighbours; a column alone flickers.
NOTE_WINDOW_S = 0.6
# A note's octave is voted over a longer window, since its attack and its
# harmonics trade the lead within it, and a hue flickering inside one note
# reads as two.
OCTAVE_WINDOW_S = 1.5
# Sections are found on half-second blocks, each compared with the eight
# seconds either side of it; a part shorter than SECTION_MIN_S is a fill or a
# pickup, not a section.
SECTION_BLOCK_S = 0.5
SECTION_KERNEL_S = 8
SECTION_MIN_S = 8
# A boundary's novelty is this many times the song's median: under it are a
# held note's swells and a fill. A multiple of the median rather than a share of
# the peak, so one drastic change cannot hide the song's ordinary ones.
SECTION_THRESHOLD = 3
TIMBRE_ROWS = ROWS_PER_OCTAVE // 3
# The harmonics that land in another pitch class than their note's, and how
# much of the note's own peak each is taken to be: half, since a chord voiced
# wide puts a real fifth or third where a harmonic would sit.
HARMONICS = (3, 5)
HARMONIC_SHARE = 0.5
# A root's weight, as a share of its fifth's, at which the two are read as one
# note: under it the fifth stands alone, a bass line passing through it.
FIFTH_FLOOR = 0.25


def tuning_cents(magnitude, freqs):
    """How far the song's semitone grid sits from A440's, in cents, −50 to +50.

    Every spectral peak from TUNING_LOW_HZ up through the note band, its
    frequency refined by a parabola through its bin and its two neighbours on
    a log scale, votes its offset from the nearest A440 semitone, weighted by
    its magnitude. The mean is circular, so −49 and +49 average to ±50, not 0.
    """
    weights, bins, _ = band_peaks(magnitude, freqs, (TUNING_LOW_HZ, NOTE_BAND_HZ[1]))
    frame, column = np.nonzero(weights)
    k = bins[column]
    a, b, c = (np.log(np.maximum(magnitude[frame, k + d], 1e-12)) for d in (-1, 0, 1))
    shift = 0.5 * (a - c) / np.minimum(a - 2 * b + c, -1e-12)
    semitones = 12 * np.log2((k + shift) * (freqs[1] - freqs[0]) / 440)
    angle = 2 * np.pi * (semitones - np.round(semitones))
    w = weights[frame, column]
    return float(np.angle((w * np.exp(1j * angle)).sum()) / (2 * np.pi) * 100)


def without_harmonics(magnitude, weights, bins):
    """weights with each peak less HARMONIC_SHARE of the peak at a third and at
    a fifth of its frequency, floored at zero.

    A note's third and fifth harmonics land a fifth and a major third above it,
    in another class, so a C read with its harmonics is a C major chord, and a
    C minor one reads as G minor: a peak is that note's harmonic as far as the
    note below it reaches, and votes only for its excess. The note below is
    the loudest peak within a bin of the exact fraction, since neither lands
    on a bin's centre.
    """
    below = bins.max() // min(HARMONICS) + 2
    m = magnitude[:, :below + 1]
    peaks = np.zeros_like(m)
    peaks[:, 1:-1] = np.where(local_peaks(m), m[:, 1:-1], 0)
    near = np.maximum(peaks, np.maximum(np.roll(peaks, 1, axis=1), np.roll(peaks, -1, axis=1)))
    for h in HARMONICS:
        weights = np.maximum(weights - HARMONIC_SHARE * near[:, np.round(bins / h).astype(int)], 0)
    return weights


def fold_fifths(chroma):
    """chroma, (frames, octaves × 12), with each sounding fifth's weight moved
    onto its root, in the octave that carries the root most.

    A bass under a chord sounds its root and the fifth above together — a
    power chord, a root–fifth figure, the root's third harmonic — and the fifth
    is often the louder, so a bass read note by note shows each chord as two
    classes, and a progression as a stitch between the fifths that recur. The
    lower note of a fifth (the upper of a fourth, its inversion) is the root.
    Per frame, pairs are taken strongest first, each class in one pair at most,
    so a chain C–G–D folds once and the stronger pair wins; a fifth whose root
    holds under FIFTH_FLOOR of its weight is a note of its own, and stays.
    """
    by_octave = chroma.reshape(len(chroma), -1, 12).copy()
    frames = np.arange(len(chroma))
    classes = by_octave.sum(axis=1)
    free = np.ones_like(classes, bool)
    tried = np.zeros_like(free)
    fifth = (np.arange(12) + 7) % 12
    for _ in range(12):
        pair = np.where(free & ~tried & free[:, fifth], classes + classes[:, fifth], -1)
        root = pair.argmax(axis=1)
        top = fifth[root]
        live = pair[frames, root] > 0
        if not live.any():
            break
        folds = live & (classes[frames, top] > 0) & (classes[frames, root] >= FIFTH_FLOOR * classes[frames, top])
        home = by_octave[frames, :, root].argmax(axis=1)
        moved = np.where(folds, classes[frames, top], 0)
        by_octave[frames, home, root] += moved
        by_octave[frames, :, top] *= ~folds[:, None]
        classes[frames, root] += moved
        classes[frames, top] -= moved
        tried[frames[live], root[live]] = True
        free[frames[folds], root[folds]] = False
        free[frames[folds], top[folds]] = False
    return by_octave.reshape(chroma.shape)


def peak_chroma(magnitude, freqs, band_hz, octaves, tuning=0.0, fundamentals=False):
    """Per frame, the weight of each (octave, pitch class) in band_hz, as
    (frames, octaves × 12), and the band's loudest magnitude per frame.

    A chroma from `band_peaks`, weighted by magnitude: so a note and its
    octave harmonics vote for their own class, while the drums' broad smear,
    flat rather than peaked, barely votes. A peak votes for the octave it sits
    in, clamped to octaves (first, last), C to B, on a semitone grid shifted by
    tuning cents, so a song tuned off A440 does not split each note across two
    classes. fundamentals takes the third and fifth harmonics out first
    (`without_harmonics`), for a key or a chord, which they would move.
    """
    weights, bins, loudest = band_peaks(magnitude, freqs, band_hz)
    if fundamentals:
        weights = without_harmonics(magnitude, weights, bins)
    midi = np.round(69 + 12 * np.log2(freqs[bins] / 440) - tuning / 100).astype(int)
    pitch_class = midi % 12
    octave = np.clip(midi // 12 - 1, *octaves) - octaves[0]
    count = octaves[1] - octaves[0] + 1
    chroma = np.stack([
        weights[:, (octave == o) & (pitch_class == k)].sum(axis=1) for o in range(count) for k in range(12)
    ], axis=1)
    return chroma, loudest


def chroma_shares(magnitude, freqs, step, duration, columns, band_hz, octaves, tuning=0.0, roots=False):
    """Per column of the plot, each pitch class's share of band_hz and the
    octave that carries most of it, both as (12, columns).

    `peak_chroma`, its fifths folded onto their roots where roots asks
    (`fold_fifths`), smoothed over NOTE_WINDOW_S. A column is all zeros where the
    band's loudest peak stays under QUIET_DB, since a band that is all but
    silent still has peaks, of noise or bleed. A cell's octave is the one with
    the most weight over OCTAVE_WINDOW_S, never a mean, which can land on an
    octave nobody played.
    """
    chroma, loudest = peak_chroma(magnitude, freqs, band_hz, octaves, tuning)
    if roots:
        chroma = fold_fifths(chroma)
    count = octaves[1] - octaves[0] + 1
    column = frame_columns(len(chroma), step, duration, columns)
    per_column = np.zeros((columns, count * 12))
    np.add.at(per_column, column, chroma)
    level = np.zeros(columns)
    np.maximum.at(level, column, loudest)
    span = np.ones(max(1, round(NOTE_WINDOW_S * columns / duration)))
    per_column = np.stack([np.convolve(c, span, "same") for c in per_column.T], axis=1)
    span = np.ones(max(1, round(OCTAVE_WINDOW_S * columns / duration)))
    votes = np.stack([np.convolve(c, span, "same") for c in per_column.T], axis=1)
    per_class = per_column.reshape(columns, count, 12).sum(axis=1)
    shares = per_class / np.maximum(per_class.sum(axis=1, keepdims=True), 1e-12)
    shares[level < QUIET] = 0
    return shares.T, (votes.reshape(columns, count, 12).argmax(axis=1) + octaves[0]).T


def unit_rows(features):
    """Each row scaled to length 1; an all-zero row, a silent block's chroma, stays zero."""
    return features / np.maximum(np.linalg.norm(features, axis=1, keepdims=True), 1e-12)


def section_times(db, magnitude, freqs, step, duration, tuning=0.0):
    """The times, in seconds, where one section gives way to the next.

    Foote's novelty: every block's sound — its third-octave levels, which carry
    the arrangement and the dynamics, and its chroma, which carries the
    harmony — is compared with every other's, and a boundary is where the
    blocks before a moment are alike, the blocks after it are alike, and the
    two differ. A checkerboard kernel slid along the similarity matrix's
    diagonal scores exactly that; its peaks, at least SECTION_MIN_S apart and
    SECTION_THRESHOLD times its median, are the boundaries.
    """
    blocks = max(1, round(duration / SECTION_BLOCK_S))
    block = frame_columns(db.shape[1], step, duration, blocks)
    bands = db[: db.shape[0] // TIMBRE_ROWS * TIMBRE_ROWS].reshape(-1, TIMBRE_ROWS, db.shape[1]).mean(axis=1)
    timbre = np.zeros((blocks, len(bands)))
    np.add.at(timbre, block, bands.T)
    timbre /= np.maximum(np.bincount(block, minlength=blocks), 1)[:, None]
    timbre = (timbre - timbre.mean(axis=0)) / np.maximum(timbre.std(axis=0), 1e-6)
    chroma, _ = chroma_shares(magnitude, freqs, step, duration, blocks, NOTE_BAND_HZ, (2, 6), tuning)
    features = np.hstack([unit_rows(timbre), unit_rows(chroma.T)]) / np.sqrt(2)
    similarity = features @ features.T

    half = round(SECTION_KERNEL_S / SECTION_BLOCK_S)
    offsets = np.arange(-half, half) + 0.5
    taper = np.exp(-0.5 * (offsets / (half / 2)) ** 2)
    kernel = np.outer(np.sign(offsets) * taper, np.sign(offsets) * taper)
    padded = np.pad(similarity, half)
    novelty = np.array([(kernel * padded[i:i + 2 * half, i:i + 2 * half]).sum() for i in range(blocks)])

    # The padding reads as a change at either edge, which no section is.
    apart = round(SECTION_MIN_S / SECTION_BLOCK_S)
    inside = novelty[apart:blocks - apart]
    if not len(inside):
        return []
    bar = SECTION_THRESHOLD * np.median(inside)
    peaks = [
        i for i, n in enumerate(inside)
        if n >= bar and n == inside[max(0, i - apart):i + apart + 1].max()
    ]
    return [(i + apart) * SECTION_BLOCK_S for i in peaks]
