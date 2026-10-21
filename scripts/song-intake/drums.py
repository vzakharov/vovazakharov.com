"""A song's drums as four lanes — kick, toms, snare, cymbals — read off its drums stem.

The stem is demucs's `drums.wav`, aligned to the master (`audio.aligned`),
since off the mix a picked guitar's attack rises in the bands the way a hit
does and no calibration tells the two apart.

A hit is an onset of the stem: a peak of its log-spectral flux, the summed
rise of every bin over the frame before, standing over its neighbours and
over the flux around it. Per onset, the power each of nine bands gains over
the frames before is unmixed onto one band shape per kit piece by
non-negative least squares — linear power, so a quiet hat over a kick keeps
its high bands and the kick its low ones. The shapes are measured off hits in
the catalogue's own stems: a kick with and without a click, toms, a snare, a
fat-bodied snare and a clap, a closed hat and a crash.

A song with no drums still has a drums stem, holding whatever demucs could
not place elsewhere; it sits tens of dB under the mix, and yields no hits.
Within a song, two kinds of onset are not hits. Bleed — the rest of the mix,
which demucs never quite removes — sits far under the stem's loud hits. A
non-drum sound demucs files as drums, such as a noise riser, fits no kit
piece's shape, and the unmix leaves much of its power unexplained.

A hit lights a lane where it needs it: where the rest of the kit, refitted
without that lane's pieces, misses the hit's shape. A share of the power is
no test, since a kick split across two kick shapes, or filled out at
120–250 Hz by the tom's, would light toms and snare on every beat. Where the
lanes a hit needs still miss it, the one the fit gives most power joins
them: a snare on a kick is needed by neither the snare nor the crash lane
alone, since each explains its top bands as well as the other. A lane is
as bright as its level against that lane's loudest hits in the song, so a
hat reads as plainly as a kick an octave of loudness above it.
"""

import numpy as np

from audio import SR, stft_magnitude

DRUM_NFFT = 1024
LANES = ("kick", "toms", "snare", "cymbals")
BAND_EDGES_HZ = (30, 60, 120, 250, 500, 1000, 2500, 5000, 8000, SR / 2)
# Per kit piece, its lane and the power each band gains on its hits, in dB
# under its loudest band.
PIECES_DB = (
    ("kick", (-21, 0, -4, -20, -35, -47, -56, -58, -60)),
    ("kick", (-6, 0, -10, -23, -20, -17, -21, -22, -26)),
    ("kick", (-19, 0, 0, -11, -18, -28, -46, -51, -56)),
    ("toms", (-35, -10, 0, -6, -18, -30, -40, -45, -50)),
    ("snare", (-37, -35, -26, -12, -5, 0, -3, 0, 0)),
    ("snare", (-25, -21, -17, -14, -19, 0, -2, -1, -4)),
    # A fat-bodied snare, its body where a tom's is and its wires still up to
    # 8 kHz (just-because from 1:28.70).
    ("snare", (-30, -17, 0, -8, -15, -10, -9, -10, -15)),
    ("cymbals", (-45, -33, -29, -35, -37, -35, -32, -4, 0)),
    ("cymbals", (-45, -40, -35, -30, -20, -10, -3, 0, -2)),
)
# An onset is a flux peak over this many frames either side, above
# FLUX_OVER_MEAN times the flux's mean over FLUX_MEAN_S either side.
PEAK_FRAMES = 3
FLUX_OVER_MEAN = 1.5
FLUX_MEAN_S = 0.5
LOG_FLOOR_DB = -80
# A hit's power is the most each band reaches over the frames from its onset
# to HIT_AFTER past it, over the least in the BEFORE_FRAMES ending two frames
# ahead of it, the last whose window the onset does not reach.
HIT_AFTER = 2
BEFORE_FRAMES = 2
# A stem whose loud frames sit this far under the mix's holds no kit, only
# what demucs could not place elsewhere: songs with drums sit within 12 dB,
# the two without 44 and 48 dB under.
NO_KIT_DB = -25
# An onset this far under the stem's loud frames is bleed.
BLEED_DB = -25
LOUD_PERCENTILE = 95
# An onset whose unmix leaves more than this share of its power unexplained is no kit.
UNEXPLAINED = 0.4
# A lane lights where, without its pieces, the rest of the kit falls this far
# short of a band the hit sounds in — one within SOUNDING_DB of its loudest.
NEEDED_DB = 6
SOUNDING_DB = -30
SOUNDING = 10 ** (SOUNDING_DB / 10)
# Lanes join the needed ones while those alone miss a hit by this much more
# than the whole kit: intertwined's plain kicks stay within 3 dB, its kicks
# with the backbeat's snare from 2:00 reach 5–10.
JOINED_DB = 5
# A hit no lane is needed for lights the one it needs most only this close
# to the stem's loud frames: under it, such a hit was bleed demucs let by.
GUESS_DB = -15
# A lane's hits fade from full brightness at its loudest to black this far under.
LANE_RANGE_DB = 24
UNMIX_ITERATIONS = 200


def shapes():
    """PIECES_DB as linear power, (pieces, bands), and each piece's lane index."""
    w = 10 ** (np.array([db for _, db in PIECES_DB], np.float64) / 10)
    return w, np.array([LANES.index(lane) for lane, _ in PIECES_DB])


def band_power(x):
    """Per frame, each band's power and the spectral flux: (power, flux, step in s)."""
    magnitude, freqs, step = stft_magnitude(x, DRUM_NFFT, DRUM_NFFT // 2)
    power = magnitude.astype(np.float64) ** 2
    band = np.digitize(freqs, BAND_EDGES_HZ) - 1
    bands = np.stack([power[:, band == b].sum(axis=1) for b in range(len(BAND_EDGES_HZ) - 1)], axis=1)
    floor = magnitude.max() * 10 ** (LOG_FLOOR_DB / 20)
    log = np.log10(np.maximum(magnitude, floor))
    flux = np.concatenate([[0], np.maximum(np.diff(log, axis=0), 0).sum(axis=1)])
    return bands, flux, step


def onsets(flux, step):
    """The frames where the flux peaks over PEAK_FRAMES either side and over its local mean."""
    padded = np.pad(flux, PEAK_FRAMES)
    peak = flux >= np.max([padded[k:k + len(flux)] for k in range(2 * PEAK_FRAMES + 1)], axis=0)
    reach = max(1, round(FLUX_MEAN_S / step))
    kernel = np.ones(2 * reach + 1) / (2 * reach + 1)
    mean = np.convolve(flux, kernel, mode="same")
    return np.flatnonzero(peak & (flux > FLUX_OVER_MEAN * mean) & (flux > 0))


def gained(bands, frames):
    """Per onset, the power each band gains over the frames before it, as (onsets, bands)."""
    n = len(bands)
    after = np.max([bands[np.minimum(frames + k, n - 1)] for k in range(HIT_AFTER + 1)], axis=0)
    before = np.min([bands[np.maximum(frames - 2 - k, 0)] for k in range(BEFORE_FRAMES)], axis=0)
    return np.maximum(after - before, 0)


def unmix(gain, w, relative=True):
    """Non-negative least squares of each row of gain onto the rows of w, by
    multiplicative updates: (onsets, pieces).

    Relative, each band's error is weighed against that band's own gain,
    floored SOUNDING_DB under the loudest, so the fit is judged in about the
    dB that misfit_db judges it in. In plain power the loudest band rules: a
    hat's 8 kHz is matched by adding the crash, whose 1–2.5 kHz then
    overshoots the hat by 20 dB, and no lane is needed more than any other.
    Plain power is what UNEXPLAINED is a share of."""
    floor = gain.max(axis=1, keepdims=True) * SOUNDING
    weight = 1 / np.maximum(gain + floor, 1e-30) ** 2 if relative else np.ones_like(gain)
    a = np.full((len(gain), len(w)), 1.0) * gain.sum(axis=1, keepdims=True) / w.sum()
    top = (gain * weight) @ w.T
    for _ in range(UNMIX_ITERATIONS):
        a *= top / np.maximum(((a @ w) * weight) @ w.T, 1e-30)
    return a


def misfit_db(gain, model):
    """Per onset, the most the model is off the gain in any band either of
    them sounds in, within SOUNDING_DB of the louder's loudest band, in dB."""
    louder = np.maximum(gain, model)
    threshold = louder.max(axis=1, keepdims=True) * SOUNDING
    floor = np.maximum(threshold, 1e-30)
    off = np.abs(10 * np.log10(np.maximum(gain, floor) / np.maximum(model, floor)))
    return np.where(louder >= threshold, off, 0).max(axis=1)


def refit_db(gain, w):
    """misfit_db of gain refitted onto the rows of w alone."""
    return misfit_db(gain, unmix(gain, w) @ w)


def joined(gain, power, w, lane_of, needed, whole):
    """For one hit, needed with lanes added, most power in the whole kit's
    fit first, while the needed lanes' pieces alone still miss it by
    JOINED_DB more than the whole kit."""
    needed = needed.copy()
    while not needed.all() and refit_db(gain[None], w[needed[lane_of]])[0] - whole >= JOINED_DB:
        needed[np.argmax(np.where(needed, -1, power))] = True
    return needed


def loud_power(bands):
    """The power of a track's loud frames, which its levels are measured against."""
    return np.percentile(bands.sum(axis=1), LOUD_PERCENTILE)


def drum_hits(stem, mix):
    """Every hit of the aligned stem: (times in s, each lane's brightness 0–1 as (hits, len(LANES)))."""
    bands, flux, step = band_power(stem)
    loud = loud_power(bands)
    if 10 * np.log10(max(loud, 1e-30) / loud_power(band_power(mix)[0])) < NO_KIT_DB:
        return np.zeros(0), np.zeros((0, len(LANES)))
    frames = onsets(flux, step)
    w, lane_of = shapes()
    gain = gained(bands, frames)
    a = unmix(gain, w)
    model = a @ w
    total = gain.sum(axis=1)
    level_db = 10 * np.log10(np.maximum(total, 1e-30) / loud)
    residual = gain - unmix(gain, w, relative=False) @ w
    unexplained = (residual**2).sum(axis=1) / np.maximum((gain**2).sum(axis=1), 1e-30)
    kept = (level_db > BLEED_DB) & (unexplained <= UNEXPLAINED) & (total > 0)

    # Each lane's power, where the other lanes' pieces, refitted without it,
    # miss the hit's shape by NEEDED_DB more than the whole kit does — or,
    # where no lane is, by the most: a hit two lanes each nearly explain
    # still lights one.
    whole = misfit_db(gain, model)
    cost = np.stack([refit_db(gain, w[lane_of != k]) - whole for k in range(len(LANES))], axis=1)
    most = cost.max(axis=1, keepdims=True)
    guess = (cost == most) & (most < NEEDED_DB) & (level_db[:, None] > GUESS_DB)
    needed = (cost >= NEEDED_DB) | guess
    fitted = np.stack([(a[:, lane_of == k] @ w[lane_of == k]).sum(axis=1) for k in range(len(LANES))], axis=1)
    for i in np.flatnonzero((most[:, 0] >= NEEDED_DB) & kept):
        needed[i] = joined(gain[i], fitted[i], w, lane_of, needed[i], whole[i])
    lane_power = np.where(needed & kept[:, None], fitted, 0)

    lit = np.zeros_like(lane_power)
    for k in range(len(LANES)):
        on = lane_power[:, k] > 0
        if on.any():
            db = 10 * np.log10(lane_power[on, k] / lane_power[on, k].max())
            lit[on, k] = np.clip(1 + db / LANE_RANGE_DB, 0, 1)
    some = lit.any(axis=1)
    return frames[some] * step, lit[some]
