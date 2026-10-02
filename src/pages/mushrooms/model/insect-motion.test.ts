import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstFlight, type Flight, FLIGHT_HABITS, flightAway } from './flight';
import { type Point, wrap } from './geometry';
import {
  bodyTurn,
  carriedFrom,
  drinkDip,
  drinking,
  flyingTurn,
  hopAt,
  LANDING,
  landingBob,
  proboscis,
  REST_LEAN,
  restTurn,
  type Stay,
  turned,
  type Turns,
  wingBeat,
} from './insect-motion';
import { flightPoint, heading, type Path } from './insect-paths';
import { ticked } from './insects';
import { between, mulberry32, type Random } from './random';

const kind = 'butterfly' as const;
const { flying: FLYING, drinking: DRINKING } = FLIGHT_HABITS[kind];
/** No spotted caps, and nowhere to plant: what the butterfly's legs never read. */
const BARE = { spotted: [], room: [] } as const;

/** A leg with its stay, flown from one point to another. */
type Flown = Path & Stay;

const PATH: Flown = {
  start: { x: -40, y: 120 },
  end: { x: 300, y: 260 },
  departs: 1000,
  arrives: 3000,
  leaves: 8000,
  to: { kind: 'cap', id: 'cap' },
  launch: 0,
  speed: 0,
  drink: 0,
};
const PHASES = [0, 0.7, 2, 3.5, 5.9];
const flier = (phase: number) => ({ phase, flutter: 12, kind });
const times = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.floor((to - from) / step) + 1 },
    (_, index) => from + index * step,
  );

/** How far the wings swing between `from` and `to`. */
function swing(from: number, to: number, path = PATH): number {
  const beats = times(from, to, 5).map((now) =>
    wingBeat(path, now, { phase: 0, kind }),
  );
  return Math.max(...beats) - Math.min(...beats);
}

describe('wingBeat', () => {
  const all = times(0, 8000, 7);

  it('stays between closed and open', () => {
    for (const phase of PHASES) {
      for (const now of all) {
        const open = wingBeat(PATH, now, { phase, kind });
        assert.ok(open >= 0 && open <= 1, `open ${String(open)}`);
      }
    }
  });

  it('beats fast in the air and slowly at rest', () => {
    assert.ok(swing(2000, 2200) > 0.9);
    assert.ok(swing(5000, 5200) < 0.3);
  });

  it('never jumps, at take-off, at landing or between', () => {
    for (const phase of PHASES) {
      for (const now of times(PATH.departs - 300, PATH.arrives + 700, 1)) {
        const step = Math.abs(
          wingBeat(PATH, now + 1, { phase, kind }) -
            wingBeat(PATH, now, { phase, kind }),
        );
        assert.ok(step < 0.05, `step ${String(step)} at ${String(now)}`);
      }
    }
  });
});

describe('landingBob', () => {
  it('dips after landing and is 0 before and after, without a jump', () => {
    assert.equal(landingBob(PATH, PATH.arrives - 1), 0);
    assert.equal(landingBob(PATH, PATH.arrives), 0);
    assert.ok(landingBob(PATH, PATH.arrives + LANDING / 4) > 0);
    assert.equal(landingBob(PATH, PATH.arrives + LANDING), 0);
    for (const now of times(
      PATH.arrives - 50,
      PATH.arrives + LANDING + 50,
      1,
    )) {
      const step = Math.abs(landingBob(PATH, now + 1) - landingBob(PATH, now));
      assert.ok(step < 0.01);
    }
  });
});

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

  it('takes off turned the way it sat, and turns into its heading', () => {
    const span = { departs: 1000, arrives: 3000 };
    const turns = turned(undefined, 2.5, span, 1000, -2.9, true);
    assert.ok(Math.abs(wrap(bodyTurn(span, 1000, -2.9, turns) - 2.5)) < 1e-9);
    assert.ok(Math.abs(wrap(bodyTurn(span, 2000, -2.9, turns) + 2.9)) < 1e-9);
  });
});

/** A flight on `before` cut short at `cut` by `after`, as the view flies it. */
type Cut = { before: Flown; after: Flown; cut: number };

function pointAt({ before, after, cut }: Cut, now: number): Point {
  return flightPoint(now < cut ? before : after, now, flier(0));
}

function wingsAt({ before, after, cut }: Cut, now: number): number {
  return wingBeat(now < cut ? before : after, now, { phase: 0, kind });
}

function stepAt(flight: Cut, now: number, frame: number): number {
  const [here, next] = [pointAt(flight, now), pointAt(flight, now + frame)];
  return Math.hypot(next.x - here.x, next.y - here.y);
}

describe('a leg that cuts a flight short', () => {
  const butterfly = { id: 'b', kind: 'butterfly', seed: 4321 } as const;
  const first = firstFlight(
    butterfly,
    { caps: ['cap'], flowers: [], air: [], crowded: [], ...BARE },
    0,
  );
  const cut = (first.leg.departs + first.leg.arrives) / 2;
  const before: Flown = {
    ...first.leg,
    launch: 0,
    speed: 0,
    drink: 0,
    start: { x: -40, y: 300 },
    end: { x: 200, y: 520 },
  };
  const cuts: Record<string, Flight> = {
    'sent away mid-flight': flightAway({ ...butterfly, ...first }, cut),
    'its cap gone mid-flight':
      ticked(
        { insects: [{ ...butterfly, ...first }], planted: [] },
        { caps: ['other'], flowers: [], air: [], crowded: [], ...BARE },
        cut,
      ).insects[0] ?? first,
  };

  for (const [name, { leg }] of Object.entries(cuts)) {
    const after: Flown = {
      ...leg,
      ...carriedFrom(before, cut),
      start: flightPoint(before, cut, flier(0)),
      end: { x: 480, y: 200 },
    };
    const flight = { before, after, cut };

    it(`flies on without a jump when ${name}`, () => {
      assert.equal(leg.departs, cut);
      assert.equal(after.launch, 1);
      assert.equal(after.speed, 1);
      for (const now of times(cut - 5, cut + 5, 1)) {
        assert.ok(stepAt(flight, now, 1) < 1);
        assert.ok(
          Math.abs(wingsAt(flight, now + 1) - wingsAt(flight, now)) < 0.05,
        );
      }
    });

    it(`does not stop dead when ${name}`, () => {
      assert.ok(stepAt(flight, cut, 16) > stepAt(flight, cut - 16, 16) / 4);
      assert.ok(swing(cut, cut + 200, after) > 0.9);
    });
  }
});

const DRUNK_AT = { kind: 'flower', id: 'flower-4' } as const;
const FLOWER: Flown = { ...PATH, to: DRUNK_AT };

/** The largest change in `value` from one ms to the next between `from` and `to`. */
function largestStep(
  value: (now: number) => number,
  from: number,
  to: number,
): number {
  return Math.max(
    ...times(from, to, 1).map((now) => Math.abs(value(now + 1) - value(now))),
  );
}

describe('drinking and proboscis', () => {
  it('drinks at a flower, from after landing until just before leaving', () => {
    assert.equal(drinking(FLOWER, FLOWER.arrives), 0);
    assert.equal(proboscis(FLOWER, FLOWER.arrives - 500), 0);
    assert.equal(drinking(FLOWER, 5000), 1);
    assert.ok(proboscis(FLOWER, 5000) > 0.8);
    assert.equal(drinking(FLOWER, FLOWER.leaves), 0);
    assert.equal(proboscis(FLOWER, FLOWER.leaves + 100), 0);
    const step = largestStep((now) => proboscis(FLOWER, now), 0, 9000);
    assert.ok(step < 0.01, `step ${String(step)}`);
  });

  it('never drinks on a cap, whose rest is the slow open and close', () => {
    for (const now of times(0, 9000, 7)) {
      assert.equal(drinking(PATH, now), 0);
      const rest =
        1 - 0.7 * (0.5 - 0.5 * Math.cos((Math.PI * 2 * now) / 2600 + 1));
      const settled = now > PATH.arrives + 500;
      if (settled) assert.equal(wingBeat(PATH, now, { phase: 1, kind }), rest);
    }
  });

  it('holds its wings half shut while drinking', () => {
    const drinkSwing = times(5000, 7000, 5).map((now) =>
      wingBeat(FLOWER, now, { phase: 0, kind }),
    );
    assert.ok(Math.max(...drinkSwing) <= 0.6 + 1e-9);
    assert.ok(swing(5000, 7600) > 0.6);
  });

  it('curls up without a jump when a drink is cut short', () => {
    const cut = 5000;
    const after: Flown = {
      ...PATH,
      ...carriedFrom(FLOWER, cut),
      departs: cut,
      arrives: cut + 2000,
      leaves: cut + 8000,
    };
    const reach = (now: number) =>
      now < cut ? proboscis(FLOWER, now) : proboscis(after, now);
    assert.equal(after.drink, 1);
    assert.ok(largestStep(reach, cut - 50, cut + 600) < 0.01);
    assert.equal(reach(cut + 500), 0);
    const wings = (now: number) =>
      wingBeat(now < cut ? FLOWER : after, now, { phase: 0, kind });
    assert.ok(largestStep(wings, cut - 50, cut + 50) < 0.05);
  });
});

describe('drinkDip', () => {
  const hop = { ...FLOWER, from: { kind: 'flower', id: 'flower-9' } } as const;
  const next = {
    ...hop,
    from: DRUNK_AT,
    to: { kind: 'cap', id: 'cap' },
    departs: hop.leaves,
    arrives: hop.leaves + 2000,
    leaves: hop.leaves + 9000,
  } as const;
  const dipAt = (now: number) =>
    (now < next.departs ? drinkDip(hop, now) : drinkDip(next, now))?.dip ?? 0;

  it('leaves the flower alone while no butterfly is on it', () => {
    assert.equal(drinkDip({ ...PATH, from: PATH.to }, 5000), undefined);
    assert.equal(drinkDip(next, next.departs + 1200), undefined);
  });

  it('sags under the butterfly while it drinks, and springs back as it leaves', () => {
    assert.equal(drinkDip(hop, hop.arrives)?.dip, 0);
    assert.equal(drinkDip(hop, 5000)?.id, DRUNK_AT.id);
    assert.ok(Math.abs((drinkDip(hop, 5000)?.dip ?? 0) - 0.18) < 1e-3);
    assert.equal(drinkDip(next, next.departs)?.id, DRUNK_AT.id);
    assert.ok((drinkDip(next, next.departs + 220)?.dip ?? 0) < 0);
    assert.ok(largestStep(dipAt, hop.arrives - 50, next.departs + 1300) < 0.01);
  });

  it('flickers its petals as the butterfly leaves, and only then', () => {
    assert.equal(drinkDip(hop, 5000)?.flicker, 0);
    assert.equal(drinkDip(next, next.departs)?.flicker, 0);
    const flicker = (now: number) => drinkDip(next, now)?.flicker ?? 0;
    const most = Math.max(
      ...times(next.departs, next.departs + 300, 5).map((now) => flicker(now)),
    );
    assert.ok(most > 0.05);
    assert.ok(largestStep(flicker, next.departs, next.departs + 1300) < 0.01);
  });
});

/** How far `point` stands off the origin. */
const far = ({ x, y }: Point) => Math.hypot(x, y);

describe('hopAt', () => {
  const hops = FLIGHT_HABITS.fly.hopping;
  const span = { departs: 0, arrives: 1000, hops };
  const off = (phase: number) => (now: number) => hopAt(span, now, phase);

  it('stays on its spot until it arrives, and on a leg with no hops', () => {
    for (const phase of PHASES) {
      assert.deepEqual(off(phase)(span.arrives), { x: 0, y: 0 });
      assert.deepEqual(hopAt({ departs: 0, arrives: 1000 }, 3000, phase), {
        x: 0,
        y: 0,
      });
    }
  });

  it('hops within its reach without a jump, the same every time it is asked', () => {
    for (const phase of PHASES) {
      const at = off(phase);
      for (const now of times(span.arrives, span.arrives + 8000, 1)) {
        const [here, next] = [at(now), at(now + 1)];
        assert.ok(far(here) <= hops.range + 1e-9);
        // A whole hop across its reach, at the steepest of its jerk.
        const step = Math.hypot(next.x - here.x, next.y - here.y);
        assert.ok(step < (2 * hops.range * 1.5) / 70 + 1e-9);
      }
      assert.deepEqual(at(4321), off(phase)(4321));
    }
  });

  it('never hangs still for long: it jerks somewhere new every round or two', () => {
    for (const phase of PHASES) {
      const at = off(phase);
      for (const from of times(span.arrives, span.arrives + 8000, 50)) {
        const moved = times(from, from + 2 * hops.every, 10).some(
          (now) =>
            far({ x: at(now).x - at(from).x, y: at(now).y - at(from).y }) >
            0.05,
        );
        assert.ok(moved, String(from));
      }
    }
  });
});
