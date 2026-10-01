/**
 * The pan, `play-mushrooms.ts`'s run on a fresh meadow: `←` and `→` held,
 * turning the crop smoothly, to either end of the world (`play-pan-keys.ts`); a drag
 * from bare ground moving the crop under the finger and gliding on, tapping
 * nothing; a drag past the world's end sliding the finger over a mushroom or
 * a flower, tapping nothing; a press that moves less than the slop still
 * selecting the mushroom it landed on; and the screen turned, the ground
 * standing where it was and the crop re-centred on the ground point at the
 * screen's middle.
 */

import { z } from 'zod';

import {
  clampLeft,
  type Direction,
  SLOP,
} from '../../src/pages/mushrooms/model/pan.ts';
import {
  type Controls,
  Crop,
  type Expect,
  type Page,
  Point,
  State,
} from './mushroom-probe.ts';
import { type CropOf, playKeys, SAME, walkTo } from './play-pan-keys.ts';

/** Frames enough for a glide to come to rest (`GLIDE_TAU` × `GLIDE_SPANS` in `pan.ts`, about 2 s). */
const GLIDE_FRAMES = 150;
/** A drag's travel across, as a share of the screen's width, and how many frames it takes. */
const DRAG_ACROSS = 0.3;
const DRAG_FRAMES = 12;
/** The most of the crop's room toward the world's end that a drag takes, the rest left to its glide. */
const ROOM_DRAGGED = 0.6;
/** How far a press that still taps moves, in CSS px: well inside the slop. */
const NUDGE = SLOP * 0.6;

/**
 * Everything a tap anywhere in the meadow leaves behind: the selection, the
 * pickers, a planting begun, and when each flower, insect and mouse was last
 * tapped. A drag that taps nothing leaves it as it was.
 */
const TAPS = `(() => {
  const scene = __probe.scene;
  const { meadow } = scene;
  const stamp = (at) => (Number.isFinite(at) ? at : null);
  return JSON.stringify({
    selected: meadow.selected ?? null,
    picking: meadow.picking,
    furnishing: meadow.furnishing,
    planting: meadow.planting !== undefined,
    flowers: [...scene.flowers.shown].map(([id, { tappedAt }]) => [id, stamp(tappedAt)]),
    insects: [...scene.insects.shown].map(([id, { tappedAt }]) => [id, stamp(tappedAt)]),
    mice: [...scene.bed.shown].map(([id, { house }]) => [id, stamp(house.mouse.tappedAt)]),
  });
})()`;

/** Whether a press at \`point\` on screen lands on bare ground: nothing drawn over it and no tuft under it. */
const BARE = `(point) =>
  __probe.topAt(point) === null && !__probe.scene.grass?.at(__probe.toWorld(point))`;

/** A bare point on screen low in the meadow and near the middle, where a drag can start; \`null\` where none is. */
const BARE_START = `(() => {
  const bare = ${BARE};
  const { width, height } = __probe.scene.layout;
  for (let row = 0; row <= 8; row++) {
    for (let column = 0; column <= 8; column++) {
      const point = {
        x: width * (0.3 + (0.4 * ((column * 5) % 9)) / 8),
        y: height * (0.6 + (0.3 * row) / 8),
      };
      if (bare(point)) return point;
    }
  }
  return null;
})()`;

/**
 * Of the mushrooms whose cap a tap reaches, then the flowers whose head one
 * does, the first with bare ground on its row on the side \`side\` points
 * to: where a drag starts that crosses it, and the middle it crosses.
 */
const crossing = (side: Direction) => `(() => {
  const bare = ${BARE};
  const { width } = __probe.scene.layout;
  const caps = __probe.state().mushrooms.map((id) => [id, __probe.mushroom(id)]);
  const heads = [...__probe.scene.flowers.shown]
    .filter(([, { container }]) => container.visible)
    .map(([id, { head }]) => {
      const at = head.getWorldTransformMatrix();
      return [id, __probe.toScreen({ x: at.tx, y: at.ty })];
    })
    .filter(([, at]) => at.x > 0 && at.x < width && __probe.topAt(at) !== null);
  for (const [id, over] of [...caps, ...heads]) {
    if (!over) continue;
    for (let off = 12; off <= 240; off += 12) {
      const from = { x: over.x + ${String(side)} * off, y: over.y };
      if (from.x > 0 && from.x < width && bare(from)) return { id, from, over };
    }
  }
  return null;
})()`;
const Crossing = z
  .object({ id: z.string(), from: Point, over: Point })
  .nullable();

/** Each mushroom's across in ground units from the world's midline, as drawn: what a turn must leave as it is. */
const GROUND = `(() => {
  const { world, unit } = __probe.crop();
  return Object.fromEntries(
    [...__probe.scene.bed.shown].map(([id, { graphics }]) => [id, (graphics.x - world / 2) / unit]),
  );
})()`;
const Ground = z.record(z.string(), z.number());

export async function playPan(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const crop = async () => page.evaluate('__probe.crop()', Crop);
  const taps = async () => page.evaluate(TAPS, z.string());
  const opening = await crop();

  await playKeys(page, crop, expect, note);
  await page.shoot('pan-right-end');
  // A finger moving left carries the crop rightward, so at the right end it
  // starts right of a cap and slides over it; at the left end, the mirror.
  const ends = { crop, taps, expect, note };
  await dragOverEnd(page, await page.evaluate(crossing(1), Crossing), 1, ends);
  await walkTo(page, crop, 'ArrowLeft', expect);
  await page.shoot('pan-left-end');
  await dragOverEnd(
    page,
    await page.evaluate(crossing(-1), Crossing),
    -1,
    ends,
  );
  await walkTo(page, crop, 'ArrowRight', expect, opening.left);

  const start = await page.evaluate(BARE_START, Point.nullable());
  if (start === null) {
    expect(false, 'no bare ground on the screen to start a drag from');
  } else {
    const before = await taps();
    const from = await crop();
    // A finger moving left carries the crop right: toward the roomier side,
    // leaving it room to glide on, which a phone held sideways has little of.
    const most = from.world - from.width;
    const toward = from.left < most / 2 ? 1 : -1;
    const room = toward === 1 ? most - from.left : from.left;
    const travel = Math.min(DRAG_ACROSS * from.width, room * ROOM_DRAGGED);
    await page.drag(
      start,
      { ...start, x: start.x - toward * travel },
      DRAG_FRAMES,
    );
    const lifted = await crop();
    // The crop follows 1:1 past the slop, lagging the finger by it.
    const crossedAt = SLOP;
    const followed = toward * (lifted.left - from.left);
    expect(
      Math.abs(followed - (travel - crossedAt)) < SAME,
      `a drag of ${travel.toFixed(0)} px moved the crop ${followed.toFixed(1)} px, not the ${(travel - crossedAt).toFixed(1)} past the slop`,
    );
    await page.step(GLIDE_FRAMES);
    const glided = await crop();
    expect(
      toward * (glided.left - lifted.left) > 0 &&
        Math.abs(glided.left - clampLeft(glided, glided.left)) < SAME,
      `a drag's release did not glide on inside the world: ${lifted.left.toFixed(1)} → ${glided.left.toFixed(1)}`,
    );
    expect(
      (await taps()) === before,
      'a drag from bare ground tapped something',
    );
    note(
      `a drag of ${travel.toFixed(0)} px moved the crop ${followed.toFixed(1)} px, gliding on to ${(toward * (glided.left - from.left)).toFixed(1)}`,
    );
    await page.shoot('pan-dragged');
  }

  await playNudge(page, crop, expect);
  await playTurn(page, crop, expect, note);
}

/** What a drag at a world's end reads and reports through. */
type EndChecks = {
  crop: CropOf;
  taps: () => Promise<string>;
  expect: Expect;
  note: (line: string) => void;
};

/**
 * At the world's end `toward` points to, a drag from bare ground over a cap
 * or a flower, away from that end: the crop stands, so the finger slides
 * over it past the slop, and nothing is tapped.
 */
async function dragOverEnd(
  page: Page,
  found: z.infer<typeof Crossing>,
  toward: Direction,
  { crop, taps, expect, note }: EndChecks,
): Promise<void> {
  const end = toward === 1 ? 'right' : 'left';
  if (found === null) {
    note(
      `nothing at the world's ${end} end with bare ground beside it to drag over`,
    );
    return;
  }
  const { id, from, over } = found;
  const before = await taps();
  const { left } = await crop();
  // A finger moving away from an end pulls the crop toward it, past it.
  await page.drag(from, { ...over, x: over.x - toward * 40 }, DRAG_FRAMES);
  await page.step(GLIDE_FRAMES);
  expect(
    Math.abs((await crop()).left - left) < SAME,
    `a drag past the world's ${end} end moved the crop`,
  );
  expect(
    (await taps()) === before,
    `a drag over ${id} at the world's ${end} end tapped something`,
  );
}

/** A press on a mushroom's cap that moves less than the slop: it selects the mushroom, and the crop stands. */
async function playNudge(
  page: Page,
  crop: CropOf,
  expect: Expect,
): Promise<void> {
  const { mushrooms } = await page.evaluate('__probe.state()', State);
  const onScreen = await page.evaluate(
    `${JSON.stringify(mushrooms)}.map((id) => [id, __probe.mushroom(id)]).find(([, at]) => at !== null) ?? null`,
    z.tuple([z.string(), Point]).nullable(),
  );
  if (onScreen === null) {
    expect(false, 'no mushroom on screen to nudge');
    return;
  }
  const [id, at] = onScreen;
  const { left } = await crop();
  await page.drag(at, { ...at, x: at.x + NUDGE }, 4);
  await page.step(10);
  expect(
    (await page.evaluate('__probe.state()', State)).selected === id,
    `a press moving ${String(NUDGE)} px did not select ${id}`,
  );
  expect(
    Math.abs((await crop()).left - left) < SAME,
    `a press moving ${String(NUDGE)} px moved the crop`,
  );
}

/**
 * The screen turned: every mushroom stands where it stood on the ground, and
 * the crop keeps the ground point at the screen's middle there, held inside
 * the new world (`recrop`).
 */
async function playTurn(
  page: Page,
  crop: CropOf,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const before = await crop();
  const ground = await page.evaluate(GROUND, Ground);
  await page.turn();
  await page.step(30);
  const after = await crop();
  expect(
    after.width !== before.width,
    `the turn left the screen ${String(before.width)} px across`,
  );
  const centre =
    (before.left + before.width / 2 - before.world / 2) / before.unit;
  const goal = clampLeft(
    after,
    after.world / 2 + centre * after.unit - after.width / 2,
  );
  expect(
    Math.abs(after.left - goal) < SAME,
    `the turn cropped from ${after.left.toFixed(1)}, not ${goal.toFixed(1)}, round the ground at the screen's middle`,
  );
  const turned = await page.evaluate(GROUND, Ground);
  const moved = Object.entries(ground).filter(
    ([id, across]) =>
      turned[id] === undefined || Math.abs((turned[id] ?? 0) - across) > 1e-3,
  );
  expect(
    moved.length === 0 &&
      Object.keys(turned).length === Object.keys(ground).length,
    `the turn moved mushrooms on the ground: ${moved.map(([id]) => id).join(', ')}`,
  );
  note(
    `turned to ${String(after.width)} px across: the crop at ${after.left.toFixed(0)} of ${after.world.toFixed(0)}`,
  );
  await page.shoot('pan-turned');
}
