/**
 * Where an insect away stands — one released, on the ground just past the
 * brow; one leaving, in the air just past the screen's edge where the view
 * stands now — and whether one drawn reaches the screen; and those same
 * points as the `Places` a leg to or from away is timed by, so it is timed
 * between the points it is drawn between.
 */

import { perchName, type Places, type Side, SIDES } from '../../model/flight';
import type { WayOut } from '../../model/flight-in';
import type { Point } from '../../model/geometry';
import { alongSight, CLUMP_DISTANCE, pinholeOf } from '../../model/ground';
import { WIDEST_SPAN } from './flower-sight';
import { type Aloft, aloftAt, azimuthOf, drawnAloft } from './insect-frame';
import type { MeadowLayout } from './layout';
import { wrapAngle } from './panorama';
import { perchDistance, placeOfAloft } from './plane-place';
import { D_SEE, onScreen, type Placed, type View } from './view';

/**
 * The band of the screen's height an insect flies in from and out to off
 * screen, its phase picking where.
 */
const AWAY_BAND = [0.18, 0.5] as const;

/** How far an insect's open wings span on screen, in px. */
export type Spanned = { span: number };

/** An insect away: past an edge by its span, and how far down the screen it flies, in px. */
export type Away = Spanned & { drop: number };

/** How far down a screen `height` tall, in px, an insect away flies: in `AWAY_BAND`, where its `phase` picks. */
export function awayDown(height: number, phase: number): number {
  const share = 0.5 + 0.5 * Math.sin(phase * 3);
  return height * (AWAY_BAND[0] + (AWAY_BAND[1] - AWAY_BAND[0]) * share);
}

/** A point on the screen, and how many times its laid-out size a thing there is drawn. */
export type Zoomed = Point & Pick<Placed, 'zoom'>;

/**
 * Whether an insect `span` px across at its own size, drawn at `drawn`,
 * reaches `view`'s screen: a span each way round its middle, so no wing,
 * body or antenna at any turn reaches past that.
 */
export function reachesScreen(
  view: View,
  drawn: Zoomed,
  span: number,
): boolean {
  return onScreen(view, drawn, -span * drawn.zoom);
}

/**
 * How far past the brow, in the clump's size, a released insect sets off on
 * the ground, as a share of the brow's distance: under it on its first
 * frame, so it comes up over the brow as anything nearing the eye does,
 * within a frame or two of flight.
 */
export const PAST_BROW = 0.000_75 * D_SEE;

/**
 * How far ahead, as a share of the brow's distance, the ground stands that
 * a release with no open perch in view flies out over, past the screen's
 * side: as near as the meadow's middle rows, so it grows as it comes.
 */
const OUT_AHEAD = 0.5;

/**
 * In the air just past `view`'s screen's `side` edge, at the height `away`
 * flies, `depth` from the eye in the clump's size as `perchDistance`
 * measures it: forward in the frame turned to the eye's heading.
 */
export function offAloft(
  view: View,
  side: Side,
  away: Away,
  depth: number,
): Aloft {
  const pinhole = pinholeOf(view);
  const x = side === 'left' ? -away.span : view.width + away.span;
  // The frame's forward along the sight at `x` (`framedOf`).
  const distance = depth / Math.cos((x - pinhole.x) / pinhole.focal);
  return aloftAt(view, { x, y: away.drop }, distance);
}

/**
 * Where an insect leaving from `from` flies to: just past `view`'s screen's
 * `side` edge (`offAloft`) as deep as it sets off, so it flies out across
 * the screen rather than into or out of it. Its leg is timed level with
 * where it sets off (`apartIn`), from the away spot `awayPlaces` gives.
 */
export function leavingAloft(
  view: View,
  side: Side,
  away: Away,
  from: Aloft,
): Aloft {
  return offAloft(view, side, away, perchDistance(view, from));
}

/**
 * How `view` stands any insect away, for timing a leg to or from there: past
 * an edge by a butterfly's widest wings on `layout`, at the middle of
 * `AWAY_BAND`.
 */
function awayOn(layout: MeadowLayout, view: View): Away {
  return {
    span: WIDEST_SPAN * layout.insectSizes.butterfly,
    drop: awayDown(view.height, 0),
  };
}

/**
 * The away spots of `Places` as `view` stands them: where it draws an
 * insect leaving (`leavingAloft`), at the clump's depth, which a leg to one
 * is timed level with its start (`apartIn`).
 */
export function awayPlaces(layout: MeadowLayout, view: View): Places {
  const away = awayOn(layout, view);
  return Object.fromEntries(
    SIDES.map((side) => {
      const off = offAloft(view, side, away, CLUMP_DISTANCE);
      const place = placeOfAloft(view, layout.insectSize, off);
      return [perchName({ kind: 'away', side }), place] as const;
    }),
  );
}

/**
 * A release's way out of view as `view` draws it (`entryAloft`, with no
 * seat): where it sets off over the brow, and the out point past each side.
 */
export function wayOutOf(layout: MeadowLayout, view: View): WayOut {
  const [away, unit] = [awayOn(layout, view), layout.insectSize];
  const placed = (aloft: Aloft) => placeOfAloft(view, unit, aloft);
  const out = (side: Side) => placed(outAloft(view, side, away));
  return {
    brow: placed(entryAloft(view, 'left', away).from),
    outs: { left: out('left'), right: out('right') },
  };
}

/** The spot past `view`'s screen's `side` a release flies out of view by (`entryAloft`). */
function outAloft(view: View, side: Side, away: Away): Aloft {
  return offAloft(view, side, away, OUT_AHEAD * D_SEE);
}

/**
 * Where an insect in from away sets off for its first perch, whose seat
 * `seated` is drawn at on the screen, in CSS px, and, where it flies out of
 * view first, the spot past the screen's side it flies out by (`out`). It
 * sets off on the ground just past the brow (`PAST_BROW`), so it comes up
 * over it: halfway across from the screen's middle to its seat where the
 * screen shows the seat, else at the middle, flying out by the side of the
 * middle its seat is drawn on, `OUT_AHEAD` of the brow's distance deep. With
 * no seat it goes out by `side`.
 */
export function entryAloft(
  view: View,
  side: Side,
  away: Away,
  seated?: Point,
): { from: Aloft; out?: Aloft } {
  const middle = pinholeOf(view).x;
  const shown = seated !== undefined && onScreen(view, seated);
  const x = shown ? (middle + seated.x) / 2 : middle;
  const from = { ...alongSight(view, view.eye, x, D_SEE + PAST_BROW), h: 0 };
  if (shown) return { from };
  const exit = seated ? (seated.x < middle ? 'left' : 'right') : side;
  return { from, out: outAloft(view, exit, away) };
}

/**
 * Where `view` shows `aloft` for `entryAloft` to set off by: where it draws
 * it, else just past the screen's side the eye turns by, the shorter way, to
 * face it.
 */
export function seenFor(view: View, aloft: Aloft): Point {
  const drawn = drawnAloft(view, aloft);
  if (drawn) return drawn;
  const left = wrapAngle(azimuthOf(view.eye, aloft) - view.eye.heading) < 0;
  return { x: left ? -1 : view.width + 1, y: 0 };
}
