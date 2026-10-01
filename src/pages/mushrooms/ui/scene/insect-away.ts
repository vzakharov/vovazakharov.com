/**
 * Where an insect away stands — just past the screen's edge where the view
 * stands now, else past the world's end — and the ground units a leg's start
 * is kept in, so a resize mid-flight never makes it jump.
 */

import { pick } from '@/shared/lib/collections';
import type { Sized } from '@/shared/typings';

import type { Side } from '../../model/flight';
import type { Point } from '../../model/geometry';
import type { Camera } from '../../model/ground';
import { layoutAtRow } from './eye-crop';
import { buried, cull, ofLayout, onScreen, sunk, type View } from './view';

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

/**
 * Where the world's `point`, standing over `row`, is drawn on the screen
 * now; `undefined` too near the eye to be drawn. As laid out before the
 * eye's first fit.
 */
export function drawnAt(
  view: View | undefined,
  point: Point,
  row: number,
): Point | undefined {
  if (!view) return point;
  const placed = sunk(view, ofLayout(view, point, row));
  return cull(placed) || buried(view, placed)
    ? undefined
    : pick(placed, 'x', 'y');
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
 * Where an insect in from away, standing over `row`, sets off for `seated`,
 * its first perch: past the screen's edge nearer it where the screen shows
 * it, else past the world's end nearer it; by `side` for a perch standing
 * nowhere.
 */
export function entry(
  seen: Seen,
  side: Side,
  away: Away,
  row: number,
  seated: Point | undefined,
): Point {
  if (!seated) return offScreen(seen, side, away, row);
  const drawn = drawnAt(seen.view, seated, row);
  if (drawn && seen.view && onScreen(seen.view, drawn)) {
    const nearer = drawn.x < seen.width / 2 ? 'left' : 'right';
    return offScreen(seen, nearer, away, row);
  }
  return pastEnd(seen, seated.x < seen.world / 2 ? 'left' : 'right', away);
}

/** A world point in ground units from the world's midline across, and as a fraction of the screen's height down. */
export function toUnits(stage: Stage, { x, y }: Point): Point {
  return { x: (x - stage.world / 2) / stage.unit, y: y / stage.height };
}

/** `toUnits` back in the world. */
export function fromUnits(stage: Stage, { x, y }: Point): Point {
  return { x: stage.world / 2 + x * stage.unit, y: y * stage.height };
}
