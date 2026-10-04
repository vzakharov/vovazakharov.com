/**
 * What each flower sounds: its colour and shape (`petal` × `rings`) name one
 * of twelve pitch classes or one of eight drums, by one law — darker is
 * lower. Blue, pink and yellow are the notes, a third of the octave each;
 * violet the skins and white the ticks. Within a colour the shapes rise
 * round-one-ring, round-two, pointed-one, pointed-two.
 */

import {
  type Coloured,
  type Flower,
  type FlowerColour,
  type FlowerGenes,
  flowerGenes,
} from './flower-genes';
import { mulberry32, nextSeed, type Random } from './random';

/** The colours that sound notes, darkest first: each takes the next four semitones up from C. */
const NOTE_COLOURS = [
  'blue',
  'pink',
  'yellow',
] as const satisfies readonly FlowerColour[];

/** The colours that sound drums: violet the skins, white the ticks. */
const DRUM_COLOURS = [
  'violet',
  'white',
] as const satisfies readonly FlowerColour[];

/** The five colours as the flower picker offers them: the notes darkest first, then the drums. */
export const PICKED_COLOURS = [...NOTE_COLOURS, ...DRUM_COLOURS] as const;

/** A flower's four shapes, lowest first. */
export const FLOWER_SHAPES = [
  { petal: 'round', rings: 1 },
  { petal: 'round', rings: 2 },
  { petal: 'pointed', rings: 1 },
  { petal: 'pointed', rings: 2 },
] as const satisfies ReadonlyArray<Pick<FlowerGenes, 'petal' | 'rings'>>;
export type FlowerShape = (typeof FLOWER_SHAPES)[number];

/** Semitones above C. */
export const PITCH_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type PitchClass = (typeof PITCH_CLASSES)[number];

/**
 * The eight drums, violet's four then white's, each colour's in shape order:
 * the kick and the toms low to high, then the snare, the rim, and the noisy
 * two on the pointed petals.
 */
export const DRUMS = [
  'kick',
  'tom-low',
  'tom-mid',
  'tom-high',
  'snare',
  'rim',
  'hat',
  'shaker',
] as const;
export type Drum = (typeof DRUMS)[number];

export type FlowerSound =
  | { kind: 'note'; pitchClass: PitchClass }
  | { kind: 'drum'; drum: Drum };

type Classed = Pick<FlowerGenes, 'colour' | 'petal' | 'rings'>;

function shapeIndex({ petal, rings }: Classed): number {
  return FLOWER_SHAPES.findIndex(
    (shape) => shape.petal === petal && shape.rings === rings,
  );
}

/** The sound a flower of `genes`' colour and shape makes. */
export function soundOf(genes: Classed): FlowerSound {
  const shape = shapeIndex(genes);
  const noteRow = rowOf(NOTE_COLOURS, genes.colour);
  if (noteRow !== -1) {
    return { kind: 'note', pitchClass: at(PITCH_CLASSES, noteRow * 4 + shape) };
  }
  const drumRow = rowOf(DRUM_COLOURS, genes.colour);
  return { kind: 'drum', drum: at(DRUMS, drumRow * 4 + shape) };
}

function rowOf(colours: readonly FlowerColour[], colour: FlowerColour): number {
  return colours.indexOf(colour);
}

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`No sound at ${String(index)}`);
  return item;
}

/** The colour and shape of the flowers that make `sound`: `soundOf` read backwards. */
export function classOf(sound: FlowerSound): Coloured & { shape: FlowerShape } {
  for (const colour of PICKED_COLOURS) {
    for (const shape of FLOWER_SHAPES) {
      if (sameSound(soundOf({ colour, ...shape }), sound)) {
        return { colour, shape };
      }
    }
  }
  throw new Error('No flower makes the sound asked for');
}

export function sameSound(a: FlowerSound, b: FlowerSound): boolean {
  return a.kind === 'note'
    ? b.kind === 'note' && a.pitchClass === b.pitchClass
    : b.kind === 'drum' && a.drum === b.drum;
}

/**
 * The visit's seeded flowers, in the order the bed stands them, so a screen
 * with room for fewer drops the drums before the scale: the major pentatonic
 * from C, whatever a child strikes on it in tune, then a kick and a hat.
 */
export const SEEDED_SOUNDS: readonly FlowerSound[] = [
  ...([0, 2, 4, 7, 9] as const).map((pitchClass) => ({
    kind: 'note' as const,
    pitchClass,
  })),
  { kind: 'drum', drum: 'kick' },
  { kind: 'drum', drum: 'hat' },
];

/** How many seeds `seedSounding` tries before giving up: at 1 in 20 a try, far past any real run. */
const SEED_TRIES = 4096;

/**
 * The first seed off `random` whose flower sounds `sound`, the rest of its
 * genes as free as any flower's.
 */
export function seedSounding(random: Random, sound: FlowerSound): number {
  for (let tries = 0; tries < SEED_TRIES; tries++) {
    const seed = nextSeed(random);
    if (sameSound(soundOf(flowerGenes({ seed })), sound)) return seed;
  }
  throw new Error('No seed sounds the flower asked for');
}

/**
 * A seed off `random` for each of `FLOWER_SHAPES` in `colour`, in that
 * order: the flowers a child picks among once it has picked the colour.
 */
export function shapeSeeds(random: Random, colour: FlowerColour): number[] {
  return FLOWER_SHAPES.map((shape) =>
    seedSounding(random, soundOf({ colour, ...shape })),
  );
}

/**
 * The visit's first flowers, one per `SEEDED_SOUNDS` entry up to `count`,
 * numbered on from `first`. Each draws one seed off `random`, as any grown
 * thing does, and searches its own stream from there, so the visit's later
 * draws stand where they would.
 */
export function firstFlowers(
  random: Random,
  count: number,
  first = 0,
): Flower[] {
  return Array.from({ length: count }, (_, dealt) => {
    const index = first + dealt;
    const own = mulberry32(nextSeed(random));
    const sound = SEEDED_SOUNDS[index % SEEDED_SOUNDS.length];
    if (!sound) throw new Error('The seeded flowers have no sounds');
    return { id: `flower-${index + 1}`, seed: seedSounding(own, sound) };
  });
}

/** How many flowers the visit's near bed holds: a full set of sounds in each half of the world. */
export const NEAR_FLOWERS = 2 * SEEDED_SOUNDS.length;

/** Mixed into the visit's seed for the far band's own stream. */
const FAR_STREAM = 0x0f_a2_be;

/**
 * The visit `visitSeed`'s seeded flowers, in the order the bed's bands stand
 * them: the near band's off `random`, the visit's own stream, then `far`
 * more for the far band off a stream of their own, so the near ones and
 * every later draw off `random` stand where they would without them.
 */
export function visitFlowers(
  random: Random,
  visitSeed: number,
  far: number,
): Flower[] {
  return [
    ...firstFlowers(random, NEAR_FLOWERS),
    ...firstFlowers(mulberry32(visitSeed ^ FAR_STREAM), far, NEAR_FLOWERS),
  ];
}
