import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLIGHT_HABITS } from './flight';
import type { Point } from './geometry';
import { INSECT_KINDS, type InsectKind } from './insect-genes';
import { carriedFrom, wrap } from './insect-motion';
import { type Carried, type Fluttering, PATH_SHAPES } from './insect-paths';
import { startLeg, steer, type Steering } from './insect-steering';
import { between, mulberry32 } from './random';

/** The screen the legs are flown on, the insect's size and span on it, and the frame, in ms. */
const [WIDTH, HEIGHT] = [390, 844];
const SIZE = 30;
const SPAN = 45;
const FRAME = 1000 / 60;
/** How long a stay on a cap lasts, in ms. */
const STAY = [1500, 3000] as const;

/** The bounds the play run's flier watch holds a flier to (`scripts/lib/flier-watch.ts`). */
const HEADING_AFTER = 150;
const MOST_HEADING_OFF = 0.3;
const MOST_SPIN = Math.PI * 2;

/** One frame as drawn: where, turned how, and when. */
type Drawn = Point & { turn: number; now: number };

/** The worst a run of legs faced off its way, and swung round on one leg. */
type Worst = { off: number; spin: number };

/** One leg to fly: where to, whether to a spot in the air, and how long it flies and stays, in ms. */
type Planned = { end: Point; air: boolean; flight: number; stay: number };

/**
 * A flier flying `legs` frame by frame the way `InsectView` flies it, from
 * `from` turned `sat`, each leg setting off where the last frame drew it,
 * turned as it was then — read the way the flier watch reads it: a leg's way
 * over one bob of its flutter, the body's turn at the bob's middle, once the
 * leg is `HEADING_AFTER` old and while it moves at least a span a second.
 */
function flyLegs(
  motion: Fluttering,
  legs: readonly Planned[],
  from: Point,
  sat: number | undefined,
): Worst {
  const window = 2 * Math.round(30 / PATH_SHAPES[motion.kind].flutterRate);
  let at = from;
  let steering: Steering = {
    facing: 0,
    turn: sat ?? 0,
    at: -Infinity,
    setOff: undefined,
  };
  let turnedFrom = sat;
  let carried: Carried = { launch: 0, speed: 0, drink: 0 };
  let now = 0;
  const worst: Worst = { off: 0, spin: 0 };
  for (const { end, air, flight, stay } of legs) {
    const leg = {
      departs: now,
      arrives: now + flight,
      to: { kind: air ? 'air' : 'cap', id: 'perch' } as const,
    };
    const leaves = leg.departs + stay;
    const course = {
      leg,
      carried,
      start: at,
      end,
      aim: end,
      sat: turnedFrom,
      perched: !air,
      size: SIZE,
      motion,
    };
    steering = startLeg(steering);
    const trail: Drawn[] = [];
    let [round, left, right] = [0, 0, 0];
    for (; now < leaves; now += FRAME) {
      const last = steering.turn;
      const flying = steer(steering, course, now);
      steering = flying.steering;
      at = flying.point;
      round += wrap(steering.turn - last);
      [left, right] = [Math.min(left, round), Math.max(right, round)];
      worst.spin = Math.max(worst.spin, right - left);
      const { turn } = steering;
      trail.push({ ...at, turn, now });
      if (trail.length <= window) continue;
      trail.shift();
      const [first, middle] = [trail[0], trail[window / 2]];
      if (!first || !middle) continue;
      const travel = Math.hypot(at.x - first.x, at.y - first.y);
      if (
        middle.now < leg.departs + HEADING_AFTER ||
        now >= leg.arrives ||
        travel < (SPAN * (now - first.now)) / 1000
      ) {
        continue;
      }
      const way = Math.atan2(at.y - first.y, at.x - first.x);
      worst.off = Math.max(
        worst.off,
        Math.abs(wrap(middle.turn - Math.PI / 2 - way)),
      );
    }
    turnedFrom = steering.turn;
    carried = carriedFrom({ ...leg, ...carried, leaves }, now);
  }
  return worst;
}

/**
 * A flier of `kind` flying twelve legs between caps low on the screen and
 * spots in the air above them, now and then startled into its next leg
 * mid-flight or mid-stay.
 */
function flown(kind: InsectKind, seed: number): Worst {
  const random = mulberry32(seed);
  const motion = { phase: between(random, 0, Math.PI * 2), kind, flutter: 8 };
  const legs = Array.from({ length: 12 }, (): Planned => {
    const air = random() < 0.3;
    const end = {
      x: between(random, 0.1, 0.9) * WIDTH,
      y:
        (air ? between(random, 0.15, 0.5) : between(random, 0.5, 0.9)) * HEIGHT,
    };
    const [least, most] = FLIGHT_HABITS[kind].flying;
    const flight = between(random, least, most);
    const stays = air ? flight : flight + between(random, ...STAY);
    const stay = random() < 0.2 ? between(random, 100, stays) : stays;
    return { end, air, flight, stay };
  });
  return flyLegs(motion, legs, { x: -SPAN, y: HEIGHT * 0.3 }, undefined);
}

const SEEDS = Array.from({ length: 30 }, (_, index) => index * 7919 + 13);

describe('steer', () => {
  for (const kind of INSECT_KINDS) {
    it(`faces a ${kind} the way it flies, taking off, zigzagging and landing`, () => {
      for (const seed of SEEDS) {
        const { off } = flown(kind, seed);
        assert.ok(
          off <= MOST_HEADING_OFF,
          `seed ${String(seed)}: ${off.toFixed(2)} rad off its way`,
        );
      }
    });

    it(`never turns a ${kind} round more than once on a leg`, () => {
      for (const seed of SEEDS) {
        const { spin } = flown(kind, seed);
        assert.ok(
          spin <= MOST_SPIN,
          `seed ${String(seed)}: ${(spin / MOST_SPIN).toFixed(2)} turns`,
        );
      }
    });

    it(`turns a ${kind} flying down to a perch below it back, not on round, to settle`, () => {
      // Sat facing up, leaning either way, and flying down to settle facing
      // up again: the turn out and the turn back are each near a half turn.
      const [least, most] = FLIGHT_HABITS[kind].flying;
      for (const [phase, flight] of [
        [0.5, least],
        [2, most],
        [3.6, (least + most) / 2],
        [5, least],
      ] as const) {
        for (const sat of [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45]) {
          for (const across of Array.from(
            { length: 31 },
            (_, i) => (i - 15) * 8,
          )) {
            const end = { x: 200 + across, y: 700 };
            const { spin } = flyLegs(
              { phase, kind, flutter: 8 },
              [{ end, air: false, flight, stay: flight + 1000 }],
              { x: 200, y: 200 },
              sat,
            );
            assert.ok(
              spin <= MOST_SPIN,
              `phase ${String(phase)}, sat ${String(sat)}, ${String(across)} px across: ${(spin / MOST_SPIN).toFixed(2)} turns`,
            );
          }
        }
      }
    });
  }
});
