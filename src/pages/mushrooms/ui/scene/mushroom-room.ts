/**
 * Where the next mushroom may grow: a foot `pickFoot` draws, kept only where
 * the mushroom grown there, of whichever species the child picks, keeps
 * every rule the meadow keeps on every screen it is composed for — turned
 * either way, so a rotation never makes a mushroom break one. Judged as the
 * scene stands and draws it: its cap inside `EDGE_MARGIN`, no cap more than
 * `MOST_HIDDEN` behind a nearer one's, every door in sight (`doorInSight`),
 * every control, the sun's rays and its wash off it, and off every flower.
 */

import type { Planted } from '../../model/game';
import {
  type Box,
  boxAround,
  boxesMeet,
  type Circle,
  containsPoint,
  type Point,
} from '../../model/geometry';
import { type Ground, groundAt } from '../../model/ground';
import { MUSHROOM_SPECIES, mushroomGenes } from '../../model/mushroom-genes';
import { type TapArea, tapArea, toCanvas } from '../../model/mushroom-outline';
import { type Splayed, splayed } from '../../model/mushroom-pose';
import { apartOnScreen, pickFoot } from '../../model/placement';
import { capBox, coverOf, MOST_HIDDEN } from './cap-cover';
import { FOREST_SPLAY, placeOf } from './clump-layout';
import {
  doorInSight,
  IN_SIGHT,
  sightOf,
  type Standing,
  standingAs,
  standingAt,
} from './door-sight';
import { standingFlowers } from './flower-plots';
import type { Stand } from './flower-sight';
import { EDGE_MARGIN, meadowStage, type Placement } from './layout';
import { fingerPad } from './mushroom-tap';
import { standingControls, tapReach } from './sky-layout';
import { SUN_RAY_REACH, WASH_FOOT_CLEAR, washRings } from './sun-layout';
import { VIEWPORTS } from './viewports';

/**
 * How close, as a camera lays the ground out (`apartOnScreen`), in the
 * clump's size, a mushroom's foot comes to a flower's.
 */
const FLOWER_APART = 0.2;

/** What a screen holds a new mushroom to, whatever stands on it. */
type Screen = {
  stage: ReturnType<typeof meadowStage>;
  /** Every control's hit area, open pickers and all, and the sun's rays. */
  keepOff: readonly Circle[];
  /** How far the sun's wash reaches round its middle. */
  wash: number;
};

/** Every screen the meadow is composed for, each held either way. */
const SCREENS: readonly Screen[] = VIEWPORTS.flatMap(([, width, height]) =>
  [
    [width, height],
    [height, width],
  ].map(([across = 0, down = 0]) => {
    const stage = meadowStage(across, down);
    const { sun, picker, housePicker } = stage;
    return {
      stage,
      keepOff: [
        ...[...standingControls(stage), ...picker, ...housePicker].map(
          (control) => ({ ...control, r: tapReach(control.r) }),
        ),
        { ...sun, r: sun.r * SUN_RAY_REACH },
      ],
      wash: washRings(stage).at(-1) ?? 0,
    };
  }),
);

/** How far `point` is from the closed `outline`: 0 inside it. */
function distanceTo(outline: readonly Point[], point: Point): number {
  if (containsPoint(outline, point)) return 0;
  let least = Infinity;
  for (const [index, a] of outline.entries()) {
    const b = outline[(index + 1) % outline.length] ?? a;
    const length = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    const along =
      length === 0
        ? 0
        : ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) /
          length;
    const t = Math.min(1, Math.max(0, along));
    least = Math.min(
      least,
      Math.hypot(
        point.x - (a.x + t * (b.x - a.x)),
        point.y - (a.y + t * (b.y - a.y)),
      ),
    );
  }
  return least;
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
 * A standing mushroom as a pick weighs it: how it stands, its cap's box and
 * the box round all of it, and whether its door shows past the rest.
 */
type Weighed = {
  standing: Standing;
  cap: Box;
  whole: Box;
  /** Whether its door shows past the rest as they stood before the pick, read once. */
  shows: () => boolean;
};

function weighed(
  standing: Standing,
  among: () => readonly Standing[],
): Weighed {
  let shows: boolean | undefined;
  return {
    standing,
    cap: capBox(standing),
    whole: boxAround(standing.drawn.flat()),
    shows: () => (shows ??= doorShows(standing, among())),
  };
}

/**
 * Each of the meadow's mushrooms on each of `SCREENS`, weighed once however
 * many feet are tried beside them: the meadow's mushrooms are never changed
 * in place, only replaced.
 */
const standings = new WeakMap<readonly Planted[], Weighed[][]>();
function standingOn(mushrooms: readonly Planted[]): Weighed[][] {
  const known = standings.get(mushrooms);
  if (known) return known;
  const stood = SCREENS.map(({ stage }) => {
    const here: Weighed[] = [];
    const among = () => here.map(({ standing }) => standing);
    for (const mushroom of mushrooms) {
      const place = placeOf(stage.camera, mushroom.foot);
      here.push(weighed(standingAt(place, mushroom), among));
    }
    return here;
  });
  standings.set(mushrooms, stood);
  return stood;
}

/** A new mushroom as one screen stands it on a foot, and the screen's rules. */
type Trial = {
  screen: Screen;
  place: Placement;
  stood: Splayed;
  own: Standing;
};

/**
 * `grown` stood on `foot` on `screen`, where its foot, its cap and every
 * cap it stands among keep the cheap rules: its foot out of the sun's wash,
 * its cap inside the edge margin, and no cap hiding more than `MOST_HIDDEN`
 * of another's; `undefined` where one breaks.
 */
function trialOn(
  screen: Screen,
  foot: Ground,
  grown: Splayed,
  others: readonly Weighed[],
): Trial | undefined {
  const { camera, sun, width } = screen.stage;
  const place = placeOf(camera, foot);
  const away = Math.hypot(place.x - sun.x, place.y - sun.y);
  if (away < screen.wash + place.size * WASH_FOOT_CLEAR) return undefined;
  const own = standingAs(place, grown);
  const cap = capBox(own);
  if (cap.left < EDGE_MARGIN || cap.right > width - EDGE_MARGIN) {
    return undefined;
  }
  for (const other of others) {
    const [far, near] =
      other.standing.depth > own.depth ? [cap, other.cap] : [other.cap, cap];
    if (coverOf(far, near) > MOST_HIDDEN) return undefined;
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

/** What the next mushroom grows among: the mushrooms and flowers standing, and its own seed. */
export type Growing = {
  mushrooms: readonly Planted[];
  /** Every flower's foot on the ground. */
  flowers: readonly Ground[];
  seed: number;
};

/**
 * Where the mushroom grown from `seed` grows among `mushrooms` and
 * `flowers`, whichever species the child picks: `undefined` where the
 * meadow has no room left for one. Each foot is tried on the cheap rules on
 * every screen first, then the controls, then the doors.
 */
export function roomFor({
  mushrooms,
  flowers,
  seed,
}: Growing): Ground | undefined {
  const stood = standingOn(mushrooms);
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
    feet: mushrooms.map(({ foot }) => foot),
    admits: (foot) => {
      if (flowers.some((flower) => apartOnScreen(foot, flower) < FLOWER_APART))
        return false;
      const trials: Array<{ trial: Trial; others: readonly Weighed[] }> = [];
      for (const [index, screen] of SCREENS.entries()) {
        const others = stood[index] ?? [];
        const { splay } = placeOf(screen.stage.camera, foot);
        for (const genes of splays.get(splay) ?? []) {
          const trial = trialOn(screen, foot, genes, others);
          if (!trial) return false;
          trials.push({ trial, others });
        }
      }
      return (
        trials.every(({ trial }) =>
          keptOff(
            trial.stood,
            trial.own,
            trial.place.size,
            trial.screen.keepOff,
          ),
        ) && trials.every(({ trial, others }) => doorsKept(trial, others))
      );
    },
  });
}

/** Every flower standing in `stand`, seeded and planted, as its foot on the ground. */
export function flowersOnGround({
  layout,
  flowers,
  planted,
  mushrooms,
}: Stand): Ground[] {
  return standingFlowers(layout, flowers, planted, mushrooms).map(({ place }) =>
    groundAt(layout.camera, place),
  );
}
