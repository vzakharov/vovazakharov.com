/** The page `play-mushrooms.ts` drives, its keys, and the moves a play makes on it. */

import { z } from 'zod';

import { wrap } from '../../src/pages/mushrooms/model/geometry.ts';
import {
  type Box,
  Clouds,
  type Controls,
  Eye,
  type Point,
  SunAt,
} from './mushroom-probe-answers.ts';

/** The arrow keys, by their DOM `key`, and the key code each goes down with. */
const ARROWS = {
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
} as const;
export type Arrow = keyof typeof ARROWS;

/**
 * The letter keys a play presses, by their DOM `code`, and the key code each
 * goes down with: `l` the note G, `h` D, `k` F, `o` F♯, `p` G♯, `y` C♯.
 */
const LETTERS = {
  KeyL: 76,
  KeyH: 72,
  KeyK: 75,
  KeyO: 79,
  KeyP: 80,
  KeyY: 89,
} as const;
export type Letter = keyof typeof LETTERS;

/** The strafing keys a play holds, by their DOM `code`: `c` rightward. */
const STRAFES = { KeyC: 67 } as const;
export type Strafe = keyof typeof STRAFES;

/** The keys that work the map: Escape shuts it, `m` opens and shuts it. */
const MAP_KEYS = { Escape: 27, KeyM: 77 } as const;
type MapKey = keyof typeof MAP_KEYS;

/** Every key a play presses, and the key code it goes down with. */
export const KEY_CODES = {
  ...ARROWS,
  ...LETTERS,
  ...STRAFES,
  ...MAP_KEYS,
} as const;

/** A stepped frame's game time, in ms. */
export const FRAME_MS = 1000 / 60;

/** The page `play-mushrooms.ts` drives, a frame and a tap at a time. */
export type Page = {
  evaluate: <Parsed>(
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed>;
  /**
   * The page loaded again, in the same browser context and so with its
   * storage — reloaded, or opened at `/mushrooms` plus `hash` (`#new`) — and
   * the game's probe put back once it is up.
   */
  reload: (hash?: string) => Promise<void>;
  /** The page's browser context thrown away, its storage with it. */
  close: () => Promise<unknown>;
  step: (frames: number) => Promise<void>;
  /**
   * `frames` frames stepped and none drawn, `expression` read after each and
   * parsed by `schema`: how something moves frame by frame.
   */
  trace: <Parsed>(
    frames: number,
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed[]>;
  /** The JS time of every frame `step` has drawn, in ms. */
  rendered: readonly number[];
  tap: (point: z.infer<typeof Point>) => Promise<void>;
  /**
   * One finger pressed at `from`, moved to `to` over `frames` frames, one
   * move a frame, and lifted: a pan, or a tap where it moves less than the
   * slop. Every touch carries the frames' clock, as a real finger's does.
   */
  drag: (
    from: z.infer<typeof Point>,
    to: z.infer<typeof Point>,
    frames: number,
  ) => Promise<void>;
  /**
   * `drag`, with `expression` read after each move and parsed by `schema`:
   * what the finger moved, move by move, up to its lift.
   */
  dragTraced: <Parsed>(
    from: z.infer<typeof Point>,
    to: z.infer<typeof Point>,
    frames: number,
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed[]>;
  /**
   * A key going down or up, by its DOM `code`, as `ArrowLeft`; a `repeat` is
   * the browser's own repeat of a held key's press.
   */
  key: (
    key: Arrow | Letter | Strafe | MapKey,
    type: 'keyDown' | 'keyUp',
    held?: { repeat?: boolean },
  ) => Promise<void>;
  /** The screen turned: its width and height swapped. */
  turn: () => Promise<void>;
  /** A frame of the whole screen, or of `clip` alone. */
  shoot: (step: string, clip?: z.infer<typeof Box>) => Promise<void>;
};

export type Expect = (holds: boolean, message: string) => void;

/**
 * The eye turned and walked in, as a child looks round before tapping: `→`
 * held ¾ s, the meadow sliding across the screen, then `↑` held ½ s, each
 * let go and left to come to rest. Returns a line saying how far it turned
 * and walked.
 */
export async function walkAndTurn(page: Page): Promise<string> {
  const eye = async () => page.evaluate('__probe.eye()', Eye);
  const holdFor = async (key: Arrow, frames: number) => {
    await page.key(key, 'keyDown');
    await page.step(frames);
    await page.key(key, 'keyUp');
    await page.step(150);
  };
  const from = await eye();
  await holdFor('ArrowRight', 45);
  await holdFor('ArrowUp', 30);
  const to = await eye();
  return `the eye turned ${wrap(to.heading - from.heading).toFixed(3)} rad and walked ${(to.walked - from.walked).toFixed(2)} units`;
}

/** A key struck: down and up, with no frame between. */
export async function press(
  page: Page,
  key: Parameters<Page['key']>[0],
): Promise<void> {
  await page.key(key, 'keyDown');
  await page.key(key, 'keyUp');
}

/** A mushroom grown as a child grows one: `+` tapped, then `cap` of the picker, each left to settle. */
export async function grow(
  page: Page,
  controls: z.infer<typeof Controls>,
  cap: z.infer<typeof Point> | undefined,
): Promise<void> {
  await page.tap(controls.plus);
  await page.step(30);
  if (cap) await page.tap(cap);
  await page.step(90);
}

/** Whatever is selected let go, with no tap that could land on something else. */
export async function deselect(page: Page): Promise<void> {
  await page.evaluate(
    "__probe.scene.dispatch({ kind: 'deselect' })",
    z.unknown(),
  );
}

/** `ids`, the mushrooms',from the one drawn furthest back to the one in front. */
export async function backToFront(
  page: Page,
  ids: readonly string[],
): Promise<string[]> {
  const depths = await Promise.all(
    ids.map(async (id) => ({
      id,
      depth: await page.evaluate(
        `__probe.depth(${JSON.stringify(id)})`,
        z.number(),
      ),
    })),
  );
  return depths.toSorted((a, b) => a.depth - b.depth).map(({ id }) => id);
}

/** Where `Page.drag`'s finger stands after each of its `frames` moves from `from` to `to`. */
export function dragMoves(
  from: z.infer<typeof Point>,
  to: z.infer<typeof Point>,
  frames: number,
): Array<z.infer<typeof Point>> {
  return Array.from({ length: frames }, (_, index) => {
    const along = (index + 1) / frames;
    return {
      x: from.x + (to.x - from.x) * along,
      y: from.y + (to.y - from.y) * along,
    };
  });
}

/** Runs `each` over `items` one after another, as taps on one page must. */
export async function inTurn<Item>(
  items: readonly Item[],
  each: (item: Item) => Promise<void>,
): Promise<void> {
  const [first, ...rest] = items;
  if (first === undefined) return;
  await each(first);
  return inTurn(rest, each);
}

/** `frames` frames stepped one by one, each drawn; returns each one's update in ms. */
export async function timedSteps(
  page: Page,
  frames: number,
): Promise<number[]> {
  const from = page.rendered.length;
  await inTurn(
    Array.from({ length: frames }, (_, index) => index),
    async () => page.step(1),
  );
  return page.rendered.slice(from);
}

/** Taps the first cloud a tap reaches on the screen and returns where; `undefined`, the miss expected, where none is. */
export async function tapCloud(
  page: Page,
  expect: Expect,
): Promise<z.infer<typeof Point> | undefined> {
  const cloud = (await page.evaluate('__probe.clouds()', Clouds)).find(
    (point) => point !== null,
  );
  expect(cloud !== undefined, 'no cloud a tap reaches on the screen');
  if (cloud) await page.tap(cloud);
  return cloud;
}

/** Taps the sun, or the moon risen in its place, and returns where; `undefined`, the miss expected, while it stands off the screen. */
export async function tapSun(
  page: Page,
  expect: Expect,
): Promise<z.infer<typeof Point> | undefined> {
  const sun = await page.evaluate('__probe.sunAt()', SunAt);
  expect(sun !== null, 'no sun on the screen to tap');
  if (!sun) return undefined;
  await page.tap(sun);
  return sun;
}
