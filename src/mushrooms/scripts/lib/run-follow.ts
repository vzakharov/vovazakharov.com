/**
 * Following the mice's runs on the page `play-runs.ts` drives: each run to
 * its end, its frames shot on time, and its runner held to being drawn from
 * hop down to hop in and never in front of a nearer mushroom.
 */

import { z } from 'zod';

import type { Named } from '@/kernel/shared/typings';

import type { Stamped } from '@/mushrooms/shared/lib/motion';
import {
  type Opened,
  runAt,
  runDuration,
  type RunOpening,
} from '@/mushrooms/entities/mouse/index.node-safe';

import { Box, type RunEnds, Runs, State } from './mushroom-probe-answers.ts';
import { type Expect, FRAME_MS, type Page } from './mushroom-probe-drive.ts';

import { inTurn } from '@/scene/scripts/lib/in-turn';

/** Frames a run is followed for at most: its longest is ~4 s from peek to shut door. */
const LONGEST_RUN = 360;
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
type Watch = z.infer<typeof RunEnds> &
  Opened & {
    shots: Shot[];
    inn: string | undefined;
    over: boolean;
    seen: Array<{ elapsed: number; shown: boolean }>;
    widths: number[];
    xs: number[];
  };

export const watching = (
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

/**
 * The run-following tools for `page`: what stands and what runs, a close
 * frame of them, `follow` to hold runs to their ends, and `started` to ask
 * whether a tap began one.
 */
export function runsOn(
  page: Page,
  expect: Expect,
  note: (line: string) => void,
) {
  const state = async () => page.evaluate('__probe.state()', State);
  const runs = async () => page.evaluate('__probe.runs()', Runs);
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
  return { state, runs, close, follow, started };
}
