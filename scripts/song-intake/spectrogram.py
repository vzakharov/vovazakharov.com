#!/usr/bin/env python3
"""A song's spectrogram: its whole length across, 0-10 kHz up, level in dBFS.

Usage: spectrogram.py <song> <out.png>

Where the voice sits, where the drums come in, a bridge that drops out, a
master that runs into its ceiling — what a reader who cannot hear the song can
see at a glance. A full-scale sine reads 0 dBFS. The colour map is cut into
2.5 dB steps and the PNG kept to those colours and a few greys, which holds a
song under 300 KB: a smooth map over a noisy texture compresses several times
worse.

Needs ffmpeg and matplotlib (numpy and Pillow come with it).
"""

import io
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 22050
TOP_HZ = 10000
NFFT = 2048
FLOOR_DB = -100
STEP_DB = 2.5
WIDTH_PX, HEIGHT_PX, DPI = 1400, 560, 100


def decode(path):
    """Mono at SR, the channels averaged, decoded by ffmpeg so any format reads the same."""
    pcm = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(pcm, np.float32)


def stft_dbfs(x):
    """Magnitude in dBFS per frame, with about two frames per pixel column of the plot."""
    hop = max(256, len(x) // (2 * WIDTH_PX))
    window = np.hanning(NFFT).astype(np.float32)
    starts = range(0, max(len(x) - NFFT, 0) + 1, hop)
    frames = np.stack([x[s:s + NFFT] for s in starts]) * window
    magnitude = 2 * np.abs(np.fft.rfft(frames, axis=1)) / window.sum()
    freqs = np.fft.rfftfreq(NFFT, 1 / SR)
    keep = freqs <= TOP_HZ
    db = 20 * np.log10(np.maximum(magnitude[:, keep], 10 ** (FLOOR_DB / 20)))
    return db.T, freqs[keep], hop / SR


def mmss(seconds, _pos=None):
    return f"{int(seconds) // 60}:{int(seconds) % 60:02d}"


def main():
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.ticker import FuncFormatter, MultipleLocator
    from PIL import Image

    song, out_png = sys.argv[1:3]
    x = decode(song)
    db, freqs, step = stft_dbfs(x)
    duration = len(x) / SR

    cmap = plt.get_cmap("magma", round(-FLOOR_DB / STEP_DB))
    fig, ax = plt.subplots(figsize=(WIDTH_PX / DPI, HEIGHT_PX / DPI), dpi=DPI)
    image = ax.imshow(
        db, origin="lower", aspect="auto", cmap=cmap, vmin=FLOOR_DB, vmax=0,
        extent=(0, db.shape[1] * step, 0, freqs[-1] / 1000), interpolation="antialiased",
    )
    ax.set_xlim(0, duration)
    ax.xaxis.set_major_locator(MultipleLocator(30 if duration > 240 else 15))
    ax.xaxis.set_major_formatter(FuncFormatter(mmss))
    ax.yaxis.set_major_locator(MultipleLocator(1))
    ax.set_xlabel("time (m:ss)")
    ax.set_ylabel("frequency (kHz)")
    ax.set_title(f"{Path(song).name} — {mmss(duration)}")
    fig.colorbar(image, ax=ax, label="dBFS", pad=0.01)
    fig.tight_layout()

    buffer = io.BytesIO()
    fig.savefig(buffer, format="png")
    # A fixed palette — the map's own steps, then greys for the text — since an
    # adaptive one merges the rarest steps, the loudest, and the scale lies.
    steps = [round(255 * c) for i in range(cmap.N) for c in cmap(i)[:3]]
    greys = [round(255 * i / (63 - cmap.N)) for i in range(64 - cmap.N) for _ in range(3)]
    palette = Image.new("P", (1, 1))
    palette.putpalette(steps + greys)
    Image.open(buffer).convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE).save(
        out_png, optimize=True,
    )
    print(f"{out_png}: {Path(out_png).stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
