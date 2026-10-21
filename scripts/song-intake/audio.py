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
# demucs's lag behind the master is under this.
ALIGN_SEARCH_S = 0.5


def decode(path):
    """Mono at SR, the channels averaged, decoded by ffmpeg so any format reads the same."""
    pcm = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(pcm, np.float32)


def aligned(stems, mix):
    """The stems shifted onto the mix's time, each as long as the mix, by the
    one lag within ALIGN_SEARCH_S that best correlates their sum with it.

    demucs's WAV runs a few hundred samples behind the master, the same for
    every stem; their sum is the mix less what demucs lost, so it finds the
    lag where a stem that is silent for most of the song would not."""
    total = np.sum(stems, axis=0)
    n = 1 << int(np.ceil(np.log2(len(total) + len(mix))))
    corr = np.fft.irfft(np.fft.rfft(mix, n) * np.conj(np.fft.rfft(total, n)), n)
    reach = int(ALIGN_SEARCH_S * SR)
    lags = np.concatenate([np.arange(reach + 1), np.arange(-reach, 0)])
    lag = lags[np.argmax(corr[lags])]
    out = []
    for stem in stems:
        shifted = np.zeros(len(mix), np.float32)
        if lag >= 0:
            piece = stem[: len(mix) - lag]
            shifted[lag:lag + len(piece)] = piece
        else:
            piece = stem[-lag:-lag + len(mix)]
            shifted[: len(piece)] = piece
        out.append(shifted)
    return out


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


def local_peaks(v):
    """Along the last axis, whether each inner value rises over the one before
    and holds against the one after — one True per flat-topped peak."""
    inner = v[..., 1:-1]
    return (inner > v[..., :-2]) & (inner >= v[..., 2:])


def band_peaks(magnitude, freqs, band_hz):
    """The band's spectral peaks, each within PEAK_RANGE_DB of the band's
    loudest in its frame: (magnitudes with every non-peak zeroed, their bins'
    indices into freqs, the band's loudest per frame)."""
    band = np.flatnonzero((freqs >= band_hz[0]) & (freqs <= band_hz[1]))
    m = magnitude[:, band]
    inner = m[:, 1:-1]
    loudest = m.max(axis=1)
    peaks = local_peaks(m) & (inner > loudest[:, None] * 10 ** (-PEAK_RANGE_DB / 20))
    return np.where(peaks, inner, 0), band[1:-1], loudest


def steady_path(scores, cost):
    """The state per step, (steps, states) scores in, that maximizes their sum
    less cost per change of state (Viterbi): one stray step does not move it."""
    best = scores[0]
    back = []
    for score in scores[1:]:
        switch = best.max() - cost
        back.append(np.where(best >= switch, np.arange(len(best)), best.argmax()))
        best = np.maximum(best, switch) + score
    path = [int(best.argmax())]
    for links in reversed(back):
        path.append(int(links[path[-1]]))
    return path[::-1]


def mmss(seconds, _pos=None):
    return f"{int(seconds) // 60}:{int(seconds) % 60:02d}"
