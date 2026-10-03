/**
 * The mice's runs, on a fresh opening clump: a door on each mushroom, a tap
 * on the front door running its mouse to the back house, a tap on the
 * emptied door calling one home, `−` on the back mushroom sending its mouse
 * out to the front, and last a chanterelle grown alone, whose door tap peeks
 * with no run. Fails on a tap with a door in reach starting no run, a run
 * started with none, a count that changes the total, and a runner drawn in
 * front of a mushroom whose foot is nearer; prints the heads against their
 * doors and the runners' widths.
 */

import { z } from 'zod';

import { MUSHROOM_SPECIES } from '../../src/pages/mushrooms/model/mushroom-genes.ts';
import {
  Box,
  type Controls,
  type Expect,
  grow,
  Mice,
  Mouse,
  type Page,
  Point,
  Runs,
  State,
} from './mushroom-probe.ts';

/** The house picker's door button, last of `FURNISHINGS`. */
const DOOR = 4;
/** Frames for a pop to settle. */
const SETTLE = 45;
/** Frames a run is followed for at most: its longest is ~4 s on the plane. */
const LONGEST_RUN = 360;
/**
 * When a run between the clump's two doors is halfway across, in seconds
 * from its start: 0.85 s of peek and 0.25 s of hop down, then half its
 * shortest run (0.4 s); a fleeing run opens on the hop.
 */
const PEEKED_MID = 1.3;
const FLED_MID = 0.45;
/** CSS px of meadow kept round the clump in its close frames. */
const PAD = 60;
/** How far below a runner's foot, in CSS px, a mushroom's foot is nearer for sure. */
const NEARER_BY = 4;

/**
 * A run followed from `from`'s door to `to`'s, its `mid` frame due once
 * `midAt` seconds have run: the frames still to shoot and what was sighted of its runner.
 */
type Watch = Pick<z.infer<typeof Runs>[number], 'from' | 'to'> & {
  midAt: number;
  mid: string | undefined;
  inn: string | undefined;
  sighted: boolean;
  widths: number[];
};

const watching = (
  from: string,
  to: string,
  midAt: number,
  mid: string,
  inn?: string,
): Watch => ({ from, to, midAt, mid, inn, sighted: false, widths: [] });

export async function playRuns(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const state = async () => page.evaluate('__probe.state()', State);
  const mice = async () => page.evaluate('__probe.mice()', Mice);
  const runs = async () => page.evaluate('__probe.runs()', Runs);
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
  /** A frame of the standing mushrooms and the runners alone, `PAD` round them: a mouse is a few px of a whole screen. */
  const close = async (name: string) => {
    const { mushrooms } = await state();
    const boxes = await Promise.all(
      mushrooms.map(async (id) =>
        page.evaluate(`__probe.bounds(${JSON.stringify(id)})`, Box),
      ),
    );
    const points = [
      ...boxes.flatMap(({ x, y, width, height }) => [
        { x, y },
        { x: x + width, y: y + height },
      ]),
      ...(await runs()).filter(({ shown }) => shown),
    ];
    const xs = points.map(({ x }) => x);
    const ys = points.map(({ y }) => y);
    const [x, y] = [Math.min(...xs) - PAD, Math.min(...ys) - PAD];
    await page.shoot(name, {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.max(...xs) + PAD - x,
      height: Math.max(...ys) + PAD - y,
    });
  };

  const nearerCheck = async (run: z.infer<typeof Runs>[number]) => {
    const { mushrooms } = await state();
    const standing = await Promise.all(
      mushrooms.map(async (id) => ({
        id,
        box: await page.evaluate(`__probe.bounds(${JSON.stringify(id)})`, Box),
        depth: await page.evaluate(
          `__probe.depth(${JSON.stringify(id)})`,
          z.number(),
        ),
      })),
    );
    for (const { id, box, depth } of standing) {
      expect(
        !(box.y + box.height > run.y + NEARER_BY && run.depth > depth),
        `the runner at (${run.x.toFixed(0)}, ${run.y.toFixed(0)}) is drawn in front of ${id}, whose foot is nearer`,
      );
    }
  };

  /**
   * Follows `watch`'s run to its end, two frames at a time: the runner never
   * in front of a nearer mushroom, its `mid` frame shot once it is halfway
   * across, its `inn` frame once it has gone in.
   */
  const track = async (watch: Watch, frames: number): Promise<Watch> => {
    const { from, midAt, mid, inn, sighted, widths } = watch;
    const run = (await runs()).find((each) => each.from === from);
    if (!run || frames <= 0) return watch;
    const half = run.shown && run.elapsed >= midAt;
    const gone = sighted && !run.shown;
    if (run.shown) await nearerCheck(run);
    if (half && mid !== undefined) await close(mid);
    if (gone && inn !== undefined) await close(inn);
    await page.step(2);
    return track(
      {
        ...watch,
        mid: half ? undefined : mid,
        inn: gone ? undefined : inn,
        sighted: sighted || run.shown,
        widths:
          run.shown && run.width !== null ? [...widths, run.width] : widths,
      },
      frames - 2,
    );
  };
  const follow = async (start: Watch) => {
    const { from, to, sighted, widths } = await track(start, LONGEST_RUN);
    expect(sighted, `the run from ${from} to ${to} drew no runner`);
    expect(
      (await runs()).every((run) => run.from !== from),
      `the run from ${from} to ${to} never ended`,
    );
    if (widths.length > 0)
      note(
        `runner ${from}→${to}: ${Math.max(...widths).toFixed(1)} to ${Math.min(...widths).toFixed(1)} px wide`,
      );
  };
  /** Whether a run from `from` to `to` began on the tap just made. */
  const started = async (from: string, to: string) => {
    await page.step(2);
    return (await runs()).some((run) => run.from === from && run.to === to);
  };

  // 1. A door on each mushroom, the newest first, then the other selected.
  const { mushrooms } = await state();
  const depths = await Promise.all(
    mushrooms.map(async (id) =>
      page.evaluate(`__probe.depth(${JSON.stringify(id)})`, z.number()),
    ),
  );
  const [back, front] = mushrooms
    .map((id, index) => ({ id, depth: depths[index] ?? 0 }))
    .toSorted((a, b) => a.depth - b.depth)
    .map(({ id }) => id);
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
  await follow(watching(front, back, PEEKED_MID, 'r3-running', 'r4-in'));
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
  await follow(watching(back, front, PEEKED_MID, 'r5-called-home'));
  const home = await mice();
  expect(
    home[front] === 1 && home[back] === 1,
    `after the call home the houses hold ${JSON.stringify(home)}`,
  );

  // 4. `−` on the back mushroom: its mouse flees to the front door.
  await tapAt('mushroom', back);
  await page.step(6);
  await page.tap(controls.minus);
  expect(
    await started(back, front),
    'the sinking back house sent no mouse out',
  );
  await follow(watching(back, front, FLED_MID, 'r6-flee'));
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
