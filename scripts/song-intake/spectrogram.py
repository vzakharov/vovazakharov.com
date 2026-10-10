#!/usr/bin/env python3
"""A song's spectrogram over its waveform: its whole length across, pitch up.

Usage: spectrogram.py <song> <out.png>

Where the voice sits and where its melody goes, where the drums come in, a
bridge that drops out, a master that runs into its ceiling — what a reader who
cannot hear the song can see at a glance.

The frequency axis is logarithmic, 40 Hz to 10 kHz, so an octave is the same
height anywhere and a melodic line keeps its shape; 40 Hz takes in a bass's
open E. A full-scale sine reads 0 dBFS. Under it, on the same time axis, the
waveform: each column's peak, with its RMS inside, which is where the dynamics
show. Its lower half is coloured by the note that dominates the bass, its upper
half by the note that dominates above it — each a pitch class on a hue circle,
grey where no one note does or the band is quiet. Each is the strongest pitch
class in its band of the spectrum already drawn, harmonics voting with their
fundamentals, so the lower half steps with the bass line and the upper half
follows the tune or the chord over it, and neither costs a pitch tracker. The
colour map is cut into 2.5 dB steps and the PNG kept to those colours and a few
greys, which holds a song under 350 KB: a smooth map over a noisy texture
compresses several times worse.

Needs ffmpeg and matplotlib (numpy and Pillow come with it).
"""

import colorsys
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
WIDTH_PX, HEIGHT_PX, DPI = 1400, 760, 100

NOTE_NAMES = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
# C2 to C7: below it a bin is wider than a semitone; above it, mostly harmonics.
# A bass note under C2 still votes through its octave harmonic, the same class.
NOTE_BAND_HZ = (65, 2100)
# Middle C splits the bass band from the high one, where the bass clef meets the
# treble: a bass line and its first harmonics sit under it, and most of a melody
# above it. A male voice's lowest notes fall under it, and so vote with the bass.
CROSSOVER_HZ = 262
PEAK_RANGE_DB = 30
CLEAR_SHARE = 0.2
QUIET_DB = -50
# A note shorter than this blurs into its neighbours; a column alone flickers.
NOTE_WINDOW_S = 0.6
# The pitch classes round a hue circle, C at red; per class a peak shade and a
# lighter RMS shade, both added to the PNG's fixed palette.
NOTE_SHADES = [
    [colorsys.hls_to_rgb(k / 12, lightness, 0.75) for lightness in (0.58, 0.8)] for k in range(12)
]
NO_NOTE_SHADES = [(0.42, 0.42, 0.42), (0.65, 0.65, 0.65)]


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


def dominant_notes(magnitude, freqs, step, duration, columns, band_hz):
    """Per column of the plot, the pitch class that dominates band_hz, or -1 where none does.

    A chroma from the band's spectral peaks, each within PEAK_RANGE_DB of the
    band's loudest in its frame, weighted by magnitude: so a note and its
    harmonics vote for their own class, while the drums' broad smear, flat
    rather than peaked, barely votes. A column is clear when one class holds
    CLEAR_SHARE of its chroma; an even spread across all twelve holds 1/12.
    It is -1 too where the band's loudest peak stays under QUIET_DB, since a
    band that is all but silent still has peaks, of noise or bleed.
    """
    band = (freqs >= band_hz[0]) & (freqs <= band_hz[1])
    m = magnitude[:, band]
    inner = m[:, 1:-1]
    loudest = m.max(axis=1)
    peaks = (inner > m[:, :-2]) & (inner >= m[:, 2:])
    peaks &= inner > loudest[:, None] * 10 ** (-PEAK_RANGE_DB / 20)
    weights = np.where(peaks, inner, 0)
    pitch_class = np.round(69 + 12 * np.log2(freqs[band][1:-1] / 440)).astype(int) % 12
    chroma = np.stack([weights[:, pitch_class == k].sum(axis=1) for k in range(12)], axis=1)

    column = np.minimum((np.arange(len(chroma)) * step / duration * columns).astype(int), columns - 1)
    per_column = np.zeros((columns, 12))
    np.add.at(per_column, column, chroma)
    level = np.zeros(columns)
    np.maximum.at(level, column, loudest)
    span = np.ones(max(1, round(NOTE_WINDOW_S * columns / duration)))
    per_column = np.stack([np.convolve(per_column[:, k], span, "same") for k in range(12)], axis=1)
    share = per_column.max(axis=1) / np.maximum(per_column.sum(axis=1), 1e-12)
    clear = (share >= CLEAR_SHARE) & (level >= 10 ** (QUIET_DB / 20))
    return np.where(clear, per_column.argmax(axis=1), -1)


def waveform_image(peak, rms, bass_notes, high_notes, rows=128):
    """RGB rows x columns, row 0 at the bottom: each column's peak and RMS in two
    shades of a note — the bass note's under the centre line, the high note's
    over it — black around them."""
    signed = np.linspace(-1, 1, rows)[:, None]
    level = np.abs(signed)
    palette = np.array(NOTE_SHADES + [NO_NOTE_SHADES])  # -1 picks the last, the grey
    shades = np.where((signed < 0)[..., None, None], palette[bass_notes], palette[high_notes])
    image = np.zeros((rows, len(peak), 3))
    image[level <= peak] = shades[:, :, 0][level <= peak]
    image[level <= rms] = shades[:, :, 1][level <= rms]
    return image


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
        2, 2, figsize=(WIDTH_PX / DPI, HEIGHT_PX / DPI), dpi=DPI, sharex="col",
        gridspec_kw={"height_ratios": (4, 1), "width_ratios": (1, 0.015), "hspace": 0.06, "wspace": 0.01},
    )
    (ax, cax), (wave, spare) = axes
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

    columns = WIDTH_PX
    peak, rms = envelope(x, columns)
    bass = dominant_notes(magnitude, freqs, step, duration, columns, (NOTE_BAND_HZ[0], CROSSOVER_HZ))
    high = dominant_notes(magnitude, freqs, step, duration, columns, (CROSSOVER_HZ, NOTE_BAND_HZ[1]))
    # Silence has spectral peaks too, of noise; it is grey however clear they look.
    bass[rms < 10 ** (QUIET_DB / 20)] = -1
    high[rms < 10 ** (QUIET_DB / 20)] = -1
    wave.imshow(
        waveform_image(peak, rms, bass, high), origin="lower", aspect="auto",
        extent=(0, duration, -1, 1), interpolation="nearest",
    )
    wave.yaxis.set_major_locator(FixedLocator((-1, 0, 1)))
    # Rotated, the label reads bottom up, so each half's band names it.
    wave.set_ylabel("bass · level · high")

    wave.set_xlim(0, duration)
    wave.xaxis.set_major_locator(MultipleLocator(30 if duration > 240 else 15))
    wave.xaxis.set_major_formatter(FuncFormatter(mmss))
    wave.set_xlabel("time (m:ss)")
    fig.subplots_adjust(left=0.055, right=0.94, top=0.95, bottom=0.075)

    # The note legend, under the waveform's right end: one cell per class, then grey.
    legend = fig.add_axes((0.94 - 0.3, 0.008, 0.3, 0.024))
    legend.imshow([[shade[0] for shade in NOTE_SHADES + [NO_NOTE_SHADES]]], aspect="auto")
    for k, (name, (shade, _)) in enumerate(zip(NOTE_NAMES + ("none",), NOTE_SHADES + [NO_NOTE_SHADES])):
        ink = "black" if np.dot(shade, (0.299, 0.587, 0.114)) > 0.5 else "white"
        legend.text(k, 0, name, ha="center", va="center", fontsize=7, color=ink)
    legend.set_axis_off()

    buffer = io.BytesIO()
    fig.savefig(buffer, format="png")
    # A fixed palette — the map's own steps, then greys for the text, then the
    # notes' shades — since an adaptive one merges the rarest steps, the
    # loudest, and the scale lies.
    steps = [round(255 * c) for i in range(cmap.N) for c in cmap(i)[:3]]
    greys = [round(255 * i / (63 - cmap.N)) for i in range(64 - cmap.N) for _ in range(3)]
    shades = [round(255 * c) for pair in NOTE_SHADES + [NO_NOTE_SHADES] for rgb in pair for c in rgb]
    palette = Image.new("P", (1, 1))
    palette.putpalette(steps + greys + shades)
    Image.open(buffer).convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE).save(
        out_png, optimize=True,
    )
    print(f"{out_png}: {Path(out_png).stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
