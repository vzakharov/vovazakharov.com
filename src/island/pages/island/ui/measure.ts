import { FRAME_WINDOW } from '../lib/pace';
import { type Without, WITHOUTS } from '../lib/without';
import type { IslandScene } from './island-scene-api';

/** Frames drawn after a change before its reading starts: the shaders compiled and the frame time settled. */
const SETTLE_FRAMES = 60;
/** How often a measurement looks whether its frames are in, ms. */
const POLL_MS = 100;

type Clock = Pick<Window, 'setInterval' | 'clearInterval'>;

/** One reading: what was left out (none for `undefined`) and the mean frame time without it. */
type Reading = { readonly cost: Without | undefined; readonly meanMs: number };

/** The mean frame time over the `FRAME_WINDOW` frames after the next `SETTLE_FRAMES`. */
async function settledMs(scene: IslandScene, clock: Clock): Promise<number> {
  const until = (scene.pace()?.drawn ?? 0) + SETTLE_FRAMES + FRAME_WINDOW;
  return new Promise((resolve) => {
    const poll = clock.setInterval(() => {
      const pace = scene.pace();
      if (pace === undefined || pace.drawn < until) return;
      clock.clearInterval(poll);
      resolve(pace.frameMs);
    }, POLL_MS);
  });
}

/** Reads `costs` one after another, each left out alone, after `done`. */
async function readAll(
  scene: IslandScene,
  clock: Clock,
  onStep: (step: string) => void,
  costs: ReadonlyArray<Without | undefined>,
  done: readonly Reading[],
): Promise<readonly Reading[]> {
  const [cost, ...rest] = costs;
  if (costs.length === 0) return done;
  const total = done.length + costs.length;
  onStep(`${cost ?? 'none'} (${String(done.length + 1)}/${String(total)})`);
  scene.setWithout(new Set(cost === undefined ? [] : [cost]));
  const ms = await settledMs(scene, clock);
  return readAll(scene, clock, onStep, rest, [...done, { cost, meanMs: ms }]);
}

const row = (cells: readonly [string, string, string]) =>
  `${cells[0].padEnd(13)}${cells[1].padStart(8)}${cells[2].padStart(8)}`;

/**
 * Reads the frame time with nothing left out and then with each of
 * `WITHOUTS` left out alone, in the look on screen, and puts back what was
 * left out before; tells `onStep` which reading it is on. Resolves with a
 * table to paste: each reading's mean frame time and what leaving it out
 * saved.
 */
export async function measure(
  scene: IslandScene,
  clock: Clock,
  onStep: (step: string) => void,
): Promise<string> {
  const look = scene.look();
  const before = scene.without();
  let readings: readonly Reading[];
  try {
    readings = await readAll(
      scene,
      clock,
      onStep,
      [undefined, ...WITHOUTS],
      [],
    );
  } finally {
    scene.setWithout(before);
  }
  const whole = readings[0]?.meanMs ?? Number.NaN;
  return [
    `look ${look}, frame ms as the mean of ${String(FRAME_WINDOW)} frames`,
    row(['without', 'ms', 'saved']),
    ...readings.map(({ cost, meanMs: ms }) =>
      row([
        cost ?? 'none',
        ms.toFixed(1),
        cost === undefined ? '' : (whole - ms).toFixed(1),
      ]),
    ),
  ].join('\n');
}
