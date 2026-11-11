import { bounds, type Point, type Polyline } from '@/cube/shared/lettering';
import type { Named } from '@/kernel/shared/typings';

import {
  BACTERIUM,
  EGG_CELL,
  FLU_VIRUS,
  LIGHT_WAVE,
  MIMIVIRUS,
  NEURON,
  PARAMECIUM,
  PHAGE,
  POLIOVIRUS,
  POLLEN,
  RED_CELL,
  WHITE_CELL,
  YEAST,
} from './drawn-cells';
import {
  ANT,
  BEE,
  CAT,
  CHILD,
  FLEA,
  FRUIT_FLY,
  HEDGEHOG,
  MITE,
  MOUSE,
  PAPERCLIP,
  PERSON,
  SNAIL,
  TARDIGRADE,
} from './drawn-creatures';
import {
  ANTIBODY,
  BUCKYBALL,
  DNA,
  GLUCOSE,
  HAEMOGLOBIN,
  RIBOSOME,
  WATER,
} from './drawn-molecules';
import {
  ALPHA,
  ATOM_VOID,
  CARBON_ATOM,
  CARBON_NUCLEUS,
  HELIUM_ATOM,
  HYDROGEN_ATOM,
  PROTON,
  QUARK,
  quarkSea,
  question,
  SHORT_WAVE,
  URANIUM_NUCLEUS,
} from './drawn-particles';
import { FRAME_TALL, FRAME_WIDE } from './layout';
import { sidesPerMetre, visitorMetres } from './scale';

/** A thing's strokes: the same on every floor, or drawn for the floor asked. */
type Sketch = readonly Polyline[] | ((n: number) => readonly Polyline[]);

/**
 * A thing a poster shows. `metres` is how big it really is, and the unit its
 * `sketch` is drawn in; `measured` says which way that length runs. A thing
 * with no `measured` has no size to be drawn at — an emptiness, a guess — and
 * `metres` only places it on the ladder; its caption's second line is `note`.
 */
export type Subject = Named & {
  metres: number;
  measured?: string;
  note?: string;
  sketch: Sketch;
  /** What a poster too small for the whole thing centres on. */
  focus: Point;
  /**
   * How wide and tall the thing itself is, in the sketch's units: less than
   * the sketch where that trails off into tails, branches or more of the same.
   */
  body: Point;
};

/** `subject`'s strokes on floor `n`. */
export const sketchOf = (subject: Subject, n: number): readonly Polyline[] =>
  typeof subject.sketch === 'function' ? subject.sketch(n) : subject.sketch;

const MIDDLE: Point = [0.5, 0.5];

/**
 * What a poster centres on of a round thing too big for it: high enough that
 * the thing's top edge arches through the frame over its middle.
 */
const DOME: Point = [0.5, 0.7];

/** The box a sketch's own strokes fill, when the thing is all of them. */
function whole(sketch: Sketch): Point {
  const [left, bottom, right, top] = bounds(
    typeof sketch === 'function' ? sketch(1) : sketch,
  );
  return [right - left, top - bottom];
}

const thing = (
  name: string,
  metres: number,
  measured: string,
  sketch: Sketch,
  focus: Point = MIDDLE,
  body: Point = whole(sketch),
): Subject => ({ name, metres, measured, sketch, focus, body });

const unsized = (
  name: string,
  metres: number,
  note: string,
  sketch: Sketch,
): Subject => ({ name, metres, note, sketch, focus: MIDDLE, body: MIDDLE });

/** A wave's posters centre on the wavelength marked off, and count it whole. */
const WAVE_FOCUS: Point = [0.5, 0.4];
const WAVE_BODY: Point = [1, 0.6];

/** Everything the posters show, largest first. */
export const LADDER: readonly Subject[] = [
  thing('A GROWN-UP', 1.7, 'TALL', PERSON, [0.2, 0.86]),
  thing('A TODDLER', 0.85, 'TALL', CHILD, [0.2, 0.8]),
  thing('A CAT', 0.46, 'LONG', CAT, [0.7, 0.36]),
  thing('A HEDGEHOG', 0.22, 'LONG', HEDGEHOG, [0.6, 0.25]),
  thing('A MOUSE', 0.09, 'LONG WITHOUT ITS TAIL', MOUSE, [0.6, 0.25], [1, 0.5]),
  thing('A GARDEN SNAIL', 0.045, 'LONG', SNAIL, [0.5, 0.3]),
  thing('A PAPERCLIP', 0.03, 'LONG', PAPERCLIP, [0.5, 0.14]),
  thing('A HONEYBEE', 0.013, 'LONG', BEE, [0.6, 0.38]),
  thing('AN ANT', 0.006, 'LONG', ANT, [0.6, 0.27]),
  thing('A FRUIT FLY', 0.003, 'LONG', FRUIT_FLY, [0.6, 0.3]),
  thing('A FLEA', 0.002, 'LONG', FLEA, [0.6, 0.35]),
  thing('A WATER BEAR', 0.0007, 'LONG', TARDIGRADE, [0.6, 0.3]),
  thing('A DUST MITE', 0.000_35, 'LONG', MITE, [0.5, 0.4]),
  thing('A PARAMECIUM', 0.0002, 'LONG', PARAMECIUM, [0.5, 0.2]),
  thing('A HUMAN EGG CELL', 1e-4, 'ACROSS', EGG_CELL, DOME),
  thing('A GRAIN OF POLLEN', 4e-5, 'ACROSS', POLLEN, DOME),
  thing('A NERVE CELL', 2e-5, 'ACROSS ITS BODY', NEURON, MIDDLE, [1, 1]),
  thing('A WHITE BLOOD CELL', 1.2e-5, 'ACROSS', WHITE_CELL, DOME),
  thing('A RED BLOOD CELL', 6.5e-6, 'ACROSS', RED_CELL, DOME),
  thing('A YEAST CELL', 3e-6, 'LONG WITH ITS BUD', YEAST, [0.6, 0.6]),
  thing(
    'A BACTERIUM',
    2e-6,
    'LONG WITHOUT ITS TAILS',
    BACTERIUM,
    [0.4, 0.18],
    [1, 0.36],
  ),
  thing(
    'A WAVE OF RED LIGHT',
    7e-7,
    'FROM CREST TO CREST',
    LIGHT_WAVE,
    WAVE_FOCUS,
    WAVE_BODY,
  ),
  thing('A GIANT VIRUS', 4e-7, 'ACROSS', MIMIVIRUS, DOME),
  thing('A VIRUS THAT PREYS ON BACTERIA', 2e-7, 'TALL', PHAGE, [0.3, 0.3]),
  thing('A FLU VIRUS', 1e-7, 'ACROSS', FLU_VIRUS, DOME),
  thing('A POLIO VIRUS', 3e-8, 'ACROSS', POLIOVIRUS, DOME),
  thing('A RIBOSOME', 2.5e-8, 'TALL', RIBOSOME, [0.5, 0.45], [0.9, 1]),
  thing('AN ANTIBODY', 1.2e-8, 'TALL', ANTIBODY, [0.5, 0.62]),
  thing('A PROTEIN: HAEMOGLOBIN', 6e-9, 'ACROSS', HAEMOGLOBIN, DOME),
  thing('DNA', 3.4e-9, 'TO ONE TURN', DNA, [0.5, 0.3], [1, 0.6]),
  thing('A MOLECULE OF SUGAR', 9e-10, 'ACROSS', GLUCOSE),
  thing('A CAGE OF 60 CARBON ATOMS', 7.1e-10, 'ACROSS', BUCKYBALL, DOME),
  thing('A MOLECULE OF WATER', 2.8e-10, 'ACROSS', WATER, [0.5, 0.55]),
  thing('A CARBON ATOM', 1.5e-10, 'ACROSS', CARBON_ATOM, DOME),
  thing('A HYDROGEN ATOM', 1.06e-10, 'ACROSS', HYDROGEN_ATOM),
  thing('A HELIUM ATOM', 6.2e-11, 'ACROSS', HELIUM_ATOM, [0.72, 0.6]),
  unsized(
    'THE INSIDE OF AN ATOM',
    2e-11,
    'NEARLY ALL OF IT IS EMPTY. NOTHING HERE IS YOUR SIZE.',
    ATOM_VOID,
  ),
  thing(
    'AN X-RAY',
    1e-11,
    'FROM CREST TO CREST',
    SHORT_WAVE,
    WAVE_FOCUS,
    WAVE_BODY,
  ),
  thing(
    'A WAVE OF LIGHT AS HEAVY AS AN ELECTRON',
    2.43e-12,
    'FROM CREST TO CREST',
    SHORT_WAVE,
    WAVE_FOCUS,
    WAVE_BODY,
  ),
  thing(
    'A GAMMA RAY',
    1e-12,
    'FROM CREST TO CREST',
    SHORT_WAVE,
    WAVE_FOCUS,
    WAVE_BODY,
  ),
  thing(
    'THE NUCLEUS OF A URANIUM ATOM',
    1.5e-14,
    'ACROSS',
    URANIUM_NUCLEUS,
    DOME,
  ),
  thing(
    'THE NUCLEUS OF A CARBON ATOM',
    5.5e-15,
    'ACROSS',
    CARBON_NUCLEUS,
    DOME,
  ),
  thing('THE NUCLEUS OF A HELIUM ATOM', 3.4e-15, 'ACROSS', ALPHA, DOME),
  thing('A PROTON', 1.7e-15, 'ACROSS', PROTON, DOME),
  unsized(
    'THE INSIDE OF A PROTON',
    1e-16,
    'QUARKS COME AND GO. NONE OF THEM HAS A SIZE.',
    quarkSea,
  ),
  thing(
    'A QUARK',
    8.6e-19,
    'ACROSS AT THE MOST, IF IT HAS A SIZE',
    QUARK,
    DOME,
  ),
  unsized('?', 1e-19, 'NOTHING IS KNOWN TO BE YOUR SIZE.', question),
];

/**
 * How much worse a match a thing is for each factor the frame would cut it
 * down by, against each factor it differs from the visitor in size.
 */
const CROPPING = 1;

/**
 * How poor a match `subject` is for floor `n`'s visitor; 0 is a thing their
 * size that the frame holds whole. A thing with no size of its own is never
 * cut down.
 */
function mismatch(subject: Subject, n: number): number {
  const apart = Math.abs(Math.log(subject.metres / visitorMetres(n)));
  if (subject.measured === undefined) return apart;
  const unit = subject.metres * sidesPerMetre(n);
  const over = Math.max(
    (subject.body[0] * unit) / FRAME_WIDE,
    (subject.body[1] * unit) / FRAME_TALL,
    1,
  );
  return apart + CROPPING * Math.log(over);
}

/** The deepest floor a poster is drawn for. */
const FLOORS = 67;

/**
 * How much worse it is to show a floor the thing the floor above showed than
 * to show it something new.
 */
const REPEATING = 0.6;

/**
 * The ladder's rung for every floor, floor 1 first: the walk down the ladder,
 * never back up it, that matches the floors best over all, a rung shown again
 * counting against it — so two floors share a thing only where nothing else
 * comes near either.
 */
function descent(): readonly number[] {
  const rungs = LADDER.map((_, rung) => rung);
  // The cheapest walk ending on each rung, as its cost and its rungs so far.
  let walks = rungs.map((rung) => ({
    cost: mismatch(LADDER[rung] ?? unsized('', 1, '', []), 1),
    path: [rung],
  }));
  for (let n = 2; n <= FLOORS; n += 1) {
    const before = walks;
    walks = rungs.map((rung) => {
      const best = before
        .slice(0, rung + 1)
        .map((walk, from) => ({
          cost: walk.cost + (from === rung ? REPEATING : 0),
          path: walk.path,
        }))
        .reduce((a, b) => (b.cost < a.cost ? b : a));
      const here = LADDER[rung];
      return {
        cost: best.cost + (here === undefined ? 0 : mismatch(here, n)),
        path: [...best.path, rung],
      };
    });
  }
  return walks.reduce((a, b) => (b.cost < a.cost ? b : a)).path;
}

const RUNGS = descent();

/**
 * The thing a visitor of floor `n` is now the size of: the ladder's nearest
 * to their height, counting factors, where the poster's frame holds it whole
 * or nearly, and no floor's thing bigger than the floor above's.
 */
export function subjectOf(n: number): Subject {
  const rung = RUNGS[Math.min(Math.max(n, 1), FLOORS) - 1] ?? 0;
  const subject = LADDER[rung];
  if (subject === undefined) throw new Error(`No poster for floor ${n}`);
  return subject;
}
