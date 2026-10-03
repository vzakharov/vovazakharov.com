/**
 * The worms' part of `play-house.ts`, on the clump it furnished: the front
 * cap's outermost window tapped, its worm crawling to the far end of the row
 * and a second tap leaving its course; the back cap's one window tapped, its
 * worm peeking. Each screen's window reach and the cap its mushroom keeps
 * are printed for the eye that looks at the frames.
 */

import { z } from 'zod';

import { WORM_GIRTH_LEAST } from '../../src/pages/mushrooms/model/worm.ts';
import {
  Box,
  type Controls,
  type Expect,
  type Page,
  State,
  Top,
  Windows,
  Worm,
} from './mushroom-probe.ts';

/** The house picker's round window, in `FURNISHINGS`' order. */
const ROUND = 1;

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
  const depths = await Promise.all(
    mushrooms.map(async (id) => ({
      id,
      depth: await read('depth', id, z.number()),
    })),
  );
  const [back, front] = depths
    .toSorted((a, b) => a.depth - b.depth)
    .map(({ id }) => id);
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
  await tapWindow(front, outermost);
  const set = await read('worm', front, Worm);
  note(
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
  const trace = await page.trace(120, `__probe.worm("${front}")`, Worm);
  const last = trace.flatMap(({ head }) => (head ? [head] : [])).at(-1);
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
  expect(
    (await read('worm', back, Worm)).phase === 'peek',
    'a lone window did not peek',
  );
  await page.step(34);
  await shootClose('w4-worm-peek', back);
  await page.step(60);
  expect(
    (await read('worm', back, Worm)).phase === null,
    'the peeking worm stayed out',
  );
}
