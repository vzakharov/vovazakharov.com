/**
 * The map, `play-mushrooms.ts`'s run on a fresh meadow: the map button
 * pressed, the sheet shot mid-unfold and open, and shut; then mushrooms
 * grown, the newest furnished, a flower planted on a tuft, the eye turned
 * and walked a little, and the map opened again on what the meadow holds
 * now. Fails on a map that does not open or shut, one not centred on the
 * eye, or one drawing fewer things than the meadow holds; prints its reach
 * and scale.
 */

import { z } from 'zod';

import { FURNISHINGS } from '../../src/pages/mushrooms/model/house.ts';
import {
  type Controls,
  type Expect,
  Eye,
  grow,
  inTurn,
  MapShown,
  type Page,
  Point,
  State,
  walkAndTurn,
} from './mushroom-probe.ts';
import { buttonsOf, nearestOpening, TUFTS } from './play-tufts.ts';

/** Frames into the map's 0.3 s unfold that catch it growing out of its button, short of the overshoot. */
const MID_UNFOLD = 3;
/** Frames for the map to unfold, or fold, all the way. */
const UNFOLDED = 30;
/** How far the map's centre may stand from the eye, in clump sizes. */
const CENTRED = 1e-6;

export async function playMap(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const map = async () => page.evaluate('__probe.map()', MapShown);
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
    const [shown, eye] = await Promise.all([
      map(),
      page.evaluate('__probe.eye()', Eye),
    ]);
    expect(shown.open, `the map button did not open the map (${open})`);
    const { drawn } = shown;
    if (drawn) {
      expect(
        Math.hypot(drawn.centre.x - eye.x, drawn.centre.y - eye.y) < CENTRED,
        `the map is not centred on the eye (${open}): ${JSON.stringify(drawn.centre)} against (${String(eye.x)}, ${String(eye.y)})`,
      );
      note(
        `${open}: ${String(drawn.things)} things drawn, reach ${drawn.reach.toFixed(2)} clump sizes at ${drawn.scale.toFixed(1)} px each`,
      );
    } else {
      expect(false, `the open map was never drawn (${open})`);
    }
    // A tap on the sheet, away from the button, shuts it as the button does.
    await page.tap({ x: eye.width / 2, y: eye.height / 2 });
    await page.step(UNFOLDED);
    expect(
      !(await map()).open,
      `a tap on the open map did not shut it (${open})`,
    );
    return drawn;
  };

  await page.step(30);
  await page.shoot('m0-closed');
  const fresh = await look('m2-open-fresh', 'm1-unfolding');

  await inTurn([0, 1, 2], async (index) =>
    grow(page, controls, controls.picker[index]),
  );
  // The newest, selected as it grew, gets a window and a door.
  await page.tap(controls.house);
  await page.step(30);
  await inTurn([0, FURNISHINGS.indexOf('door')], async (index) => {
    const piece = controls.housePicker[index];
    if (piece) await page.tap(piece);
    await page.step(30);
  });
  await page.tap(controls.house);
  await page.step(30);
  const furnished = await page.evaluate('__probe.state()', State);
  expect(
    furnished.houses.at(-1)?.door === true &&
      furnished.houses.at(-1)?.windows.length === 1,
    `the newest mushroom was not furnished: ${JSON.stringify(furnished.houses)}`,
  );

  const tuft = await nearestOpening(
    page,
    await page.evaluate(TUFTS, z.array(Point)),
  );
  expect(tuft !== undefined, 'no tuft opened the flower picker');
  if (tuft) {
    const [colour] = await page.evaluate(
      buttonsOf('colourPicker'),
      z.array(Point),
    );
    if (colour) await page.tap(colour);
    await page.step(30);
    const [shape] = await page.evaluate(
      buttonsOf('shapePicker'),
      z.array(Point),
    );
    if (shape) await page.tap(shape);
    await page.step(90);
  }
  note(await walkAndTurn(page));
  await page.shoot('m3-walked');

  const planted = await look('m4-open-planted');
  expect(
    fresh !== null && planted !== null && planted.things >= fresh.things + 4,
    `the map after growing three and planting one draws ${String(planted?.things)} things, against ${String(fresh?.things)} fresh`,
  );
}
