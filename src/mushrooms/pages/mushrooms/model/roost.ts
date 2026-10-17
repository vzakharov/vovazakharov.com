/**
 * The fliers' night: past half way to dusk (`dusky`) none takes a leg of its
 * own accord from the perch it sits the dusk out on (`Habits.roost`), and one
 * in the air settles on its next perch; a tap still sends one off, and it
 * settles again. Morning lets each go at its own wake, so the meadow stirs
 * one flier at a time. Nothing here draws from a leg's stream.
 */

import { type Dusk, DUSK_MS, dusky } from './dusk';
import type { Leg, Perches } from './flight';
import { FLIGHT_HABITS } from './flight-habits';
import type { InsectSeed } from './insect-genes';
import { smooth } from './motion';
import { between, saltedStream } from './random';

/** The meadow's light, as the swarm reads it off the meadow. */
export type Dusked = { dusk?: Dusk | undefined };

/**
 * How long after the moon's tap a flier sat out the dusk sits on, in ms: a
 * span its seed picks from, the earliest when a full dusk is half gone.
 */
export const WAKE_MS = [DUSK_MS / 2, DUSK_MS / 2 + 3000] as const;

/** Keeps the wake's draw apart from every other stream grown off the seed. */
const WAKE_SALT = 0x71_d3_a6_0b;

/** How dusky the meadow is when a resting flier's wings start to fold, and when they are shut. */
const FOLDING = [0.5, 0.9] as const;

/** `perches` as `dusk` leaves them at `now`: marked `dusky` past half way, the same object before it. */
export function roostedPerches(
  perches: Perches,
  dusk: Dusk | undefined,
  now: number,
): Perches {
  if (dusk === undefined || !dusky(dusk, now)) return perches;
  return { ...perches, dusky: true };
}

/**
 * Whether `flier` sits on at `now` where its leg brought it, its stay over or
 * not: landed on a flower or a cap, at dusk the kind's `roost` (either, for a
 * kind with none); after it, until its wake (`WAKE_MS`) past a turn toward
 * day that began from dusk.
 */
export function sitsOut(
  { seed, kind, leg }: InsectSeed & { leg: Leg },
  dusk: Dusk | undefined,
  now: number,
): boolean {
  const { to, arrives } = leg;
  const seated = to.kind === 'flower' || to.kind === 'cap';
  if (dusk === undefined || now < arrives || !seated) return false;
  if (dusky(dusk, now)) {
    const { roost } = FLIGHT_HABITS[kind];
    return roost === undefined || roost === to.kind;
  }
  const wake = between(saltedStream(seed, WAKE_SALT, 0), ...WAKE_MS);
  return (
    dusk.toward === 'day' && dusk.from > 0.5 && now < dusk.startedAt + wake
  );
}

/** How far shut a resting flier holds its wings at dusk `level` (`duskness`), from 0 as by day to 1 shut. */
export function wingsShut(level: number): number {
  const [opens, shut] = FOLDING;
  return smooth((level - opens) / (shut - opens));
}
