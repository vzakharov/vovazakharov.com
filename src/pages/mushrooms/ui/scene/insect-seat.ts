/**
 * Where an insect is drawn, and at what zoom: flying, at its own size over
 * its distance, veered round the eye; sitting, where the cap or the flower
 * under it draws its seat, at the zoom that landing gave it.
 */

import type { Point } from '../../model/geometry';
import { bendAt, CLUMP_DISTANCE, pinholeOf } from '../../model/ground';
import type { Standing } from './bed-place';
import type { Zoomed } from './insect-away';
import {
  type Aloft,
  aloftAt,
  type SeatEnds,
  sinkingAloft,
  veeredAlong,
  veerOf,
} from './insect-frame';
import type { Seat } from './perch-hosts';
import { aloftOfLayout } from './plane-place';
import type { View } from './view';

/**
 * Where `view` draws an insect flying at `raw`, `flown` of the way along its
 * leg between the seats `ends`, at its own size over its distance: veered
 * round the eye (`veeredAlong`), the veer faded out toward a seat it would
 * move; `sinking` is where it is drawn, sunk under the brow or not, and the
 * ground under it (`sinkingAloft`), `undefined` at or behind the eye.
 * `aloft` is the veered point, drawn or not, which a leg cut short sets off
 * again from.
 */
export function drawnFlier(
  view: View,
  raw: Aloft,
  flown: number,
  ends: SeatEnds,
): { aloft: Aloft; sinking: ReturnType<typeof sinkingAloft> } {
  const aloft = veeredAlong(view.eye, raw, veerOf(view), flown, ends);
  return { aloft, sinking: sinkingAloft(view, aloft) };
}

/**
 * The zoom an insect sitting on `host` is drawn at, its seat drawn at
 * `drawn`: its own size over the host's distance, bent as the screen bends
 * it there, as `drawnFlier` lands it.
 */
export function seatedZoom(view: View, host: Standing, drawn: Point): number {
  return (
    (CLUMP_DISTANCE * bendAt(pinholeOf(view), drawn.x)) / host.stands.distance
  );
}

/**
 * The seat `seat` as a point in the world `view` sees: where its host draws
 * it, at the host's distance, so a flight lands on it exactly; where the host
 * is not drawn, the seat as the layout lays it out (`aloftOfLayout`).
 */
export function seatAloft(view: View, seat: Seat): Aloft {
  const { on, drawn } = seat;
  return on.stands.drawn
    ? aloftAt(view, drawn, on.stands.distance)
    : aloftOfLayout(view, seat, on.laidFoot.y);
}

/**
 * Where `view` draws an insect sitting on `seat`, `off` px off it at its own
 * size, and at what zoom (`seatedZoom`): `undefined` where the host is not
 * drawn. A seat sunk under the brow is drawn where its host sinks it, for
 * the brow to cover (`insect-sink.ts`).
 */
export function drawnSitter(
  view: View,
  { on, drawn }: Seat,
  off: Point,
): Zoomed | undefined {
  if (!on.stands.drawn) return undefined;
  const zoom = seatedZoom(view, on, drawn);
  return { x: drawn.x + off.x * zoom, y: drawn.y + off.y * zoom, zoom };
}
