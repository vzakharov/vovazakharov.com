/**
 * After a shower, `play-mushrooms.ts`'s run on a fresh meadow: a cloud tapped,
 * the shower left to stop, and the frame the shed lands on found; the spores
 * caught mid-fall, the sprouts as they pop up, and again grown a while. It
 * fails where an old mushroom stands in sight and nothing sprouts, where a
 * sprout shows before its spores land, or stands off its parent; how they
 * look is for the eye, in the frames.
 */

import type { z } from 'zod';

import {
  SPORE_FALL_MS,
  SPROUTS,
} from '../../src/pages/mushrooms/model/sprouting.ts';
import { RAIN_MS } from '../../src/pages/mushrooms/model/weather.ts';
import { SPROUT_REACH } from '../../src/pages/mushrooms/ui/scene/mushroom-room.ts';
import {
  Clouds,
  type Controls,
  type Expect,
  inTurn,
  type Page,
  Sprouts,
} from './mushroom-probe.ts';

const FRAME_MS = 1000 / 60;
const STOP = Math.ceil(RAIN_MS / FRAME_MS);
/** Frames past the stop the shed is looked for in, the harness's slack. */
const SEEK = 30;
/** Frames from the shed to the look at the spores mid-fall. */
const FALLING = 30;
/** Frames from the shed to the look at the sprouts just up, their pop played. */
const POPPED = Math.ceil(SPORE_FALL_MS / FRAME_MS) + 18;
/** Frames from the pop to the look at the sprouts grown: 20 s. */
const GROWING = 1200;
/** Frames after the pop drawn one by one. */
const TIMED = 24;
/**
 * How far off its parent's foot, in `SPROUT_REACH`es, a sprout's may stand
 * on the screen: the reach is laid out at the clump's front foot, and the
 * ground nearer the eye stands larger.
 */
const SLACK = 1.5;

export async function playSprouts(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const read = async () => page.evaluate('__probe.sprouts()', Sprouts);
  const cloud = (await page.evaluate('__probe.clouds()', Clouds)).find(
    (point) => point !== null,
  );
  if (!cloud) {
    expect(false, 'no cloud a tap reaches on the screen');
    return;
  }
  await page.tap(cloud);
  await page.step(STOP - 1);
  const seek = async (left: number): Promise<boolean> => {
    if ((await read()).shed !== null) return true;
    if (left === 0) return false;
    await page.step(1);
    return seek(left - 1);
  };
  const shedFound = await seek(SEEK);
  expect(shedFound, `no shed within ${String(SEEK)} frames of the stop`);
  if (!shedFound) return;
  const shed = await read();
  const cost = page.rendered.at(-1) ?? Number.NaN;
  note(
    `shed: ${String(shed.sprouts.length)} sprouts, ${String(shed.oldInSight)} old in sight, its frame ${cost.toFixed(1)} ms`,
  );
  expect(
    shed.oldInSight === 0 || shed.sprouts.length > 0,
    `${String(shed.oldInSight)} old mushrooms in sight, and nothing sprouted`,
  );
  expect(
    shed.sprouts.length <= SPROUTS,
    `${String(shed.sprouts.length)} sprouts, over ${String(SPROUTS)}`,
  );
  for (const { id, parent, ofParent, apart } of shed.sprouts) {
    note(`${id} of ${parent}: ${apart?.toFixed(2) ?? 'no parent'} apart`);
    expect(ofParent, `${id} is not of ${parent}'s species`);
    expect(
      apart !== null && apart <= SPROUT_REACH * SLACK,
      `${id} stands ${apart?.toFixed(2) ?? 'with no parent'} clump sizes off ${parent}`,
    );
  }

  await page.step(FALLING);
  const falling = await read();
  for (const { id, shown } of falling.sprouts) {
    expect(!shown, `${id} shows while its spores fall`);
  }
  await page.shoot('sprouts-1-fall');

  await page.step(POPPED - FALLING);
  const popped = await read();
  for (const { id, shown } of popped.sprouts) {
    expect(shown, `${id} not up once its spores landed`);
  }
  await page.shoot('sprouts-2-pop');

  // The frames after the pop drawn one by one, for the run's frame budget:
  // the long steps around them each draw a single frame.
  await inTurn(
    Array.from({ length: TIMED }, (_, index) => index),
    async () => page.step(1),
  );
  await page.step(GROWING - TIMED);
  const grown = await read();
  for (const { id, scale } of grown.sprouts) {
    const before = popped.sprouts.find((sprout) => sprout.id === id);
    note(
      `${id}: ${before?.scale.toFixed(2) ?? '?'} popped, ${scale.toFixed(2)} 20 s on`,
    );
    expect(
      before !== undefined && scale > before.scale,
      `${id} did not grow in 20 s`,
    );
  }
  await page.shoot('sprouts-3-grown');
}
