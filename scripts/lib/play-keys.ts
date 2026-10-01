/**
 * The child planting from the keyboard, `play-mushrooms.ts`'s run on a fresh
 * meadow: with the flower picker open on a tuft, still on its colours, a note
 * key plants the flower that makes its sound there and shuts the picker; with
 * it open on that flower, a press held, and a colour picked, another note key
 * replaces it with the flower of its own sound, the one it stood for pulled.
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
  type Letter,
  type Page,
  Point,
} from './mushroom-probe.ts';
import { buttonsOf, NEWEST, Newest, TUFTS } from './play-tufts.ts';

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

/** The two note keys and the sounds `keyboard.ts` gives them. */
const NOTES = {
  KeyL: { kind: 'note', pitchClass: 7 },
  KeyH: { kind: 'note', pitchClass: 2 },
} as const satisfies Record<Letter, FlowerSound>;

/** How many tufts, nearest first, are tried for one that takes a flower. */
const TRIES = 16;
/** How many frames a held press lasts: past `LONG_PRESS`'s 0.45 s. */
const HOLD_FRAMES = 36;
/** Frames from a key into its planting, the flower coming up. */
const RISING = 12;
/** Frames enough for a planting to settle. */
const SETTLE = 80;

/** Whether the flower grown from `seed` makes the sound `key` plays. */
const sounds = (seed: number | undefined, key: Letter) =>
  seed !== undefined && sameSound(soundOf(flowerGenes({ seed })), NOTES[key]);

export async function playKeys(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const read = async () => page.evaluate(KEYED, Keyed);
  const press = async (key: Letter) => {
    await page.key(key, 'keyDown');
    await page.key(key, 'keyUp');
  };

  // Open on a tuft, at its colours: `l` plants G there.
  const tufts = await page.evaluate(TUFTS, z.array(Point));
  const opening = async ([tuft, ...rest]: ReadonlyArray<
    z.infer<typeof Point>
  >): Promise<boolean> => {
    if (!tuft) return false;
    await page.tap(tuft);
    await page.step(30);
    return (await read()).open || opening(rest);
  };
  if (!(await opening(tufts.toReversed().slice(0, TRIES)))) {
    expect(false, 'no tuft opened the picker for a key to plant through');
    return;
  }
  const before = await read();
  await page.shoot('keys-tuft-open');
  await press('KeyL');
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
  await press('KeyH');
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
}
