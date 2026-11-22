import { float, smoothstep, vec3 } from 'three/tsl';
import type { Node } from 'three/webgpu';

import type { InLook } from '@/island/shared/play';

import type { Rgb } from '../lib/land-colour';
import { type OctaveNoise, QUIET, type Seen } from './land-noise';

type F = Node<'float'>;
type V = Node<'vec3'>;

/** Octaves by what the eye reads them as, as indices into `LAND_OCTAVES`. */
export const COUNTRY = 0;
export const REGION = 1;
export const DISTRICT = 2;
export const HILL = 3;
export const FIELD = 4;
export const SLOPE = 5;
export const PATCH = 6;
export const STEP = 7;
export const HAND = 8;
export const GRAIN = 9;

/** Octaves and the weight each is summed with. */
export type Parts = ReadonlyArray<readonly [octave: number, weight: number]>;

/** A sum of octaves, and how much of it an eye this far no longer tells: what an edge drawn through it widens by. */
export type Ragged = { readonly sum: F; readonly lost: F };

/** The ground a fragment is on, as the bands read it. */
export type Ground = Seen & {
  /** Its height, metres above the sea. */
  readonly level: F;
  /** Its colour by height alone, kept at the waterline, where the sea's meets it. */
  readonly stops: V;
  /** How far it leans off level, 0 flat and 1 a wall. */
  readonly steep: F;
  /** The share of it under tree crowns, 0 bare to 1 closed canopy. */
  readonly cover: F;
  /** How sandy it is, 0 none to 1 on the beach and the dune belt. */
  readonly sand: F;
  /** How far it lies from the eye, metres. */
  readonly away: F;
};

/** The noise a look reads, as the ways a material is mixed from it. */
export type Mixer = {
  /** An octave by its index, quiet where the look leaves it out. */
  readonly at: (octave: number) => OctaveNoise;
  /** `parts` summed for drawing an edge through. */
  readonly ragged: (parts: Parts) => Ragged;
  /**
   * `parts` summed for a shape drawn through them near the eye — a clump, a
   * stone — told to twice the distance `ragged` is, where an edge of it is
   * still wider than a pixel.
   */
  readonly shaped: (parts: Parts) => Ragged;
  /** `x` plus `by`'s noise, 0 under `from` and 1 over `to`, the edge as wide again as what of `by` is lost. */
  readonly edge: (x: F, from: number, to: number, by: Ragged) => F;
  /** A noise's own patches: 0 where `parts` sum under `from`, 1 over `to`. */
  readonly patches: (from: number, to: number, parts: Parts) => F;
  /** A surface's brightness mottled by `parts`, about 1. */
  readonly mottled: (parts: Parts) => F;
};

/**
 * What a band's materials are mixed from, and the look they are drawn in, by
 * which a band pays for what only shows near: the plain one for none of it.
 */
export type Band = InLook & {
  readonly ground: Ground;
  readonly mix: Mixer;
  /** The height a band is told by: the ground's, steep ground reading higher. */
  readonly banded: F;
  /** The noise the bands' borders are broken by, metres. */
  readonly border: Ragged;
};

export const paint = (rgb: Rgb): V => vec3(...rgb);

const edge: Mixer['edge'] = (x, from, to, by) =>
  smoothstep(float(from).sub(by.lost), float(to).add(by.lost), x.add(by.sum));

export function mixerOf(octaves: readonly OctaveNoise[]): Mixer {
  const at = (i: number) => octaves[i] ?? QUIET;
  const summed =
    (read: 'edging' | 'value', kept: 'edged' | 'told') =>
    (parts: Parts): Ragged => {
      let sum: F = float(0);
      let lost: F = float(0);
      for (const [i, weight] of parts) {
        const octave = at(i);
        sum = sum.add(octave[read].mul(weight));
        lost = lost.add(octave[kept].oneMinus().mul(Math.abs(weight) * 0.5));
      }
      return { sum, lost };
    };
  const ragged = summed('edging', 'edged');
  return {
    at,
    ragged,
    shaped: summed('value', 'told'),
    edge,
    patches: (from, to, parts) => edge(float(0), from, to, ragged(parts)),
    mottled: (parts) => {
      let sum: F = float(1);
      for (const [i, weight] of parts) sum = sum.add(at(i).value.mul(weight));
      return sum;
    },
  };
}
