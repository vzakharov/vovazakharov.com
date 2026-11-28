import { at, lerp, type Pen, smoothstep } from '@/clip/shared/ink';
import { reality } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';
import { bunny } from '@/clip/entities/bunny';
import { puppet } from '@/clip/entities/puppet';

import { cell, cot, night, tvGlow, tvSet, wallWriting } from './room';

/** How the camera frames the cell: the stage point at the frame's centre, and the zoom. */
type Camera = { focus: readonly [number, number]; zoom: number };

/** The man and the bunny sat side by side on the cot, both watching the snow. */
function pair(pen: Pen, together: number): void {
  const { boil } = pen;
  bunny(pen, {
    x: lerp(1000, 760, together),
    y: 270,
    nearness: 0.7,
    bunnyScale: 0.5,
    arms: 'down',
    eyes: 'button',
    grin: 0.35,
    swaying: 0.25,
    seed: 71,
  });
  cot(pen);
  puppet(pen, {
    place: { x: 560, y: 665, scale: 0.62 },
    pose: 'sit',
    outfit: 'strait',
    look: {
      gaze: [0.7, -0.6],
      lid: 0.55 + 0.05 * Math.sin(boil),
      brow: 0.2,
      turn: 0.3,
      jaw: 0.05,
    },
    mark: 72,
  });
}

/** The whole cell as `camera` frames it, `together` of the way sat down side by side. */
function ward(pen: Pen, camera: Camera, together = 1, words = 1): void {
  const {
    focus: [fx, fy],
    zoom,
  } = camera;
  reality(pen, (inner) => {
    at(inner, { x: 640, y: 360, scale: zoom }, () => {
      at(inner, { x: -fx, y: -fy }, () => {
        cell(inner);
        wallWriting(inner, { words, marks: 1 });
        tvSet(inner);
        pair(inner, together);
        night(inner, 0.38);
        tvGlow(inner);
      });
    });
  });
}

const WIDE: Camera = { focus: [640, 360], zoom: 1 };

/** The cell wide, the bunny edging along the floor until it sits beside him. */
export const wardWide: Drawing = (pen: Pen, local: Local) => {
  ward(pen, WIDE, smoothstep(0.1, 0.8, local.p));
};

/** The two of them close, from the knees up, the camera creeping in. */
export const wardTwoShot: Drawing = (pen: Pen, { p }: Local) => {
  ward(pen, { focus: [690, 520], zoom: lerp(1.7, 1.85, p) });
};

/** The TV high in its corner, nothing on it but snow. */
export const wardTv: Drawing = (pen: Pen, { p }: Local) => {
  ward(pen, { focus: [1110, 170], zoom: lerp(2.6, 2.8, p) });
};

/** The wall: the words and the tallies running past every edge. */
export const wardWall: Drawing = (pen: Pen, { p }: Local) => {
  ward(pen, { focus: [lerp(520, 760, p), 230], zoom: 1.9 });
};

/** The cell wide and pulling slowly back, the last tender stretch. */
export const wardPullBack: Drawing = (pen: Pen, { p }: Local) => {
  ward(pen, { focus: [640, lerp(400, 360, p)], zoom: lerp(1.25, 1, p) });
};

/** The silent cell between the breakdown's stabs: still, wide, darker. */
export const wardHole: Drawing = (pen: Pen) => {
  ward(pen, WIDE);
  night(pen, 0.35);
};
