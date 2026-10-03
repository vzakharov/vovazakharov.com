/**
 * The worms' part of `play-house.ts`, on the clump it furnished: the front
 * cap's outermost window tapped, swinging open before its worm comes out,
 * the worm crawling to the far end of the row, a second tap leaving its
 * course, the far window open as it goes in and both shut after; the back
 * cap's one window tapped, its worm peeking and the window shut after. Each screen's window reach, the worm's girth and the cap its
 * mushroom keeps are printed with the mushroom they were taken on, for the
 * eye that looks at the frames.
 */

import type { z } from 'zod';

import { FURNISHINGS } from '../../src/pages/mushrooms/model/house.ts';
import {
  WINDOW_SWING,
  WORM_GIRTH_LEAST,
} from '../../src/pages/mushrooms/model/worm.ts';
import {
  Box,
  type Controls,
  Pose,
  State,
  Top,
  Windows,
  Worm,
} from './mushroom-probe-answers.ts';
import {
  backToFront,
  type Expect,
  FRAME_MS,
  type Page,
} from './mushroom-probe-drive.ts';

const ROUND = FURNISHINGS.indexOf('round');
/** The frames a window takes to swing open, less the two a tap steps. */
const SWINGING = Math.ceil((WINDOW_SWING * 1000) / FRAME_MS) - 1;

export async function playWorms(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const state = async () => page.evaluate('__probe.state()', State);
  const read = async <Parsed>(
    reader: string,
    id: string,
    schema: z.ZodType<Parsed>,
  ) => page.evaluate(`__probe.${reader}(${JSON.stringify(id)})`, schema);
  const { mushrooms } = await state();
  const [back, front] = await backToFront(page, mushrooms);
  if (front === undefined) return;

  /** A frame of `id` and a third of its width round it, where a worm a few px thick can be seen. */
  const shootClose = async (name: string, id: string) => {
    const { x, y, width, height } = await read('bounds', id, Box);
    const pad = width / 3;
    await page.shoot(name, {
      x: x - pad,
      y: y - pad,
      width: width + 2 * pad,
      height: height + 2 * pad,
    });
  };

  /** A tap on window `index` of `id`, which must reach that window and leave the selection be. */
  const tapWindow = async (id: string, index: number) => {
    const { reaches } = await read('windows', id, Windows);
    const at = reaches[index];
    if (!at) throw new Error(`No window ${String(index)} on ${id}`);
    const top = await page.evaluate(
      `__probe.topAt(${JSON.stringify(at)})`,
      Top,
    );
    expect(
      top === `window:${id}:${String(index)}`,
      `a tap on window ${String(index)} reaches ${String(top)}`,
    );
    const { selected } = await state();
    await page.tap(at);
    await page.step(2);
    expect((await state()).selected === selected, 'a window tap selected');
    return reaches;
  };

  const { reaches, capLeft } = await read('windows', front, Windows);
  const outermost = reaches.length - 1;
  /** The worm of `id` just tapped: still in, its window swinging open; then, once open, out. */
  const swingOut = async (id: string) => {
    const opening = await read('worm', id, Worm);
    expect(
      opening.phase === null && opening.fromOpen > 0 && opening.fromOpen < 1,
      `a tapped window ${opening.fromOpen.toFixed(2)} open, its worm ` +
        `${String(opening.phase)}, before it comes out`,
    );
    await page.step(SWINGING);
    const out = await read('worm', id, Worm);
    expect(out.fromOpen === 1, `the window ${out.fromOpen.toFixed(2)} open`);
    return out;
  };

  await tapWindow(front, outermost);
  const set = await swingOut(front);
  await shootClose('w0-window-open', front);
  const { mushrooms: ids, species } = await state();
  const pose = await read('pose', front, Pose);
  note(
    `on the front ${String(species[ids.indexOf(front)])}, its house at ` +
      `${String(pose?.house.toFixed(2))}x: ` +
      `window reach ${reaches[0]?.r.toFixed(1) ?? '-'} px, ` +
      `the front cap keeps ${(capLeft * 100).toFixed(0)}%, ` +
      `its worm ${String(set.girth?.toFixed(1))} px thick`,
  );
  expect(set.phase === 'out', `a window tap gave a worm ${String(set.phase)}`);
  expect(
    set.girth !== null && set.girth >= WORM_GIRTH_LEAST,
    `the worm is ${String(set.girth?.toFixed(1))} px thick`,
  );
  await page.step(18);
  await shootClose('w1-worm-out', front);
  await page.step(30);
  await shootClose('w2-worm-crawl', front);
  await tapWindow(front, outermost);
  const wriggled = await read('worm', front, Worm);
  expect(wriggled.to === set.to, 'a second tap turned the worm');
  await page.step(8);
  await shootClose('w3-worm-wriggle', front);
  const target = set.to === null ? undefined : reaches[set.to];
  /** Steps until `id`'s worm has its far window open, `frames` frames at the most. */
  const farOpen = async (
    id: string,
    frames: number,
  ): Promise<z.infer<typeof Worm>> => {
    const worm = await read('worm', id, Worm);
    if (worm.toOpen === 1 || frames <= 0) return worm;
    await page.step(1);
    return farOpen(id, frames - 1);
  };
  const nearing = await farOpen(front, 150);
  expect(
    nearing.toOpen === 1 && nearing.phase === 'crawl',
    `the far window ${nearing.toOpen.toFixed(2)} open as the worm is ${String(
      nearing.phase,
    )}`,
  );
  await shootClose('w5-window-target', front);
  const trace = await page.trace(120, `__probe.worm("${front}")`, Worm);
  const last = trace.flatMap(({ head }) => (head ? [head] : [])).at(-1);
  expect(
    trace.every(({ phase, toOpen }) => phase !== 'in' || toOpen === 1),
    'the worm went in at a window not open',
  );
  const after = trace.at(-1);
  expect(
    after?.fromOpen === 0 && after.toOpen === 0,
    `the windows left ${String(after?.fromOpen.toFixed(2))} and ` +
      `${String(after?.toOpen.toFixed(2))} open after the worm went in`,
  );
  expect(
    trace.at(-1)?.phase === null &&
      last !== undefined &&
      target !== undefined &&
      Math.hypot(last.x - target.x, last.y - target.y) < target.r,
    'the worm did not go in at the far window',
  );

  // The back cap's one window: a peek. Put one in where it has none.
  if (back === undefined) return;
  let windows = (await read('windows', back, Windows)).reaches;
  if (windows.length === 0 && (await state()).selected === back) {
    await page.tap(controls.house);
    await page.step(30);
    const round = controls.housePicker[ROUND];
    if (round) await page.tap(round);
    await page.step(45);
    await page.tap(controls.house);
    await page.step(12);
    windows = (await read('windows', back, Windows)).reaches;
  }
  if (windows.length !== 1) {
    note(`no peek: the back cap has ${String(windows.length)} windows`);
    return;
  }
  await tapWindow(back, 0);
  expect((await swingOut(back)).phase === 'peek', 'a lone window did not peek');
  await page.step(34);
  expect(
    (await read('worm', back, Worm)).head !== null,
    'the peeking worm lost its head as it looked about',
  );
  await shootClose('w4-worm-peek', back);
  await page.step(60);
  expect(
    (await read('worm', back, Worm)).phase === null,
    'the peeking worm stayed out',
  );
  await page.step(10);
  expect(
    (await read('worm', back, Worm)).fromOpen === 0,
    'the peek left its window open',
  );
}
