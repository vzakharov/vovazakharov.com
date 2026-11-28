import type { Zooming } from '@/scene/shared/lib/plane';

import { at, type Point, smoothstep } from '@/clip/shared/ink';
import { broadcast, SCREEN } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';
import type { Role } from '@/clip/entities/puppet';

import {
  beams,
  beatsAt,
  filmed,
  GIG_PALETTE,
  playing,
  wash,
} from '../../studio';
import { bootOnPedal } from './pedal';

const { width, height } = SCREEN;

/**
 * A piece of one player under a hard crop: the point `target` of the player
 * (in its own units, from the floor between its soles) put at `anchor` (a
 * share of the picture) and blown up by `zoom`, leaning `cant` degrees. Over
 * the shot the framing slides by `drift` stage units and turns by `spin`.
 */
type Crop = Zooming & {
  role: Role;
  target: Point;
  cant: number;
  anchor: Point;
  drift?: Point;
  spin?: number;
};

const CROPS = {
  'guitar neck': {
    role: 'guitar',
    target: [130, -350],
    zoom: 3.2,
    cant: -24,
    anchor: [0.62, 0.45],
    drift: [-120, 40],
  },
  'guitar pick': {
    role: 'guitar',
    target: [-10, -275],
    zoom: 3.4,
    cant: 18,
    anchor: [0.4, 0.55],
    spin: -8,
  },
  'guitar headstock': {
    role: 'guitar',
    target: [215, -410],
    zoom: 2.8,
    cant: -12,
    anchor: [0.95, 0.25],
    drift: [-900, 260],
    spin: 20,
  },
  'guitar eye': {
    role: 'guitar',
    target: [-25, -600],
    zoom: 4.2,
    cant: 14,
    anchor: [0.35, 0.42],
  },
  'bass neck': {
    role: 'bass',
    target: [190, -355],
    zoom: 3,
    cant: 20,
    anchor: [0.55, 0.5],
    drift: [80, -40],
  },
  'bass headstock': {
    role: 'bass',
    target: [270, -420],
    zoom: 2.6,
    cant: 28,
    anchor: [0.12, 0.72],
    drift: [820, -300],
    spin: -24,
  },
  'bass pick': {
    role: 'bass',
    target: [-20, -270],
    zoom: 3.4,
    cant: -16,
    anchor: [0.62, 0.5],
  },
  'vocal jaw': {
    role: 'vocal',
    target: [0, -510],
    zoom: 3.6,
    cant: -10,
    anchor: [0.42, 0.4],
    spin: 6,
  },
  'vocal eye': {
    role: 'vocal',
    target: [-50, -620],
    zoom: 4.6,
    cant: 22,
    anchor: [0.5, 0.5],
  },
  'vocal mic': {
    role: 'vocal',
    target: [-55, -480],
    zoom: 3,
    cant: 8,
    anchor: [0.3, 0.62],
  },
  'drums sticks': {
    role: 'drums',
    target: [-140, -230],
    zoom: 2.8,
    cant: -18,
    anchor: [0.6, 0.5],
  },
  'drums tom': {
    role: 'drums',
    target: [150, -230],
    zoom: 3,
    cant: 16,
    anchor: [0.35, 0.55],
  },
  'drums eye': {
    role: 'drums',
    target: [-45, -430],
    zoom: 4.4,
    cant: -20,
    anchor: [0.62, 0.4],
  },
  'drums jaw': {
    role: 'drums',
    target: [0, -360],
    zoom: 3.8,
    cant: 12,
    anchor: [0.4, 0.38],
    spin: -6,
  },
} as const satisfies Record<string, Crop>;

/** A piece of the band in extreme close-up: one of `CROPS`, or the drummer's boot on the kick pedal. */
export type Part = keyof typeof CROPS | 'boot';

/** The piece of one player's crop at `p` through its shot. */
function cropped(pen: Parameters<Drawing>[0], crop: Crop, p: number): void {
  const { role, target, zoom, cant, anchor, drift = [0, 0], spin = 0 } = crop;
  const slide = smoothstep(0, 1, p);
  at(
    pen,
    {
      x: anchor[0] * width + drift[0] * slide,
      y: anchor[1] * height + drift[1] * slide,
      rot: cant + spin * slide,
      scale: zoom,
    },
    () => {
      playing(pen, role, { x: -target[0], y: -target[1] });
    },
  );
}

/**
 * A piece of the band in extreme close-up, tilted and off centre, the camera
 * thrown onto it at the cut and knocked about on every kick, against the
 * near-black of its player's colour.
 */
export const gigPart =
  (part: Part): Drawing =>
  (pen, local) => {
    const cut = pen.playhead - local.sinceCut;
    const role: Role = part === 'boot' ? 'drums' : CROPS[part].role;
    broadcast(
      pen,
      (tape) => {
        wash(tape, GIG_PALETTE.shadow[role]);
        beams(tape, beatsAt(tape.playhead), 2.4);
        filmed(
          tape,
          cut,
          () => {
            if (part === 'boot') bootOnPedal(tape, 170, 560);
            else cropped(tape, CROPS[part], local.p);
          },
          { whip: 1.2, kick: 1.3 },
        );
      },
      { wear: 0.4 },
    );
  };
