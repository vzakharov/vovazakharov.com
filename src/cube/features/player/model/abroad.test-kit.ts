import type { Cue } from './play';
import type { Stage } from './scenes';
import { type Shot, shotAt, type Track } from './track';

/** A cone of sand 1.6 m high round the origin, a still sea at 0. */
const height = (x: number, z: number): number =>
  1.6 - 0.055 * Math.hypot(x, z);

/**
 * A stage like the intro's: the cube over the crest with its underside 1.1 m
 * up, the ladder on its east side, the body waking 29 m to its south-west
 * with its feet at the water.
 */
export const STAGE: Stage = {
  land: {
    height,
    level: () => 0,
    solids: [{ west: -2.5, east: 2.5, north: -2.5, south: 2.5 }],
  },
  wake: { at: [-17.4, 23.2], seaward: Math.atan2(23.2, -17.4) + 0.3 },
  cube: { west: -2.5, east: 2.5, north: -2.5, south: 2.5, underside: 2.7 },
  ladder: {
    foot: [4, height(4, -1.7), -1.7],
    top: [2.5, 5.2, -1.7],
    rungs: Array.from({ length: 12 }, (_, index) => 1.7 + 0.3 * index),
  },
  arrival: [1.5, 6.8, -1.5],
  indoors: 3,
};

/** `track`'s camera every `every` seconds from its start to its end. */
export const sampled = (track: Track<Cue>, every = 0.05): Shot[] =>
  Array.from({ length: Math.floor(track.span / every) + 1 }, (_, index) =>
    shotAt(track, index * every),
  ).concat(shotAt(track, track.span));
