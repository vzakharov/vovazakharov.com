/**
 * The mice's runs, on a fresh opening clump: a door on each mushroom, a tap
 * on the front door running its mouse to the back house, a tap on the
 * emptied door calling one home, `−` on the back mushroom while the front's
 * mouse runs to it sending its own mouse out to the front and turning the
 * runner home, and last a chanterelle grown alone, whose door tap peeks
 * with no run. Fails on a tap with a door in reach starting no run, a run
 * started with none, a count that changes the total, a runner hidden
 * between its hop down and its hop in, and a runner drawn in front of a
 * mushroom whose foot is nearer; prints the heads against their doors and
 * the runners' widths.
 */

import type { z } from 'zod';

import { RUN_LEAST } from '@/mushrooms/entities/mouse/index.node-safe';
import {
  FURNISHINGS,
  MUSHROOM_SPECIES,
} from '@/mushrooms/entities/mushroom/index.node-safe';

import { type Controls, Mice, Mouse, Point } from './mushroom-probe-answers.ts';
import {
  backToFront,
  type Expect,
  FRAME_MS,
  grow,
  type Page,
} from './mushroom-probe-drive.ts';
import { runsOn, watching } from './run-follow.ts';

const DOOR = FURNISHINGS.indexOf('door');
/** Frames for a pop to settle. */
const SETTLE = 45;
/**
 * When a run between the clump's two doors is halfway across, in seconds
 * from its start: 0.85 s of peek and 0.25 s of hop down, then half its
 * course, which the clump's close doors bow out to about `RUN_LEAST`.
 */
const PEEKED_MID = 0.85 + 0.25 + RUN_LEAST / 2;
/** When a fleeing run, which opens on the hop, has turned back toward its door on the last stretch of its loop, its house sunk and gone. */
const FLED_LATE = 0.25 + RUN_LEAST * 0.85;
/** When `−` sinks a run's target, in seconds from the tap that started it: its runner on the ground, short of halfway. */
const SINK_MID_RUN = 1.7;
/** When a runner turned home from the ground is on its way. */
const TURNED_MID = 0.5;

export async function playRuns(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const { state, runs, close, follow, started } = runsOn(page, expect, note);
  const mice = async () => page.evaluate('__probe.mice()', Mice);
  const total = async () =>
    Object.values(await mice()).reduce((sum, count) => sum + count, 0);
  const at = async (reader: string, id: string) =>
    page.evaluate(`__probe.${reader}(${JSON.stringify(id)})`, Point.nullable());
  const tapAt = async (reader: string, id: string) => {
    const point = await at(reader, id);
    if (point === null) expect(false, `no ${reader} of ${id} to tap`);
    else await page.tap(point);
  };
  const furnishDoor = async () => {
    const button = controls.housePicker[DOOR];
    if (button) await page.tap(button);
    await page.step(6);
  };
  const noteHead = async (id: string, what: string) => {
    const mouse = await page.evaluate(
      `__probe.mouse(${JSON.stringify(id)})`,
      Mouse,
    );
    note(
      `${what} head ${mouse.head.toFixed(1)} px, ${(mouse.head / mouse.door).toFixed(2)} of its door's ${mouse.door.toFixed(1)} px`,
    );
    return mouse;
  };
  // 1. A door on each mushroom, the newest first, then the other selected.
  const { mushrooms } = await state();
  const [back, front] = await backToFront(page, mushrooms);
  if (back === undefined || front === undefined) {
    expect(false, `the opening clump stands ${String(mushrooms.length)}`);
    return;
  }
  await page.tap(controls.house);
  await page.step(30);
  await furnishDoor();
  await tapAt('mushroom', mushrooms[0] ?? back);
  await page.step(6);
  await furnishDoor();
  await page.tap(controls.house);
  await page.step(SETTLE);
  const opening = await mice();
  expect(
    opening[back] === 1 && opening[front] === 1,
    `two new doors hold ${JSON.stringify(opening)}`,
  );
  await noteHead(back, 'back');
  await noteHead(front, 'front');

  // 2. The front door tapped: its mouse peeks, hops down, runs, goes in.
  await tapAt('door', front);
  expect(
    await started(front, back),
    'a front door tap with the back door in reach started no run',
  );
  const peeking = await page.evaluate(
    `__probe.mouse(${JSON.stringify(front)})`,
    Mouse,
  );
  expect(peeking.out > 0, 'the front door did not open on the tap');
  await page.step(28);
  await close('r1-peek');
  await page.step(27);
  await close('r2-leave');
  await follow(
    watching(
      front,
      back,
      'peek',
      [{ at: PEEKED_MID, name: 'r3-running' }],
      'r4-in',
    ),
  );
  const ran = await mice();
  expect(
    ran[front] === 0 && ran[back] === 2,
    `after the run the houses hold ${JSON.stringify(ran)}`,
  );

  // 3. The empty front door tapped: the back house sends a mouse home.
  await tapAt('door', front);
  expect(
    await started(back, front),
    'a tap on the empty front door called no mouse',
  );
  await follow(
    watching(back, front, 'peek', [{ at: PEEKED_MID, name: 'r5-called-home' }]),
  );
  const home = await mice();
  expect(
    home[front] === 1 && home[back] === 1,
    `after the call home the houses hold ${JSON.stringify(home)}`,
  );

  // 4. The back mushroom selected, the front door tapped, and `−` while its
  // mouse runs: the back house's mouse flees to the front door and the
  // runner turns home from the ground, each drawn after its house has gone.
  await tapAt('mushroom', back);
  await page.step(6);
  await tapAt('door', front);
  expect(
    await started(front, back),
    'a front door tap with the back door in reach started no run',
  );
  await page.step(Math.round((SINK_MID_RUN * 1000) / FRAME_MS) - 2);
  await page.tap(controls.minus);
  expect(
    await started(back, front),
    'the sinking back house sent no mouse out',
  );
  expect(
    (await runs()).some((run) => run.from === front && run.to === front),
    'the front runner did not turn home when its target sank',
  );
  await follow(
    watching(back, front, 'leave', [{ at: FLED_LATE, name: 'r6-flee-turned' }]),
    watching(front, front, 'run', [{ at: TURNED_MID, name: 'r6-turned-home' }]),
  );
  expect(
    (await mice())[front] === 2 && (await total()) === 2,
    `after the flight the houses hold ${JSON.stringify(await mice())}`,
  );

  // 5. The front sunk too, then a chanterelle grown alone: its tap peeks.
  await page.tap(controls.minus);
  await page.step(SETTLE);
  await grow(
    page,
    controls,
    controls.picker[MUSHROOM_SPECIES.indexOf('chanterelle')],
  );
  const { selected } = await state();
  if (selected === null) {
    expect(false, 'the grown chanterelle is not selected');
    return;
  }
  await page.tap(controls.house);
  await page.step(30);
  await furnishDoor();
  await page.tap(controls.house);
  await page.step(SETTLE);
  await tapAt('door', selected);
  await page.step(24);
  expect((await runs()).length === 0, 'a lone door tap started a run');
  const mini = await noteHead(selected, 'chanterelle');
  expect(mini.out > 0.9, `the lone mouse is only ${mini.out.toFixed(2)} out`);
  await close('r7-mini-mouse');
}
