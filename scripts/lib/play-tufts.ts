/**
 * The child planting flowers, `play-mushrooms.ts`'s run on a fresh meadow:
 * the flower picker opened on the farthest tuft and on the nearest, as on
 * every tuft of a meadow not yet full; a colour picked, a shape picked, and
 * that very flower grown on the tuft; the tuft it grew on opening no picker
 * again; and the picker opened on another tuft, then closed,
 * planting nothing, by a second tap on it.
 */

import { z } from 'zod';

import {
  type Controls,
  type Expect,
  type Page,
  Point,
} from './mushroom-probe.ts';

/** The meadow's planting as the page holds it. */
const Planting = z.object({
  open: z.boolean(),
  chosen: z.boolean(),
  /** The seeds the shape stage shows, in shape order; empty before a colour. */
  seeds: z.array(z.number()),
  planted: z.number(),
});
/** The newest planted flower: its seed, whether it stands on a tuft, and where its head shows. */
const Newest = z
  .object({
    seed: z.number(),
    onTuft: z.boolean(),
    shown: z.boolean(),
    head: Point,
  })
  .nullable();

const PLANTING = `(() => {
  const { meadow } = __probe.scene;
  const { planting } = meadow;
  return {
    open: planting !== undefined,
    chosen: planting?.chosen !== undefined,
    seeds: [...(planting?.chosen?.seeds ?? [])],
    planted: meadow.planted.length,
  };
})()`;

/**
 * Every tuft's middle on screen a tap reaches bare — no mushroom, flower,
 * insect or button over it — the farthest first.
 */
const TUFTS = `__probe.scene.grass.tufts
  .filter(({ tuft: { x } }) => __probe.shows(x))
  .map(({ tuft: { x, y, size } }) => __probe.toScreen({ x, y: y - size }))
  .filter((point) => __probe.topAt(point) === null)
  .sort((a, b) => a.y - b.y)`;

const NEWEST = `(() => {
  const sown = __probe.scene.meadow.planted.at(-1);
  if (!sown) return null;
  const shown = __probe.scene.flowers.shown.get(sown.id);
  const at = shown.head.getWorldTransformMatrix();
  return {
    seed: sown.seed,
    onTuft: 'foot' in sown,
    shown: shown.container.visible,
    head: __probe.toScreen({ x: at.tx, y: at.ty }),
  };
})()`;

/** A stage's buttons where they stand. */
const buttonsOf = (picker: 'colourPicker' | 'shapePicker') =>
  `__probe.scene.controls.${picker}.buttons.map(({ home }) => ({ x: home.x, y: home.y }))`;

/** How many tufts are tried for one that takes a flower. */
const TRIES = 16;
/** A close-up's side round the grown flower, in CSS px. */
const CLOSE = 200;

export async function playTufts(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const planting = async () => page.evaluate(PLANTING, Planting);
  const tufts = await page.evaluate(TUFTS, z.array(Point));
  expect(tufts.length > 0, 'no tuft a tap reaches bare');

  // Every tuft of a meadow not yet full takes a flower, the farthest too.
  const [far] = tufts;
  if (far) {
    await page.tap(far);
    await page.step(30);
    expect((await planting()).open, 'the farthest tuft refused a flower');
    await page.shoot('tuft-0-far');
    await page.tap(far);
    await page.step(20);
  }

  // The nearest first, till one opens the picker: the nearest itself.
  const near = tufts.toReversed().slice(0, TRIES);
  const firstOpening = async ([tuft, ...rest]: ReadonlyArray<
    z.infer<typeof Point>
  >): Promise<z.infer<typeof Point> | undefined> => {
    if (!tuft) return undefined;
    await page.tap(tuft);
    await page.step(30);
    return (await planting()).open ? tuft : firstOpening(rest);
  };
  const opened = await firstOpening(near);
  if (!opened) {
    expect(false, `none of ${String(near.length)} tufts opened the picker`);
    return;
  }
  expect(opened === near[0], 'the nearest tuft refused a flower');
  const before = await planting();
  expect(!before.chosen, 'the picker opened past its colours');
  await page.shoot('tuft-1-colours');

  const colours = await page.evaluate(
    buttonsOf('colourPicker'),
    z.array(Point),
  );
  expect(colours.length === 5, `${String(colours.length)} colours offered`);
  const [blue] = colours;
  if (blue) await page.tap(blue);
  await page.step(30);
  const coloured = await planting();
  expect(
    coloured.open && coloured.chosen && coloured.seeds.length === 4,
    'a colour did not open the shapes',
  );
  await page.shoot('tuft-2-shapes');

  const shapes = await page.evaluate(buttonsOf('shapePicker'), z.array(Point));
  expect(shapes.length === 4, `${String(shapes.length)} shapes offered`);
  const pointed = shapes[2];
  if (pointed) await page.tap(pointed);
  // The picked shape flying down to the tuft as the flower comes up.
  await page.step(12);
  await page.shoot('tuft-3-planting');
  await page.step(80);
  const grown = await planting();
  const newest = await page.evaluate(NEWEST, Newest);
  expect(!grown.open, 'a shape left the picker open');
  expect(
    grown.planted === before.planted + 1 &&
      newest !== null &&
      newest.onTuft &&
      newest.seed === coloured.seeds[2],
    'the picked flower was not planted on the tuft',
  );
  expect(newest?.shown === true, 'the planted flower is not shown');
  await page.shoot('tuft-4-grown');
  if (newest) {
    const screen = await page.evaluate(
      '({ width: innerWidth, height: innerHeight })',
      z.object({ width: z.number(), height: z.number() }),
    );
    const clamp = (at: number, span: number) =>
      Math.min(Math.max(0, at - CLOSE / 2), span - CLOSE);
    await page.shoot('tuft-4b-grown-close', {
      x: clamp(newest.head.x, screen.width),
      y: clamp(newest.head.y, screen.height),
      width: CLOSE,
      height: CLOSE,
    });
  }

  // The tuft the flower grew on is gone, the flower standing there alone: a
  // tap there opens no picker.
  const bare = await page.evaluate(
    `__probe.topAt(${JSON.stringify(opened)}) === null`,
    z.boolean(),
  );
  if (bare) {
    await page.tap(opened);
    await page.step(6);
    expect(!(await planting()).open, 'a planted tuft opened the picker again');
    await page.shoot('tuft-5-planted');
    await page.step(30);
  } else {
    note('the grown flower covers its tuft; no second tap there');
  }

  // A second tap on a tuft with the picker open closes it, planting nothing.
  const other = await firstOpening(near.filter((tuft) => tuft !== opened));
  if (!other) {
    note('no other tuft took a flower; no close-without-planting step');
    return;
  }
  await page.tap(other);
  await page.step(30);
  const closed = await planting();
  expect(
    !closed.open && closed.planted === grown.planted,
    'a tap outside the open picker did not close it without planting',
  );
}
