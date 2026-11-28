import { clamp, type Path, type Point } from '@/clip/shared/ink';

// The head's half-width and half-height, in its own units.
const HALF_WIDTH = 96;
const HALF_HEIGHT = 175;

// How far a full turn or nod carries the middle of the face.
const TURN_REACH = 30;
const NOD_REACH = 18;

/**
 * Where a point of the face-on head sits once the head has turned and nodded.
 * The head is treated as a ball: its middle travels the furthest and its rim
 * stays put, so the far cheek bunches up and the near one opens out. The crown
 * travels less than the face, being nearer the neck's axis.
 */
export function swivelled([x, y]: Point, turn: number, nod: number): Point {
  const across = 1 - clamp(x / HALF_WIDTH, -1, 1) ** 2;
  const down = 1 - clamp(y / HALF_HEIGHT, -1, 1) ** 2;
  const crown = 0.35 + 0.65 * clamp((y + HALF_HEIGHT) / 150, 0, 1);
  return [
    x + turn * TURN_REACH * across * crown,
    y + nod * NOD_REACH * down * (0.4 + 0.6 * across),
  ];
}

/** A swivel of a whole outline; the outline itself when the head faces front. */
export const swivelledPath = (shape: Path, turn: number, nod: number): Path =>
  turn === 0 && nod === 0
    ? shape
    : shape.map(({ kind, points }) => ({
        kind,
        points: points.map((point) => swivelled(point, turn, nod)),
      }));

/** `shape` mirrored left to right. */
export const mirrored = (shape: Path): Path =>
  shape.map(({ kind, points }) => ({
    kind,
    points: points.map(([x, y]): Point => [-x, y]),
  }));
