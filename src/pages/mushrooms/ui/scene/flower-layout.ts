/**
 * Where the visit's seeded flowers stand on the ground, placed once a visit
 * from the screen it opens on, its seed and the mushrooms it opens with: each
 * jittered off a slot by its own seeded stream, and moved again until it
 * stands where a child sees it on that screen — off the clump's feet and
 * apart from the other flowers on the ground, its head clear of every
 * control and no more than half hidden by those mushrooms — or left out.
 * Every one stands in the world's frame (`MEADOW_FRAME`), and a turn or a
 * resize changes the camera and the crop, not the ground; in-sight is the
 * scene's query (`flower-sight.ts`).
 */

import {
  FLOWER_RANGES,
  type FlowerGenes,
  flowerHead,
} from '../../model/flower-genes';
import {
  type Circle,
  distanceBetween,
  distanceToSegment,
  type Point,
} from '../../model/geometry';
import {
  type Camera,
  type Footing,
  type Framed,
  type GroundFoot,
  groundFootOf,
  planeFootOf,
  project,
  scaleAt,
  UP_PER_Z,
  zAt,
} from '../../model/ground';
import { between, mulberry32, type Random } from '../../model/random';
import { type ClumpShade, mostShaded } from './clump-shade';

/**
 * The slots the flowers grow around in each half of the world, as a fraction
 * of that half's width across and of the ground's depth down — some behind
 * the clump's stems, some before it. Each half holds one flower per seeded
 * sound (`SEEDED_SOUNDS`), in the order `firstFlowers` deals them, and each
 * visit jitters every flower off its slot.
 */
const FLOWER_SPOTS = [
  [0.12, 0.35],
  [0.37, 0.22],
  [0.26, 0.72],
  [0.67, 0.28],
  [0.78, 0.74],
  [0.9, 0.42],
  [0.56, 0.88],
] as const;
/** A slot of `FLOWER_SPOTS`: across its half and down the ground. */
type Spot = (typeof FLOWER_SPOTS)[number];
/**
 * How far a flower strays from its slot, as a fraction of its half's width
 * and of the ground's depth.
 */
const FLOWER_JITTER = [0.07, 0.12] as const;
/**
 * How far across its half's width, and down the ground's depth, a flower's
 * foot may stand: on the ground, its head clear of the world's sides and of
 * the other half's flowers.
 */
const FLOWER_ACROSS = [0.05, 0.95] as const;
export const FLOWER_DOWN = [0.12, 0.96] as const;
/** Tries at a spot off the slot before a flower is left out. */
const FLOWER_TRIES = 48;
/** A flower's height, as a share of the clump's size, before depth scales it. */
export const FLOWER_SIZE = 0.28;
/**
 * How far round a mushroom's foot, per unit of its size, no flower stands: the
 * foot and its shadow, the one thing Syama drew being two stems standing
 * together.
 */
export const FOOT_CLEARANCE = 0.45;
/** A flower's lean at the breeze's strongest, in radians. */
export const FLOWER_SWAY = 0.09;
/** A flower's head reaches this far from its centre, per unit of its size. */
export const HEAD_REACH = FLOWER_RANGES.petalLength[1];
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
  'width' | 'height' | 'groundTop' | 'ground' | 'world' | 'unit'
> &
  Framed & {
    controls: readonly Circle[];
    clump: ClumpShade;
  };

export { type Footing } from '../../model/ground';

/** The camera a visit's opening screen shows its ground through. */
function cameraOf({
  width,
  height,
  groundTop,
  ground,
  world,
  unit,
}: FlowerGround): Camera {
  return { width, height, groundTop, ground, world, midline: world / 2, unit };
}

/** Where the layout's `foot` stands on the screen `camera` shows, and how big. */
function standingOnGround(camera: Camera, foot: GroundFoot): Footing {
  const { x, y, scale } = project(camera, foot);
  return { x, y, size: foot.size * scale };
}

/**
 * Where a bed lays a flower grown off the opening out to paint it: at the
 * clump's front foot straight ahead, `CLUMP_DISTANCE` from the eye, at
 * `foot`'s size, so it is painted once wherever it stands, the view drawing
 * it smaller the farther it is (`laidOf`, for a mushroom).
 */
export function laidFlower(camera: Camera, { size }: Footing): Footing {
  return standingOnGround(camera, { x: 0, z: 0, size });
}

/** Where `foot` stands on the screen `camera` shows, and how big. */
export function standingOn(camera: Camera, foot: Footing): Footing {
  return standingOnGround(camera, groundFootOf(foot));
}

/** The layout's ground a screen's footing stands on through `camera`: `standingOn` undone. */
export function groundOf(camera: Camera, { x, y, size }: Footing): GroundFoot {
  const near = project(camera, { x: 0, z: 0 });
  const far = project(camera, { x: 0, z: 1 });
  const z = (y - near.y) / (far.y - near.y);
  const at = project(camera, { x: 0, z });
  return { x: (x - at.x) / at.scale, z, size: size / at.scale };
}

/** Each foot of `bed` as `camera` shows it. */
export function flowersOn(camera: Camera, bed: readonly Footing[]): Footing[] {
  return bed.map((foot) => standingOn(camera, foot));
}

/**
 * How near on the screen, down it, in the clump's size, two things come whose
 * feet are `depth` apart into the distance and whose tops stand from `low` to
 * `high` up off them: the least `|UP_PER_Z × depth + rise|` for any `rise`
 * between.
 */
function leastRise(depth: number, low: number, high: number): number {
  const least = UP_PER_Z * depth + low;
  const most = UP_PER_Z * depth + high;
  if (least > 0) return least;
  return most < 0 ? -most : 0;
}

/**
 * Whether a flower at `flower` keeps its stem and head off every mushroom's
 * foot of `feet`, on every screen: the foot and its shadow, the one thing
 * Syama drew being two stems standing together.
 */
function clearOnGround(
  flower: GroundFoot,
  feet: readonly GroundFoot[],
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
 * head of every flower at `others`, on every screen.
 */
function apartOnGround(
  place: GroundFoot,
  others: readonly GroundFoot[],
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

/**
 * Whether a flower at `foot` keeps its head, at its widest, off every
 * mushroom's foot of `feet`, by plane distance, which no eye's frame
 * changes: the foot and its shadow, the one thing Syama drew being two stems
 * standing together.
 */
export function clearOfFeet(foot: Footing, feet: readonly Footing[]): boolean {
  const head = HEAD_REACH * foot.size;
  return feet.every(
    (mushroom) =>
      distanceBetween(foot, mushroom) >= mushroom.size * FOOT_CLEARANCE + head,
  );
}

/**
 * Whether a flower at `foot` keeps its head, at its widest, apart from the
 * head of every flower at `others`, by plane distance, which no eye's frame
 * changes.
 */
export function headsApart(foot: Footing, others: readonly Footing[]): boolean {
  return others.every(
    (other) =>
      distanceBetween(foot, other) >=
      FLOWERS_APART * HEAD_REACH * (foot.size + other.size),
  );
}

/**
 * Whether a flower yet to grow at `place`, whatever its genes, keeps its
 * head clear of the head of every flower of `others` as it grew, on every
 * screen: however far its stem bends toward one, and its head at its widest.
 */
export function headClear(
  place: GroundFoot,
  others: ReadonlyArray<{ foot: GroundFoot; genes: FlowerGenes }>,
): boolean {
  const own = place.size * scaleAt(place.z);
  const bend = FLOWER_RANGES.stemBend[1] * own;
  return others.every(({ foot, genes }) => {
    const scale = scaleAt(foot.z);
    const size = foot.size * scale;
    const head = flowerHead(genes, size);
    const across = Math.max(
      0,
      Math.abs(place.x * scaleAt(place.z) - (foot.x * scale + head.x)) - bend,
    );
    const rise = size - own;
    const down = leastRise(foot.z - place.z, rise, rise);
    return Math.hypot(across, down) >= head.r + HEAD_REACH * own;
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

/** How many halves of the world the seeded bed spreads over, a full set of sounds in each. */
const BED_HALVES = 2;

/**
 * Where the flower in slot `index`, at `spot`, of the world's `half` stands
 * on the ground `opening` shows: the first try off its slot, from its own
 * seeded stream, that stands off the opening clump's feet and apart from
 * every flower of `placed` on the ground, and on `opening` has its head
 * clear of every control and shown past the clump; `undefined` when none of
 * its tries does.
 */
function spotOn(
  opening: FlowerGround,
  half: number,
  [index, [across, down]]: readonly [number, Spot],
  seed: number,
  placed: readonly GroundFoot[],
): GroundFoot | undefined {
  const { frame, controls, clump } = opening;
  const camera = cameraOf(opening);
  const feet = clump.map(({ place }) => groundOf(camera, place));
  const random = mulberry32(seed + half * FLOWER_SPOTS.length + index);
  for (let attempt = 0; attempt < FLOWER_TRIES; attempt++) {
    // Each miss strays a little farther, so a slot on the clump finds a way off it.
    const stray = 1 + attempt / 4;
    const x = jitter(random, across, FLOWER_JITTER[0] * stray, FLOWER_ACROSS);
    const y = jitter(random, down, FLOWER_JITTER[1] * stray, FLOWER_DOWN);
    const z = zAt(y);
    const foot = {
      x: ((2 * ((half + x) / BED_HALVES) - 1) * frame.across) / scaleAt(z),
      z,
      size: FLOWER_SIZE,
    };
    const flower = standingOnGround(camera, foot);
    if (
      clearOnGround(foot, feet) &&
      apartOnGround(foot, placed) &&
      clearOfControls(flower, controls) &&
      shownPastClump(flower, clump)
    ) {
      return foot;
    }
  }
  return undefined;
}

/**
 * The visit's seeded flowers' feet on the plane, laid out once on `opening`'s ground: the
 * left half's slots, then the right's, each flower at its slot's first spot
 * there that a child sees (`spotOn`), left out when it has none.
 */
export function seededBed(opening: FlowerGround, seed: number): Footing[] {
  const bed: GroundFoot[] = [];
  for (let half = 0; half < BED_HALVES; half++) {
    for (const slot of FLOWER_SPOTS.entries()) {
      const foot = spotOn(opening, half, slot, seed, bed);
      if (foot) bed.push(foot);
    }
  }
  return bed.map((foot) => planeFootOf(foot));
}
