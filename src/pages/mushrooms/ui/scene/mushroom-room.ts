/**
 * Where the next mushroom may grow: a foot `pickFoot` draws over the stretch
 * of the world the screen shows now (`Crop`), kept only where the mushroom
 * grown there, of whichever species the child picks, keeps every rule the
 * meadow keeps. Judged as the scene stands and draws it: its cap inside
 * `EDGE_MARGIN` of the world's edges and the screen's, no cap or stem hidden
 * behind the nearer ones past `MOST_HIDDEN`, every door in sight
 * (`doorInSight`), every control and the sun's rays off it where they stand
 * over the crop now, and off every flower; and every mushroom keeping a
 * patch of its own a finger lands on (`keepsPatches`). A later pan may slide
 * a cap under a control or the sun, which stand on the screen: one more pan
 * moves it out. The sun's wash keeps off every foot on every crop
 * (`washRings`).
 */

import { pick } from '@/shared/lib/collections';

import {
  boxAround,
  type Circle,
  containsPoint,
  distanceToEdge,
  type Point,
} from '../../model/geometry';
import type { Ground } from '../../model/ground';
import { MUSHROOM_SPECIES, mushroomGenes } from '../../model/mushroom-genes';
import { type TapArea, tapArea, toCanvas } from '../../model/mushroom-outline';
import { type Splayed, splayed } from '../../model/mushroom-pose';
import { apartOnScreen, pickFoot, type Span } from '../../model/placement';
import type { Seeded } from '../../model/random';
import { capBox } from './cap-cover';
import { FOREST_SPLAY, placeOf } from './clump-layout';
import { type Standing, standingAs } from './door-sight';
import { flowerFeet } from './flower-plots';
import type { Stand } from './flower-sight';
import type { MeadowLayout, Placement } from './layout';
import { EDGE_MARGIN } from './meadow-camera';
import {
  type Around,
  keepsPatches,
  patchesAround,
  patchTarget,
} from './mushroom-patch';
import { fingerPad } from './mushroom-tap';
import type { Crop } from './pan-input';
import { standingControls } from './sky-layout';
import { doorsKept, partsInView, standingOn } from './standing-weighed';
import { SUN_RAY_REACH } from './sun-layout';
import { tapReach } from './tap-reach';

/**
 * How close, as a camera lays the ground out (`apartOnScreen`), in the
 * clump's size, a mushroom's foot comes to a flower's. Holding it to the
 * rule a flower keeps off a mushroom's foot (`clearOfFeet`) instead leaves
 * room for six mushrooms among seven flowers in almost no visit.
 */
const FLOWER_APART = 0.2;

/**
 * The stretch of the world the screen shows as a `+` is pressed, as the
 * scene's crop converts a point across the screen to where it lies in the
 * world now (`pan-input.ts`, through `pan.ts`'s `worldOf`).
 */
type Shown = Pick<Crop, 'toWorld'>;

/**
 * What a crop holds a new mushroom to, whatever stands in it: where across
 * the world, in px, its cap stands between; every control's hit area, open
 * pickers and all, and the sun's rays, where they stand over the world now;
 * and how far across the ground its foot is drawn (`seen`). Absent a crop,
 * the whole world, which no control stands over.
 */
type Screen = {
  stage: MeadowLayout;
  edges: Record<'left' | 'right', number>;
  keepOff: readonly Circle[];
  within?: Span;
};

/** `stage` as a new mushroom is held to on it, over `crop`. */
function screenOn(stage: MeadowLayout, crop: Shown | undefined): Screen {
  const { camera, sun, picker, housePicker, width } = stage;
  const edges = { left: EDGE_MARGIN, right: camera.world - EDGE_MARGIN };
  if (!crop) return { stage, edges, keepOff: [] };
  const shown = {
    left: crop.toWorld({ x: 0, y: 0 }).x,
    right: crop.toWorld({ x: width, y: 0 }).x,
  };
  const inWorld = (circle: Circle, r: number) => ({
    ...crop.toWorld(circle),
    r,
  });
  const across = (x: number) => (x - camera.midline) / camera.unit;
  return {
    stage,
    edges: {
      left: Math.max(edges.left, shown.left + EDGE_MARGIN),
      right: Math.min(edges.right, shown.right - EDGE_MARGIN),
    },
    keepOff: [
      ...[...standingControls(stage), ...picker, ...housePicker].map(
        (control) => inWorld(control, tapReach(control.r)),
      ),
      inWorld(sun, sun.r * SUN_RAY_REACH),
    ],
    within: { left: across(shown.left), right: across(shown.right) },
  };
}

/** How far `point` is from the closed `outline`: 0 inside it. */
function distanceTo(outline: readonly Point[], point: Point): number {
  return containsPoint(outline, point) ? 0 : distanceToEdge(outline, point);
}

/** Each stood mushroom's tap area in its own frame, laid out once. */
const areas = new WeakMap<Splayed, TapArea>();

/**
 * Whether every one of `circles` keeps off `standing`'s tap area as it
 * stands on screen: its drawn parts, and its finger pad where it has one.
 */
function keptOff(
  stood: Splayed,
  { placed, drawn }: Standing,
  size: number,
  circles: readonly Circle[],
): boolean {
  const area = areas.get(stood) ?? tapArea(stood.genes, stood.turn);
  areas.set(stood, area);
  const canvas = toCanvas(size);
  const pad = fingerPad({
    cap: area.cap.map((point) => canvas(point)),
    gills: area.gills.map((point) => canvas(point)),
    stem: area.stem.map((point) => canvas(point)),
  });
  const [middle] = pad ? placed([{ x: pad.x / size, y: -pad.y / size }]) : [];
  const padded = middle && pad && { middle, reach: pad.r };
  // A mushroom's drawn outlines are its tap area's parts (`TAP_PARTS`).
  const outlines = drawn.map((outline) => ({
    outline,
    box: boxAround(outline),
  }));
  return circles.every((circle) => {
    if (
      padded &&
      Math.hypot(padded.middle.x - circle.x, padded.middle.y - circle.y) <
        padded.reach + circle.r
    ) {
      return false;
    }
    return outlines.every(
      ({ outline, box }) =>
        circle.x + circle.r < box.left ||
        circle.x - circle.r > box.right ||
        circle.y + circle.r < box.top ||
        circle.y - circle.r > box.bottom ||
        distanceTo(outline, circle) >= circle.r,
    );
  });
}

/** A new mushroom as one screen stands it on a foot, and the screen's rules. */
type Trial = {
  screen: Screen;
  place: Placement;
  stood: Splayed;
  own: Standing;
};

/**
 * `grown` stood on `foot` on `screen`, where its cap keeps the cheap rule,
 * standing between the screen's `edges`; `undefined` where it breaks.
 */
function trialOn(
  screen: Screen,
  foot: Ground,
  grown: Splayed,
): Trial | undefined {
  const place = placeOf(screen.stage.camera, foot);
  const own = standingAs(place, grown);
  const cap = capBox(own);
  if (cap.left < screen.edges.left || cap.right > screen.edges.right) {
    return undefined;
  }
  return { screen, place, stood: grown, own };
}

/** Each species the mushroom grown from `seed` may be, by the splay it stands with. */
function speciesOf(seed: number): ReadonlyMap<number, readonly Splayed[]> {
  const grown = MUSHROOM_SPECIES.map((species) =>
    mushroomGenes({ seed, species }),
  );
  return new Map(
    [-FOREST_SPLAY, FOREST_SPLAY].map((splay) => [
      splay,
      grown.map((genes) => splayed(genes, splay)),
    ]),
  );
}

/**
 * The mushroom of every species in `splays` stood on `foot` over `screen`,
 * each inside its edges and off everything it keeps off; `undefined` where
 * one is not.
 */
function croppedTrials(
  screen: Screen,
  foot: Ground,
  splays: ReadonlyMap<number, readonly Splayed[]>,
): Trial[] | undefined {
  const { splay } = placeOf(screen.stage.camera, foot);
  const species = splays.get(splay);
  if (!species) {
    throw new Error(`A forest mushroom stood with splay ${String(splay)}`);
  }
  const trials: Trial[] = [];
  for (const genes of species) {
    const trial = trialOn(screen, foot, genes);
    if (!trial) return undefined;
    trials.push(trial);
  }
  return trials.every((trial) =>
    keptOff(trial.stood, trial.own, trial.place.size, screen.keepOff),
  )
    ? trials
    : undefined;
}

/** The id a mushroom being tried is sought by among the meadow's. */
const TRIED = 'the tried mushroom';

/**
 * Where the mushroom grown from `seed` grows in `stand`, as the scene and
 * the visit a sweep opens both find it, whichever species the child picks:
 * inside `crop`, or anywhere in the world absent one; `undefined` where
 * there is no room left for one. It keeps off every flower standing there
 * (`flowerFeet`), and each foot is tried on the cheap rules first, then the
 * controls, then what it hides and what hides it, then the doors, then the
 * patches, the dearest to try.
 */
export function roomFor(
  stand: Stand,
  seed: number,
  crop?: Shown,
): Ground | undefined {
  const { layout, mushrooms } = stand;
  const flowers = flowerFeet(stand);
  const screen = screenOn(layout, crop);
  const others = standingOn(mushrooms, layout);
  const splays = speciesOf(seed);
  let around: Around | undefined;
  const aroundNow = (): Around => (around ??= patchesAround(stand));
  return pickFoot(seed, {
    ...pick(layout.mushrooms, 'frame'),
    ...pick(screen, 'within'),
    feet: mushrooms.map(({ foot }) => foot),
    admits: (foot) => {
      if (
        flowers.some((flower) => apartOnScreen(foot, flower) < FLOWER_APART)
      ) {
        return false;
      }
      const trials = croppedTrials(screen, foot, splays);
      return (
        trials !== undefined &&
        trials.every((trial) => partsInView(trial.own, others)) &&
        trials.every((trial) => doorsKept(trial.own, others)) &&
        trials.every(({ place, stood }) =>
          keepsPatches(patchTarget(TRIED, place, stood), aroundNow()),
        )
      );
    },
  });
}

/**
 * Whether the mushroom grown from `seed` on `foot`, of every species, still
 * stands inside `crop` and off every control and the sun's rays over it:
 * all of `roomFor`'s rules that a pan changes.
 */
export function fitsCrop(
  { layout }: Stand,
  seed: number,
  foot: Ground,
  crop?: Shown,
): boolean {
  return (
    croppedTrials(screenOn(layout, crop), foot, speciesOf(seed)) !== undefined
  );
}

/**
 * What a room was found in, where, and where across the world the crop it
 * was found in began: the world's x at the screen's left edge.
 */
type Found = Stand &
  Seeded & { foot: Ground | undefined; shown: number | undefined };

/** What of a stand the room in it is found from. */
const FOUND_FROM = ['layout', 'flowers', 'mushrooms', 'planted'] as const;

/** Where across the world `crop` begins, or `undefined` for the whole world. */
const shownFrom = (crop: Shown | undefined) => crop?.toWorld({ x: 0, y: 0 }).x;

/**
 * `find` answered again only once the stand it answered for, or the seed,
 * changes — a new layout after any resize, the mushrooms, the plantings or
 * the seeded flowers — or a pan leaves it wanting: a foot found stays while
 * it `fits` the crop it is asked for, and no room found stays while the crop
 * stands where it did. A pan never makes a new layout, so it never costs a
 * search while the room found stays in sight.
 */
export function keptRoom(
  find: typeof roomFor = roomFor,
  fits: typeof fitsCrop = fitsCrop,
): typeof roomFor {
  let found: Found | undefined;
  return (stand, seed, crop) => {
    const shown = shownFrom(crop);
    if (
      found?.seed === seed &&
      FOUND_FROM.every((key) => found?.[key] === stand[key]) &&
      (found.foot ? fits(stand, seed, found.foot, crop) : found.shown === shown)
    ) {
      return found.foot;
    }
    const foot = find(stand, seed, crop);
    found = { ...stand, seed, foot, shown };
    return foot;
  };
}
