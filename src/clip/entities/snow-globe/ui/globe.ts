import {
  at,
  clipped,
  ellipse,
  type Figure,
  ink,
  type Pen,
  polygon,
} from '@/clip/shared/ink';
import { writePlain } from '@/clip/shared/lettering';
import { dotText } from '@/clip/shared/tape';

import { GLOBE_PALETTE } from './palette-globe';

/** A snow globe: its dome's size, what is in it, the word on its base. */
export type SnowGlobe = Figure & {
  /** The dome's radius in stage units; 120 by default. */
  domeRadius?: number;
  /**
   * Drawn inside the dome, origin at its centre and masked to it, given the
   * dome's radius: a scene, a fall of snow.
   */
  inside?: (domeRadius: number) => void;
  /** Lettered on the brass plaque on its base; none by default. */
  plaque?: string;
  /**
   * How the plaque is lettered: by hand (the default, Cyrillic only), or in
   * the tape's dot face, which also sets Latin letters and a web address.
   */
  plaqueFace?: 'hand' | 'dots';
  /** How hard it is being shaken, in `[0, 1]`: it rocks on its base. 0 by default. */
  shaking?: number;
};

// Rocks a second when shaken, and how far at full shake, in degrees.
const ROCKS = 5;
const ROCK = 9;

/**
 * A souvenir snow globe, its place the dome's centre, so drawn in a bunny's
 * `held` callback it sits between the paws.
 */
export function snowGlobe(pen: Pen, globe: SnowGlobe = {}): void {
  const {
    seed = 0,
    domeRadius: r = 120,
    inside,
    plaque,
    plaqueFace = 'hand',
    shaking = 0,
    rot = 0,
  } = globe;
  const rock = shaking * ROCK * Math.sin(pen.playhead * ROCKS * Math.PI * 2);
  const dome = ellipse([0, 0], r);
  // The base: a trapezoid under the dome, its top hiding the dome's bottom.
  const top = r * 0.72;
  const base = polygon(
    [
      [-r * 0.8, top],
      [r * 0.8, top],
      [r, top + r * 0.5],
      [-r, top + r * 0.5],
    ],
    'closed',
  );
  const rim = ellipse([0, top], r * 0.8, r * 0.1);
  const plate = polygon(
    [
      [-r * 0.55, top + r * 0.16],
      [r * 0.55, top + r * 0.16],
      [r * 0.55, top + r * 0.38],
      [-r * 0.55, top + r * 0.38],
    ],
    'closed',
  );
  const width = r * 0.04;
  at(pen, { ...globe, rot: rot + rock }, () => {
    clipped(pen, dome, () => {
      inside?.(r);
      ink(pen, dome, { fill: GLOBE_PALETTE.glassTint, stroke: null, seed });
      ink(pen, ellipse([0, r * 0.9], r * 1.2, r * 0.6), {
        fill: GLOBE_PALETTE.waterShade,
        stroke: null,
        seed,
      });
    });
    ink(pen, dome, { width, seed });
    ink(pen, ellipse([-r * 0.42, -r * 0.48], r * 0.16, r * 0.07), {
      fill: GLOBE_PALETTE.glint,
      stroke: null,
      seed,
    });
    ink(pen, base, { fill: GLOBE_PALETTE.base, width, seed });
    ink(pen, rim, { fill: GLOBE_PALETTE.baseTop, width, seed });
    ink(pen, ellipse([0, top + r * 0.5], r, r * 0.08), {
      fill: GLOBE_PALETTE.baseShade,
      width,
      seed,
    });
    if (plaque !== undefined) {
      ink(pen, plate, { fill: GLOBE_PALETTE.plaque, width: width * 0.6, seed });
      if (plaqueFace === 'dots') {
        dotText(pen, plaque, [0, top + r * 0.215], {
          dot: (r * 1.02) / (plaque.length * 6),
          color: GLOBE_PALETTE.plaqueText,
          align: 'center',
        });
      } else {
        writePlain(pen, plaque, {
          letterHeight: r * 0.13,
          alignment: 'center',
          y: top + r * 0.205,
          color: GLOBE_PALETTE.plaqueText,
          seed,
        });
      }
    }
  });
}
