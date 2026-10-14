"""A song's pulse: its onsets, its tempo, its beats."""

import numpy as np

from audio import stft_magnitude

# 46 ms windows at a 23 ms hop: short enough to place an onset within a beat.
ONSET_NFFT = 1024
ONSET_RANGE_DB = 80
MIN_BPM, MAX_BPM, PRIOR_BPM = 60, 200, 120
# How hard a beat gap off the period is penalized; librosa's default.
BEAT_TIGHTNESS = 100
# Sections whose tempos differ by more than this are a range in the title.
TEMPO_SPREAD = 0.03


def onset_envelope(x):
    """Half-wave-rectified spectral flux of the log magnitude: (envelope, step in s).

    From a short window, ONSET_NFFT at a hop of half that, since the drawing's
    0.37 s window smears every onset across a third of a beat.
    """
    magnitude, _, step = stft_magnitude(x, ONSET_NFFT, ONSET_NFFT // 2)
    db = 20 * np.log10(np.maximum(magnitude, magnitude.max() * 10 ** (-ONSET_RANGE_DB / 20) + 1e-12))
    flux = np.maximum(np.diff(db, axis=0), 0).mean(axis=1)
    return np.concatenate([[0], flux]), step


def tempo_bpm(envelope, step):
    """The envelope's strongest periodicity from MIN_BPM to MAX_BPM, in BPM.

    Its autocorrelation, weighted by a log-normal prior an octave wide around
    PRIOR_BPM — librosa's answer to half- and double-tempo errors, since a
    beat's every multiple is a period too — the winning lag refined by a
    parabola through it and its neighbours. The envelope is smoothed first: a
    period that falls between two lags otherwise splits its peak across them,
    while twice it lands closer to one, and the half tempo wins.
    """
    e = np.convolve(envelope, np.exp(-0.5 * np.arange(-3, 4) ** 2), "same")
    e -= e.mean()
    n = 2 ** int(np.ceil(np.log2(2 * len(e))))
    spectrum = np.fft.rfft(e, n)
    correlation = np.fft.irfft(spectrum * np.conj(spectrum), n)[: len(e)]
    lags = np.arange(len(correlation), dtype=float)
    with np.errstate(divide="ignore"):
        bpm = 60 / (lags * step)
    prior = np.exp(-0.5 * np.log2(bpm / PRIOR_BPM) ** 2)
    score = np.where((bpm >= MIN_BPM) & (bpm <= MAX_BPM), correlation * prior, -np.inf)
    lag = int(np.argmax(score))
    a, b, c = score[lag - 1:lag + 2]
    if np.isfinite(a) and np.isfinite(c) and a - 2 * b + c < 0:
        lag += 0.5 * (a - c) / (a - 2 * b + c)
    return float(60 / (lag * step))


def beat_times(envelope, step, bpm):
    """The beats, in seconds: Ellis's dynamic programming, librosa's own tracker.

    Each beat sits on a strong onset at roughly one period after the one
    before, a gap off the period penalized by the square of its log ratio, so
    bpm is only the prior and the beats follow a tempo that drifts. Leading
    and trailing beats on near-silence are trimmed.
    """
    period = 60 / (bpm * step)
    onsets = envelope / max(envelope.std(), 1e-12)
    width = np.arange(-round(period), round(period) + 1)
    local = np.convolve(onsets, np.exp(-0.5 * (width * 32 / period) ** 2), "same")

    reach = np.arange(-round(2 * period), -round(period / 2) + 1)
    penalty = -BEAT_TIGHTNESS * np.log(-reach / period) ** 2
    score = np.zeros(len(local))
    back = np.full(len(local), -1)
    started = False
    for i, own in enumerate(local):
        before = i + reach
        valid = before >= 0
        if valid.any() and (started or own >= 0.01 * local.max()):
            candidates = penalty[valid] + score[before[valid]]
            best = int(np.argmax(candidates))
            score[i] = own + candidates[best]
            back[i] = before[valid][best]
            started = True
        else:
            score[i] = own

    # The last beat is the last local maximum of the score that reaches half
    # their median: past it the track only coasts.
    peaks = np.flatnonzero((score[1:-1] > score[:-2]) & (score[1:-1] >= score[2:])) + 1
    if not len(peaks):
        return np.array([])
    last = peaks[score[peaks] >= 0.5 * np.median(score[peaks])][-1]
    beats = [last]
    while back[beats[-1]] >= 0:
        beats.append(back[beats[-1]])
    beats = np.array(beats[::-1])
    strong = local[beats] >= 0.5 * np.sqrt((local[beats] ** 2).mean())
    kept = np.flatnonzero(strong)
    return beats[kept[0]:kept[-1] + 1] * step if len(kept) else np.array([])


def beats_bpm(beats):
    """The tempo the beats keep, or None under two beats: 60 over their mean
    gap, first to last. Not the median: each gap is a whole number of onset
    frames, so at 120 BPM's 21.5 the median snaps to 117 or 123."""
    return 60 * (len(beats) - 1) / float(beats[-1] - beats[0]) if len(beats) > 1 else None
