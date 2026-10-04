/**
 * Keeping, played on a fresh meadow: two mushrooms grown, the newest
 * furnished, a flower planted and the light turned to dusk (`keep-before`);
 * the page reloaded, where the same mushrooms, houses and flowers must come
 * back at `#1`, at full dusk (`keep-after`); then `#new` opened, a fresh
 * meadow at `#2` with the opening's two mushrooms, in daylight (`keep-new`).
 */

import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import { DUSK_MS } from '../../src/pages/mushrooms/model/dusk.ts';
import { type Controls, DuskShown, State } from './mushroom-probe-answers.ts';
import {
  type Expect,
  FRAME_MS,
  grow,
  type Page,
  tapSun,
} from './mushroom-probe-drive.ts';
import { plantNearest } from './play-tufts.ts';

/** Frames from the sun's tap to full dusk, with the harness's slack. */
const TO_DUSK = Math.round(DUSK_MS / FRAME_MS) + 20;
/** Wall-clock ms for the newest write to land, past the once-a-second poll. */
const WRITTEN_MS = 1500;

/** What a reload must bring back, and the hash it opened at. */
async function kept(page: Page) {
  const { mushrooms, houses } = await page.evaluate('__probe.state()', State);
  return {
    hash: await page.evaluate('location.hash', z.string()),
    meadow: {
      mushrooms,
      houses,
      planted: await page.evaluate(
        '__probe.scene.meadow.planted.map(({ id }) => id)',
        z.array(z.string()),
      ),
    },
    dusk: await page.evaluate('__probe.dusk()', DuskShown),
  };
}

export async function playKeep(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  await grow(page, controls, controls.picker[0]);
  await grow(page, controls, controls.picker[1]);
  await page.tap(controls.house);
  await page.step(30);
  if (controls.housePicker[0]) await page.tap(controls.housePicker[0]);
  await page.step(6);
  await page.tap(controls.house);
  await page.evaluate(
    "__probe.scene.dispatch({ kind: 'deselect' })",
    z.unknown(),
  );
  expect(await plantNearest(page), 'no tuft took a flower');
  if (!(await tapSun(page, expect))) return;
  await page.step(TO_DUSK);
  await page.shoot('keep-before');
  const before = await kept(page);
  expect(
    before.meadow.houses.some(({ windows }) => windows.length > 0),
    'no house was furnished to keep',
  );
  await sleep(WRITTEN_MS);

  await page.reload();
  await page.step(30);
  await page.shoot('keep-after');
  const after = await kept(page);
  note(
    `kept ${JSON.stringify(before.meadow)}, back ${JSON.stringify(after.meadow)}`,
  );
  expect(after.hash === '#1', `the reload opened at ${after.hash}, not #1`);
  expect(
    JSON.stringify(after.meadow) === JSON.stringify(before.meadow),
    'the reload did not bring back the mushrooms, houses and flowers',
  );
  expect(
    after.dusk.toward === 'dusk' && after.dusk.level === 1,
    `the reload opened at ${String(after.dusk.level)} toward ${after.dusk.toward}, not dusk`,
  );

  await page.reload('#new');
  await page.step(30);
  await page.shoot('keep-new');
  const fresh = await kept(page);
  expect(fresh.hash === '#2', `#new opened at ${fresh.hash}, not #2`);
  expect(
    fresh.meadow.mushrooms.length === 2 && fresh.meadow.planted.length === 0,
    `#new opened on ${JSON.stringify(fresh.meadow)}, not a fresh meadow`,
  );
  expect(
    fresh.dusk.toward === 'day' && fresh.dusk.level === 0,
    `#new opened at ${String(fresh.dusk.level)} toward ${fresh.dusk.toward}, not day`,
  );
}
