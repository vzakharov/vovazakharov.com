import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  firstFlight,
  type Flight,
  FLYING,
  isSeat,
  nextFlight,
  type Perch,
  type Perches,
} from './flight';
import type { Point } from './geometry';
import {
  bodyTurn,
  type Carried,
  carriedFrom,
  flightPoint,
  flyingTurn,
  heading,
  type Path,
  turned,
  type Turns,
  wrap,
} from './insect-motion';
import { between, mulberry32 } from './random';

/** A roaming butterfly's spots in the air, and the cap it perches on once that frees up. */
const AIR = Array.from({ length: 8 }, (_, index) => `air-${String(index)}`);
const CAP = { kind: 'cap', id: 'cap' } as const;
const PERCHES: Perches = { caps: ['cap'], flowers: [], air: AIR, crowded: [] };
/** How many legs it roams before the cap frees up, and the frame the view flies at, in ms. */
const ROAMS = 5;
const FRAME = 16;

/** One frame as the view draws it: where, and turned how. */
type Drawn = Point & { turn: number };

/**
 * A butterfly that flies in with the only cap taken, roams the air for
 * `ROAMS` legs, then goes to the cap as it frees up and sits there, drawn
 * every `FRAME` ms as `InsectView` draws it: each leg taken on the first frame
 * its stay is over, starting where the last frame drew it, turned as it was
 * then, with what it carried over from the leg before.
 */
function roamed(seed: number): {
  frames: Drawn[];
  legs: Array<Flight['leg'] & Carried>;
} {
  const random = mulberry32(seed);
  const spots = new Map(
    AIR.map((id) => [
      id,
      { x: between(random, 60, 1100), y: between(random, 60, 450) },
    ]),
  );
  const capAt = { x: 600, y: 620 };
  const where = (perch: Perch): Point =>
    perch.kind === 'air' ? (spots.get(perch.id) ?? capAt) : capAt;
  const motion = { phase: between(random, 0, Math.PI * 2), flutter: 12 };
  let flight = firstFlight({ seed }, PERCHES, 0, [CAP]);
  let carried: Carried = { launch: 0, speed: 0, drink: 0 };
  let at = { x: -80, y: 300 };
  let start = at;
  let turn = 0;
  let turnedFrom: number | undefined;
  let turns: Turns | undefined;
  let facing = 0;
  const frames: Drawn[] = [];
  const legs = [{ ...flight.leg, ...carried }];
  for (let now = 0; ; now += FRAME) {
    const { leg } = flight;
    if (now >= leg.leaves && isSeat(leg.to)) break;
    if (now >= leg.leaves) {
      const last = { ...leg, ...carried };
      const taken = legs.length > ROAMS ? [] : [CAP];
      flight = nextFlight({ seed, ...flight }, PERCHES, now, taken);
      carried = carriedFrom(last, now);
      const { leg: next } = flight;
      legs.push({ ...next, ...carried });
      [start, turnedFrom, turns] = [at, turn, undefined];
      continue;
    }
    const path: Path = { ...leg, ...carried, start, end: where(leg.to) };
    const point = flightPoint(path, now, motion);
    if (Math.hypot(path.end.x - start.x, path.end.y - start.y) > 1) {
      facing = heading(path, now, motion);
    }
    const flying = flyingTurn(facing, path, now, motion);
    turns = turned(turns, turnedFrom, leg, now, flying, isSeat(leg.to));
    turn = bodyTurn(leg, now, flying, turns);
    at = point;
    frames.push({ ...point, turn });
  }
  return { frames, legs };
}

describe('a roaming butterfly', () => {
  const seeds = Array.from({ length: 40 }, (_, index) => index * 613 + 7);

  it('roams the air leg after leg, at FLYING, and perches once its cap frees up', () => {
    for (const seed of seeds) {
      const { legs } = roamed(seed);
      assert.equal(legs.length, ROAMS + 2);
      for (const [index, leg] of legs.entries()) {
        const flown = leg.arrives - leg.departs;
        assert.ok(flown >= FLYING[0] && flown <= FLYING[1]);
        if (index < ROAMS) assert.equal(leg.to.kind, 'air');
        if (index > 0) assert.notDeepEqual(leg.to, legs[index - 1]?.to);
      }
      assert.deepEqual(legs.at(-1)?.to, CAP);
    }
  });

  it('never jumps, snaps or spins, air to air or air to its perch', () => {
    for (const seed of seeds) {
      const { frames } = roamed(seed);
      for (const [index, frame] of frames.entries()) {
        const last = frames[index - 1] ?? frame;
        const moved = Math.hypot(frame.x - last.x, frame.y - last.y);
        assert.ok(moved < 12, `seed ${String(seed)}: moved ${String(moved)}`);
        assert.ok(
          Math.abs(wrap(frame.turn - last.turn)) <= 0.2,
          `seed ${String(seed)}: turned ${String(wrap(frame.turn - last.turn))} at ${String(index)}`,
        );
      }
    }
  });

  it('passes each spot in the air still beating, from a hover rather than a perch', () => {
    for (const seed of seeds) {
      const { legs } = roamed(seed);
      for (const [index, leg] of legs.entries()) {
        const from = legs[index - 1];
        if (from?.to.kind !== 'air') continue;
        assert.equal(from.leaves, from.arrives);
        assert.equal(leg.launch, 1);
        assert.equal(leg.speed, 0);
      }
    }
  });
});
