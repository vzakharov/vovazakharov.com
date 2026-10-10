#!/usr/bin/env python3
"""A song's spectrogram over its loudness and its chromagram: its whole length across, pitch up.

Usage: spectrogram.py <song> <out.png>

Where the voice sits and where its melody goes, where the drums come in, a
bridge that drops out, where one section gives way to the next, a master that
runs into its ceiling, which notes and chords it moves through — what a reader
who cannot hear the song can see at a glance.

The frequency axis is logarithmic, 40 Hz to 10 kHz, so an octave is the same
height anywhere and a melodic line keeps its shape; 40 Hz takes in a bass's
open E. A full-scale sine reads 0 dBFS. A dashed white line across it is a
section boundary, found from the sound alone: a sharp change in arrangement or
harmony draws one, a gradual build may not. Under it, on the same time axis,
the loudness envelope: each column's peak, with its RMS inside.

Under that, two chromagram strips, the band above middle C over the band below
it: twelve rows each, C at the bottom, a row as bright as its pitch class's
share of the band, harmonics voting with their fundamentals. So the bass strip
steps with the bass line, the treble strip carries the tune and the chord over
it, and a chord shows as several bright rows at once. A pitch class is read off
its labelled row; a row's hue is the octave that carries it, keyed beside each
strip, one hue per octave and the same in either strip — C2 red, C3 orange, C4
green, C5 cyan, C6 violet — so a melody that leaps an octave changes colour on
its row. Twelve hues for twelve classes would be misread for their neighbours;
five far apart are not. A faint cell is grey, its octave too unsure to colour,
and a strip is dark where its band is quiet.

The spectrogram's map is cut into 2.5 dB steps, the strips' into a few
brightness steps per octave, and the PNG kept to those colours and a few greys,
which holds a song under 350 KB: a smooth map over a noisy texture compresses
several times worse.

Needs ffmpeg and matplotlib (numpy and Pillow come with it).
"""

import io
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 22050
LOW_HZ, TOP_HZ = 40, 10000
TICKS_HZ = (50, 100, 200, 500, 1000, 2000, 5000, 10000)
ROWS_PER_OCTAVE = 48
# 2.7 Hz bins: a semitone apart is 2.4 Hz at 40 Hz and 6 Hz at 100, so the
# bass's notes stay apart at the cost of a 0.37 s window.
NFFT = 8192
FLOOR_DB = -100
STEP_DB = 2.5
WIDTH_PX, HEIGHT_PX, DPI = 1400, 1100, 100

NOTE_NAMES = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
# C2 to C7: below it a bin is wider than a semitone; above it, mostly harmonics.
# A bass note under C2 still votes through its octave harmonic, the same class.
NOTE_BAND_HZ = (65, 2100)
# Middle C splits the bass band from the treble one, where the clefs meet: a
# bass line and its first harmonics sit under it, and most of a melody above
# it. A male voice's lowest notes fall under it, and so vote with the bass.
CROSSOVER_HZ = 262
PEAK_RANGE_DB = 30
QUIET_DB = -50
QUIET = 10 ** (QUIET_DB / 20)
# A note shorter than this blurs into its neighbours; a column alone flickers.
NOTE_WINDOW_S = 0.6
# A note's octave is voted over a longer window, since its attack and its
# harmonics trade the lead within it, and a hue flickering inside one note
# reads as two.
OCTAVE_WINDOW_S = 1.5
# A row at this share of its band's chroma is at full brightness; an even
# spread across all twelve holds 1/12.
FULL_SHARE = 0.5
# A cell's hue is its octave, from C2 up, and the same octave the same hue in
# either strip; its brightness, up to that hue, is its share. Five hues
# far apart, in the spectrum's order, red low to violet high.
OCTAVE_COLOURS = {2: "#e5483a", 3: "#f29a2e", 4: "#a3d63c", 5: "#3cc8e6", 6: "#ac7cf5"}
CHROMA_STEPS = 12
# Under this fraction of full brightness a cell is a grey, not a hue: a faint
# cell's octave is a coin toss, and dim hues read as mud.
HUE_FROM = 0.35
FAINT_GREY = 0.28
# The envelope's peak and its lighter RMS inside it.
LEVEL_SHADES = ((0.42, 0.42, 0.42), (0.65, 0.65, 0.65))
# Sections are found on half-second blocks, each compared with the eight
# seconds either side of it; a part shorter than SECTION_MIN_S is a fill or a
# pickup, not a section, and the song's first and last moments are its edges.
SECTION_BLOCK_S = 0.5
SECTION_KERNEL_S = 8
SECTION_MIN_S = 8
# A boundary's novelty is this many times the song's median: under it are a
# held note's swells and a fill. A multiple of the median rather than a share of
# the peak, so one drastic change cannot hide the song's ordinary ones.
SECTION_THRESHOLD = 3
TIMBRE_ROWS = ROWS_PER_OCTAVE // 3


def decode(path):
    """Mono at SR, the channels averaged, decoded by ffmpeg so any format reads the same."""
    pcm = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(pcm, np.float32)


def stft_magnitude(x):
    """Peak-scaled magnitude per frame, frames centred on their times, about two per pixel column."""
    hop = max(256, len(x) // (2 * WIDTH_PX))
    padded = np.pad(x, NFFT // 2)
    window = np.hanning(NFFT).astype(np.float32)
    starts = range(0, len(padded) - NFFT + 1, hop)
    magnitude = np.empty((len(starts), NFFT // 2 + 1), np.float32)
    for i, s in enumerate(starts):
        magnitude[i] = np.abs(np.fft.rfft(padded[s:s + NFFT] * window))
    magnitude *= 2 / window.sum()
    return magnitude, np.fft.rfftfreq(NFFT, 1 / SR), hop / SR


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


def envelope(x, columns):
    """Per column of the plot: the peak, and the RMS that sits inside it."""
    n = len(x) // columns
    blocks = x[: n * columns].reshape(columns, n)
    return np.abs(blocks).max(axis=1), np.sqrt((blocks.astype(np.float64) ** 2).mean(axis=1))


def chroma_shares(magnitude, freqs, step, duration, columns, band_hz, octaves):
    """Per column of the plot, each pitch class's share of band_hz and the
    octave that carries most of it, both as (12, columns).

    A chroma from the band's spectral peaks, each within PEAK_RANGE_DB of the
    band's loudest in its frame, weighted by magnitude: so a note and its
    harmonics vote for their own class, while the drums' broad smear, flat
    rather than peaked, barely votes. A column is all zeros where the band's
    loudest peak stays under QUIET_DB, since a band that is all but silent
    still has peaks, of noise or bleed. A peak votes for the octave it sits in,
    clamped to octaves (first, last), C to B; a cell's octave is the one with
    the most weight, never a mean, which can land on an octave nobody played.
    """
    band = (freqs >= band_hz[0]) & (freqs <= band_hz[1])
    m = magnitude[:, band]
    inner = m[:, 1:-1]
    loudest = m.max(axis=1)
    peaks = (inner > m[:, :-2]) & (inner >= m[:, 2:])
    peaks &= inner > loudest[:, None] * 10 ** (-PEAK_RANGE_DB / 20)
    weights = np.where(peaks, inner, 0)
    midi = np.round(69 + 12 * np.log2(freqs[band][1:-1] / 440)).astype(int)
    pitch_class = midi % 12
    octave = np.clip(midi // 12 - 1, *octaves) - octaves[0]
    count = octaves[1] - octaves[0] + 1
    chroma = np.stack([
        weights[:, (octave == o) & (pitch_class == k)].sum(axis=1) for o in range(count) for k in range(12)
    ], axis=1)

    column = np.minimum((np.arange(len(chroma)) * step / duration * columns).astype(int), columns - 1)
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


def chroma_ramps():
    """Per octave, CHROMA_STEPS colours, as {octave: (steps, 3)}: black up to a
    dim grey while a cell is faint, then from half its hue up to the hue itself."""
    from matplotlib.colors import to_rgb

    t = np.linspace(0, 1, CHROMA_STEPS)[:, None]
    faint = t < HUE_FROM
    grey = t / HUE_FROM * FAINT_GREY
    lift = 0.5 + 0.5 * (t - HUE_FROM) / (1 - HUE_FROM)
    return {
        o: np.where(faint, grey, lift * np.array(to_rgb(hue))) for o, hue in OCTAVE_COLOURS.items()
    }


def chroma_image(shares, octave, ramps):
    """RGB rows x columns: each cell its octave's ramp, at the step its share reaches."""
    steps = np.round(np.minimum(shares / FULL_SHARE, 1) * (CHROMA_STEPS - 1)).astype(int)
    image = np.zeros((*shares.shape, 3))
    for o, ramp in ramps.items():
        at = octave == o
        image[at] = ramp[steps[at]]
    return image


def envelope_image(peak, rms, rows=128):
    """RGB rows x columns, row 0 at the bottom: each column's peak and the RMS
    inside it, mirrored about the centre line, black around them."""
    level = np.abs(np.linspace(-1, 1, rows))[:, None]
    image = np.zeros((rows, len(peak), 3))
    image[level <= peak] = LEVEL_SHADES[0]
    image[level <= rms] = LEVEL_SHADES[1]
    return image


def unit_rows(features):
    """Each row scaled to length 1; an all-zero row, a silent block's chroma, stays zero."""
    return features / np.maximum(np.linalg.norm(features, axis=1, keepdims=True), 1e-12)


def section_times(db, magnitude, freqs, step, duration):
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
    block = np.minimum((np.arange(db.shape[1]) * step / SECTION_BLOCK_S).astype(int), blocks - 1)
    bands = db[: db.shape[0] // TIMBRE_ROWS * TIMBRE_ROWS].reshape(-1, TIMBRE_ROWS, db.shape[1]).mean(axis=1)
    timbre = np.zeros((blocks, len(bands)))
    np.add.at(timbre, block, bands.T)
    timbre /= np.maximum(np.bincount(block, minlength=blocks), 1)[:, None]
    timbre = (timbre - timbre.mean(axis=0)) / np.maximum(timbre.std(axis=0), 1e-6)
    chroma, _ = chroma_shares(magnitude, freqs, step, duration, blocks, NOTE_BAND_HZ, (2, 6))
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


def mmss(seconds, _pos=None):
    return f"{int(seconds) // 60}:{int(seconds) % 60:02d}"


def hz(f):
    return f"{f // 1000}k" if f >= 1000 else str(f)


def main():
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.ticker import FixedLocator, FuncFormatter, MultipleLocator, NullLocator
    from PIL import Image

    song, out_png = sys.argv[1:3]
    x = decode(song)
    magnitude, freqs, step = stft_magnitude(x)
    db = log_rows(magnitude, freqs)
    duration = len(x) / SR

    cmap = plt.get_cmap("magma", round(-FLOOR_DB / STEP_DB))
    fig, axes = plt.subplots(
        4, 2, figsize=(WIDTH_PX / DPI, HEIGHT_PX / DPI), dpi=DPI, sharex="col",
        gridspec_kw={
            "height_ratios": (4, 0.8, 1.6, 1.6), "width_ratios": (1, 0.015), "hspace": 0.08, "wspace": 0.01,
        },
    )
    (ax, cax), (wave, spare), (treble, treble_key), (bass, bass_key) = axes
    spare.remove()

    # Rows are evenly spaced in octaves, so the image sits on a linear log2(Hz) axis.
    image = ax.imshow(
        db, origin="lower", aspect="auto", cmap=cmap, vmin=FLOOR_DB, vmax=0,
        extent=(0, db.shape[1] * step, np.log2(LOW_HZ), np.log2(TOP_HZ)), interpolation="antialiased",
    )
    ax.yaxis.set_major_locator(FixedLocator(np.log2(TICKS_HZ)))
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _pos: hz(round(2 ** v))))
    ax.yaxis.set_minor_locator(NullLocator())
    ax.set_ylabel("frequency (Hz)")
    ax.set_title(f"{Path(song).name} — {mmss(duration)}")
    fig.colorbar(image, cax=cax, label="dBFS")
    for t in section_times(db, magnitude, freqs, step, duration):
        ax.axvline(t, color="white", linewidth=0.8, linestyle=(0, (4, 3)))

    columns = WIDTH_PX
    peak, rms = envelope(x, columns)
    wave.imshow(
        envelope_image(peak, rms), origin="lower", aspect="auto",
        extent=(0, duration, -1, 1), interpolation="nearest",
    )
    wave.yaxis.set_major_locator(NullLocator())
    wave.set_ylabel("level")

    ramps = chroma_ramps()
    for strip, key, band_hz, octaves, name in (
        (treble, treble_key, (CROSSOVER_HZ, NOTE_BAND_HZ[1]), (4, 6), "treble, C4–C7"),
        (bass, bass_key, (NOTE_BAND_HZ[0], CROSSOVER_HZ), (2, 3), "bass, C2–C4"),
    ):
        shares, octave = chroma_shares(magnitude, freqs, step, duration, columns, band_hz, octaves)
        # Silence has spectral peaks too, of noise; it stays dark however clear they look.
        shares[:, rms < QUIET] = 0
        strip.imshow(
            chroma_image(shares, octave, ramps), origin="lower", aspect="auto",
            extent=(0, duration, -0.5, 11.5), interpolation="nearest",
        )
        strip.yaxis.set_major_locator(FixedLocator(range(12)))
        strip.set_yticklabels(NOTE_NAMES, fontsize=7)
        strip.set_ylabel(name)
        # The octave key: one swatch per octave the strip can show, low at the bottom.
        held = range(octaves[0], octaves[1] + 1)
        key.imshow(
            np.array([[ramps[o][-1]] for o in held]), origin="lower", aspect="auto",
            extent=(0, 1, octaves[0] - 0.5, octaves[1] + 0.5), interpolation="nearest",
        )
        key.xaxis.set_major_locator(NullLocator())
        key.yaxis.tick_right()
        key.yaxis.set_major_locator(FixedLocator(held))
        key.set_yticklabels([f"C{o}" for o in held], fontsize=8)
    treble_key.set_title("octave", fontsize=8)

    bass.set_xlim(0, duration)
    bass.xaxis.set_major_locator(MultipleLocator(30 if duration > 240 else 15))
    bass.xaxis.set_major_formatter(FuncFormatter(mmss))
    bass.set_xlabel("time (m:ss)")
    fig.subplots_adjust(left=0.055, right=0.94, top=0.965, bottom=0.05)

    buffer = io.BytesIO()
    fig.savefig(buffer, format="png")
    # A fixed palette — the map's own steps, then greys for the text, then the
    # strips' steps and the envelope's shades — since an adaptive one merges
    # the rarest steps, the loudest, and the scale lies.
    steps = [round(255 * c) for i in range(cmap.N) for c in cmap(i)[:3]]
    greys = [round(255 * i / (63 - cmap.N)) for i in range(64 - cmap.N) for _ in range(3)]
    chroma = [round(255 * c) for ramp in ramps.values() for rgb in ramp[1:] for c in rgb]
    shades = [round(255 * c) for rgb in LEVEL_SHADES for c in rgb]
    palette = Image.new("P", (1, 1))
    palette.putpalette(steps + greys + chroma + shades)
    Image.open(buffer).convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE).save(
        out_png, optimize=True,
    )
    print(f"{out_png}: {Path(out_png).stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
