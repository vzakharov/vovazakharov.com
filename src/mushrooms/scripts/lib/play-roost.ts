/**
 * A butterfly through the dusk play: released by day, then at dusk seen
 * settled on a cap with its wings folded, and still there once its stay is
 * long over. Fails where it never reaches a cap at dusk, or takes off from
 * one of its own accord.
 */

import { z } from 'zod';

import {
  type Controls,
  Insects,
  ShownInsect,
  State,
} from './mushroom-probe-answers.ts';
import { type Expect, FRAME_MS, type Page } from './mushroom-probe-drive.ts';

/** Frames a released butterfly is left to fly in before the sun's tap. */
const FLY_IN = 240;
/** Frames between looks while waiting for it to sit on a cap. */
const LOOK_EVERY = 30;
/** Frames it may take at dusk to reach a cap: a drink cut short and a flight. */
const TO_CAP = 900;
/** How long it sits before it is shot, its wings shut, in ms. */
const SAT = 1500;
/** How long past its stay it is looked at again, in ms. */
const PAST_STAY = 1000;
/** The widest its fore wings may be drawn at, as a share of open, and still count as folded: `insect-look.ts`'s `FOLDED` and a little. */
const SHUT = 0.15;
/** Margin round the butterfly's drawn span in its close frame, as a share of it. */
const MARGIN = 1.6;

type Insect = z.infer<typeof Insects>[number];

/** Releases a butterfly and lets it fly in; its id, or `undefined` where none came. */
export async function releaseButterfly(
  page: Page,
  controls: z.infer<typeof Controls>,
): Promise<string | undefined> {
  await page.tap(controls.releases.butterfly);
  await page.step(FLY_IN);
  const insects = await page.evaluate('__probe.insects()', Insects);
  return insects.findLast(({ kind }) => kind === 'butterfly')?.id;
}

/** Waits at dusk for butterfly `id` to sit on a cap, shoots it there whole and close, and checks it stays. */
export async function shootRoosting(
  page: Page,
  id: string,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const now = async () =>
    (await page.evaluate('__probe.state()', State)).clock * 1000;
  const flier = async () =>
    (await page.evaluate('__probe.insects()', Insects)).find(
      (each) => each.id === id,
    );
  const sitting = async (looked: number): Promise<Insect | undefined> => {
    const each = await flier();
    if (each?.to.kind === 'cap' && (await now()) >= each.arrives + SAT)
      return each;
    if (looked >= TO_CAP) return undefined;
    await page.step(LOOK_EVERY);
    return sitting(looked + LOOK_EVERY);
  };
  const settled = await sitting(0);
  if (!settled) {
    expect(false, `at dusk the butterfly never sat on a cap (${id})`);
    return;
  }
  note(
    `at dusk the butterfly sat on ${settled.to.kind} ${JSON.stringify(settled.to)}`,
  );
  await page.shoot('dusk-butterfly');
  const fore = await page.evaluate(
    `__probe.scene.insects.shown.get(${JSON.stringify(id)})?.look.fore.scaleX ?? null`,
    z.number().nullable(),
  );
  note(`at dusk its fore wings drawn at ${String(fore)} of open`);
  expect(
    fore !== null && fore <= SHUT,
    `at dusk the butterfly sat with its wings open (${String(fore)})`,
  );
  const shown = await page.evaluate(
    `__probe.insect(${JSON.stringify(id)})`,
    ShownInsect,
  );
  if (shown) {
    const half = Math.max(shown.span, 24) * MARGIN;
    await page.shoot('dusk-butterfly-close', {
      x: Math.max(0, shown.x - half),
      y: Math.max(0, shown.y - half),
      width: half * 2,
      height: half * 2,
    });
  }
  const until = Math.max(settled.leaves, await now()) + PAST_STAY;
  await page.step(Math.ceil((until - (await now())) / FRAME_MS));
  const after = await flier();
  expect(
    after?.legs === settled.legs,
    `at dusk the butterfly left its cap of its own accord (${id})`,
  );
}
