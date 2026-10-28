import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Point, wrap } from '@/mushrooms/shared/lib/geometry';
import {
  between,
  mulberry32,
  type Random,
} from '@/mushrooms/shared/lib/random';
import {
  bodyTurn,
  FLIGHT_HABITS,
  flightPoint,
  flyingTurn,
  heading,
  INSECT_KINDS,
  legTo,
  type Path,
  REST_LEAN,
  turned,
  type Turns,
} from '@/mushrooms/entities/insect/index.node-safe';
import {
  restTurn,
  TURN_RATE,
} from '@/mushrooms/entities/insect/index.test-only';

import { kind, times } from './insect-motion.test-kit';

const { flying: FLYING, drinking: DRINKING } = FLIGHT_HABITS[kind];

/** A perch somewhere on a tall screen, swaying a few pixels about its place. */
function swaying(random: Random): (now: number) => Point {
  const place = { x: between(random, 0, 400), y: between(random, 0, 800) };
  const phase = between(random, 0, Math.PI * 2);
  return (now) => ({
    x: place.x + 4 * Math.sin(now / 700 + phase),
    y: place.y + 3 * Math.cos(now / 900 + phase),
  });
}

/**
 * A butterfly's body turn every 16 ms over a run of legs between swaying
 * perches, the last one away, set frame by frame as `InsectView` sets it:
 * each leg starts where the last frame drew it, turned as it was then.
 */
function turnsOverLegs(seed: number): number[] {
  const random = mulberry32(seed);
  const phased = {
    phase: between(random, 0, Math.PI * 2),
    flutter: 12,
    kind,
  };
  const rotations: number[] = [];
  let at = { x: -40, y: 300 };
  let sat: number | undefined;
  let facing = 0;
  let departs = 0;
  for (const index of [0, 1, 2, 3, 4]) {
    const away = index === 4;
    const perch = away ? () => ({ x: 480, y: 200 }) : swaying(random);
    const arrives = departs + between(random, FLYING[0], FLYING[1]);
    const leaves = away
      ? arrives
      : arrives + between(random, DRINKING[0], DRINKING[1]);
    const start = at;
    let turns: Turns | undefined;
    for (let now = departs; now < leaves || now === departs; now += 16) {
      const path: Path = {
        departs,
        arrives,
        launch: 0,
        speed: 0,
        drink: 0,
        start,
        end: perch(now),
      };
      const { end } = path;
      if (Math.hypot(end.x - start.x, end.y - start.y) > 1) {
        facing = heading(path, now, phased);
      }
      const flying = flyingTurn(facing, path, now, phased);
      turns = turned(turns, sat, path, now, flying, !away);
      const rotation = bodyTurn(path, now, flying, turns);
      rotations.push(rotation);
      at = flightPoint(path, now, phased);
      sat = rotation;
    }
    departs = leaves + 16 - ((leaves - departs) % 16);
  }
  return rotations;
}

describe('bodyTurn', () => {
  it('never spins: at most ~0.2 rad a frame, flying, landing, resting and taking off', () => {
    for (const seed of Array.from({ length: 60 }, (_, index) => index * 977)) {
      const rotations = turnsOverLegs(seed);
      for (const [index, rotation] of rotations.entries()) {
        const last = rotations[index - 1] ?? rotation;
        const step = Math.abs(wrap(rotation - last));
        assert.ok(
          step <= 0.2,
          `seed ${String(seed)}: ${String(step)} rad at frame ${String(index)}`,
        );
      }
    }
  });

  it('settles facing up the screen, give or take, however it came in', () => {
    const span = { departs: 0, arrives: 2000 };
    for (const landing of times(-3.14, 3.14, 0.01)) {
      const turns = turned(undefined, undefined, span, 2000, landing, true);
      const settled = bodyTurn(span, 5000, landing, turns);
      assert.ok(Math.abs(settled) <= REST_LEAN + 1e-9);
      assert.ok(Math.abs(wrap(settled - restTurn(landing))) < 1e-9);
    }
  });

  it('turns well under its TURN_RATE setting off on a dash to shelter, however short', () => {
    for (const shelterer of INSECT_KINDS) {
      const habits = FLIGHT_HABITS[shelterer];
      if (!habits.sheltering) continue;
      for (const seed of [1, 2, 3, 4, 5]) {
        const leg = legTo(
          mulberry32(seed),
          habits,
          {
            from: { kind: 'cap', id: 'mushroom-1' },
            to: { kind: 'shelter', id: 'mushroom-1', seat: 0 },
          },
          { now: 0 },
        );
        assert.ok(leg.arrives - leg.departs < habits.sheltering.pivoting);
        const turns = turned(undefined, 3.1, leg, 0, 0, true);
        let last = bodyTurn(leg, 0, 0, turns);
        for (let now = 1; now < leg.arrives; now += 1) {
          const turn = bodyTurn(leg, now, 0, turns);
          const rate = Math.abs(wrap(turn - last)) * 1000;
          assert.ok(
            rate <= 0.9 * TURN_RATE[shelterer],
            `${shelterer} seed ${String(seed)}: ${rate.toFixed(2)} rad/s at ${String(now)} ms`,
          );
          last = turn;
        }
      }
    }
  });

  it('takes off turned the way it sat, and turns into its heading', () => {
    const span = { departs: 1000, arrives: 3000 };
    const turns = turned(undefined, 2.5, span, 1000, -2.9, true);
    assert.ok(Math.abs(wrap(bodyTurn(span, 1000, -2.9, turns) - 2.5)) < 1e-9);
    assert.ok(Math.abs(wrap(bodyTurn(span, 2000, -2.9, turns) + 2.9)) < 1e-9);
  });
});
