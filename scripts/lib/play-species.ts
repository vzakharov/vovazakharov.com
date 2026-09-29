/**
 * The species' part of `play-mushrooms.ts`'s run, on a fresh meadow: each of
 * the four grown from its picker button, looked at close, tapped and
 * wobbling; the meadow full of them, each taken by a tap of its own; a
 * butterfly come down on one; and a house on a porcini and on a
 * chanterelle, windows and door, looked at close.
 */

import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import {
  MUSHROOM_SPECIES,
  type Species,
} from '../../src/pages/mushrooms/model/mushroom-genes.ts';
import {
  Box,
  type Controls,
  type Expect,
  inTurn,
  type Page,
  Point,
  State,
} from './mushroom-probe.ts';
import { bandGaps } from './play-band.ts';
import { fliersOn } from './play-insects.ts';

/** How much room a close-up leaves round its mushroom, in the mushroom's own height, and its least side, in CSS px. */
const MARGIN = 0.25;
const LEAST_SIDE = 180;
/** Frames for a grown mushroom to settle. */
const SETTLE = 90;
/**
 * A puff of spores is a tween, and Phaser's tweens run on the wall clock, at
 * most `TWEEN_STEP_MS` a frame however far the stepped clock moves: so a shot
 * that wants the last puff gone draws `SPORES_GONE` frames that far apart,
 * over the 0.9 s a puff lasts.
 */
const TWEEN_STEP_MS = 34;
const SPORES_GONE = 36;
/** The house picker's buttons, windows first and the door last. */
const PIECES = 5;

export async function playSpecies(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const state = async () => page.evaluate('__probe.state()', State);
  const sporesGone = async () =>
    inTurn([...Array.from({ length: SPORES_GONE }).keys()], async () => {
      await sleep(TWEEN_STEP_MS);
      await page.step(1);
    });
  const screen = await page.evaluate(
    '({ width: innerWidth, height: innerHeight })',
    z.object({ width: z.number(), height: z.number() }),
  );
  /** A close-up of mushroom `id`, kept square and on screen. */
  const close = async (id: string, step: string) => {
    const box = await page.evaluate(
      `__probe.bounds(${JSON.stringify(id)})`,
      Box,
    );
    const side = Math.min(
      Math.max(LEAST_SIDE, Math.max(box.width, box.height) * (1 + MARGIN * 2)),
      screen.width,
      screen.height,
    );
    const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
    const clamp = (at: number, span: number) =>
      Math.min(Math.max(0, at - side / 2), span - side);
    await page.shoot(step, {
      x: clamp(cx, screen.width),
      y: clamp(cy, screen.height),
      width: side,
      height: side,
    });
  };
  // Through a butterfly resting on it, if that is where the cap shows: by
  // the house step a butterfly may cover the chanterelle's whole trumpet.
  const tapMushroom = async (id: string) => {
    const at = await page.evaluate(
      `__probe.mushroom(${JSON.stringify(id)}, true)`,
      Point.nullable(),
    );
    if (at === null) expect(false, `no tap reaches ${id}'s cap`);
    else await page.tap(at);
    return at !== null;
  };

  const grown = new Map<Species, string>();
  await inTurn([...MUSHROOM_SPECIES.entries()], async ([index, species]) => {
    await page.tap(controls.plus);
    await page.step(30);
    if (index === 0) await page.shoot('s0-picker');
    const before = (await state()).mushrooms.length;
    const button = controls.picker[index];
    if (button) await page.tap(button);
    await page.step(SETTLE);
    const now = await state();
    const id = now.mushrooms.at(-1);
    expect(
      now.mushrooms.length === before + 1 && now.species.at(-1) === species,
      `the ${species} button grew ${String(now.species.at(-1))}`,
    );
    if (id === undefined) return;
    grown.set(species, id);
    expect(now.selected === id, `the grown ${species} is not selected`);
    await sporesGone();
    await close(id, `s1-${species}-selected`);
    const band = await bandGaps(page, id);
    const [gap] = band.gaps;
    expect(
      gap === undefined,
      `the ${species}'s band leaves ${String(band.gaps.length)} gaps, the first on its ${String(gap?.outline)} at point ${String(gap?.index)}`,
    );
    note(
      `the ${species}'s band: ${band.outlines.map(({ outline, sampled, first }) => `${outline} ${String(sampled)} samples${first ? ', its first point one' : ''}`).join('; ')}`,
    );
    // A tap on the selected one wobbles it and keeps it selected; the shot
    // waits out the tap's puff, which the stepped clock would freeze.
    if (await tapMushroom(id)) {
      await sporesGone();
      await close(id, `s1-${species}-wobble`);
      expect(
        (await state()).selected === id,
        `a tap on the ${species} lost its selection`,
      );
    }
  });

  // Every mushroom of the grown forest, the opening clump's two too, taken
  // by a tap of its own.
  const forest = await state();
  await inTurn(forest.mushrooms, async (id) => {
    if (!(await tapMushroom(id))) return;
    await page.step(6);
    expect(
      (await state()).selected === id,
      `a tap on ${id} in the grown forest did not select it`,
    );
  });
  note(`tapped each of the grown forest's ${String(forest.mushrooms.length)}`);

  // The whole meadow, nothing selected, every species standing.
  const bare = await Promise.all(
    [0.3, 0.5, 0.7].flatMap((x) =>
      [0.2, 0.35, 0.5].map(async (y) => {
        const at = { x: screen.width * x, y: screen.height * y };
        const top = await page.evaluate(
          `__probe.topAt(${JSON.stringify(at)})`,
          z.string().nullable(),
        );
        return top === null ? [at] : [];
      }),
    ),
  );
  const [meadow] = bare.flat();
  if (meadow) await page.tap(meadow);
  await page.step(30);
  expect(
    (await state()).selected === null,
    'a tap on the bare meadow kept a selection',
  );
  const full = await state();
  expect(
    MUSHROOM_SPECIES.every((species) => full.species.includes(species)),
    `the meadow stands ${full.species.join(', ')}`,
  );
  await sporesGone();
  await page.shoot('s2-meadow');

  // A butterfly come down on a cap, whichever species it chose.
  const { waitForCapRest } = fliersOn(page, expect);
  await inTurn([0, 1, 2], async () => {
    await page.tap(controls.releases.butterfly);
    await page.step(20);
  });
  const resting = await waitForCapRest();
  if (resting?.to.kind === 'cap') {
    const at = full.mushrooms.indexOf(resting.to.id);
    const species = full.species[at] ?? 'unknown';
    note(`a butterfly rests on a ${species}`);
    await close(resting.to.id, `s3-butterfly-on-${species}`);
  } else {
    expect(false, 'no butterfly came down on a cap');
  }
  // The trumpet's lip is a perch too: wait on, releasing more, for one there.
  const chanterelle = grown.get('chanterelle');
  const onTrumpet = resting?.to.kind === 'cap' && resting.to.id === chanterelle;
  if (chanterelle !== undefined && !onTrumpet) {
    await page.tap(controls.releases.butterfly);
    const there = await waitForCapRest(chanterelle);
    if (there === undefined)
      expect(false, 'no butterfly came down on the chanterelle');
    else await close(chanterelle, 's3-butterfly-on-chanterelle');
  }

  // A house on the porcini and on the chanterelle: every window it has
  // room for, then the door.
  await inTurn(['porcini', 'chanterelle'] as const, async (species) => {
    const id = grown.get(species);
    if (id === undefined) return;
    if (!(await tapMushroom(id))) return;
    await page.step(6);
    if (!(await state()).furnishing) {
      await page.tap(controls.house);
      await page.step(24);
    }
    expect((await state()).selected === id, `the ${species} is not selected`);
    await inTurn([...Array.from({ length: PIECES }).keys()], async (piece) => {
      const button = controls.housePicker[piece];
      if (button) await page.tap(button);
      await page.step(6);
    });
    await page.step(45);
    await sporesGone();
    const house = (await state()).houses[full.mushrooms.indexOf(id)];
    expect(house?.door === true, `the ${species} took no door`);
    const windows = house?.windows.length ?? 0;
    expect(windows >= 1, `the ${species} took no window`);
    note(`the ${species} took ${String(windows)} windows`);
    await close(id, `s4-house-${species}`);
  });
}
