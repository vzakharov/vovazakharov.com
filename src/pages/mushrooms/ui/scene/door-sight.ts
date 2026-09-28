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
import {
  DOOR_ASPECT,
  type DoorPlace,
  doorStations,
  doorway,
  onStem,
  paintedDoor,
} from '../../model/house';
import { mushroomGenes, type MushroomSeed } from '../../model/mushroom-genes';
import {
  capOutlines,
  stemOutline,
  toCanvas,
} from '../../model/mushroom-outline';
import { type Splayed, splayed } from '../../model/mushroom-pose';
import type { MeadowLayout } from './layout';

/** How much of a painted door, and of its doorway, has to show past the mushrooms in front of it. */
export const IN_SIGHT = 0.8;
/** How many points across a door its sight is read at; down it, as many more as it is taller. */
const SIGHT_STEPS = 8;

/** A mushroom as the scene stands it in its slot. */
export type Standing = Splayed & {
  /** Where its foot stands, as the scene sets it: the nearer, the lower. */
  depth: number;
  /** An outline in the mushroom's own frame, where it stands on screen. */
  placed: (outline: readonly Point[]) => Point[];
  /** Its dome, gills and stem as drawn, on screen. */
  drawn: readonly Point[][];
};

export function standingAt(
  place: MeadowLayout['mushrooms'][number],
  seeded: MushroomSeed,
): Standing {
  const { genes, turn } = splayed(mushroomGenes(seeded), place.splay);
  const canvas = toCanvas(place.size);
  const placed = (outline: readonly Point[]) =>
    outline.map((point) => placedAt(place, turn, canvas(point)));
  return {
    depth: place.y,
    genes,
    turn,
    placed,
    drawn: [
      ...capOutlines(genes).map((outline) => placed(outline)),
      placed(stemOutline(genes, turn)),
    ],
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
  for (const station of doorStations(standing.genes)) {
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
