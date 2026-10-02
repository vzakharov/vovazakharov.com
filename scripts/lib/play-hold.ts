/**
 * The child changing a flower, `play-mushrooms.ts`'s run on a fresh meadow:
 * a tap on a flower opens no picker; a press held on it opens the picker
 * there, ringed, its colours with the cross; the cross pulls the flower up,
 * the picker shutting and a tuft coming back where it stood — a seeded
 * flower's, then one the child planted on a tuft; a press on another
 * flower that turns the eye opens nothing; and, the eye turned and walked
 * in, a press held on the nearest flower drawn opens the picker on it.
 */

import { z } from 'zod';

import {
  type Controls,
  type Expect,
  Flower,
  type Page,
  Point,
  walkAndTurn,
} from './mushroom-probe.ts';
import {
  buttonsOf,
  nearestOpening,
  NEWEST,
  Newest,
  TUFTS,
} from './play-tufts.ts';

/** The flower picker as the page holds it, and what stands of the flower `id`. */
const Held = z.object({
  open: z.boolean(),
  /** The flower it is open on; `null` on a tuft or closed. */
  flower: z.string().nullable(),
  ringed: z.boolean(),
  colours: z.number(),
  cross: Point.nullable(),
  /** Whether the flower `id` is still drawn and is among the pulled. */
  shown: z.boolean(),
  pulled: z.boolean(),
  /** How many of the ground's tufts stand, a flower keeping those round it away. */
  tufts: z.number(),
});

const held = (id: string) => `(() => {
  const { scene } = __probe;
  const { planting, pulled } = scene.meadow;
  const { controls, flowers, grass } = scene;
  const opened = (picker) => picker.buttons.filter(({ face }) => face.input?.enabled);
  const [cross] = opened(controls.crossPicker);
  return {
    open: planting !== undefined,
    flower: planting?.flower ?? null,
    ringed: flowers.ring.graphics.visible,
    colours: opened(controls.colourPicker).length,
    cross: cross ? { x: cross.home.x, y: cross.home.y } : null,
    shown: flowers.shown.get(${JSON.stringify(id)})?.container.visible ?? false,
    pulled: pulled.includes(${JSON.stringify(id)}),
    tufts: grass.tufts.length,
  };
})()`;

/** How many frames a held press lasts: past `LONG_PRESS`'s 0.45 s at 60 frames a second. */
export const HOLD_FRAMES = 36;
/** How far a press that turns the eye drags, in CSS px: well past the slop. */
const TURN = 120;

export async function playHold(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const flower = await page.evaluate('__probe.flower()', Flower);
  if (!flower) {
    expect(false, 'no flower on screen to hold');
    return;
  }
  // A touch point's own `id` is the finger's, so the flower's stays off it.
  const { id, ...head } = flower;
  await page.tap(head);
  await page.step(30);
  expect(
    !(await page.evaluate(held(id), Held)).open,
    'a tap on a flower opened the picker',
  );

  // A seeded flower leaves a tuft where it stood, as a planted one's comes back.
  const seeded = await holdAndPull(page, expect, flower, 'seeded');
  expect(seeded > 0, `no tuft came back where seeded flower ${id} stood`);
  note(`${String(seeded)} tufts came back where seeded flower ${id} stood`);

  // The child's own flower stands on a tuft, which comes back with it pulled.
  const planted = await plantOne(page);
  if (planted) {
    const back = await holdAndPull(page, expect, planted, 'planted');
    expect(
      back > 0,
      `no tuft came back where planted flower ${planted.id} stood`,
    );
  } else {
    note('no tuft took a flower; no planted flower pulled');
  }

  // A press that turns the eye is no long press.
  const other = await page.evaluate('__probe.flower()', Flower);
  if (other) {
    const { id: otherId, ...from } = other;
    await page.drag(from, { ...from, x: from.x + TURN }, HOLD_FRAMES);
    await page.step(30);
    expect(
      !(await page.evaluate(held(otherId), Held)).open,
      'a press that turned the eye opened the picker',
    );
  } else {
    note('no second flower on screen; no turned-press step');
  }

  // Turned and walked in, a press held on the nearest flower's head drawn
  // opens the picker on it.
  note(`hold: ${await walkAndTurn(page)}`);
  const slid = await page.evaluate('__probe.flower()', Flower);
  if (!slid) {
    expect(false, 'no flower on screen to hold after turning and walking');
    return;
  }
  const { id: slidId, ...slidHead } = slid;
  await page.drag(slidHead, slidHead, HOLD_FRAMES);
  await page.step(30);
  const walked = await page.evaluate(held(slidId), Held);
  expect(
    walked.open && walked.flower === slidId,
    `after turning and walking, a held press on flower ${slidId}'s head at (${slidHead.x.toFixed(0)}, ${slidHead.y.toFixed(0)}) did not open the picker on it`,
  );
  await page.shoot('p4-walked-held');
}

/**
 * A press held on `flower` and the cross tapped: the picker opens on it,
 * ringed, with its colours and the cross (frame `p4-<name>-held`), and the
 * cross pulls it up and shuts it (`p4-<name>-pulled`). Returns how many
 * tufts came back.
 */
async function holdAndPull(
  page: Page,
  expect: Expect,
  { id, ...head }: NonNullable<z.infer<typeof Flower>>,
  name: string,
): Promise<number> {
  const read = async () => page.evaluate(held(id), Held);
  // Held in place: the finger moves nowhere, frame after frame.
  await page.drag(head, head, HOLD_FRAMES);
  await page.step(30);
  const open = await read();
  expect(
    open.open && open.flower === id,
    `a held press on flower ${id} did not open the picker on it`,
  );
  expect(open.ringed, `held flower ${id} stands in no ring`);
  expect(open.colours === 5, `${String(open.colours)} colours offered`);
  expect(open.cross !== null, 'the picker on a flower offers no cross');
  await page.shoot(`p4-${name}-held`);

  // Pressed again, even too briefly to hold, the flower keeps its picker open.
  await page.tap(head);
  await page.step(30);
  const again = await read();
  expect(
    again.open && again.flower === id,
    `a second press on flower ${id} shut its picker`,
  );

  if (open.cross) await page.tap(open.cross);
  await page.step(60);
  const pulled = await read();
  expect(!pulled.open, 'the cross left the picker open');
  expect(!pulled.ringed, 'the ring stayed with the picker shut');
  expect(pulled.pulled && !pulled.shown, `flower ${id} was not pulled up`);
  expect(pulled.tufts >= open.tufts, 'tufts went with the pulled flower');
  await page.shoot(`p4-${name}-pulled`);
  return pulled.tufts - open.tufts;
}

/**
 * How many tufts, nearest first, are tried for one that takes a flower: half
 * `play-tufts.ts`'s search, none taking one here being a note, not a failure.
 */
const TRIES = 8;

/** A flower planted on the nearest tuft that takes one, as `play-tufts.ts` plants it, with its head on screen. */
async function plantOne(
  page: Page,
): Promise<NonNullable<z.infer<typeof Flower>> | undefined> {
  const tufts = await page.evaluate(TUFTS, z.array(Point));
  if (!(await nearestOpening(page, tufts, TRIES))) {
    return undefined;
  }
  const [colour] = await page.evaluate(
    buttonsOf('colourPicker'),
    z.array(Point),
  );
  if (colour) await page.tap(colour);
  await page.step(30);
  const [shape] = await page.evaluate(buttonsOf('shapePicker'), z.array(Point));
  if (shape) await page.tap(shape);
  await page.step(80);
  const newest = await page.evaluate(NEWEST, Newest);
  const id = await page.evaluate(
    '__probe.scene.meadow.planted.at(-1)?.id ?? null',
    z.string().nullable(),
  );
  return newest?.shown === true && id !== null
    ? { id, ...newest.head }
    : undefined;
}
