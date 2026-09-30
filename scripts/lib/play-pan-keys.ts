/**
 * The arrow keys held on the meadow, for `play-pan.ts`: `→` then `←` held a
 * while each from the middle, and held on to either end of the world. Traced
 * frame by frame, a held key turns the crop one way only, never faster than
 * its cruise, easing in from the press through the browser's repeats and
 * easing out to rest on the release, softly at a world's end.
 */

import { z } from 'zod';

import {
  CRUISE_ACROSS,
  type Direction,
  KEY_EASE,
} from '../../src/pages/mushrooms/model/pan.ts';
import { type Crop, type Expect, inTurn, type Page } from './mushroom-probe.ts';

type Key = 'ArrowLeft' | 'ArrowRight';

/** Which way `key` turns the crop. */
const towardOf = (key: Key): Direction => (key === 'ArrowRight' ? 1 : -1);

export type CropOf = () => Promise<z.infer<typeof Crop>>;

/** How near two crops' edges, in CSS px, count as one: the easing's float left over. */
export const SAME = 0.5;
/** How long each key is held from the middle, in frames: past its ease, short of either end. */
const HELD_FRAMES = 36;
/** Frames between a held key's repeats, as a browser's own come about every 33 ms. */
const REPEAT_FRAMES = 2;
/** Frames enough for a let-go key's turn to come to rest, with room to spare. */
const REST_FRAMES = 30;
/** The most frames a walk to a world's end holds its key, a world being a few screens across. */
const WALK_FRAMES = 1200;

/** One traced frame: the scene's clock, in seconds, and the crop's left edge. */
const Frame = z.tuple([z.number(), z.number()]);
const FRAME = '[__probe.scene.clock, __probe.crop().left]';

/** Holds `key` over `frames` frames, a repeat every `REPEAT_FRAMES`, or until `enough` holds of the latest left edge; returns every frame. */
async function holding(
  page: Page,
  key: Key,
  frames: number,
  enough: (left: number) => boolean = () => false,
): Promise<Array<z.infer<typeof Frame>>> {
  await page.key(key, 'keyDown');
  const held = async (
    seen: Array<z.infer<typeof Frame>>,
  ): Promise<Array<z.infer<typeof Frame>>> => {
    const latest = seen.at(-1);
    if (seen.length >= frames || (latest && enough(latest[1]))) return seen;
    const more = await page.trace(REPEAT_FRAMES, FRAME, Frame);
    await page.key(key, 'keyDown', true);
    return held([...seen, ...more]);
  };
  const seen = await held([]);
  await page.key(key, 'keyUp');
  return seen;
}

/** What a stretch of traced frames is checked against: which way it turns, how fast it may, and what it is called in a message. */
type Turning = { toward: Direction; cruise: number; what: string };

/** How far a traced frame moved the crop the key's way, and the time it took. */
type Move = { by: number; over: number };

/** Each traced frame's move after the one before it, `toward` the key's way, and the time it took. */
function moves(
  frames: ReadonlyArray<z.infer<typeof Frame>>,
  toward: Direction,
): Move[] {
  return frames.slice(1).map(([clock, left], index) => {
    const [was, before] = frames[index] ?? [clock, left];
    return { by: toward * (left - before), over: clock - was };
  });
}

/** Holds `key` as `holding` does, tracing from the frame before the press to `REST_FRAMES` after the release: the moves while held, and after. */
async function traced(
  page: Page,
  key: Key,
  frames: number,
  enough?: (left: number) => boolean,
): Promise<{
  held: Move[];
  after: Move[];
  from: number;
  letGo: number;
  rest: number;
}> {
  const start = await page.evaluate(FRAME, Frame);
  const holds = await holding(page, key, frames, enough);
  const after = await page.trace(REST_FRAMES, FRAME, Frame);
  const all = moves([start, ...holds, ...after], towardOf(key));
  return {
    held: all.slice(0, holds.length),
    after: all.slice(holds.length),
    from: start[1],
    letGo: holds.at(-1)?.[1] ?? start[1],
    rest: after.at(-1)?.[1] ?? start[1],
  };
}

/** Every frame moves the key's way, if at all, and none faster than the cruise. */
function turnsSmoothly(
  steps: readonly Move[],
  { cruise, what }: Turning,
  expect: Expect,
): void {
  const back = steps.find(({ by }) => by < -1e-6);
  expect(back === undefined, `${what} moved back by ${String(back?.by)} px`);
  const leap = steps.find(({ by, over }) => by > cruise * over + SAME);
  expect(
    leap === undefined,
    `${what} leapt ${String(leap?.by)} px in a frame, past the cruise's ${(cruise * (leap?.over ?? 0)).toFixed(1)}`,
  );
}

/** The frames of the first `KEY_EASE` after a press each move farther than the last, from well under the cruise. */
function easesIn(
  steps: readonly Move[],
  { cruise, what }: Turning,
  expect: Expect,
): void {
  const [first] = steps;
  const easing = steps.filter(
    (_, index) =>
      steps.slice(0, index + 1).reduce((sum, { over }) => sum + over, 0) <=
      KEY_EASE,
  );
  expect(
    first !== undefined && first.by < 0.5 * cruise * first.over,
    `${what} set off at ${String(first?.by)} px in its first frame, not eased in`,
  );
  expect(
    easing.length > 3 &&
      easing.every(({ by }, index) => by > (easing[index - 1]?.by ?? 0)),
    `${what} did not gather speed over its ease: ${easing.map(({ by }) => by.toFixed(1)).join(' ')}`,
  );
}

/** After the release (or on braking at an end), the frames that move each move less than the last, the last well under the cruise, then none. */
function stopsSoftly(
  steps: readonly Move[],
  { cruise, what }: Turning,
  expect: Expect,
): void {
  const moving = steps.filter(({ by }) => by > 1e-6);
  const last = moving.at(-1);
  expect(
    moving.every(({ by }, index) => by <= (moving[index - 1]?.by ?? by) + 1e-6),
    `${what} did not slow to its stop: ${moving.map(({ by }) => by.toFixed(1)).join(' ')}`,
  );
  expect(
    last === undefined || last.by < 0.3 * cruise * last.over,
    `${what} stopped from ${String(last?.by)} px a frame, not softly`,
  );
  expect(
    (steps.at(-1)?.by ?? 0) < 1e-6,
    `${what} was still moving ${String(REST_FRAMES)} frames after`,
  );
}

/** `→` then `←`, each held `HELD_FRAMES` from where the crop rests and let go; then `→` held on to the world's right end. */
export async function playKeys(
  page: Page,
  crop: CropOf,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  await inTurn(['ArrowRight', 'ArrowLeft'] as const, async (key) => {
    const { width } = await crop();
    const turning: Turning = {
      toward: towardOf(key),
      cruise: CRUISE_ACROSS * width,
      what: `${key} held`,
    };
    const { held, after, from, letGo, rest } = await traced(
      page,
      key,
      HELD_FRAMES,
    );
    turnsSmoothly([...held, ...after], turning, expect);
    easesIn(held, turning, expect);
    const fastest = Math.max(...held.map(({ by, over }) => by / over));
    expect(
      Math.abs(fastest - turning.cruise) < 0.02 * turning.cruise,
      `${key} held cruised at ${fastest.toFixed(0)} px/s, not ${turning.cruise.toFixed(0)}`,
    );
    stopsSoftly(after, { ...turning, what: `${key} let go` }, expect);
    const { toward } = turning;
    note(
      `${key} held ${String(HELD_FRAMES)} frames: cruised at ${fastest.toFixed(0)} px/s, turned the crop ${(toward * (rest - from)).toFixed(1)} px, ${(toward * (rest - letGo)).toFixed(1)} of it after the release`,
    );
  });
  await walkTo(page, crop, 'ArrowRight', expect);
}

/**
 * Holds `key` until the crop stands at the world's end it points to, which
 * it reaches softly, or until it passes `until` where given, easing to rest
 * a little past it.
 */
export async function walkTo(
  page: Page,
  crop: CropOf,
  key: Key,
  expect: Expect,
  until?: number,
): Promise<void> {
  const { left, world, width } = await crop();
  const toward = towardOf(key);
  const end = toward === 1 ? world - width : 0;
  const goal = until ?? end;
  const passed = (at: number) =>
    toward * (at - goal) >= 0 || Math.abs(at - end) < SAME;
  if (passed(left)) return;
  const { held, after, rest } = await traced(page, key, WALK_FRAMES, passed);
  const turning: Turning = {
    toward,
    cruise: CRUISE_ACROSS * width,
    what: `${key} held to ${until === undefined ? "the world's end" : String(until)}`,
  };
  const steps = [...held, ...after];
  turnsSmoothly(steps, turning, expect);
  if (until !== undefined) return;
  expect(
    Math.abs(rest - end) < SAME,
    `${turning.what} rested at ${rest.toFixed(1)}, not ${end.toFixed(1)}`,
  );
  // Past the cruise, the braking into the end.
  const braking = steps.findIndex(
    ({ by }, index) => by < (steps[index - 1]?.by ?? 0) - 1e-6,
  );
  stopsSoftly(steps.slice(Math.max(0, braking)), turning, expect);
}
