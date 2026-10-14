"""A song's audio as numbers: decoded, its spectrum, its peaks."""

import subprocess

import numpy as np

SR = 22050
LOW_HZ, TOP_HZ = 40, 10000
ROWS_PER_OCTAVE = 48
FLOOR_DB = -100
PEAK_RANGE_DB = 30
QUIET_DB = -50
QUIET = 10 ** (QUIET_DB / 20)


def decode(path):
    """Mono at SR, the channels averaged, decoded by ffmpeg so any format reads the same."""
    pcm = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(pcm, np.float32)


def stft_magnitude(x, nfft, hop):
    """Peak-scaled magnitude per frame, frames centred on their times: (magnitude, freqs, step in s)."""
    padded = np.pad(x, nfft // 2)
    window = np.hanning(nfft).astype(np.float32)
    starts = range(0, len(padded) - nfft + 1, hop)
    magnitude = np.empty((len(starts), nfft // 2 + 1), np.float32)
    for i, s in enumerate(starts):
        magnitude[i] = np.abs(np.fft.rfft(padded[s:s + nfft] * window))
    magnitude *= 2 / window.sum()
    return magnitude, np.fft.rfftfreq(nfft, 1 / SR), hop / SR


def log_rows(magnitude, freqs):
    """dBFS on log-spaced rows from LOW_HZ to TOP_HZ, as (rows, frames).

    A row spanning several bins takes the loudest, so a sine reads its level at
    any height; a row narrower than a bin, low down, interpolates between bins.
    """
    octaves = np.log2(TOP_HZ / LOW_HZ)
    edges = LOW_HZ * 2 ** np.linspace(0, octaves, round(octaves * ROWS_PER_OCTAVE) + 1)
    centres = np.sqrt(edges[:-1] * edges[1:])
    lo, hi = np.searchsorted(freqs, edges[:-1]), np.searchsorted(freqs, edges[1:])
    rows = np.empty((len(centres), magnitude.shape[0]), np.float32)
    for r, (a, b, f) in enumerate(zip(lo, hi, centres)):
        if b > a:
            rows[r] = magnitude[:, a:b].max(axis=1)
        else:
            k = min(np.searchsorted(freqs, f), len(freqs) - 1)
            t = (f - freqs[k - 1]) / (freqs[k] - freqs[k - 1])
            rows[r] = (1 - t) * magnitude[:, k - 1] + t * magnitude[:, k]
    return 20 * np.log10(np.maximum(rows, 10 ** (FLOOR_DB / 20)))


def frame_columns(frames, step, duration, columns):
    return np.minimum((np.arange(frames) * step / duration * columns).astype(int), columns - 1)


def band_peaks(magnitude, freqs, band_hz):
    """The band's spectral peaks, each within PEAK_RANGE_DB of the band's
    loudest in its frame: (magnitudes with every non-peak zeroed, their bins'
    indices into freqs, the band's loudest per frame)."""
    band = np.flatnonzero((freqs >= band_hz[0]) & (freqs <= band_hz[1]))
    m = magnitude[:, band]
    inner = m[:, 1:-1]
    loudest = m.max(axis=1)
    peaks = (inner > m[:, :-2]) & (inner >= m[:, 2:])
    peaks &= inner > loudest[:, None] * 10 ** (-PEAK_RANGE_DB / 20)
    return np.where(peaks, inner, 0), band[1:-1], loudest


def mmss(seconds, _pos=None):
    return f"{int(seconds) // 60}:{int(seconds) % 60:02d}"
