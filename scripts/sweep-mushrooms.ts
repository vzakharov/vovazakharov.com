/**
 * Grows the forest as `+` grows it, over every visit the layout sweeps draw
 * from (`VISITS`) on every screen they know (`VIEWPORTS`), and prints what
 * the suite only samples. Over the whole world: how many visits reach
 * `MUSHROOM_SLOTS`, the most of any cap and stem the nearer mushrooms hide
 * (`hidersOf`, against `MOST_HIDDEN`), which mushrooms keep no patch of
 * their own as wide as their floor (`patchlessIn`), and how many keep one
 * narrower than a fingertip. On the crop the visit opens on
 * (`openingCrop`), grown as the child grows it: how many mushrooms the least
 * and the median visit hold, and how wide their caps span in the median
 * visit. The tests hold a floor over a share of these visits; the numbers a
 * plan quotes for the whole of them come from here.
 *
 *   pnpm sweep:mushrooms                            # all 2000 visits
 *   pnpm sweep:mushrooms --visits 200               # 200 spread over them
 *   pnpm sweep:mushrooms --screens "tablet,small phone"
 */

import { z } from 'zod';

import { MUSHROOM_SLOTS } from '../src/pages/mushrooms/model/game';
import {
  hiddenOf,
  hidersOf,
  MOST_HIDDEN,
  PARTS,
  partSighted,
} from '../src/pages/mushrooms/ui/scene/cap-cover';
import { patchlessIn } from '../src/pages/mushrooms/ui/scene/mushroom-patch';
import { VIEWPORTS, VISITS } from '../src/pages/mushrooms/ui/scene/viewports';
import {
  capsSpan,
  opened,
  openingCrop,
  standingIn,
} from '../src/pages/mushrooms/ui/scene/visit-play';
import { flag } from './lib/argv.ts';
import { median } from './lib/frame-budget.ts';

const visits = z.coerce
  .number()
  .int()
  .min(1)
  .max(VISITS.length)
  .parse(flag('visits') ?? VISITS.length);
const known = new Set<string>(VIEWPORTS.map(([name]) => name));
const named = new Set(
  z
    .array(
      z.string().refine((name) => known.has(name), {
        message: `a screen is one of ${[...known].join(', ')}`,
      }),
    )
    .parse(flag('screens')?.split(',') ?? [...known]),
);

/** `visits` of `VISITS`, spread evenly over them: every tenth for 200. */
const seeds = VISITS.filter(
  (_, index) => (index * visits) % VISITS.length < visits,
);

/** The radius, in CSS px, of a patch a fingertip lands in whole: 44 across. */
const FINGERTIP = 22;

const percent = (share: number) => `${(share * 100).toFixed(1)}%`;

for (const [name, width, height] of VIEWPORTS) {
  if (!named.has(name)) continue;
  const started = Date.now();
  let full = 0;
  let least = MUSHROOM_SLOTS;
  const spans: number[] = [];
  const cropped: number[] = [];
  const most = { cap: 0, stem: 0 };
  const patchless: string[] = [];
  let mushrooms = 0;
  let narrow = 0;
  for (const seed of seeds) {
    const stand = opened(seed, width, height, true);
    const grown = stand.mushrooms.length;
    mushrooms += grown;
    for (const id of patchlessIn(stand))
      patchless.push(`${String(seed)} ${id}`);
    narrow += patchlessIn(stand, () => FINGERTIP).length;
    if (grown === MUSHROOM_SLOTS) full += 1;
    least = Math.min(least, grown);
    const crop = opened(seed, width, height, true, openingCrop);
    cropped.push(crop.mushrooms.length);
    spans.push(capsSpan(crop));
    const among = standingIn(stand);
    for (const one of among) {
      const hiders = hidersOf(one, among);
      for (const part of PARTS) {
        const hidden = hiddenOf(partSighted(one.standing, part, hiders));
        most[part] = Math.max(most[part], hidden);
      }
    }
  }
  const hidden = PARTS.map(
    (part) =>
      `${part} ${percent(most[part])} (bound ${percent(MOST_HIDDEN[part])})`,
  );
  const line = [
    `${name} ${String(width)}×${String(height)}`,
    `${String(MUSHROOM_SLOTS)} in ${String(full)} of ${String(seeds.length)} visits (${percent(full / seeds.length)}), least ${String(least)}`,
    `on the opening crop least ${String(Math.min(...cropped))}, median ${String(median(cropped))}, caps span a median ${percent(median(spans))} of the width`,
    `most hidden: ${hidden.join(', ')}`,
    `no patch: ${patchless.length > 0 ? patchless.join(', ') : 'none'}`,
    `under a fingertip ${percent(narrow / mushrooms)}`,
    `${String(Math.round((Date.now() - started) / seeds.length))} ms a visit`,
  ].join('; ');
  process.stdout.write(`${line}\n`);
}
