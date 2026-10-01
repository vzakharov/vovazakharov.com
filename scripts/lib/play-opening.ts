/**
 * The opening, `play-mushrooms.ts`'s run on a fresh meadow: at the opening
 * eye every mushroom and flower is drawn where the lens stands its layout
 * place (`ofLayout`), within `SAME_PX` — but for a thing standing past the
 * brow, which sinks behind it by design and is measured instead, how much
 * of it shows over the brow; then a butterfly
 * released facing the clump perches in view, and a 180° turn on `→` raises
 * no page error while it stays on its seat within `ON_SEAT`.
 */

import { z } from 'zod';

import { OPENING_EYE } from '../../src/pages/mushrooms/model/ground.ts';
import { LANDING } from '../../src/pages/mushrooms/model/insect-motion.ts';
import { TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import {
  browRow,
  ofLayout,
  viewAt,
} from '../../src/pages/mushrooms/ui/scene/view.ts';
import {
  Camera,
  type Controls,
  type Expect,
  type Page,
  Point,
} from './mushroom-probe.ts';
import { fliersOn } from './play-insects.ts';

const FPS = 60;
/** How near, in CSS px, a thing drawn at the opening counts as where the lens stands it. */
const SAME_PX = 0.5;
/** How far, in CSS px, a perched insect may be drawn off its seat as the eye turns. */
const ON_SEAT = 1;
/** Frames a landing's bob is left to die away before the seat is measured from. */
const LANDED_FRAMES = 30;
/** Frames into the turn its seat is shot at: the clump still in view. */
const SEAT_SHOT = 60;

/**
 * Every mushroom and flower drawn at the opening: where it is drawn, its
 * foot's place in the layout's world px, whether it
 * stands past the brow, and for a flower how tall it is drawn and how far its
 * head reaches up the screen.
 */
const OPENING = `(() => {
  const scene = __probe.scene;
  return [
    ...[...scene.bed.shown]
      .filter(([, { graphics }]) => graphics.visible)
      .map(([id, { graphics, laid, stands }]) => ({
        id: 'mushroom:' + id,
        drawn: __probe.toScreen(graphics),
        laid: { x: laid.x, y: laid.y },
        behind: stands.behind,
        alpha: graphics.alpha,
        height: null,
        top: null,
      })),
    ...[...scene.flowers.shown]
      .filter(([, { container, laid }]) => container.visible && laid)
      .map(([id, { container, laid, headR, headY, stands }]) => {
        const height = (headR - headY) * container.scaleY;
        return {
          id: 'flower:' + id,
          drawn: __probe.toScreen(container),
          laid: { x: laid.place.x, y: laid.place.y },
          behind: stands?.behind ?? false,
          alpha: container.alpha,
          height,
          top: __probe.toScreen({ x: container.x, y: container.y - height }).y,
        };
      }),
  ];
})()`;
const Opening = z.array(
  z.object({
    id: z.string(),
    drawn: Point,
    laid: Point,
    behind: z.boolean(),
    alpha: z.number(),
    height: z.number().nullable(),
    top: z.number().nullable(),
  }),
);

/**
 * Insect `id`'s flight point, unfidgeted, in the frame of the thing it is
 * perched on as that is drawn now, with that frame's matrix to turn a drift
 * in it back into screen px; `null` while either is not drawn.
 */
const onSeat = (id: string) => `(() => {
  const scene = __probe.scene;
  const shown = scene.insects.shown.get(${JSON.stringify(id)});
  const insect = scene.meadow.insects.find((one) => one.id === ${JSON.stringify(id)});
  if (!shown || !insect || !shown.container.visible) return null;
  const { to, arrives, leaves } = insect.leg;
  const perch = to.kind === 'cap'
    ? scene.bed.shown.get(to.id)?.graphics
    : to.kind === 'flower' ? scene.flowers.shown.get(to.id)?.container : undefined;
  if (!perch || !perch.visible) return null;
  // Where the insect is drawn, its fidget taken back off at its perch's zoom.
  const host = to.kind === 'cap' ? scene.bed.shown.get(to.id) : scene.flowers.shown.get(to.id);
  const zoom = host.stands.zoom;
  const at = {
    x: shown.container.x - shown.offset.x * zoom,
    y: shown.container.y - shown.offset.y * zoom,
  };
  const matrix = perch.getWorldTransformMatrix();
  const local = matrix.applyInverse(at.x, at.y, {});
  const drawn = __probe.toScreen(perch);
  if (drawn.x < 0 || drawn.x > scene.layout.width) return null;
  return {
    clock: scene.clock * 1000, arrives, leaves, perch: to.kind + ':' + to.id,
    local: { x: local.x, y: local.y },
    matrix: [matrix.a, matrix.b, matrix.c, matrix.d],
    heading: scene.eye.eye().heading,
  };
})()`;
const OnSeat = z
  .object({
    clock: z.number(),
    arrives: z.number(),
    leaves: z.number(),
    perch: z.string(),
    local: Point,
    matrix: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    heading: z.number(),
  })
  .nullable();

export async function playOpening(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const camera = await page.evaluate('__probe.scene.layout.camera', Camera);
  await page.shoot('final-opening');
  const things = (await page.evaluate(OPENING, Opening)).map((thing) => ({
    ...thing,
    lensed: ofLayout(viewAt(camera, OPENING_EYE), thing.laid, thing.laid.y),
  }));
  const strayBy = (thing: (typeof things)[number]) =>
    Math.hypot(thing.drawn.x - thing.lensed.x, thing.drawn.y - thing.lensed.y);
  const standing = things.filter(({ behind }) => !behind);
  const farthest = Math.max(0, ...standing.map((thing) => strayBy(thing)));
  const strays = standing.filter((thing) => strayBy(thing) > SAME_PX);
  expect(
    strays.length === 0,
    `at the opening ${String(strays.length)} things stand off where the lens stands them: ${strays
      .slice(0, 4)
      .map((thing) => `${thing.id} ${strayBy(thing).toFixed(2)} px`)
      .join(', ')}`,
  );
  note(
    `opening identity: ${String(standing.length)} things within ${farthest.toFixed(3)} px of where the lens stands them`,
  );
  // A thing past the brow at the opening is drawn sunk behind it: how
  // much of it shows over the brow is what a child sees of it.
  for (const thing of things.filter(({ behind }) => behind)) {
    const cover = browRow(camera, thing.drawn.x);
    const shows =
      thing.top !== null && thing.height !== null
        ? `, ${(cover - thing.top).toFixed(1)} of its ${thing.height.toFixed(1)} px over the brow at x ${thing.drawn.x.toFixed(0)}, alpha ${thing.alpha.toFixed(2)}`
        : '';
    note(
      `at the opening ${thing.id} stands past the brow, sunk ${(thing.drawn.y - thing.lensed.y).toFixed(1)} px below where the lens stands it${shows}`,
    );
  }

  // A butterfly released facing the clump comes down where it is seen.
  const { insects, waitFor, perched, now } = fliersOn(page, expect);
  await page.tap(controls.releases.butterfly);
  const resting = await waitFor((all, at) =>
    all.find(
      (insect) =>
        (insect.to.kind === 'cap' || insect.to.kind === 'flower') &&
        at >= insect.arrives + LANDING,
    ),
  );
  if (resting === undefined) {
    expect(false, 'a butterfly released facing the clump never perched');
    return;
  }
  await page.step(LANDED_FRAMES);
  const seen = (await insects()).find(({ id }) => id === resting.id);
  expect(
    seen?.inSight === true && (await perched(resting, await now())),
    `a butterfly released facing the clump perched on ${resting.to.kind} out of view`,
  );
  await page.shoot('final-perched');

  // A 180° turn on `→`, the perched one kept on its seat while it rests.
  const half = Math.round((Math.PI / TURN_CRUISE) * FPS);
  await page.key('ArrowRight', 'keyDown');
  const turning = await page.trace(SEAT_SHOT, onSeat(resting.id), OnSeat);
  await page.step(1);
  await page.shoot('final-seat-turning');
  turning.push(
    ...(await page.trace(half - SEAT_SHOT - 1, onSeat(resting.id), OnSeat)),
  );
  await page.key('ArrowRight', 'keyUp');
  turning.push(...(await page.trace(150, onSeat(resting.id), OnSeat)));
  await page.shoot('final-turned');
  const resting0 = turning.find((seat) => seat !== null);
  const kept = turning.filter(
    (seat): seat is NonNullable<typeof seat> =>
      seat !== null &&
      seat.perch === resting0?.perch &&
      seat.clock < seat.leaves,
  );
  const drift = kept.map(({ local, matrix: [a, b, c, d] }) => {
    const [dx, dy] = [
      local.x - (resting0?.local.x ?? 0),
      local.y - (resting0?.local.y ?? 0),
    ];
    return Math.hypot(a * dx + c * dy, b * dx + d * dy);
  });
  const most = Math.max(0, ...drift);
  const sampled = kept
    .map(({ heading }, index) => ({ heading, drift: drift[index] ?? 0 }))
    .filter((_, index) => index % 20 === 0);
  expect(
    kept.length > 0,
    `the butterfly perched on ${resting.to.kind} was never drawn on it through the turn`,
  );
  expect(
    most <= ON_SEAT,
    `a perched butterfly drifted ${most.toFixed(2)} px off its seat as the eye turned (${sampled.map(({ heading, drift: off }) => `${off.toFixed(1)} px at ${heading.toFixed(2)} rad`).join(', ')})`,
  );
  const last = turning.findLast((seat) => seat !== null);
  note(
    `insect: perched on ${resting0?.perch ?? '?'}, held its seat within ${most.toFixed(2)} px over ${String(kept.length)} frames of the turn${last ? `, last drawn at heading ${last.heading.toFixed(2)}` : ''}`,
  );
}
