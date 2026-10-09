#!/usr/bin/env python3
"""Long-term spectra of a mix and a master of it, and the EQ curve between them.

Usage: spectrum.py <original> <master> <out.png>

Both inputs are 44.1 kHz audio soundfile reads. The plot shows both spectra
aligned at 1 kHz, so it compares tonal balance rather than level, and below
them the difference with its half. The table it prints is the same curve at a
dozen frequencies, enough to read without opening the image.
"""

import sys

import numpy as np
import soundfile as sf
from scipy.signal import welch

SR = 44100
NPERSEG = 16384
TABLE_HZ = (40, 80, 160, 315, 630, 1250, 2500, 5000, 8000, 10000, 12500, 16000)


def mid(path):
    x, sr = sf.read(path, always_2d=True)
    if sr != SR:
        raise SystemExit(f"{path}: {sr} Hz, expected {SR}")
    return x.mean(axis=1)


def psd_db(x):
    f, p = welch(x, SR, nperseg=NPERSEG)
    return f, 10 * np.log10(p + 1e-20)


def smooth_octave(f, y, frac=6):
    """Fractional-octave smoothing, so the curve shows tonal balance, not partials."""
    out = np.empty_like(y)
    for i, fc in enumerate(f):
        if fc <= 0:
            out[i] = y[i]
            continue
        m = (f >= fc * 2 ** (-0.5 / frac)) & (f <= fc * 2 ** (0.5 / frac))
        out[i] = 10 * np.log10(np.mean(10 ** (y[m] / 10)))
    return out


def balance(path):
    """Smoothed spectrum in dB relative to 1 kHz, with its frequency grid."""
    f, y = psd_db(mid(path))
    y = smooth_octave(f, y)
    return f, y - y[np.argmin(abs(f - 1000))]


def main():
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    orig, master, out_png = sys.argv[1:4]
    f, a = balance(orig)
    _, b = balance(master)
    diff = b - a

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 8), sharex=True)
    ax1.semilogx(f[1:], a[1:], label="original")
    ax1.semilogx(f[1:], b[1:], label="master")
    ax1.set_ylabel("dB (0 = 1 kHz)")
    ax1.legend()
    ax1.grid(True, which="both", alpha=0.3)
    ax2.semilogx(f[1:], diff[1:], color="crimson", label="master − original")
    ax2.semilogx(f[1:], diff[1:] / 2, color="gray", ls="--", label="half")
    ax2.axhline(0, color="k", lw=0.5)
    ax2.set_ylabel("dB")
    ax2.set_xlabel("Hz")
    ax2.set_xlim(20, 20000)
    ax2.legend()
    ax2.grid(True, which="both", alpha=0.3)
    fig.tight_layout()
    fig.savefig(out_png, dpi=90)
    for fc in TABLE_HZ:
        i = np.argmin(abs(f - fc))
        print(f"{fc:>6} Hz  original {a[i]:+6.1f}  master {b[i]:+6.1f}  diff {diff[i]:+5.1f}")


if __name__ == "__main__":
    main()
