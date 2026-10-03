/**
 * Grows the forest as `+` grows it, over every visit the layout sweeps draw
 * from (`VISITS`) on every screen they know (`VIEWPORTS`), and prints what
 * the suite only samples. Over the whole world: how many visits reach
 * `MUSHROOM_SLOTS`, the most of any cap and stem the nearer mushrooms hide
 * (`hidersOf`, against `MOST_HIDDEN`), which mushrooms keep no patch of
 * their own as wide as their floor (`patchlessIn`), and how many keep one
 * narrower than a fingertip. On the view the visit opens on (the camera
 * from `OPENING_EYE`), grown as the child grows it: how many mushrooms the
 * least and the median visit hold, and how wide their caps span in the median
 * visit. The tests hold a floor over a share of these visits; the numbers a
 * plan quotes for the whole of them come from here.
 *
 * With `--showers N`, every meadow then goes through N rounds of sowing and
 * rain (`opened`'s `showers`), and the line adds how many spores were sown
 * and came up, what share of the mushrooms standing before the first round
 * found all `SPORE_SEATS` seats every round, how often the opening clump
 * alone sowed one on its opening crop, how many of the dots lying on those
 * clumps as the last round's rain fell were out of sight (`dotInSight`), and
 * the same checks over those showered clumps.
 *
 *   pnpm sweep:mushrooms                            # all 2000 visits
 *   pnpm sweep:mushrooms --visits 200               # 200 spread over them
 *   pnpm sweep:mushrooms --screens "tablet,small phone"
 *   pnpm sweep:mushrooms --showers 1
 */

import { z } from 'zod';

import { MUSHROOM_SLOTS } from '../src/pages/mushrooms/model/crowding';
import { OPENING_EYE } from '../src/pages/mushrooms/model/ground';
import { SPORE_SEATS } from '../src/pages/mushrooms/model/sprouting';
import {
  hiddenOf,
  hidersOf,
  MOST_HIDDEN,
  PARTS,
  partSighted,
} from '../src/pages/mushrooms/ui/scene/cap-cover';
import { coversShown } from '../src/pages/mushrooms/ui/scene/flower-cover';
import type { MeadowLayout } from '../src/pages/mushrooms/ui/scene/layout';
import { patchlessIn } from '../src/pages/mushrooms/ui/scene/mushroom-patch';
import { dotInSight } from '../src/pages/mushrooms/ui/scene/spore-sight';
import { viewAt } from '../src/pages/mushrooms/ui/scene/view';
import { VIEWPORTS, VISITS } from '../src/pages/mushrooms/ui/scene/viewports';
import {
  capsSpan,
  type Opened,
  opened,
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
const showers = z.coerce
  .number()
  .int()
  .min(0)
  .parse(flag('showers') ?? 0);
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

/**
 * What the sweep reads off a stand: the most of any cap and stem the nearer
 * mushrooms hide, the mushrooms that keep no patch of their own, and how
 * many keep one narrower than a fingertip, over all the stands it is given.
 */
function checker() {
  const most = { cap: 0, stem: 0 };
  const patchless: string[] = [];
  let mushrooms = 0;
  let narrow = 0;
  return {
    check(seed: number, stand: Opened) {
      mushrooms += stand.mushrooms.length;
      for (const id of patchlessIn(stand))
        patchless.push(`${String(seed)} ${id}`);
      narrow += patchlessIn(stand, () => FINGERTIP).length;
      const among = standingIn(stand);
      for (const one of among) {
        const hiders = hidersOf(one, among);
        for (const part of PARTS) {
          const hidden = hiddenOf(partSighted(one.standing, part, hiders));
          most[part] = Math.max(most[part], hidden);
        }
      }
    },
    report(): string[] {
      const hidden = PARTS.map(
        (part) =>
          `${part} ${percent(most[part])} (bound ${percent(MOST_HIDDEN[part])})`,
      );
      return [
        `most hidden: ${hidden.join(', ')}`,
        `no patch: ${patchless.length > 0 ? patchless.join(', ') : 'none'}`,
        `under a fingertip ${percent(narrow / mushrooms)}`,
      ];
    },
  };
}

/** The view a visit opens on. */
const atOpening = (layout: MeadowLayout) => viewAt(layout.camera, OPENING_EYE);

/** How many dots lay in `stand`'s last rain, and how many of them out of sight on the view it opens on. */
function dotsOf({ layout, sowed }: Opened): { lying: number; covered: number } {
  const view = atOpening(layout);
  const covers = coversShown(view, layout, sowed.mushrooms);
  return {
    lying: sowed.spores.length,
    covered: sowed.spores.filter(
      ({ foot }) => dotInSight(view, covers, foot) === undefined,
    ).length,
  };
}

/** How many of `stand`'s mushrooms came up from spores. */
const sproutsOf = ({ mushrooms }: Opened) =>
  mushrooms.filter(({ sprout }) => sprout !== undefined).length;

/**
 * Of `stand`'s mushrooms standing before the first round, how many and how
 * many of them found all `SPORE_SEATS` seats in every one of `showers` rounds.
 */
function seatsOf({ mushrooms }: Opened): { standing: number; full: number } {
  const standing = mushrooms.filter(({ sprout }) => sprout === undefined);
  const full = standing.filter(
    ({ id }) =>
      mushrooms.filter(({ sprout }) => sprout?.parent === id).length >=
      SPORE_SEATS * showers,
  );
  return { standing: standing.length, full: full.length };
}

for (const [name, width, height] of VIEWPORTS) {
  if (!named.has(name)) continue;
  const started = Date.now();
  let full = 0;
  let least = MUSHROOM_SLOTS;
  const spans: number[] = [];
  const cropped: number[] = [];
  const forests = checker();
  const clumps = checker();
  const sown = { forest: 0, crop: 0, clumps: 0, clumpVisits: 0 };
  const seats = { standing: 0, full: 0 };
  const clumpSprouts: number[] = [];
  const dots = { lying: 0, covered: 0 };
  for (const seed of seeds) {
    const stand = opened(seed, width, height, true, undefined, showers);
    const grown = stand.mushrooms.length - sproutsOf(stand);
    forests.check(seed, stand);
    sown.forest += sproutsOf(stand);
    const seated = seatsOf(stand);
    seats.standing += seated.standing;
    seats.full += seated.full;
    if (grown === MUSHROOM_SLOTS) full += 1;
    least = Math.min(least, grown);
    const crop = opened(seed, width, height, true, atOpening, showers);
    cropped.push(crop.mushrooms.length);
    spans.push(capsSpan(crop));
    sown.crop += sproutsOf(crop);
    if (showers === 0) continue;
    const clump = opened(seed, width, height, false, atOpening, showers);
    const laid = dotsOf(clump);
    dots.lying += laid.lying;
    dots.covered += laid.covered;
    clumps.check(seed, clump);
    const sprouts = sproutsOf(clump);
    clumpSprouts.push(sprouts);
    sown.clumps += sprouts;
    if (sprouts > 0) sown.clumpVisits += 1;
  }
  const visited = seeds.length;
  const showered =
    showers === 0
      ? []
      : [
          `${String(showers)} rounds sowed and sprouted ${String(sown.forest)} spores over the forests, ${String(sown.crop)} over the opening crops`,
          `all ${String(SPORE_SEATS)} seats every round for ${percent(seats.full / seats.standing)} of the forests' mushrooms`,
          `${String(dots.covered)} of ${String(dots.lying)} dots on the opening clumps out of sight`,
          `on the opening clump a sprout in ${String(sown.clumpVisits)} of ${String(visited)} visits (${percent(sown.clumpVisits / visited)}), ${String(sown.clumps)} sprouts, median ${String(median(clumpSprouts))}`,
          `the clumps showered: ${clumps.report().join(', ')}`,
        ];
  const line = [
    `${name} ${String(width)}×${String(height)}`,
    `${String(MUSHROOM_SLOTS)} in ${String(full)} of ${String(visited)} visits (${percent(full / visited)}), least ${String(least)}`,
    `on the opening crop least ${String(Math.min(...cropped))}, median ${String(median(cropped))}, caps span a median ${percent(median(spans))} of the width`,
    ...forests.report(),
    ...showered,
    `${String(Math.round((Date.now() - started) / visited))} ms a visit`,
  ].join('; ');
  process.stdout.write(`${line}\n`);
}
