/**
 * The map, `play-mushrooms.ts`'s run on a fresh meadow: the map button
 * pressed, the sheet shot mid-unfold and open, and shut; then mushrooms
 * grown, the newest furnished, a flower planted on a tuft, the eye turned
 * and walked a little, and the map opened again on what the meadow holds
 * now; the `+` picker open as the map opens, and a flick just before it,
 * the map then shut by Escape, which a second press leaves shut; then a
 * russula grown where the flick left the eye, given a door, and the map
 * opened on it.
 * Fails on a map that does not open or shut, one that leaves the child or a
 * flower off the sheet, mirrors the view, or draws fewer things than the
 * meadow holds; on a picker left open over it, or an eye that moves under
 * it; prints its scale.
 */

import { z } from 'zod';

import { FURNISHINGS } from '../../src/pages/mushrooms/model/house.ts';
import { MUSHROOM_SPECIES } from '../../src/pages/mushrooms/model/mushroom-genes.ts';
import {
  type Controls,
  Eye,
  FlowerAt,
  MapShown,
  type Point,
  State,
} from './mushroom-probe-answers.ts';
import {
  type Expect,
  grow,
  inTurn,
  type Page,
  press,
  walkAndTurn,
} from './mushroom-probe-drive.ts';
import { plantNearest } from './play-tufts.ts';

/** Frames into the map's 0.3 s unfold that catch it growing out of its button, short of the overshoot. */
const MID_UNFOLD = 3;
/** Frames for the map to unfold, or fold, all the way. */
const UNFOLDED = 30;
/** How far from the screen's middle, in CSS px, a flower is read as left or right of the heading. */
const OFF_MIDDLE = 20;
/** Every flower the meadow shows, by id, where its container stands on the screen. */
const FLOWERS_SEEN = `[...__probe.scene.flowers.shown]
  .filter(([, { container }]) => container.visible)
  .map(([id, { container }]) => ({ id, ...__probe.toScreen(container) }))`;
/** Where the door stands in the house picker. */
const DOOR = FURNISHINGS.indexOf('door');

const Seen = z.array(FlowerAt);

export async function playMap(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const map = async () => page.evaluate('__probe.map()', MapShown);
  const state = async () => page.evaluate('__probe.state()', State);
  const eyeNow = async () => page.evaluate('__probe.eye()', Eye);
  /** A tap on the sheet, away from the button, shuts it as the button does. */
  const shut = async (screen: z.infer<typeof Eye>, open: string) => {
    await page.tap({ x: screen.width / 2, y: screen.height / 2 });
    await page.step(UNFOLDED);
    expect(
      !(await map()).open,
      `a tap on the open map did not shut it (${open})`,
    );
  };
  /** Escape shuts the open map, and leaves a shut one shut. */
  const escape = async (when: string) => {
    await press(page, 'Escape');
    await page.step(UNFOLDED);
    expect(!(await map()).open, `Escape left the map open (${when})`);
  };
  /** Opens the map, shooting it mid-unfold when `half` names the shot, then open as `open`; checks it, and shuts it. */
  const look = async (open: string, half?: string) => {
    await page.tap(controls.map);
    if (half === undefined) {
      await page.step(UNFOLDED);
    } else {
      await page.step(MID_UNFOLD);
      await page.shoot(half);
      await page.step(UNFOLDED - MID_UNFOLD);
    }
    await page.shoot(open);
    const [shown, eye, seen] = await Promise.all([
      map(),
      eyeNow(),
      page.evaluate(FLOWERS_SEEN, Seen),
    ]);
    expect(shown.open, `the map button did not open the map (${open})`);
    const { drawn } = shown;
    if (drawn) {
      const { child, ahead, flowers, things, scale } = drawn;
      const onSheet = ({ x, y }: z.infer<typeof Point>) =>
        x > 0 && x < eye.width && y > 0 && y < eye.height;
      const off = [child, ...flowers].filter((at) => !onSheet(at));
      expect(
        off.length === 0,
        `the map leaves ${String(off.length)} thing(s) off the screen (${open}): ${JSON.stringify(off)}`,
      );
      // Left of the screen's middle is left of the heading on the map.
      const mirrored = seen.filter(({ id, x }) => {
        const across = x - eye.width / 2;
        const at = flowers.find((flower) => flower.id === id);
        if (!at || Math.abs(across) < OFF_MIDDLE || x < 0 || x > eye.width) {
          return false;
        }
        const side = ahead.x * (at.y - child.y) - ahead.y * (at.x - child.x);
        return Math.sign(side) !== Math.sign(across);
      });
      expect(
        mirrored.length === 0,
        `the map mirrors the view (${open}): ${mirrored.map(({ id }) => id).join(', ')}`,
      );
      note(
        `${open}: ${String(things)} things drawn at ${scale.toFixed(1)} px a clump size`,
      );
    } else {
      expect(false, `the open map was never drawn (${open})`);
    }
    await shut(eye, open);
    return drawn;
  };

  await page.step(30);
  await page.shoot('m0-closed');
  const fresh = await look('m2-open-fresh', 'm1-unfolding');

  // Only the map button stands over the open map: the `+` picker shuts.
  await page.tap(controls.plus);
  await page.step(30);
  const { picking } = await state();
  await page.tap(controls.map);
  await page.step(UNFOLDED);
  const shutUnder = !(await state()).picking;
  expect(picking && shutUnder, 'the + picker stayed open over the map');
  await shut(await eyeNow(), 'over the picker');

  await inTurn([0, 1, 2], async (index) =>
    grow(page, controls, controls.picker[index]),
  );
  // The newest, selected as it grew, gets a window and a door.
  await furnishNewest(page, controls, expect, [0, DOOR]);

  expect(await plantNearest(page), 'no tuft opened the flower picker');
  note(await walkAndTurn(page));
  await page.shoot('m3-walked');

  const planted = await look('m4-open-planted');
  expect(
    fresh !== null && planted !== null && planted.things >= fresh.things + 4,
    `the map after growing three and planting one draws ${String(planted?.things)} things, against ${String(fresh?.things)} fresh`,
  );

  // A flick's glide stops dead as the map opens over it.
  const screen = await eyeNow();
  const sky = { x: screen.width * 0.7, y: screen.height * 0.15 };
  await page.drag(sky, { ...sky, x: screen.width * 0.3 }, 4);
  await page.tap(controls.map);
  const stopped = await eyeNow();
  await page.step(60);
  const later = await eyeNow();
  expect(
    stopped.heading === later.heading &&
      stopped.x === later.x &&
      stopped.y === later.y,
    `the eye moved under the open map: ${String(stopped.heading)} → ${String(later.heading)}`,
  );
  await escape('after a flick');
  await escape('while shut');

  // A russula grown with the eye turned far off the opening world, as the
  // flick left it, takes a door.
  await grow(
    page,
    controls,
    controls.picker[MUSHROOM_SPECIES.indexOf('russula')],
  );
  const grown = await state();
  expect(
    grown.species.at(-1) === 'russula',
    `the picker grew a ${String(grown.species.at(-1))}, not a russula`,
  );
  await furnishNewest(page, controls, expect, [DOOR]);
  await look('m5-open-door');
}

/** Furnishes the selected mushroom, the newest, with the house picker's `pieces`, and fails unless it holds them after. */
async function furnishNewest(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  pieces: readonly number[],
): Promise<void> {
  await page.tap(controls.house);
  await page.step(30);
  await inTurn(pieces, async (index) => {
    const piece = controls.housePicker[index];
    if (piece) await page.tap(piece);
    await page.step(30);
  });
  await page.tap(controls.house);
  await page.step(30);
  const house = (await page.evaluate('__probe.state()', State)).houses.at(-1);
  expect(
    house?.door === pieces.includes(DOOR) &&
      house.windows.length === pieces.filter((piece) => piece !== DOOR).length,
    `the newest mushroom was not furnished: ${JSON.stringify(house)}`,
  );
}
