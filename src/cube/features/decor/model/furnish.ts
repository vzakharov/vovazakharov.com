import { pathHash, roll, type Rolled, rollWith } from '@/dice/shared/roll';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { type Furnishing, type Thing, THINGS } from '@/cube/shared/lib/thing';
import { scaled } from '@/cube/shared/lib/vec';
import type { Box } from '@/cube/shared/outside';
import {
  type Quad,
  type Setting,
  type Vec3,
  WALL_HALF,
} from '@/cube/entities/world';

import { RECIPES } from '../config/recipes';
import { spun } from '../lib/spin';
import { type Recipe, toolsFor } from '../lib/tools';
import {
  type Bounds,
  boundsOf,
  clearZones,
  crowds,
  hangs,
  HUNG,
  INSIDE,
  isClear,
  overlap,
  WALKWAY,
  within,
} from './clear';
import { partsOf } from './parts';

/** The most quads one thing is made of, and one room's things together. */
export const MOST_QUADS = { thing: 60, room: 250 };

/** How far off a wall's face what backs onto it sits. */
const OFF_WALL = 0.002;

/** How far from a closed side's edge a thing keeps, clear of the corner's pillar. */
const CORNER = 0.045;

/** How near two things may stand. */
const APART = 0.004;

/** How many places a thing is tried in before the room goes without it. */
const TRIES = 6;

const unitRoll = roll.uniform(0, 1);

/**
 * A room's draws, under its grain: whether it holds one more of a thing than
 * the whole part of `perRoom`, then for each one how it looks, how it is
 * turned, how far off the wall it stands, and the places it is tried in.
 */
const Decor = roll.struct({
  thing: roll.over(
    roll.key(THINGS),
    roll.struct({
      extra: unitRoll,
      item: roll.over(
        roll.key({ i: roll.int }),
        roll.struct({
          look: roll.over(roll.key({ k: roll.int }), unitRoll),
          turn: roll.uniform(-1, 1),
          gap: unitRoll,
          spot: roll.over(
            roll.key({ t: roll.int }),
            roll.struct({ side: unitRoll, along: unitRoll, end: unitRoll }),
          ),
        }),
      ),
    }),
  ),
});

type Mapping = (at: Vec3) => Vec3;

const carried = (
  quads: readonly Quad[],
  point: Mapping,
  direction: Mapping,
): Quad[] =>
  quads.map((quad) => {
    const [a, b, c, d] = quad.corners;
    return {
      ...quad,
      corners: [point(a), point(b), point(c), point(d)],
      normal: direction(quad.normal),
    };
  });

/** A thing's own frame turned by `angle` about the upright. */
const yawed = (angle: number): Mapping => {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  return ([x, y, z]) => [x * cos + z * sin, y, z * cos - x * sin];
};

/**
 * `quads` without the faces nobody can see: those lying on the floor, and,
 * of a thing `flush` to its wall, those of its back.
 */
const seen = (quads: readonly Quad[], flush: boolean): Quad[] =>
  quads.filter(({ corners, normal }) => {
    const lies = (axis: 1 | 2) =>
      normal[axis] < -0.99 && corners.every((corner) => corner[axis] < 1e-9);
    return !(lies(1) || (flush && lies(2)));
  });

/** One thing made in its own frame, and how far off its wall it stands. */
type Made = { quads: Quad[]; off: number };

type Draw = ReturnType<
  ReturnType<Rolled<typeof Decor>['thing']['at']>['item']['at']
>;

function make(setting: Setting, recipe: Recipe, draw: Draw): Made {
  const built = recipe.build(toolsFor(setting.room), (k) =>
    draw.look.at({ k }),
  );
  const flush = recipe.gap === undefined && recipe.turn === undefined;
  const turn = yawed((recipe.turn ?? 0) * draw.turn);
  const [least, most] = recipe.gap ?? [0, 0];
  return {
    quads: carried(seen(built, flush), turn, turn),
    off: OFF_WALL + (least + draw.gap * (most - least)) / ROOM_METRES,
  };
}

/** The point `share` of the way through `runs` laid end to end; null for none. */
function along(
  runs: ReadonlyArray<readonly [number, number]>,
  share: number,
): number | null {
  const whole = runs.reduce((sum, [first, last]) => sum + last - first, 0);
  let left = share * whole;
  for (const [first, last] of runs) {
    if (left <= last - first) return first + left;
    left -= last - first;
  }
  return runs.at(-1)?.[1] ?? null;
}

/** `made` stood in the room where try `t` puts it, or null where it cannot go. */
function stood(
  { closed }: Setting,
  { quads, off }: Made,
  cornered: boolean,
  spot: ReturnType<Draw['spot']['at']>,
  t: number,
): Quad[] | null {
  const sides = closed.flatMap((isClosed, side) => (isClosed ? [side] : []));
  const side = sides[Math.floor(spot.side * sides.length)];
  if (side === undefined) return null;
  // Along the east wall southwards, the north side is behind and the south
  // ahead; every other wall is that one turned.
  const shut = (neighbour: number) => closed[(side + neighbour) % 4] === true;
  const margin = (neighbour: number) => (shut(neighbour) ? CORNER : WALKWAY);
  const own = boundsOf(quads);
  const wide = own.most[0] - own.least[0];
  const [from, to] = [margin(3), 1 - margin(1) - wide];
  // Whatever of it is as high as the wall's signs stays out of their third.
  const high = quads.filter((quad) => {
    const { least, most } = boundsOf([quad]);
    return most[1] > HUNG.from + 1e-9 && least[1] < HUNG.to - 1e-9;
  });
  const hung = high.length === 0 ? null : boundsOf(high);
  const runs = (
    hung === null
      ? [[from, to] as const]
      : [
          [
            from,
            Math.min(to, HUNG.least - (hung.most[0] - own.least[0])),
          ] as const,
          [
            Math.max(from, HUNG.most - (hung.least[0] - own.least[0])),
            to,
          ] as const,
        ]
  ).filter(([first, last]) => first <= last);
  const ends = [
    ...(shut(3) ? [runs.at(0)?.[0]] : []),
    ...(shut(1) ? [runs.at(-1)?.[1]] : []),
  ];
  const corner = ends[Math.floor(spot.end * ends.length)];
  const start =
    cornered && t < 2 && corner !== undefined
      ? corner
      : along(runs, spot.along);
  if (start === null) return null;
  const about = spun(side, 0.5);
  return carried(
    quads,
    ([x, y, z]) =>
      about([
        1 - WALL_HALF - off - (z - own.least[2]),
        y,
        start + (x - own.least[0]),
      ]),
    ([x, y, z]) => spun(side, 0)([-z, y, x]),
  );
}

/**
 * What stands in `setting`'s room, in the room's frame: `perRoom` of each of
 * `decor` on average, against its closed walls and in its corners, clear of
 * each other and of `clearZones`, nothing hung where something stands. The same setting gives the same room.
 */
export const furnish = (
  setting: Setting,
  decor: Parameters<typeof furnished>[1],
): Quad[] => furnished(setting, decor).flat();

/** `furnish`'s room, thing by thing. */
export function furnished(
  setting: Setting,
  decor: readonly Furnishing[],
): Quad[][] {
  return stoodIn(setting, decor).map(({ quads }) => quads);
}

/**
 * The box of each thing of `furnish`'s room that stands on the floor, in the
 * room's frame in metres — east, up, south — in the order they were stood.
 */
export const standingBoxes = (
  setting: Setting,
  decor: readonly Furnishing[],
): Array<{ thing: Thing; min: Vec3; max: Vec3 }> =>
  stoodIn(setting, decor)
    .map(({ thing, quads }) => ({ thing, bounds: boundsOf(quads) }))
    .filter(({ bounds }) => !hangs(bounds))
    .map(({ thing, bounds: { least, most } }) => ({
      thing,
      min: scaled(least, ROOM_METRES),
      max: scaled(most, ROOM_METRES),
    }));

/**
 * `standingBoxes`'s things as the solids each is built of, `partsOf` them,
 * in the room's frame in metres.
 */
export const standingParts = (
  setting: Setting,
  decor: readonly Furnishing[],
): Array<{ thing: Thing; parts: Box[] }> =>
  stoodIn(setting, decor)
    .filter(({ quads }) => !hangs(boundsOf(quads)))
    .map(({ thing, quads }) => ({
      thing,
      parts: partsOf(quads).map(({ least, most }) => ({
        min: scaled(least, ROOM_METRES),
        max: scaled(most, ROOM_METRES),
      })),
    }));

/** `furnish`'s room as each thing was stood, by name. */
function stoodIn(
  setting: Setting,
  decor: readonly Furnishing[],
): Array<{ thing: Thing; quads: Quad[] }> {
  const rolled = rollWith(Decor, pathHash(String(setting.grain)));
  const zones = clearZones(setting);
  const taken: Bounds[] = [];
  const room: Array<{ thing: Thing; quads: Quad[] }> = [];
  let quads = 0;
  for (const { thing, perRoom } of decor) {
    const recipe = RECIPES[thing];
    const draws = rolled.thing.at(thing);
    const count = Math.floor(perRoom) + (draws.extra < perRoom % 1 ? 1 : 0);
    for (let i = 0; i < count; i += 1) {
      const draw = draws.item.at({ i });
      const made = make(setting, recipe, draw);
      if (quads + made.quads.length > MOST_QUADS.room) continue;
      for (let t = 0; t < TRIES; t += 1) {
        const placed = stood(
          setting,
          made,
          recipe.cornered === true,
          draw.spot.at({ t }),
          t,
        );
        if (placed === null) continue;
        const bounds = boundsOf(placed);
        if (
          within(bounds, INSIDE) &&
          placed.every((quad) => isClear(boundsOf([quad]), zones)) &&
          !taken.some(
            (other) => overlap(bounds, other, APART) || crowds(bounds, other),
          )
        ) {
          taken.push(bounds);
          room.push({ thing, quads: placed });
          quads += placed.length;
          break;
        }
      }
    }
  }
  return room;
}
