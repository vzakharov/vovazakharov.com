/**
 * The house's part of `play-mushrooms.ts`'s tap sequence, played on the
 * opening clump: the house picker opened, every window and the door put in, a
 * full row and a second door each shaking their heads and changing nothing,
 * a door on each mushroom, a tap on each door — the back one too — bringing
 * its mouse out, and the two pickers closing each other.
 */

import { z } from 'zod';

import {
  type Controls,
  type Expect,
  inTurn,
  Mouse,
  type Page,
  Point,
  Runs,
  State,
  Top,
} from './mushroom-probe.ts';
import { playWorms } from './play-worms.ts';

/** The house picker's buttons, in `FURNISHINGS`' order. */
const PIECES = ['cross', 'round', 'square', 'tall', 'door'] as const;
const DOOR = PIECES.indexOf('door');
/** More taps than any cap has windows for, so a row always fills. */
const MOST_TAPS = 8;
/** Frames for a pop to settle, and for a shake to be seen. */
const SETTLE = 45;

export async function playHouse(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const state = async () => page.evaluate('__probe.state()', State);
  const tapPiece = async (index: number) => {
    const at = controls.housePicker[index];
    if (at) await page.tap(at);
    await page.step(6);
  };
  const house = async (at: number) => (await state()).houses[at];
  /** Whether the `index`th button shook its head within the last second. */
  const refused = async (index: number) => {
    const [{ clock }, at] = await Promise.all([
      state(),
      page.evaluate(
        `__probe.furnishRefusedAt(${String(index)})`,
        z.number().nullable(),
      ),
    ]);
    return at !== null && clock - at < 1;
  };

  await page.tap(controls.house);
  await page.step(30);
  expect((await state()).furnishing, 'the house did not open its picker');
  await page.shoot('h1-house-picker');

  // Nothing is selected, so every pick furnishes the newest mushroom.
  const {
    mushrooms: [older, newest],
  } = await state();
  const target = 1;
  const left: number[] = [];
  const windows = [...PIECES.keys()].filter((index) => index !== DOOR);
  await inTurn(windows, async (index) => {
    const piece = PIECES[index];
    const before = (await house(target))?.windows.length ?? 0;
    await tapPiece(index);
    const after = await house(target);
    if (after?.windows.length === before + 1) {
      expect(after.windows.at(-1) === piece, `a ${piece} pick put in another`);
    } else {
      expect(await refused(index), `a ${piece} pick did nothing, unshaken`);
      left.push(index);
    }
  });
  // Fill the row, then one more: it must shake and change nothing.
  const fill = async (taps: number): Promise<boolean> => {
    if (taps === 0) return false;
    const before = JSON.stringify((await state()).houses);
    await tapPiece(0);
    if (JSON.stringify((await state()).houses) !== before) {
      return fill(taps - 1);
    }
    expect(await refused(0), 'a window on a full row did not shake');
    return true;
  };
  expect(await fill(MOST_TAPS), 'the row never filled');

  await tapPiece(DOOR);
  expect((await house(target))?.door === true, 'the door pick put in no door');
  const doored = JSON.stringify((await state()).houses);
  await tapPiece(DOOR);
  expect(
    JSON.stringify((await state()).houses) === doored && (await refused(DOOR)),
    'a second door did not shake, or changed the meadow',
  );
  expect((await state()).furnishing, 'a pick closed the house picker');
  await page.step(SETTLE);
  await page.shoot('h2-furnished');

  // Whatever the full row left out goes into the other mushroom, selected,
  // and a door, so the clump has a door behind a stem as well as in front.
  if (older !== undefined) {
    const at = await page.evaluate(
      `__probe.mushroom(${JSON.stringify(older)})`,
      Point.nullable(),
    );
    if (at === null)
      expect(false, "no tap on the other mushroom's cap reaches it");
    else await page.tap(at);
    await page.step(6);
    expect(
      (await state()).selected === older && (await state()).furnishing,
      'selecting a mushroom closed the house picker',
    );
    await inTurn([...left, DOOR], tapPiece);
    const other = await house(0);
    expect(
      left.every(
        (index) => other?.windows.includes(PIECES[index] ?? '') === true,
      ) && other?.door === true,
      'the other mushroom did not take what the first had no room for',
    );
    await page.step(SETTLE);
    await page.shoot('h2b-both-furnished');
  }

  // Each door tapped at its middle on screen, back one first: a tap there
  // must reach the door by the scene's own hit test, not the stem before it.
  const doors = await Promise.all(
    [older, newest]
      .filter((id) => id !== undefined)
      .map(async (id) => ({
        id,
        depth: await page.evaluate(
          `__probe.depth(${JSON.stringify(id)})`,
          z.number(),
        ),
      })),
  );
  const byDepth = doors.toSorted((a, b) => a.depth - b.depth);
  await inTurn(byDepth, async ({ id }) => {
    const side = id === byDepth.at(-1)?.id ? 'front' : 'back';
    const { selected } = await state();
    const at = await page.evaluate(
      `__probe.door(${JSON.stringify(id)})`,
      Point.nullable(),
    );
    if (at === null) {
      expect(false, `the ${side} door is not painted`);
      return;
    }
    const top = await page.evaluate(
      `__probe.topAt(${JSON.stringify(at)})`,
      Top,
    );
    expect(
      top === `door:${id}`,
      `a tap on the ${side} door's middle reaches ${String(top)}`,
    );
    await page.tap(at);
    await page.step(24);
    const now = await state();
    // With the other door in reach the tap starts a run — its mouse out, or,
    // its house emptied by a run of its own, the other's called home — whose
    // peek leg brings a mouse out; where it goes next is `play-runs.ts`' to check.
    const run = (await page.evaluate('__probe.runs()', Runs)).find(
      (each) => (each.from === id || each.to === id) && each.elapsed < 1,
    );
    const out = run?.from ?? id;
    const mouse = await page.evaluate(
      `__probe.mouse(${JSON.stringify(out)})`,
      Mouse,
    );
    expect(
      run !== undefined ||
        (mouse.tappedAt !== null && now.clock - mouse.tappedAt < 1),
      `a tap on the ${side} door did not call its mouse`,
    );
    expect(
      mouse.out > 0.9,
      `the ${side} door's tap brought a mouse only ${mouse.out.toFixed(2)} out`,
    );
    expect(now.selected === selected, 'a tap on a door changed the selection');
    note(
      `${side} door's tap: ${out === id ? 'its own' : 'a called'} mouse's head ${mouse.head.toFixed(1)} px, ${(mouse.head / mouse.door).toFixed(2)} of its door's ${mouse.door.toFixed(1)} px`,
    );
    await page.shoot(`h3-mouse-${side}`);
  });

  await page.tap(controls.plus);
  await page.step(12);
  let now = await state();
  expect(now.picking && !now.furnishing, '`+` did not close the house picker');
  await page.tap(controls.house);
  await page.step(24);
  now = await state();
  expect(now.furnishing && !now.picking, 'the house did not close the caps');
  await page.shoot('h4-swapped');
  await page.tap(controls.house);
  await page.step(6);
  expect(!(await state()).furnishing, 'the house did not close its picker');
  await playWorms(page, controls, expect, note);
}
