import { at, type Point, smoothstep } from '@/clip/shared/ink';
import { broadcast, SCREEN } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';
import type { Role } from '@/clip/entities/puppet';

import { GIG_PALETTE } from './palette-gig';
import { bootOnPedal } from './pedal';
import { beatsAt, playing } from './playing';
import { beams, filmed, wash } from './studio';

const { width, height } = SCREEN;

/**
 * A piece of one player under a hard crop: the point `focus` of the player
 * (in its own units, from the floor between its soles) put at `anchor` (a
 * share of the picture) and blown up by `zoom`, leaning `tilt` degrees. Over
 * the shot the framing slides by `drift` stage units and turns by `spin`.
 */
type Crop = {
  role: Role;
  focus: Point;
  zoom: number;
  tilt: number;
  anchor: Point;
  drift?: Point;
  spin?: number;
};

const CROPS = {
  'guitar neck': {
    role: 'guitar',
    focus: [130, -350],
    zoom: 3.2,
    tilt: -24,
    anchor: [0.62, 0.45],
    drift: [-120, 40],
  },
  'guitar pick': {
    role: 'guitar',
    focus: [-10, -275],
    zoom: 3.4,
    tilt: 18,
    anchor: [0.4, 0.55],
    spin: -8,
  },
  'guitar headstock': {
    role: 'guitar',
    focus: [215, -410],
    zoom: 2.8,
    tilt: -12,
    anchor: [0.95, 0.25],
    drift: [-900, 260],
    spin: 20,
  },
  'guitar eye': {
    role: 'guitar',
    focus: [-25, -600],
    zoom: 4.2,
    tilt: 14,
    anchor: [0.35, 0.42],
  },
  'bass neck': {
    role: 'bass',
    focus: [190, -355],
    zoom: 3,
    tilt: 20,
    anchor: [0.55, 0.5],
    drift: [80, -40],
  },
  'bass headstock': {
    role: 'bass',
    focus: [270, -420],
    zoom: 2.6,
    tilt: 28,
    anchor: [0.12, 0.72],
    drift: [820, -300],
    spin: -24,
  },
  'bass pick': {
    role: 'bass',
    focus: [-20, -270],
    zoom: 3.4,
    tilt: -16,
    anchor: [0.62, 0.5],
  },
  'vocal jaw': {
    role: 'vocal',
    focus: [0, -510],
    zoom: 3.6,
    tilt: -10,
    anchor: [0.42, 0.4],
    spin: 6,
  },
  'vocal eye': {
    role: 'vocal',
    focus: [-50, -620],
    zoom: 4.6,
    tilt: 22,
    anchor: [0.5, 0.5],
  },
  'vocal mic': {
    role: 'vocal',
    focus: [-55, -480],
    zoom: 3,
    tilt: 8,
    anchor: [0.3, 0.62],
  },
  'drums sticks': {
    role: 'drums',
    focus: [-140, -230],
    zoom: 2.8,
    tilt: -18,
    anchor: [0.6, 0.5],
  },
  'drums tom': {
    role: 'drums',
    focus: [150, -230],
    zoom: 3,
    tilt: 16,
    anchor: [0.35, 0.55],
  },
  'drums eye': {
    role: 'drums',
    focus: [-45, -430],
    zoom: 4.4,
    tilt: -20,
    anchor: [0.62, 0.4],
  },
  'drums jaw': {
    role: 'drums',
    focus: [0, -360],
    zoom: 3.8,
    tilt: 12,
    anchor: [0.4, 0.38],
    spin: -6,
  },
} as const satisfies Record<string, Crop>;

/** A piece of the band in extreme close-up: one of `CROPS`, or the drummer's boot on the kick pedal. */
export type Part = keyof typeof CROPS | 'boot';

/** The piece of one player's crop at `p` through its shot. */
function cropped(pen: Parameters<Drawing>[0], crop: Crop, p: number): void {
  const { role, focus, zoom, tilt, anchor, drift = [0, 0], spin = 0 } = crop;
  const slide = smoothstep(0, 1, p);
  at(
    pen,
    {
      x: anchor[0] * width + drift[0] * slide,
      y: anchor[1] * height + drift[1] * slide,
      rot: tilt + spin * slide,
      scale: zoom,
    },
    () => {
      playing(pen, role, { x: -focus[0], y: -focus[1] });
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
