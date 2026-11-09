"""How many 2D Fourier modes the drawn island needs, and what a world drawn
from the same spectrum with other bits looks like. A probe, not the game."""

import sys

import numpy as np
from PIL import Image

src = sys.argv[1]
out = sys.argv[2]

import json

from PIL import ImageDraw

coast = json.load(open(src))
pts = np.concatenate([np.array(r) for r in coast["rings"]])
lo, hi = pts.min(0), pts.max(0)
scale = 1400 / (hi - lo).max()
w, h = (np.ceil((hi - lo) * scale) + 1).astype(int)
mask = Image.new("L", (w, h), 0)
draw = ImageDraw.Draw(mask)
# Rings are drawn even-odd, so a hole ring inside land cuts it back out.
for r in coast["rings"]:
    ring = Image.new("1", (w, h), 0)
    ImageDraw.Draw(ring).polygon([tuple((np.array(p) - lo) * scale) for p in r], fill=1)
    mask = Image.fromarray(np.asarray(mask) ^ (np.asarray(ring).astype(np.uint8) * 255))
land = np.asarray(mask) > 0
print(f"{len(coast['rings'])} rings, {(hi - lo).max():.0f} km across, {(hi - lo).max() / 1400:.2f} km per grid pixel")
n = 1 << int(np.ceil(np.log2(max(h, w) * 1.15)))
grid = np.full((n, n), -1.0)
y0, x0 = (n - h) // 2, (n - w) // 2
grid[y0 : y0 + h, x0 : x0 + w] = np.where(land, 1.0, -1.0)

F = np.fft.fft2(grid)
k = np.fft.fftfreq(n) * n
kx, ky = np.meshgrid(k, k)
kr = np.hypot(kx, ky)

land_px = (grid > 0).sum()
print(f"grid {n}x{n}, land {land_px} px")


def save(field, name):
    img = np.where(field > 0, 60, 225).astype(np.uint8)
    Image.fromarray(img).resize((512, 512), Image.NEAREST).save(f"{out}/{name}.png")


save(grid, "000-drawn")
for K in (8, 16, 32, 64, 128, 256):
    keep = kr <= K
    rec = np.fft.ifft2(F * keep).real
    wrong = ((rec > 0) != (grid > 0)).sum()
    modes = int(keep.sum()) // 2  # real field: half the complex modes are conjugates
    kmpx = (hi - lo).max() / 1400
    print(
        f"K={K:4d}: {modes:6d} complex coefficients, finest wave {n / K * kmpx:5.0f} km,"
        f" wrong pixels {wrong / land_px:6.1%} of the land area"
    )
    save(rec, f"k{K:03d}")

# A world from other bits: our radial amplitude envelope, fresh random coefficients.
amp = np.abs(F)
bins = np.round(kr).astype(int)
env = np.bincount(bins.ravel(), amp.ravel()) / np.maximum(np.bincount(bins.ravel()), 1)
for seed in (2, 3, 4):
    rng = np.random.default_rng(seed)
    noise = np.fft.fft2(rng.standard_normal((n, n)))
    noise /= np.abs(noise) + 1e-12
    K = 64
    G = env[bins] * noise * (kr <= K)
    G[0, 0] = F[0, 0]
    rec = np.fft.ifft2(G).real
    save(rec, f"world-{seed}")
