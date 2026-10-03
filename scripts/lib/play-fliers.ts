/** The looks and waits the insect steps of `play-mushrooms.ts` take over the insects the page shows. */

import { z } from 'zod';

import { FLIGHT_HABITS } from '../../src/pages/mushrooms/model/flight-habits.ts';
import { LANDING } from '../../src/pages/mushrooms/model/insect-motion.ts';
import { TAP_RADIUS } from '../../src/pages/mushrooms/ui/scene/tap-reach.ts';
import { pick } from '../../src/shared/lib/collections.ts';
import {
  type Expect,
  Insects,
  type Page,
  type Point,
  ShownInsect,
  State,
} from './mushroom-probe.ts';

/** How close to its perch, in px of its leg's frame, a butterfly at rest is flown. */
const ON_PERCH = 1.5;
/** Frames per look while waiting for a butterfly to be somewhere, and the most looks. */
export const LOOK = 15;
export const MOST_LOOKS = 80;
/** How long, in ms, a butterfly found at rest has still to stay there. */
const STAYS_MS = 1500;
/**
 * The most frames a look waiting on a rest may step: a butterfly's shortest
 * rest, less its landing and `STAYS_MS`, so looks this far apart miss none.
 */
export const REST_LOOK = Math.floor(
  ((FLIGHT_HABITS.butterfly.resting[0] - LANDING - STAYS_MS) * 60) / 1000,
);
/**
 * Frames per look waiting for a rest on a cap, within `REST_LOOK`: `MOST_LOOKS`
 * span a minute, as one leg across a wide screen runs up to half that and most
 * legs end on a flower.
 */
const CAP_LOOK = LOOK * 3;

export type Insect = z.infer<typeof Insects>[number];

/** Whether `insect` has come down on a perch, its landing done, by `at` ms. */
export function landed(insect: Insect, at: number): boolean {
  const { kind } = insect.to;
  return (
    (kind === 'cap' || kind === 'flower') && at >= insect.arrives + LANDING
  );
}

/** The insects as the page shows them, and the looks and waits every insect step takes. */
export function fliersOn(page: Page, expect: Expect) {
  const state = async () => page.evaluate('__probe.state()', State);
  const insects = async () => page.evaluate('__probe.insects()', Insects);
  const shown = async (id: string) =>
    page.evaluate(`__probe.insect(${JSON.stringify(id)})`, ShownInsect);
  const byId = async (id: string) =>
    (await insects()).find((insect) => insect.id === id);
  const now = async () => (await state()).clock * 1000;
  /** Whether `insect` is drawn on its perch at `at` ms. */
  const perched = async (insect: Insect, at: number) => {
    if (!landed(insect, at)) return false;
    const drawn = await shown(insect.id);
    return (
      typeof drawn?.end?.x === 'number' &&
      Math.hypot(drawn.at.x - drawn.end.x, drawn.at.y - drawn.end.y) <= ON_PERCH
    );
  };
  /** Steps until `found` picks an insect, `every` frames at a time; `undefined` if none ever does. */
  const waitFor = async (
    found: (all: Insect[], at: number) => Insect | undefined,
    looks = MOST_LOOKS,
    every = LOOK,
  ): Promise<Insect | undefined> => {
    const hit = found(await insects(), await now());
    if (hit !== undefined || looks === 0) return hit;
    await page.step(every);
    return waitFor(found, looks - 1, every);
  };

  /**
   * Whether a finger at `point` can tap what is drawn there: on the screen,
   * and off every control, which stands over the meadow and takes a tap
   * within its reach first, as a child's finger on a button means the button.
   */
  const tappable = async (point: z.infer<typeof Point>) =>
    page.evaluate(
      `(() => {
        const { map, plus, minus, house, releases } = __probe.scene.layout;
        const { x, y } = ${JSON.stringify(pick(point, 'x', 'y'))};
        const controls = [map, plus, minus, house, ...Object.values(releases)];
        return x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight &&
          !controls.some((circle) =>
            Math.hypot(circle.x - x, circle.y - y) <= Math.max(circle.r, ${String(TAP_RADIUS)}));
      })()`,
      z.boolean(),
    );
  /**
   * Steps until `found` picks an insect drawn where a finger can tap it
   * (`tappable`), and where; `undefined` if none ever is.
   */
  const waitInReach = async (
    found: (all: Insect[], at: number) => Insect | undefined,
    looks = MOST_LOOKS,
  ): Promise<
    | { insect: Insect; point: NonNullable<z.infer<typeof ShownInsect>> }
    | undefined
  > => {
    const insect = await waitFor(found, looks);
    if (insect === undefined) return undefined;
    const point = await shown(insect.id);
    if (point !== null && (await tappable(point))) return { insect, point };
    if (looks <= 1) return undefined;
    await page.step(LOOK);
    return waitInReach(found, looks - 1);
  };

  /** What a tap at each of `points` reaches first (`__probe.topAt`). */
  const topsAt = async (points: ReadonlyArray<z.infer<typeof Point>>) =>
    Promise.all(
      points.map(async (point) =>
        page.evaluate(
          `__probe.topAt(${JSON.stringify(point)})`,
          z.string().nullable(),
        ),
      ),
    );
  /**
   * Steps until a butterfly is resting on a cap, on mushroom `on` when given,
   * with time to stay, looking every `every` frames, at most `REST_LOOK`.
   */
  const waitForCapRest = async (on?: string, every = CAP_LOOK) =>
    waitFor(
      (all, at) =>
        all.find(
          (insect) =>
            insect.to.kind === 'cap' &&
            (on === undefined || insect.to.id === on) &&
            landed(insect, at) &&
            insect.leaves - at > STAYS_MS,
        ),
      MOST_LOOKS,
      every,
    );
  /** Expects the tap at `at` ms on `insect` at rest to have gone on to its perch. */
  const expectPassedOn = async ({ id, to }: Insect, at: number) => {
    if (to.kind === 'cap') {
      expect(
        (await state()).selected === to.id,
        `a tap on ${id} resting on ${to.id} did not select it`,
      );
    }
    if (to.kind === 'flower') {
      const bloomed = await page.evaluate(
        `__probe.flowerTappedAt(${JSON.stringify(to.id)})`,
        z.number().nullable(),
      );
      expect(
        bloomed !== null && Math.abs(bloomed * 1000 - at) < 100,
        `a tap on ${id} drinking at ${to.id} did not bloom it`,
      );
    }
  };

  return {
    state,
    insects,
    shown,
    byId,
    now,
    perched,
    waitFor,
    tappable,
    waitInReach,
    topsAt,
    waitForCapRest,
    expectPassedOn,
  };
}
