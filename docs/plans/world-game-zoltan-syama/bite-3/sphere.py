"""The lead's probe for bite 3: land as a random spherical-harmonic series.

f = sum over l <= L, |m| <= l of a_lm Y_lm, a_lm unit normal times
(knee^2 + l^2)^(-alpha/2); land where f is above its own (1 - land share)
quantile. For each alpha it draws a few worlds, counts landmasses
(8-connected, wrapping in longitude), and writes an equirectangular strip per
alpha.

    python3 sphere.py <out dir> [L] [land share] [knee] [alpha ...]
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

out = Path(sys.argv[1])
L = int(sys.argv[2]) if len(sys.argv) > 2 else 64
LAND = float(sys.argv[3]) if len(sys.argv) > 3 else 0.29
ALPHAS = [float(a) for a in sys.argv[5:]] or [1.0, 1.5, 2.0, 2.5]
KNEE = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
SEEDS = range(6)
ROWS, COLS = 2 * L + 2, 4 * L + 4

theta = (np.arange(ROWS) + 0.5) * np.pi / ROWS  # colatitude
phi = np.arange(COLS) * 2 * np.pi / COLS


def legendre(L: int, x: np.ndarray) -> np.ndarray:
    """Orthonormal associated Legendre P[l, m, i] for x = cos(theta)."""
    s = np.sqrt(1 - x * x)
    P = np.zeros((L + 1, L + 1, x.size))
    P[0, 0] = 1 / np.sqrt(4 * np.pi)
    for m in range(1, L + 1):
        P[m, m] = -np.sqrt((2 * m + 1) / (2 * m)) * s * P[m - 1, m - 1]
    for m in range(L):
        P[m + 1, m] = np.sqrt(2 * m + 3) * x * P[m, m]
    for m in range(L + 1):
        for l in range(m + 2, L + 1):
            a = np.sqrt((4 * l * l - 1) / (l * l - m * m))
            b = np.sqrt(((l - 1) ** 2 - m * m) / (4 * (l - 1) ** 2 - 1))
            P[l, m] = a * (x * P[l - 1, m] - b * P[l - 2, m])
    return P


P = legendre(L, np.cos(theta))
cos_m = np.cos(np.outer(np.arange(L + 1), phi))
sin_m = np.sin(np.outer(np.arange(L + 1), phi))
area = np.sin(theta)[:, None] * np.ones(COLS)


def world(alpha: float, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    l = np.arange(L + 1)[:, None]
    # Flat up to the knee, falling as l^-alpha past it; no knee is a pure power.
    env = np.where(l > 0, (KNEE**2 + l * l) ** (-alpha / 2), 0.0)
    a = rng.standard_normal((L + 1, L + 1)) * env
    b = rng.standard_normal((L + 1, L + 1)) * env
    mask = np.tri(L + 1, dtype=bool)  # m <= l
    a, b = a * mask, b * mask
    b[:, 0] = 0
    A = np.einsum("lm,lmi->mi", a, P)
    B = np.einsum("lm,lmi->mi", b, P)
    f = A.T @ cos_m + B.T @ sin_m
    order = np.argsort(f, axis=None)
    weight = area.ravel()[order]
    cut = np.searchsorted(np.cumsum(weight) / weight.sum(), 1 - LAND)
    return f >= f.ravel()[order[cut]]


def landmasses(land: np.ndarray) -> list[float]:
    """Area of each 8-connected landmass, as a share of all land."""
    label = np.full(land.shape, -1)
    sizes: list[float] = []
    for start in zip(*np.nonzero(land)):
        if label[start] >= 0:
            continue
        stack, total = [start], 0.0
        label[start] = len(sizes)
        while stack:
            i, j = stack.pop()
            total += area[i, j]
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    ni, nj = i + di, (j + dj) % COLS
                    if 0 <= ni < ROWS and land[ni, nj] and label[ni, nj] < 0:
                        label[ni, nj] = len(sizes)
                        stack.append((ni, nj))
        sizes.append(total)
    whole = sum(sizes)
    return sorted((s / whole for s in sizes), reverse=True)


out.mkdir(parents=True, exist_ok=True)
for alpha in ALPHAS:
    tiles = []
    for seed in SEEDS:
        land = world(alpha, seed)
        sizes = landmasses(land)
        big = sum(1 for s in sizes if s >= 0.01)
        print(
            f"alpha {alpha}: seed {seed}: {len(sizes)} pieces, "
            f"{big} over 1% of land, largest {sizes[0]:.0%}, "
            f"next {', '.join(f'{s:.0%}' for s in sizes[1:4])}"
        )
        rgb = np.where(land[..., None], [196, 170, 120], [40, 80, 140])
        tiles.append(np.pad(rgb, ((2, 2), (2, 2), (0, 0)), constant_values=255))
    strip = np.concatenate(tiles, axis=0).astype(np.uint8)
    Image.fromarray(strip).save(out / f"knee-{KNEE:g}-alpha-{alpha}.png")
