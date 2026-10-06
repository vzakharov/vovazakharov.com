/**
 * The meadow's part of `play-mushrooms.ts`'s tap sequence, and the order the
 * rest is played in on one meadow: `+` opening the picker and a pick growing
 * and selecting a mushroom, a tap selecting one, `−` sinking it with its
 * house and then taking the newest, the last, and shaking its head on an
 * empty meadow, a tap on a flower closing the picker and opening the flower,
 * and the map button opening and shutting — with the house, the insects and
 * the buzzers played between, and last the insects following the eye walked
 * away from them.
 */

import { z } from 'zod';

import {
  type Controls,
  Flower,
  Point,
  Pose,
  State,
} from './mushroom-probe-answers.ts';
import type { Expect, Page } from './mushroom-probe-drive.ts';
import { playBuzzers } from './play-buzzers.ts';
import { playHouse } from './play-house.ts';
import { playFollow, playInsects } from './play-insects.ts';

export async function playMeadow(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const state = async () => page.evaluate('__probe.state()', State);
  await page.step(30);
  await page.shoot('0-open');
  const opening = await state();
  await playHouse(page, controls, expect, note);

  await page.tap(controls.plus);
  await page.step(30);
  expect((await state()).picking, '`+` did not open the picker');
  await page.shoot('1-picker');

  const [first] = controls.picker;
  if (first) await page.tap(first);
  // Mid-close: the picked cap popping, the others going back towards `+`.
  await page.step(9);
  await page.shoot('1b-closing');
  await page.step(81);
  const grown = await state();
  expect(
    grown.mushrooms.length === opening.mushrooms.length + 1,
    'a pick grew no mushroom',
  );
  expect(!grown.picking, 'a pick left the picker open');
  expect(
    grown.selected === grown.mushrooms.at(-1),
    'the grown mushroom is not selected',
  );
  await page.shoot('2-grown');

  const [target] = opening.mushrooms;
  if (target !== undefined) {
    const at = await page.evaluate(
      `__probe.mushroom(${JSON.stringify(target)})`,
      Point.nullable(),
    );
    if (at === null)
      expect(false, "no tap on the mushroom to select's cap reaches it");
    else await page.tap(at);
  }
  await page.step(30);
  expect(
    (await state()).selected === target,
    'a tap on a mushroom did not select it',
  );
  await page.shoot('3-selected');

  // The selected mushroom is furnished, so its house sinks with it.
  expect(
    grown.houses[grown.mushrooms.indexOf(target ?? '')]?.door === true,
    'the mushroom to sink has no house',
  );
  await page.tap(controls.minus);
  // Some 0.33 s into its 0.45 s sink, at about half its height.
  await page.step(20);
  const pose = await page.evaluate(
    `__probe.pose(${JSON.stringify(target)})`,
    Pose,
  );
  expect(
    pose !== null &&
      pose.shown &&
      pose.mushroom > 0 &&
      pose.mushroom < 1 &&
      pose.house === pose.mushroom,
    `mid-sink, the house does not sink with its mushroom: ${JSON.stringify(pose)}`,
  );
  await page.shoot('4a-sinking');
  await page.step(70);
  const thinned = await state();
  expect(
    !thinned.mushrooms.includes(target ?? '') &&
      thinned.mushrooms.length === grown.mushrooms.length - 1,
    '`−` did not take the selected mushroom away',
  );
  await page.shoot('4-removed');

  // Nothing is selected now, so `−` takes the newest, then the last one left.
  await page.tap(controls.minus);
  await page.step(60);
  expect(
    (await state()).mushrooms.join(',') ===
      thinned.mushrooms.slice(0, -1).join(','),
    '`−` with nothing selected did not take the newest away',
  );
  await page.tap(controls.minus);
  await page.step(60);
  expect((await state()).mushrooms.length === 0, '`−` left a mushroom');
  await page.tap(controls.minus);
  await page.step(6);
  const { clock: shookBy } = await state();
  const refusedAt = await page.evaluate(
    '__probe.minusRefusedAt()',
    z.number().nullable(),
  );
  expect(
    refusedAt !== null && shookBy - refusedAt < 1,
    '`−` on an empty meadow did not shake its head',
  );
  await page.shoot('5-refused');

  const flower = await page.evaluate('__probe.flower()', Flower);
  if (flower) {
    await page.tap(controls.plus);
    await page.step(30);
    await page.tap(flower);
    await page.step(20);
    expect(!(await state()).picking, 'a tap on a flower left the picker open');
    const { clock } = await state();
    const tappedAt = await page.evaluate(
      `__probe.flowerTappedAt(${JSON.stringify(flower.id)})`,
      z.number().nullable(),
    );
    expect(
      tappedAt !== null && clock - tappedAt < 1,
      'a tap on a flower did not open it',
    );
    await page.shoot('6-flower');
  }

  await page.tap(controls.map);
  await page.step(10);
  expect((await state()).mapOpen, 'the map button did not open the map');
  await page.shoot('7-map');
  await page.tap(controls.map);
  await page.step(10);
  expect(!(await state()).mapOpen, 'the map button did not shut the map');

  await playInsects(page, controls, expect, note);
  await playBuzzers(page, controls, expect, note);
  await playFollow(page, expect, note);
}
