import {
  clamp,
  clipped,
  lerp,
  type Pen,
  type Point,
  smoothstep,
  STAGE,
} from '@/clip/shared/ink';
import { bunny } from '@/clip/entities/bunny';
import { type Look, puppet } from '@/clip/entities/puppet';

import { cot, rect } from './room';

/** The middle of the man's face in the cell's coordinates, where the zoom ends up. */
export const HIS_FACE: Point = [565, 325];

/**
 * Where the bunny stands at each step of its approach, in the cell's
 * coordinates: `[x, feet, size]`. It crosses the floor from the corner under
 * the TV, then stands behind the cot at his elbow; `SEATED` is the last.
 */
const STEPS: ReadonlyArray<readonly [number, number, number]> = [
  [1190, 555, 0.28],
  [1110, 610, 0.33],
  [1035, 660, 0.38],
  [960, 700, 0.43],
  [900, 712, 0.47],
  [835, 708, 0.5],
  [790, 570, 0.55],
];
/** Sat on the cot beside him, its head level with his. */
const SEATED = [725, 618, 0.5] as const;
// Its feet are 600 of its units below its head's centre.
const FEET = 600;
// The cot's bottom edge: below it, a bunny behind the cot would show between its legs.
const COT_BOTTOM = 590;

/** How the bunny is drawn at one moment of its approach. */
export type Approach = {
  /** Steps taken: whole steps up to the last of `STEPS`, then how far sat down, to `SAT_DOWN`. */
  step: number;
  /** How much of the false end has shown it, 0 to 1: its grin widens and it leans towards him. */
  glimpse: number;
  /** Its eyes lit, at the very last. */
  awoken: boolean;
};

function placeAt(step: number): readonly [number, number, number] {
  const last = STEPS.length - 1;
  if (step <= last) {
    return STEPS[clamp(Math.floor(step), 0, last)] ?? SEATED;
  }
  const standing = STEPS[last] ?? SEATED;
  const sit = smoothstep(0, 1, clamp(step - last, 0, 1));
  return [
    lerp(standing[0], SEATED[0], sit),
    lerp(standing[1], SEATED[1], sit),
    lerp(standing[2], SEATED[2], sit),
  ];
}

/** The bunny at `approach`; behind the cot once it has crossed the floor. */
function approaching(pen: Pen, approach: Approach, behind: boolean): void {
  const { step, glimpse, awoken } = approach;
  const behindCot = step >= STEPS.length - 1;
  if (behindCot !== behind) return;
  const [x, feet, size] = placeAt(step);
  const draw = () => {
    bunny(pen, {
      x,
      y: feet - FEET * size,
      bunnyScale: size,
      nearness: 0.7,
      arms: 'down',
      eyes: awoken ? 'glow' : 'button',
      grin: lerp(0.35, 1, glimpse),
      rot: -9 * glimpse,
      swaying: 0.25,
      seed: 71,
    });
  };
  if (!behindCot) {
    draw();
    return;
  }
  clipped(pen, rect(0, 0, STAGE.width, COT_BOTTOM), draw);
}

/** The man on the cot in his strait-jacket, as `look` has him, and the bunny at `approach`. */
export function cast(pen: Pen, look: Partial<Look>, approach: Approach): void {
  approaching(pen, approach, true);
  cot(pen);
  approaching(pen, approach, false);
  puppet(pen, {
    place: { x: 560, y: 665, scale: 0.62 },
    pose: 'sit',
    outfit: 'strait',
    look: { jaw: 0.05, ...look },
    mark: 72,
  });
}

/** The approach's `step` once the bunny has sat down. */
export const SAT_DOWN = STEPS.length;
