/**
 * Where on the screen an insect is drawn from where its flight has it in its
 * leg's frame: veered round the eye (`drawnFlier`), its shadow laid on the
 * ground under it, sunk under the brow or not (`insect-sink.ts`), culled once
 * it leaves the screen (`reachesScreen`), and, where it is drawn, what its
 * look is posed by and how far a finger reaches it.
 */

import { pick } from '@/shared/lib/collections';

import type { Aloft, Framed } from '../../model/flight-frame';
import { type Turned, wrap } from '../../model/geometry';
import { onHost } from './bed-place';
import { reachesScreen, type Spanned, type Zoomed } from './insect-away';
import { aloftFramed, type SeatEnds } from './insect-frame';
import type { Drinking } from './insect-look';
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
 * (`presence`); the depth it is drawn at this side of the brow (`above`);
 * its body's `turn` in the frame, in radians clockwise from up; and how far
 * off its seat it is (`airborne`, `aloft` in `insect-motion.ts`).
 */
export type LegFlight = Spanned &
  Pick<Shown, 'at' | 'offset' | 'flown'> &
  Pick<Framed, 'forward'> &
  Pick<Placed, 'zoom'> &
  Turned & {
    frameAt: number;
    sunk: number;
    ends: SeatEnds;
    seat?: Seat;
    sitting: boolean;
    presence: number;
    above: number;
    airborne: number;
  };

/**
 * An insect as the screen draws it: `middle`, at the zoom it is drawn at;
 * its depth and opacity among what the brow covers; how far a finger
 * reaches it, in px at its own size; the nectar it drinks, where the look
 * draws it unzoomed about `middle`; and its body's `rotation` on the screen,
 * in radians clockwise from up.
 */
export type Posed = Pick<Sinking, 'depth' | 'alpha'> &
  Pick<Drinking, 'nectar' | 'rotation'> & {
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
  const { flown, ends, sitting, presence, above, turn, airborne } = flight;
  // `ahead`, frame px along its turn.
  const lifted = (down: number, ahead = 0) =>
    drawnFlier(
      view,
      aloftFramed(view, frameAt, {
        x: at.x + ahead * Math.sin(turn) + offset.x * zoom,
        y: at.y - ahead * Math.cos(turn) + (offset.y + down) * zoom,
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
    // Settled, it faces the screen's own way (`restTurn`), so the bend fades
    // out as it lands and in as it takes off.
    rotation: wrap(
      turn + airborne * wrap(bentTurn(flying, turn, lifted) - turn),
    ),
    ...(nectar && {
      nectar: {
        x: middle.x + (nectar.x - middle.x) / middle.zoom,
        y: middle.y + (nectar.y - middle.y) / middle.zoom,
      },
    }),
  };
  return { aloft, ...shaded, posed };
}

/**
 * `turn`, a body's turn in its leg's frame, as the screen draws it at
 * `flying`: the way a px's step along it in the frame is drawn (`lifted`).
 * The screen bends the pinhole's rows (`viewOf`) and eases a flight skimming
 * the grass down onto it (`aloftFramed`), so the frame's turn alone points off
 * the drawn way at the sides and low down; it stands where either end is not
 * drawn. The step is read before the brow sinks it (`sunk` in `view.ts`),
 * whose mirror of the foot's rows would flip a flier going away over the
 * brow to face back down the screen in one frame.
 */
function bentTurn(
  flying: ReturnType<typeof drawnFlier>,
  turn: number,
  lifted: (down: number, ahead: number) => ReturnType<typeof drawnFlier>,
): number {
  const from = flying.sinking?.placed;
  const to = lifted(0, 1).sinking?.placed;
  if (!from || !to) return turn;
  return Math.atan2(to.x - from.x, from.y - to.y);
}
