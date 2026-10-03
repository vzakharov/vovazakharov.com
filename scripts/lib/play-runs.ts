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

import { z } from 'zod';

import { FURNISHINGS } from '../../src/pages/mushrooms/model/house.ts';
import type { Stamped } from '../../src/pages/mushrooms/model/motion.ts';
import {
  RUN_LEAST,
  runAt,
  type RunCourse,
  runDuration,
  type RunOpening,
} from '../../src/pages/mushrooms/model/mouse-run-clock.ts';
import { MUSHROOM_SPECIES } from '../../src/pages/mushrooms/model/mushroom-genes.ts';
import type { Named } from '../../src/shared/typings/index.ts';
import {
  Box,
  type Controls,
  Mice,
  Mouse,
  Point,
  Runs,
  State,
} from './mushroom-probe-answers.ts';
import {
  backToFront,
  type Expect,
  FRAME_MS,
  grow,
  inTurn,
  type Page,
} from './mushroom-probe-drive.ts';

const DOOR = FURNISHINGS.indexOf('door');
/** Frames for a pop to settle. */
const SETTLE = 45;
/** Frames a run is followed for at most: its longest is ~4 s from peek to shut door. */
const LONGEST_RUN = 360;
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
/** CSS px of meadow kept round the clump in its close frames. */
const PAD = 60;
/** How far below a runner's foot, in CSS px, a mushroom's foot is nearer for sure. */
const NEARER_BY = 4;

/** How far either side of its hop down and hop in a runner may lag its run's clock, in seconds: two of a track's two-frame steps. */
const LAG = (2 * 2 * FRAME_MS) / 1000;

/**
 * When a runner is out on the ground in a run opening with `opening`, as
 * the run's own clock has it: from `out` seconds after it starts until
 * `shut` seconds before it ends, the door shutting behind it.
 */
function runnerSpan(opening: RunOpening): { out: number; shut: number } {
  const course = { runLength: 0, bowSign: 1, opening, calling: false };
  const whole = runDuration(course);
  const step = FRAME_MS / 1000;
  const times = Array.from(
    { length: Math.ceil(whole / step) },
    (_, index) => index * step,
  ).filter((elapsed) => runAt(elapsed, course).runner);
  return { out: times[0] ?? 0, shut: whole - (times.at(-1) ?? whole) };
}

/** A frame to shoot of a run once `at` seconds have run and its runner is drawn. */
type Shot = Stamped & Named;

/**
 * A run followed from `from`'s door to `to`'s, opening with `opening`: the
 * frames still to shoot, `inn` once it has gone in, whether it is over, and
 * each tracked frame's time with whether its runner was drawn, its width and
 * where across the screen.
 */
type Watch = Pick<z.infer<typeof Runs>[number], 'from' | 'to'> &
  Pick<RunCourse, 'opening'> & {
    shots: Shot[];
    inn: string | undefined;
    over: boolean;
    seen: Array<{ elapsed: number; shown: boolean }>;
    widths: number[];
    xs: number[];
  };

const watching = (
  from: string,
  to: string,
  opening: RunOpening,
  shots: Shot[],
  inn?: string,
): Watch => ({
  from,
  to,
  opening,
  shots,
  inn,
  over: false,
  seen: [],
  widths: [],
  xs: [],
});

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
        `the runner ${run.from}→${run.to} at (${run.x.toFixed(0)}, ${run.y.toFixed(0)}), ${run.elapsed.toFixed(2)} s in, is drawn in front of ${id}, whose foot (${(box.y + box.height).toFixed(0)}) is nearer`,
      );
    }
  };

  /** `watch` one frame on, `run` being its run now: its frames shot and its runner sighted. */
  const watchFrame = async (
    watch: Watch,
    run: z.infer<typeof Runs>[number] | undefined,
  ): Promise<Watch> => {
    if (!run) return { ...watch, over: true };
    const { shots, inn, seen, widths, xs } = watch;
    const { elapsed, shown, width, x } = run;
    const due = shown ? shots.filter((shot) => elapsed >= shot.at) : [];
    const gone = seen.some((frame) => frame.shown) && !shown;
    if (shown) await nearerCheck(run);
    await inTurn(due, async ({ name }) => close(name));
    if (gone && inn !== undefined) await close(inn);
    return {
      ...watch,
      shots: shots.filter((shot) => !due.includes(shot)),
      inn: gone ? undefined : inn,
      seen: [...seen, { elapsed, shown }],
      widths: shown && width !== null ? [...widths, width] : widths,
      xs: shown ? [...xs, x] : xs,
    };
  };
  /**
   * Follows `watches`' runs, each by its start's door, to their ends, two
   * frames at a time: each runner never in front of a nearer mushroom, its
   * shots taken once their time has run, its `inn` frame once it has gone in.
   */
  const track = async (watches: Watch[], frames: number): Promise<Watch[]> => {
    if (frames <= 0 || watches.every(({ over }) => over)) return watches;
    const under = await runs();
    const next: Watch[] = [];
    await inTurn(watches, async (watch) => {
      next.push(
        watch.over
          ? watch
          : await watchFrame(
              watch,
              under.find((each) => each.from === watch.from),
            ),
      );
    });
    await page.step(2);
    return track(next, frames - 2);
  };
  /**
   * Follows `watches` to their ends: each run ends, and draws its runner on
   * every tracked frame from its hop down to its hop in.
   */
  const follow = async (...watches: Watch[]) => {
    const followed = await track(watches, LONGEST_RUN);
    const left = await runs();
    for (const { from, to, opening, seen, widths, xs } of followed) {
      const { out, shut } = runnerSpan(opening);
      const last = seen.at(-1)?.elapsed ?? 0;
      const hidden = seen.filter(
        ({ elapsed, shown }) =>
          !shown && elapsed >= out + LAG && elapsed <= last - shut - LAG,
      );
      expect(
        seen.some(({ shown }) => shown),
        `the run from ${from} to ${to} drew no runner`,
      );
      expect(
        hidden.length === 0,
        `the runner from ${from} to ${to} was hidden mid-run on ${String(hidden.length)} frames, ${(hidden[0]?.elapsed ?? 0).toFixed(2)} to ${(hidden.at(-1)?.elapsed ?? 0).toFixed(2)} s in`,
      );
      expect(
        left.every((run) => run.from !== from),
        `the run from ${from} to ${to} never ended`,
      );
      if (widths.length > 0)
        note(
          `runner ${from}→${to}: ${Math.max(...widths).toFixed(1)} to ${Math.min(...widths).toFixed(1)} px wide`,
        );
      if (xs.length > 0)
        note(
          `runner ${from}→${to}: drawn from x ${Math.min(...xs).toFixed(0)} to ${Math.max(...xs).toFixed(0)} px, a ${(Math.max(...xs) - Math.min(...xs)).toFixed(0)} px sweep`,
        );
    }
  };
  /** Whether a run from `from` to `to` began on the tap just made. */
  const started = async (from: string, to: string) => {
    await page.step(2);
    return (await runs()).some((run) => run.from === from && run.to === to);
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
