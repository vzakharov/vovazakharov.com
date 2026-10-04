import type * as Phaser from 'phaser';

import { type Phased, shake, sway } from '../../model/motion';
import { between, type Random } from '../../model/random';
import { groundAt, type Tones, tonesAt } from './backdrop-tones';
import { mix } from './colour';
import type { Footing, MeadowLayout } from './layout';
import { DUSK, PALETTE } from './palette';

/** How far a tuft's tip swings in the breeze, in units of its size. */
const SWING = 0.35;
/** How far a tuft's tip swings as it shakes its head, refusing a flower. */
const REFUSE_SWING = 0.9;
/**
 * How much of the breeze's cycle each CSS pixel across lags, so a gust is
 * seen crossing the grass.
 */
const GUST_LAG = 0.008;
/** How far toward the ground under it the farthest tuft is mixed; the nearest is not at all. */
const FADE = 0.85;
/** How far up a blade its lit crown, the tip, begins, as a share of its height. */
const TIP_FROM = 0.6;

/** A tuft's blades' colours, toned by its distance: the two flanking blades, the middle one, and every blade's lit crown. */
type TuftColours = { flank: number; middle: number; crown: number };

export type Tuft = Footing & Phased & TuftColours;

/** The light the grass is toned in: the backdrop's tones, the ground's under it, and the grass's own colours, all at one duskness. */
export type Turf = Record<'tuft' | 'tuftDark' | 'groundLit', number> & {
  tones: Tones;
};

/** The grass's light `dusk` of the way to full dusk: each colour between its day's and its dusk twin (`DUSK`), as the ground's (`tonesAt`). */
export function turfAt(dusk: number): Turf {
  const colour = (name: 'tuft' | 'tuftDark' | 'groundLit') =>
    mix(PALETTE[name], DUSK[name], Math.min(1, Math.max(0, dusk)));
  return {
    tones: tonesAt(dusk),
    tuft: colour('tuft'),
    tuftDark: colour('tuftDark'),
    groundLit: colour('groundLit'),
  };
}

const DAY_TURF = turfAt(0);

/**
 * A tuft's colours `down` of the way from the ground's top to the bottom
 * edge in `turf`'s light, fading into the ground under it the farther back
 * it stands, and `faded` of the rest of the way besides.
 */
export function tuftColours(
  down: number,
  turf: Turf = DAY_TURF,
  faded = 0,
): TuftColours {
  const under = groundAt(down, turf.tones);
  const fade = faded + (1 - faded) * (1 - down) * FADE;
  return {
    flank: mix(turf.tuftDark, under, fade),
    middle: mix(turf.tuft, under, fade),
    crown: mix(mix(turf.tuft, turf.groundLit, 0.4), under, fade),
  };
}

/**
 * A tuft rooted at `x`, `y` on `layout`, its breeze drawn from `random`:
 * nearer tufts, lower on the screen, bigger, and farther ones fading into
 * the ground.
 */
export function tuftOn(
  layout: MeadowLayout,
  x: number,
  y: number,
  random: Random,
): Tuft {
  return tuftRooted(layout, x, y, gustPhase(x, random));
}

/** A tuft's place in the breeze's cycle, lagging by its `x` so a gust crosses the grass, with a stray drawn from `random`. */
function gustPhase(x: number, random: Random): number {
  return -x * GUST_LAG * Math.PI * 2 + between(random, -0.4, 0.4);
}

/** A tuft rooted at `x`, `y` on `screen` at `phase` in the breeze, sized and toned by its row. */
function tuftRooted(
  screen: Pick<MeadowLayout, 'height' | 'groundTop'>,
  x: number,
  y: number,
  phase: number,
): Tuft {
  return {
    x,
    y,
    size: tuftSizeAt(screen, y),
    phase,
    ...tuftColours(downAt(screen, y)),
  };
}

/** How far down the ground's band of `layout`, from its top to the bottom edge, the row `y` stands; none above its top. */
export function downAt(
  { height, groundTop }: Pick<MeadowLayout, 'height' | 'groundTop'>,
  y: number,
): number {
  return Math.max(0, y - groundTop) / (height - groundTop);
}

/** How big a tuft rooted on the row `y` of `screen` stands: the nearer, lower on the screen, the bigger. */
export function tuftSizeAt(
  screen: Pick<MeadowLayout, 'height' | 'groundTop'>,
  y: number,
): number {
  return (0.6 + downAt(screen, y)) * (screen.height - screen.groundTop) * 0.03;
}

/** How far past the screen's edge, in units of its size, a tuft still has blades on it. */
export const BLADE_OVERHANG = 3;

export type WithTuft = { tuft: Tuft };

/** A tuft that refused a flower, and when, in seconds on the scene's clock. */
export type Refusal = WithTuft & { shakenAt: number };

/** One blade of a tuft: how far it leans, in units of its size, how tall it stands, and its colour. */
type Blade = readonly [lean: number, height: number, colour: number];

/** A tuft's blades as they bend `bend` at `time`, into `graphics`, each with its lit crown. */
function paintBlades(
  graphics: Phaser.GameObjects.Graphics,
  { x, y, size }: Tuft,
  bend: number,
  blades: readonly Blade[],
  crown: number,
): void {
  for (const [lean, height, colour] of blades) {
    const left = x - size * 0.3;
    const right = x + size * 0.3;
    const apexX = x + (lean * 1.3 + bend * height) * size;
    const apexY = y - height * size;
    graphics.fillStyle(colour);
    graphics.fillTriangle(left, y, right, y, apexX, apexY);
    const tipY = y + (apexY - y) * TIP_FROM;
    graphics.fillStyle(crown);
    graphics.fillTriangle(
      left + (apexX - left) * TIP_FROM,
      tipY,
      right + (apexX - right) * TIP_FROM,
      tipY,
      apexX,
      apexY,
    );
  }
}

/** A tuft's three blades: two flanking ones leaning apart round a taller middle one. */
function bladesOf({ flank, middle }: Tuft): readonly Blade[] {
  return [
    [-0.5, 1.6, flank],
    [0.45, 1.4, flank],
    [0, 2, middle],
  ];
}

/** How much taller the tuft the picker is open on stands, and how fast its glow breathes, per second. */
const MARKED_LIFT = 0.18;
const GLOW_RATE = 2.4;

/** What the ground's grass marks: the tuft that last refused a flower, and the one the picker is open on. */
export type Sprouting = { refused?: Refusal; marked?: Tuft };

/**
 * The ground's grass, every tuft a flower can be planted on, as it bends at
 * `time`, into `graphics`, and the seam's grass with it, plain tufts.
 * The tuft `marked` stands taller on a breathing glow; the one of `refused`
 * shakes its head.
 */
export function paintSprouts(
  graphics: Phaser.GameObjects.Graphics,
  tufts: readonly Tuft[],
  time: number,
  { refused, marked }: Sprouting,
): void {
  for (const tuft of tufts) {
    const { x, y, phase, crown } = tuft;
    const open = tuft === marked;
    const size = tuft.size * (open ? 1 + MARKED_LIFT : 1);
    if (open) {
      const breath = 0.5 + 0.5 * Math.sin(time * GLOW_RATE * Math.PI);
      graphics.fillStyle(PALETTE.sproutGlow, 0.7 + 0.3 * breath);
      graphics.fillEllipse(x, y, size * 3.4, size * 1.1);
    }
    const no = tuft === refused?.tuft ? shake(time - refused.shakenAt) : 0;
    const bend = sway(time, phase) * SWING + no * REFUSE_SWING;
    paintBlades(graphics, { ...tuft, size }, bend, bladesOf(tuft), crown);
  }
}
