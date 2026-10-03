import type * as Phaser from 'phaser';

import { clipToConvex, ellipse, type Point } from '../../model/geometry';
import type { Looking } from '../../model/motion';
import { MOUSE_HEAD_R } from './door-reach';
import { inkFor, TAPER, taperedLine, upward, weightedOutline } from './ink';
import { PALETTE } from './palette';
import { box, type Brush, fillShape, type Place } from './shapes';

/**
 * A mouse at its door: `out` how far it has come, from 0 (inside) to 1 (its
 * head up in the doorway), `look` its head's turn from -1 to 1, and whether
 * its eyes are `shut` in a blink.
 */
export type Peeking = Looking & { out: number; shut: boolean };

/** Where the head's middle stands in the doorway, in door widths up from the sill: hidden, and all the way out. */
const HEAD_LOW = -0.5;
const HEAD_HIGH = 0.5;
const WHISKER_LENGTH = 0.26;
const WHISKER_WIDTH = 0.018;

/** A whisker from `from` along `angle`, `length` long, `width` at its root and tapering to its tip, no thinner than `least`. */
function whisker(
  from: Point,
  angle: number,
  [length, width]: readonly [number, number],
  least: number,
): Point[] {
  const to = {
    x: from.x + Math.cos(angle) * length,
    y: from.y + Math.sin(angle) * length,
  };
  return taperedLine([from, to], [width, width * TAPER], least);
}

/**
 * How a mouse's parts are painted in its own frame (door widths, y up), as
 * `place` puts that frame on the graphics: `fill` lays a shape in a colour,
 * kept inside `clip` when given, and `inked` an ellipse with its ink grown
 * behind it, heavier on its shade side, so a clipped edge shows no ink.
 */
function mouseInks(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  { ink, tone, lighting }: Brush,
  clip?: readonly Point[],
) {
  // The pixels a door width spans, the mouse's unit.
  const origin = place({ x: 0, y: 0 });
  const across = place({ x: 1, y: 0 });
  const unit = Math.hypot(across.x - origin.x, across.y - origin.y) || 1;
  const line = ink / unit;
  const toward = upward(lighting.toward);
  const hairline = lighting.hairline / unit;
  const fill = (
    outline: readonly Point[],
    colour: number,
    shown: (colour: number) => number = tone,
  ) => {
    const seen = clip ? clipToConvex(outline, clip) : outline;
    if (seen.length < 3) return;
    graphics.fillStyle(shown(colour));
    fillShape(
      graphics,
      seen.map((point) => place(point)),
    );
  };
  const inked = (at: Point, rx: number, ry: number, colour: number) => {
    const shape = ellipse(at, rx, ry);
    fill(weightedOutline(shape, line, toward, hairline), colour, (part) =>
      inkFor(tone(part)),
    );
    fill(shape, colour);
  };
  return { fill, inked, hairline };
}

/**
 * A mouse coming up out of a doorway, in the door's frame (door widths, the
 * sill's middle at the origin, y up), at the door's own scale however small
 * it is. Every part is clipped to `opening`, so the mouse comes from inside
 * rather than over the door. The ears turn with `look` less than the eyes, so the head reads as
 * turning rather than sliding.
 */
export function paintMouse(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  opening: readonly Point[],
  { out, look, shut }: Peeking,
  brush: Brush,
): void {
  const { fill, inked, hairline } = mouseInks(graphics, place, brush, opening);
  const head = {
    x: 0.1 + look * 0.05,
    y: HEAD_LOW + (HEAD_HIGH - HEAD_LOW) * out,
  };
  const faceX = head.x + look * 0.1;

  // A body under the head, so a mouse up in its doorway is not a floating head.
  inked(
    { x: head.x - look * 0.03, y: head.y - MOUSE_HEAD_R * 1.25 },
    MOUSE_HEAD_R * 1.15,
    MOUSE_HEAD_R * 1.05,
    PALETTE.mouse,
  );
  for (const side of [-1, 1]) {
    const ear = { x: head.x + side * 0.21 + look * 0.03, y: head.y + 0.22 };
    inked(ear, 0.16, 0.16, PALETTE.mouse);
    fill(
      ellipse({ x: ear.x + look * 0.02, y: ear.y - 0.01 }, 0.09),
      PALETTE.mousePink,
    );
  }
  inked(head, MOUSE_HEAD_R, MOUSE_HEAD_R * 0.9, PALETTE.mouse);
  const snout = { x: faceX + look * 0.06, y: head.y - 0.1 };
  fill(ellipse(snout, 0.14, 0.1), PALETTE.mouseLight);
  const nose = { x: snout.x + look * 0.05, y: snout.y + 0.03 };
  for (const side of [-1, 1]) {
    for (const tilt of [-0.28, 0, 0.28]) {
      const angle = (side > 0 ? 0 : Math.PI) + side * tilt;
      const from = { x: nose.x + side * 0.05, y: nose.y - 0.02 };
      fill(
        whisker(from, angle, [WHISKER_LENGTH, WHISKER_WIDTH], hairline),
        PALETTE.ink,
      );
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

/**
 * A mouse running, seen side-on: `ran`, how far it has run in its own
 * widths, sets its legs' swing and its bob; `heads` 1 runs it toward +x and
 * -1 toward -x; `raised` lifts it off the ground, in its widths, as it hops.
 */
export type Running = { ran: number; heads: number; raised: number };

/** How far a mouse runs in one round of its legs, in its widths. */
const STRIDE = 0.55;
/** How far a leg swings either way at a run, and how high a stepping foot lifts, in widths. */
const LEG_SWING = 0.13;
const FOOT_LIFT = 0.06;
const BOB = 0.035;
const SHADOW_ALPHA = 0.3;

/**
 * A running mouse in its own frame (its door's widths, the ground under its
 * middle at the origin, y up), as `place` puts it on the graphics: a body,
 * the head forward with one ear, an eye and whiskers, a curved tail, four
 * legs scissoring in step with how far it has run, a bob, and a shadow on the ground.
 */
export function paintRunner(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  { ran: stride, heads: facing, raised: lift }: Running,
  brush: Brush,
): void {
  const { fill, inked, hairline } = mouseInks(graphics, place, brush);
  const turn = (Math.PI * 2 * stride) / STRIDE;
  const up = lift + BOB * Math.abs(Math.sin(turn));
  const at = (x: number, y: number) => ({ x: x * facing, y: y + up });
  graphics.fillStyle(PALETTE.shadowCool, SHADOW_ALPHA);
  fillShape(
    graphics,
    ellipse({ x: 0, y: 0 }, 0.42, 0.07).map((point) => place(point)),
  );
  const dark = (colour: number) => inkFor(brush.tone(colour));
  const leg = (
    hip: number,
    swing: number,
    colour: number,
    shown = brush.tone,
  ) => {
    const foot = {
      x: (hip + Math.sin(swing) * LEG_SWING) * facing,
      // The feet keep to the ground under the bob, one lifting as it swings forward.
      y: lift + Math.max(0, Math.cos(swing)) * FOOT_LIFT,
    };
    fill(
      taperedLine([at(hip, 0.2), foot], [0.09, 0.06], hairline),
      colour,
      shown,
    );
  };
  // The far legs, half a step behind the near ones and in shade.
  leg(-0.24, turn + Math.PI, PALETTE.mouse, dark);
  leg(0.2, turn, PALETTE.mouse, dark);
  fill(
    taperedLine(
      [at(-0.4, 0.3), at(-0.6, 0.24), at(-0.78, 0.3), at(-0.9, 0.44)],
      [0.06, 0.06 * TAPER],
      hairline,
    ),
    PALETTE.mousePink,
  );
  inked(at(-0.04, 0.3), 0.42, 0.24, PALETTE.mouse);
  leg(-0.24, turn, PALETTE.mousePink);
  leg(0.2, turn + Math.PI, PALETTE.mousePink);
  inked(at(0.36, 0.38), MOUSE_HEAD_R * 0.8, MOUSE_HEAD_R * 0.72, PALETTE.mouse);
  const ear = at(0.26, 0.6);
  inked(ear, 0.14, 0.14, PALETTE.mouse);
  fill(
    ellipse({ x: ear.x + 0.02 * facing, y: ear.y - 0.01 }, 0.08),
    PALETTE.mousePink,
  );
  fill(ellipse(at(0.55, 0.34), 0.12, 0.09), PALETTE.mouseLight);
  const nose = at(0.66, 0.36);
  for (const tilt of [-0.28, 0, 0.28]) {
    const angle = (facing > 0 ? 0 : Math.PI) + facing * tilt;
    fill(
      whisker(nose, angle, [WHISKER_LENGTH, WHISKER_WIDTH], hairline),
      PALETTE.ink,
    );
  }
  inked(nose, 0.045, 0.038, PALETTE.mousePink);
  const eye = at(0.45, 0.44);
  fill(ellipse(eye, 0.045, 0.052), PALETTE.mouseEye);
  fill(
    ellipse({ x: eye.x + 0.015 * facing, y: eye.y + 0.018 }, 0.016),
    PALETTE.highlight,
  );
}
