import type { Turned } from '@/kernel/shared/typings';

import type { Point } from '@/clip/shared/ink';

export const HAIRS = ['cap', 'mohawk', 'bald', 'tuft'] as const;

export type Hair = (typeof HAIRS)[number];

/** Everything a head can be told. Sides are the viewer's: the mask's LED is on the left. */
export type Look = Turned & {
  /** How far the mask's hinged jaw has dropped: 0 clenched, 1 all the way. */
  jaw: number;
  /** Where the eyes point, each axis in `[-1, 1]`: x right, y down. */
  gaze: Point;
  /** The man's own brow: -1 raised, 1 a scowl. */
  brow: number;
  /** 0 wide open, 1 shut. The LED's shutter only starts closing past 0.3. */
  lid: number;
  /** The LED's colour, as `#rrggbb`. */
  led: string;
  /** `'two'` is the full mask: an LED over each eye and none of the man's. */
  eyes: 'one' | 'two';
  hair: Hair;
  /** 0 dry, 1 pouring. */
  sweat: number;
  /** -1 the chin up, 1 the chin down. */
  nod: number;
};
