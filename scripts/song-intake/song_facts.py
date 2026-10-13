"""What can be measured off a song's audio: its spectrum, its chroma, its sections.

numpy only, so the analysis runs and is tested without matplotlib; the drawing
is `spectrogram.py`'s.
"""

import subprocess

import numpy as np

SR = 22050
LOW_HZ, TOP_HZ = 40, 10000
ROWS_PER_OCTAVE = 48
FLOOR_DB = -100

# C2 to C7: below it a bin is wider than a semitone; above it, mostly harmonics.
# A bass note under C2 still votes through its octave harmonic, the same class.
NOTE_BAND_HZ = (65, 2100)
PEAK_RANGE_DB = 30
# Under 200 Hz a bin is over 20 cents wide, too coarse to place a note in its semitone.
TUNING_LOW_HZ = 200
QUIET_DB = -50
QUIET = 10 ** (QUIET_DB / 20)
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

# 46 ms windows at a 23 ms hop: short enough to place an onset within a beat.
ONSET_NFFT = 1024
ONSET_RANGE_DB = 80
MIN_BPM, MAX_BPM, PRIOR_BPM = 60, 200, 120
# How hard a beat gap off the period is penalized; librosa's default.
BEAT_TIGHTNESS = 100


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


def peak_chroma(magnitude, freqs, band_hz, octaves, tuning=0.0):
    """Per frame, the weight of each (octave, pitch class) in band_hz, as
    (frames, octaves × 12), and the band's loudest magnitude per frame.

    A chroma from `band_peaks`, weighted by magnitude: so a note and its
    harmonics vote for their own class, while the drums' broad smear, flat
    rather than peaked, barely votes. A peak votes for the octave it sits in,
    clamped to octaves (first, last), C to B, on a semitone grid shifted by
    tuning cents, so a song tuned off A440 does not split each note across two
    classes.
    """
    weights, bins, loudest = band_peaks(magnitude, freqs, band_hz)
    midi = np.round(69 + 12 * np.log2(freqs[bins] / 440) - tuning / 100).astype(int)
    pitch_class = midi % 12
    octave = np.clip(midi // 12 - 1, *octaves) - octaves[0]
    count = octaves[1] - octaves[0] + 1
    chroma = np.stack([
        weights[:, (octave == o) & (pitch_class == k)].sum(axis=1) for o in range(count) for k in range(12)
    ], axis=1)
    return chroma, loudest


def chroma_shares(magnitude, freqs, step, duration, columns, band_hz, octaves, tuning=0.0):
    """Per column of the plot, each pitch class's share of band_hz and the
    octave that carries most of it, both as (12, columns).

    `peak_chroma`, smoothed over NOTE_WINDOW_S. A column is all zeros where the
    band's loudest peak stays under QUIET_DB, since a band that is all but
    silent still has peaks, of noise or bleed. A cell's octave is the one with
    the most weight over OCTAVE_WINDOW_S, never a mean, which can land on an
    octave nobody played.
    """
    chroma, loudest = peak_chroma(magnitude, freqs, band_hz, octaves, tuning)
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
    """The tempo the beats keep: 60 over their median gap, or None under two beats."""
    return 60 / float(np.median(np.diff(beats))) if len(beats) > 1 else None


def mmss(seconds, _pos=None):
    return f"{int(seconds) // 60}:{int(seconds) % 60:02d}"
