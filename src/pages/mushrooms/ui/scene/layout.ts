/**
 * Where everything in the meadow stands, as a pure function of the viewport in
 * CSS pixels. Every size in the meadow is proportional, but for the floors
 * that keep the clump a finger's target and an insect big enough to read,
 * so a phone held upright and a tablet held sideways get the same picture
 * composed for each; `sky-layout.ts` places the buttons over it, and
 * `sun-layout.ts` the sun.
 */

import { pick } from '@/shared/lib/collections';
import type { Sized } from '@/shared/typings';

import type { Box, Circle, Point, Scaled } from '../../model/geometry';
import type { Camera, Hazed } from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import { openingPan, screenOf } from '../../model/pan';
import { clumpCrowns, type MushroomGround } from './clump-layout';
import { clumpShade, type Opener } from './clump-shade';
import { type FlowerFoot, flowersOn, seededBed } from './flower-layout';
import { MEADOW_FRAME, meadowCamera } from './meadow-camera';
import { type Controls, placeControls } from './sky-layout';
import { horizonAt, placeSun, washRings } from './sun-layout';

/**
 * A mushroom's footing, the `splay` it is stood with (`splayed`), and its
 * haze, the farthest the palest.
 */
export type Placement = Footing & Hazed & { splay: number };
export type { Hazed } from '../../model/ground';
/**
 * Where a thing's foot stands, and its size: the unit its genes are in, a
 * flower's height to its head.
 */
export type Footing = Point & Scaled;

/**
 * A butterfly's size, the unit its genes are in, as a share of the clump's,
 * and the least it is painted at, which holds on every screen and every
 * refit, however small the clump stands: an insect a child cannot make out
 * is not in the meadow at all, where a butterfly wider than a small cap is
 * only a big butterfly. So a refit that zooms out shrinks the ground under
 * insects kept at the least, and a tap stays a finger's (`tapReach`).
 */
const INSECT_SCALE = 0.3;
const INSECT_LEAST = 60;
/**
 * The least each kind's open wings span as drawn, in CSS px, to read on a
 * phone, which `INSECT_LEAST` keeps every gene above.
 */
export const LEAST_SPANS = {
  butterfly: 52,
  fly: 30,
  bee: 30,
} as const satisfies Record<InsectKind, number>;

function insectSizeFor(unit: number): number {
  return Math.max(INSECT_LEAST, unit * INSECT_SCALE);
}
/**
 * Each kind's size against the butterfly's: a fly and a bee are small beside
 * it, and still read on a phone.
 */
const KIND_SCALE = {
  butterfly: 1,
  fly: 0.55,
  bee: 0.65,
} as const satisfies Record<InsectKind, number>;

export type MeadowLayout = Sized &
  Controls &
  Pick<Camera, 'groundTop'> & {
    /** What the meadow is shown through: a turn or a resize fits a new one. */
    camera: Camera;
    /** Where the far hills meet the sky. */
    horizon: number;
    /** The top of the near hills' band. */
    nearHills: number;
    sun: Circle;
    clouds: readonly Circle[];
    /** How the mushrooms stand, each by its foot (`placeIn`). */
    mushrooms: MushroomGround;
    flowers: readonly Footing[];
    /** The unit a butterfly's genes are painted in. */
    insectSize: number;
    /** The unit each kind's genes are painted in, the butterfly's `insectSize`. */
    insectSizes: Readonly<Record<InsectKind, number>>;
    /** The radii of the sun's wash over the land, innermost first (`washRings`). */
    wash: readonly number[];
  };

/** Everything the meadow stands on a screen but its flowers and the sun's wash. */
type Stood = Omit<MeadowLayout, 'flowers' | 'wash'>;

/**
 * `seed` is the visit's: it places what varies between visits, and a resize
 * that passes the same one keeps it where it was. The meadow is laid out
 * across the whole world for this screen's size, the screen a crop of it
 * (`pan.ts`), so a turn or a resize changes the zoom and the crop and moves
 * nothing on the ground. The seeded flowers are placed on the world once,
 * against `openers`, the mushrooms the visit opened with.
 */
export function meadowLayout(
  width: number,
  height: number,
  seed: number,
  openers: readonly Opener[] = [],
): MeadowLayout {
  const layout = stoodMeadow(width, height);
  return {
    ...layout,
    flowers: flowersOn(layout.camera, keptBed(seed, openers)),
    wash: washRings(layout, []),
  };
}

/**
 * How many screens' `Stood`, and visits' flowers, are kept: a screen and its
 * turn, and the few a resize passes through.
 */
const KEPT = 8;
const stood = new Map<string, Stood>();
const beds = new Map<string, FlowerFoot[]>();

/** `make()`, kept in `store` under `key` among the latest `KEPT`. */
function keptIn<Kept>(
  store: Map<string, Kept>,
  key: string,
  make: () => Kept,
): Kept {
  const known = store.get(key) ?? make();
  store.delete(key);
  store.set(key, known);
  for (const oldest of store.keys()) {
    if (store.size <= KEPT) break;
    store.delete(oldest);
  }
  return known;
}

/** `standMeadow`, kept for the screens stood last: nothing it stands varies between visits. */
function stoodMeadow(width: number, height: number): Stood {
  return keptIn(stood, `${String(width)} ${String(height)}`, () =>
    standMeadow(width, height),
  );
}

/**
 * The screen the seeded flowers are placed through: any one places them on
 * the same ground, every camera looking from one angle, so the tablet held
 * sideways, the primary layout. No control stands over the world, so none is
 * in the bed's way.
 */
const BED_SCREEN = { width: 1180, height: 820 } as const;

/** `seededBed` on the world against `openers`, kept for the visits placed last. */
function keptBed(seed: number, openers: readonly Opener[]): FlowerFoot[] {
  const key = [
    String(seed),
    ...openers.map(
      ({ foot, species, seed: own }) =>
        `${String(foot.x)} ${String(foot.z)} ${species} ${String(own)}`,
    ),
  ].join(' ');
  return keptIn(beds, key, () => {
    const { camera, mushrooms } = stoodMeadow(
      BED_SCREEN.width,
      BED_SCREEN.height,
    );
    const opened = {
      ...pick(
        camera,
        'width',
        'height',
        'groundTop',
        'ground',
        'world',
        'unit',
      ),
      ...pick(mushrooms, 'frame'),
      controls: [],
      clump: clumpShade(mushrooms, openers),
    };
    return seededBed(opened, seed);
  });
}

/**
 * The clump's crowns (`clumpCrowns`) where the screen shows them as the visit
 * opens, for the sun, which stands on the screen, to keep its rays off.
 */
function openingCrowns(camera: Camera): Box[] {
  const opening = openingPan(camera);
  return clumpCrowns(camera).map((crown) => ({
    ...crown,
    left: screenOf(opening, 0, crown.left),
    right: screenOf(opening, 0, crown.right),
  }));
}

/** The meadow on a screen `width` by `height` (`meadowCamera`), but for its flowers (`Stood`). */
function standMeadow(width: number, height: number): Stood {
  const camera = meadowCamera(width, height);
  const { groundTop, unit } = camera;
  const horizon = horizonAt(groundTop);
  const short = Math.min(width, height);
  const mushrooms = { camera, frame: MEADOW_FRAME };
  const controls = placeControls(width, height, groundTop);
  const insectSize = insectSizeFor(unit);
  return {
    width,
    height,
    camera,
    horizon,
    nearHills: horizon + (groundTop - horizon) * 0.45,
    groundTop,
    sun: placeSun(
      { width, height, horizon },
      short * 0.075,
      controls,
      openingCrowns(camera),
    ),
    clouds: [
      { x: width * 0.16, y: height * 0.14, r: short * 0.06 },
      { x: width * 0.5, y: height * 0.08, r: short * 0.045 },
      { x: width * 0.68, y: height * 0.24, r: short * 0.05 },
    ],
    ...controls,
    mushrooms,
    insectSize,
    insectSizes: {
      butterfly: insectSize * KIND_SCALE.butterfly,
      fly: insectSize * KIND_SCALE.fly,
      bee: insectSize * KIND_SCALE.bee,
    },
  };
}
