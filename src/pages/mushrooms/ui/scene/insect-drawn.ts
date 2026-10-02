/**
 * Where on the screen an insect is drawn from where its flight has it in its
 * leg's frame: veered round the eye (`drawnFlier`), its shadow laid on the
 * ground under it, sunk under the brow or not (`insect-sink.ts`), culled once
 * it leaves the screen (`reachesScreen`), and, where it is drawn, what its
 * look is posed by and how far a finger reaches it.
 */

import { pick } from '@/shared/lib/collections';

import { onHost } from './bed-place';
import { reachesScreen, type Spanned, type Zoomed } from './insect-away';
import {
  type Aloft,
  aloftFramed,
  type Framed,
  type SeatEnds,
} from './insect-frame';
import { drawnFlier, drawnSitter } from './insect-seat';
import { shadowOf, type ShadowPlace } from './insect-shadow';
import type { Shown } from './insect-shown';
import { type Sinking, sinkingOf, type Under } from './insect-sink';
import type { Seat } from './perch-hosts';
import { tapReach } from './tap-reach';
import type { Placed, View } from './view';

/**
 * An insect's flight this frame, in its leg's frame, centred at the azimuth
 * `frameAt`: where its flight has it (`at`) at its size there (`zoom`),
 * `forward` of the eye; how far its fidgets move it off that (`offset`) and
 * its landing's bob sinks it (`sunk`), in px at its own size; how far along
 * its leg it is (`flown`), between the seats `ends`; its `seat`, which it
 * sits on once `sitting`; how dark its shadow is, as a share of its full
 * (`presence`); and the depth it is drawn at this side of the brow (`above`).
 */
export type LegFlight = Spanned &
  Pick<Shown, 'at' | 'offset' | 'flown'> &
  Pick<Framed, 'forward'> &
  Pick<Placed, 'zoom'> & {
    frameAt: number;
    sunk: number;
    ends: SeatEnds;
    seat?: Seat;
    sitting: boolean;
    presence: number;
    above: number;
  };

/**
 * An insect as the screen draws it: `middle`, at the zoom it is drawn at;
 * its depth and opacity among what the brow covers; how far a finger
 * reaches it, in px at its own size; and the nectar it drinks, where the
 * look draws it unzoomed about `middle`.
 */
export type Posed = Pick<Sinking, 'depth' | 'alpha'> &
  Pick<Seat, 'nectar'> & {
    middle: Zoomed;
    hit: number;
  };

/**
 * Where `view` draws an insect flying `flight`: `aloft`, where it is veered
 * to, drawn or not, its bob aside — where a new leg sets off; its shadow,
 * where the screen lays one; and how it is `posed`, none once it sinks away
 * under the brow or its own extent leaves the screen.
 */
export function drawnInsect(
  view: View,
  flight: LegFlight,
): { aloft: Aloft; shadow?: ShadowPlace; posed?: Posed } {
  const { frameAt, at, zoom, forward, offset, sunk, span, seat } = flight;
  const { flown, ends, sitting, presence, above } = flight;
  const lifted = (down: number) =>
    drawnFlier(
      view,
      aloftFramed(view, frameAt, {
        x: at.x + offset.x * zoom,
        y: at.y + (offset.y + down) * zoom,
        forward,
      }),
      flown,
      ends,
    );
  const flying = lifted(0);
  const { aloft } = flying;
  const ground = flying.sinking?.ground;
  const shadow = ground && shadowOf(view, ground, span, presence);
  const shaded = shadow ? { shadow } : {};
  const sinking = sunk === 0 ? flying.sinking : lifted(sunk).sinking;
  const sitter = sitting ? seat : undefined;
  const middle = sitter
    ? drawnSitter(view, sitter, { ...offset, y: offset.y + sunk })
    : sinking?.drawn;
  const under: Under | undefined = sitter
    ? sitter.on.stands
    : sinking && { ...sinking.ground, depth: sinking.ground.y };
  const sinks =
    middle &&
    under &&
    sinkingOf(view, middle, span * middle.zoom, under, above);
  if (!middle || sinks?.shown !== true || !reachesScreen(view, middle, span)) {
    return { aloft, ...shaded };
  }
  const nectar = seat?.nectar && onHost(seat.on, seat.nectar);
  const posed: Posed = {
    middle: pick(middle, 'x', 'y', 'zoom'),
    ...pick(sinks, 'depth', 'alpha'),
    // A finger's reach on the screen, however small the insect is drawn.
    hit: tapReach((span * middle.zoom) / 2) / middle.zoom,
    ...(nectar && {
      nectar: {
        x: middle.x + (nectar.x - middle.x) / middle.zoom,
        y: middle.y + (nectar.y - middle.y) / middle.zoom,
      },
    }),
  };
  return { aloft, ...shaded, posed };
}
