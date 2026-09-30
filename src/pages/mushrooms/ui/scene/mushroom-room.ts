/**
 * Where the next mushroom may grow: a foot `pickFoot` draws over this
 * screen's frame, kept only where the mushroom grown there, of whichever
 * species the child picks, keeps every rule the meadow keeps on this screen.
 * Judged as the scene stands and draws it: its cap inside `EDGE_MARGIN`, no
 * cap or stem hidden behind the nearer ones past `MOST_HIDDEN`, every door
 * in sight (`doorInSight`), every control, the sun's rays and its wash off
 * it, and off every flower.
 */

import { pick } from '@/shared/lib/collections';

import type { Planted } from '../../model/game';
import {
  type Box,
  boxAround,
  boxesMeet,
  type Circle,
  containsPoint,
  distanceToEdge,
  type Point,
} from '../../model/geometry';
import type { Ground } from '../../model/ground';
import { MUSHROOM_SPECIES, mushroomGenes } from '../../model/mushroom-genes';
import { type TapArea, tapArea, toCanvas } from '../../model/mushroom-outline';
import { type Splayed, splayed } from '../../model/mushroom-pose';
import { apartOnScreen, pickFoot } from '../../model/placement';
import type { Seeded } from '../../model/random';
import {
  type Among,
  amongAt,
  capBox,
  hiddenOf,
  hidersOf,
  MOST_HIDDEN,
  type Part,
  PARTS,
  partSighted,
  partsSighted,
  pastMore,
  type Sighted,
} from './cap-cover';
import { FOREST_SPLAY, placeOf } from './clump-layout';
import {
  doorInSight,
  IN_SIGHT,
  sightOf,
  type Standing,
  standingAs,
} from './door-sight';
import { flowerFeet } from './flower-plots';
import type { Stand } from './flower-sight';
import type { MeadowLayout, Placement } from './layout';
import { EDGE_MARGIN } from './meadow-camera';
import { fingerPad } from './mushroom-tap';
import { standingControls } from './sky-layout';
import { SUN_RAY_REACH, WASH_FOOT_CLEAR } from './sun-layout';
import { tapReach } from './tap-reach';

/**
 * How close, as a camera lays the ground out (`apartOnScreen`), in the
 * clump's size, a mushroom's foot comes to a flower's. Holding it to the
 * rule a flower keeps off a mushroom's foot (`clearOfFeet`) instead leaves
 * room for six mushrooms among seven flowers in almost no visit.
 */
const FLOWER_APART = 0.2;

/** What a screen holds a new mushroom to, whatever stands on it. */
type Screen = {
  stage: MeadowLayout;
  /** Every control's hit area, open pickers and all, and the sun's rays. */
  keepOff: readonly Circle[];
};

/** Each layout as a new mushroom is held to on it, read once. */
const screens = new WeakMap<MeadowLayout, Screen>();

/** `stage` as a new mushroom is held to on it. */
function screenOf(stage: MeadowLayout): Screen {
  const known = screens.get(stage);
  if (known) return known;
  const { sun, picker, housePicker } = stage;
  const screen = {
    stage,
    keepOff: [
      ...[...standingControls(stage), ...picker, ...housePicker].map(
        (control) => ({ ...control, r: tapReach(control.r) }),
      ),
      { ...sun, r: sun.r * SUN_RAY_REACH },
    ],
  };
  screens.set(stage, screen);
  return screen;
}

/** How far `point` is from the closed `outline`: 0 inside it. */
function distanceTo(outline: readonly Point[], point: Point): number {
  return containsPoint(outline, point) ? 0 : distanceToEdge(outline, point);
}

/**
 * Whether `standing`'s door shows `IN_SIGHT` past every nearer one of
 * `others`, painted door and doorway alike, where `doorInSight` seats it:
 * at once where no nearer one reaches its stem.
 */
function doorShows(standing: Standing, others: readonly Standing[]): boolean {
  const stem = boxAround(standing.drawn.at(-1) ?? []);
  const nearer = others.filter(
    ({ depth, drawn }) =>
      depth > standing.depth &&
      drawn.some((outline) => boxesMeet(stem, boxAround(outline))),
  );
  if (nearer.length === 0) return true;
  const station = doorInSight(standing, nearer);
  return (['painted', 'doorway'] as const).every(
    (part) => sightOf(standing, station, part, nearer) >= IN_SIGHT,
  );
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

/**
 * A standing mushroom as a pick weighs it: how it stands, whether it is one
 * of the opening clump, the box round all of it, and how its door and each
 * of its parts show past the rest as they stood before the pick, each read
 * once.
 */
type Weighed = Among & {
  whole: Box;
  shows: () => boolean;
  /** Past those that count against it (`hidersOf`). */
  sight: () => Record<Part, Sighted>;
};

function weighed(one: Among, among: () => readonly Weighed[]): Weighed {
  const { standing } = one;
  let shows: boolean | undefined;
  let sight: Record<Part, Sighted> | undefined;
  return {
    ...one,
    whole: boxAround(standing.drawn.flat()),
    shows: () =>
      (shows ??= doorShows(
        standing,
        among().map((other) => other.standing),
      )),
    sight: () => (sight ??= partsSighted(standing, hidersOf(one, among()))),
  };
}

/**
 * Each of the meadow's mushrooms on `screen`, weighed once however many feet
 * are tried beside them: the meadow's mushrooms are never changed in place,
 * only replaced.
 */
const standings = new WeakMap<readonly Planted[], WeakMap<Screen, Weighed[]>>();
function standingOn(mushrooms: readonly Planted[], screen: Screen): Weighed[] {
  const byScreen = standings.get(mushrooms) ?? new WeakMap();
  standings.set(mushrooms, byScreen);
  const known = byScreen.get(screen);
  if (known) return known;
  const here: Weighed[] = [];
  for (const mushroom of mushrooms) {
    const place = placeOf(screen.stage.camera, mushroom.foot);
    here.push(weighed(amongAt(place, mushroom), () => here));
  }
  byScreen.set(screen, here);
  return here;
}

/** A new mushroom as one screen stands it on a foot, and the screen's rules. */
type Trial = {
  screen: Screen;
  place: Placement;
  stood: Splayed;
  own: Standing;
};

/**
 * Whether `own`, standing among `others`, leaves every part of each in view
 * past `MOST_HIDDEN`: its own behind the nearer ones, and each of those it
 * stands in front of, unless it hides nothing more of that one than was
 * hidden already.
 */
function partsInView(own: Standing, others: readonly Weighed[]): boolean {
  const nearer = others
    .filter((other) => other.standing.depth > own.depth)
    .map((other) => other.standing);
  if (
    PARTS.some(
      (part) => hiddenOf(partSighted(own, part, nearer)) > MOST_HIDDEN[part],
    )
  ) {
    return false;
  }
  const whole = boxAround(own.drawn.flat());
  return others.every((other) => {
    if (other.standing.depth >= own.depth || !boxesMeet(whole, other.whole)) {
      return true;
    }
    const sight = other.sight();
    return PARTS.every((part) => {
      const before = sight[part];
      const after = pastMore(before, own.drawn);
      return (
        after.shown.length === before.shown.length ||
        hiddenOf(after) <= MOST_HIDDEN[part]
      );
    });
  });
}

/**
 * `grown` stood on `foot` on `screen`, where its foot and its cap keep the
 * cheap rules: its foot out of the sun's wash and its cap inside the edge
 * margin; `undefined` where one breaks.
 */
function trialOn(
  screen: Screen,
  foot: Ground,
  grown: Splayed,
): Trial | undefined {
  const { camera, sun, width, wash } = screen.stage;
  const place = placeOf(camera, foot);
  const away = Math.hypot(place.x - sun.x, place.y - sun.y);
  if (away < (wash.at(-1) ?? 0) + place.size * WASH_FOOT_CLEAR) {
    return undefined;
  }
  const own = standingAs(place, grown);
  const cap = capBox(own);
  if (cap.left < EDGE_MARGIN || cap.right > width - EDGE_MARGIN) {
    return undefined;
  }
  return { screen, place, stood: grown, own };
}

/**
 * Whether a `trial` keeps every door in sight among `others`: its own, and
 * every one behind it that showed before it grew.
 */
function doorsKept({ own }: Trial, others: readonly Weighed[]): boolean {
  const after = [...others.map(({ standing }) => standing), own];
  if (!doorShows(own, after)) return false;
  const whole = boxAround(own.drawn.flat());
  return others.every(
    (other) =>
      other.standing.depth >= own.depth ||
      !boxesMeet(whole, other.whole) ||
      !other.shows() ||
      doorShows(other.standing, after),
  );
}

/**
 * Where the mushroom grown from `seed` grows in `stand`, as the scene and
 * the visit a sweep opens both find it, whichever species the child picks:
 * `undefined` where the meadow has no room left for one. It keeps off every
 * flower standing there (`flowerFeet`), and each foot is tried on the cheap
 * rules first, then the controls, then what it hides and what hides it,
 * then the doors.
 */
export function roomFor(stand: Stand, seed: number): Ground | undefined {
  const { layout, mushrooms } = stand;
  const flowers = flowerFeet(stand);
  const screen = screenOf(layout);
  const others = standingOn(mushrooms, screen);
  const grown = MUSHROOM_SPECIES.map((species) =>
    mushroomGenes({ seed, species }),
  );
  const splays = new Map(
    [-FOREST_SPLAY, FOREST_SPLAY].map((splay) => [
      splay,
      grown.map((genes) => splayed(genes, splay)),
    ]),
  );
  return pickFoot(seed, {
    ...pick(layout.mushrooms, 'frame'),
    feet: mushrooms.map(({ foot }) => foot),
    admits: (foot) => {
      if (
        flowers.some((flower) => apartOnScreen(foot, flower) < FLOWER_APART)
      ) {
        return false;
      }
      const { splay } = placeOf(layout.camera, foot);
      const species = splays.get(splay);
      if (!species) {
        throw new Error(`A forest mushroom stood with splay ${String(splay)}`);
      }
      const trials: Trial[] = [];
      for (const genes of species) {
        const trial = trialOn(screen, foot, genes);
        if (!trial) return false;
        trials.push(trial);
      }
      return (
        trials.every((trial) =>
          keptOff(
            trial.stood,
            trial.own,
            trial.place.size,
            trial.screen.keepOff,
          ),
        ) &&
        trials.every((trial) => partsInView(trial.own, others)) &&
        trials.every((trial) => doorsKept(trial, others))
      );
    },
  });
}

/** What a room was found in, and where. */
type Found = Stand & Seeded & { foot: Ground | undefined };

/** What of a stand the room in it is found from. */
const FOUND_FROM = ['layout', 'flowers', 'mushrooms', 'planted'] as const;

/**
 * `find` answered again only once the stand it answered for, or the seed,
 * changes: a new layout after any resize, the mushrooms, the plantings or
 * the seeded flowers.
 */
export function keptRoom(find: typeof roomFor = roomFor): typeof roomFor {
  let found: Found | undefined;
  return (stand, seed) => {
    if (
      found?.seed === seed &&
      FOUND_FROM.every((key) => found?.[key] === stand[key])
    ) {
      return found.foot;
    }
    const foot = find(stand, seed);
    found = { ...stand, seed, foot };
    return foot;
  };
}
