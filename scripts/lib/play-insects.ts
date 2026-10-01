/** The butterflies' part of `play-mushrooms.ts`'s tap sequence, played once the meadow is bare. */

import { z } from 'zod';

import { FLIGHT_HABITS } from '../../src/pages/mushrooms/model/flight-habits.ts';
import { LANDING } from '../../src/pages/mushrooms/model/insect-motion.ts';
import { INSECT_LIMITS } from '../../src/pages/mushrooms/model/insects.ts';
import { TAP_RADIUS } from '../../src/pages/mushrooms/ui/scene/tap-reach.ts';
import { pick } from '../../src/shared/lib/collections.ts';
import {
  type Controls,
  type Expect,
  Insects,
  inTurn,
  type Page,
  Point,
  ShownInsect,
  State,
} from './mushroom-probe.ts';

/** How many butterflies are released: one past their limit, so the oldest leaves. */
const RELEASES = INSECT_LIMITS.butterfly + 1;
/** How close to its perch, in CSS px, a butterfly at rest is drawn. */
const ON_PERCH = 1.5;
/** Frames per look while waiting for a butterfly to be somewhere, and the most looks. */
const LOOK = 15;
const MOST_LOOKS = 80;
/**
 * The fewest looks over which every butterfly that stays must be seen on a
 * perch; the looks go on until the longest of their flights in has landed,
 * however far a wide screen stretches it (`stride`), up to `MOST_LOOKS`.
 */
const PERCH_LOOKS = 24;
/** How long, in ms, a butterfly found at rest has still to stay there. */
const STAYS_MS = 1500;
/**
 * The most frames a look waiting on a rest may step: a butterfly rests at
 * least `FLIGHT_HABITS.butterfly.resting[0]` from its arrival, is seen at
 * rest once its `LANDING` is done, and must have `STAYS_MS` left, so every
 * rest is seen by looks this far apart.
 */
export const REST_LOOK = Math.floor(
  ((FLIGHT_HABITS.butterfly.resting[0] - LANDING - STAYS_MS) * 60) / 1000,
);

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
        const { mute, plus, minus, house, releases } = __probe.scene.layout;
        const { x, y } = ${JSON.stringify(pick(point, 'x', 'y'))};
        const controls = [mute, plus, minus, house, ...Object.values(releases)];
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
  const waitForCapRest = async (on?: string, every = LOOK) =>
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

export async function playInsects(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const {
    state,
    insects,
    shown,
    byId,
    now,
    perched,
    waitInReach,
    topsAt,
    waitForCapRest,
    expectPassedOn,
  } = fliersOn(page, expect);
  /** What a tap at `point` reaches (`topAt`), and where, for a failure to name. */
  const reaches = async (point: z.infer<typeof Point> | null) =>
    point === null
      ? 'nothing: it is not drawn'
      : `${String(await page.evaluate(`__probe.topAt(${JSON.stringify(point)})`, z.string().nullable()))} at (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`;

  // Something to rest on: two mushrooms, grown from the picker's first two caps.
  await inTurn(controls.picker.slice(0, 2), async (cap) => {
    await page.tap(controls.plus);
    await page.step(30);
    await page.tap(cap);
    await page.step(90);
  });
  expect(
    (await state()).mushrooms.length === 2,
    'two picks grew no two mushrooms',
  );

  await inTurn([...Array.from({ length: RELEASES }).keys()], async (index) => {
    await page.tap(controls.releases.butterfly);
    await page.step(index === 0 ? 40 : 20);
    if (index === 0) await page.shoot('b1-released');
  });
  const released = await insects();
  const [first] = released;
  expect(
    released.length === RELEASES,
    `${String(released.length)} butterflies, not ${String(RELEASES)}`,
  );
  expect(
    first?.to.kind === 'away',
    'the fifth butterfly did not send the first away',
  );
  await page.step(30);
  await page.shoot('b2-arriving');

  // Every one that stays reaches a perch, or roams the air while none is
  // free, and none of them leaves; the first flies off and is gone.
  const reached = new Set<string>();
  const roamed = new Set<string>();
  const left = new Set<string>();
  let roamingShot = false;
  const landedBy =
    Math.max(...released.map(({ arrives }) => arrives)) + LANDING;
  const look = async (looks: number): Promise<void> => {
    const at = await now();
    await inTurn(await insects(), async (insect) => {
      if (await perched(insect, at)) reached.add(insect.id);
      if (insect.to.kind === 'air') roamed.add(insect.id);
      if (insect.to.kind === 'away') left.add(insect.id);
    });
    if (roamed.size > 0 && !roamingShot) {
      roamingShot = true;
      await page.shoot('b3-roaming');
    }
    await page.step(LOOK);
    const more = looks + 1 < PERCH_LOOKS || at < landedBy;
    if (more && looks + 1 < MOST_LOOKS) await look(looks + 1);
  };
  await look(0);
  const staying = released.slice(1).map(({ id }) => id);
  for (const id of staying) {
    expect(
      reached.has(id) || roamed.has(id),
      `${id} never reached a perch nor roamed`,
    );
    expect(!left.has(id), `${id} left the meadow without being sent away`);
  }
  const firstId = first?.id ?? '';
  expect(
    (await byId(firstId)) === undefined && (await shown(firstId)) === null,
    'the butterfly sent away is still in the meadow',
  );
  note(
    `${String(reached.size)} of ${String(staying.length)} butterflies perched, ${String(roamed.size)} roamed`,
  );
  await page.shoot('b3-perched');

  // A tap on one at rest sends it off and goes on to what it sits on.
  const sitting = await waitInReach((all, at) =>
    all.find((insect) => landed(insect, at) && insect.leaves - at > 1000),
  );
  if (sitting === undefined) {
    expect(false, 'no butterfly ever sat still where a finger reaches it');
    return;
  }
  const { insect: resting, point: restingAt } = sitting;
  const restingTop = await reaches(restingAt);
  await page.tap(restingAt);
  const tappedAt = await now();
  await page.step(2);
  const startled = await byId(resting.id);
  expect(
    startled?.legs === resting.legs + 1 &&
      Math.abs(startled.departs - tappedAt) < 100,
    `a tap on ${resting.id} at rest did not send it off: it reached ${restingTop}`,
  );
  await expectPassedOn(resting, tappedAt);
  await page.step(12);
  await page.shoot('b4-startled');

  // In the air, a tap jolts it, leaves its flight as it was, and goes no
  // further: the picker and the selection stay as they were.
  await page.tap(controls.plus);
  await page.step(2);
  const before = await state();
  expect(before.picking, '`+` did not open the picker');
  const flying = await shown(resting.id);
  const flyingTop = await reaches(flying);
  if (flying) await page.tap(flying);
  await page.step(2);
  const still = await byId(resting.id);
  const jolted = await shown(resting.id);
  const after = await state();
  expect(
    still?.legs === startled?.legs && still?.departs === startled?.departs,
    `a tap on ${resting.id} in the air changed its flight`,
  );
  expect(
    typeof jolted?.tappedAt === 'number' &&
      (await now()) - jolted.tappedAt * 1000 < 200,
    `a tap on ${resting.id} in the air did not reach it: it reached ${flyingTop}`,
  );
  expect(
    after.picking && after.selected === before.selected,
    'a tap on a butterfly in the air closed the picker or changed the selection',
  );
  await page.tap(controls.plus);
  await page.step(30);

  // A tap over a cap a butterfly rests on — the cap's middle, or where the
  // butterfly is drawn where the middle is not under it — selects the
  // mushroom and sends the butterfly off, both.
  const onCapToTap = await waitForCapRest();
  if (onCapToTap?.to.kind !== 'cap') {
    expect(false, 'no butterfly ever rested on a cap to be tapped through');
    return;
  }
  const tappedCap = onCapToTap.to.id;
  // The selection has to change for the tap to prove anything: a tap on the
  // bare sky lets go of it first.
  if ((await state()).selected === tappedCap) {
    const { x, y } = controls.plus;
    const sky = [0.3, 0.5, 0.7].map((across) => ({ x: x * across, y }));
    const tops = await topsAt(sky);
    const bare = sky[tops.indexOf(null)];
    if (bare) await page.tap(bare);
    await page.step(2);
  }
  expect(
    (await state()).selected !== tappedCap,
    `${tappedCap} stayed selected before it was tapped through`,
  );
  const label = `insect:${onCapToTap.id}`;
  /** The cap's middle, or the butterfly's drawn point, whichever a tap on reaches the butterfly; `undefined` while neither does. */
  const overButterfly = async () => {
    const drawn = await shown(onCapToTap.id);
    const middle = await page.evaluate(
      `__probe.capMiddle(${JSON.stringify(tappedCap)})`,
      Point,
    );
    const candidates = drawn ? [middle, pick(drawn, 'x', 'y')] : [middle];
    const tops = await topsAt(candidates);
    const index = tops.indexOf(label);
    if (index !== -1) {
      note(
        `tapped through ${index === 0 ? "the cap's middle" : 'the butterfly, the middle not under it'}`,
      );
    }
    return candidates[index];
  };
  /** Steps until a tap over the cap reaches the butterfly, while another flies over it. */
  const findOver = async (
    looks: number,
  ): Promise<z.infer<typeof Point> | undefined> => {
    const point = await overButterfly();
    if (point !== undefined || looks === 0) return point;
    await page.step(2);
    return findOver(looks - 1);
  };
  const middle = await findOver(10);
  if (middle === undefined) {
    expect(false, `no tap over ${tappedCap} reaches ${onCapToTap.id} on it`);
    return;
  }
  const unmoved = await byId(onCapToTap.id);
  expect(
    unmoved?.legs === onCapToTap.legs,
    `${onCapToTap.id} left ${tappedCap} before it could be tapped through`,
  );
  await page.tap(middle);
  const throughAt = await now();
  await page.step(2);
  const flownOff = await byId(onCapToTap.id);
  expect(
    flownOff?.legs === onCapToTap.legs + 1 &&
      Math.abs(flownOff.departs - throughAt) < 100,
    `a tap over ${tappedCap} did not send ${onCapToTap.id} off`,
  );
  expect(
    (await state()).selected === tappedCap,
    `a tap over ${tappedCap}, through ${onCapToTap.id}, did not select it`,
  );
  await page.step(4);
  await page.shoot('b5-tapped-through');

  // A mushroom sunk under a resting butterfly sends it off. The cap the
  // first resting butterfly is on is selected — through the butterfly where
  // it covers the cap whole, which startles it — and then a butterfly
  // resting on the selected cap is waited for, so the tap never startles the
  // one the sink is to send off.
  const firstRest = await waitForCapRest();
  if (firstRest?.to.kind !== 'cap') {
    expect(false, 'no butterfly ever rested on a cap');
    return;
  }
  const capId = firstRest.to.id;
  const capAt = await page.evaluate(
    `__probe.mushroom(${JSON.stringify(capId)}, true)`,
    Point.nullable(),
  );
  if (capAt === null) {
    expect(false, `no tap on ${capId}'s cap reaches it`);
    return;
  }
  await page.tap(capAt);
  await page.step(6);
  expect(
    (await state()).selected === capId,
    `a tap on ${capId} did not select it`,
  );
  // Looked for three times as long: with the world's flowers and caps to
  // choose from, a butterfly comes to one given cap seldom.
  const onCap = await waitForCapRest(capId, LOOK * 3);
  if (onCap === undefined) {
    expect(false, `no butterfly came to rest on the selected ${capId}`);
    return;
  }
  await page.shoot('b6-resting');
  const sunkAt = await now();
  await page.tap(controls.minus);
  await page.step(3);
  const flown = await byId(onCap.id);
  expect(
    flown?.legs === onCap.legs + 1 &&
      flown.from.kind === 'cap' &&
      flown.from.id === capId &&
      !(flown.to.kind === 'cap' && flown.to.id === capId) &&
      flown.departs >= sunkAt,
    `${onCap.id} stayed on ${capId} as it sank`,
  );
  await page.step(12);
  await page.shoot('b7-takeoff');
}
