"""The drawn map under world 1's land, to see where the formula misses.

Red: land world 1 adds over the drawn sea. Blue: drawn land world 1 drops.
Reads the field `pnpm fit:island` dumps (`tmp/fit/world1-distance.f32`: 1024²
float32, node (i, j) at the world grid's origin + cell · (i, j), y north).
Writes the whole overlay, the strait's crop beside the drawing, and prints the
lakes' fate. Run: python3 overlay.py <map image> <coast.json> <world f32> <out dir>."""

import json
import sys

import numpy as np
from PIL import Image, ImageDraw

image, coast_path, field_path, out = sys.argv[1:5]
drawn = Image.open(image).convert("RGB")
w, h = drawn.size
coast = json.load(open(coast_path))
kmpp = coast["kmPerPixel"]

# `square.ts`: the world square on the plane, metres, and its grid.
SIDE, CX, CY, N = 10_400_000, 1_045_000, -271_500, 1024
CELL, OX, OY = SIDE / N, CX - SIDE / 2, CY - SIDE / 2
field = np.fromfile(field_path, np.float32).reshape(N, N)


def rasterize(cx, cy, scale=1):
    """Rings are km from the main body's box centre, y north; that centre's
    pixel is not stored, so it is found below by overlap with the drawing."""
    size = (w * scale, h * scale)
    mask = np.zeros(size[::-1], np.uint8)
    for r in coast["rings"]:
        ring = Image.new("1", size, 0)
        pts = [((cx + x / kmpp) * scale, (cy - y / kmpp) * scale) for x, y in r]
        ImageDraw.Draw(ring).polygon(pts, fill=1)
        mask ^= np.asarray(ring).astype(np.uint8)
    return mask > 0


def world_land(cx, cy, us, vs):
    """World 1's land at drawing pixels (us, vs), bilinear on its grid."""
    x = (us - cx) * kmpp * 1000
    y = (cy - vs) * kmpp * 1000
    fi = np.clip((x - OX) / CELL, 0, N - 1.001)
    fj = np.clip((y - OY) / CELL, 0, N - 1.001)
    i, j = fi.astype(int), fj.astype(int)
    ti, tj = fi - i, fj - j
    f = (
        field[j, i] * (1 - ti) * (1 - tj)
        + field[j, i + 1] * ti * (1 - tj)
        + field[j + 1, i] * (1 - ti) * tj
        + field[j + 1, i + 1] * ti * tj
    )
    return f > 0


def lakes_of(land):
    """Sea walled off from the image's border by land."""
    padded = np.pad(~land, 1, constant_values=True)
    # `fromarray` shares the array's memory read-only; floodfill needs a copy.
    sea = Image.fromarray(padded.astype(np.uint8) * 255).copy()
    ImageDraw.floodfill(sea, (0, 0), 128)
    return (np.asarray(sea) == 255)[1:-1, 1:-1]


def paint(base, land, rec):
    img = base.copy()
    img[rec & ~land] = img[rec & ~land] * 0.3 + np.array([230, 30, 30]) * 0.7
    img[land & ~rec] = img[land & ~rec] * 0.3 + np.array([30, 60, 230]) * 0.7
    return img


rgb = np.asarray(drawn).astype(float)
ink = (rgb.max(-1) - rgb.min(-1) > 25) | (rgb.min(-1) < 120)
centred = rasterize(w / 2, h / 2)
corr = np.fft.ifft2(np.fft.fft2(ink.astype(float)) * np.conj(np.fft.fft2(centred.astype(float)))).real
dy, dx = np.unravel_index(corr.argmax(), corr.shape)
dy, dx = (dy + h // 2) % h - h // 2, (dx + w // 2) % w - w // 2
cx, cy = w / 2 + dx, h / 2 + dy
print(f"main body's centre at pixel ({cx:.0f}, {cy:.0f})")

land = rasterize(cx, cy)
vs, us = np.mgrid[0:h, 0:w] + 0.5
rec = world_land(cx, cy, us, vs)
wrong = (rec != land).sum() / land.sum()
base = rgb * 0.55 + 255 * 0.45
pic = Image.fromarray(paint(base, land, rec).astype(np.uint8))
d = ImageDraw.Draw(pic)
d.rectangle([0, 0, 420, 26], fill=(255, 255, 255))
d.text((8, 7), f"world 1 over the drawing: {wrong:.2%} of the land area wrong", fill=0)
pic.save(f"{out}/overlay-world1.png")
print(f"world 1: {wrong:.2%} of the drawn land wrong, at drawing pixels")

# The lakes: drawn lake pixels world 1 makes land are red on the overlay.
drawn_lakes = lakes_of(land)
world_lakes = lakes_of(rec)
left = Image.fromarray(drawn_lakes.astype(np.uint8) * 255).copy()
for v, u in zip(*np.nonzero(drawn_lakes)):
    if left.getpixel((int(u), int(v))) != 255:
        continue
    before = np.asarray(left).copy()
    ImageDraw.floodfill(left, (int(u), int(v)), 128)
    one = (np.asarray(left) == 128) & (before == 255)
    red = (one & rec).sum()
    kept = (one & world_lakes).sum()
    print(
        f"lake at px ({u}, {v}): {one.sum()} px, {red} px red (world 1 land), "
        f"{kept} px closed water in world 1"
    )

# The strait: drawing crop beside the overlay, 4 subsamples a pixel.
U0, U1, V0, V1, S = 640, 760, 140, 260, 4
crop = drawn.crop((U0, V0, U1, V1)).resize(((U1 - U0) * S, (V1 - V0) * S), Image.NEAREST)
fine = rasterize(cx, cy, S)[V0 * S : V1 * S, U0 * S : U1 * S]
fv, fu = (np.mgrid[V0 * S : V1 * S, U0 * S : U1 * S] + 0.5) / S
frec = world_land(cx, cy, fu, fv)
fbase = np.asarray(crop).astype(float) * 0.55 + 255 * 0.45
side = Image.fromarray(paint(fbase, fine, frec).astype(np.uint8))
strait = Image.new("RGB", (crop.width * 2 + 8, crop.height), (255, 255, 255))
strait.paste(crop, (0, 0))
strait.paste(side, (crop.width + 8, 0))
strait.save(f"{out}/strait-world1.png")
for v in range(190, 245, 5):
    row = ~land[v, 680:720]
    print(f"strait row px {v} (y {(cy - v) * kmpp:.0f} km): drawn sea {row.sum()} px, "
          f"world 1 sea {(~rec[v, 680:720]).sum()} px")
