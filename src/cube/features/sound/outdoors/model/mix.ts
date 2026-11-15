import { CUBE_METRES } from '@/cube/shared/cube-boundary';
import { clamp01 } from '@/cube/shared/lib/ease';
import type { Vec2 } from '@/cube/shared/lib/vec';

import { bearingOf } from '../../cues';
import { CYCLE } from '../../dsp';
import { type Coast, type Surf, surfAt } from './shore';
import { gustAt, SECONDS_AN_HOUR, UPWIND, WASH_TURNS } from './weather';

/**
 * What sounds outside without stopping: the surf's three (the break's roar,
 * the hiss of the sheet running up, the fizz of it draining), the open sea's
 * wash, the wind and its buffet in each ear, and the cube's hum with what
 * joins it underneath.
 */
export const SOUND_LAYERS = [
  'roar',
  'hiss',
  'fizz',
  'wash',
  'wind',
  'buffet',
  'hum',
  'under',
] as const;
export type Layer = (typeof SOUND_LAYERS)[number];

/** Something for every layer, each made by `of`. */
export const perLayer = <T>(of: (layer: Layer) => T): Record<Layer, T> => ({
  roar: of('roar'),
  hiss: of('hiss'),
  fizz: of('fizz'),
  wash: of('wash'),
  wind: of('wind'),
  buffet: of('buffet'),
  hum: of('hum'),
  under: of('under'),
});

/** What reaches each ear: a layer's level, or the power still to be made one. */
export type Ears = { leftEar: number; rightEar: number };

/**
 * The outside at one moment, for one ear: every layer's level, and the pitch
 * in hertz above which the sea and the wind are cut off — everything, in the
 * open; little, through a wall. The hum goes through the wall, and has a
 * pitch of its own above which it is cut: all of it outside, closing to
 * nothing in the first steps past the doorway.
 */
export type OutsideMix = {
  layers: Record<Layer, Ears>;
  muffle: number;
  humMuffle: number;
};

/** `muffle` in the open: nothing is cut. */
export const OPEN_AIR = 20_000;

/** Where an ear is on the island, and the way it faces (0 east, π/2 south). */
export type Listener = { at: Vec2; gaze: number };

/** What there is to hear: the sea on its shore, and the middle of the cube. */
export type Scene = { coast: Coast; cube: Vec2 };

/** A layer's level beside the ear at its fullest. */
const LEVELS: Record<Layer, number> = {
  // The swell sweeps along the shore rather than lifting it all at once, so
  // the stretches never sound together and each one has to carry further.
  roar: 0.84,
  hiss: 0.95,
  fizz: 0.8,
  wash: 0.08,
  wind: 0.16,
  buffet: 0.3,
  hum: 0.62,
  under: 0.35,
};

/**
 * Metres at which each of the surf's sounds has lost half its power: the
 * roar carries, the fizz is gone a few steps off.
 */
const REACH: Record<keyof Surf, number> = {
  breaking: 11,
  running: 7,
  draining: 4,
};

/** The water at the shore is never quite still: what laps with no wave in. */
const LAPPING = 0.02;

/** Half the cube's side, and the metres at which its hum has half its power. */
const CUBE_HALF = CUBE_METRES / 2;
const HUM_REACH = 3.5;

/** Metres in from the cube's edge by which an ear is wholly under it. */
const UNDER_WITHIN = 1.2;

/** Adds `power` from `rightward` (−1 to 1) to `heard`, the far ear in shadow. */
function gather(heard: Ears, power: number, rightward: number): void {
  heard.leftEar += (power * (1 - rightward)) / 2;
  heard.rightEar += (power * (1 + rightward)) / 2;
}

/** `level` of the power gathered in each ear, never past the ear's fullest. */
const levelled = ({ leftEar, rightEar }: Ears, level: number): Ears => ({
  leftEar: Math.min(1, level * Math.sqrt(leftEar)),
  rightEar: Math.min(1, level * Math.sqrt(rightEar)),
});

const both = (level: number): Ears => ({ leftEar: level, rightEar: level });

/** The surf's three layers for `listener`: every stretch of shore, summed. */
function surfHeard(
  { coast }: Scene,
  { at, gaze: yaw }: Listener,
  seconds: number,
): Record<keyof Surf, Ears> {
  const heard = {
    breaking: { leftEar: 0, rightEar: 0 },
    running: { leftEar: LAPPING, rightEar: LAPPING },
    draining: { leftEar: 0, rightEar: 0 },
  };
  const ear = { u: at[0], v: at[1] };
  for (const stretch of coast.shore) {
    const surf = surfAt(coast, stretch, seconds);
    for (const part of ['breaking', 'running', 'draining'] as const) {
      const [x, z] = part === 'breaking' ? stretch.breaks : stretch.shore;
      const { rightward, roomsAway: metres } = bearingOf(ear, yaw, {
        u: x,
        v: z,
      });
      gather(
        heard[part],
        surf[part] / (1 + (metres / REACH[part]) ** 2),
        // A sound at the feet is in both ears.
        rightward * clamp01(metres / 3),
      );
    }
  }
  return heard;
}

/**
 * What `listener` hears outside, `seconds` into the hour: the surf from every
 * stretch of shore by what the water is doing there and how far off it is,
 * the sea and the wind all round, the wind's rumble in whichever ear is
 * turned to it, and the hum from where the cube is — nearly nothing across
 * the island, and joined by its underside for an ear beneath it.
 */
export function outsideMix(
  scene: Scene,
  listener: Listener,
  seconds: number,
): OutsideMix {
  const { at, gaze: yaw } = listener;
  const surf = surfHeard(scene, listener, seconds);
  const ear = { u: at[0], v: at[1] };

  const across = Math.abs(at[0] - scene.cube[0]);
  const along = Math.abs(at[1] - scene.cube[1]);
  const off = Math.hypot(
    Math.max(0, across - CUBE_HALF),
    Math.max(0, along - CUBE_HALF),
  );
  const beneath = clamp01((CUBE_HALF - Math.max(across, along)) / UNDER_WITHIN);
  const cube = bearingOf(ear, yaw, { u: scene.cube[0], v: scene.cube[1] });
  const hum = { leftEar: 0, rightEar: 0 };
  gather(
    hum,
    1 / (1 + (off / HUM_REACH) ** 2),
    0.85 * cube.rightward * clamp01(cube.roomsAway / (2 * CUBE_HALF)),
  );

  const gust = gustAt(seconds);
  const upwind = bearingOf(ear, yaw, {
    u: at[0] + UPWIND[0],
    v: at[1] + UPWIND[1],
  }).rightward;
  // The cube's underside is out of the wind.
  const blowing = (0.5 + 0.5 * gust) ** 1.5 * (1 - 0.5 * beneath);
  const rumbling = (0.2 + 0.8 * gust) * (1 - 0.7 * beneath);
  const heave = (turn: number): number =>
    1 + 0.15 * Math.sin(CYCLE * ((17 * seconds) / SECONDS_AN_HOUR + turn));

  return {
    layers: {
      roar: levelled(surf.breaking, LEVELS.roar),
      hiss: levelled(surf.running, LEVELS.hiss),
      fizz: levelled(surf.draining, LEVELS.fizz),
      wash: {
        leftEar: LEVELS.wash * heave(WASH_TURNS.left),
        rightEar: LEVELS.wash * heave(WASH_TURNS.right),
      },
      wind: {
        leftEar: LEVELS.wind * blowing * (1 - 0.25 * upwind),
        rightEar: LEVELS.wind * blowing * (1 + 0.25 * upwind),
      },
      buffet: {
        leftEar: LEVELS.buffet * rumbling * (0.3 + 0.7 * Math.max(0, -upwind)),
        rightEar: LEVELS.buffet * rumbling * (0.3 + 0.7 * Math.max(0, upwind)),
      },
      hum: levelled(hum, LEVELS.hum),
      under: both(LEVELS.under * beneath),
    },
    muffle: OPEN_AIR,
    humMuffle: OPEN_AIR,
  };
}

/** Where an ear is inside the cube: the floors between it and floor 1. */
export type Indoors = { floorsBelow: number };

/** The hum below the entrance hall, against the hum at the wall outside. */
const HUM_BELOW = 0.25;

/** The pitch the filters are shut to once an ear is over the sill. */
const SHUT = 50;

/**
 * `mix` — what an ear standing at the doorway would hear — as an ear inside
 * hears it. Over the sill the sea and the wind are gone at once, their filter
 * shut so the mixer's easing closes them as a falling sweep that ends in
 * silence; the entrance hall has no hum either, and the floors below have
 * their own, from nowhere, being in the walls.
 */
export function indoors(
  { layers }: OutsideMix,
  { floorsBelow }: Indoors,
): OutsideMix {
  const within =
    floorsBelow > 0
      ? HUM_BELOW *
        0.5 ** (floorsBelow - 1) *
        Math.hypot(layers.hum.leftEar, layers.hum.rightEar)
      : 0;
  return {
    layers: {
      ...perLayer(() => both(0)),
      hum: both(within / Math.SQRT2),
    },
    muffle: SHUT,
    humMuffle: floorsBelow > 0 ? OPEN_AIR : SHUT,
  };
}
