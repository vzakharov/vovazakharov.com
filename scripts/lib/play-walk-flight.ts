/**
 * A ground drag in flight carries the ground under the finger: the gait
 * button flipped to flight and the rise waited out, a drag down the screen
 * keeps the ground it crossed at within `UNDER_SHARE` of its swipe on every
 * move, read at flight's eye height; the button then flips it back to steps.
 */

import type { z } from 'zod';

import {
  gaitHeight,
  RISE_EASE,
} from '../../src/pages/mushrooms/model/eye-height.ts';
import { SLOP } from '../../src/pages/mushrooms/model/pan.ts';
import { planeSeen, viewOf } from '../../src/pages/mushrooms/model/pinhole.ts';
import {
  type Camera,
  type Controls,
  Eye,
  Point,
} from './mushroom-probe-answers.ts';
import { dragMoves, type Expect, type Page } from './mushroom-probe-drive.ts';
import { BARE_START } from './play-taps.ts';
import { FPS, type Seen } from './play-walk-checks.ts';

/** How far off the finger, as a share of its swipe, the ground under it may stand while it is down. */
const UNDER_SHARE = 0.03;
/** Moves the drag takes, one a frame. */
const DRAG_MOVES = 12;
/** Frames past the rise's ease for the far things' repaints to settle. */
const RISEN = Math.ceil(RISE_EASE * FPS) + 30;

/**
 * The point a drag from `from` toward `to` locks its ground at: `SLOP` along
 * the way, where the finger crossed out of a tap (`walk.ts`'s crossing).
 */
function crossingOf(
  from: z.infer<typeof Point>,
  to: z.infer<typeof Point>,
): z.infer<typeof Point> {
  const reach = Math.hypot(to.x - from.x, to.y - from.y);
  return {
    x: from.x + ((to.x - from.x) * SLOP) / reach,
    y: from.y + ((to.y - from.y) * SLOP) / reach,
  };
}

/**
 * A drag down the screen from bare ground in flight, the finger at `fingers`
 * and the eye at `eyes` move by move from `pressed` at `start`: on every move
 * past the slop, and at the lift, its last, the ground under the crossing
 * stands at the finger's row within `UNDER_SHARE` of the swipe.
 */
function checkUnderFinger(
  camera: z.infer<typeof Camera>,
  pressed: Seen,
  start: z.infer<typeof Point>,
  fingers: ReadonlyArray<z.infer<typeof Point>>,
  eyes: readonly Seen[],
  expect: Expect,
  note: (line: string) => void,
): void {
  const lens = { ...camera, eyeHeight: gaitHeight('flight') };
  const lifted = fingers.at(-1) ?? start;
  const crossing = crossingOf(start, lifted);
  const ground = planeSeen(lens, pressed, crossing);
  if (!ground) {
    throw new Error(
      `no ground under the crossing (${crossing.x.toFixed(0)}, ${crossing.y.toFixed(0)})`,
    );
  }
  const offs = fingers.flatMap((finger, index) => {
    const eye = eyes[index];
    const past = Math.hypot(finger.x - start.x, finger.y - start.y) > SLOP;
    return eye && past ? [viewOf(lens, eye, ground, 0).y - finger.y] : [];
  });
  const swipe = Math.abs(lifted.y - start.y);
  const worst = Math.max(...offs.map((off) => Math.abs(off)));
  expect(
    offs.length > 0 && worst <= UNDER_SHARE * swipe,
    `a drag in flight left the ground under its crossing up to ${worst.toFixed(1)} px off the finger over ${String(offs.length)} moves, past ${(UNDER_SHARE * 100).toFixed(0)} % of its ${swipe.toFixed(0)} px swipe`,
  );
  note(
    `a drag in flight: the ground under its crossing at most ${worst.toFixed(1)} px off the finger over ${String(offs.length)} moves, ${(offs.at(-1) ?? 0).toFixed(1)} at the lift`,
  );
}

export async function playFlightDrag(
  page: Page,
  controls: z.infer<typeof Controls>,
  camera: z.infer<typeof Camera>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const eye = async () => page.evaluate('__probe.eye()', Eye);
  const flip = async (gait: Seen['gait']) => {
    await page.tap(controls.gait);
    await page.step(RISEN);
    const now = (await eye()).gait;
    expect(now === gait, `the gait button left the gait ${now}, not ${gait}`);
  };
  await flip('flight');
  const from = await page.evaluate(BARE_START, Point.nullable());
  if (from === null) {
    note('no bare ground to drag from: the flight drag is not played');
  } else {
    const pressed = await eye();
    const down = {
      ...from,
      y: Math.min(pressed.height - 4, from.y + 0.25 * pressed.height),
    };
    const held = await page.dragTraced(
      from,
      down,
      DRAG_MOVES,
      '__probe.eye()',
      Eye,
    );
    checkUnderFinger(
      camera,
      pressed,
      from,
      dragMoves(from, down, DRAG_MOVES),
      held,
      expect,
      note,
    );
    await page.step(RISEN);
  }
  await flip('steps');
}
