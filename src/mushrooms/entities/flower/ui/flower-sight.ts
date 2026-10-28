/**
 * Whether a flower can be seen — by whatever sits on it, and by a child
 * looking for a flower a bee planted — and whether a flower planted on a foot
 * would be, as pure functions of the layout and what stands in it. A flower
 * in sight stands inside the world's edges by its sitter's wings, its head in
 * view past the occupants in front of it, wherever the crop stands: the
 * controls stand on the screen, not the world, so a pan never changes what is
 * in sight. The things standing among the flowers are occupants to them
 * (`Occupant`), whatever they are.
 */

import { keptIn } from '@/kernel/shared/cache';
import { pick } from '@/kernel/shared/lib/collections';
import type { WithHeight } from '@/kernel/shared/typings';

import {
  boxAround,
  boxesMeet,
  type Circle,
  containsPoint,
} from '@/mushrooms/shared/lib/geometry';
import { tapReach } from '@/mushrooms/shared/lib/tap-reach';
import {
  flowersCrowdAt,
  type HeadReach,
  type Lifting,
  type MushroomGround,
  type Occupant,
  type Occupied,
  type Occupying,
  type Sitter,
} from '@/mushrooms/shared/meadow';
import {
  type Camera,
  type Footing,
  middleOf,
  pinholeOf,
  standingOn,
  type Stood,
  type WithLayout,
} from '@/mushrooms/shared/space';

import {
  type Flower,
  FLOWER_RANGES,
  flowerGenes,
  flowerHead,
  type WithPulled,
} from '../model/flower-genes';
import type { WithPlanted } from '../model/planted-flowers';
import { FLOWER_SWAY } from './flower-layout';
import {
  type FlowerPlotsLayout,
  flowersOf,
  groundFor,
  occupantsOf,
  type Placed,
  type StandingFlower,
} from './flower-plots';

export type FlowerSightLayout = WithHeight & FlowerPlotsLayout;

/**
 * How far off a cap's crown toward its rims, or off a flower's centre toward
 * its petals' tips, a butterfly sits at the most, its phase picking where, so
 * not every one lands dead centre.
 */
export const PERCH_SPREAD = 0.3;
/**
 * How much of a flower's head, out from its centre as a share of its reach,
 * has to show past the occupants in front of it, and at how many points
 * round it that is read, beside the centre.
 */
const HEAD_SHOWN = 0.5;
const HEAD_RING = 8;

/** The layout and the visit's seeded flowers on it. */
export type SeededLayout<L = FlowerSightLayout> = WithLayout<L> & {
  flowers: readonly Flower[];
};

/**
 * The meadow as the scene stands it: the layout, the visit's seeded flowers,
 * the planted ones and the ones the child pulled up, and the things standing
 * among them, with how they occupy the ground (`Occupying`); generic in the
 * layout, which the scene reads more of than the sight does, and in the
 * things, which the flowers know only as occupants.
 */
export type Stand<
  L = FlowerSightLayout,
  Thing extends Stood = Stood,
> = SeededLayout<L> &
  WithPlanted &
  WithPulled &
  Occupied<Thing> & { occupying: Occupying<Thing> };

/** `meadow` as it stands on `layout` among the visit's seeded `flowers`, its things occupying the ground as `occupying` says. */
export function standOf<L extends FlowerSightLayout, Thing extends Stood>(
  layout: L,
  flowers: readonly Flower[],
  meadow: WithPlanted & WithPulled & Occupied<Thing>,
  occupying: Occupying<Thing>,
): Stand<L, Thing> {
  return {
    layout,
    flowers,
    ...pick(meadow, 'mushrooms', 'planted', 'pulled'),
    occupying,
  };
}

/**
 * A flower as the sight reads it: its place, its head on screen, and how far
 * over the head's middle what it is read for sits (`Lifting`).
 */
export type Sighting = Placed & { head: Circle; lift: number };

/** A standing flower's head on screen, and how far it and its centre reach (`HeadReach`). */
function headAt({ place, seed }: StandingFlower): {
  head: Circle;
  reach: HeadReach;
} {
  const genes = flowerGenes({ seed });
  const head = flowerHead(genes, place.size);
  return {
    head: { ...head, x: place.x + head.x, y: place.y + head.y },
    reach: { ...pick(head, 'r'), disc: genes.centre * place.size },
  };
}

/** A standing flower's head on screen. */
export function headOf(standing: StandingFlower): Circle {
  return headAt(standing).head;
}

/** A standing flower as the sight reads it for a sitter lifted by `lift` (`Sighting`). */
export function sightingOf(standing: StandingFlower, lift: Lifting): Sighting {
  const { head, reach } = headAt(standing);
  return { ...pick(standing, 'place'), head, lift: lift(reach) };
}

/**
 * A flower to be planted at `place` as it could grow, whatever its genes:
 * its stem bent either way or not at all, its head and its centre at their
 * smallest and largest, `sitter` on it.
 */
function sightingsAt(place: Footing, { lift }: Sitter): Sighting[] {
  const [least, most] = FLOWER_RANGES.stemBend;
  return [least, 0, most].flatMap((bend) =>
    FLOWER_RANGES.petalLength.flatMap((petal) =>
      FLOWER_RANGES.centre.map((centre) => ({
        place,
        head: {
          x: place.x + bend * place.size,
          y: place.y - place.size,
          r: petal * place.size,
        },
        lift: lift({ r: petal * place.size, disc: centre * place.size }),
      })),
    ),
  );
}

/**
 * A store made once per ground (`MushroomGround`): what the sight keeps reads
 * off a layout only its camera and the screen it draws, which the ground
 * holds, and its anchor, which the ground is a new object for
 * (`anchoredGround`). Keyed by the ground rather than the layout, it holds
 * across an anchored stand's layouts, which are made afresh.
 */
function perGround<Store extends object>(
  make: () => Store,
): (layout: FlowerSightLayout) => Store {
  const stores = new WeakMap<MushroomGround, Store>();
  return ({ mushrooms }) => keptIn(stores, mushrooms, make);
}

/** How far round its head's middle a flower whose petals reach `r` answers a tap: a little past them, and never under `TAP_RADIUS`. */
export function flowerTapReach(r: number): number {
  return tapReach(r * 1.2);
}

/**
 * Whether what sits on `flower` can be seen there, on `layout`: its seat
 * (`Sighting`), as far as the sway and its spot move it, stands inside the
 * world's edges by half `span`, its widest wingspan, and no occupant of
 * `occupants` standing nearer the front covers the head's middle
 * (`HEAD_SHOWN`).
 */
export function flowerInSight(
  layout: FlowerSightLayout,
  { place, head, lift }: Sighting,
  occupants: readonly Occupant[],
  span: number,
): boolean {
  const centre = pick(head, 'x', 'y');
  const seat = { ...centre, y: centre.y - lift };
  const reach =
    span / 2 +
    PERCH_SPREAD * head.r +
    (place.size + lift) * Math.sin(FLOWER_SWAY);
  const { camera, height } = layout;
  const inWorld =
    seat.x - reach >= 0 &&
    seat.x + reach <= camera.world &&
    seat.y - reach >= 0 &&
    seat.y + reach <= height;
  if (!inWorld) return false;
  const points = [
    centre,
    ...Array.from({ length: HEAD_RING }, (_, step) => {
      const angle = (step * Math.PI * 2) / HEAD_RING;
      return {
        x: centre.x + HEAD_SHOWN * head.r * Math.cos(angle),
        y: centre.y + HEAD_SHOWN * head.r * Math.sin(angle),
      };
    }),
  ];
  const headBox = boxAround(points);
  return occupants.every(
    ({ cover: { depth, drawn } }) =>
      depth <= place.y ||
      drawn.every(
        ({ outline, box }) =>
          !boxesMeet(headBox, box) ||
          points.every((point) => !containsPoint(outline, point)),
      ),
  );
}

/**
 * The screen's sides, in world px across `camera`'s layout, as the opening
 * crop shows them: the screen is linear in azimuth and the layout its
 * tangent, so a thing stands on the screen just where it stands between them.
 */
export function screenSides(camera: Camera): Record<'left' | 'right', number> {
  const { x, focal } = pinholeOf(camera);
  const half = focal * Math.tan(x / focal);
  const middle = middleOf(camera);
  return { left: middle - half, right: middle + half };
}

/**
 * Whether `sighting`'s whole head, as far as the sway moves it, stands
 * between the screen's sides on `layout` (`screenSides`).
 */
function headOnScreen(
  { camera }: FlowerSightLayout,
  { place, head }: Sighting,
): boolean {
  const { left, right } = screenSides(camera);
  const reach = head.r + place.size * Math.sin(FLOWER_SWAY);
  return head.x - reach >= left && head.x + reach <= right;
}

/** The flowers standing where a flower is planted, and every foot on the ground a planting keeps off. */
export type PlantingGround = {
  standing: readonly StandingFlower[];
  claimed: readonly Footing[];
};

/** The flowers standing in `stand`, and its occupants' feet a planting keeps off. */
export function plantingGroundIn<
  L extends FlowerSightLayout,
  Thing extends Stood,
>(stand: Stand<L, Thing>): PlantingGround {
  return {
    standing: flowersOf(stand),
    claimed: occupantsOf(stand).map(({ foot }) => foot),
  };
}

/**
 * Whether a flower planted at `foot` would have ground there among the
 * flowers of `standing`, off every foot of `claimed` (`groundFor`), and be
 * in sight on `layout` past `occupants` with `sitter` on it (`sightAt`),
 * whatever its genes, and fewer than `FLOWER_SLOTS` of `standing` stand round
 * it (`flowersCrowdAt`).
 */
export function plantable(
  layout: FlowerSightLayout,
  foot: Footing,
  { standing, claimed }: PlantingGround,
  occupants: readonly Occupant[],
  sitter: Sitter,
): boolean {
  return (
    !flowersCrowdAt(standing, foot) &&
    groundFor(foot, standing, claimed) &&
    sightAt(layout, occupants, foot, sitter).inSight
  );
}

/** How a flower planted on a foot would be seen, whatever its genes: in sight past the occupants (`flowerInSight`), and its head whole on the screen (`headOnScreen`). */
type FootSight = Record<'inSight' | 'onScreen', boolean>;

/** Each ground's `FootSight`s, by the occupants judged against, the sitter and the foot. */
const footSights = perGround(
  () =>
    new WeakMap<readonly Occupant[], WeakMap<Sitter, Map<string, FootSight>>>(),
);

/**
 * How a flower planted at `foot` on `layout` would be seen among `occupants`
 * with `sitter` on it, judged once a foot: what it reads is the layout, the
 * occupants, the sitter and the foot alone, and a sow re-judges the same ring
 * slots round every flower that still has room, each of them testing every
 * sighting against every occupant's outline.
 */
export function sightAt(
  layout: FlowerSightLayout,
  occupants: readonly Occupant[],
  foot: Footing,
  sitter: Sitter,
): FootSight {
  const bySitter = keptIn(
    footSights(layout),
    occupants,
    () => new WeakMap<Sitter, Map<string, FootSight>>(),
  );
  const known = keptIn(bySitter, sitter, () => new Map<string, FootSight>());
  const key = `${String(foot.x)} ${String(foot.y)} ${String(foot.size)}`;
  return keptIn(known, key, () => {
    const sightings = sightingsAt(standingOn(layout.camera, foot), sitter);
    return {
      inSight: sightings.every((sighting) =>
        flowerInSight(layout, sighting, occupants, sitter.span),
      ),
      onScreen: sightings.every((sighting) => headOnScreen(layout, sighting)),
    };
  });
}
