import { type InLook, LOOKS } from '@/island/shared/play';

import { FRAME_WINDOW } from '../lib/pace';
import { type Without, WITHOUTS } from '../lib/without';
import type { IslandScene } from './island-scene-api';

/** The query parameter that starts a measurement once the page is up: `?measure`. */
export const MEASURE_QUERY = 'measure';

/** Frames drawn after every tile is in before a reading starts: the shaders compiled and the frame time settled. */
const SETTLE_FRAMES = 60;
/** How often a measurement looks whether its frames are in, ms. */
const POLL_MS = 100;

/** One reading: a look, and what it leaves out (`undefined`: nothing). */
type Run = InLook & { readonly cost: Without | undefined };

/** A run's frames: their mean and the longest of them, ms. */
type Timed = { readonly meanMs: number; readonly worstMs: number };

/** Each look whole, then each full look without each cost alone. */
const RUNS: readonly Run[] = [
  ...LOOKS.map((look) => ({ look, cost: undefined })),
  ...LOOKS.filter((look) => look !== 'plain').flatMap((look) =>
    WITHOUTS.map((cost) => ({ look, cost })),
  ),
];

/** The run's frames over the `FRAME_WINDOW` after every tile is in and the next `SETTLE_FRAMES` are drawn. */
async function timed(scene: IslandScene): Promise<Timed> {
  let until: number | undefined;
  return new Promise((resolve) => {
    const poll = setInterval(() => {
      const pace = scene.pace();
      if (pace === undefined) return;
      if (until === undefined) {
        if (scene.whole()) until = pace.drawn + SETTLE_FRAMES + FRAME_WINDOW;
        return;
      }
      if (pace.drawn < until) return;
      clearInterval(poll);
      resolve({ meanMs: pace.frameMs, worstMs: Math.max(...pace.recent) });
    }, POLL_MS);
  });
}

/** Reads `runs` one after another after `done`, telling `onStep` which it is on. */
async function readAll(
  scene: IslandScene,
  onStep: (step: string) => void,
  runs: readonly Run[],
  done: ReadonlyArray<Run & Timed>,
): Promise<ReadonlyArray<Run & Timed>> {
  const [run, ...rest] = runs;
  if (run === undefined) return done;
  const total = done.length + runs.length;
  onStep(
    `${run.look} without ${run.cost ?? 'none'} (${String(done.length + 1)}/${String(total)})`,
  );
  scene.setLook(run.look);
  scene.setWithout(new Set(run.cost === undefined ? [] : [run.cost]));
  const reading = await timed(scene);
  return readAll(scene, onStep, rest, [...done, { ...run, ...reading }]);
}

const WIDTHS = [7, 14, 8, 6, 8, 8] as const;

const row = (cells: readonly string[]) =>
  cells
    .map((cell, index) =>
      index < 2
        ? cell.padEnd(WIDTHS[index] ?? 0)
        : cell.padStart(WIDTHS[index] ?? 0),
    )
    .join('');

/**
 * Reads the frame time of each look whole and of the full looks without each
 * of `WITHOUTS` alone, each once every tile is in and the frames have
 * settled, then puts back the look and what was left out before; tells
 * `onStep` which reading it is on. Resolves with a table to paste: `heading`
 * (what reproduces the view), then per reading the mean and longest frame and
 * what leaving the cost out saved against its look whole. A run during which
 * the page was hidden, whose frames the browser throttles, says so on its
 * first line.
 */
export async function measure(
  scene: IslandScene,
  view: Window | typeof globalThis,
  heading: () => readonly string[],
  onStep: (step: string) => void,
): Promise<string> {
  const look = scene.look();
  const before = scene.without();
  const page = { hidden: false };
  const watch = new AbortController();
  const { signal } = watch;
  view.document.addEventListener(
    'visibilitychange',
    () => {
      if (view.document.hidden) page.hidden = true;
    },
    { signal },
  );
  let readings: ReadonlyArray<Run & Timed>;
  try {
    readings = await readAll(scene, onStep, RUNS, []);
  } finally {
    watch.abort();
    scene.setLook(look);
    scene.setWithout(before);
  }
  const whole = new Map(
    readings
      .filter(({ cost }) => cost === undefined)
      .map(({ look: shown, meanMs }) => [shown, meanMs]),
  );
  return [
    ...(page.hidden
      ? [
          'INVALID: the page was hidden during the run, so its frames were throttled',
        ]
      : []),
    ...heading(),
    `frame ms: mean of ${String(FRAME_WINDOW)} frames once tiles are in and ${String(SETTLE_FRAMES)} more drawn`,
    row(['look', 'without', 'ms', 'fps', 'saved', 'worst']),
    ...readings.map(({ look: shown, cost, meanMs, worstMs }) =>
      row([
        shown,
        cost ?? '-',
        meanMs.toFixed(1),
        (1000 / meanMs).toFixed(0),
        cost === undefined
          ? '-'
          : ((whole.get(shown) ?? Number.NaN) - meanMs).toFixed(1),
        worstMs.toFixed(1),
      ]),
    ),
  ].join('\n');
}
