/**
 * The flies' and the bees' part of `play-mushrooms.ts`'s tap sequence,
 * played after the butterflies': every kind released to its limit, each
 * tapped at rest, a bee planting a flower, and what `flier-watch.ts` saw
 * over every frame of the whole run read back and held to its bounds.
 */

import { z } from 'zod';

import { FLIGHT_HABITS } from '../../src/pages/mushrooms/model/flight.ts';
import type { InsectKind } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { INSECT_LIMITS } from '../../src/pages/mushrooms/model/insects.ts';
import { MOST_REST_TURN, MOST_TURN, Watch } from './flier-watch.ts';
import {
  type Controls,
  type Expect,
  inTurn,
  type Page,
  Point,
} from './mushroom-probe.ts';
import { fliersOn, type Insect, landed } from './play-insects.ts';

/** The least each kind's open wings span as drawn, in CSS px, to read on a phone. */
const LEAST_SPAN = {
  butterfly: 52,
  fly: 30,
  bee: 30,
} as const satisfies Record<InsectKind, number>;
/** Frames per look while waiting for a bee to plant, and the most looks. */
const PLANT_LOOK = 30;
const PLANT_LOOKS = 180;

const Planted = z.object({
  count: z.number(),
  last: z
    .object({
      id: z.string(),
      visible: z.boolean(),
      scale: z.number(),
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
});

/** How many flowers the bees have planted, and the newest as drawn. */
const PLANTED = `(() => {
  const scene = window.__game.scene.scenes[0];
  const { planted } = scene.meadow;
  const newest = planted.at(-1);
  const shown = newest && scene.flowers.shown.get(newest.id);
  return {
    count: planted.length,
    last: shown
      ? {
          id: newest.id,
          visible: shown.container.visible,
          scale: shown.container.scaleY,
          x: shown.container.x,
          y: shown.container.y,
        }
      : null,
  };
})()`;

type Fliers = ReturnType<typeof fliersOn>;

/** Steps until an insect of `kind` sits still with time to stay; `undefined` if none does. */
async function restingOf(
  { waitFor }: Fliers,
  kind: InsectKind,
): Promise<Insect | undefined> {
  return waitFor((all, at) =>
    all.find(
      (insect) =>
        insect.kind === kind && landed(insect, at) && insect.leaves - at > 600,
    ),
  );
}

/** Taps `resting` where it is drawn, and expects it off and the tap passed on to its perch. */
async function tapAtRest(
  page: Page,
  { insects, shown, now, topsAt, expectPassedOn }: Fliers,
  expect: Expect,
  resting: Insect,
): Promise<void> {
  await page.shoot(`f2-${resting.kind}-resting`);
  // Another insect flying over it takes the tap first, as it should, so the
  // tap waits for a moment when this one is on top where it is drawn.
  const onTop = async (
    looks: number,
  ): Promise<z.infer<typeof Point> | undefined> => {
    const drawn = await shown(resting.id);
    const still = (await insects()).find((each) => each.id === resting.id);
    if (!drawn || still?.legs !== resting.legs) return undefined;
    const point = Point.parse(drawn);
    const [top] = await topsAt([point]);
    if (top === `insect:${resting.id}`) return point;
    if (looks === 0) return undefined;
    await page.step(3);
    return onTop(looks - 1);
  };
  const point = await onTop(20);
  if (!point) {
    expect(false, `no tap where ${resting.id} rests ever reached it`);
    return;
  }
  await page.tap(point);
  const tappedAt = await now();
  await page.step(2);
  const startled = (await insects()).find((each) => each.id === resting.id);
  expect(
    startled?.legs === resting.legs + 1 &&
      Math.abs(startled.departs - tappedAt) < 100,
    `a tap on ${resting.id} at rest did not send it off`,
  );
  await expectPassedOn(resting, tappedAt);
  await page.step(10);
  await page.shoot(`f2-${resting.kind}-startled`);
}

/**
 * Holds what `flier-watch.ts` saw over every frame of `page` to its bounds:
 * no body turning more than `MOST_TURN` a frame, none settled more than
 * `MOST_REST_TURN` off facing up, no two hovering fliers overlapping while
 * the air had a spot open, and each of `kinds` drawn at least its
 * `LEAST_SPAN` across.
 */
async function checkWatch(
  page: Page,
  expect: Expect,
  note: (line: string) => void,
  kinds: readonly InsectKind[],
): Promise<void> {
  const {
    worstTurn,
    worstRest,
    worstHover,
    leastSpan,
    capRests,
    hoverOverlaps,
    hoverForced,
    crossings,
    frames,
    beeVisits,
    pollinating,
  } = await page.evaluate('window.__watch', Watch);
  expect(
    worstTurn.step <= MOST_TURN,
    `${String(worstTurn.id)} (${String(worstTurn.kind)}) turned ${worstTurn.step.toFixed(3)} rad in a frame at ${worstTurn.at.toFixed(0)} ms: ${String(worstTurn.leg)}`,
  );
  expect(
    worstRest.turn <= MOST_REST_TURN,
    `${String(worstRest.id)} (${String(worstRest.kind)}) sat ${worstRest.turn.toFixed(2)} rad off facing up at ${worstRest.at.toFixed(0)} ms`,
  );
  expect(
    hoverOverlaps === 0,
    `${String(hoverOverlaps)} frames with two fliers overlapping hovering in the air while a spot stood open: ${JSON.stringify(worstHover)}`,
  );
  for (const kind of kinds) {
    const span = leastSpan[kind];
    expect(
      span !== undefined && span >= LEAST_SPAN[kind],
      `a ${kind} drawn ${String(span?.toFixed(1))} px across, under ${String(LEAST_SPAN[kind])}`,
    );
  }
  note(
    `over ${String(frames)} frames: worst turn ${worstTurn.step.toFixed(3)} rad, worst rest ${worstRest.turn.toFixed(2)} rad, ${String(crossings)} frames with fliers crossing in flight, ${String(hoverForced)} with two hovering overlapped for want of an open spot, least spans ${Object.entries(
      leastSpan,
    )
      .map(([kind, span]) => `${kind} ${span.toFixed(0)} px`)
      .join(
        ', ',
      )}; bees drank ${String(beeVisits)} times, ${String(pollinating)} pollinating; flies rested ${String(capRests.spotted)} times on fly agarics, ${String(capRests.other)} on other caps (pull ${String(FLIGHT_HABITS.fly.spottedPull)})`,
  );
}

/** What the scene sees of the flowers: how many in sight, and how many with room to plant beside. */
async function flowerSight(page: Page) {
  return page.evaluate(
    '({ flowers: __probe.scene.sight.flowers.length, room: __probe.scene.sight.room.length })',
    z.object({ flowers: z.number(), room: z.number() }),
  );
}

/**
 * Every kind at its limit over a full forest, fly agarics among it: a fly
 * and a bee released past their limits send their oldest away, and each
 * tapped at rest takes off, the tap going on to its perch.
 */
export async function playBuzzers(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const fliers = fliersOn(page, expect);
  const { state, insects } = fliers;
  const room = 6 - (await state()).mushrooms.length;
  await inTurn([...Array.from({ length: room }).keys()], async (index) => {
    await page.tap(controls.plus);
    await page.step(30);
    const cap =
      controls.picker[index % 2 === 0 ? 0 : index % controls.picker.length];
    if (cap) await page.tap(cap);
    await page.step(60);
  });
  const sight = await flowerSight(page);
  note(
    `${String((await state()).mushrooms.length)} mushrooms standing; ${String(sight.flowers)} flowers in sight, ${String(sight.room)} with room to plant beside`,
  );

  await inTurn(['fly', 'bee'] as const, async (kind) => {
    const limit = INSECT_LIMITS[kind];
    await inTurn([...Array.from({ length: limit + 1 }).keys()], async () => {
      await page.tap(controls.releases[kind]);
      await page.step(12);
    });
    const ofKind = (await insects()).filter((each) => each.kind === kind);
    const staying = ofKind.filter((each) => each.to.kind !== 'away');
    expect(
      ofKind.length === limit + 1 && staying.length === limit,
      `${String(limit + 1)} ${kind} releases left ${String(staying.length)} staying, not ${String(limit)}`,
    );
    expect(
      ofKind[0]?.to.kind === 'away',
      `the last ${kind} released did not send the oldest away`,
    );
  });
  await page.step(20);
  await page.shoot('f1-buzzers-arriving');

  const fly = await restingOf(fliers, 'fly');
  if (fly) await tapAtRest(page, fliers, expect, fly);
  else expect(false, 'no fly ever sat still to be tapped');
  // The bees may find every flower taken here; alone, below, they must not.
  const bee = await restingOf(fliers, 'bee');
  if (bee) await tapAtRest(page, fliers, expect, bee);
  else note('no bee found a free flower among the butterflies to be tapped at');
  await checkWatch(page, expect, note, ['butterfly', 'fly']);
}

/**
 * Bees alone on a fresh meadow, where no butterfly takes the flowers they go
 * between: one at rest is tapped, and they are left until one plants a
 * flower beside one it pollinated, which grows up where it is drawn — wherever
 * the scene offers room to plant at all.
 */
export async function playPlanting(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const fliers = fliersOn(page, expect);
  const { insects, now } = fliers;
  const sight = await flowerSight(page);
  note(
    `bees alone: ${String(sight.flowers)} flowers in sight, ${String(sight.room)} with room to plant beside`,
  );
  await inTurn(
    [...Array.from({ length: INSECT_LIMITS.bee }).keys()],
    async () => {
      await page.tap(controls.releases.bee);
      await page.step(20);
    },
  );
  const bee = await restingOf(fliers, 'bee');
  if (bee) await tapAtRest(page, fliers, expect, bee);
  else expect(false, 'no bee ever sat still to be tapped, alone on the meadow');
  const before = await page.evaluate(PLANTED, Planted);
  /** Steps until a flower is planted, `looks` looks at the most, a frame shot of the bees in the air on the way. */
  const untilPlanted = async (
    looks: number,
    shotAloft: boolean,
  ): Promise<z.infer<typeof Planted>> => {
    await page.step(PLANT_LOOK);
    const seen = await page.evaluate(PLANTED, Planted);
    if (seen.count > before.count || looks <= 1) return seen;
    const at = await now();
    const flying = (await insects()).some(
      (each) => at > each.departs + 150 && at < each.arrives - 150,
    );
    if (flying && !shotAloft) await page.shoot('f3-bees-aloft');
    return untilPlanted(looks - 1, shotAloft || flying);
  };
  const planted = await untilPlanted(PLANT_LOOKS, false);
  if (planted.count > before.count) {
    await page.step(12);
    await page.shoot('p1-planted-growing');
    await page.step(90);
    const grown = await page.evaluate(PLANTED, Planted);
    expect(
      grown.last?.visible === true && Math.abs(grown.last.scale - 1) < 0.02,
      `the planted flower is not drawn full grown: ${JSON.stringify(grown.last)}`,
    );
    note(
      `planted ${String(grown.count)} flower(s), the newest at (${String(Math.round(grown.last?.x ?? 0))}, ${String(Math.round(grown.last?.y ?? 0))})`,
    );
    await page.shoot('p2-planted-open');
  } else if (sight.room > 0) {
    expect(false, 'no bee planted a flower, with room offered to plant');
  } else {
    note('no room to plant on this meadow, so no bee planted');
  }
  await checkWatch(page, expect, note, ['bee']);
}
