/**
 * Where the visit's seeded flowers stand on the ground, placed once a visit
 * from the screen it opens on, its seed and the mushrooms it opens with: each
 * jittered off a slot by its own seeded stream, and moved again until it
 * stands where a child sees it on that screen — off the clump's feet and
 * apart from the other flowers on the ground, its head clear of every
 * control and no more than half hidden by those mushrooms — or left out.
 * Every one stands in the opening screen's frame (`meadowFrame`), which its
 * turn shows too, so a turn loses none; a resize changes the camera, not the
 * ground, and in-sight is the scene's query (`flower-sight.ts`).
 */

import { FLOWER_RANGES } from '../../model/flower-genes';
import {
  type Circle,
  distanceToSegment,
  type Point,
  type Scaled,
} from '../../model/geometry';
import {
  type Camera,
  type Framed,
  type Ground,
  project,
  scaleAt,
  zAt,
} from '../../model/ground';
import { between, mulberry32, type Random } from '../../model/random';
import { type ClumpShade, mostShaded } from './clump-shade';
import type { Footing } from './layout';
import { FORESHORTENING } from './meadow-camera';

/**
 * The slots the flowers grow around on the screen a visit opens on, as a
 * fraction of its frame's width across and of the ground's depth down, the likeliest
 * to show first — some behind the clump's stems, some before it. Each visit
 * jitters every flower off its slot.
 */
const FLOWER_SPOTS = {
  landscape: [
    [0.12, 0.35],
    [0.37, 0.22],
    [0.26, 0.72],
    [0.67, 0.28],
    [0.78, 0.74],
    [0.9, 0.42],
    [0.56, 0.88],
  ],
  portrait: [
    [0.14, 0.4],
    [0.86, 0.36],
    [0.36, 0.26],
    [0.3, 0.62],
    [0.78, 0.6],
    [0.52, 0.44],
    [0.84, 0.16],
  ],
} as const;
/**
 * How far a flower strays from its slot, as a fraction of the frame's width
 * and of the ground's depth.
 */
const FLOWER_JITTER = [0.07, 0.12] as const;
/**
 * How far across the frame's width, and down the ground's depth, a flower's
 * foot may stand: on the ground, and its head clear of the screen's sides
 * on the screen and on its turn.
 */
const FLOWER_ACROSS = [0.05, 0.95] as const;
export const FLOWER_DOWN = [0.12, 0.96] as const;
/** Tries at a spot off the slot before a flower is left out. */
const FLOWER_TRIES = 48;
/** A flower's height, as a share of the clump's size, before depth scales it. */
const FLOWER_SIZE = 0.28;
/**
 * How far round a mushroom's foot, per unit of its size, no flower stands: the
 * foot and its shadow, the one thing Syama drew being two stems standing
 * together.
 */
export const FOOT_CLEARANCE = 0.45;
/** A flower's lean at the breeze's strongest, in radians. */
export const FLOWER_SWAY = 0.09;
/** A flower's head reaches this far from its centre, per unit of its size. */
const HEAD_REACH = FLOWER_RANGES.petalLength[1];
/**
 * How near two flowers' heads may come, as a share of the two heads' reach
 * together, each taken at its widest.
 */
export const FLOWERS_APART = 0.75;
/** The most of a flower's head the mushrooms in front of it may hide. */
export const MOST_SHADED = 0.5;
/** How many points across a flower's smallest head its share hidden is read at. */
const HEAD_STEPS = 7;
/**
 * How many places across its reach a head is read at, from its stem bent
 * farthest left and leant left by the breeze to the same on the right.
 */
const LEAN_STEPS = 7;

/**
 * The screen a visit opens on, as its flowers are placed on it: its ground
 * and the frame on it the meadow is laid out in; the flowers' unit, the
 * clump's size where its front foot stands; every control's circle as
 * drawn; and the mushrooms the visit opens with, as they shade it.
 */
export type FlowerGround = Pick<
  Camera,
  'width' | 'height' | 'groundTop' | 'ground' | 'unit'
> &
  Framed & {
    controls: readonly Circle[];
    clump: ClumpShade;
  };

/**
 * A foot on the ground (`Ground`) and its size in the clump's before depth
 * scales it: a flower's height to its head, a mushroom's unit.
 */
export type FlowerFoot = Ground & Scaled;

export { depthScale } from '../../model/ground';

/** The camera a visit's opening screen shows its ground through. */
function cameraOf({
  width,
  height,
  groundTop,
  ground,
  unit,
}: FlowerGround): Camera {
  return { width, height, groundTop, ground, midline: width / 2, unit };
}

/** Where `foot` stands on the screen `camera` shows, and how big. */
export function standingOn(camera: Camera, foot: FlowerFoot): Footing {
  const { x, y, scale } = project(camera, foot);
  return { x, y, size: foot.size * scale };
}

/** The ground a screen's footing stands on through `camera`: `standingOn` undone. */
export function groundOf(camera: Camera, { x, y, size }: Footing): FlowerFoot {
  const near = project(camera, { x: 0, z: 0 });
  const far = project(camera, { x: 0, z: 1 });
  const z = (y - near.y) / (far.y - near.y);
  const at = project(camera, { x: 0, z });
  return { x: (x - at.x) / at.scale, z, size: size / at.scale };
}

/** Each foot of `bed` as `camera` shows it. */
export function flowersOn(
  camera: Camera,
  bed: readonly FlowerFoot[],
): Footing[] {
  return bed.map((foot) => standingOn(camera, foot));
}

/**
 * The least `|r × depth + rise|` for any `r` of `FORESHORTENING` and any
 * `rise` from `low` to `high`: how near on the screen, down it, in the
 * clump's size, two things can come whose feet are `depth` apart into the
 * distance.
 */
function leastRise(depth: number, low: number, high: number): number {
  const [flat, steep] = FORESHORTENING.map((r) => r * depth);
  const least = Math.min(flat ?? 0, steep ?? 0) + low;
  const most = Math.max(flat ?? 0, steep ?? 0) + high;
  if (least > 0) return least;
  return most < 0 ? -most : 0;
}

/**
 * Whether a flower at `flower` keeps its stem and head off every mushroom's
 * foot of `feet`, on every screen (`FORESHORTENING`): the foot and its
 * shadow, the one thing Syama drew being two stems standing together.
 */
export function clearOfFeet(
  flower: FlowerFoot,
  feet: readonly FlowerFoot[],
): boolean {
  const own = scaleAt(flower.z);
  const stem = flower.size * own;
  const head = stem * HEAD_REACH;
  return feet.every((mushroom) => {
    const scale = scaleAt(mushroom.z);
    const across = mushroom.x * scale - flower.x * own;
    // The mushroom's foot against the nearest point of the flower's upright line.
    const down = leastRise(flower.z - mushroom.z, 0, stem);
    return (
      Math.hypot(across, down) >= mushroom.size * scale * FOOT_CLEARANCE + head
    );
  });
}

/**
 * Whether a flower at `place` keeps its head, at its widest, apart from the
 * head of every flower at `others`, on every screen (`FORESHORTENING`).
 */
export function headsApart(
  place: FlowerFoot,
  others: readonly FlowerFoot[],
): boolean {
  const own = place.size * scaleAt(place.z);
  return others.every((other) => {
    const scale = scaleAt(other.z);
    const size = other.size * scale;
    const across = place.x * scaleAt(place.z) - other.x * scale;
    const rise = size - own;
    const down = leastRise(other.z - place.z, rise, rise);
    return (
      Math.hypot(across, down) >= FLOWERS_APART * HEAD_REACH * (own + size)
    );
  });
}

/** The farthest a flower `place` stands for could reach with its head, whatever its genes: over its stem's top. */
export function widestHead({ x, y, size }: Footing): Circle {
  return { x, y: y - size, r: HEAD_REACH * size };
}

/**
 * Where the head's centre of a flower at `place` stands with its stem bent
 * `bend` of its size and the breeze leaning it `sway` radians about its foot.
 */
function headCentre(
  { x, y, size }: Footing,
  bend: number,
  sway: number,
): Point {
  return {
    x: x + bend * size * Math.cos(sway) + size * Math.sin(sway),
    y: y + bend * size * Math.sin(sway) - size * Math.cos(sway),
  };
}

const SWAYS = [-FLOWER_SWAY, 0, FLOWER_SWAY] as const;
/**
 * Where a head's centre may stand off its foot, per unit of the flower's
 * size, from its stem bent and leant farthest left to the same on the right:
 * a bend and a lean both carry it sideways, so every head stands on or near
 * this row.
 */
const LEANS = Array.from({ length: LEAN_STEPS }, (_, step) => {
  const side = (2 * step) / (LEAN_STEPS - 1) - 1;
  const sway = side * FLOWER_SWAY;
  return headCentre(
    { x: 0, y: 0, size: 1 },
    side * FLOWER_RANGES.stemBend[1],
    sway,
  );
});

/**
 * Whether no head a flower at `place` could grow, whatever its genes, at
 * rest or leant either way by the breeze, overlaps a control's circle.
 */
function clearOfControls(place: Footing, controls: readonly Circle[]): boolean {
  const reach = HEAD_REACH * place.size;
  const [least, most] = FLOWER_RANGES.stemBend;
  return SWAYS.every((sway) => {
    // Every bend's centre lies on this segment, the bend being linear in it.
    const from = headCentre(place, least, sway);
    const to = headCentre(place, most, sway);
    return controls.every(
      (control) => distanceToSegment(from, to, control) >= control.r + reach,
    );
  });
}

/**
 * Whether every head a flower at `place` could grow, whatever its genes, at
 * rest or leant either way by the breeze, shows at least half past the
 * mushrooms of `clump` standing nearer the front (`MOST_SHADED`).
 */
function shownPastClump(place: Footing, clump: ClumpShade): boolean {
  const { x, y, size } = place;
  const heads = LEANS.flatMap((lean) =>
    FLOWER_RANGES.petalLength.map((petal) => ({
      x: x + lean.x * size,
      y: y + lean.y * size,
      r: petal * size,
    })),
  );
  const step = (2 * FLOWER_RANGES.petalLength[0] * size) / HEAD_STEPS;
  return mostShaded(heads, clump, y, step) <= MOST_SHADED;
}

function jitter(
  random: Random,
  at: number,
  reach: number,
  [min, max]: readonly [number, number],
): number {
  const moved = at + between(random, -1, 1) * reach;
  return Math.min(max, Math.max(min, moved));
}

/**
 * Where the flower in slot `index` stands on the ground `opening` shows: the
 * first try off its slot, from its own seeded stream, that stands off the
 * opening clump's feet and apart from every flower of `placed` on the
 * ground, and on `opening` has its head clear of every control and shown
 * past the clump; `undefined` when none of its tries does.
 */
function spotOn(
  opening: FlowerGround,
  index: number,
  seed: number,
  placed: readonly FlowerFoot[],
): FlowerFoot | undefined {
  const { width, height, frame, controls, clump } = opening;
  const spot = FLOWER_SPOTS[height > width ? 'portrait' : 'landscape'][index];
  if (!spot) return undefined;
  const camera = cameraOf(opening);
  const feet = clump.map(({ place }) => groundOf(camera, place));
  const [across, down] = spot;
  const random = mulberry32(seed + index);
  for (let attempt = 0; attempt < FLOWER_TRIES; attempt++) {
    // Each miss strays a little farther, so a slot on the clump finds a way off it.
    const stray = 1 + attempt / 4;
    const x = jitter(random, across, FLOWER_JITTER[0] * stray, FLOWER_ACROSS);
    const y = jitter(random, down, FLOWER_JITTER[1] * stray, FLOWER_DOWN);
    const z = zAt(y);
    const foot = {
      x: ((2 * x - 1) * frame.across) / scaleAt(z),
      z,
      size: FLOWER_SIZE,
    };
    const flower = standingOn(camera, foot);
    if (
      clearOfFeet(foot, feet) &&
      headsApart(foot, placed) &&
      clearOfControls(flower, controls) &&
      shownPastClump(flower, clump)
    ) {
      return foot;
    }
  }
  return undefined;
}

/**
 * The visit's seeded flowers on the ground, placed once on `opening`, the
 * screen it opens on: each at its slot's first spot there that a child sees
 * (`spotOn`), left out when it has none.
 */
export function seededBed(opening: FlowerGround, seed: number): FlowerFoot[] {
  const bed: FlowerFoot[] = [];
  for (const index of FLOWER_SPOTS.landscape.keys()) {
    const foot = spotOn(opening, index, seed, bed);
    if (foot) bed.push(foot);
  }
  return bed;
}
