import type { Box } from '@/cube/shared/outside';

import type { Cue } from './player';
import type { Stage } from './scenes';
import { type Shot, shotAt, type Track } from './track';

/** A cone of sand 1.6 m high round the origin, a still sea at 0. */
const height = (x: number, z: number): number => 1.6 - 0.055 * Math.hypot(x, z);

/** The cube on its legs: 5 m a side, its underside 2.7 m up. */
const CUBE: Box = { min: [-2.5, 2.7, -2.5], max: [2.5, 7.7, 2.5] };

/**
 * A stage like the intro's: the cube over the crest with its underside 1.1 m
 * up, the ladder on its east side, the body waking 29 m to its south-west
 * with its feet at the water.
 */
export const STAGE: Stage = {
  land: {
    height,
    level: () => 0,
    solids: [CUBE],
  },
  wake: { at: [-17.4, 23.2], seaward: Math.atan2(23.2, -17.4) + 0.3 },
  cube: CUBE,
  ladder: {
    foot: [4, height(4, -1.7), -1.7],
    top: [2.5, 5.2, -1.7],
    rungs: Array.from({ length: 12 }, (_, index) => 1.7 + 0.3 * index),
    solid: { min: [2.5, 1.38, -1.9], max: [4, 5.2, -1.5] },
  },
  arrival: [1.5, 6.8, -1.5],
  shelf: [-2.5, 6.2, 1.25],
};

/** `track`'s camera every `every` seconds from its start to its end. */
export const sampled = (track: Track<Cue>, every = 0.05): Shot[] => [
  ...Array.from({ length: Math.floor(track.runs / every) + 1 }, (_, index) =>
    shotAt(track, index * every),
  ),
  shotAt(track, track.runs),
];
