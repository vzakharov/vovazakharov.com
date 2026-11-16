"""Other worlds from the same formula: a dome that pulls land to the middle,
plus Fourier waves whose amplitude falls with frequency as ours does, phases
from the world's bits. A probe, not the game."""

import json
import sys

import numpy as np
from PIL import Image, ImageDraw

coast = json.load(open(sys.argv[1]))
out = sys.argv[2]
n = 512

pts = np.concatenate([np.array(r) for r in coast["rings"]])
lo, hi = pts.min(0), pts.max(0)
span = (hi - lo).max() * 1.6
off = (lo + hi) / 2 - span / 2
mask = np.zeros((n, n), np.uint8)
for r in coast["rings"]:
    ring = Image.new("1", (n, n), 0)
    ImageDraw.Draw(ring).polygon([tuple((np.array(p) - off) / span * n) for p in r], fill=1)
    mask ^= np.asarray(ring).astype(np.uint8)
ours = np.where(mask > 0, 1.0, -1.0)

k = np.fft.fftfreq(n) * n
kx, ky = np.meshgrid(k, k)
kr = np.maximum(np.hypot(kx, ky), 1)

# Our spectrum's slope: amplitude ~ k^-beta, fitted over the middle band.
F = np.fft.fft2(ours)
band = (kr > 3) & (kr < 60)
beta = float(sys.argv[3]) if len(sys.argv) > 3 else -np.polyfit(np.log(kr[band]), np.log(np.abs(F[band]) + 1e-9), 1)[0]
print(f"our spectrum falls as k^-{beta:.2f}")

yy, xx = (np.mgrid[0:n, 0:n] + 0.5) / n - 0.5


def world(seed):
    rng = np.random.default_rng(seed)
    # The dome: one main body, its place, stretch and turn from the first bits.
    cx, cy = rng.normal(0, 0.04, 2)
    a, b = rng.uniform(0.16, 0.26, 2)
    t = rng.uniform(0, np.pi)
    u = (xx - cx) * np.cos(t) + (yy - cy) * np.sin(t)
    v = -(xx - cx) * np.sin(t) + (yy - cy) * np.cos(t)
    dome = 1 - np.hypot(u / a, v / b)
    phase = np.exp(2j * np.pi * rng.random((n, n)))
    waves = np.fft.ifft2(kr**-beta * phase * (kr > 1.5)).real
    waves /= waves.std()
    return dome + float(sys.argv[4] if len(sys.argv) > 4 else 0.55) * waves


tiles = [ours] + [world(s) for s in range(2, 10)]
names = ["#1 (ours)"] + [f"#{s}" for s in range(2, 10)]
cell = 400
sheet = Image.new("L", (cell * 3, cell * 3), 255)
d = ImageDraw.Draw(sheet)
for i, (f, name) in enumerate(zip(tiles, names)):
    img = Image.fromarray(np.where(f > 0, 60, 225).astype(np.uint8)).resize((cell - 16, cell - 16))
    x, y = (i % 3) * cell + 8, (i // 3) * cell + 8
    sheet.paste(img, (x, y))
    d.rectangle([x, y, x + cell - 17, y + cell - 17], outline=0)
    d.text((x + 8, y + 6), name, fill=0)
sheet.save(f"{out}/worlds.png")
