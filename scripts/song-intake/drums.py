"""A song's drums as four lanes — kick, toms, snare, cymbals — each as bright as its hits."""

import numpy as np

from audio import SR, stft_magnitude

DRUM_NFFT = 1024
LANES = ("kick", "toms", "snare", "cymbals")
BAND_EDGES_HZ = (30, 60, 120, 250, 500, 1000, 2500, 5000, 8000, SR / 2)
# Per lane, how far each band rises on a hit, relative to the lane's loudest band.
SIGNATURES = np.array([
    [1.0, 1.0, 0.4, 0.1, 0.0, 0.0, 0.1, 0.0, 0.0],
    [0.0, 0.4, 1.0, 0.6, 0.2, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.5, 0.6, 0.7, 1.0, 1.0, 0.8, 0.6],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.6, 1.0, 1.0],
])
HPSS_FRAMES, HPSS_BINS = 17, 17
RISE_FRAMES = 4
BAND_FLOOR_DB = -80
NOISE_RISE_DB, FULL_RISE_DB = 2, 12
UNMIX_ITERATIONS = 100
USE_HPSS = False


def median_filter(m, width, axis):
    """m median-filtered along axis over width cells, its edges reflected."""
    m = np.moveaxis(m, axis, 0)
    padded = np.pad(m, ((width // 2, width // 2), (0, 0)), mode="reflect")
    out = np.empty_like(m)
    for s in range(0, m.shape[1], 64):
        windows = np.lib.stride_tricks.sliding_window_view(padded[:, s:s + 64], width, axis=0)
        out[:, s:s + 64] = np.median(windows, axis=-1)
    return np.moveaxis(out, 0, axis)


def percussive_share(magnitude):
    h = median_filter(magnitude, HPSS_FRAMES, 0)
    p = median_filter(magnitude, HPSS_BINS, 1)
    return p ** 2 / np.maximum(h ** 2 + p ** 2, 1e-20)


def band_rises(x):
    magnitude, freqs, step = stft_magnitude(x, DRUM_NFFT, DRUM_NFFT // 2)
    power = magnitude.astype(np.float64) ** 2
    band = np.digitize(freqs, BAND_EDGES_HZ) - 1
    count = len(BAND_EDGES_HZ) - 1
    energy = np.stack([power[:, band == b].sum(axis=1) for b in range(count)], axis=1)
    level = 10 * np.log10(np.maximum(energy, 10 ** (BAND_FLOOR_DB / 10)))
    padded = np.pad(level, ((RISE_FRAMES, 0), (0, 0)), mode="edge")
    before = np.min([padded[RISE_FRAMES - k:len(padded) - k] for k in range(1, RISE_FRAMES + 1)], axis=0)
    rise = np.maximum(level - before, 0)
    if USE_HPSS:
        share = percussive_share(magnitude) * power
        share = np.stack([share[:, band == b].sum(axis=1) for b in range(count)], axis=1)
        rise *= share / np.maximum(energy, 1e-20)
    return rise, step


def unmix(rise):
    """Non-negative least squares of each frame's rises onto SIGNATURES."""
    w = SIGNATURES
    a = np.full((len(rise), len(w)), 1.0) * rise.mean(axis=1, keepdims=True)
    top = rise @ w.T
    gram = w @ w.T
    for _ in range(UNMIX_ITERATIONS):
        a *= top / np.maximum(a @ gram, 1e-12)
    return a


def drum_lanes(x, duration, columns):
    """Per column of the plot, each lane's brightness 0–1, as (len(LANES), columns)."""
    rise, step = band_rises(x)
    hits = np.clip((unmix(rise) - NOISE_RISE_DB) / (FULL_RISE_DB - NOISE_RISE_DB), 0, 1)
    start = np.minimum((np.arange(columns) * duration / columns / step).astype(int), len(hits) - 1)
    return np.maximum.reduceat(hits, start, axis=0).T
