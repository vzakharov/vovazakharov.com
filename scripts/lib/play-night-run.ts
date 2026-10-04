/**
 * A mouse's own run at dusk. Through the dusk play (`shootNightRun`): with the
 * opening's two doors in sight of each other, the play waits for the dusk to
 * send a mouse (`model/night-runs.ts`) and shoots its runner on the ground
 * between them. On its own (`playGrownRuns`): houses grown with `+` as a child
 * grows them — as far apart as the screen allows — each given a door, the sun
 * tapped, and a run between two of them waited for and shot. Fails where no
 * run comes within the longest gap, or its runner never shows.
 */

import { z } from 'zod';

import { DUSK_MS } from '../../src/pages/mushrooms/model/dusk.ts';
import { NIGHT_GAP } from '../../src/pages/mushrooms/model/night-runs.ts';
import { type Controls, Runs, State, SunAt } from './mushroom-probe-answers.ts';
import {
  type Expect,
  FRAME_MS,
  grow,
  inTurn,
  type Page,
} from './mushroom-probe-drive.ts';

/** Frames between looks while waiting. */
const LOOK_EVERY = 15;
/** Frames the dusk may take to send a run: its longest gap and a little. */
const TO_RUN = Math.ceil((NIGHT_GAP[1] + 1000) / FRAME_MS);
/** Frames a run's runner may take to come down onto the ground and show. */
const TO_GROUND = 150;
/** How far into its run the runner is shot, in seconds: past its peek, mid-way. */
const MID_RUN = 1.6;
/** Margin round the runner in its close frame, as a share of its drawn width: both doors in it at the opening's distance. */
const MARGIN = 6;
/** Mushrooms the child grows: enough that `+` spreads them across the screen. */
const GROWN = 3;
/** Frames for the house picker to open, and for a door's pop to settle. */
const OPEN = 30;
const SETTLE = 45;
/** Frames from the sun's tap to full dusk, and the harness clock's slack. */
const TO_DUSK = Math.round(DUSK_MS / FRAME_MS) + 20;

const Outing = z.object({
  from: z.string().nullable(),
  to: z.string().nullable(),
  made: z.number(),
});
type Outing = z.infer<typeof Outing>;

/** The dusk's first outing after `made` that `wanted` takes, within `frames`; `undefined` where none comes. */
async function outingAfter(
  page: Page,
  made: number,
  wanted: (outing: Outing) => boolean,
  frames: number,
): Promise<Outing | undefined> {
  const read = async () =>
    page.evaluate(
      `(({ made, last }) => ({ made, from: last?.from ?? null, to: last?.to ?? null }))(__probe.scene.meadow.nightRuns)`,
      Outing,
    );
  const look = async (
    looked: number,
    seen: number,
  ): Promise<Outing | undefined> => {
    const now = await read();
    if (now.made > seen && wanted(now)) return now;
    if (looked >= frames) return undefined;
    await page.step(LOOK_EVERY);
    return look(looked + LOOK_EVERY, now.made);
  };
  return look(0, made);
}

const madeSoFar = async (page: Page) =>
  page.evaluate('__probe.scene.meadow.nightRuns.made', z.number());

/** The run under way shot once its runner shows on the ground mid-run, as `<name>` and `<name>-close`. */
async function shootRunner(
  page: Page,
  name: string,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const running = async (looked: number) => {
    const runs = await page.evaluate('__probe.runs()', Runs);
    const run = runs.find(({ shown, elapsed }) => shown && elapsed >= MID_RUN);
    if (run || looked >= TO_GROUND) return run;
    await page.step(LOOK_EVERY);
    return running(looked + LOOK_EVERY);
  };
  const run = await running(0);
  note(`at dusk a mouse ran ${run ? `${run.from} → ${run.to}` : 'unseen'}`);
  expect(run !== undefined, 'at dusk the run’s mouse never showed');
  await page.shoot(name);
  if (!run) return;
  const half = Math.max(run.width ?? 0, 24) * MARGIN;
  const height = await page.evaluate('__probe.eye().height', z.number());
  await page.shoot(`${name}-close`, {
    x: Math.max(0, run.x - half),
    y: Math.max(0, Math.min(run.y - half, height - half * 2)),
    width: half * 2,
    height: half * 2,
  });
}

/** Waits at dusk for a mouse to run of its own accord between two doors, and shoots it running. */
export async function shootNightRun(
  page: Page,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const sent = await outingAfter(
    page,
    await madeSoFar(page),
    ({ to }) => to !== null,
    TO_RUN,
  );
  if (!sent) {
    expect(false, 'at dusk no mouse ran between the doors of its own accord');
    return;
  }
  await shootRunner(page, 'dusk-mice', expect, note);
}

/** `GROWN` mushrooms grown with `+`, each given a door while it is the one selected, then let go; returns their ids. */
async function growDoored(
  page: Page,
  controls: z.infer<typeof Controls>,
): Promise<string[]> {
  const door = controls.housePicker.at(-1);
  const grown: string[] = [];
  await inTurn(controls.picker.slice(0, GROWN), async (cap) => {
    await grow(page, controls, cap);
    await page.tap(controls.house);
    await page.step(OPEN);
    if (door) await page.tap(door);
    await page.step(6);
    await page.tap(controls.house);
    await page.step(SETTLE);
    const { mushrooms } = await page.evaluate('__probe.state()', State);
    const newest = mushrooms.at(-1);
    if (newest !== undefined) grown.push(newest);
  });
  await page.evaluate(
    "__probe.scene.dispatch({ kind: 'deselect' })",
    z.unknown(),
  );
  await page.step(SETTLE);
  return grown;
}

/**
 * A child's meadow at dusk: three houses grown with `+` and doored, the sun
 * tapped, and a mouse's own run between two of them shot (`night-grown`).
 */
export async function playGrownRuns(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const grown = await growDoored(page, controls);
  const { houses, mushrooms } = await page.evaluate('__probe.state()', State);
  const doored = grown.filter(
    (id) => houses[mushrooms.indexOf(id)]?.door === true,
  );
  note(`grown ${grown.join(', ')}; doored ${doored.join(', ')}`);
  expect(
    doored.length === GROWN,
    `of ${String(GROWN)} grown houses only ${String(doored.length)} took a door`,
  );
  const sun = await page.evaluate('__probe.sunAt()', SunAt);
  if (!sun) {
    expect(false, 'no sun on the screen to tap');
    return;
  }
  await page.tap(sun);
  await page.step(TO_DUSK);
  const between = await outingAfter(
    page,
    await madeSoFar(page),
    ({ from, to }) =>
      from !== null &&
      to !== null &&
      doored.includes(from) &&
      doored.includes(to),
    TO_RUN,
  );
  note(
    between
      ? `outing ${String(between.made)}: ${String(between.from)} → ${String(between.to)}`
      : 'no outing between grown houses',
  );
  if (!between) {
    expect(
      false,
      `at dusk no mouse ran between grown houses within ${String(NIGHT_GAP[1] / 1000 + 1)} s`,
    );
    return;
  }
  await shootRunner(page, 'night-grown', expect, note);
}
