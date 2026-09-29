/**
 * Where on its stem a mushroom's door goes: at the lowest station the
 * mushrooms in front of it leave in sight, judged against every mushroom as
 * the scene stands and draws it on screen.
 */

import {
  type Box,
  boxAround,
  boxesMeet,
  containsPoint,
  placedAt,
  type Point,
} from '../../model/geometry';
import type { Layered } from '../../model/ground';
import {
  DOOR_ASPECT,
  type DoorPlace,
  doorStations,
  doorway,
  onStem,
  paintedDoor,
} from '../../model/house';
import {
  type MushroomGenes,
  mushroomGenes,
  type MushroomSeed,
} from '../../model/mushroom-genes';
import {
  capOutlines,
  stemOutline,
  toCanvas,
} from '../../model/mushroom-outline';
import { type Splayed, splayed } from '../../model/mushroom-pose';
import type { Placement } from './layout';

/** How much of a painted door, and of its doorway, has to show past the mushrooms in front of it. */
export const IN_SIGHT = 0.8;
/** How many points across a door its sight is read at; down it, as many more as it is taller. */
const SIGHT_STEPS = 8;

/** A mushroom as the scene stands it in its slot. */
export type Standing = Splayed &
  Layered & {
    /** An outline in the mushroom's own frame, where it stands on screen. */
    placed: (outline: readonly Point[]) => Point[];
    /** Its dome, gills and stem as drawn, on screen. */
    drawn: readonly Point[][];
  };

export function standingAt(place: Placement, seeded: MushroomSeed): Standing {
  return standingWith(place, mushroomGenes(seeded));
}

/** A mushroom of `grown` as the scene stands it where it grows (`standingAt`). */
export function standingWith(place: Placement, grown: MushroomGenes): Standing {
  return standingAs(place, splayed(grown, place.splay));
}

/** Each stood mushroom's dome, gills and stem in its own frame, drawn once however often it is stood. */
const figures = new WeakMap<Splayed, readonly Point[][]>();

/**
 * A mushroom `stood` as `place` splays it, as the scene stands it there
 * (`standingWith`): one `stood` stood in many places draws its outlines once.
 */
export function standingAs(place: Placement, stood: Splayed): Standing {
  const { genes, turn } = stood;
  const figure = figures.get(stood) ?? [
    ...capOutlines(genes),
    stemOutline(genes, turn),
  ];
  figures.set(stood, figure);
  const canvas = toCanvas(place.size);
  const placed = (outline: readonly Point[]) =>
    outline.map((point) => placedAt(place, turn, canvas(point)));
  return {
    depth: place.y,
    genes,
    turn,
    placed,
    drawn: figure.map((outline) => placed(outline)),
  };
}

/** Points evenly spread over the closed `outline`, as a grid its box holds. */
function spreadOver(outline: readonly Point[]): Point[] {
  const { left, right, top, bottom } = boxAround(outline);
  const step = (right - left) / SIGHT_STEPS;
  const points: Point[] = [];
  for (let x = left + step / 2; x < right; x += step) {
    for (let y = top + step / 2; y < bottom; y += step) {
      if (containsPoint(outline, { x, y })) points.push({ x, y });
    }
  }
  return points;
}

/** The parts of a painted door whose sight counts: the whole of it, and the doorway it frames. */
const DOOR_PARTS = {
  painted: spreadOver(paintedDoor(DOOR_ASPECT)),
  doorway: spreadOver(doorway(DOOR_ASPECT)),
};
export type DoorPart = keyof typeof DOOR_PARTS;

/** Each drawn outline's box, read once however many doors it is tried against. */
const boxes = new WeakMap<readonly Point[], Box>();
function boxOf(outline: readonly Point[]): Box {
  const known = boxes.get(outline);
  if (known) return known;
  const box = boxAround(outline);
  boxes.set(outline, box);
  return box;
}

/**
 * How much of `part` of a door at `station` on `standing`'s stem shows past
 * the drawn outlines of `nearer`: from 0 to 1.
 */
export function sightOf(
  standing: Standing,
  station: DoorPlace,
  part: DoorPart,
  nearer: readonly Standing[],
): number {
  const spread = standing.placed(DOOR_PARTS[part].map(onStem(station)));
  const box = boxAround(spread);
  const covers = nearer
    .flatMap(({ drawn }) => drawn)
    .filter((cover) => boxesMeet(box, boxOf(cover)));
  const shown = spread.filter(
    (point) => !covers.some((cover) => containsPoint(cover, point)),
  );
  return shown.length / spread.length;
}

/** Each mushroom's door stations by its genes, laid out once: genes are never changed once grown. */
const stations = new WeakMap<MushroomGenes, Map<number, DoorPlace[]>>();
function stationsOf({ genes, turn }: Splayed): DoorPlace[] {
  const byTurn = stations.get(genes) ?? new Map<number, DoorPlace[]>();
  stations.set(genes, byTurn);
  const known = byTurn.get(turn) ?? doorStations(genes, turn);
  byTurn.set(turn, known);
  return known;
}

/**
 * The station `standing`'s door takes among `others` standing round it: the
 * lowest where `IN_SIGHT` of the painted door, and of the doorway it frames,
 * shows past every nearer one; or, where none does, the one the most of them
 * shows at.
 */
export function doorInSight(
  standing: Standing,
  others: readonly Standing[],
): DoorPlace {
  const nearer = others.filter(({ depth }) => depth > standing.depth);
  let most: { station: DoorPlace; sight: number } | undefined;
  for (const station of stationsOf(standing)) {
    const sight = Math.min(
      sightOf(standing, station, 'painted', nearer),
      sightOf(standing, station, 'doorway', nearer),
    );
    if (sight >= IN_SIGHT) return station;
    if (!most || sight > most.sight) most = { station, sight };
  }
  if (!most) throw new Error('A stem with no room for a door');
  return most.station;
}
