/**
 * Where an insect away stands — one released, on the ground just past the
 * brow; one leaving, just past the screen's edge where the view stands now,
 * else past the world's end — and the ground units a leg's start is kept
 * in, so a resize mid-flight never makes it jump.
 */

import { pick } from '@/shared/lib/collections';
import type { Sized } from '@/shared/typings';

import type { Side } from '../../model/flight';
import type { Point } from '../../model/geometry';
import { alongSight, type Camera, pinholeOf } from '../../model/ground';
import { layoutAtRow } from './eye-crop';
import {
  buried,
  cull,
  D_SEE,
  layoutOfPlane,
  ofLayout,
  onScreen,
  type Placed,
  sunkOver,
  type View,
} from './view';

/**
 * The band of the screen's height an insect flies in from and out to off
 * screen, its phase picking where.
 */
const AWAY_BAND = [0.18, 0.5] as const;

/** The screen, in CSS px, and the world's width and ground unit, as last painted. */
export type Stage = Sized & Pick<Camera, 'world' | 'unit'>;

/** The stage, and the view the frame is drawn through now; none before the eye's first fit. */
export type Seen = Stage & { view: View | undefined };

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
 * Where `view` places the world's `point`, standing over `row`, past the
 * brow lowered as far as the ground under it sinks (`sunkOver`).
 */
export function flownAt(view: View, point: Point, row: number): Placed {
  return sunkOver(
    view,
    ofLayout(view, point, row),
    ofLayout(view, { ...pick(point, 'x'), y: row }, row),
  );
}

/**
 * Where the world's `point`, standing over `row`, is drawn on the screen
 * now, at the zoom of that row's depth there (`flownAt`); `undefined` too
 * near the eye to be drawn, or sunk under the brow. As laid out, at its own
 * size, before the eye's first fit.
 */
export function drawnAt(
  view: View | undefined,
  point: Point,
  row: number,
): Zoomed | undefined {
  if (!view) return { ...point, zoom: 1 };
  const placed = flownAt(view, point, row);
  return cull(placed) || buried(view, placed)
    ? undefined
    : pick(placed, 'x', 'y', 'zoom');
}

/** In the world, just past its `side` end, at the height `away` flies. */
export function pastEnd(stage: Stage, side: Side, away: Away): Point {
  return {
    x: side === 'left' ? -away.span : stage.world + away.span,
    y: away.drop,
  };
}

/**
 * In the world, just past the screen's `side` edge where the view stands
 * now, at the height `away` flies, standing over `row`; past the world's end
 * on that side where the screen's edge meets no point over that row.
 */
export function offScreen(
  seen: Seen,
  side: Side,
  away: Away,
  row: number,
): Point {
  const screen = {
    x: side === 'left' ? -away.span : seen.width + away.span,
    y: away.drop,
  };
  const opening = (seen.world - seen.width) / 2;
  if (!seen.view) return { ...screen, x: screen.x + opening };
  return layoutAtRow(seen.view, screen, row) ?? pastEnd(seen, side, away);
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

/** A point in the world, as the opening eye lays it out, and the ground row it stands over. */
export type OverRow = { at: Point; row: number };

/**
 * The ground `distance` from `view`'s eye, in the clump's size, along the
 * azimuth it sees at the screen's `x`, in CSS px: the point on it and the
 * row it stands on, as the opening eye lays them out (`ofLayout`
 * backwards); `undefined` where the opening eye lays out no row there.
 */
export function groundAlong(
  view: View,
  x: number,
  distance: number,
): OverRow | undefined {
  const at = layoutOfPlane(view, alongSight(view, view.eye, x, distance));
  return at && { at, row: at.y };
}

/**
 * `groundAlong` at the screen column nearest `x` whose ground `distance`
 * away has a layout row, searched a px at a time outward across the screen:
 * looking back, the opening eye lays out no row in a wedge straight behind
 * the plane's origin, at most about 100 px across on any screen. `undefined`
 * where no column on the screen has one.
 */
function groundNear(
  view: View,
  x: number,
  distance: number,
): OverRow | undefined {
  for (let off = 0; off <= view.width; off++) {
    for (const at of off ? [x - off, x + off] : [x]) {
      if (at < 0 || at > view.width) continue;
      const ground = groundAlong(view, at, distance);
      if (ground) return ground;
    }
  }
  return undefined;
}

/** The screen side `view`'s eye turns by, the shorter way, to face `point` standing over `row`. */
export function turnSide(view: View, point: Point, row: number): Side {
  return ofLayout(view, point, row).x < pinholeOf(view).x ? 'left' : 'right';
}

/**
 * Where an insect in from away sets off for its first perch, `seated`
 * standing over `row`, and, where it flies out of view first, the spot past
 * the screen's side it flies out by (`out`). It sets off on the ground just
 * past the brow (`PAST_BROW`), so it comes up over it: halfway across from
 * the screen's middle to its perch where the screen shows the perch, else
 * at the middle, flying out by the side its perch stands to, over ground
 * `OUT_AHEAD` of the brow's distance. A perch standing nowhere goes out by
 * `side`. Where that ground has no row, it is taken at the nearest column
 * that has one (`groundNear`), and where no column on the screen has one,
 * past the world's end nearer its perch. Before the eye's first fit it sets
 * off just past the opening screen's edge nearer its perch (`offScreen`).
 */
export function entry(
  seen: Seen,
  side: Side,
  away: Away,
  row: number,
  seated: Point | undefined,
): OverRow & { out?: OverRow } {
  const { view, width, world } = seen;
  const nearer = (seated?.x ?? 0) < world / 2 ? 'left' : 'right';
  if (!view) return { at: offScreen(seen, nearer, away, row), row };
  const fallback = { at: pastEnd(seen, nearer, away), row };
  const drawn = seated && drawnAt(view, seated, row);
  const middle = width / 2;
  if (drawn && onScreen(view, drawn)) {
    return (
      groundNear(view, (middle + drawn.x) / 2, D_SEE + PAST_BROW) ?? fallback
    );
  }
  const start = groundNear(view, middle, D_SEE + PAST_BROW);
  const near = groundNear(view, middle, D_SEE * OUT_AHEAD);
  if (!start || !near) return fallback;
  const exit = seated ? turnSide(view, seated, row) : side;
  return {
    ...start,
    out: { at: offScreen(seen, exit, away, near.row), ...pick(near, 'row') },
  };
}

/** A world point in ground units from the world's midline across, and as a fraction of the screen's height down. */
export function toUnits(stage: Stage, { x, y }: Point): Point {
  return { x: (x - stage.world / 2) / stage.unit, y: y / stage.height };
}

/** `toUnits` back in the world. */
export function fromUnits(stage: Stage, { x, y }: Point): Point {
  return { x: stage.world / 2 + x * stage.unit, y: y * stage.height };
}
