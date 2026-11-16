"""Equirectangular world maps, stacked in one strip, as globes side by side.

Each map in the strip becomes a row of globes seen from evenly spaced
longitudes, tilted towards the viewer by `tilt` degrees, lit from the upper
left. Maps are split on the strip's white separator rows.

    python3 globes.py <strip.png> <out.png> [views] [tilt] [size]
"""

import sys

import numpy as np
from PIL import Image

strip = np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(float)
out = sys.argv[2]
VIEWS = int(sys.argv[3]) if len(sys.argv) > 3 else 3
TILT = np.radians(float(sys.argv[4]) if len(sys.argv) > 4 else 20)
SIZE = int(sys.argv[5]) if len(sys.argv) > 5 else 220

white = (strip > 245).all(axis=(1, 2))
maps, start = [], None
for row, blank in enumerate(list(white) + [True]):
    if not blank and start is None:
        start = row
    if blank and start is not None:
        if row - start > 20:
            body = strip[start:row]
            cols = np.nonzero(~(body > 245).all(axis=(0, 2)))[0]
            maps.append(body[:, cols[0] : cols[-1] + 1])
        start = None

r = np.linspace(-1, 1, SIZE)
x, y = np.meshgrid(r, -r)
inside = x * x + y * y <= 1
z = np.sqrt(np.clip(1 - x * x - y * y, 0, None))
light = np.clip(0.35 + 0.65 * (-0.45 * x + 0.55 * y + 0.7 * z), 0.15, 1)
# Tilt the view: rotate about the x axis so the north pole leans in.
yt = y * np.cos(TILT) + z * np.sin(TILT)
zt = -y * np.sin(TILT) + z * np.cos(TILT)
lat = np.arcsin(np.clip(yt, -1, 1))


def globe(world: np.ndarray, centre: float) -> np.ndarray:
    rows, cols = world.shape[:2]
    lon = (np.arctan2(x, zt) + centre) % (2 * np.pi)
    i = np.clip(((np.pi / 2 - lat) / np.pi * rows).astype(int), 0, rows - 1)
    j = np.clip((lon / (2 * np.pi) * cols).astype(int), 0, cols - 1)
    rgb = world[i, j] * light[..., None]
    return np.where(inside[..., None], rgb, 255)


GAP = SIZE // 12
rows_out = []
for world in maps:
    discs = [globe(world, 2 * np.pi * v / VIEWS) for v in range(VIEWS)]
    pad = np.full((SIZE, GAP, 3), 255.0)
    rows_out.append(np.concatenate([d for g in discs for d in (g, pad)][:-1], axis=1))
    rows_out.append(np.full((GAP, rows_out[-1].shape[1], 3), 255.0))
Image.fromarray(np.concatenate(rows_out[:-1]).astype(np.uint8)).save(out)
print(f"{len(maps)} worlds, {VIEWS} views each -> {out}")
