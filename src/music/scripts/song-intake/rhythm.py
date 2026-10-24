"""A song's pulse: its onsets, its tempo, its beats."""

import numpy as np

from audio import local_peaks, log_rows, stft_magnitude

# 46 ms windows at a 23 ms hop: short enough to place an onset within a beat.
ONSET_NFFT = 1024
ONSET_RANGE_DB = 80
MIN_BPM, MAX_BPM, PRIOR_BPM = 60, 200, 120
# How hard a beat gap off the period is penalized; librosa's default.
BEAT_TIGHTNESS = 100
# Sections whose tempos differ by more than this are a range in the title.
TEMPO_SPREAD = 0.03
BAR_BEATS = 4
# A bar's first beat is placed to the half beat: the tracker can lock onto
# the off-beat, a syncopated kick being the loudest onset in the bar.
BAR_SLOTS = 2 * BAR_BEATS
# A section shows its bars where their place outvotes every other by this
# many chord changes, or snares at full strength.
BAR_MARGIN = 4


def onset_envelope(x):
    """Half-wave-rectified spectral flux of the log magnitude: (envelope, step in s).

    From a short window, ONSET_NFFT at a hop of half that, since the drawing's
    0.37 s window smears every onset across a third of a beat. The flux is
    averaged over `log_rows`, so every octave weighs the same: averaged over
    linear bins, most of which lie above 5 kHz, the hi-hat outvotes the kick,
    the bass and the chords, and a shuffle's off-beat hats read as a faster
    straight beat.
    """
    magnitude, freqs, step = stft_magnitude(x, ONSET_NFFT, ONSET_NFFT // 2)
    db = log_rows(magnitude, freqs)
    db = np.maximum(db, db.max() - ONSET_RANGE_DB)
    flux = np.maximum(np.diff(db, axis=1), 0).mean(axis=0)
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
    peaks = np.flatnonzero(local_peaks(score)) + 1
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


def downbeats(beats, chords, snares, edges):
    """The half beats that open a bar, in seconds, in the sections where the bar can be told.

    snares is (times, strengths 0–1); edges the sections' bounds, first to
    last. A bar is BAR_BEATS beats, and each section places its first one
    on its own, among the BAR_SLOTS half beats a bar holds, by votes:

    - a snare votes, by its strength, for the place that puts it half a bar
      in, and against the place that puts it on the first beat — the snare
      falls on the half bar, and opens one almost never;
    - a chord change votes for the beat it lands on — across the catalogue
      nearly every change in a section lands on one beat in four.

    The snare is counted alone first: one a bar settles the place, where a
    bass that comes in early pulls the chord changes off it — sorry's third
    section. Where it does not settle it, the chords join it: a snare every
    half bar, the backbeat, votes for and against the same two places, and
    one on every beat for none, so either leaves the bar to the chords.

    A place is taken only where it outvotes every other by BAR_MARGIN, so a
    loop that changes every two beats, a section with too few changes and
    no snare to tell by, or one the tracker loses or gains a beat in, whose
    votes split between two places, shows no bars.
    """
    slots = np.empty(2 * len(beats) - 1)
    slots[0::2] = beats
    slots[1::2] = (beats[:-1] + beats[1:]) / 2
    changed = np.array([
        i > 0 and None not in (chords[i], chords[i - 1]) and chords[i] != chords[i - 1]
        for i in range(len(chords))
    ], bool)
    times, strengths = snares
    on_grid = (times >= slots[0]) & (times <= slots[-1])
    hit = np.abs(slots[None] - times[on_grid, None]).argmin(axis=1)
    strengths = strengths[on_grid]
    bars = []
    for start, end in zip(edges[:-1], edges[1:]):
        snare = np.zeros(BAR_SLOTS)
        inside = (slots[hit] >= start) & (slots[hit] < end)
        np.add.at(snare, (hit[inside] - BAR_SLOTS // 2) % BAR_SLOTS, strengths[inside])
        np.add.at(snare, hit[inside] % BAR_SLOTS, -strengths[inside])
        chord = np.zeros(BAR_SLOTS)
        np.add.at(chord, 2 * np.flatnonzero(changed & (beats >= start) & (beats < end)) % BAR_SLOTS, 1)
        for votes in (snare, snare + chord):
            place = int(votes.argmax())
            if votes[place] - np.delete(votes, place).max() >= BAR_MARGIN:
                index = np.flatnonzero((slots >= start) & (slots < end))
                bars.extend(slots[index[index % BAR_SLOTS == place]])
                break
    return np.array(bars)


def beats_bpm(beats):
    """The tempo the beats keep, or None under two beats: 60 over their mean
    gap, first to last. Not the median: each gap is a whole number of onset
    frames, so at 120 BPM's 21.5 the median snaps to 117 or 123."""
    return 60 * (len(beats) - 1) / float(beats[-1] - beats[0]) if len(beats) > 1 else None
