/**
 * The flies' and the bees' part of `play-mushrooms.ts`'s tap sequence,
 * played after the butterflies': every kind released to its limit, each
 * tapped at rest, a bee planting a flower, and what `flier-watch.ts` saw
 * over every frame of the whole run read back and held to its bounds.
 */

import { z } from 'zod';

import { FLIGHT_HABITS } from '../../src/pages/mushrooms/model/flight.ts';
import type { InsectKind } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { LIGHT_STEP } from '../../src/pages/mushrooms/model/insect-light.ts';
import { INSECT_LIMITS } from '../../src/pages/mushrooms/model/insects.ts';
import { LEAST_SPANS } from '../../src/pages/mushrooms/ui/scene/layout.ts';
import {
  HEADING_AFTER,
  MOST_HEADING_OFF,
  MOST_REST_TURN,
  MOST_SPIN,
  MOST_TURN_RATE,
  Watch,
} from './flier-watch.ts';
import {
  type Controls,
  type Expect,
  inTurn,
  type Page,
  Point,
  Top,
} from './mushroom-probe.ts';
import { fliersOn, type Insect, landed } from './play-insects.ts';

/** How many taps are aimed at a fly in flight, and how many must reach it. */
const FLYING_TAPS = 10;
const FLYING_REACHED = 9;
/** How long a fly tapped in flight must have flown, and still have to fly, in ms, so the tap lands mid-flight. */
const MID_FLIGHT = 150;
/**
 * The longest way between two perches on any screen, in butterfly sizes
 * (`Places`), past the 44.6 measured on the desktop.
 */
const FARTHEST = 46;
/**
 * Frames per look while waiting for a fly in flight to be drawn on screen,
 * and the most looks: one past a fly's longest flight, `FARTHEST` at its
 * cruise, the longest any fly in flight can stay off the screen.
 */
const SIGHT_LOOK = 15;
const SIGHT_LOOKS =
  Math.ceil(
    Math.max(
      FLIGHT_HABITS.fly.flying[1],
      (1000 * FARTHEST) / FLIGHT_HABITS.fly.cruise,
    ) /
      ((SIGHT_LOOK * 1000) / 60),
  ) + 1;

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

/**
 * How many flowers the bees have planted, and the one planted as `id` as
 * drawn, the newest where no id is given.
 */
const plantedAs = (id?: string) => `(() => {
  const scene = window.__game.scene.scenes[0];
  const { planted } = scene.meadow;
  const newest = ${id === undefined ? 'planted.at(-1)' : `planted.find((each) => each.id === ${JSON.stringify(id)})`};
  const shown = newest && scene.flowers.shown.get(newest.id);
  return {
    count: planted.length,
    last: shown
      ? {
          id: newest.id,
          visible: shown.container.visible,
          scale: shown.container.scaleY,
          ...__probe.toScreen(shown.container),
        }
      : null,
  };
})()`;

type Fliers = ReturnType<typeof fliersOn>;

/** Steps until an insect of `kind` sits still in sight with time to stay; `undefined` if none does. */
async function restingOf(
  { waitFor }: Fliers,
  kind: InsectKind,
): Promise<Insect | undefined> {
  return waitFor((all, at) =>
    all.find(
      (insect) =>
        insect.kind === kind &&
        insect.inSight &&
        landed(insect, at) &&
        insect.leaves - at > 600,
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
 * Taps a fly in flight where it is drawn on the screen, `FLYING_TAPS` times, among every
 * other insect in the air, and expects at least `FLYING_REACHED` of the taps
 * to reach it: a tap goes to the body nearest the finger, whatever is drawn
 * over it. How many the insect drawn on top would have let through is noted
 * beside it.
 */
async function tapFlying(
  page: Page,
  { waitFor, shown, now, tappable }: Fliers,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const tally = { aimed: 0, reached: 0, onTop: 0 };
  /** What each tap that missed reached instead, by the scene's hit test (`topAt`), and where. */
  const missed: string[] = [];
  /** Steps until a fly is mid-flight and drawn on the screen, where a child could tap it; `undefined` if none ever is. */
  const flyingInSight = async (
    looks: number,
  ): Promise<{ fly: Insect; point: z.infer<typeof Point> } | undefined> => {
    const fly = await waitFor((all, at) =>
      all.find(
        (insect) =>
          insect.kind === 'fly' &&
          insect.to.kind !== 'away' &&
          at > insect.departs + MID_FLIGHT &&
          at < insect.arrives - MID_FLIGHT,
      ),
    );
    const drawn = fly && (await shown(fly.id));
    if (!fly || !drawn) return undefined;
    const point = Point.parse(drawn);
    if (await tappable(point)) return { fly, point };
    if (looks <= 1) return undefined;
    await page.step(SIGHT_LOOK);
    return flyingInSight(looks - 1);
  };
  await inTurn([...Array.from({ length: FLYING_TAPS }).keys()], async () => {
    const found = await flyingInSight(SIGHT_LOOKS);
    if (!found) return;
    const { fly, point } = found;
    const top = await page.evaluate(
      `__probe.topAt(${JSON.stringify({ ...point, drawn: true })})`,
      Top,
    );
    const reaches = await page.evaluate(
      `__probe.topAt(${JSON.stringify(point)})`,
      Top,
    );
    const before = await now();
    await page.tap(point);
    await page.step(2);
    const tappedAt = (await shown(fly.id))?.tappedAt;
    tally.aimed += 1;
    if (top === `insect:${fly.id}`) tally.onTop += 1;
    if (typeof tappedAt === 'number' && tappedAt * 1000 >= before) {
      tally.reached += 1;
    } else {
      missed.push(
        `${String(reaches)} at (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`,
      );
    }
    await page.step(20);
  });
  expect(
    tally.aimed === FLYING_TAPS && tally.reached >= FLYING_REACHED,
    `of ${String(tally.aimed)} taps at a fly in flight, ${String(tally.reached)} reached it, under ${String(FLYING_REACHED)} of ${String(FLYING_TAPS)}; the rest reached ${missed.join(', ')}`,
  );
  note(
    `taps at a fly in flight: ${String(tally.reached)} of ${String(tally.aimed)} reached it; the top-drawn insect alone would have let ${String(tally.onTop)} through`,
  );
}

/**
 * Holds what `flier-watch.ts` saw over every frame of `page` to its bounds:
 * no body pointing more than `MOST_HEADING_OFF` off the way it travels once
 * its leg is `HEADING_AFTER` old, none turning round more than `MOST_SPIN`
 * over a leg, none settled more than
 * `MOST_REST_TURN` off facing up, no two hovering fliers overlapping while
 * the air had a spot open, and each of `kinds` drawn at least its
 * `LEAST_SPANS` across.
 */
async function checkWatch(
  page: Page,
  expect: Expect,
  note: (line: string) => void,
  kinds: readonly InsectKind[],
): Promise<void> {
  const {
    worstHeading,
    headings,
    worstSpin,
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
    worstTurn,
    worstLight,
  } = await page.evaluate('window.__watch', Watch);
  expect(
    worstTurn.kind === null ||
      worstTurn.rate <= (MOST_TURN_RATE[worstTurn.kind] ?? 0),
    `${String(worstTurn.id)} (${String(worstTurn.kind)}) turned ${worstTurn.rate.toFixed(2)} rad/s from one frame to the next at ${worstTurn.at.toFixed(0)} ms, past its kind's ${String(worstTurn.kind && MOST_TURN_RATE[worstTurn.kind]?.toFixed(2))}`,
  );
  expect(
    worstLight.off <= LIGHT_STEP + 1e-3,
    `${String(worstLight.id)} (${String(worstLight.kind)}) was shown ${worstLight.off.toFixed(3)} rad from the turn its light was painted for at ${worstLight.at.toFixed(0)} ms, past LIGHT_STEP ${LIGHT_STEP.toFixed(3)}`,
  );
  expect(
    worstHeading.off <= MOST_HEADING_OFF,
    `${String(worstHeading.id)} (${String(worstHeading.kind)}) faced ${worstHeading.off.toFixed(2)} rad off the way it flew at ${worstHeading.at.toFixed(0)} ms, past its leg's first ${String(HEADING_AFTER)} ms: ${String(worstHeading.leg)}`,
  );
  expect(
    worstSpin.spin <= MOST_SPIN,
    `${String(worstSpin.id)} (${String(worstSpin.kind)}) turned round ${(worstSpin.spin / MOST_SPIN).toFixed(2)} times on its leg ${String(worstSpin.legs)}`,
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
      span !== undefined && span >= LEAST_SPANS[kind],
      `a ${kind} drawn ${String(span?.toFixed(1))} px across, under ${String(LEAST_SPANS[kind])}`,
    );
  }
  note(
    `over ${String(frames)} frames: fastest turn ${worstTurn.rate.toFixed(2)} rad/s (${String(worstTurn.kind)}), light at most ${worstLight.off.toFixed(3)} rad off its painted turn, worst heading ${worstHeading.off.toFixed(2)} rad off its way, frames in flight facing over ${String(MOST_HEADING_OFF)} off ${Object.entries(
      headings,
    )
      .map(
        ([kind, { frames: seen, off }]) =>
          `${kind} ${String(off)} of ${String(seen)}`,
      )
      .join(
        ', ',
      )}, most turning round on one leg ${(worstSpin.spin / MOST_SPIN).toFixed(2)} times, worst rest ${worstRest.turn.toFixed(2)} rad, ${String(crossings)} frames with fliers crossing in flight, ${String(hoverForced)} with two hovering overlapped for want of an open spot, least spans ${Object.entries(
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
    '({ flowers: __probe.scene.perches.sight.flowers.length, room: __probe.scene.perches.sight.room.length })',
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
  await tapFlying(page, fliers, expect, note);

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
  const before = await page.evaluate(plantedAs(), Planted);
  /** Steps until a flower is planted, `looks` looks at the most, a frame shot of the bees in the air on the way. */
  const untilPlanted = async (
    looks: number,
    shotAloft: boolean,
  ): Promise<z.infer<typeof Planted>> => {
    await page.step(PLANT_LOOK);
    const seen = await page.evaluate(plantedAs(), Planted);
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
    // The one seen planted, which the bees may since have planted beside.
    const grown = await page.evaluate(plantedAs(planted.last?.id), Planted);
    expect(
      grown.last?.visible === true && Math.abs(grown.last.scale - 1) < 0.02,
      `the planted flower is not drawn full grown: ${JSON.stringify(grown.last)}`,
    );
    note(
      `planted ${String(grown.count)} flower(s), the first seen at (${String(Math.round(grown.last?.x ?? 0))}, ${String(Math.round(grown.last?.y ?? 0))})`,
    );
    await page.shoot('p2-planted-open');
  } else if (sight.room > 0) {
    expect(false, 'no bee planted a flower, with room offered to plant');
  } else {
    note('no room to plant on this meadow, so no bee planted');
  }
  await checkWatch(page, expect, note, ['bee']);
}
