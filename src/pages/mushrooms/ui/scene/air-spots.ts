/**
 * The spots in the open air a roaming insect flies between: the cells of a
 * square lattice on the plane, offered round the eye the perches are judged
 * from, so the air walks and turns with the child. Each cell is named by its
 * place in the lattice and keeps its own height, so walking never renames or
 * moves a spot; only which spots are offered changes.
 */

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import {
  type Crowding,
  perchName,
  type Place,
  type Places,
} from '../../model/flight';
import { type Aloft, azimuthOf } from '../../model/flight-frame';
import { distanceBetween, type Point, wrap } from '../../model/geometry';
import {
  anchored,
  type Camera,
  CLUMP_DISTANCE,
  type Eye,
  OPENING_EYE,
  project,
} from '../../model/ground';
import { INSECT_KINDS, type InsectKind } from '../../model/insect-genes';
import { INSECT_LIMITS } from '../../model/insects';
import { mulberry32 } from '../../model/random';
import type { MeadowLayout } from './layout';
import { pointCrowdings } from './perch-crowding';
import { placeOfAloft } from './plane-place';
import { rowAt, viewAt } from './view';
import { widestOn } from './widest-spans';

/** How far the open air reaches down over the back of the ground, as a share of the ground's depth. */
export const AIR_BELOW = 0.15;

/** How far from the eye, in the clump's size, the farthest spot in the air stands: the far side of the opening's air. */
export const AIR_FAR = 10.6;

/** How far, in radians, either side of the eye's heading the air is offered. */
export const AIR_WEDGE = 1.2;

/** Every insect the meadow can hold. */
export const EVERY_ONE: readonly InsectKind[] = INSECT_KINDS.flatMap((kind) =>
  Array.from({ length: INSECT_LIMITS[kind] }, () => kind),
);

/** What of a layout the air is laid by: the insects' sizes are the camera's. */
type AirLaid = Pick<MeadowLayout, 'camera' | 'insectSize' | 'insectSizes'>;

/** One spot in the air: its id, where on the layout's screen it is drawn, and where in the world it stands. */
type Spot = Named & Pick<Place, 'x' | 'y' | 'fromEye'> & { aloft: Aloft };

/**
 * The air offered round an eye: its spots by id where the eye's anchored
 * layout draws them, each in the world (`alofts`) and as a `Place`, and
 * every two of them on which two insects of their kinds would overlap at all.
 */
export type Air = {
  spots: ReadonlyArray<WithId & Point>;
  alofts: ReadonlyMap<string, Aloft>;
  places: Places;
  aloft: readonly Crowding[];
};

/** The lattice the air is laid on, one per camera: its pitch on the plane, and the band of heights its spots keep. */
type Lattice = { pitch: number; low: number; high: number };

/** The row the opening clump stands on, in world px: what an insect in the air was laid out standing over. */
export function clumpRow(camera: Camera): number {
  return project(camera, { x: 0, z: 0 }).y;
}

/**
 * Whether `spots` seat every insect the meadow can hold at once, each clear
 * of the others by their kinds' widest spans, taken widest first.
 */
function seatsEveryOne(laid: AirLaid, spots: readonly Point[]): boolean {
  const spans = EVERY_ONE.map((kind) => widestOn(laid, kind)).toSorted(
    (a, b) => b - a,
  );
  const held: Array<Point & { span: number }> = [];
  return spans.every((span) => {
    const spot = spots.find(({ x, y }) =>
      held.every(
        (other) =>
          Math.hypot(x - other.x, y - other.y) >= (span + other.span) / 2,
      ),
    );
    if (spot) held.push({ ...pick(spot, 'x', 'y'), span });
    return spot !== undefined;
  });
}

const lattices = new WeakMap<Camera, Lattice>();

/**
 * The lattice the air is laid on for `laid`'s camera: one narrowest kind's
 * widest span apart where the clump stands, or half that where the coarser
 * lattice offers the opening eye too few spots to seat every insect the
 * meadow can hold clear of each other (`seatsEveryOne`); its heights the band
 * from where a butterfly's widest wings stay under the world's top down over
 * the back of the ground by `AIR_BELOW`, as over the clump's row.
 */
function latticeOf(laid: AirLaid): Lattice {
  const { camera } = laid;
  const known = lattices.get(camera);
  if (known) return known;
  const row = clumpRow(camera);
  const { perPx } = rowAt(camera, row);
  const half = widestOn(laid, 'butterfly') / 2;
  const bottom = Math.max(half, camera.groundTop + AIR_BELOW * camera.ground);
  const band = { low: (row - bottom) * perPx, high: (row - half) * perPx };
  const narrowest = Math.min(
    ...INSECT_KINDS.map((kind) => widestOn(laid, kind)),
  );
  const coarse = { ...band, pitch: narrowest / camera.unit };
  const opening = spotsAt(
    laid,
    coarse,
    OPENING_EYE,
    new Map<number, Map<number, Named>>(),
  );
  const lattice = seatsEveryOne(laid, opening)
    ? coarse
    : { ...band, pitch: coarse.pitch / 2 };
  lattices.set(camera, lattice);
  return lattice;
}

/** The share of its band a cell's height stands at, from the cell alone. */
function heightShare(column: number, row: number): number {
  const seed = Math.imul(column, 0x9e_37_79_b1) ^ Math.imul(row, 0x85_eb_ca_77);
  return mulberry32(seed)();
}

/** The cell of `lattice` at `column` and `row` as a fixed point in the world. */
function cellAloft(lattice: Lattice, column: number, row: number): Aloft {
  const { pitch, low, high } = lattice;
  const h = low + (high - low) * heightShare(column, row);
  return { x: column * pitch, y: row * pitch, h };
}

/** A cell's id, and its name as a perch (`perchName`). */
type Named = { id: string; name: string };

/** The names of a cell, by column, then row. */
type Names = Map<number, Map<number, Named>>;

function namesOf(column: number, row: number): Named {
  const id = `air-${String(column)}-${String(row)}`;
  return { id, name: perchName({ kind: 'air', id }) };
}

/**
 * The id and perch name of the cell at `column` and `row`, the very strings
 * `known` holds for it where it does, entered in `kept`. A fresh string keying
 * `Places` costs its interning each time, several times all the rest of
 * `airOf` together; the strings kept from the last anchor are interned already.
 */
function namedCell(
  known: Names,
  kept: Names,
  column: number,
  row: number,
): Named {
  const named = known.get(column)?.get(row) ?? namesOf(column, row);
  const rows = kept.get(column) ?? new Map<number, Named>();
  kept.set(column, rows);
  rows.set(row, named);
  return named;
}

/**
 * The cells of `lattice` offered round `anchor`: those `CLUMP_DISTANCE` to
 * `AIR_FAR` from it within `AIR_WEDGE` of its heading, where the anchored
 * layout draws them a butterfly's widest wings inside the world, named as
 * `known` names them where it does (`namedCell`), entered in `kept`.
 */
function spotsAt(
  laid: AirLaid,
  lattice: Lattice,
  anchor: Eye,
  known: Names,
  kept: Names = new Map(),
): Spot[] {
  const { camera } = laid;
  const view = viewAt(camera, OPENING_EYE);
  const half = widestOn(laid, 'butterfly') / 2;
  const { pitch } = lattice;
  const cells = (at: number) => ({
    from: Math.floor((at - AIR_FAR) / pitch),
    to: Math.ceil((at + AIR_FAR) / pitch),
  });
  const [across, along] = [cells(anchor.x), cells(anchor.y)];
  const spots: Spot[] = [];
  for (let column = across.from; column <= across.to; column++) {
    for (let row = along.from; row <= along.to; row++) {
      const centre = { x: column * pitch, y: row * pitch };
      const distance = distanceBetween(anchor, centre);
      if (distance < CLUMP_DISTANCE || distance > AIR_FAR) continue;
      const turned = wrap(azimuthOf(anchor, centre) - anchor.heading);
      if (Math.abs(turned) > AIR_WEDGE) continue;
      const aloft = cellAloft(lattice, column, row);
      const seen = { ...aloft, ...anchored(anchor, aloft) };
      const { x, y, fromEye } = placeOfAloft(view, 1, seen);
      if (x < half || x > camera.world - half || y < half) continue;
      const named = namedCell(known, kept, column, row);
      spots.push({ ...named, x, y, fromEye, aloft });
    }
  }
  return spots;
}

/** The air offered round each of the last few anchors, by camera. */
const offered = new WeakMap<Camera, Map<string, Air>>();
/** The names of the cells offered round the last anchor each camera's air was laid at. */
const lastNamed = new WeakMap<Camera, Names>();
/** How many anchors' air each camera keeps. */
const KEPT = 8;

/**
 * The air `laid` offers round `anchor`: the spots in the open air a roaming
 * insect flies between (the lattice's cells round the eye, `spotsAt`) each
 * where the layout anchored at `anchor` draws it, in the world and as the
 * `Place` a leg to it is timed by in that layout's frame, and every two of
 * them on which two insects of their kinds would overlap where that layout
 * draws them, so hovering insects never overlap as the eye judges them.
 */
export function airOf(laid: AirLaid, anchor: Eye = OPENING_EYE): Air {
  const { camera, insectSize: unit } = laid;
  const known = offered.get(camera) ?? new Map<string, Air>();
  offered.set(camera, known);
  const key = `${String(anchor.x)} ${String(anchor.y)} ${String(anchor.heading)}`;
  const laidBefore = known.get(key);
  if (laidBefore) return laidBefore;
  const named: Names = new Map();
  const spots = spotsAt(
    laid,
    latticeOf(laid),
    anchor,
    lastNamed.get(camera) ?? new Map<number, Map<number, Named>>(),
    named,
  );
  lastNamed.set(camera, named);
  const crowded = pointCrowdings(
    spots.map((spot) => ({
      perch: { kind: 'air', ...pick(spot, 'id') } as const,
      ...pick(spot, 'x', 'y'),
    })),
    (first, second) => (widestOn(laid, first) + widestOn(laid, second)) / 2,
  );
  // Entered one by one: `Object.fromEntries` and spreads cost several times
  // as much on as many keys never seen before, as most are a step later.
  const places: Record<string, Place> = {};
  for (const { name, x, y, fromEye } of spots) {
    places[name] = { x: x / unit, y: y / unit, fromEye };
  }
  const air: Air = {
    spots: spots.map((spot) => pick(spot, 'id', 'x', 'y')),
    alofts: new Map(spots.map(({ id, aloft }) => [id, aloft])),
    places,
    aloft: crowded,
  };
  if (known.size >= KEPT) {
    const [oldest] = known.keys();
    if (oldest !== undefined) known.delete(oldest);
  }
  known.set(key, air);
  return air;
}

/** The spots in the open air `laid` offers round `anchor` (`airOf`), where the layout anchored at `anchor` draws each. */
export function airSpots(
  laid: AirLaid,
  anchor: Eye = OPENING_EYE,
): ReadonlyArray<WithId & Point> {
  return airOf(laid, anchor).spots;
}

/** Each spot in the open air `laid` offers round `anchor` (`airOf`) as a fixed point in the world, by id. */
export function airAlofts(
  laid: AirLaid,
  anchor: Eye = OPENING_EYE,
): ReadonlyMap<string, Aloft> {
  return airOf(laid, anchor).alofts;
}

/**
 * The spot in the open air named `id` as a fixed point in the world, offered
 * round any eye or none: where an insect still holding a spot the eye has
 * walked away from hovers.
 */
export function airAloftOf(laid: AirLaid, id: string): Aloft | undefined {
  const cell = /^air-(-?\d+)-(-?\d+)$/u.exec(id);
  if (!cell) return undefined;
  return cellAloft(latticeOf(laid), Number(cell[1]), Number(cell[2]));
}
