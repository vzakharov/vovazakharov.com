#!/usr/bin/env python3
"""A song's spectrogram over its loudness and its chromagram: its whole length across, pitch up.

Usage: spectrogram.py <song> <out.png> [--from m:ss --to m:ss]

Beside the PNG it writes <out>.txt, the sidecar: the numbers the picture can
only approximate — tempo, key, tuning, and per section its tempo, loudness and
chords. `song_facts.py`'s docstrings say how each is measured. The title
carries the tempo, and the tuning when it is over 15 cents off A440.

--from and --to draw that stretch at the full width, on song time, with a
faint line down the chroma strips at each beat; the analysis still runs on
the whole song, and a zoom writes no sidecar, which describes all of it.

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
from pathlib import Path

import numpy as np

from song_facts import (
    FLOOR_DB, LOW_HZ, NOTE_BAND_HZ, QUIET, SR, TOP_HZ, chroma_shares, decode, log_rows, measure, mmss, sidecar,
    stft_magnitude, tempo_label, tuning_label,
)

TICKS_HZ = (50, 100, 200, 500, 1000, 2000, 5000, 10000)
# 2.7 Hz bins: a semitone apart is 2.4 Hz at 40 Hz and 6 Hz at 100, so the
# bass's notes stay apart at the cost of a 0.37 s window.
NFFT = 8192
STEP_DB = 2.5
WIDTH_PX, HEIGHT_PX, DPI = 1400, 1100, 100
PLOT_LEFT, PLOT_RIGHT = 0.055, 0.94
# A song's tuning is in the title when it is this far off A440: past it, a
# note sits a fifth of the way to its neighbour.
TITLE_TUNING_CENTS = 15
# Beat lines closer than this are a wash, not a grid.
BEAT_MIN_PX = 6

NOTE_NAMES = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
# Middle C splits the bass band from the treble one, where the clefs meet: a
# bass line and its first harmonics sit under it, and most of a melody above
# it. A male voice's lowest notes fall under it, and so vote with the bass.
CROSSOVER_HZ = 262
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


def envelope(x, columns):
    """Per column of the plot: the peak, and the RMS that sits inside it."""
    n = len(x) // columns
    blocks = x[: n * columns].reshape(columns, n)
    return np.abs(blocks).max(axis=1), np.sqrt((blocks.astype(np.float64) ** 2).mean(axis=1))


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


def hz(f):
    return f"{f // 1000}k" if f >= 1000 else str(f)


def drawing_stft(x):
    """The STFT the picture is drawn from, about two frames per pixel column, and its dB rows."""
    magnitude, freqs, step = stft_magnitude(x, NFFT, max(256, len(x) // (2 * WIDTH_PX)))
    return magnitude, freqs, step, log_rows(magnitude, freqs)


def seconds(text):
    minutes, _, secs = text.rpartition(":")
    return 60 * int(minutes or 0) + float(secs)


def main():
    import argparse

    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.ticker import FixedLocator, FuncFormatter, MultipleLocator, NullLocator
    from PIL import Image

    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("song")
    parser.add_argument("out_png")
    parser.add_argument("--from", dest="start", type=seconds, help="zoom start, m:ss")
    parser.add_argument("--to", dest="end", type=seconds, help="zoom end, m:ss")
    args = parser.parse_args()
    song, out_png = args.song, args.out_png

    x = decode(song)
    whole = drawing_stft(x)
    facts = measure(x, *whole)
    zoomed = args.start is not None or args.end is not None
    t0 = args.start or 0
    t1 = min(args.end or facts.duration, facts.duration)
    if not 0 <= t0 < t1:
        parser.error(f"--from {mmss(t0)} must come before --to {mmss(t1)}")
    x = x[int(t0 * SR):int(t1 * SR)]
    magnitude, freqs, step, db = drawing_stft(x) if zoomed else whole
    duration = t1 - t0

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
        extent=(t0, t0 + db.shape[1] * step, np.log2(LOW_HZ), np.log2(TOP_HZ)), interpolation="antialiased",
    )
    ax.yaxis.set_major_locator(FixedLocator(np.log2(TICKS_HZ)))
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _pos: hz(round(2 ** v))))
    ax.yaxis.set_minor_locator(NullLocator())
    ax.set_ylabel("frequency (Hz)")
    span = f"{mmss(t0)}–{mmss(t1)} of {mmss(facts.duration)}" if zoomed else mmss(facts.duration)
    title = f"{Path(song).name} — {span} · {tempo_label(facts)}"
    if abs(facts.tuning) > TITLE_TUNING_CENTS:
        title += f" · {tuning_label(facts.tuning)}"
    ax.set_title(title)
    fig.colorbar(image, cax=cax, label="dBFS")
    for s in facts.sections[1:]:
        if t0 < s.start < t1:
            ax.axvline(s.start, color="white", linewidth=0.8, linestyle=(0, (4, 3)))

    columns = WIDTH_PX
    peak, rms = envelope(x, columns)
    wave.imshow(
        envelope_image(peak, rms), origin="lower", aspect="auto",
        extent=(t0, t1, -1, 1), interpolation="nearest",
    )
    wave.yaxis.set_major_locator(NullLocator())
    wave.set_ylabel("level")

    # Beats only where they stand apart: across a whole song they are a grey wash.
    beats = facts.beats[(facts.beats >= t0) & (facts.beats < t1)]
    plot_px = WIDTH_PX * (PLOT_RIGHT - PLOT_LEFT)
    if not zoomed or len(beats) < 2 or np.median(np.diff(beats)) / duration * plot_px < BEAT_MIN_PX:
        beats = []
    ramps = chroma_ramps()
    for strip, key, band_hz, octaves, name in (
        (treble, treble_key, (CROSSOVER_HZ, NOTE_BAND_HZ[1]), (4, 6), "treble, C4–C7"),
        (bass, bass_key, (NOTE_BAND_HZ[0], CROSSOVER_HZ), (2, 3), "bass, C2–C4"),
    ):
        shares, octave = chroma_shares(magnitude, freqs, step, duration, columns, band_hz, octaves, facts.tuning)
        # Silence has spectral peaks too, of noise; it stays dark however clear they look.
        shares[:, rms < QUIET] = 0
        strip.imshow(
            chroma_image(shares, octave, ramps), origin="lower", aspect="auto",
            extent=(t0, t1, -0.5, 11.5), interpolation="nearest",
        )
        for t in beats:
            strip.axvline(t, color="white", alpha=0.45, linewidth=0.6)
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

    bass.set_xlim(t0, t1)
    bass.xaxis.set_major_locator(MultipleLocator(next(s for s in (60, 30, 15, 5, 2, 1) if duration / s >= 8)))
    bass.xaxis.set_major_formatter(FuncFormatter(mmss))
    bass.set_xlabel("time (m:ss)")
    fig.subplots_adjust(left=PLOT_LEFT, right=PLOT_RIGHT, top=0.965, bottom=0.05)

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
    # A zoom shows part of the song, and the sidecar describes the whole of it.
    if not zoomed:
        text = Path(out_png).with_suffix(".txt")
        text.write_text(sidecar(Path(song).name, facts), encoding="utf-8")
        print(text)


if __name__ == "__main__":
    main()
