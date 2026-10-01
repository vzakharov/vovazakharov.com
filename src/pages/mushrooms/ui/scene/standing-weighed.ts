/**
 * The meadow's standing mushrooms as a new one is weighed against them:
 * each weighed once per meadow and layout, its door's sight and its parts'
 * read only when a tried foot comes near it; and whether the new one keeps
 * every door in sight (`doorInSight`) and every part, its own and theirs, in
 * view past `MOST_HIDDEN`.
 */

import type { Planted } from '../../model/game';
import { type Box, boxAround, boxesMeet } from '../../model/geometry';
import {
  type Among,
  amongAt,
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
import { placeOf } from './clump-layout';
import { doorInSight, IN_SIGHT, sightOf, type Standing } from './door-sight';
import type { MeadowLayout } from './layout';

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

/**
 * A standing mushroom as a pick weighs it: how it stands, whether it is one
 * of the opening clump, the box round all of it, and how its door and each
 * of its parts show past the rest as they stood before the pick, each read
 * once.
 */
export type Weighed = Among & {
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
 * Each of the meadow's mushrooms on `stage`, weighed once however many feet
 * are tried beside them, on whatever crop: the meadow's mushrooms are never
 * changed in place, only replaced.
 */
const standings = new WeakMap<
  readonly Planted[],
  WeakMap<MeadowLayout, Weighed[]>
>();
export function standingOn(
  mushrooms: readonly Planted[],
  stage: MeadowLayout,
): Weighed[] {
  const byStage = standings.get(mushrooms) ?? new WeakMap();
  standings.set(mushrooms, byStage);
  const known = byStage.get(stage);
  if (known) return known;
  const here: Weighed[] = [];
  for (const mushroom of mushrooms) {
    const place = placeOf(stage.camera, mushroom.foot);
    here.push(weighed(amongAt(place, mushroom), () => here));
  }
  byStage.set(stage, here);
  return here;
}

/** Those of `others` standing behind `own` whose box meets its own. */
function behind(own: Standing, others: readonly Weighed[]): Weighed[] {
  const whole = boxAround(own.drawn.flat());
  return others.filter(
    (other) =>
      other.standing.depth < own.depth && boxesMeet(whole, other.whole),
  );
}

/**
 * Whether `own`, standing among `others`, leaves every part of each in view
 * past `MOST_HIDDEN`: its own behind the nearer ones, and each of those it
 * stands in front of, unless it hides nothing more of that one than was
 * hidden already.
 */
export function partsInView(
  own: Standing,
  others: readonly Weighed[],
): boolean {
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
  return behind(own, others).every((other) => {
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
 * Whether `own`, newly grown, keeps every door in sight among `others`: its
 * own, and every one behind it that showed before it grew.
 */
export function doorsKept(own: Standing, others: readonly Weighed[]): boolean {
  const after = [...others.map(({ standing }) => standing), own];
  if (!doorShows(own, after)) return false;
  return behind(own, others).every(
    (other) => !other.shows() || doorShows(other.standing, after),
  );
}
