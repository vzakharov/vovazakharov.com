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
  boxAround,
  type Circle,
  containsPoint,
  type Point,
} from '../../model/geometry';
import { type Ground, groundAt } from '../../model/ground';
import {
  MUSHROOM_SPECIES,
  type MushroomGenes,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { TAP_PARTS, tapArea, toCanvas } from '../../model/mushroom-outline';
import { apartOnScreen, pickFoot } from '../../model/placement';
import { capBox, coverOf, MOST_HIDDEN } from './cap-cover';
import { placeOf } from './clump-layout';
import {
  doorInSight,
  IN_SIGHT,
  sightOf,
  type Standing,
  standingAt,
  standingWith,
} from './door-sight';
import { standingFlowers } from './flower-plots';
import type { Stand } from './flower-sight';
import { EDGE_MARGIN, meadowStage } from './layout';
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
 * `others`, painted door and doorway alike, where `doorInSight` seats it.
 */
function doorShows(standing: Standing, others: readonly Standing[]): boolean {
  const nearer = others.filter(({ depth }) => depth > standing.depth);
  const station = doorInSight(standing, others);
  return (['painted', 'doorway'] as const).every(
    (part) => sightOf(standing, station, part, nearer) >= IN_SIGHT,
  );
}

/**
 * Whether every one of `circles` keeps off `standing`'s tap area as it
 * stands on screen: its drawn parts, and its finger pad where it has one.
 */
function keptOff(
  { genes, turn, placed }: Standing,
  size: number,
  circles: readonly Circle[],
): boolean {
  const area = tapArea(genes, turn);
  const canvas = toCanvas(size);
  const pad = fingerPad({
    cap: area.cap.map((point) => canvas(point)),
    gills: area.gills.map((point) => canvas(point)),
    stem: area.stem.map((point) => canvas(point)),
  });
  const [middle] = pad ? placed([{ x: pad.x / size, y: -pad.y / size }]) : [];
  const padded = middle && pad && { middle, reach: pad.r };
  const outlines = TAP_PARTS.map((part) => {
    const outline = placed(area[part]);
    return { outline, box: boxAround(outline) };
  });
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

/** A standing mushroom as a pick weighs it: how it stands, and its cap's box. */
type Weighed = { standing: Standing; cap: ReturnType<typeof capBox> };

const weighed = (standing: Standing): Weighed => ({
  standing,
  cap: capBox(standing),
});

/**
 * Each of the meadow's mushrooms on each of `SCREENS`, weighed once however
 * many feet are tried beside them: the meadow's mushrooms are never changed
 * in place, only replaced.
 */
const standings = new WeakMap<readonly Planted[], Weighed[][]>();
function standingOn(mushrooms: readonly Planted[]): Weighed[][] {
  const known = standings.get(mushrooms);
  if (known) return known;
  const stood = SCREENS.map(({ stage }) =>
    mushrooms.map((mushroom) =>
      weighed(standingAt(placeOf(stage.camera, mushroom.foot), mushroom)),
    ),
  );
  standings.set(mushrooms, stood);
  return stood;
}

/**
 * Whether `grown` stands on `foot` on `screen` as the meadow's rules allow,
 * among `others` standing there.
 */
function fitsOn(
  screen: Screen,
  foot: Ground,
  grown: MushroomGenes,
  others: readonly Weighed[],
): boolean {
  const { stage, keepOff, wash } = screen;
  const { camera, sun, width } = stage;
  const place = placeOf(camera, foot);
  if (
    Math.hypot(place.x - sun.x, place.y - sun.y) <
    wash + place.size * WASH_FOOT_CLEAR
  ) {
    return false;
  }
  const own = standingWith(place, grown);
  const cap = capBox(own);
  if (cap.left < EDGE_MARGIN || cap.right > width - EDGE_MARGIN) {
    return false;
  }
  for (const other of others) {
    const [far, near] =
      other.standing.depth > own.depth ? [cap, other.cap] : [other.cap, cap];
    if (coverOf(far, near) > MOST_HIDDEN) return false;
  }
  if (!keptOff(own, place.size, keepOff)) return false;
  const before = others.map(({ standing }) => standing);
  const after = [...before, own];
  if (!doorShows(own, after)) return false;
  // A door already out of sight is not this one's to hide.
  return before.every(
    (standing) =>
      standing.depth >= own.depth ||
      doorShows(standing, after) ||
      !doorShows(standing, before),
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
 * meadow has no room left for one.
 */
export function roomFor({
  mushrooms,
  flowers,
  seed,
}: Growing): Ground | undefined {
  const stood = standingOn(mushrooms);
  const genes = MUSHROOM_SPECIES.map((species) =>
    mushroomGenes({ seed, species }),
  );
  return pickFoot(seed, {
    feet: mushrooms.map(({ foot }) => foot),
    admits: (foot) =>
      flowers.every((flower) => apartOnScreen(foot, flower) >= FLOWER_APART) &&
      SCREENS.every((screen, index) =>
        genes.every((grown) => fitsOn(screen, foot, grown, stood[index] ?? [])),
      ),
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
