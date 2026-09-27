/** The butterflies' part of `play-mushrooms.ts`'s tap sequence, played once the meadow is bare. */

import type { z } from 'zod';

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

/** How many butterflies are released: one past `BUTTERFLY_LIMIT` in `model/flight.ts`. */
const RELEASES = 5;
/** How long a landing's bob lasts, in ms: `LANDING` in `model/insect-motion.ts`. */
const LANDING = 450;
/** How close to its perch, in CSS px, a butterfly at rest is drawn. */
const ON_PERCH = 1.5;
/** Frames per look while waiting for a butterfly to be somewhere, and the most looks. */
const LOOK = 15;
const MOST_LOOKS = 80;
/** Looks over which every butterfly that stays must be seen on a perch: longer than any flight. */
const PERCH_LOOKS = 16;

type Insect = z.infer<typeof Insects>[number];

/** Whether `insect` has come down on a perch, its landing done, by `at` ms. */
function landed(insect: Insect, at: number): boolean {
  return insect.to.kind !== 'away' && at >= insect.arrives + LANDING;
}

export async function playInsects(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
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
  /** Steps until `found` picks an insect, `LOOK` frames at a time; `undefined` if none ever does. */
  const waitFor = async (
    found: (all: Insect[], at: number) => Insect | undefined,
    looks = MOST_LOOKS,
  ): Promise<Insect | undefined> => {
    const hit = found(await insects(), await now());
    if (hit !== undefined || looks === 0) return hit;
    await page.step(LOOK);
    return waitFor(found, looks - 1);
  };

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
    await page.tap(controls.butterfly);
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

  // Every one that stays reaches a perch; the first flies off and is gone.
  const reached = new Set<string>();
  await inTurn([...Array.from({ length: PERCH_LOOKS }).keys()], async () => {
    const at = await now();
    await inTurn(await insects(), async (insect) => {
      if (await perched(insect, at)) reached.add(insect.id);
    });
    await page.step(LOOK);
  });
  const staying = released.slice(1).map(({ id }) => id);
  for (const id of staying) {
    expect(reached.has(id), `${id} never reached a perch`);
  }
  const firstId = first?.id ?? '';
  expect(
    (await byId(firstId)) === undefined && (await shown(firstId)) === null,
    'the butterfly sent away is still in the meadow',
  );
  note(
    `${String(reached.size)} of ${String(staying.length)} butterflies perched`,
  );
  await page.shoot('b3-perched');

  // A tap on one at rest sends it off, and leaves the picker and the selection be.
  await page.tap(controls.plus);
  await page.step(30);
  const before = await state();
  expect(before.picking, '`+` did not open the picker');
  const resting = await waitFor((all, at) =>
    all.find((insect) => landed(insect, at) && insect.leaves - at > 1000),
  );
  if (resting === undefined) {
    expect(false, 'no butterfly ever sat still to be tapped');
    return;
  }
  const restingAt = await shown(resting.id);
  if (restingAt) await page.tap(restingAt);
  const tappedAt = await now();
  await page.step(2);
  const startled = await byId(resting.id);
  const after = await state();
  expect(
    startled?.legs === resting.legs + 1 &&
      Math.abs(startled.departs - tappedAt) < 100,
    `a tap on ${resting.id} at rest did not send it off`,
  );
  expect(
    after.picking && after.selected === before.selected,
    'a tap on a butterfly closed the picker or changed the selection',
  );
  await page.step(12);
  await page.shoot('b4-startled');

  // In the air, a tap jolts it and leaves its flight as it was.
  const flying = await shown(resting.id);
  if (flying) await page.tap(flying);
  await page.step(2);
  const still = await byId(resting.id);
  const jolted = await shown(resting.id);
  expect(
    still?.legs === startled?.legs && still?.departs === startled?.departs,
    `a tap on ${resting.id} in the air changed its flight`,
  );
  expect(
    typeof jolted?.tappedAt === 'number' &&
      (await now()) - jolted.tappedAt * 1000 < 200,
    `a tap on ${resting.id} in the air did not reach it`,
  );
  await page.tap(controls.plus);
  await page.step(30);

  // A mushroom sunk under a resting butterfly sends it off.
  const onCap = await waitFor((all, at) =>
    all.find(
      (insect) =>
        insect.to.kind === 'cap' &&
        landed(insect, at) &&
        insect.leaves - at > 1500,
    ),
  );
  if (onCap?.to.kind !== 'cap') {
    expect(false, 'no butterfly ever rested on a cap');
    return;
  }
  const capId = onCap.to.id;
  await page.shoot('b5-resting');
  const capAt = await page.evaluate(
    `__probe.mushroom(${JSON.stringify(capId)})`,
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
  await page.shoot('b6-takeoff');
}
