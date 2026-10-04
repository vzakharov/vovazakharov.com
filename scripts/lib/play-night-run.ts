/**
 * A mouse's own run at dusk, through the dusk play: with the opening's two
 * doors in sight of each other, the play waits for the dusk to send a mouse
 * (`model/night-runs.ts`) and shoots its runner on the ground between them.
 * Fails where no run comes within the longest gap, or its runner never shows.
 */

import { z } from 'zod';

import { NIGHT_GAP } from '../../src/pages/mushrooms/model/night-runs.ts';
import { Runs } from './mushroom-probe-answers.ts';
import { type Expect, FRAME_MS, type Page } from './mushroom-probe-drive.ts';

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

const Outing = z.object({ to: z.string().nullable(), made: z.number() });

/** Waits at dusk for a mouse to run of its own accord between two doors, and shoots it running. */
export async function shootNightRun(
  page: Page,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const outing = async () =>
    page.evaluate(
      `(({ made, last }) => ({ made, to: last?.to ?? null }))(__probe.scene.meadow.nightRuns)`,
      Outing,
    );
  const before = (await outing()).made;
  const sent = async (looked: number): Promise<boolean> => {
    const now = await outing();
    if (now.made > before && now.to !== null) return true;
    if (looked >= TO_RUN) return false;
    await page.step(LOOK_EVERY);
    return sent(looked + LOOK_EVERY);
  };
  if (!(await sent(0))) {
    expect(false, 'at dusk no mouse ran between the doors of its own accord');
    return;
  }
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
  await page.shoot('dusk-mice');
  if (!run) return;
  const half = Math.max(run.width ?? 0, 24) * MARGIN;
  const height = await page.evaluate('__probe.eye().height', z.number());
  await page.shoot('dusk-mice-close', {
    x: Math.max(0, run.x - half),
    y: Math.max(0, Math.min(run.y - half, height - half * 2)),
    width: half * 2,
    height: half * 2,
  });
}
