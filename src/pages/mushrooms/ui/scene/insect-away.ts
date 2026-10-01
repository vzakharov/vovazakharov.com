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
import {
  type Camera,
  EYE_HEIGHT,
  OPENING_EYE,
  pinholeOf,
} from '../../model/ground';
import { layoutAtRow } from './eye-crop';
import {
  buried,
  cull,
  D_SEE,
  ofLayout,
  onScreen,
  type Placed,
  sunk,
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
 * Where the world's `point`, standing over `row`, is drawn on the screen
 * now, at the zoom of that row's depth there; `undefined` too near the eye
 * to be drawn. As laid out, at its own size, before the eye's first fit.
 */
export function drawnAt(
  view: View | undefined,
  point: Point,
  row: number,
): Zoomed | undefined {
  if (!view) return { ...point, zoom: 1 };
  const placed = sunk(view, ofLayout(view, point, row));
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
 * the ground: under it on its first frame, so it comes up over the brow as
 * anything nearing the eye does, within a frame or two of flight.
 */
export const PAST_BROW = 0.01;

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
 * ray through the screen's `x`, in CSS px: the point on it and the row it
 * stands on, as the opening eye lays them out (`ofLayout` backwards);
 * `undefined` where that ground stands at or behind the opening eye's own
 * row, which no row lays out.
 */
export function groundAlong(
  view: View,
  x: number,
  distance: number,
): OverRow | undefined {
  const pinhole = pinholeOf(view);
  const across = (x - pinhole.x) / pinhole.focal;
  const { heading, ...eye } = view.eye;
  const cos = Math.cos(heading);
  const sin = Math.sin(heading);
  // The ray on the plane, `across` to one ahead along the heading.
  const toward = { x: across * cos + sin, y: cos - across * sin };
  const reach = distance / Math.hypot(toward.x, toward.y);
  const plane = {
    x: eye.x + toward.x * reach,
    y: eye.y + toward.y * reach,
  };
  const opening = plane.y - OPENING_EYE.y;
  if (!(opening > 0)) return undefined;
  const perPx = opening / pinhole.focal;
  const row = pinhole.y + (pinhole.focal * EYE_HEIGHT) / opening;
  return {
    at: {
      x:
        (plane.x - OPENING_EYE.x) / perPx +
        (view.world - view.width) / 2 +
        pinhole.x,
      y: row,
    },
    row,
  };
}

/** The screen side `view`'s eye turns by, the shorter way, to face `point` standing over `row`. */
export function turnSide(view: View, point: Point, row: number): Side {
  const { x, ahead } = ofLayout(view, point, row);
  return (x - pinholeOf(view).x) * ahead < 0 ? 'left' : 'right';
}

/**
 * Where an insect in from away sets off for its first perch, `seated`
 * standing over `row`, and, where it flies out of view first, the spot past
 * the screen's side it flies out by (`out`). It sets off on the ground just
 * past the brow (`PAST_BROW`), so it comes up over it: halfway across from
 * the screen's middle to its perch where the screen shows the perch, else
 * at the middle, flying out by the side its perch stands to, over ground
 * `OUT_AHEAD` of the brow's distance. A perch standing nowhere goes out by
 * `side`. Where that ground has no row, it sets off past the world's end
 * nearer its perch, as it does before the eye's first fit.
 */
export function entry(
  seen: Seen,
  side: Side,
  away: Away,
  row: number,
  seated: Point | undefined,
): OverRow & { out?: OverRow } {
  const { view, width, world } = seen;
  const fallback = {
    at: pastEnd(seen, (seated?.x ?? 0) < world / 2 ? 'left' : 'right', away),
    row,
  };
  if (!view) return fallback;
  const drawn = seated && drawnAt(view, seated, row);
  const middle = width / 2;
  if (drawn && onScreen(view, drawn)) {
    return (
      groundAlong(view, (middle + drawn.x) / 2, D_SEE + PAST_BROW) ?? fallback
    );
  }
  const start = groundAlong(view, middle, D_SEE + PAST_BROW);
  const near = groundAlong(view, middle, D_SEE * OUT_AHEAD);
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
