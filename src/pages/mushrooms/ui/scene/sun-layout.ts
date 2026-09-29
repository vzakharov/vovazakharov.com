/**
 * Where the sun stands, in CSS pixels: in the top right, over the horizon,
 * its glow on screen and its rays off every button.
 */

import type { Box, Circle } from '../../model/geometry';
import type { Ground } from '../../model/ground';
import { everyPlace, placeOf } from './clump-layout';
import type { MeadowLayout } from './layout';
import {
  BUTTON_INSET,
  type Controls,
  standingControls,
  tapReach,
} from './sky-layout';

/** The sun's glow reaches this many radii out, and must stay on screen. */
export const SUN_GLOW_REACH = 2.6;
/** The sun's longest rays reach this many radii out. */
export const SUN_RAY_REACH = 1.8;
/**
 * The least share of its size the sun shrinks to, on a crowded screen, where
 * `sunAt` places it.
 */
const SUN_LEAST = 0.5;
/**
 * The least share of its size the sun shrinks to where the sky has no room
 * for it at `SUN_LEAST`: only on a screen a few buttons across and down, where
 * the controls leave the clump a gap too narrow for anything larger.
 */
const SUN_SMALLEST = 0.2;

/**
 * Where the far hills meet the sky, over ground whose band begins
 * `groundTop` down the screen: the hills stand as tall against the ground's
 * depth on every screen.
 */
export function horizonAt(groundTop: number): number {
  return groundTop * 0.7;
}

/** The screen the sun stands on, and where its sky meets the hills. */
type SunScreen = Pick<MeadowLayout, 'width' | 'height' | 'horizon'>;

/** The step, in CSS px, of the grid across the sky the sun is moved over. */
const SKY_STEP = 2;

/**
 * The sun, of radius `r` at the most, as `sunAt` places it: shrunk, a pixel
 * at a time, until it fits the sky (`fitsSky`), which also frees the corner
 * where only its rays kept it off; never below `SUN_LEAST`. Where the least
 * sun there still does not fit, the largest sun that fits anywhere is moved
 * there instead (`movedSun`). Throws where no sun fits the sky at all: that
 * screen's sun would stand over the clump or a button.
 */
export function placeSun(
  { width, height, horizon }: SunScreen,
  r: number,
  controls: Controls,
  crowns: readonly Box[],
): Circle {
  const sky = {
    width,
    horizon,
    buttons: [
      ...standingControls(controls).map((button) => ({
        ...button,
        r: tapReach(button.r) + BUTTON_INSET,
      })),
      ...[...controls.picker, ...controls.housePicker].map((pick) => ({
        ...pick,
        r: tapReach(pick.r),
      })),
    ],
    crowns,
  };
  for (let size = r; size >= r * SUN_LEAST; size--) {
    const sun = sunAt(width, height, size, controls);
    if (fitsSky(sky, sun)) return sun;
  }
  // A smaller sun fits wherever a larger one does, so the largest that fits
  // anywhere is a bisection over the sizes a pixel apart.
  const moved = (shrink: number) =>
    movedSun(sky, sunAt(width, height, r - shrink, controls));
  let [fits, fails] = [Math.floor(r * (1 - SUN_SMALLEST)), -1];
  let sun = moved(fits);
  if (!sun) {
    throw new Error(
      `No sun fits the sky of a ${String(width)}×${String(height)} screen`,
    );
  }
  while (fits - fails > 1) {
    const middle = Math.floor((fits + fails) / 2);
    const tried = moved(middle);
    if (tried) [fits, sun] = [middle, tried];
    else fails = middle;
  }
  return sun;
}

/** What the sun stands in: the sky above `horizon`, and what its rays keep off there. */
type Sky = Pick<MeadowLayout, 'width' | 'horizon'> & {
  /** Every control, each as far round as the sun's rays keep off it. */
  buttons: readonly Circle[];
  /** The boxes the opening clump's caps can fill. */
  crowns: readonly Box[];
};

/**
 * Whether `sun` has its whole disc above the horizon, its glow on the screen,
 * and its rays off every crown, every picker's button and, `BUTTON_INSET`
 * further, every button that stands.
 */
function fitsSky({ width, horizon, buttons, crowns }: Sky, sun: Circle) {
  const glow = sun.r * SUN_GLOW_REACH;
  const rays = sun.r * SUN_RAY_REACH;
  return (
    sun.y + sun.r <= horizon &&
    sun.y >= glow &&
    sun.x >= glow &&
    sun.x <= width - glow &&
    // `sunAt` stands the sun exactly at a button's reach, so a rounding
    // error's worth short of it still keeps off.
    buttons.every(
      (button) =>
        Math.hypot(button.x - sun.x, button.y - sun.y) >=
        button.r + rays - 1e-9,
    ) &&
    crowns.every((crown) => raysClear(sun, crown))
  );
}

/**
 * `from`, moved the least way across the sky, on a grid `SKY_STEP` apart,
 * that fits it there (`fitsSky`); or `undefined` where no place of its size
 * does.
 */
function movedSun(sky: Sky, from: Circle): Circle | undefined {
  const { r } = from;
  const glow = r * SUN_GLOW_REACH;
  let best: { sun: Circle; distance: number } | undefined;
  for (let y = glow; y <= sky.horizon - r; y += SKY_STEP) {
    for (let x = glow; x <= sky.width - glow; x += SKY_STEP) {
      const distance = Math.hypot(x - from.x, y - from.y);
      if (best && distance >= best.distance) continue;
      const sun = { x, y, r };
      if (fitsSky(sky, sun)) best = { sun, distance };
    }
  }
  return best?.sun;
}

/** Whether `sun`'s rays keep off `box`. */
export function raysClear(sun: Circle, box: Box): boolean {
  const x = Math.min(Math.max(sun.x, box.left), box.right);
  const y = Math.min(Math.max(sun.y, box.top), box.bottom);
  return Math.hypot(sun.x - x, sun.y - y) >= sun.r * SUN_RAY_REACH;
}

/**
 * The sun, of radius `r`, in the top right, pulled in from the corner until
 * its glow fits. Where its rays would reach a picker's row it comes down below
 * the rows — over on the left, where a phone's narrow width brings a row down
 * onto the sun itself — and it moves left until its rays keep `BUTTON_INSET`
 * off the buttons down the right, and right until they keep it off the
 * insects'.
 */
function sunAt(
  width: number,
  height: number,
  r: number,
  { plus, minus, house, releases, picker, housePicker }: Controls,
): Circle {
  const glow = r * SUN_GLOW_REACH;
  const rays = r * SUN_RAY_REACH;
  const corner = {
    x: Math.min(width * 0.84, width - glow),
    y: Math.max(height * 0.15, glow),
  };
  const picks = [...picker, ...housePicker];
  const meets = (reach: number) =>
    picks.some(
      (pick) =>
        Math.hypot(pick.x - corner.x, pick.y - corner.y) <
        tapReach(pick.r) + reach,
    );
  const { x: across, y } = meets(rays)
    ? {
        x: meets(r) ? width - corner.x : corner.x,
        y: Math.max(...picks.map((pick) => pick.y + tapReach(pick.r))) + rays,
      }
    : corner;
  /** How far across from `button` the sun's rays keep `BUTTON_INSET` off it: 0 when they clear it at any x. */
  const clearing = (button: Circle) => {
    const reach = tapReach(button.r) + rays + BUTTON_INSET;
    const rise = button.y - y;
    return Math.abs(rise) < reach ? Math.sqrt(reach ** 2 - rise ** 2) : 0;
  };
  const x = Math.min(
    across,
    ...[plus, minus, house].map((button) =>
      clearing(button) > 0 ? button.x - clearing(button) : across,
    ),
  );
  const rightOf = Object.values(releases).map((button) =>
    clearing(button) > 0 ? button.x + clearing(button) : x,
  );
  return { x: Math.max(x, ...rightOf), y, r };
}

/** How far down the ground, as a share of its depth, the sun's wash over the land may reach. */
const WASH_FLOOR = 1 / 3;
/** How far round a mushroom's foot, in its size, the wash leaves the ground as it is: its foot and the shadow round it. */
export const WASH_FOOT_CLEAR = 0.5;
/** The wash's rings, one disc of each alpha per ring. */
const WASH_RINGS = 10;
/** The wash's innermost and outermost rings, in sun radii, before it is shrunk to fit. */
const WASH_REACH = [4, 14] as const;

/** What the sun's wash is laid out over. */
type Washed = Pick<MeadowLayout, 'sun' | 'groundTop' | 'height' | 'mushrooms'>;

/**
 * The farthest the sun's wash over the land reaches from its middle: down to
 * the ground's upper third at most, and short of the foot and the shadow
 * round it of every place at the frame's extremes (`everyPlace`) and of every
 * mushroom standing on `standing`, wherever it grew; a new mushroom's foot
 * keeps out of it too (`roomFor`), so it never lifts the ground a mushroom
 * stands on.
 */
function washReach(
  { sun, groundTop, height, mushrooms }: Washed,
  standing: readonly Ground[],
): number {
  const places = [
    ...everyPlace(mushrooms),
    ...standing.map((foot) => placeOf(mushrooms.camera, foot)),
  ];
  return Math.min(
    groundTop + (height - groundTop) * WASH_FLOOR - sun.y,
    ...places.map(
      ({ x, y, size }) =>
        Math.hypot(x - sun.x, y - sun.y) - size * WASH_FOOT_CLEAR,
    ),
  );
}

/**
 * The radii of the wash's rings round the sun's middle, innermost first:
 * shrunk as a whole to fit inside `washReach`, rather than each clamped, so
 * no two share an edge that would stack into a line.
 */
export function washRings(
  layout: Washed,
  standing: readonly Ground[],
): number[] {
  const outer = Math.min(
    layout.sun.r * WASH_REACH[1],
    washReach(layout, standing),
  );
  return Array.from({ length: WASH_RINGS }, (_, ring) => {
    const t = ring / (WASH_RINGS - 1);
    return (
      (outer * (WASH_REACH[0] + (WASH_REACH[1] - WASH_REACH[0]) * t)) /
      WASH_REACH[1]
    );
  });
}
