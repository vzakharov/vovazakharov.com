import type { Zooming } from '@/scene/shared/lib/plane';

import { at, type Pen } from '@/clip/shared/ink';
import { reality } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';

import { cast, SAT_DOWN } from './cast';
import { cell, night, tvGlow, tvSet, wallWriting } from './room';

/** How the camera frames the cell: the stage point at the frame's centre, and the zoom. */
export type Camera = Zooming & { focus: readonly [number, number] };

/** The cell as `camera` frames it, the words finished on its wall and `inside` drawn in it. */
export function ward(
  pen: Pen,
  camera: Camera,
  inside: (pen: Pen) => void,
): void {
  const {
    focus: [fx, fy],
    zoom,
  } = camera;
  reality(pen, (inner) => {
    at(inner, { x: 640, y: 360, scale: zoom }, () => {
      at(inner, { x: -fx, y: -fy }, () => {
        cell(inner);
        wallWriting(inner, { words: 1, marks: 1 });
        tvSet(inner);
        inside(inner);
        night(inner, 0.38);
        tvGlow(inner);
      });
    });
  });
}

/** The silent cell between the breakdown's stabs: still, wide, darker, the two of them sat side by side. */
export const wardHole: Drawing = (pen: Pen) => {
  ward(pen, { focus: [640, 360], zoom: 1 }, (inner) => {
    cast(
      inner,
      { gaze: [0.7, -0.6], lid: 0.55, brow: 0.2, turn: 0.3 },
      { step: SAT_DOWN, grin: 0.35, glowing: false, lean: 0 },
    );
  });
  night(pen, 0.35);
};
