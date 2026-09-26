import type * as Phaser from 'phaser';

import { clipToConvex, type Point } from '../../model/geometry';
import { PALETTE } from './palette';
import { box, type Brush, ellipse, fillShape, type Place } from './shapes';

/**
 * A mouse at its door: `out` how far it has come, from 0 (inside) to 1 (its
 * head up in the doorway), `look` its head's turn from -1 to 1, and whether
 * its eyes are `shut` in a blink.
 */
export type Peeking = { out: number; look: number; shut: boolean };

/** Where the head's middle stands in the doorway, in door widths up from the sill: hidden, and all the way out. */
const HEAD_LOW = -0.5;
const HEAD_HIGH = 0.5;
const HEAD_R = 0.3;
const WHISKER_LENGTH = 0.26;
const WHISKER_WIDTH = 0.018;

/** A thin bar from `from` along `angle`, `length` long: a whisker, or a shut eye. */
function bar(
  from: Point,
  angle: number,
  length: number,
  width: number,
): Point[] {
  const along = { x: Math.cos(angle), y: Math.sin(angle) };
  const across = { x: -along.y * (width / 2), y: along.x * (width / 2) };
  const to = { x: from.x + along.x * length, y: from.y + along.y * length };
  return [
    { x: from.x + across.x, y: from.y + across.y },
    { x: to.x + across.x, y: to.y + across.y },
    { x: to.x - across.x, y: to.y - across.y },
    { x: from.x - across.x, y: from.y - across.y },
  ];
}

/**
 * A mouse's head coming up out of a doorway, in the door's frame (door widths,
 * the sill's middle at the origin, y up). Every part is clipped to `opening`,
 * so the mouse comes from inside rather than over the door; the ears turn with
 * `look` less than the eyes, so the head reads as turning rather than sliding.
 */
export function paintMouse(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  opening: readonly Point[],
  { out, look, shut }: Peeking,
  { ink, tone }: Brush,
): void {
  // The ink line in door widths, from the pixels a door width spans.
  const origin = place({ x: 0, y: 0 });
  const across = place({ x: 1, y: 0 });
  const unit = Math.hypot(across.x - origin.x, across.y - origin.y) || 1;
  const line = ink / unit;
  const head = {
    x: 0.1 + look * 0.05,
    y: HEAD_LOW + (HEAD_HIGH - HEAD_LOW) * out,
  };
  const faceX = head.x + look * 0.1;
  const fill = (outline: readonly Point[], colour: number) => {
    const seen = clipToConvex(outline, opening);
    if (seen.length < 3) return;
    graphics.fillStyle(tone(colour));
    fillShape(
      graphics,
      seen.map((point) => place(point)),
    );
  };
  // Inked by a shape a line wider behind each fill, so a clipped edge shows no ink.
  const inked = (at: Point, rx: number, ry: number, colour: number) => {
    fill(ellipse(at, rx + line, ry + line), PALETTE.ink);
    fill(ellipse(at, rx, ry), colour);
  };

  for (const side of [-1, 1]) {
    const ear = { x: head.x + side * 0.21 + look * 0.03, y: head.y + 0.22 };
    inked(ear, 0.16, 0.16, PALETTE.mouse);
    fill(
      ellipse({ x: ear.x + look * 0.02, y: ear.y - 0.01 }, 0.09),
      PALETTE.mousePink,
    );
  }
  inked(head, HEAD_R, HEAD_R * 0.9, PALETTE.mouse);
  const snout = { x: faceX + look * 0.06, y: head.y - 0.1 };
  fill(ellipse(snout, 0.14, 0.1), PALETTE.mouseLight);
  const nose = { x: snout.x + look * 0.05, y: snout.y + 0.03 };
  for (const side of [-1, 1]) {
    for (const tilt of [-0.28, 0, 0.28]) {
      const angle = (side > 0 ? 0 : Math.PI) + side * tilt;
      const from = { x: nose.x + side * 0.05, y: nose.y - 0.02 };
      fill(bar(from, angle, WHISKER_LENGTH, WHISKER_WIDTH), PALETTE.ink);
    }
  }
  inked(nose, 0.045, 0.038, PALETTE.mousePink);
  for (const side of [-1, 1]) {
    const eye = { x: faceX + side * 0.1, y: head.y + 0.05 };
    if (shut) {
      fill(
        box(eye.x - 0.05, eye.y - 0.01, eye.x + 0.05, eye.y + 0.01),
        PALETTE.ink,
      );
      continue;
    }
    fill(ellipse(eye, 0.05, 0.058), PALETTE.mouseEye);
    fill(
      ellipse({ x: eye.x + 0.017, y: eye.y + 0.02 }, 0.018),
      PALETTE.highlight,
    );
  }
}
