/**
 * A leg to or from `away`, measured with the eye standing still: how long
 * the game times it (`apartIn` over the sight's `places`, or `outWay` for a
 * release's stretch out of view), against how long the insect view draws
 * it at its own size — the framed chord from its start to the end
 * `leavingAloft` gives, each stretch over its zoom there. The ratio scales
 * the dash curve's fastest frame (`dashPeak`) to the fastest one-frame step
 * the leg can draw; a ratio over the veer play's `DASH_SLACK` is a step the
 * curve does not explain. Also checks the leg's end stands still frame to
 * frame while the eye does.
 *
 * Run: `node --import tsx scripts/veer-away.ts`.
 */

import { type Perch, perchName } from '../src/pages/mushrooms/model/flight.ts';
import {
  type Aloft,
  centreOf,
  framedOf,
} from '../src/pages/mushrooms/model/flight-frame.ts';
import { outOf, outWay } from '../src/pages/mushrooms/model/flight-in.ts';
import { apartIn } from '../src/pages/mushrooms/model/flight-timing.ts';
import {
  CLUMP_DISTANCE,
  OPENING_EYE,
} from '../src/pages/mushrooms/model/ground.ts';
import {
  insectGenes,
  type InsectKind,
} from '../src/pages/mushrooms/model/insect-genes.ts';
import { wingspan } from '../src/pages/mushrooms/model/insect-outline.ts';
import {
  type Away,
  awayDown,
  entryAloft,
  leavingAloft,
} from '../src/pages/mushrooms/ui/scene/insect-away.ts';
import {
  eyeFrameOf,
  mixD,
} from '../src/pages/mushrooms/ui/scene/insect-frame.ts';
import {
  airAlofts,
  footRows,
  onscreenOf,
  perchSight,
  seatAt,
} from '../src/pages/mushrooms/ui/scene/perch-sight.ts';
import { aloftOfLayout } from '../src/pages/mushrooms/ui/scene/plane-place.ts';
import { type View, viewAt } from '../src/pages/mushrooms/ui/scene/view.ts';
import { opened } from '../src/pages/mushrooms/ui/scene/visit-play.ts';
import { dashPeak } from './lib/veer-dash.ts';

/** The screens the veer play runs, by its names for them. */
const SCREENS = [
  ['tabL', 1180, 820],
  ['phoneP', 390, 844],
] as const;
/** How finely a leg's chord is cut to sum its length at its own size. */
const CUTS = 400;
const KINDS = ['fly', 'bee'] as const satisfies readonly InsectKind[];

/** The length, in butterfly sizes at its own size, of the framed chord from `from` to `to`, each cut over its zoom there. */
function drawnLength(view: View, from: Aloft, to: Aloft, unit: number): number {
  const centre = centreOf(view.eye, from, to);
  const [start, end] = [
    framedOf(eyeFrameOf(view), centre, from),
    framedOf(eyeFrameOf(view), centre, to),
  ];
  let length = 0;
  for (let cut = 0; cut < CUTS; cut += 1) {
    const flown = (cut + 0.5) / CUTS;
    const zoom = CLUMP_DISTANCE / mixD(start.forward, end.forward, flown);
    length += Math.hypot(end.x - start.x, end.y - start.y) / CUTS / zoom;
  }
  return length / unit;
}

const fixed = (value: number, digits = 2) => value.toFixed(digits);

/** A way's timed and drawn lengths, in sizes, and the fastest step a `peak` px dash takes over it. */
const ratio = (peak: number, timed: number, drawn: number) =>
  `timed ${fixed(timed)} drawn ${fixed(drawn)} sizes, ×${fixed(drawn / timed)} → fastest ${fixed((peak * drawn) / timed, 1)} px`;

for (const [screen, width, height] of SCREENS) {
  const stand = opened(3, width, height, false);
  const { layout, mushrooms } = stand;
  const unit = layout.insectSize;
  const view = viewAt(layout.camera, OPENING_EYE);
  const sight = perchSight(stand);
  const rows = footRows(stand);
  const onscreen = onscreenOf(layout, view);
  const seats: Perch[] = [
    ...mushrooms.map(({ id }) => ({ kind: 'cap', id }) as const),
    ...sight.flowers.map((id) => ({ kind: 'flower', id }) as const),
  ];
  for (const kind of KINDS) {
    const peak = (dashPeak(kind) ?? 0) * unit;
    const away: Away = {
      span: wingspan(insectGenes({ seed: 1, kind })) * layout.insectSizes[kind],
      drop: awayDown(view.height, 0),
    };
    const ratios: string[] = [];
    let still = 0;
    for (const perch of seats) {
      const name = perchName(perch);
      const seat = seatAt(stand, perch, 0, kind);
      const row = rows.get(name);
      if (!seat || row === undefined) continue;
      const from = aloftOfLayout(layout.camera, seat, row);
      for (const side of ['left', 'right'] as const) {
        const timed = apartIn(sight.places, perch, { kind: 'away', side });
        if (timed === undefined) continue;
        const end = leavingAloft(view, side, away, from);
        // The next frame's end, the eye where it stood.
        const again = leavingAloft(view, side, away, from);
        still = Math.max(still, Math.hypot(again.x - end.x, again.y - end.y));
        const drawn = drawnLength(view, from, end, unit);
        ratios.push(`${name}→away ${side}: ${ratio(peak, timed, drawn)}`);
      }
    }
    process.stdout.write(
      `${screen} ${kind} (dash ${fixed(peak, 1)} px a frame), leaving, the eye still (end moved ${fixed(still, 6)}):\n  ${ratios.join('\n  ')}\n`,
    );
    if (!onscreen) continue;
    // A release with no open perch in view: up over the brow and out by a side.
    const outs = (['left', 'right'] as const).map((side) => {
      const set = entryAloft(view, side, away);
      if (!set.out) return `${side}: no way out`;
      const timed = outWay(onscreen, side);
      const drawn = drawnLength(view, set.from, set.out, unit);
      // The rest of the way is timed from the out point (`outOf`).
      const shown = outOf(sight.places, onscreen, side);
      const air = [...airAlofts(layout).entries()].map(([id, aloft]) => {
        const to = { kind: 'air', id } as const;
        const rest = apartIn(shown, { kind: 'away', side }, to) ?? Number.NaN;
        return drawnLength(view, set.out ?? set.from, aloft, unit) / rest;
      });
      return `${side}: out ${ratio(peak, timed, drawn)}; on to the air ×${fixed(Math.min(...air))}–${fixed(Math.max(...air))}`;
    });
    process.stdout.write(
      `${screen} ${kind}, released out of view:\n  ${outs.join('\n  ')}\n`,
    );
  }
}
