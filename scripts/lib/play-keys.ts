/**
 * The child planting from the keyboard, `play-mushrooms.ts`'s run on a fresh
 * meadow: with the picker shut, a melody of notes no flower in view makes
 * grows a flower of each on the tufts in view, a note struck twice in one
 * frame once, and a note struck again plays the flower grown; with the
 * flower picker open on a tuft, still on its colours, a note key plants the
 * flower that makes its sound there and shuts the picker; with it open on
 * that flower, a press held, and a colour picked, another note key replaces
 * it with the flower of its own sound, the one it stood for pulled;
 * and, the eye turned and walked in, a tap on the nearest flower's head
 * drawn sounds it.
 */

import { z } from 'zod';

import { flowerGenes } from '../../src/pages/mushrooms/model/flower-genes.ts';
import {
  type FlowerSound,
  sameSound,
  soundOf,
} from '../../src/pages/mushrooms/model/flower-sounds.ts';
import {
  type Controls,
  type Expect,
  Flower,
  inTurn,
  type Letter,
  type Page,
  Point,
  walkAndTurn,
} from './mushroom-probe.ts';
import { HOLD_FRAMES } from './play-hold.ts';
import {
  buttonsOf,
  nearestOpening,
  NEWEST,
  Newest,
  TUFTS,
} from './play-tufts.ts';

/** The flower picker and the newest planting, as the page holds them. */
const Keyed = z.object({
  open: z.boolean(),
  flower: z.string().nullable(),
  /** The seeds the shape row shows; empty before a colour. */
  seeds: z.array(z.number()),
  planted: z.number(),
  pulled: z.array(z.string()),
  newest: z.object({ id: z.string(), seed: z.number() }).nullable(),
});

const KEYED = `(() => {
  const { planting, planted, pulled } = __probe.scene.meadow;
  const newest = planted.at(-1);
  return {
    open: planting !== undefined,
    flower: planting?.flower ?? null,
    seeds: [...(planting?.chosen?.seeds ?? [])],
    planted: planted.length,
    pulled: [...pulled],
    newest: newest ? { id: newest.id, seed: newest.seed } : null,
  };
})()`;

/** The note keys and the sounds `keyboard.ts` gives them. */
const NOTES = {
  KeyL: { kind: 'note', pitchClass: 7 },
  KeyH: { kind: 'note', pitchClass: 2 },
  KeyK: { kind: 'note', pitchClass: 5 },
  KeyO: { kind: 'note', pitchClass: 6 },
  KeyP: { kind: 'note', pitchClass: 8 },
  KeyY: { kind: 'note', pitchClass: 1 },
} as const satisfies Record<Letter, FlowerSound>;

/** A melody of the notes the visit's seeded flowers never make, so none is in view. */
const MELODY = ['KeyK', 'KeyO', 'KeyP', 'KeyY'] as const satisfies Letter[];

/** The child's own plantings, a bee's left out, and whether each is drawn. */
const SOWN = `__probe.scene.meadow.planted
  .filter((each) => !('parent' in each))
  .map((each) => ({
    id: each.id,
    seed: each.seed,
    onTuft: 'foot' in each,
    shown: __probe.scene.flowers.shown.get(each.id)?.container.visible ?? false,
  }))`;
const Sown = z.array(
  z.object({
    id: z.string(),
    seed: z.number(),
    onTuft: z.boolean(),
    shown: z.boolean(),
  }),
);
/** Frames between a melody's notes: a quick tune. */
const BEAT = 4;

/** Frames from a key into its planting, the flower coming up. */
const RISING = 12;
/** Frames enough for a planting to settle. */
const SETTLE = 80;

/** Whether the flower grown from `seed` makes the sound `key` plays. */
const sounds = (seed: number | undefined, key: Letter) =>
  seed !== undefined && sameSound(soundOf(flowerGenes({ seed })), NOTES[key]);

/** A key struck: down and up, with no frame between. */
async function press(page: Page, key: Letter): Promise<void> {
  await page.key(key, 'keyDown');
  await page.key(key, 'keyUp');
}

/**
 * With the picker shut, `MELODY` played on the opening view, its first note
 * struck twice in one frame: one flower grows on a tuft for each note, each
 * sounding its note, and the first note struck again plays it, growing none.
 */
async function playMelody(
  page: Page,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const before = await page.evaluate(SOWN, Sown);
  await page.shoot('keys-melody-before');
  const [first] = MELODY;
  await press(page, first);
  await inTurn(MELODY, async (key) => {
    await press(page, key);
    await page.step(BEAT);
  });
  await page.step(SETTLE);
  const grown = (await page.evaluate(SOWN, Sown)).slice(before.length);
  await page.shoot('keys-melody-meadow');
  expect(
    grown.length === MELODY.length,
    `a melody of ${String(MELODY.length)} notes none in view makes grew ${String(grown.length)} flowers`,
  );
  for (const [index, key] of MELODY.entries()) {
    const flower = grown[index];
    expect(
      flower !== undefined && sounds(flower.seed, key),
      `the flower grown for note ${String(index + 1)} does not sound it (seed ${String(flower?.seed)})`,
    );
  }
  expect(
    grown.every(({ onTuft, shown }) => onTuft && shown),
    'a flower a melody grew is not on a tuft, or not shown',
  );
  await press(page, first);
  await page.step(SETTLE);
  const again = await page.evaluate(SOWN, Sown);
  expect(
    again.length === before.length + grown.length,
    'a note struck again over the flower it grew grew another',
  );
  note(
    `a melody of ${String(MELODY.length)} notes grew ${grown.map(({ id }) => id).join(', ')}; struck again, its first grew ${String(again.length - before.length - grown.length)}`,
  );
}

export async function playKeys(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const read = async () => page.evaluate(KEYED, Keyed);
  await playMelody(page, expect, note);

  // Open on a tuft, at its colours: `l` plants G there.
  const tufts = await page.evaluate(TUFTS, z.array(Point));
  if (!(await nearestOpening(page, tufts))) {
    expect(false, 'no tuft opened the picker for a key to plant through');
    return;
  }
  const before = await read();
  await page.shoot('keys-tuft-open');
  await press(page, 'KeyL');
  await page.step(RISING);
  await page.shoot('keys-tuft-planting');
  await page.step(SETTLE);
  const sown = await read();
  const newest = await page.evaluate(NEWEST, Newest);
  expect(!sown.open, 'a note key left the picker on a tuft open');
  expect(
    sown.planted === before.planted + 1 && newest?.onTuft === true,
    'a note key with the picker open on a tuft planted nothing there',
  );
  expect(
    sounds(sown.newest?.seed, 'KeyL'),
    `the flower \`l\` planted does not sound G (seed ${String(sown.newest?.seed)})`,
  );
  expect(newest?.shown === true, 'the flower a key planted is not shown');
  await page.shoot('keys-tuft-grown');
  if (!newest || !sown.newest) return;

  // Held open on that flower, a colour picked: `h` replaces it with D.
  const replaced = sown.newest.id;
  await page.drag(newest.head, newest.head, HOLD_FRAMES);
  await page.step(30);
  const held = await read();
  expect(
    held.open && held.flower === replaced,
    `a held press on flower ${replaced} did not open the picker on it`,
  );
  const [colour] = await page.evaluate(
    buttonsOf('colourPicker'),
    z.array(Point),
  );
  if (colour) await page.tap(colour);
  await page.step(30);
  const coloured = await read();
  await page.shoot('keys-flower-shapes');
  await press(page, 'KeyH');
  await page.step(RISING);
  await page.shoot('keys-flower-planting');
  await page.step(SETTLE);
  const after = await read();
  expect(!after.open, 'a note key left the picker on a flower open');
  expect(
    after.planted === held.planted + 1 && after.pulled.includes(replaced),
    `a note key did not replace flower ${replaced}`,
  );
  expect(
    sounds(after.newest?.seed, 'KeyH'),
    `the flower \`h\` planted over ${replaced} does not sound D (seed ${String(after.newest?.seed)})`,
  );
  await page.shoot('keys-flower-replaced');
  // The first colour is blue, D's own, so the key plants what its shape row showed.
  const shown = coloured.seeds.includes(after.newest?.seed ?? Number.NaN);
  note(
    `\`l\` planted ${sown.newest.id} on a tuft; \`h\` replaced it with ${String(after.newest?.id)}, ${shown ? 'one the shape row showed' : 'not one the shape row showed (another colour was picked)'}`,
  );

  // Turned and walked in, a tap on the nearest flower's head drawn sounds it.
  note(`keys: ${await walkAndTurn(page)}`);
  const flower = await page.evaluate('__probe.flower()', Flower);
  if (!flower) {
    expect(false, 'no flower on screen to tap after turning and walking');
    return;
  }
  const { id, ...head } = flower;
  await page.tap(head);
  await page.step(20);
  const [clock, tappedAt] = await page.evaluate(
    `[__probe.scene.clock, __probe.flowerTappedAt(${JSON.stringify(id)})]`,
    z.tuple([z.number(), z.number().nullable()]),
  );
  expect(
    tappedAt !== null && clock - tappedAt < 1,
    `after turning and walking, a tap on flower ${id}'s head at (${head.x.toFixed(0)}, ${head.y.toFixed(0)}) did not sound it`,
  );
  await page.shoot('keys-walked-tap');
}
