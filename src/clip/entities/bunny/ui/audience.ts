import type { Seeded } from '@/kernel/shared/typings';

import {
  at,
  ellipse,
  ink,
  noise,
  type Path,
  path,
  type Pen,
} from '@/clip/shared/ink';

import { AUDIENCE_PALETTE } from './palette-bunny';
import type { Covering } from './wallpaper';

/** Fills its `area` with the front row at the bottom. */
export type Audience = Partial<Seeded> &
  Covering & {
    /** How many rows, front to back; 3 by default. */
    rows?: number;
    /** The front row's head width in stage units; 150 by default. */
    headWidth?: number;
  };

// A head's back, its centre at the origin, 100 wide.
const HEAD = ellipse([0, 0], 50, 46);
const EAR = (side: number): Path =>
  path(
    `M ${side * 14},-30 C ${side * 10},-90 ${side * 22},-150 ${side * 36},-180 C ${side * 48},-150 ${side * 46},-90 ${side * 34},-26 Z`,
  );
const EARS = [EAR(-1), EAR(1)];
// How much smaller and higher each row back sits than the one before it.
const RECEDE = 0.72;
// How long a twitch lasts and how often an ear may twitch, in seconds.
const TWITCH = 0.35;
const TWITCH_EVERY = 2.2;

/** The ear on `side` of head `n`, turned by a twitch now and then. */
function earTurn(seed: number, n: number, side: number, t: number): number {
  const slot = Math.floor(t / TWITCH_EVERY);
  const key = n * 2 + (side + 1) / 2;
  if (noise(seed + slot, key) < 0.55) return 0;
  const start =
    slot * TWITCH_EVERY + (noise(seed + slot, key + 1000) + 1) * 0.8;
  const into = (t - start) / TWITCH;
  if (into < 0 || into > 1) return 0;
  return side * 14 * Math.sin(into * Math.PI);
}

// How thick the rim light is, in a head's own units.
const RIM = 4;

/**
 * `shape` in dark fur with the stage light along its top edge: the light's
 * colour, then the fur over it shifted down, leaving a crescent.
 */
function rimLit(pen: Pen, shape: Path, seed: number, light: number): void {
  ink(pen, shape, {
    fill: AUDIENCE_PALETTE.rim,
    stroke: null,
    alpha: light,
    seed,
  });
  at(pen, { y: RIM }, () => {
    ink(pen, shape, { fill: AUDIENCE_PALETTE.fur, stroke: null, seed });
  });
}

/**
 * The TV studio's audience seen from behind: rows of dark heads and long
 * ears, the stage light catching their edges, an ear twitching now and then.
 * The rows recede up the area, each smaller than the one before.
 */
export function studioAudience(pen: Pen, audience: Audience): void {
  const { area, rows = 3, headWidth = 150, seed = 0 } = audience;
  const { x = 0, y = 0, width, height } = area;
  const { t } = pen;
  for (let row = rows - 1; row >= 0; row -= 1) {
    const scale = (headWidth / 100) * RECEDE ** row;
    const spacing = 112 * scale;
    const baseline = y + height - row * (height / (rows + 1));
    const shift = (row % 2) * spacing * 0.5 + noise(seed, row) * spacing * 0.2;
    // The stage light reaches the back rows weaker.
    const fade = 1 - row * 0.25;
    for (let n = 0; n * spacing - spacing <= width; n += 1) {
      const id = row * 1000 + n;
      const bob = Math.sin(t * 1.3 + noise(seed, id) * 6) * 2;
      const place = {
        x:
          x +
          n * spacing -
          spacing / 2 +
          shift +
          noise(seed, id + 500) * spacing * 0.12,
        y: baseline + bob,
        scale: scale * (1 + noise(seed, id + 700) * 0.06),
      };
      at(pen, place, () => {
        for (const [side, ear] of [-1, 1].map(
          (s, i) => [s, EARS[i]] as const,
        )) {
          at(pen, { y: -30, rot: earTurn(seed, id, side, t) }, () => {
            if (ear) rimLit(pen, ear, id, fade);
          });
        }
        rimLit(pen, HEAD, id, fade);
      });
    }
  }
}
