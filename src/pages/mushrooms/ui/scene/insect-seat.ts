/**
 * Where an insect is drawn, and at what zoom: sitting, where the cap or the
 * flower under it draws its seat, at the zoom it draws itself; flying,
 * through the view over the ground row it flies over (`drawnAt`), carried
 * onto the host it left near the leg's start and onto the one it lands on
 * near its end, so it sets off and lands with no jump in place or size.
 */

import { pick } from '@/shared/lib/collections';

import type { Point } from '../../model/geometry';
import { type Host, onHost } from './bed-place';
import { drawnAt, type Zoomed } from './insect-away';
import type { Shown } from './insect-shown';
import { browRow, cull, ofLayout, sunk, type View } from './view';

/** The hosts a leg is drawn between: `left`, the one it set off sitting on, and `to`, the one it flies to sit on; either absent where the leg has none. */
export type Seats = { left?: Host; to?: Host };

/** `flown`, how far along its leg an insect is, from 0 at its start to 1 at its end, and the ground row it is drawn standing over there. */
export type Along = Pick<Shown, 'row'> & { flown: number };

/**
 * Where `host` draws `point`, laid out on it, at the host's zoom:
 * `undefined` where the host is not drawn, or where its point has sunk below
 * the brow, which an insect, drawn over everything, would otherwise stand on.
 */
function onSeat(view: View, host: Host, point: Point): Zoomed | undefined {
  if (!host.stands.drawn) return undefined;
  const drawn = onHost(host, point);
  return host.stands.behind && drawn.y > browRow(view, drawn.x)
    ? undefined
    : { ...drawn, ...pick(host.stands, 'zoom') };
}

/** How far from where, and how much larger than, the flight would draw `point` over `host`'s foot row `host` draws it; nothing for a host too near the eye to place. */
function offHost(view: View, host: Host, point: Point): Zoomed {
  const placed = ofLayout(view, point, host.laidFoot.y);
  if (cull(placed)) return { x: 0, y: 0, zoom: 0 };
  const flown = sunk(view, placed);
  const drawn = onHost(host, point);
  return {
    x: drawn.x - flown.x,
    y: drawn.y - flown.y,
    zoom: host.stands.zoom - flown.zoom,
  };
}

/**
 * Where an insect at `point`, in world px at the opening eye, is drawn on
 * the screen now, and at what zoom, as far along its leg between `seats` as
 * `flown` says; `undefined` where it is hidden. As laid out, at its own
 * size, before the eye's first fit.
 */
export function drawnInsect(
  view: View | undefined,
  point: Point,
  { flown, row }: Along,
  { left, to }: Seats,
): Zoomed | undefined {
  if (!view) return { ...point, zoom: 1 };
  if (to && flown >= 1) return onSeat(view, to, point);
  if (left && flown <= 0) return onSeat(view, left, point);
  const flying = drawnAt(view, point, row);
  if (!flying) return undefined;
  const drawn = { ...flying };
  for (const [host, weight] of [
    [left, 1 - flown],
    [to, flown],
  ] as const) {
    if (!host) continue;
    const off = offHost(view, host, point);
    drawn.x += off.x * weight;
    drawn.y += off.y * weight;
    drawn.zoom += off.zoom * weight;
  }
  return drawn;
}
