import type { Seeded } from '@/kernel/shared/typings';

import type { Path, Pen, Point } from '@/clip/shared/ink';

import type { Look } from '../model/look';

/** One head being drawn: its look, and the swivel every outline goes through. */
export type Face = Seeded & {
  pen: Pen;
  look: Readonly<Look>;
  bend: (shape: Path) => Path;
  spot: (point: Point) => Point;
};
