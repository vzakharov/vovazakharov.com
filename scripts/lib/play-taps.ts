/**
 * A drag that must tap nothing: what every tap leaves behind, bare ground to
 * press on, and the two drags from a held state — a mushroom selected, the
 * flower picker open on a tuft — that may shut the picker or drop the
 * selection, as any touch outside them does, but grow, plant and select
 * nothing.
 */

import { z } from 'zod';

import {
  type Controls,
  type Expect,
  grow,
  type Page,
  Point,
} from './mushroom-probe.ts';
import { nearestOpening, TUFTS } from './play-tufts.ts';

/**
 * Everything a tap anywhere in the meadow leaves behind: the selection, the
 * pickers, a planting begun, and when each flower, insect and mouse was last
 * tapped. A drag that taps nothing leaves it as it was.
 */
export const TAPS = `(() => {
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

/** Whether a press at `point` on screen lands on bare ground: nothing drawn over it and no tuft under it. */
const BARE = `(point) =>
  __probe.topAt(point) === null && !__probe.scene.grass?.at(__probe.toWorld(point))`;

/**
 * A bare point on screen low in the meadow and near the middle, where a drag
 * can start; `null` where none is. Never above the ground's top row, where a
 * sideways drag strafes rather than turns (`lockOf`).
 */
export const BARE_START = `(() => {
  const bare = ${BARE};
  const { width, height, camera } = __probe.scene.layout;
  const top = Math.max(0.6 * height, camera.groundTop + 1);
  for (let row = 0; row <= 8; row++) {
    for (let column = 0; column <= 8; column++) {
      const point = {
        x: width * (0.3 + (0.4 * ((column * 5) % 9)) / 8),
        y: top + ((0.9 * height - top) * row) / 8,
      };
      if (bare(point)) return point;
    }
  }
  return null;
})()`;

/** What a drag may not change: how many mushrooms and plantings stand, and which mushroom is selected. */
const GROWN = `(() => {
  const { meadow } = __probe.scene;
  return {
    mushrooms: meadow.mushrooms.length,
    planted: meadow.planted.length,
    selected: meadow.selected ?? null,
    planting: meadow.planting !== undefined,
  };
})()`;
const Grown = z.object({
  mushrooms: z.number(),
  planted: z.number(),
  selected: z.string().nullable(),
  planting: z.boolean(),
});

/** Frames a drag's glide takes to come to rest. */
const SETTLE_FRAMES = 150;

/**
 * Two drags from bare ground, one with a mushroom selected and one
 * with the flower picker open on a tuft — the game never holds both — each
 * growing, planting and selecting nothing.
 */
export async function playHeldDrags(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const grown = async () => page.evaluate(GROWN, Grown);
  /**
   * A drag from bare ground `by` the screen's width and height, `held` the
   * state it starts from.
   */
  const dragFrom = async (held: string, by: z.infer<typeof Point>) => {
    const start = await page.evaluate(BARE_START, Point.nullable());
    if (start === null) {
      note(`no bare ground to drag from with ${held}: that drag is not played`);
      return;
    }
    const before = await grown();
    const { width, height } = await page.evaluate(
      '__probe.eye()',
      z.object({ width: z.number(), height: z.number() }),
    );
    const to = { x: start.x + by.x * width, y: start.y + by.y * height };
    await page.drag(start, to, 12);
    await page.step(SETTLE_FRAMES);
    const after = await grown();
    expect(
      after.mushrooms === before.mushrooms && after.planted === before.planted,
      `a drag with ${held} grew or planted something: ${String(before.mushrooms)} mushrooms and ${String(before.planted)} plantings before, ${String(after.mushrooms)} and ${String(after.planted)} after`,
    );
    expect(
      after.selected === null || after.selected === before.selected,
      `a drag with ${held} selected mushroom ${String(after.selected)}`,
    );
    note(
      `a drag with ${held}: ${before.planting && !after.planting ? 'the picker shut' : after.planting ? 'the picker stayed open' : 'no picker'}, ${before.selected !== null && after.selected === null ? 'the selection dropped' : `selected ${String(after.selected)}`}`,
    );
  };

  // A mushroom selected: one grown from `+`, which selects it — where the
  // view leaves it room, which a view crowded with flowers may not, so it
  // comes first. Its drag walks a little in, keeping the tufts in view.
  await grow(page, controls, controls.picker[0]);
  const { selected } = await grown();
  if (selected === null) {
    expect(false, 'a mushroom grown from `+` is not selected');
  } else {
    await dragFrom(`mushroom ${selected} selected`, { x: 0, y: 0.08 });
  }

  // The flower picker open on a tuft: the nearest that opens it.
  const tufts = await page.evaluate(TUFTS, z.array(Point));
  if (await nearestOpening(page, tufts)) {
    await dragFrom('the flower picker open on a tuft', { x: -0.15, y: 0 });
  } else {
    expect(
      false,
      `none of ${String(tufts.length)} tufts a tap reaches opened the picker, to drag with it open`,
    );
  }
}
