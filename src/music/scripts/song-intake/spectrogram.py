#!/usr/bin/env python3
"""A song's spectrogram over its loudness, chromagrams and drums: its whole length across, pitch up.

Usage: spectrogram.py <song> <dir>/<slug>.png <stems> [--from m:ss --to m:ss]

<stems> is the directory demucs writes the song's four stems to
(`python -m demucs -n htdemucs -o <out> <song>` writes
<out>/htdemucs/<name>/{drums,bass,other,vocals}.wav), aligned to the song
before anything is read off them. The pitch strips, the drums and the
chords are read off the stems: off the mix, a low voice votes with the
bass, the bass's harmonics with the tune, the tune's passing notes with the
chords, and a picked guitar's attack reads as a drum hit.

Beside the PNG it writes <slug>.txt, the sidecar: the numbers the picture can
only approximate — tempo, key, tuning, and per section its tempo, loudness and
chords. The docstrings of `song_facts.py` and the modules it imports say how
each is measured. The title carries the tempo, and the tuning when it is over
15 cents off A440.

And beside both, one zoom per section, <n>.png: the stretch between two
dashed lines drawn at the full width, so a section can be looked at closely
without asking. The number is the one at the section's top left in the whole
song's picture, and at the head of its line in the sidecar. A zoom draws a
faint line down the strips and the drums at each bar, where the snare or the
chord changes settle where the bar starts (`rhythm.downbeats`), and none
where they do not; the whole song's picture draws none. The lines are for
reference: a zoom without them has bars all the same, and the sidecar names
the zooms that draw them.

--from and --to draw that stretch at the full width alone, on song time; the
analysis still runs on the whole song, and such a zoom writes no sidecar,
which describes all of it.

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

Under that, three chromagram strips: the melody off the vocals stem, the
harmony off the other stem, and the bass off the bass stem under C4. Twelve
rows each, C at the bottom, each named as the song's key spells it, a row as
bright as its pitch class's share of the strip, harmonics voting with their
fundamentals, and in the bass strip a fifth sounding with its root folded onto
the root (`fold_fifths`). So the melody strip carries the tune, the bass strip
steps with the chords' roots, one row each, and a chord shows as several bright
rows at once in the harmony strip. A pitch class is read off
its labelled row; a row's hue is the octave that carries it, keyed beside each
strip, one hue per octave and the same in every strip — C2 red, C3 orange, C4
green, C5 cyan, C6 violet — so a melody that leaps an octave changes colour on
its row. Twelve hues for twelve classes would be misread for their neighbours;
five far apart are not. A faint cell is grey, its octave too unsure to colour,
and a strip is dark where its stem is quiet.

At the bottom, the drums off the drums stem: four lanes, kick, toms, snare
(claps with it) and cymbals, each a hue of its own and a dot per hit, its area
and brightness the hit's, so the rhythm reads off it the way the harmony reads
off the strips. Where the hits run denser than a dot, the dots merge into a
bar, which across a whole song still says where the drums play.
`drums.py` says how the stem is read and which of its onsets it refuses.

The spectrogram's map is cut into 2.5 dB steps, the strips' into a few
brightness steps per octave, and the PNG kept to those colours and a few greys,
which holds a song under 350 KB: a smooth map over a noisy texture compresses
several times worse.

Needs ffmpeg and matplotlib (numpy and Pillow come with it); the stems need
demucs, which pulls in torch.
"""

import argparse
import io
from pathlib import Path

import numpy as np

from audio import FLOOR_DB, LOW_HZ, QUIET, SR, TOP_HZ, aligned, decode, log_rows, mmss, stft_magnitude
from drums import LANES, drum_hits
from harmony import note_names
from pitch import NOTE_BAND_HZ, chroma_shares
from song_facts import measure, sidecar, tempo_label, tuning_label

TICKS_HZ = (50, 100, 200, 500, 1000, 2000, 5000, 10000)
# 2.7 Hz bins: a semitone apart is 2.4 Hz at 40 Hz and 6 Hz at 100, so the
# bass's notes stay apart at the cost of a 0.37 s window.
NFFT = 8192
STEP_DB = 2.5
WIDTH_PX, HEIGHT_PX, DPI = 1400, 1440, 100
PLOT_LEFT, PLOT_RIGHT = 0.055, 0.94
# A song's tuning is in the title when it is this far off A440: past it, a
# note sits a fifth of the way to its neighbour.
TITLE_TUNING_CENTS = 15

# demucs's four stems, by the names of the files it writes.
STEMS = ("drums", "bass", "other", "vocals")
# The pitch strips, top to bottom: each its label, the stem it reads, the
# band it reads and the octaves it can colour. The bass's band ends half a
# semitone under C4.
BASS_TOP_HZ = 254
STRIPS = (
    ("melody", "vocals", NOTE_BAND_HZ, (2, 6)),
    ("harmony", "other", NOTE_BAND_HZ, (2, 6)),
    ("bass", "bass", (NOTE_BAND_HZ[0], BASS_TOP_HZ), (2, 3)),
)
# A row at this share of its band's chroma is at full brightness; an even
# spread across all twelve holds 1/12.
FULL_SHARE = 0.5
# A cell's hue is its octave, from C2 up, and the same octave the same hue in
# every strip; its brightness, up to that hue, is its share. Five hues
# far apart, in the spectrum's order, red low to violet high.
OCTAVE_COLOURS = {2: "#e5483a", 3: "#f29a2e", 4: "#a3d63c", 5: "#3cc8e6", 6: "#ac7cf5"}
CHROMA_STEPS = 12
# Under this fraction of full brightness a cell is a grey, not a hue: a faint
# cell's octave is a coin toss, and dim hues read as mud.
HUE_FROM = 0.35
FAINT_GREY = 0.28
# The envelope's peak and its lighter RMS inside it.
LEVEL_SHADES = ((0.42, 0.42, 0.42), (0.65, 0.65, 0.65))
# One hue per drum lane, warm low to cool high, each ramped from black in
# DRUM_STEPS; none is an octave's hue, since a lane has no octave.
DRUM_COLOURS = {"kick": "#ff6a3d", "toms": "#ffb347", "snare": "#fff27a", "cymbals": "#9fe8ff"}
DRUM_STEPS = 8
# The drum row's height against a strip's.
KIT_RATIO = 0.8
# A dot's diameter in pixels, the faintest hit's and the loudest's, a lane
# being about 20 px tall; its area grows with the hit. The faintest hit is
# still lit DIM_STEP steps up its lane's ramp, since a dark dot on black is
# no dot. A black rim keeps dots that touch apart.
DOT_PX = (4, 14)
DIM_STEP = 3
RIM_PX = 0.6
# A bar line is faint enough to read the strips through.
BAR_ALPHA = 0.45


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


def drum_ramps():
    """Per lane, DRUM_STEPS colours from black up to its hue, as (lanes, steps, 3)."""
    from matplotlib.colors import to_rgb

    t = np.linspace(0, 1, DRUM_STEPS)[:, None]
    return np.array([t * np.array(to_rgb(DRUM_COLOURS[lane])) for lane in LANES])


def drum_dots(times, lit, t0, t1, ramps):
    """The hits from t0 to t1 as dots: (time, lane, area in points², RGB) each,
    faintest first so a loud hit is drawn over the faint one beside it."""
    inside = (times >= t0) & (times < t1)
    hit, lane = np.nonzero(lit[inside])
    level = lit[inside][hit, lane]
    order = np.argsort(level, kind="stable")
    hit, lane, level = hit[order], lane[order], level[order]
    diameter_pt = (DOT_PX[0] + (DOT_PX[1] - DOT_PX[0]) * np.sqrt(level)) * 72 / DPI
    steps = DIM_STEP + np.round(level * (DRUM_STEPS - 1 - DIM_STEP)).astype(int)
    return times[inside][hit], lane, diameter_pt**2, ramps[lane, steps]


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


def render(name, tracks, facts, drums, t0, t1, out_png, section=None):
    """Draw t0–t1 of the song to out_png. tracks holds, for the mix and each
    pitch strip's stem, its whole samples and their drawing_stft, reused when
    the stretch is all of the song; drums is drum_hits of the drums stem;
    section is the number a section's zoom is titled with."""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.ticker import FixedLocator, FuncFormatter, MultipleLocator, NullLocator
    from PIL import Image

    zoomed = t0 > 0 or t1 < facts.duration
    views = {}
    for track, (samples, whole) in tracks.items():
        samples = samples[int(t0 * SR):int(t1 * SR)]
        views[track] = samples, drawing_stft(samples) if zoomed else whole
    x, (magnitude, freqs, step, db) = views["mix"]
    duration = t1 - t0

    cmap = plt.get_cmap("magma", round(-FLOOR_DB / STEP_DB))
    ratios = (4, 0.8) + (1.6,) * len(STRIPS) + (KIT_RATIO,)
    fig, axes = plt.subplots(
        len(ratios), 2, figsize=(WIDTH_PX / DPI, HEIGHT_PX / DPI), dpi=DPI, sharex="col",
        gridspec_kw={"height_ratios": ratios, "width_ratios": (1, 0.015), "hspace": 0.08, "wspace": 0.01},
    )
    (ax, cax), (wave, spare), *strips, (kit, kit_spare) = axes
    spare.remove()
    kit_spare.remove()

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
    tempo = tempo_label(facts)
    if section:
        span = f"section {section}, {span}"
        bpm = facts.sections[section - 1].bpm
        tempo = f"{bpm:.0f} BPM" if bpm else "no beat"
    title = f"{name} — {span} · {tempo}"
    if abs(facts.tuning) > TITLE_TUNING_CENTS:
        title += f" · {tuning_label(facts.tuning)}"
    ax.set_title(title)
    fig.colorbar(image, cax=cax, label="dBFS")
    for n, s in enumerate(facts.sections, 1):
        if t0 < s.start < t1:
            ax.axvline(s.start, color="white", linewidth=0.8, linestyle=(0, (4, 3)))
        # Each section's number at its top left, the one its zoom and its
        # sidecar line carry.
        if not zoomed:
            ax.annotate(
                str(n), (s.start, 1), xycoords=("data", "axes fraction"), xytext=(3, -3),
                textcoords="offset points", va="top", color="white", fontsize=9,
            )

    columns = WIDTH_PX
    peak, rms = envelope(x, columns)
    wave.imshow(
        envelope_image(peak, rms), origin="lower", aspect="auto",
        extent=(t0, t1, -1, 1), interpolation="nearest",
    )
    wave.yaxis.set_major_locator(NullLocator())
    wave.set_ylabel("level")

    ramps = chroma_ramps()
    _, tonic, mode = facts.keys[0]
    names = note_names(tonic, mode)
    for (strip, key), (label, track, band_hz, octaves) in zip(strips, STRIPS):
        samples, (stem_magnitude, *_) = views[track]
        shares, octave = chroma_shares(
            stem_magnitude, freqs, step, duration, columns, band_hz, octaves, facts.tuning, roots=label == "bass",
        )
        # Silence has spectral peaks too, of noise; it stays dark however clear they look.
        shares[:, envelope(samples, columns)[1] < QUIET] = 0
        strip.imshow(
            chroma_image(shares, octave, ramps), origin="lower", aspect="auto",
            extent=(t0, t1, -0.5, 11.5), interpolation="nearest",
        )
        strip.yaxis.set_major_locator(FixedLocator(range(12)))
        strip.set_yticklabels(names, fontsize=7)
        strip.set_ylabel(label)
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
    strips[0][1].set_title("octave", fontsize=8)

    kit_ramps = drum_ramps()
    when, lane, area, colour = drum_dots(*drums, t0, t1, kit_ramps)
    kit.set_facecolor("black")
    kit.scatter(when, lane, s=area, c=colour, edgecolors="black", linewidths=RIM_PX * 72 / DPI)
    kit.set_ylim(-0.5, len(LANES) - 0.5)
    kit.yaxis.set_major_locator(FixedLocator(range(len(LANES))))
    kit.set_yticklabels(LANES, fontsize=7)
    kit.set_ylabel("drums")
    if zoomed:
        for row in [wave, *(s for s, _ in strips), kit]:
            for t in facts.bars[(facts.bars >= t0) & (facts.bars < t1)]:
                row.axvline(t, color="white", alpha=BAR_ALPHA, linewidth=0.6)

    kit.set_xlim(t0, t1)
    kit.xaxis.set_major_locator(MultipleLocator(next(s for s in (60, 30, 15, 5, 2, 1) if duration / s >= 8)))
    kit.xaxis.set_major_formatter(FuncFormatter(mmss))
    kit.set_xlabel("time (m:ss)")
    fig.subplots_adjust(left=PLOT_LEFT, right=PLOT_RIGHT, top=0.965, bottom=0.05)

    buffer = io.BytesIO()
    fig.savefig(buffer, format="png")
    # A fixed palette — the map's own steps, then greys for the text, then the
    # strips' steps, the envelope's shades and the drum lanes' steps — since an
    # adaptive one merges the rarest steps, the loudest, and the scale lies.
    def bytes_of(colours):
        return [round(255 * c) for rgb in colours for c in rgb[:3]]

    steps = bytes_of(cmap(i) for i in range(cmap.N))
    greys = bytes_of((i / (63 - cmap.N),) * 3 for i in range(64 - cmap.N))
    chroma = bytes_of(rgb for ramp in ramps.values() for rgb in ramp[1:])
    kit_steps = bytes_of(rgb for ramp in kit_ramps for rgb in ramp[1:])
    palette = Image.new("P", (1, 1))
    palette.putpalette(steps + greys + chroma + bytes_of(LEVEL_SHADES) + kit_steps)
    Image.open(buffer).convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE).save(
        out_png, optimize=True,
    )
    plt.close(fig)
    print(f"{out_png}: {Path(out_png).stat().st_size // 1024} KB")


def main():
    import argparse

    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("song")
    parser.add_argument("out_png")
    parser.add_argument("stems", help="the directory demucs wrote the song's four stems to")
    parser.add_argument("--from", dest="start", type=seconds, help="zoom start, m:ss")
    parser.add_argument("--to", dest="end", type=seconds, help="zoom end, m:ss")
    args = parser.parse_args()
    name, out_png = Path(args.song).name, Path(args.out_png)
    paths = [Path(args.stems) / f"{stem}.wav" for stem in STEMS]
    if missing := [str(p) for p in paths if not p.exists()]:
        parser.error(f"no stem at {', '.join(missing)}")

    x = decode(args.song)
    stems = dict(zip(STEMS, aligned([decode(p) for p in paths], x)))
    tracks = {track: (s, drawing_stft(s)) for track, s in {"mix": x, **stems}.items() if track != "drums"}
    drums = drum_hits(stems["drums"], x)
    facts = measure(x, *tracks["mix"][1], drawing_stft(stems["other"] + stems["bass"])[0], drums)
    if args.start is not None or args.end is not None:
        t0 = args.start or 0
        t1 = min(args.end or facts.duration, facts.duration)
        if not 0 <= t0 < t1:
            parser.error(f"--from {mmss(t0)} must come before --to {mmss(t1)}")
        render(name, tracks, facts, drums, t0, t1, out_png)
        return

    out_png.parent.mkdir(parents=True, exist_ok=True)
    render(name, tracks, facts, drums, 0, facts.duration, out_png)
    text = out_png.with_suffix(".txt")
    text.write_text(sidecar(name, facts), encoding="utf-8")
    print(text)
    # One zoom per section beside it, numbered as the sidecar and the whole
    # song's picture number them; a re-render clears the old ones, whose
    # sections may no longer be there.
    for old in out_png.parent.glob("*.png"):
        if old.stem.isdigit():
            old.unlink()
    for n, s in enumerate(facts.sections, 1):
        render(name, tracks, facts, drums, s.start, s.end, out_png.with_name(f"{n}.png"), section=n)


if __name__ == "__main__":
    main()
