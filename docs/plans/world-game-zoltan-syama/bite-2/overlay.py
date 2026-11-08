"""The drawn map under the formula's land, to see where the formula misses.

Red: land the formula adds over the drawn sea. Blue: drawn land the formula
drops. Run: python3 overlay.py <map image> <coast.json> <out dir>."""

import json
import sys

import numpy as np
from PIL import Image, ImageDraw

image, coast_path, out = sys.argv[1:4]
drawn = Image.open(image).convert("RGB")
w, h = drawn.size
coast = json.load(open(coast_path))
kmpp = coast["kmPerPixel"]


def rasterize(cx, cy):
    """Rings are km from the main body's box centre, y north; that centre's
    pixel is not stored, so it is found below by overlap with the drawing."""
    mask = np.zeros((h, w), np.uint8)
    for r in coast["rings"]:
        ring = Image.new("1", (w, h), 0)
        ImageDraw.Draw(ring).polygon([(cx + x / kmpp, cy - y / kmpp) for x, y in r], fill=1)
        mask ^= np.asarray(ring).astype(np.uint8)
    return mask > 0


rgb = np.asarray(drawn).astype(float)
ink = (rgb.max(-1) - rgb.min(-1) > 25) | (rgb.min(-1) < 120)
centred = rasterize(w / 2, h / 2)
corr = np.fft.ifft2(np.fft.fft2(ink.astype(float)) * np.conj(np.fft.fft2(centred.astype(float)))).real
dy, dx = np.unravel_index(corr.argmax(), corr.shape)
dy, dx = (dy + h // 2) % h - h // 2, (dx + w // 2) % w - w // 2
land = rasterize(w / 2 + dx, h / 2 + dy)
print(f"main body's centre at pixel ({w / 2 + dx:.0f}, {h / 2 + dy:.0f})")

n = 2048
grid = np.full((n, n), -1.0)
y0, x0 = (n - h) // 2, (n - w) // 2
grid[y0 : y0 + h, x0 : x0 + w] = np.where(land, 1.0, -1.0)
F = np.fft.fft2(grid)
k = np.fft.fftfreq(n) * n
kr = np.hypot(*np.meshgrid(k, k))

base = np.asarray(drawn).astype(float) * 0.55 + 255 * 0.45
for wave_km in (160, 80):
    K = n * kmpp / wave_km
    rec = np.fft.ifft2(F * (kr <= K)).real[y0 : y0 + h, x0 : x0 + w] > 0
    img = base.copy()
    img[rec & ~land] = img[rec & ~land] * 0.3 + np.array([230, 30, 30]) * 0.7
    img[land & ~rec] = img[land & ~rec] * 0.3 + np.array([30, 60, 230]) * 0.7
    wrong = (rec != land).sum() / land.sum()
    pic = Image.fromarray(img.astype(np.uint8))
    d = ImageDraw.Draw(pic)
    d.rectangle([0, 0, 560, 26], fill=(255, 255, 255))
    d.text((8, 7), f"finest wave {wave_km} km (K={K:.0f}): {wrong:.1%} of the land area wrong", fill=0)
    pic.save(f"{out}/overlay-{wave_km}km.png")
    print(f"{wave_km} km: K={K:.0f}, wrong {wrong:.1%}")
