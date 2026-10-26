import type { WithCamera } from '@/mushrooms/shared/world';

import type { InsectKind } from '../model/insect-genes';

/**
 * A butterfly's size, the unit its genes are in, as a share of the clump's,
 * and the least it is painted at, which holds on every screen and every
 * refit, however small the clump stands: an insect a child cannot make out
 * is not in the meadow at all, where a butterfly wider than a small cap is
 * only a big butterfly. So a refit that zooms out shrinks the ground under
 * insects kept at the least, and a tap stays a finger's (`tapReach`).
 */
const INSECT_SCALE = 0.3;
const INSECT_LEAST = 60;
/**
 * The least each kind's open wings span as drawn, in CSS px, to read on a
 * phone, which `INSECT_LEAST` keeps every gene above.
 */
export const LEAST_SPANS = {
  butterfly: 52,
  fly: 30,
  bee: 30,
} as const satisfies Record<InsectKind, number>;

/**
 * Each kind's size against the butterfly's: a fly and a bee are small beside
 * it, and still read on a phone.
 */
const KIND_SCALE = {
  butterfly: 1,
  fly: 0.55,
  bee: 0.65,
} as const satisfies Record<InsectKind, number>;

/** The unit each kind's genes are painted in, the butterfly's `insectSize`. */
export type InsectSized = { insectSizes: Readonly<Record<InsectKind, number>> };
/** The unit a butterfly's genes are painted in, and each kind's. */
export type InsectScaled = InsectSized & { insectSize: number };
/** What the meadow is shown through, which a turn or a resize fits anew, and the insects' units on it. */
export type InsectCamera = WithCamera & InsectScaled;

/** The insects' units on a ground whose clump stands `unit` across. */
export function insectScaled(unit: number): InsectScaled {
  const insectSize = Math.max(INSECT_LEAST, unit * INSECT_SCALE);
  return {
    insectSize,
    insectSizes: {
      butterfly: insectSize * KIND_SCALE.butterfly,
      fly: insectSize * KIND_SCALE.fly,
      bee: insectSize * KIND_SCALE.bee,
    },
  };
}
