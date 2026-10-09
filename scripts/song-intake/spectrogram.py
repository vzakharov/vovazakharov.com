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
show, coloured by the note that dominates the moment — its pitch class on a hue
circle, grey where no one note does. That note is the strongest pitch class in
the mix, harmonics voting with their fundamentals, so it follows the bass or
the tune or the chord, whichever is loudest, from the spectrum already
drawn, so it costs no pitch tracker. The colour map is cut into 2.5 dB steps and the PNG kept to those colours
and a few greys, which holds a song under 350 KB: a smooth map over a noisy
texture compresses several times worse.

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
NOTE_BAND_HZ = (65, 2100)
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


def dominant_notes(magnitude, freqs, step, duration, columns):
    """Per column of the plot, the pitch class that dominates it, or -1 where none does.

    A chroma from the spectrum's peaks in NOTE_BAND_HZ, each within PEAK_RANGE_DB
    of its frame's loudest, weighted by magnitude: so a bass note and its
    harmonics vote for their own class, while the drums' broad smear, flat
    rather than peaked, barely votes. A column is clear when one class holds
    CLEAR_SHARE of its chroma; an even spread across all twelve holds 1/12.
    """
    band = (freqs >= NOTE_BAND_HZ[0]) & (freqs <= NOTE_BAND_HZ[1])
    m = magnitude[:, band]
    inner = m[:, 1:-1]
    peaks = (inner > m[:, :-2]) & (inner >= m[:, 2:])
    peaks &= inner > m.max(axis=1, keepdims=True) * 10 ** (-PEAK_RANGE_DB / 20)
    weights = np.where(peaks, inner, 0)
    pitch_class = np.round(69 + 12 * np.log2(freqs[band][1:-1] / 440)).astype(int) % 12
    chroma = np.stack([weights[:, pitch_class == k].sum(axis=1) for k in range(12)], axis=1)

    column = np.minimum((np.arange(len(chroma)) * step / duration * columns).astype(int), columns - 1)
    per_column = np.zeros((columns, 12))
    np.add.at(per_column, column, chroma)
    span = np.ones(max(1, round(NOTE_WINDOW_S * columns / duration)))
    per_column = np.stack([np.convolve(per_column[:, k], span, "same") for k in range(12)], axis=1)
    share = per_column.max(axis=1) / np.maximum(per_column.sum(axis=1), 1e-12)
    return np.where(share >= CLEAR_SHARE, per_column.argmax(axis=1), -1)


def waveform_image(peak, rms, notes, rows=128):
    """RGB rows x columns: each column's peak and RMS in its note's two shades, black around them."""
    level = np.abs(np.linspace(-1, 1, rows))[:, None]
    shades = np.array(NOTE_SHADES + [NO_NOTE_SHADES])[notes]  # -1 picks the last, the grey
    image = np.zeros((rows, len(peak), 3))
    image[level <= peak] = np.broadcast_to(shades[:, 0], image.shape)[level <= peak]
    image[level <= rms] = np.broadcast_to(shades[:, 1], image.shape)[level <= rms]
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
    notes = dominant_notes(magnitude, freqs, step, duration, columns)
    # Silence has spectral peaks too, of noise; it is grey however clear they look.
    notes[rms < 10 ** (QUIET_DB / 20)] = -1
    wave.imshow(
        waveform_image(peak, rms, notes), origin="lower", aspect="auto",
        extent=(0, duration, -1, 1), interpolation="nearest",
    )
    wave.yaxis.set_major_locator(FixedLocator((-1, 0, 1)))
    wave.set_ylabel("level")

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
