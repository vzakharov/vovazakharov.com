/**
 * The fireflies of dusk as pure functions of a seed, the meadow's
 * `duskness` and the clock: each circles a host — a mushroom or a flower
 * near the eye — on a slow ring of its own, its tail's glow pulsing on its
 * own phase, and wakes at its own point of the turn toward dusk, so they come
 * one by one and go out at morning. Lengths are in the firefly's unit, which
 * the scene sets from the insects' size at the host's distance.
 */

import { DUSK_MS } from './dusk';
import type { Eye } from './ground';
import { outAndBack, type Phased, smooth } from './motion';
import { between, type Random, saltedStream } from './random';

/** How many fireflies the meadow holds. */
const FIREFLY_MOST = 12;

/** When on a full turn toward dusk, in ms, the first firefly wakes and the last. */
const WAKE_TIMES = [1000, 3400] as const;
/** How much of the turn's `duskness` a firefly takes to light up. */
const WAKE_SPAN = 0.04;
/**
 * The ring's radius, its height over the host and how flat it is seen from
 * the side. The unit is a butterfly's size, over twice a flower's head
 * across, so a ring much wider or higher leaves the head for the open
 * grass; the lowest middle still clears the widest ring's front.
 */
const RING = [0.45, 0.8] as const;
const LIFT = [0.3, 0.55] as const;
const FLAT = [0.2, 0.35] as const;
/** How long one round of the ring takes, and one pulse of the tail, in seconds. */
const ROUND = [6, 11] as const;
const PULSE = [1.3, 2.4] as const;
/** The tail's glow at the pulse's ebb: it dims and never goes out. */
const EBB = 0.3;
/** How far a tap lifts a firefly, in its unit, and the flare's rise, hold and settling, in seconds. */
const FLARE_LIFT = 1.2;
const FLARE = [0.12, 0.35, 1.4] as const;
/** A salt keeping the fireflies' stream apart from every other grown off the meadow's seed. */
const SALT = 0xf1_ef_17;

/** How one firefly circles and glows: grown from the meadow's seed and its place in the dozen. */
export type FireflyGenes = Phased & {
  /** The ring's radius and the host-relative height of its middle, in the unit. */
  ringRadius: number;
  ringHeight: number;
  /** The ring's height against its width, as seen from the side. */
  flat: number;
  /** Seconds per round, which way round (1 or -1); its `phase` is where on it at time 0, in radians. */
  round: number;
  turning: number;
  /** Seconds per pulse of the tail, and the pulse's own phase, in radians. */
  pulse: number;
  pulsePhase: number;
  /** The `duskness` it starts to light up at. */
  wakeAt: number;
};

/** Where a firefly stands off its host, in the unit, y down, and which way it heads, in radians. */
export type Circling = Eye & { front: number };

/** The `index`th firefly of the meadow grown from `seed`; the dozen wake in index order. */
export function fireflyGenes(seed: number, index: number): FireflyGenes {
  const random: Random = saltedStream(seed, SALT, index);
  const share = (index + between(random, -0.3, 0.3)) / (FIREFLY_MOST - 1);
  const wakeMs =
    WAKE_TIMES[0] +
    Math.min(1, Math.max(0, share)) * (WAKE_TIMES[1] - WAKE_TIMES[0]);
  return {
    ringRadius: between(random, ...RING),
    ringHeight: between(random, ...LIFT),
    flat: between(random, ...FLAT),
    round: between(random, ...ROUND),
    turning: random() < 0.5 ? -1 : 1,
    phase: between(random, 0, Math.PI * 2),
    pulse: between(random, ...PULSE),
    pulsePhase: between(random, 0, Math.PI * 2),
    wakeAt: smooth(wakeMs / DUSK_MS),
  };
}

/** The meadow's dozen fireflies grown from `seed`. */
export function fireflies(seed: number): FireflyGenes[] {
  return Array.from({ length: FIREFLY_MOST }, (_, index) =>
    fireflyGenes(seed, index),
  );
}

/**
 * Where `genes`' firefly stands on its ring at `time`, in seconds, off its
 * host and in its unit: round a flat ring over the host, `front` 1 at the
 * ring's front and -1 at its back, heading along the ring as drawn.
 */
export function circling(genes: FireflyGenes, time: number): Circling {
  const { ringRadius, ringHeight, flat, round, turning, phase } = genes;
  const angle = phase + (turning * time * Math.PI * 2) / round;
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  const heading = Math.atan2(turning * flat * cos, -turning * sin);
  return {
    x: ringRadius * cos,
    y: -ringHeight + ringRadius * flat * sin,
    heading,
    front: sin,
  };
}

/** How bright `genes`' tail glows at `time`, in seconds: from `EBB` to 1 on its own pulse. */
export function tailGlow(genes: FireflyGenes, time: number): number {
  const wave =
    0.5 + 0.5 * Math.sin(genes.pulsePhase + (time * Math.PI * 2) / genes.pulse);
  return EBB + (1 - EBB) * wave * wave;
}

/** How awake `genes`' firefly is `level` of the way to dusk: 0 by day, lighting up past its `wakeAt`. */
export function awake(genes: FireflyGenes, level: number): number {
  return smooth((level - genes.wakeAt) / WAKE_SPAN);
}

/**
 * A tap's flare `elapsed` seconds after it, 0 before and once settled: the
 * tail's glow brightened toward full by `glow`, the firefly lifted `lift`
 * units over its ring.
 */
export function flare(elapsed: number): { glow: number; lift: number } {
  const out = elapsed < 0 ? 0 : outAndBack(elapsed, ...FLARE);
  return { glow: out, lift: out * FLARE_LIFT };
}

/**
 * The host a firefly with none goes to: the least circled of the first
 * `near` of `hosts`, by id, nearest first, the nearer of two as circled,
 * `taken` counting the fireflies on each; `undefined` with none.
 */
export function hostFor(
  hosts: readonly string[],
  taken: ReadonlyMap<string, number>,
  near: number,
): string | undefined {
  let best: string | undefined;
  for (const host of hosts.slice(0, near)) {
    const count = taken.get(host) ?? 0;
    if (best === undefined || count < (taken.get(best) ?? 0)) best = host;
  }
  return best;
}
