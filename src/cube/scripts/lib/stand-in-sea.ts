/**
 * An island and a sea for the sound bench to run on where the real ones are
 * not wanted: a low dome of sand, and swell coming in to it as sets of waves
 * that steepen toward the shore. Periodic in the hour, like the real one.
 */

import type { OnGround, Sea } from '@/cube/features/sound';

/** The dome's half-lengths east–west and north–south, and its crest, in metres. */
const HALF = [45, 25] as const;
const CREST = 1.6;

/** Two swells, as turns an hour: nine and twelve seconds, in step every 36. */
const SWELLS = [400, 300] as const;

/** Metres a second the surge travels in over the shallows. */
const SPEED = 3;

const islandHeight = ([x, z]: OnGround): number =>
  CREST * (1 - (x / HALF[0]) ** 2 - (z / HALF[1]) ** 2);

/** A wave's shape over one turn: up fast, down slowly, between −1 and 1. */
const surge = (turn: number): number => {
  const x = ((turn % 1) + 1) % 1;
  return x < 0.25
    ? Math.sin(2 * Math.PI * x)
    : Math.cos((Math.PI * (x - 0.25)) / 0.75);
};

export const STAND_IN_SEA: Sea = {
  islandHeight,
  waterLevel: (at, seconds) => {
    // How far out to sea the point is, by the depth of the dome's slope there.
    const out = Math.max(0, -islandHeight(at)) * 12;
    const arrived = seconds - (30 - out) / SPEED;
    let level = 0;
    for (const turns of SWELLS) level += surge((turns * arrived) / 3600);
    return 0.14 * level;
  },
};

/** The stand-in's cube, the spot the player wakes on, and the ladder's foot. */
export const STAND_IN_PLACES = {
  cube: [8, 0],
  waking: [-16, 18.5],
  ladder: [11.2, -1.7],
} as const satisfies Record<string, OnGround>;
